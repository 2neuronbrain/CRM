# FlytBase CRM — Walkthrough Video Guide (Max 3-Minute Video)

## Video Metadata & Context
- **Target URL**: [https://www.kaaliya.in](https://www.kaaliya.in) (Mirror: [https://crm-flytbase.vercel.app](https://crm-flytbase.vercel.app))
- **Duration**: Under 3 minutes (02:45 total runtime)
- **Host / Platform**: Google Drive Link (Anyone with the link can view)
- **Goal**: Demonstrate to Monday morning executive reviewers how the CRM answers the 5 core questions, traces provenance to raw evidence, picks up live MCP signals, and maintains clean architecture.

---

## Screen Recording Aspect & Scene Breakdown

### Scene 1: Executive Dashboard & Overview (0:00 – 0:35)
- **Visuals**: Full screen view of `https://www.kaaliya.in`. Point out the sleek dark zinc UI, sidebar navigation, and header showing Verified Book Value ($730,000) vs Reported Unverified ($675,000).
- **Core Elements**:
  - Show the top cards: **Immediate Priority Tasks** and **Customer Sentiments**.
  - Show Account Summaries for Eastern Counties Police Alliance (A), Aldermoor Industrial Group (B), and Northumbrian Grid & Power (NGP).
- **Spoken Points**:
  > *"Welcome to FlytBase CRM, an evidence-backed intelligence platform built for executive Monday morning reviews. The dashboard separates verified contract value from verbal proposals, and immediately surfaces the top tasks and sentiment trends across all accounts."*

---

### Scene 2: The Five Questions for Account A (0:35 – 1:25)
- **Visuals**: Click on Eastern Counties Police Alliance to open the Account Deep-Dive workspace.
- **Walk through the 5 Questions**:
  1. **What is the book worth?** Verified £350k (Framework Contract for 35 docks) vs £105k unverified expansion.
  2. **Who holds the power?** Show the Power Map: Insp. Karen Mbeki (Operational Lead / High Urgency), Rhys Calder (Commercial Champion leaving in Jan), Supt. Davies (Budget Approver).
  3. **What do we do first?** Top 3 ranked actions:
     - Rank 1: Provide Written Event Cover & Training Plan for Insp. Karen Mbeki (Target: Nov 20, 2026).
     - Rank 2: Schedule Succession Handover Review with Rhys Calder.
     - Rank 3: Clarify 300-dock tender specifications.
  4. **What is about to go wrong?** Risk Radar flagging Insp. Mbeki's unanswered escalation before the Dec 5 public event.
  5. **What do we still not know?** Blind spots highlighting the lack of a named successor for Rhys Calder and unclear tender timelines.

---

### Scene 3: Tracing One Number to Its Unedited Source (1:25 – 1:55)
- **Visuals**: Navigate to **Deals & Commercial Intelligence** (`/deals`).
  - Locate the **Primary Alliance Framework Contract ($350,000)**.
  - Click the `@ contract.txt` source citation badge.
  - The **Evidence Drawer** slides in from the right.
- **Proof of Provenance**:
  - Show the unedited excerpt: *"Eastern Counties Police Alliance Framework Agreement... £350,000 annually covering 35 autonomous drone stations"*.
  - Point out Confidence: `Verified`, Source Category: `Contract`, and origin timestamp.
  - Emphasize: *No invented IDs, no hallucinated numbers.*

---

### Scene 4: Picking Up Something Live (Telemetry Anomaly & Write-Back) (1:55 – 2:25)
- **Visuals**: Navigate to **Interaction Timeline** (`/timeline`).
  - Show live signals: Aldermoor usage drop-off (3 docks offline) and Insp. Mbeki's urgent event ticket.
  - Click **Sync Live Signals** in the bottom left or top bar. Show the live cooldown timer respecting the 65-second MCP rate limit.
  - Navigate to **Notes & Tasks** (`/notes`). Submit a test note or click complete on an operational task to demonstrate live write-back and instant UI state updates.

---

### Scene 5: Codebase & Architecture Brief (2:25 – 2:45)
- **Visuals**: Quick switch to VS Code / terminal.
  - `server/src/sync/worker.js`: Central rate-limited MCP scheduler (65s cooldown).
  - `server/src/engine/prioritization.js`: Deterministic, explainable scoring formula (Value + Urgency + Risk).
  - `supabase/migrations/`: Relational schema on Supabase PostgreSQL.
- **Closing Statement**:
  > *"All 4 links are live in the Hand-In portal at https://www.kaaliya.in/hand-in. The system runs 24/7 on Vercel and Supabase without laptop dependency."*
