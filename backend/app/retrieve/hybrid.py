"""Hybrid Policy and Law-Pack Retrieval Engine for ClauseIQ (M4).

Implements FR5 and Section 13:
- In-memory BM25 lexical search over tokenized headings and chunk bodies.
- Dense semantic search using fastembed TextEmbedding (BGE model) with cosine similarity.
- Reciprocal Rank Fusion (RRF) combining lexical and dense rankings.
- Direct cited_clause_ref prioritization (pins cited policy clause to rank #1).
- Returns top 6 policy chunks and top 4 law-pack chunks, with evidence conversion.
"""

import math
import re
from typing import Any, List, Optional, Sequence, Tuple
from pydantic import BaseModel, ConfigDict
from rank_bm25 import BM25Okapi

from backend.app.models.schemas import (
    Evidence,
    EvidenceSourceType,
    PolicyChunk,
)

# Lazy loaded embedding model reference
_EMBEDDING_MODEL: Optional[Any] = None


class LawChunk(BaseModel):
    """Passage from insurance regulations or statutory guidelines."""
    model_config = ConfigDict(extra="forbid")

    id: str
    doc_id: str
    title: str
    section_ref: str
    text: str


def get_embedding_model() -> Any:
    """Lazy-load the fastembed TextEmbedding model."""
    global _EMBEDDING_MODEL
    if _EMBEDDING_MODEL is None:
        from fastembed import TextEmbedding

        _EMBEDDING_MODEL = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
    return _EMBEDDING_MODEL


def set_embedding_model(model: Any) -> None:
    """Explicitly inject an embedding model instance (useful for test isolation)."""
    global _EMBEDDING_MODEL
    _EMBEDDING_MODEL = model


def _tokenize(text: str) -> List[str]:
    """Tokenize alphanumeric words in lowercase for BM25 ranking."""
    return re.findall(r"\w+", text.lower())


def _cosine_similarity(v1: Sequence[float], v2: Sequence[float]) -> float:
    """Compute cosine similarity between two float vectors."""
    dot = sum(a * b for a, b in zip(v1, v2))
    norm1 = math.sqrt(sum(a * a for a in v1))
    norm2 = math.sqrt(sum(b * b for b in v2))
    if norm1 == 0.0 or norm2 == 0.0:
        return 0.0
    return dot / (norm1 * norm2)


def _compute_rrf(
    bm25_ranks: dict[str, int],
    dense_ranks: dict[str, int],
    all_ids: Sequence[str],
    k: int = 60,
) -> List[Tuple[str, float]]:
    """Compute Reciprocal Rank Fusion (RRF) scores across lexical and dense rankings."""
    scored: List[Tuple[str, float]] = []
    for item_id in all_ids:
        score = 0.0
        if item_id in bm25_ranks:
            score += 1.0 / (k + bm25_ranks[item_id])
        if item_id in dense_ranks:
            score += 1.0 / (k + dense_ranks[item_id])
        scored.append((item_id, score))

    scored.sort(key=lambda x: x[1], reverse=True)
    return scored


