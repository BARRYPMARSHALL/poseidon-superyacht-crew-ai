# Superyacht Crew AI — Complete Project Specification

**Codename:** Poseidon
**Date:** 2026-05-26
**Status:** Pre-build (specification phase)

---

## 1. Executive Summary

### 1.1 What It Is
An autonomous AI agent platform that replaces the spreadsheet-and-WhatsApp chaos of superyacht crew management. It proactively tracks certifications, manages compliance, handles payroll, schedules rotations, and communicates with owners — without being asked.

### 1.2 The One-Liner
"An AI chief officer that never takes shore leave."

### 1.3 Why Now
- Global superyacht fleet: **6,174 vessels >30m** (6,700+ including 24-30m)
- 1,093 yachts currently in build, average 184 delivered annually
- Market: $21.6B (2025) → $45.16B by 2032 (11.1% CAGR)
- Every vessel has 10-30 crew, each with 6-8 certificates
- **62% of captains work during their leave periods** — they're drowning in admin
- Existing "solutions" are SaaS databases from 2015, not autonomous AI agents
- Zero true AI competitors in this niche

---

## 2. Market Analysis

### 2.1 Total Addressable Market

| Segment | Count | Annual OpEx/Vessel | Willingness to Pay |
|---|---|---|---|
| Superyachts 80m+ | ~185 | $15-50M | $1,499-2,999/mo |
| Superyachts 50-80m | ~800 | $5-15M | $799-1,499/mo |
| Superyachts 30-50m | ~5,200 | $1-5M | $499-799/mo |
| Yachts 24-30m | ~3,000 | $500K-1M | $299-499/mo |
| Charter fleets (management cos) | ~200 companies | N/A | $1,999-4,999/mo |

**TAM:** ~9,200 vessels + 200 management companies
**SAM (initial):** 30-80m segment (~6,000 vessels) = $3.6B annual addressable
**SOM (Year 1 target):** 50 vessels = $25-50K MRR

### 2.2 Geographic Concentration

| Region | % of Fleet | Key Hubs |
|---|---|---|
| Mediterranean (summer) | 45% | Monaco, Antibes, Palma, San Remo |
| Caribbean (winter) | 25% | Fort Lauderdale, Antigua, St. Maarten |
| Americas (year-round) | 15% | Florida, Bahamas, California |
| Asia-Pacific (growing) | 10% | Singapore, Sydney, Gold Coast, Hobart |
| Middle East | 5% | Dubai, Abu Dhabi |

### 2.3 The Captain Pain Index

From Quay Group Captain Survey 2025/26 (367 captains surveyed):
- **62%** work during rotational leave
- Only **28%** completely switch off
- **16%** work "very frequently" (several times/week) during leave
- **25%** neutral or dissatisfied in role
- Top challenges: excessive yacht usage, tight budgets, **crew turnover**, unrealistic owner expectations
- 53% get annual pay rises but only 13% have them contracted

**The admin burden per vessel (60m, 15 crew):**
- 100+ certificate expiry dates to track
- Schengen visa tracking (90/180 day rule)
- Rotation scheduling every 6-8 weeks
- Multi-currency payroll for crew from multiple countries
- MLC 2006 compliance documentation
- ISM/flag state compliance reporting
- Owner monthly reporting
- Port clearance paperwork
- Training course booking
- Crew recruitment when turnover hits

**Estimated time spent:** 10-15 hours/week on admin for captains, 5-10 for pursers/chief officers.

### 2.4 Competitive Landscape

