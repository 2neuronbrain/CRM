# FlytBase CRM — Live, MCP-Connected Account Intelligence

A production-quality Customer Relationship Management (CRM) and live account intelligence platform connected to an external **Model Context Protocol (MCP)** server.

Designed for executive Monday morning reviews, FlytBase CRM continuously ingests, analyzes, and maintains an actionable, evidence-backed picture of assigned customer accounts.

---

## Core Value: Answering the Five Questions

For each customer account, FlytBase CRM answers:

1. **What is the book worth?**
   - Strictly separates **Verified Book Value** (backed by executed contracts and agreements) from **Reported Value** (verbal statements and unverified proposals).
   - Every constituent deal links directly to its unedited source record.
2. **Who holds the power?**
   - Stakeholder power map identifying Decision-Makers, Economic Buyers, Champions, Evaluators, and Blockers.
   - Live alerts for relationship shifts and key departures (e.g. *Rhys Calder* departing the alliance in January without a named successor).
3. **What should we do first?**
   - Ranked top 3 actions per account powered by a **deterministic, explainable algorithm** balancing Deal Value (0-40 pts), Likelihood of Success (0-30 pts), and Deadline Urgency (0-30 pts).
   - Every action includes an assigned owner, target deadline, and justification.
4. **What is about to go wrong?**
   - Real-time **Risk Radar** categorizing threats as Red (Immediate Intervention), Amber (Developing), or Green.
   - Detects unanswered escalations (e.g. *Insp. Karen Mbeki* awaiting operator training confirmation before Dec 5 event) and silent usage drop-offs (e.g. *Aldermoor* 3 docks stopping flights for 2 weeks).
5. **What do we still not know?**
   - **Blind-Spot Finder** uncovering critical information gaps that could jeopardize renewals or tenders.
   - Formulates targeted discovery questions to ask key stakeholders.

---

## Strict Provenance & Evidence Architecture

**Evidence first. Intelligence second. Recommendations third.**

The CRM never fabricates IDs, values, or contacts. Every number, stakeholder concern, and detected risk in the UI features a clickable source badge opening the **Evidence Drawer**, revealing:
- Primary Source ID (e.g. `contract.txt`, `calls/2026-01-13_order_call.txt`)
- Category (Contract, Call Transcript, Email, Signal, Usage)
- Unedited Source Excerpt
- Originating MCP Tool
- Confidence Classification: `Verified`, `Corroborated`, `Reported`, `Inferred`, or `Unknown`
- Timestamp and Retrieval Date

---

## Architecture

```text
                  MCP SERVER
            (tools/call via HTTP)
                      │
                      │ 1 call / 65s safe interval
             MCP JSON-RPC Client
                      │
           Central Request Scheduler
             (PostgreSQL-backed queue)
                      │
        ┌─────────────┴─────────────┐
        │                           │
   Initial Sync                Live Signals
 (whoami, paperwork,        (periodic discovery
    data format)                background worker)
        │                           │
        └─────────────┬─────────────┘
                      │
              Ingestion Layer
                      │
             Provenance Engine
             (evidence records)
                      │
         PostgreSQL Database (Docker)
                      │
            Node.js Express API
                      │
          Server-Sent Events (SSE)
                      │
            React Vite Frontend
         (Executive Live Dashboard)
```

### Rate Limiting & Cooldown Protection
The external MCP token is strictly constrained to **one call per minute**. The CRM implements a centralized, PostgreSQL-persisted queue:
- Guarantees a minimum **65-second safe interval** between calls.
- Enqueues both reads (`get_signals`, `get_all_paperwork`) and writes (`write_note`) through the same mutex scheduler.
- Unprocessed operations survive backend restarts.
- Cooldown timer and pending queue depth are visible live in the dashboard ribbon.

---

## Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Recharts, Server-Sent Events (SSE) client.
- **Backend**: Node.js 20, Express, PostgreSQL (`pg`), MCP JSON-RPC Client, Background Sync Worker.
- **Database**: PostgreSQL 16 (persistent Docker container or managed service).

---

## Quick Start & Local Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v20+ recommended)
- [Docker](https://www.docker.com/) & Docker Compose

### 2. Environment Configuration
Create a `.env` file in `server/.env`:
```env
AQ_TOKEN=your_token_here
MCP_URL=https://questathon.aihackerscollective.com/api/public/mcp
DATABASE_URL=postgres://postgres:postgres@localhost:5432/crm
PORT=3001
NODE_ENV=development
RATE_LIMIT_INTERVAL_MS=65000
```

### 3. Start PostgreSQL Database
```bash
docker run -d --name crm-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=crm -p 5432:5432 postgres:16-alpine
```

### 4. Install Dependencies
```bash
# Server dependencies
cd server && npm install

# Client dependencies
cd ../client && npm install
```

### 5. Run the Application
In terminal 1 (Backend Server):
```bash
cd server
npm start
```
*The server will initialize database tables, connect to the MCP server, and begin the scheduled ingestion sequence automatically.*

In terminal 2 (Frontend Client - Development Mode):
```bash
cd client
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

*(In production, building the client with `npm run build` in `client` allows the backend Express server on `http://localhost:3001` to serve the entire app seamlessly).*

---

## One-Command Docker Deployment

You can deploy the complete stack using Docker Compose:

```bash
AQ_TOKEN=your_token_here docker compose up -d
```
Access the application on `http://localhost:3001`.

---

## Write-Back Integration (`write_note`)

FlytBase CRM supports writing strategic notes, tasks, risks, and next steps back to the live MCP server:
1. Navigate to the **Notes** page in the CRM.
2. Select target Account (`A` or `B`), kind (`next_step`, `task`, `risk`, `note`), and submit.
3. The note enters the central queue with high priority (priority 2).
4. The scheduler invokes `write_note` respecting the rate limit.
5. The local record is updated to `synced` with its MCP ID upon confirmation, updating the live audit trail without requiring a reload.

---

## Submission Checklist (Hand In Portal)

The CRM includes a dedicated **Hand In** page (`/hand-in`) managing the 4 required submission links:
- **Hosted CRM URL**: Public URL accessible in an incognito window without laptop dependency.
- **Public Git Repository**: Public repository containing source code and setup documentation.
- **Thinking Document**: One-page architecture and decision-rules summary.
- **Walkthrough Video**: 3-minute video showing the 5 answers, provenance trace, and live signal pickup.

---

## License
MIT
