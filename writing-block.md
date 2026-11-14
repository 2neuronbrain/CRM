# Build Specification: Live, MCP-Connected CRM

## 1. Project Overview

Build a production-quality, intelligent Customer Relationship Management (CRM) application named **CRM**, using **React for the frontend and Node.js for the backend**.

This is not a conventional CRM with manually entered leads, contacts, and opportunities. It is a live, evidence-driven account intelligence platform connected to an external Model Context Protocol (MCP) server.

The CRM must connect to the provided MCP server, retrieve the two assigned customer accounts and their associated paperwork, analyze the available information, and continuously maintain an actionable picture of each account.

The final application should be comparable to an internal account-management dashboard that a sales director, customer success manager, or account executive could confidently use during a Monday morning review.

### Core objective

For each of the two accounts, the CRM must reliably answer five questions:

1. What is the book worth?
2. Who holds the power?
3. What should we do first?
4. What is about to go wrong?
5. What do we still not know?

Every important number, statement, recommendation, and risk must be traceable to the original information retrieved through the MCP.

**Most important requirement: The CRM must remain synchronized with the MCP. Any new information, event, document, note, or account update must be reflected in the application without requiring a code change or a manual database edit.**

Do not build a static demonstration using hardcoded account data. Build the actual functioning application.

---

## 2. Technology Stack

Use the following architecture.

### Frontend
- React
- Vite
- JavaScript or TypeScript
- Tailwind CSS
- Recharts for charts and visualizations
- Lucide React for icons
- React Router for navigation
- Fetch API or Axios for communication with the backend
- Server-Sent Events (SSE) or WebSockets for real-time frontend updates

### Backend
- Node.js
- Express.js
- Dedicated MCP integration service
- Centralized MCP request scheduler and rate limiter
- Background synchronization worker
- PostgreSQL for persistent application data
- SSE or WebSocket service for broadcasting updates to connected clients

Use a clean, modular architecture. Separate account analysis, MCP communication, synchronization, data persistence, API routes, and frontend components.

The backend must be independently deployable and must not depend on the developer's computer remaining online.

### Suggested architecture

```text
                 MCP SERVER
                     |
                     |
             MCP JSON-RPC Client
                     |
                     |
          Central Request Scheduler
                     |
          +----------+-----------+
          |                      |
     Initial Sync           Live Signals
          |                      |
          +----------+-----------+
                     |
             Data Processing
                     |
          Evidence & Provenance
                     |
              PostgreSQL
                     |
           Node.js Express API
                     |
           SSE / WebSocket Layer
                     |
              React Frontend
                     |
          Live Account Dashboard
```

---

## 3. MCP Integration: Highest Priority

The application must be deeply integrated with the provided MCP server.

MCP endpoint:

`https://questathon.aihackerscollective.com/api/public/mcp`

Transport: Streamable HTTP.

Authentication:

`Authorization: Bearer <AQ_TOKEN>`

The token must be stored exclusively in the Node.js backend environment.

Use:

```env
AQ_TOKEN=your_token_here
MCP_URL=https://questathon.aihackerscollective.com/api/public/mcp
DATABASE_URL=your_database_connection_string
```

Never expose the token through:
- React components.
- Browser network requests.
- Client-side environment variables.
- Public Git repositories.
- Application logs.
- Screenshots or walkthrough videos.

Include `.env.example` with placeholder values and configure `.gitignore` to exclude `.env` and other secrets.

### 3.1 MCP communication

Implement a reusable MCP client.

Every tool call must follow the JSON-RPC request structure:

```javascript
{
  jsonrpc: "2.0",
  id: Date.now(),
  method: "tools/call",
  params: {
    name: "tool_name",
    arguments: {}
  }
}
```

Use HTTP POST with the appropriate headers:

```javascript
{
  "content-type": "application/json",
  "accept": "application/json, text/event-stream",
  "authorization": `Bearer ${process.env.AQ_TOKEN}`
}
```

The MCP client must:
- Handle successful responses.
- Parse MCP tool results.
- Handle JSON-RPC errors.
- Handle tool-level errors.
- Handle malformed or unexpected responses.
- Handle connection timeouts.
- Handle HTTP 429 and rate-limit responses.
- Record request timestamps and outcomes.
- Never expose the authorization header in logs.
- Provide meaningful error messages to the frontend.