| Platform | Type | Pricing | AI? | Crew Cert Tracking | MLC Compliance | Auto-Scheduling | Recruitment |
|---|---|---|---|---|---|---|---|
| **YachtWyse** | SaaS | $99-999/mo | Partial (50 queries) | ❌ | ❌ | ❌ | ❌ |
| **Yacht-OS** | SaaS | Custom quote | Partial | ✅ | ✅ | ✅ | ❌ |
| **HelmOps** | SaaS | Custom quote | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Seahub** | SaaS | ~$1,050/yr/vessel | ❌ | ❌ | ❌ | ❌ | ❌ |
| **VeroYacht** | SaaS | Custom quote | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Scyllastar** | SaaS | Unknown | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Sealogic** | SaaS | Unknown | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Spreadsheets** | Manual | Free | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Poseidon (us)** | AI Agent | $499-1,499/mo | ✅ Full | ✅ Proactive | ✅ Proactive | ✅ Autonomous | ✅ AI Screening |

**Key insight:** Every competitor is a database you fill in. Poseidon is an agent that **acts on your behalf.** It doesn't wait to be told what to do — it monitors, alerts, schedules, books, and drafts.

---

## 3. Product Specification

### 3.1 Core Agents

#### Agent 1: Cerberus — Certification & Compliance
**The most critical agent. This alone is worth $499/mo.**

Capabilities:
- Maintains digital record of every crew member's certifications
- Tracks all STCW certificates (Basic Safety Training, PSSR, PST, Fire Fighting, Medical First Aid, Survival Craft, Advanced Fire Fighting, GMDSS, Dynamic Positioning, etc.)
- Tracks flag state endorsements and their dependencies
- Tracks ENG1 medical certificates
- Tracks visa expiries (Schengen, US B1/B2, Caribbean, etc.)
- Sends proactive alerts at 90, 60, 30, 14, 7, 1 days before expiry
- Recommends renewal pathways (combines refresher courses to minimize time away)
- **Auto-books training courses** at providers near vessel location
- Understands certificate dependencies (BST expiry cascades to all dependent quals)
- Generates MLC 2006 compliance reports for port state control inspections
- Generates ISM compliance documentation
- Maintains audit-ready digital records

**Data model:**
```
CrewMember {
  id, name, nationality, dateOfBirth, passportNumber, passportExpiry,
  position, joinDate, contractEnd, salary, currency, bankDetails,
  emergencyContact, nextOfKin
}

Certification {
  crewMemberId, certType, certNumber, issueDate, expiryDate,
  issuingAuthority, flagState, requiresRevalidation, revalidationWindow,
  digitalCopy (S3 URL), notes
}

CertDependency {
  parentCert, childCert, dependencyType  // BST → PSSR, PST, Fire Fighting
}

VisaRecord {
  crewMemberId, visaType, number, issueDate, expiryDate,
  issuingCountry, daysUsed, daysRemaining, schengenClock
}
```

#### Agent 2: Nereus — Rotation & Scheduling
**Handles the logistics puzzle of crew rotation.**

Capabilities:
- Maintains rotation calendar for entire crew
- Optimizes rotation schedule considering:
  - Schengen 90/180 day limitations
  - US B1/B2 requirements
  - MLC minimum rest period compliance
  - Crew home country flight logistics
  - Handover/knowledge transfer periods
  - Charter schedule and owner trip requirements
  - Budget constraints on flights
- Generates alternative plans when disruptions occur (crew illness, flight cancellations)
- Tracks rotation costs and suggests optimizations
- Integrates with flight booking APIs (Skyscanner, Google Flights)
- Sends automated rotation reminders to crew

#### Agent 3: Plutus — Payroll & Finance
**Multi-currency crew payroll with compliance.**

Capabilities:
- Multi-currency payroll (EUR, USD, GBP, AUD, etc.)
- Flag state tax withholding calculations
- MLC-compliant payslip generation
- Seafarer Employment Agreement (SEA) template management
- Automatic payroll calculation based on rotation schedule
- Expense tracking and categorization
- Budget vs actual reporting for owners
- APA (Advance Provisioning Allowance) tracking for charter yachts
- Integration with yacht accounting software (where APIs exist)
- VAT reclaim tracking (France, Italy, Spain)

#### Agent 4: Hermes — Communication & Reporting
**The voice of the vessel to owners, crew, and shore.**

