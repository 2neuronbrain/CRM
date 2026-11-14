# Thinking Document: Live MCP-Connected CRM

**Project:** FlytBase Account Intelligence CRM  
**Hosted Application:** [https://www.kaaliya.in](https://www.kaaliya.in) (Mirror: [https://crm-flytbase.vercel.app](https://crm-flytbase.vercel.app))  
**Public Repository:** [https://github.com/2neuronbrain/CRM](https://github.com/2neuronbrain/CRM)

---

### 1. What It Does, and For Whom

**For Whom:**  
Built for Sales Directors, Account Executives, and Customer Success Managers conducting executive Monday morning account reviews for autonomous drone dock contracts (police alliances, heavy industrial campuses, critical infrastructure).

**What It Does:**  
It replaces guesswork and optimistic pipeline claims with a live, evidence-backed intelligence engine directly connected to an external Model Context Protocol (MCP) server. Instead of static data entry, it answers the **Five Essential Management Questions**:
1. **What is the book worth?** Strictly separates **Verified Book Value** (backed by executed contracts) from **Reported Value** (verbal stakeholder claims).
2. **Who holds the power?** Maps Decision-Makers, Economic Buyers, Champions, Evaluators, and Blockers—actively warning of relationship shifts (e.g. champion departures).
3. **What do we do first?** Surfaces the top 3 ranked operational actions per account with assigned owners, deadlines, and justifications.
4. **What is about to go wrong?** A real-time Risk Radar categorizing threats (Red, Amber, Green), flagging silent telemetry freezes and unaddressed customer escalations.
5. **What do we still not know?** Identifies blind spots and generates targeted discovery questions to derisk renewals and expansion tenders.

---

### 2. How It Decides: The Rules & Decision Engine

Every intelligence output is governed by deterministic, transparent, and reproducible business rules:

- **Commercial Valuation Separation Rule:**  
  A deal value is classified as **Verified** *if and only if* an executed legal agreement exists (`contract.txt`, signed order confirmation). If an amount is cited in an email or call transcript without an executed signature, it is strictly classified as **Reported (Unverified)**. Every single amount carries a direct clickable citation to its source excerpt.
- **Top 3 Action Prioritization Algorithm:**  
  Actions are scored deterministically out of 100 points:
  $$\text{Score} = \text{Value Weight (0–40 pts)} + \text{Urgency Weight (0–30 pts)} + \text{Risk Impact Weight (0–30 pts)}$$
  - *Value (40%)*: Proportional to verified contract value influenced.
  - *Urgency (30%)*: Proximity to hard external milestones (e.g. 5 Dec public event, Jan handover).
  - *Risk Impact (30%)*: Severity of consequences if ignored (e.g. operational failure, churn).  
  Only the top 3 actions are scheduled for immediate Monday morning execution.
- **Customer Sentiment & Silent Disengagement Rule:**  
  Sentiment scores combine stakeholder relationship stances with telemetry activity. If an account’s autonomous docks cease flights for $\ge 14$ consecutive days despite staying online—and the customer raises no support ticket—sentiment is automatically downgraded to **At-Risk / Silent Drift** (score: 52), triggering an operational investigation.
- **Strict Provenance Rule:**  
  *Evidence first, Intelligence second, Recommendations third.* No fabricated IDs, values, or contacts exist. If information is missing, the CRM explicitly marks it as an intelligence gap.
- **Central MCP Rate Limiting:**  
  A single backend scheduler guarantees a strict **65-second minimum cooldown** between MCP calls. Outgoing user notes (`write_note`) queue persistently in PostgreSQL and update the audit trail only upon MCP confirmation.

---

### 3. What It Does Not Do Yet

- **Automated External Email Dispatch:** The CRM drafts specific stakeholder responses and escalation plans, but requires human confirmation before dispatching external correspondence.
- **Hardware Telemetry Diagnostics:** The system detects flight stoppages and offline states from usage logs, but does not diagnose low-level drone hardware or dock sensor firmware faults.
- **Multi-Tenant Enterprise SSO:** Built as an executive command center for assigned accounts; multi-tenant Okta/SAML enterprise authentication is planned for future phases.

---

### 4. How We Used AI

- **Unstructured Data Ingestion:** AI was used to ingest and structure heterogeneous paperwork returned by the MCP (raw call transcripts, email logs, tickets, markdown contracts) into relational database schemas.
- **Deterministic Prompt Engineering:** Extraction prompts were strictly constrained with zero-tolerance for hallucination—mandating verbatim evidence quotes and rejection of invented numbers or titles.
- **Full-Stack Engineering & Serverless Deployment:** AI co-architected the full-stack system: building the Vite + Tailwind client, Express backend with SQLite-to-PostgreSQL migration, and bridging serverless functions on Vercel with transaction pooling on Supabase.