### 3.2 Available MCP tools

Implement access to the following tools:

| MCP Tool | Purpose |
|---|---|
| `whoami` | Determine what data and activities are currently available. |
| `get_my_accounts` | Retrieve both assigned customer accounts. |
| `get_file` | Retrieve a particular file using its ID. |
| `list_paperwork` | Discover available paperwork. |
| `get_all_paperwork` | Retrieve all paperwork for an account. |
| `search_paperwork` | Search records for relevant information. |
| `get_paperwork_record` | Retrieve a specific record using its account and path. |
| `get_feature_requests` | Retrieve customer feature requests. |
| `get_release_notes` | Retrieve software release information. |
| `get_flytbase_team` | Retrieve relevant FlytBase personnel information. |
| `get_signals` | Retrieve newly available live account events. |
| `get_data_format` | Retrieve the JSON Schema describing account data. |
| `list_notes` | Retrieve notes previously written by the CRM. |
| `write_note` | Write a note, task, risk, or next step back to the MCP. |

Implement the client so new MCP tools can be added without rewriting the application.

### 3.3 Critical rate-limit requirement

**Each token is limited to one MCP call per minute. Writes are included in this limit.**

This is an architectural constraint, not an optional optimization.

Implement a centralized request queue that controls every MCP request.

Requirements:

1. All MCP requests must pass through a single backend scheduler.
2. Maintain a minimum 60-second interval between requests for the token.
3. Use a slightly longer configurable interval, such as 65 seconds, for additional safety.
4. Persist the last successful and attempted request timestamps.
5. Prevent simultaneous requests from multiple API routes or background workers.
6. Do not allow multiple browser sessions to independently call the MCP.
7. Queue write operations and reads using the same rate-limit mechanism.
8. Prioritize operations according to their importance.
9. Show queued, processing, successful, and failed operations in the dashboard.
10. Recover queued work after backend restarts.

Never bypass the scheduler to make a direct MCP request.

### 3.4 Initial data ingestion

On initial setup, use the MCP to retrieve and persist the relevant information.

Recommended ingestion sequence:

1. `whoami`
2. `get_data_format`
3. `get_my_accounts`
4. `get_all_paperwork` for Account A
5. `get_all_paperwork` for Account B
6. `get_feature_requests`
7. `get_release_notes`
8. `get_flytbase_team`
9. `get_signals`
10. `list_notes`

Schedule these calls through the centralized rate limiter. Do not execute them concurrently.

Use the JSON Schema returned by `get_data_format` to understand the actual data structure. Do not assume that fields have names or structures that have not been verified.

Store the original MCP responses in the database. Do not repeatedly retrieve information that has already been fetched unless a relevant update requires it.

The application must still be useful when only some of the initial ingestion steps have completed. Display the synchronization status and clearly distinguish missing data from unavailable data.

---

## 4. Live Synchronization: Non-Negotiable Requirement

The CRM must not be a static snapshot.

The MCP data may change while the application is running. The application must automatically detect and process those changes.

### 4.1 Live event monitoring

Use `get_signals` as the primary live-event discovery mechanism.

Implement a background worker that:

1. Calls `get_signals` through the centralized request scheduler.
2. Compares returned signals against previously stored signals.
3. Identifies new events.
4. Prevents previously processed events from being duplicated.
5. Associates each event with the appropriate account.
6. Updates the relevant account, deal, risk, contact, or action records.
7. Recalculates the account intelligence.
8. Saves the event and its evidence.
9. Broadcasts the changes to the React application.

The worker should poll at approximately 65-second intervals, subject to the global MCP scheduler and any queued operations.

Do not run multiple competing polling loops.

### 4.2 Update propagation

The moment a new event is processed, the backend must update the relevant database records and notify connected frontend clients.

Use Server-Sent Events or WebSockets.

The frontend should automatically update:
- Account overview.
- Deal values and deal status.
- Stakeholder relationships.
- Next-best actions.
- Risk assessments.
- Deadlines and alerts.
- Unknown information.
- Activity timeline.
- Synchronization status.