Capabilities:
- Monthly owner report generation (ops summary, budget, maintenance, crew changes, itinerary)
- Automated crew onboarding documentation package
- Automated crew offboarding (exit checklist, final payslip, reference)
- Emergency contact management and broadcast
- Port clearance document preparation
- Supplier/vendor communication management
- Charter guest preference documentation
- Daily operations log summarization
- Anomaly detection and flagging ("Fuel consumption 22% above baseline — possible hull fouling?")

#### Agent 5: Mentor — Crew Development & Recruitment
**Manages the human capital lifecycle.**

Capabilities:
- Tracks crew career development goals
- Recommends training for promotion pathways
- When crew member gives notice, auto-drafts job description
- Posts to crew recruitment platforms (Yotspot, YachtCrew, agencies)
- AI screening of CVs against position requirements
- Interview scheduling
- Reference verification tracking
- Performance review scheduling and documentation
- Crew retention risk scoring (identifies flight risks before they quit)

### 3.2 User Interfaces

#### Captain's Dashboard (Web App)
- Single-page overview: crew status, upcoming expiries, rotation calendar, budget burn rate
- Drill-down into any crew member, certification, or financial metric
- Approval workflow for agent actions (configurable — fully autonomous or captain-approve)
- Dark mode, mobile-responsive, offline-capable PWA

#### Crew Mobile App
- View own certifications and expiry dates
- Receive rotation reminders and travel documents
- Submit expense claims
- View payslips
- Task management and checklists
- Emergency contact directory

#### Owner Portal (Read-Only)
- Monthly operational summary
- Budget vs actual
- Crew overview (names, positions, tenure)
- Itinerary tracking
- Photo/media gallery from voyages

#### Shore Support (Agency/Management Company)
- Multi-vessel fleet dashboard
- Cross-vessel crew rotation visibility
- Fleet analytics: turnover rates, payroll benchmarks, certification gaps
- Bulk compliance reporting

### 3.3 Key Integrations

| Integration | Priority | Purpose |
|---|---|---|
| AIS/Vessel tracking (MarineTraffic API) | P1 | Vessel location for training provider proximity |
| Flight booking (Skyscanner/Google Flights API) | P1 | Rotation travel booking |
| Weather (OpenWeather Marine) | P2 | Port/weather alerts for captain |
| Yotspot / YachtCrew | P1 | Crew recruitment posting |
| Xero / QuickBooks | P2 | Accounting sync |
| WhatsApp / Signal | P3 | Crew messaging integration |
| Email (IMAP/SMTP) | P1 | All communications |
| SMS (Twilio) | P1 | Urgent alerts |
| Stripe | P1 | Billing |

---

## 4. Technical Architecture

### 4.1 Stack

| Layer | Technology |
|---|---|
| Frontend (Dashboard) | React 19 + Tailwind CSS + PWA |
| Frontend (Mobile) | React Native or PWA (mobile web) |
| Backend API | Node.js (Express) + TypeScript |
| Agent Runtime | OpenClaw sub-agents + cron orchestration |
| Database | PostgreSQL (primary) + Redis (cache/queues) |
| File Storage | S3-compatible (DigitalOcean Spaces or AWS S3) |
| Auth | Clerk or Auth0 (multi-tenant, RBAC) |
| Email | SendGrid or SES |
| SMS | Twilio |
| Hosting | Railway / Fly.io / VPS |
| Monitoring | Sentry + OpenClaw healthcheck |
| CI/CD | GitHub Actions |

### 4.2 Multi-Tenant Architecture

```
Organization (Management Company or Individual Vessel)
├── Vessel 1
│   ├── Crew Members
│   ├── Certifications
│   ├── Rotations
│   ├── Payroll Records
│   └── Documents
├── Vessel 2 (etc.)
└── Fleet Analytics (aggregated)
```

Each vessel has isolated data. Management companies see all vessels. Owners see their vessels only. Crew see their own data only.

### 4.3 Agent Architecture

