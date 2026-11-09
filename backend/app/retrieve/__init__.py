"""Hybrid retrieval module combining BM25 and vector embeddings."""

from backend.app.retrieve.hybrid import (
    HybridRetriever,
    LawChunk,
    chunks_to_evidence,
    get_embedding_model,
    set_embedding_model,
)
from backend.app.retrieve.synonyms import expand_query, get_synonyms_for_category

__all__ = [
    "HybridRetriever",
    "LawChunk",
    "chunks_to_evidence",
    "expand_query",
    "get_embedding_model",
    "get_synonyms_for_category",
    "set_embedding_model",
]