A browser refresh must not be necessary to see an already processed update.

### 4.3 Handling new information

The system must be data-driven.

For example:

- A new email may change a stakeholder's stance.
- A new ticket may introduce a customer risk.
- A new usage record may expose declining product adoption.
- A new contract may change the verified book value.
- A new customer deadline may change the priority of an action.
- A new contact may expose an unknown decision-maker.
- A new signal may change an account's overall health.

The application must process these changes through configurable analysis rules rather than hardcoded event-specific logic.

When a signal indicates that relevant source records have changed, enqueue the appropriate refresh operation. Respect the one-call-per-minute constraint rather than immediately issuing additional MCP calls.

### 4.4 Avoid false synchronization claims

The supplied MCP interface exposes `get_signals` for live-event discovery. Do not assume that webhooks or a push subscription mechanism exists unless the server explicitly supports one.

Show:
- Last successful MCP synchronization.
- Last attempted synchronization.
- Next scheduled synchronization.
- Number of pending MCP operations.
- Number of newly processed events.
- Last synchronization error, where applicable.

Clearly distinguish an event received from the MCP from a record that has merely been queued for retrieval.

---

## 5. Evidence and Data Provenance

This is one of the most important requirements in the entire application.

**Every important figure and factual claim must have a source.**

The CRM must never invent deal values, contact identities, dates, probabilities, or account information.

### 5.1 Evidence architecture

For every retrieved fact, preserve:

- Account identifier.
- Record identifier.
- Source type.
- Source file or record path.
- Original source content or relevant excerpt.
- Source date, when available.
- Original MCP tool.
- Original field or JSON path.
- Retrieval timestamp.

Create a reusable evidence object:

```javascript
{
  accountId: "account-id",
  sourceType: "email",
  sourceId: "original-source-id",
  sourcePath: "original-record-path",
  toolName: "get_all_paperwork",
  fieldPath: "original.json.field",
  excerpt: "Relevant source evidence",
  sourceDate: "2026-11-14",
  retrievedAt: "ISO-8601 timestamp"
}
```

This is an illustrative internal structure. Adapt it to the actual MCP response and preserve genuine source identifiers rather than generating replacement IDs.

### 5.2 Source traceability in the UI

Every displayed numerical figure must have a clickable source reference.

For example:

```text
Verified Book Value
$12,438

Evidence: [Source ID]
Source: Contract / Commercial Record
Retrieved: 14 November 2026
```

Clicking the source reference should open an evidence drawer containing:
- Source ID.
- Source category.
- Original source record or excerpt.
- Relevant field.
- Associated account and deal.
- Retrieval date.

Provide a unified evidence viewer.

### 5.3 Evidence confidence

Classify information into:

- Verified: Directly supported by a primary source.
- Corroborated: Supported by multiple independent records.
- Reported: Stated by a customer or stakeholder but not independently verified.
- Inferred: A transparent conclusion drawn from available evidence.
- Unknown: Not established by available records.

Never silently convert an inference into a verified fact.

If a figure has no supporting evidence, it must not be included in the verified total.

---

## 6. The Five Core CRM Modules

Each account must have its own complete intelligence dashboard.

### MODULE 1: Book Value — What is the book worth?

Build a deal and opportunity intelligence module.

Display:
- All identified deals.
- Deal descriptions.
- Deal values.
- Deal status.
- Relevant customer account.
- Supporting evidence.
- Related stakeholders.
- Associated deadlines.
- Commercial risks.
- Verification status.

Separate:
1. Verified deal value.
2. Reported but unverified value.
3. Deals without an established value.

Calculate the verified book value from supported individual deal amounts.

Do not include unsupported claims in the verified total.

A deal should have a detailed view showing how its value was established and which records support it.

Include:
- Total verified book value.
- Total reported value.
- Number of active deals.
- Number of deals without a verified value.
- Deal-stage distribution.
- Deal-level breakdown.

Each total must be traceable to its constituent deals and their source records.

### MODULE 2: Power Map — Who holds the power?

Build an account stakeholder intelligence module.

For every deal, identify the relevant stakeholder roles:

- Decision-maker.
- Economic buyer or payer.
- End user.
- Champion.
- Technical evaluator.
- Potential blocker.
- Unknown or unengaged stakeholders.

For each person, show:

- Name.
- Designation or role, when available.
- Organization.
- Relationship to the deal.
- Current stance.
- Last known interaction.
- Issues or concerns.
- What they are waiting for.
- What information remains unknown.
- Source evidence.

Use relationship labels such as:
- Supportive.
- Warm.
- Neutral.
- Guarded.
- Resistant.
- Unknown.

Only assign these labels when the available evidence supports them. Otherwise display Unknown.

Provide a visual stakeholder relationship map showing how people connect to individual deals.

**Do not confuse a contact list with a power map.** The purpose is to establish who makes decisions, controls budgets, uses the product, influences outcomes, and can block progress.

### MODULE 3: Next Best Actions — What should we do first?

Build an actionable task prioritization engine.

Display the three highest-priority actions for each account, followed by the remaining opportunities.

Every action must contain:

- Priority rank.
- Action title.
- Clear description.
- Account.
- Associated deal.
- Assigned owner.
- Deadline.
- Reason for the recommendation.
- Expected outcome.
- Supporting evidence.
- Current status.

Examples of useful actions:
- Obtain confirmation from the contract signatory.
- Contact a previously unengaged budget holder.
- Confirm training dates before a customer event.
- Investigate an unexpected decline in device usage.
- Clarify the customer escalation process.
- Obtain written approval for a commercial proposal.

### Prioritization logic

Prioritize actions using three important dimensions:

1. Deal value.
2. Likelihood of success.
3. Deadline urgency.

Use only supported deal values and documented success indicators.

If a probability is explicitly available, preserve its source. If no numeric probability exists, use a clearly labelled qualitative assessment rather than fabricating a percentage.

The priority algorithm must:
- Be deterministic.
- Be documented.
- Be explainable.
- Use evidence-backed inputs.
- Account for deadlines.
- Avoid rewarding unsupported assumptions.
- Recalculate when relevant source data changes.

Display the reason behind each priority ranking.

For example:

"Ranked first because a customer commitment is due this week, the relevant stakeholder has not received a response, and the associated deal is commercially significant."

Do not display generic recommendations such as "Follow up with customer."

### MODULE 4: Risk Radar — What is about to go wrong?

Build an account risk monitoring engine.

Identify:

- Approaching deadlines.
- Missed deadlines.
- Unanswered customer communications.
- Stakeholders becoming disengaged.
- Deals without decision-maker access.
- Deals without payer access.
- Stalled opportunities.
- Declining product usage.
- Customer tickets without resolution.
- Unfulfilled commitments.
- Contract renewal risks.
- Operational issues.

Use a simple status classification:

- Red: Immediate intervention required.
- Amber: Developing risk requiring attention.
- Green: No identified material risk based on available evidence.
- Unknown: Insufficient data to assess.

Every risk should contain:

- Risk title.
- Description.
- Severity.
- Associated account.
- Associated deal.
- Date detected.
- Relevant deadline or trigger.
- Consequence if unresolved.
- Recommended mitigation.
- Responsible owner.
- Supporting evidence.

Where possible, calculate when a risk becomes urgent using the actual event date, deadline, and current date.

Do not automatically mark everything green when information is missing.

### MODULE 5: Blind-Spot Finder — What do we still not know?

Create an intelligence-gap analysis module.

Identify missing information that could materially affect an account strategy.

Examples:
- Unknown contract signatory.
- Unknown budget owner.
- No established renewal decision-maker.
- Missing commercial approval.
- Unconfirmed deployment date.
- No identified successor to an outgoing stakeholder.
- Unclear customer escalation arrangement.
- Unverified product savings.
- Missing operational requirements.

Each gap must contain:

- Missing information.
- Why it matters.
- Related account or deal.
- Who could provide the information.
- Recommended question to ask.
- Priority.
- Supporting evidence demonstrating the gap.

If a person is not identified in the underlying data, do not invent a name. Use a role such as "Commercial decision-maker — identity unknown."

Distinguish between:
- Information explicitly known to be missing.
- Information not yet found in retrieved records.
- Information that cannot currently be assessed.