OpenClaw serves as the agent runtime:
- Each of the 5 agents is a sub-agent or cron job
- Agents run on schedules (hourly, daily, weekly) and on triggers (new crew member, certification expiring, etc.)
- Captain approves or overrides agent actions via dashboard
- Learning loop: captain corrections feed back into agent behavior

```
┌─────────────────────────────────────────────┐
│              Poseidon Core API               │
│  (Express + PostgreSQL + Redis)              │
├─────────────────────────────────────────────┤
│  Agent Scheduler (OpenClaw Cron)             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│  │ Cerberus│ │ Nereus  │ │ Plutus  │  ...   │
│  │ (certs) │ │(rotation)│ │(payroll)│        │
│  └─────────┘ └─────────┘ └─────────┘        │
├─────────────────────────────────────────────┤
│  Integration Layer                           │
│  (Email, SMS, Flight APIs, Recruitment APIs) │
├─────────────────────────────────────────────┤
│  Web Dashboard + PWA + Owner Portal          │
└─────────────────────────────────────────────┘
```

---

## 5. Build Plan — 12 Weeks to MVP

### Phase 0: Customer Discovery (Week 0 — This Week)
**DO THIS BEFORE WRITING CODE**

- [ ] Walk Constitution Dock, Sandy Bay, Royal Yacht Club of Tasmania
- [ ] Interview 5 captains: "What's the thing you dread most about crew admin?"
- [ ] Document every answer verbatim
- [ ] Ask: "What would you pay for a tool that handled this automatically?"
- [ ] Ask: "What's the worst thing that's happened because of an admin error?"
- [ ] Refine spec based on real feedback

### Phase 1: Foundation (Week 1-2)

| Day | Task | Output |
|---|---|---|
| 1-2 | Project scaffold: Express API, PostgreSQL schema, auth | Working API with user auth |
| 3-4 | Multi-tenant data model: organizations, vessels, crew | DB schema for all entities |
| 5-6 | Captain dashboard shell (React + Tailwind + PWA) | Login → see empty dashboard |
| 7-8 | Crew member CRUD (manual entry + CSV import) | Add crew, upload certificates |
| 9-10 | Certificate data model + expiry tracking | Store certs with expiry dates |
| 11-12 | Basic Cerberus agent: scans certs daily, sends email alerts at 90/60/30 | First AI agent running |
| 13-14 | Polish, test, deploy to staging | Working staging environment |

**Milestone:** Captain can add crew, upload certifications, and receive automated expiry alerts. This alone is a sellable product.

### Phase 2: Smart Agent (Week 3-4)

| Day | Task |
|---|---|
| 15-16 | Cerberus smart recommendations: understands cert dependencies, suggests renewal pathways |
| 17-18 | Training provider database + auto-booking logic |
| 19-20 | MLC compliance report generation |
| 21-22 | Nereus rotation calendar MVP (manual rotation entry, conflict detection) |
| 23-24 | Schengen/visa tracking and alerts |
| 25-26 | Nereus auto-scheduling (first version — suggests rotations based on constraints) |
| 27-28 | Crew mobile PWA (view own certs, rotation, payslips) |

**Milestone:** Cerberus proactively manages certs. Nereus suggests rotations. Crew have mobile app.

### Phase 3: Full Stack (Week 5-6)

| Day | Task |
|---|---|
| 29-30 | Plutus payroll engine: multi-currency, flag state tax, SEA templates |
| 31-32 | Plutus expense tracking + budget vs actual |
| 33-34 | Hermes owner report generator (monthly ops summary) |
| 35-36 | Hermes crew onboarding/offboarding workflows |
| 37-38 | Mentor recruitment module: JD drafting, CV screening |
| 39-40 | Integration sprints: email, SMS, Stripe billing |
| 41-42 | Integration: AIS/MarineTraffic (vessel location) |

**Milestone:** All 5 agents operational. Full crew management lifecycle covered.

### Phase 4: Fleet & Polish (Week 7-8)

