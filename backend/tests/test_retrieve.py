"""Unit tests for M4: Hybrid Policy and Law-Pack Retrieval Engine."""

import pytest
from backend.app.models.schemas import EvidenceSourceType, PolicyChunk, RejectionCategory
from backend.app.retrieve.hybrid import (
    HybridRetriever,
    LawChunk,
    chunks_to_evidence,
)
from backend.app.retrieve.synonyms import expand_query, get_synonyms_for_category


def test_query_expansion_for_categories() -> None:
    """Verify that rejection categories expand into domain-specific synonyms."""
    ped_query = expand_query(
        RejectionCategory.PED,
        "Repudiation due to medical history of diabetes",
    )
    assert "pre-existing disease" in ped_query
    assert "continuous coverage" in ped_query
    assert "36 months" in ped_query
    assert "medical history of diabetes" in ped_query

    nd_query = expand_query(RejectionCategory.NON_DISCLOSURE)
    assert "material fact" in nd_query
    assert "moratorium period" in nd_query
    assert "60 months" in nd_query

    rr_query = expand_query(RejectionCategory.ROOM_RENT, "ICU capping deduction")
    assert "room rent limit" in rr_query
    assert "proportionate deduction" in rr_query


def test_pinning_cited_clause_ref_to_rank_one() -> None:
    """Verify Section 13 requirement: cited_clause_ref is always pinned to rank #1."""
    chunks = [
        PolicyChunk(
            id="c1",
            case_id="case_01",
            clause_ref="Section 1",
            heading="Section 1: Definitions",
            text="General insurance definitions.",
            page_start=1,
            page_end=1,
        ),
        PolicyChunk(
            id="c2",
            case_id="case_01",
            clause_ref="Clause 4.1",
            heading="Clause 4.1: Pre-Existing Disease Waiting Period",
            text="Expenses related to pre-existing conditions excluded for 36 months.",
            page_start=2,
            page_end=2,
        ),
        PolicyChunk(
            id="c3",
            case_id="case_01",
            clause_ref="Clause 5.1",
            heading="Clause 5.1: Room Rent Capping",
            text="Room rent is capped at 1% of Sum Insured per day.",
            page_start=3,
            page_end=3,
        ),
    ]

    retriever = HybridRetriever(policy_chunks=chunks)

    # Search for Room Rent, but explicitly cite Clause 4.1
    results = retriever.retrieve_policy_chunks(
        query="room rent limit per day capping",
        cited_clause_ref="Clause 4.1",
        top_k=3,
    )

    # Clause 4.1 MUST be pinned to rank #1 (index 0)
    assert len(results) == 3
    assert results[0].clause_ref == "Clause 4.1"
    assert results[0].id == "c2"


def test_rrf_hybrid_retrieval_and_top_k_limits() -> None:
    """Verify hybrid search returns at most top 6 policy chunks and top 4 law chunks."""
    policy_chunks = [
        PolicyChunk(
            id=f"p_{i}",
            case_id="case_01",
            clause_ref=f"Clause {i}",
            heading=f"Clause {i}: Policy Condition {i}",
            text=f"Medical coverage details for condition {i} regarding hospitalisation.",
            page_start=i,
            page_end=i,
        )
        for i in range(1, 9)
    ]
    # Add a strong match on PED
    policy_chunks[2].text = "Pre-existing disease waiting period of 36 months of continuous cover."

    law_chunks = [
        LawChunk(
            id=f"l_{i}",
            doc_id="irdai_2024",
            title="IRDAI Master Circular 2024",
            section_ref=f"Section {i}",
            text=f"Regulatory guidelines regarding insurance operations section {i}.",
        )
        for i in range(1, 7)
    ]
    law_chunks[0].text = "IRDAI Master Circular 2024: Maximum pre-existing disease waiting period is 36 months."

    retriever = HybridRetriever(policy_chunks=policy_chunks, law_chunks=law_chunks)

    query = "pre-existing disease 36 months waiting period"
    policy_results, law_results = retriever.retrieve(
        query=query,
        top_policy_k=6,
        top_law_k=4,
    )

    # Verify top-k bounds
    assert len(policy_results) == 6
    assert len(law_results) == 4

    # Top results should match the specific terms
    assert "Pre-existing" in policy_results[0].text or "waiting period" in policy_results[0].text.lower()
    assert "IRDAI Master Circular 2024" in law_results[0].title


def test_chunks_to_evidence_conversion() -> None:
    """Verify conversion of retrieved chunks to Evidence instances with verified=False."""
    p_chunk = PolicyChunk(
        id="chunk_test_1",
        case_id="case_ev_01",
        clause_ref="Clause 4.1",
        heading="Clause 4.1: PED",
        text="Pre-existing disease excluded for 36 months.",
        page_start=7,
        page_end=8,
    )
    l_chunk = LawChunk(
        id="law_test_1",
        doc_id="irdai_circ",
        title="IRDAI Master Circular",
        section_ref="Clause 12.1",
        text="Moratorium period applies after 60 months.",
    )

    ev_list = chunks_to_evidence(policy_chunks=[p_chunk], law_chunks=[l_chunk])

    assert len(ev_list) == 2

    # Policy evidence check
    p_ev = ev_list[0]
    assert p_ev.id == "ev_retrieved_policy_chunk_test_1"
    assert p_ev.source_type == EvidenceSourceType.POLICY
    assert p_ev.source_ref == "Clause 4.1"
    assert p_ev.page == 7
    assert p_ev.verified is False

    # Law evidence check
    l_ev = ev_list[1]
    assert l_ev.id == "ev_retrieved_law_law_test_1"
    assert l_ev.source_type == EvidenceSourceType.LAW_PACK
    assert "IRDAI Master Circular" in l_ev.source_ref
    assert l_ev.page == 1
    assert l_ev.verified is False