---

## 7. Account Intelligence and Signal Processing

The supplied challenge information identifies two accounts:

- Eastern Counties Police Alliance.
- Aldermoor Industrial Group.

The initial challenge brief also describes important developments involving these accounts. Treat these as expected scenarios for the application to handle, but verify and populate them using the actual MCP responses rather than hardcoding them.

### Expected scenario: Eastern Counties

A live event describes Rhys Calder leaving the drone programme in January, with no successor identified. Previous calls were conducted with him alone.

The CRM should recognize:
- Stakeholder departure.
- Loss of an established relationship.
- Missing successor.
- Possible decision-making continuity risk.
- Need to identify alternative stakeholders.

Another event describes Insp. Karen Mbeki requesting written confirmation of:
- Training dates for additional operators before a public event.
- The person responsible for responding if a dock fails on the event day.

The request has not received a response.

The CRM should recognize:
- Unanswered customer communication.
- Upcoming public-event deadline.
- Operational commitment.
- Potential customer relationship risk.
- An urgent action requiring an owner and deadline.

### Expected scenario: Aldermoor

A live event describes three docks that previously flew regularly recording no flights during the last two weeks, despite remaining online.

No ticket has been raised and the customer has not reported the issue.

The CRM should recognize:
- Declining product adoption or usage.
- Possible operational inactivity.
- Absence of a customer-reported issue.
- Potential undiscovered customer dissatisfaction.
- Need for proactive investigation.

For all scenarios, link every conclusion to the corresponding MCP signal or original record.

The processing engine must be generic enough to handle future events that were not anticipated during development.

---

## 8. Application Interface and Navigation

Design a modern, professional, responsive CRM dashboard.

The interface should feel like a premium B2B enterprise account intelligence product.

Avoid a generic admin template. Prioritize clarity, information density, legibility, and fast access to evidence.

### Recommended navigation

**1. Overview**

Global dashboard containing:
- Combined verified book value.
- Total reported value.
- Number of deals.
- Number of open risks.
- Number of upcoming deadlines.
- Number of unresolved intelligence gaps.
- Pending MCP operations.
- Last synchronization time.
- Recent account activity.

**2. Accounts**

Display both accounts as individual account workspaces.

Each account should have:
- Account summary.
- Book value.
- Deals.
- Stakeholder power map.
- Recommended actions.
- Risk radar.
- Intelligence gaps.
- Recent activity.

**3. Deals**

Central deal-management view.

Support:
- Table and card views.
- Sorting.
- Filtering.
- Searching.
- Deal detail pages.
- Evidence-based deal value.
- Associated contacts and actions.

**4. Power Map**

A visual relationship and influence map.

**5. Next Actions**

Ranked, deadline-oriented action list.

**6. Risk Radar**

Account and deal risk overview with severity filters.

**7. Blind Spots**

Unresolved information and discovery opportunities.

**8. Activity**

Chronological timeline of:
- MCP signals.
- New paperwork.
- Account changes.
- New deals.
- Updated stakeholder information.
- Risk changes.
- CRM-created notes and tasks.
- Synchronization activity.

**9. Evidence**

Searchable source repository of original records and extracted evidence.

**10. Hand In**

A dedicated submission page containing the four required submission links:

- Hosted CRM URL.
- Public Git repository.
- Google Docs thinking document.
- Google Drive walkthrough video.

Keep these configurable rather than hardcoding personal URLs.

### Dashboard design

Use:
- Professional typography.
- Neutral backgrounds.
- Clear visual hierarchy.
- Subtle borders and shadows.
- Consistent spacing.
- Responsive layouts.
- Accessible color contrast.
- Consistent status indicators.

Use restrained colors for risk classification:
- Red for critical.
- Amber for developing.
- Green for evidence-backed healthy status.
- Grey for unknown or unassessed.

All dashboards must work on desktop and mobile.

Include proper loading, empty, error, and partially synchronized states.

---

## 9. Write-Back Integration

The CRM must be capable of writing information back through the MCP.

Use:

`write_note`

The tool supports:
- `text`
- `account`
- `kind`
- `title`

Allow users to create:
- Notes.
- Next steps.
- Tasks.
- Risks.