| Day | Task |
|---|---|
| 43-44 | Management company fleet dashboard |
| 45-46 | Owner read-only portal |
| 47-48 | Fleet analytics: turnover rates, payroll benchmarks, cert gaps |
| 49-50 | Offline-capable PWA (service worker, local storage sync) |
| 51-52 | Performance optimization, security audit, penetration testing |
| 53-54 | Documentation (help center, API docs) |
| 55-56 | Onboarding wizard for new vessels |

**Milestone:** Multi-vessel ready. Owner portal live. Production hardened.

### Phase 5: Beta Launch (Week 9-10)

| Day | Task |
|---|---|
| 57-60 | Recruit 5 beta captains (free for 3 months) |
| 61-64 | Onboard beta users, migrate their spreadsheet data |
| 65-68 | Daily check-ins with beta users, bug fixes, feature requests |
| 69-70 | Iterate based on feedback |

**Milestone:** 5 active beta vessels. Real usage data.

### Phase 6: Commercial Launch (Week 11-12)

| Day | Task |
|---|---|
| 71-73 | Pricing page, Stripe integration, free trial flow |
| 74-76 | Landing page with captain testimonials |
| 77-78 | Marketing content: blog posts, LinkedIn, yacht media outreach |
| 79-80 | Launch announcement on The Islander, SuperyachtNews, LinkedIn |
| 81-84 | Direct outreach to 100 captains via LinkedIn + email |

**Milestone:** Paying customers.

---

## 6. Pricing Strategy

### 6.1 Tiered Pricing

| Tier | Price | Vessels | Crew Limit | Features |
|---|---|---|---|---|
| **Skipper** | $499/mo | 1 | Up to 15 | Cerberus cert tracking, basic rotation, email alerts, crew mobile app |
| **Captain** | $799/mo | 1 | Up to 30 | + Nereus auto-scheduling, Plutus payroll, Hermes reporting, MLC compliance |
| **Fleet** | $1,499/mo | Up to 5 | Unlimited | + Mentor recruitment, fleet analytics, owner portal, API access |
| **Enterprise** | Custom | Unlimited | Unlimited | + White-label, dedicated support, custom integrations, SLA |

**Annual discount:** 15% (e.g., Captain tier: $799/mo → ~$679/mo annual)

### 6.2 Pricing Rationale
- A captain on a 60m yacht earns €12-18K/month. Saving them 10 hours/week at that rate = €3,000-4,500/month in recovered time.
- $799/mo is a 4-6x ROI for the captain alone. Before considering: avoided detention risk from expired certs, optimized flight costs, reduced crew turnover.
- Compared to crew agency fees: recruiting one crew member costs 1-2 months salary ($3-10K). Our recruitment module pays for itself with one successful hire.

### 6.3 Revenue Model (Year 1 Projections)

| Month | Vessels | Avg $/Vessel | MRR |
|---|---|---|---|
| 1 | 0 (beta) | $0 | $0 |
| 2 | 5 (beta) | $0 | $0 |
| 3 | 10 | $699 | $6,990 |
| 4 | 18 | $699 | $12,582 |
| 5 | 25 | $699 | $17,475 |
| 6 | 35 | $749 | $26,215 |
| 7 | 45 | $749 | $33,705 |
| 8 | 55 | $749 | $41,195 |
| 9 | 65 | $799 | $51,935 |
| 10 | 75 | $799 | $59,925 |
| 11 | 85 | $799 | $67,915 |
| 12 | 100 | $799 | $79,900 |

**Year 1 ARR target:** ~$960K annualized by month 12 ($80K MRR)

---

## 7. Marketing & Go-To-Market

### 7.1 Brand Identity

- **Name:** Poseidon (working title — may change)
- **Positioning:** "The AI Chief Officer for Superyachts"
- **Tone:** Professional maritime, not startup-bro. Trusted first mate, not Silicon Valley disruptor.
- **Visual:** Dark navy + gold + white. Nautical but modern. Not cheesy anchors.

### 7.2 Distribution Channels

