# FlytBase CRM — Architecture & Thinking Document

## 1. What It Does, and For Whom
**FlytBase CRM** is a live, evidence-driven Account Intelligence CRM designed specifically for Executive Monday Morning Reviews. It serves Account Executives, Customer Success Managers, and Sales Directors managing enterprise autonomous drone dock contracts (such as police alliances, critical infrastructure, and industrial campuses).

Unlike conventional CRMs bloated with manual form entries and unverified pipeline optimism, FlytBase CRM connects directly to an external **Model Context Protocol (MCP)** server (`https://questathon.aihackerscollective.com/api/public/mcp`). It continuously ingests contracts, call transcripts, tickets, and telemetry signals to answer the **Five Essential Management Questions**:
1. **What is the book worth?** Strictly distinguishes *Verified Book Value* (executed contracts) from *Reported / Verbal Value*.
2. **Who holds the power?** Evaluates decision-makers, economic buyers, champions, and blockers—alerting on relationship vulnerabilities (e.g., champion departures).
3. **What do we do first?** Prioritizes the top 3 tactical actions per account using an explainable, deterministic scoring formula.
4. **What is about to go wrong?** Real-time Risk Radar detecting unaddressed escalations and silent telemetry disengagements.
5. **What do we still not know?** Gathers blind spots and formulates precise discovery questions to derisk renewals and expansion tenders.

---

## 2. How It Decides: The Rules & Decision Engine

Every intelligence output is calculated through deterministic, audit-traceable logic:

### A. Commercial Valuation Rules
- **Verified Book Value**: Only deals supported by executed legal agreements (`contract.txt`, signed order forms) where pricing is explicit.
- **Reported Value**: Verbal stakeholder promises, pipeline discussions, or proposals lacking formal signature.
- **Strict Provenance**: Every monetary figure carries an immutable evidence pointer (`evidence_id`) linking directly to the raw, unedited source text.

### B. Action Prioritization Algorithm (Top 3 Ranked Moves)
To prevent generic to-do lists, each operational action is scored from **0 to 100** points:
$$\text{Score} = \text{Value Weight (40\%)} + \text{Urgency Weight (30\%)} + \text{Likelihood / Risk Weight (30\%)}$$
- **Commercial Value (0–40 pts)**: Deal size normalized against total portfolio value.
- **Urgency (0–30 pts)**: Proximity to critical events (e.g., public event on Dec 5, champion leaving in Jan).
- **Risk Severity (0–30 pts)**: Escalation flags, zero-flight telemetry freezes, or unassigned successors.
- **Enforcement**: Only the top 3 ranked actions per account are highlighted on Monday morning, each with a named owner, deadline, and expected outcome.

### C. Customer Sentiment & Risk Radar Engine
- Aggregates stakeholder sentiment weights (Advocate +25, Supportive +15, Neutral 0, Concerned -20, Blocker -35).
- Detects **Silent Drift**: When telemetry shows active docks suddenly execute 0 flights over 14 days without customer tickets, sentiment drops to *At-Risk / Silent Drift* (score: 52) and triggers an immediate Field Tech inspection alert.

### D. MCP Rate Limiting & Synchronization
- Centralized token scheduler enforces a strict **65-second minimum cooldown** between MCP API calls.
- Write-backs (`write_note`) enter a persistent PostgreSQL queue and commit only upon MCP verification.

---

## 3. What It Does Not Do Yet
- **Automated External Email Dispatch**: While actions and communication drafts are generated, the system does not auto-send emails without human sign-off.
- **Predictive ML Telemetry Diagnostics**: It flags zero-flight anomalies across active units, but root-cause mechanical failure analysis requires field inspection.
- **Multi-Tenant SSO**: Currently optimized as an executive single-tenant command center; enterprise Okta/SAML RBAC is slated for Phase 2.

---

## 4. How We Used AI
- **Information Synthesis & Schema Normalization**: AI was utilized to analyze unstructured MCP paperwork (call transcripts, meeting notes, ticket logs) into structured relational entities (people, deals, risks, actions).
- **Deterministic Prompt-Guarded Analysis**: LLM prompts were constrained with strict zero-hallucination rules—refusing to invent names, IDs, or contract numbers without matching citations.
- **Iterative UI/UX Engineering**: AI co-developed the dark zinc visual design, responsive layout, and the full-stack serverless bridge between Vercel Edge functions and Supabase PostgreSQL.