Whenever a user creates an item, process it through the backend.

Expected workflow:

```text
User creates a note
        |
React sends request to Node.js
        |
Node.js validates input
        |
Operation enters MCP request queue
        |
Central scheduler executes write_note
        |
MCP confirms success or returns an error
        |
Backend updates local database
        |
Frontend receives update
```

Requirements:
- Show pending write operations.
- Show successful write operations.
- Show failed write operations.
- Preserve operation details.
- Avoid duplicate submissions.
- Provide retry functionality where appropriate.
- Do not show an operation as successfully synchronized until MCP confirms it.

If a user creates a note while another MCP call is being processed, queue the note rather than violating the rate limit.

Respect the actual capabilities of the MCP API. Do not implement edit or delete operations against the MCP unless appropriate tools exist.

---

## 10. Database Design

Design the database to preserve both original MCP information and CRM-derived intelligence.

Suggested tables:

### accounts
- id
- external_id
- name
- description
- metadata
- created_at
- updated_at
- last_synced_at

### raw_mcp_responses
- id
- tool_name
- account_id
- response_payload
- retrieved_at
- request_status

### people
- id
- external_id
- account_id
- name
- role
- organization
- stance
- last_interaction_at
- metadata

### deals
- id
- external_id
- account_id
- title
- description
- amount
- currency
- status
- verification_status
- created_at
- updated_at

### deal_stakeholders
- id
- deal_id
- person_id
- relationship_role
- stance
- evidence_id

### evidence
- id
- account_id
- source_type
- source_id
- source_path
- tool_name
- field_path
- excerpt
- source_date
- retrieved_at

### actions
- id
- account_id
- deal_id
- title
- description
- owner
- priority
- deadline
- status
- reasoning
- created_at
- updated_at

### risks
- id
- account_id
- deal_id
- title
- description
- severity
- detected_at
- trigger_date
- mitigation
- status

### intelligence_gaps
- id
- account_id
- deal_id
- missing_information
- importance
- suggested_owner
- recommended_question
- status

### signals
- id
- external_id
- account_id
- payload
- detected_at
- processed_at
- processing_status

### notes
- id
- external_id
- account_id
- title
- kind
- text
- synchronization_status
- created_at

### mcp_queue
- id
- tool_name
- arguments
- priority
- status
- created_at
- completed_at
- error

### sync_state
- id
- last_request_at
- last_successful_sync_at
- next_allowed_request_at
- last_signal_check_at
- synchronization_status

These are logical entities, not a replacement for the source schema. Adapt the design as necessary to the actual retrieved JSON Schema and MCP responses.

Use database migrations. Add appropriate foreign keys, indexes, uniqueness constraints, and timestamps.

Preserve original source identifiers. Do not replace source IDs with randomly generated IDs when creating evidence references.

---

## 11. Intelligent Analysis Engine

Create an independent analysis layer in Node.js.

The analysis engine should transform retrieved records into actionable account intelligence.

Its responsibilities:

1. Extract relevant account information.
2. Identify people and stakeholder roles.
3. Associate people with deals.
4. Identify commercial values.
5. Distinguish verified and unverified values.
6. Detect missing stakeholder relationships.
7. Identify approaching deadlines.
8. Detect inactivity and stalled deals.
9. Identify unanswered customer commitments.
10. Generate and rank recommended actions.
11. Identify intelligence gaps.
12. Associate each conclusion with supporting evidence.

### Analysis principles

- Never invent facts.
- Never invent source IDs.
- Never create fictitious stakeholder names.
- Never silently fill missing fields.
- Never treat an unverified customer statement as a verified commercial value.
- Never calculate a probability without explaining its basis.
- Never claim that an account is healthy simply because a risk was not detected.
- Never remove original information when generating a simplified representation.

Keep the business rules configurable and separate from UI components.

Recalculate only affected account intelligence when new information arrives, while periodically allowing a full reconciliation against stored records.

If AI is used for text extraction or synthesis, constrain it to the retrieved evidence. Save the evidence references supporting each AI-generated conclusion.

Use deterministic calculations for monetary totals, deadline comparisons, and prioritization scores.

---

## 12. Backend API Design