#### Primary: Direct Captain Outreach
- LinkedIn search: "superyacht captain" → ~3,000+ results
- Personalized outreach: "I know captains spend 10+ hours/week on crew admin. We've built an AI that handles STCW tracking, rotation scheduling, and MLC compliance automatically. Would you be open to a 15-minute demo?"
- Target: 20 captains/week, expect 5-10% demo rate → 5-10 demos/month

#### Secondary: Yacht Crew Agencies
- Partnership with Wilsonhalligan, Faststream, Quay Group, Yotspot
- They place crew → they care about qualified, compliant crew
- Offer: white-label certification tracking for their placed crew, upsell to full Poseidon
- Revenue share: 15-20% of referred subscriptions

#### Tertiary: Industry Events

| Event | Date | Location | Strategy |
|---|---|---|---|
| MYBA Charter Show | Apr 27-30 | San Remo, Italy | Walk the docks, talk to captains |
| Palma Boat Show | Apr 29-May 2 | Palma, Mallorca | Exhibit if budget allows |
| Monaco Yacht Show | Sep 23-26 | Monaco | The big one. Exhibit or attend. |
| FLIBS | Late Oct/early Nov | Fort Lauderdale | Strong US Caribbean presence |
| Metstrade | Nov | Amsterdam | Equipment/tech focus, B2B |
| Superyacht Design Festival | Feb 1-3 | Kitzbühel | Network with decision-makers |

#### Quaternary: Content & Community
- Guest posts on The Islander, SuperyachtNews, YachtCharterFleet
- LinkedIn content: "What I learned from 50 superyacht captain interviews about crew admin"
- Free tool: "STCW Expiry Calculator" — lead magnet for email capture
- Case studies from beta captains (anonymized if needed)
- Podcast appearances: Onboard with Captain, Yacht Cruiser

### 7.3 Launch Sequence

1. **Pre-launch (Weeks 1-8):** Build in public. LinkedIn posts about progress. Captain interviews.
2. **Beta (Weeks 9-10):** 5 captains using free. Collect testimonials, bug reports, feature requests.
3. **Soft launch (Week 11):** Open to waitlist. 20% lifetime discount for first 20 customers.
4. **Hard launch (Week 12):** PR push. Yacht media. Full pricing. Paid acquisition begins.

### 7.4 Competitive Positioning

| | Existing Tools | Poseidon |
|---|---|---|
| **What they are** | Digital filing cabinets | Autonomous crew manager |
| **How they work** | You enter data, they store it | It monitors, alerts, schedules, books, drafts |
| **Certification tracking** | Manual entry → manual checks | Auto-detects expiries → books renewal training |
| **MLC compliance** | Template documents | Proactive monitoring + audit-ready reports |
| **Rotation planning** | Calendar tool | Constraint-optimized auto-scheduling |
| **Owner reporting** | You write it | Auto-generated monthly ops summary |
| **Recruitment** | Not included | JD drafting + CV screening + interview scheduling |

**One-line positioning vs each competitor:**
- vs YachtWyse: "They store your data. We act on it."
- vs Yacht-OS: "They give you tools. We give you a chief officer."
- vs Spreadsheets: "When was the last time your spreadsheet booked a training course?"

---

## 8. Financial Model

### 8.1 Costs (Monthly Run Rate)

| Item | Monthly Cost |
|---|---|
| Hosting (Railway/VPS) | $50-100 |
| Database (PostgreSQL) | $30-100 |
| Email (SendGrid) | $20-50 |
| SMS (Twilio) | $20-50 |
| AI/LLM API costs (OpenClaw runtime) | $100-500 |
| Domain + SSL | $10 |
| Monitoring (Sentry) | $30 |
| **Total infra** | **$260-840/mo** |

### 8.2 Unit Economics (at 50 vessels, Captain tier)

| Metric | Value |
|---|---|
| Average revenue per vessel | $749/mo |
| Cost per vessel (infra) | ~$15/mo |
| Gross margin | **98%** |
| Customer acquisition cost (direct outreach) | ~$200 |
| Payback period | <1 month |
| LTV (24-month avg retention) | ~$18,000 |
| LTV:CAC ratio | 90:1 |