class HybridRetriever:
    """In-memory hybrid retriever combining BM25 and dense embeddings with RRF."""

    def __init__(
        self,
        policy_chunks: List[PolicyChunk],
        law_chunks: Optional[List[LawChunk]] = None,
        embedding_model: Optional[Any] = None,
    ):
        self.policy_chunks = policy_chunks
        self.law_chunks = law_chunks or []
        self.embedding_model = embedding_model or get_embedding_model()

        # Build policy chunk index
        self._policy_by_id = {c.id: c for c in self.policy_chunks}
        self._policy_corpus = [
            _tokenize(f"{c.clause_ref} {c.heading} {c.text}") for c in self.policy_chunks
        ]
        self._policy_bm25 = (
            BM25Okapi(self._policy_corpus) if self._policy_corpus else None
        )

        # Precompute policy dense embeddings
        policy_texts = [f"{c.clause_ref} {c.heading}\n{c.text}" for c in self.policy_chunks]
        self._policy_embeddings: List[List[float]] = (
            list(self.embedding_model.embed(policy_texts)) if policy_texts else []
        )

        # Build law chunk index
        self._law_by_id = {c.id: c for c in self.law_chunks}
        self._law_corpus = [
            _tokenize(f"{c.title} {c.section_ref} {c.text}") for c in self.law_chunks
        ]
        self._law_bm25 = (
            BM25Okapi(self._law_corpus) if self._law_corpus else None
        )

        # Precompute law dense embeddings
        law_texts = [f"{c.title} {c.section_ref}\n{c.text}" for c in self.law_chunks]
        self._law_embeddings: List[List[float]] = (
            list(self.embedding_model.embed(law_texts)) if law_texts else []
        )

    def retrieve_policy_chunks(
        self,
        query: str,
        cited_clause_ref: Optional[str] = None,
        top_k: int = 6,
    ) -> List[PolicyChunk]:
        """Retrieve top policy chunks using hybrid RRF, with cited_clause_ref pinned to rank #1."""
        if not self.policy_chunks:
            return []

        tokenized_query = _tokenize(query)
        query_emb = list(self.embedding_model.embed([query]))[0]

        # 1. Lexical BM25 ranking
        bm25_scores = (
            self._policy_bm25.get_scores(tokenized_query)
            if self._policy_bm25
            else [0.0] * len(self.policy_chunks)
        )
        bm25_ranked = sorted(
            range(len(self.policy_chunks)),
            key=lambda idx: bm25_scores[idx],
            reverse=True,
        )
        bm25_ranks = {
            self.policy_chunks[idx].id: rank + 1
            for rank, idx in enumerate(bm25_ranked)
        }

        # 2. Dense semantic ranking
        dense_scores = [
            _cosine_similarity(query_emb, chunk_emb)
            for chunk_emb in self._policy_embeddings
        ]
        dense_ranked = sorted(
            range(len(self.policy_chunks)),
            key=lambda idx: dense_scores[idx],
            reverse=True,
        )
        dense_ranks = {
            self.policy_chunks[idx].id: rank + 1
            for rank, idx in enumerate(dense_ranked)
        }

        # 3. Reciprocal Rank Fusion
        all_ids = [c.id for c in self.policy_chunks]
        rrf_results = _compute_rrf(bm25_ranks, dense_ranks, all_ids)

        ordered_chunks = [self._policy_by_id[cid] for cid, _ in rrf_results]

        # 4. Direct cited_clause_ref prioritization (Section 13)
        if cited_clause_ref and cited_clause_ref.strip():
            clean_cited = cited_clause_ref.strip().lower()
            pinned_chunk: Optional[PolicyChunk] = None
            for idx, chunk in enumerate(ordered_chunks):
                clean_ref = chunk.clause_ref.strip().lower()
                clean_heading = chunk.heading.strip().lower()
                if (
                    clean_cited == clean_ref
                    or clean_cited in clean_heading
                    or clean_ref in clean_cited
                ):
                    pinned_chunk = ordered_chunks.pop(idx)
                    break

            if pinned_chunk:
                ordered_chunks.insert(0, pinned_chunk)

        return ordered_chunks[:top_k]

    def retrieve_law_chunks(
        self,
        query: str,
        top_k: int = 4,
    ) -> List[LawChunk]:
        """Retrieve top law-pack passages using hybrid RRF ranking."""
        if not self.law_chunks:
            return []

        tokenized_query = _tokenize(query)
        query_emb = list(self.embedding_model.embed([query]))[0]

        # 1. Lexical BM25
        bm25_scores = (
            self._law_bm25.get_scores(tokenized_query)
            if self._law_bm25
            else [0.0] * len(self.law_chunks)
        )
        bm25_ranked = sorted(
            range(len(self.law_chunks)),
            key=lambda idx: bm25_scores[idx],
            reverse=True,
        )
        bm25_ranks = {
            self.law_chunks[idx].id: rank + 1
            for rank, idx in enumerate(bm25_ranked)
        }

        # 2. Dense semantic
        dense_scores = [
            _cosine_similarity(query_emb, chunk_emb)
            for chunk_emb in self._law_embeddings
        ]
        dense_ranked = sorted(
            range(len(self.law_chunks)),
            key=lambda idx: dense_scores[idx],
            reverse=True,
        )
        dense_ranks = {
            self.law_chunks[idx].id: rank + 1
            for rank, idx in enumerate(dense_ranked)
        }

        # 3. RRF
        all_ids = [c.id for c in self.law_chunks]
        rrf_results = _compute_rrf(bm25_ranks, dense_ranks, all_ids)
        ordered_law = [self._law_by_id[cid] for cid, _ in rrf_results]

        return ordered_law[:top_k]

    def retrieve(
        self,
        query: str,
        cited_clause_ref: Optional[str] = None,
        top_policy_k: int = 6,
        top_law_k: int = 4,
    ) -> Tuple[List[PolicyChunk], List[LawChunk]]:
        """Run hybrid retrieval returning top policy chunks and law-pack chunks."""
        policy_results = self.retrieve_policy_chunks(
            query=query,
            cited_clause_ref=cited_clause_ref,
            top_k=top_policy_k,
        )
        law_results = self.retrieve_law_chunks(
            query=query,
            top_k=top_law_k,
        )
        return policy_results, law_results


def chunks_to_evidence(
    policy_chunks: List[PolicyChunk],
    law_chunks: Optional[List[LawChunk]] = None,
    case_id: Optional[str] = None,
) -> List[Evidence]:
    """Convert retrieved policy and law chunks into unverified Evidence items for M6 verifier.

    Args:
        policy_chunks: List of retrieved PolicyChunk instances.
        law_chunks: List of retrieved LawChunk instances.
        case_id: Optional case identifier.

    Returns:
        List of Evidence items with verified=False.
    """
    evidence_list: List[Evidence] = []
    effective_case_id = case_id or (policy_chunks[0].case_id if policy_chunks else "case_default")

    for chunk in policy_chunks:
        ev_id = f"ev_retrieved_policy_{chunk.id}"
        evidence_list.append(
            Evidence(
                id=ev_id,
                case_id=effective_case_id,
                source_type=EvidenceSourceType.POLICY,
                source_ref=chunk.clause_ref,
                quote=chunk.text[:500].strip(),
                page=chunk.page_start,
                verified=False,
            )
        )

    if law_chunks:
        for l_chunk in law_chunks:
            ev_id = f"ev_retrieved_law_{l_chunk.id}"
            evidence_list.append(
                Evidence(
                    id=ev_id,
                    case_id=effective_case_id,
                    source_type=EvidenceSourceType.LAW_PACK,
                    source_ref=f"{l_chunk.title} - {l_chunk.section_ref}",
                    quote=l_chunk.text[:500].strip(),
                    page=1,
                    verified=False,
                )
            )

    return evidence_list