Create a clean REST API.

Suggested routes:

```text
GET    /api/health

GET    /api/dashboard
GET    /api/accounts
GET    /api/accounts/:accountId
GET    /api/accounts/:accountId/deals
GET    /api/accounts/:accountId/stakeholders
GET    /api/accounts/:accountId/actions
GET    /api/accounts/:accountId/risks
GET    /api/accounts/:accountId/gaps

GET    /api/deals
GET    /api/deals/:dealId

GET    /api/evidence
GET    /api/evidence/:evidenceId

GET    /api/activity
GET    /api/signals

GET    /api/notes
POST   /api/notes

POST   /api/sync/initial
GET    /api/sync/status
POST   /api/sync/check

GET    /api/events
GET    /api/hand-in
```

These endpoints are for the React application and are not MCP tool names.

All MCP requests must be performed server-side through the centralized scheduler.

Validate all incoming requests and return consistent error responses.

Do not expose raw secrets or unnecessary internal implementation details through API responses.

---

## 13. Reliability and Performance

The application must be reliable during a live judging demonstration.

Implement:

- Persistent database storage.
- Idempotent signal processing.
- Retry handling.
- Centralized rate limiting.
- Database transactions where necessary.
- Structured application logging.
- Graceful error handling.
- Request validation.
- Health checks.
- Frontend connection recovery.
- SSE or WebSocket reconnection.
- Background worker recovery.
- Proper handling of duplicate MCP events.

The frontend must render previously stored data immediately while synchronization continues in the background.

Do not make the entire dashboard dependent on a live MCP call succeeding at page-load time.

When the MCP is unavailable, show the latest stored data and indicate that the data may be stale.

Do not silently present stale data as live.

---

## 14. Security

Implement basic production security:

- Keep the AQ_TOKEN server-side.
- Never expose the MCP authorization token.
- Validate all inputs.
- Use secure environment variables.
- Apply suitable API rate limits.
- Restrict CORS to the deployed frontend origin where appropriate.
- Avoid leaking sensitive customer information in logs.
- Avoid exposing raw MCP responses unnecessarily.
- Protect write operations against accidental duplicate execution.
- Do not commit secrets or database credentials.

The public repository must contain source code and setup instructions, not live credentials.

---

## 15. Deployment and Public Repository

Create a public GitHub repository named:

`CRM`

The application must be hosted and usable without the developer's laptop.

The hosted application must:
- Be accessible through a public URL.
- Work in a private/incognito browser window.
- Display both accounts.
- Retrieve and store information through the MCP.
- Show source-backed account intelligence.
- Process new signals.
- Reflect updates in the frontend automatically.
- Support write-back using `write_note`.

Choose deployment infrastructure that supports persistent storage and the required background synchronization process.

If using a serverless deployment, provide an appropriate scheduled worker mechanism. Do not assume an ordinary serverless HTTP function will remain alive to run a continuous polling loop.

Include:
- README.md
- `.env.example`
- `.gitignore`
- Database migrations.
- Setup instructions.
- Local development instructions.
- Production deployment instructions.
- MCP configuration instructions.
- Architecture overview.

The README must explain how another developer can run the project independently.

---

## 16. Expected Project Structure

Use a structure similar to:

```text
CRM/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── modules/
│   │   │   ├── accounts/
│   │   │   ├── deals/
│   │   │   ├── stakeholders/
│   │   │   ├── actions/
│   │   │   ├── risks/
│   │   │   ├── blindspots/
│   │   │   ├── evidence/
│   │   │   └── activity/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── context/
│   │   └── App.jsx
│   │
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── mcp/
│   │   │   ├── client.js
│   │   │   ├── scheduler.js
│   │   │   └── tools.js
│   │   ├── sync/
│   │   │   ├── worker.js
│   │   │   ├── signalProcessor.js
│   │   │   └── ingestion.js
│   │   ├── analysis/
│   │   │   ├── dealAnalysis.js
│   │   │   ├── stakeholderAnalysis.js
│   │   │   ├── actionRanking.js
│   │   │   ├── riskAnalysis.js
│   │   │   └── gapAnalysis.js
│   │   ├── evidence/
│   │   ├── database/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── app.js
│   │
│   └── package.json
│
├── shared/
├── database/
├── docs/
├── .env.example
├── .gitignore
└── README.md
```