### 8.3 Capital Requirements
- **Bootstrappable:** Yes. No external funding required.
- Barry's existing infrastructure (OpenClaw, server) handles the agent runtime.
- Main costs are time + cloud hosting + event attendance (Monaco Yacht Show ~€5-15K to exhibit).

---

## 9. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| **Captains won't adopt new tech** | Medium | High | Customer discovery first. Build what they actually want. Free beta period. |
| **Crew data privacy/SAR concerns** | Low | High | SOC 2 compliance path. Encryption at rest. Data processing agreements. |
| **LLM hallucination in compliance docs** | Medium | High | Agent drafts, captain approves. Never auto-submit to authorities. |
| **Competitor (Yacht-OS) adds AI** | Medium | Medium | Move fast. Build moat through data network effects. |
| **Niche too small** | Low | Medium | TAM is 9,200+ vessels. 100 vessels = $960K ARR. Very viable. |
| **Captain turnover breaks retention** | Medium | Medium | Sell to management companies too. Vessel-level stickiness > individual captain. |
| **Offline capability at sea** | Low | Medium | PWA with offline-first architecture. Sync when in port. |
| **Regulatory changes (STCW, MLC)** | Low | Low | Agent architecture makes updates fast. Actually a feature — we update faster than captains read marine notices. |

---

## 10. Success Metrics

### 10.1 North Star Metric
**Hours of captain admin time saved per vessel per month.**

Target: 40+ hours/month (validated by captain self-report and agent activity logs).

### 10.2 KPIs

| Metric | 3-Month Target | 6-Month Target | 12-Month Target |
|---|---|---|---|
| Paying vessels | 10 | 35 | 100 |
| MRR | $7,000 | $26,000 | $80,000 |
| Avg time-to-onboard | <3 days | <2 days | <1 day |
| Monthly churn | <5% | <3% | <2% |
| NPS | 30+ | 40+ | 50+ |
| Cert expiries caught before deadline | 95%+ | 98%+ | 99%+ |
| Captain demo-to-close rate | 20% | 25% | 30% |

---

## 11. Immediate Next Steps (This Week)

1. **Customer discovery (Barry):** Visit Constitution Dock, RYCT. Talk to 3-5 captains. Record everything.
2. **Domain + brand:** Register domain. Decide on final name (Poseidon or alternative).
3. **Scaffold project:** Initialize repo, set up Express + PostgreSQL boilerplate.
4. **Build cert tracker MVP:** The simplest version that stores certs and sends expiry emails. Ship in 3 days.
5. **Show it to a captain:** Get 1 person to use it. That one person will tell you what to build next.

---

## Appendix A: Captain Interview Questions

1. How many crew on your current vessel?
2. How do you currently track certifications and expiries?
3. What's the worst thing that's happened because something expired or was missed?
4. How many hours/week do you spend on crew admin?
5. What happens when a crew member gives notice? Walk me through it.
6. How do you handle crew rotation scheduling?
7. What do you report to the owner each month?
8. If you had a magic wand, what admin task would you make disappear?
9. What software do you currently use for vessel management?
10. What would you pay for something that handled all of this automatically?

## Appendix B: Competitive Intelligence Deep-Dive

See `/competitor-analysis.md` (to be created after Phase 0 discovery).

## Appendix C: Regulatory Reference

- STCW Convention (International Convention on Standards of Training, Certification and Watchkeeping for Seafarers)
- MLC 2006 (Maritime Labour Convention)
- ISM Code (International Safety Management)
- MARPOL (International Convention for the Prevention of Pollution from Ships)
- Flag state requirements (Cayman Islands, Marshall Islands, Malta, etc.)
- Port state control regimes (Paris MoU, Tokyo MoU, USCG)

---

**Document version:** 1.0
**Next review:** After Phase 0 customer discovery interviews