Adapt this structure when needed, but maintain separation of concerns.

---

## 17. Testing and Acceptance Criteria

Do not consider the project complete merely because the dashboard renders.

Validate the following scenarios.

### MCP connectivity
- The backend successfully connects to the provided MCP endpoint.
- Authentication works.
- Both accounts are retrieved.
- The JSON Schema is read and used.
- Account paperwork is retrieved.
- Source records are persisted.
- Error responses are handled correctly.

### Rate limiting
- No two calls are made within the allowed rate-limit interval.
- Calls from all backend processes use the same scheduler.
- Writes are rate-limited.
- Pending operations survive a restart.

### Data correctness
- Both accounts are visible.
- Every important number has an evidence reference.
- Verified and unverified book values are separated.
- No fabricated IDs or contacts exist.
- Missing information is explicitly displayed.
- The five core questions are answered for both accounts.

### Live updates
- The application retrieves new signals.
- Duplicate signals do not create duplicate records.
- Relevant account intelligence is recalculated.
- Updates are broadcast to connected clients.
- The UI changes without a manual page refresh.
- A newly detected event is visible in the activity timeline.

### Write-back
- Users can create notes or next steps.
- Write operations enter the MCP queue.
- The backend invokes `write_note`.
- Success is only shown after MCP confirmation.
- The result is reflected in the application.
- Errors are visible and recoverable.

### Deployment
- The application works from a public URL.
- It works in an incognito browser.
- It does not require the developer's computer.
- The backend has access to its environment variables.
- Database records persist across restarts.

---

## 18. Development Priorities

Build in the following order. Do not spend excessive time on cosmetic elements before the actual data pipeline works.

### Phase 1 — Foundation
- Initialize React and Node.js applications.
- Create the backend MCP client.
- Implement environment-based authentication.
- Implement the global rate limiter.
- Test a successful MCP call.

### Phase 2 — Data ingestion
- Retrieve the JSON Schema.
- Retrieve both accounts.
- Retrieve paperwork for each account.
- Retrieve initial signals and notes.
- Persist original responses.
- Implement database migrations.

### Phase 3 — Evidence and intelligence
- Build evidence extraction.
- Build deal valuation.
- Build stakeholder mapping.
- Build action recommendations.
- Build risk detection.
- Build intelligence-gap analysis.

### Phase 4 — Dashboard
- Build the global overview.
- Build account workspaces.
- Build deal and stakeholder views.
- Build action and risk dashboards.
- Build the evidence viewer.
- Build the activity timeline.

### Phase 5 — Live integration
- Implement the background synchronization worker.
- Process new signals.
- Recalculate affected intelligence.
- Broadcast updates to React.
- Implement the write-back queue.

### Phase 6 — Deployment and verification
- Deploy the frontend and backend.
- Configure the database.
- Configure environment variables.
- Test synchronization.
- Test write-back.
- Test both accounts.
- Test in a private browser window.
- Publish the public GitHub repository.

Do not skip the working MCP integration in favor of building an impressive static UI.

---

## 19. Final Quality Standard

The final product should be something a manager can open on Monday morning and immediately understand.

They should be able to answer:

- How much verified commercial value exists in each account?
- Which deals contribute to that value?
- Where did every amount come from?
- Who controls the commercial and operational decisions?
- Which relationships are vulnerable?
- What are the three most important things to do next?
- Who owns each action?
- Which deadlines are approaching?
- What could go wrong?
- What information is missing?
- Who should be contacted to obtain it?
- Has anything changed since the last review?

The dashboard should make it possible to move from a high-level account summary to the exact source record supporting a claim.

### The most important product principle

**Evidence first. Intelligence second. Recommendations third.**

Never present an unsupported statement as a fact.

Never make the application look more certain than the underlying information.

Never let new MCP information remain invisible in the CRM.

Build a genuinely live, evidence-backed account intelligence system—not just a dashboard displaying customer data.

Start by examining the actual MCP response structures and implementing the server-side integration. Once that works, build the intelligence engine and dashboard around the real retrieved data.