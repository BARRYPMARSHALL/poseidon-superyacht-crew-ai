# Poseidon — Sales Page Design

## Design System

### Palette
```
Navy abyss:   #060d1a  (deepest — hero bg)
Navy dark:    #0a1628  (sections)
Navy mid:     #0f1f3d  (cards)
Navy light:   #152952  (borders, accents)
Gold primary: #c9a84c  (CTAs, headings, highlights)
Gold hover:   #d4b85e  (button hover)
Gold pale:    #e0c870  (subtle highlights)
White:        #f0ede5  (body text — warm white, not sterile)
Slate:        #8b9bb4  (secondary text)
Red alert:    #e05555  (pain points, urgency)
Green safe:   #4ade80  (success, safe harbor)
```

### Typography
```
Headings:   'Crimson Text' or 'Playfair Display' — serif, maritime authority
Body:       'Inter' — clean, readable
Mono:       'JetBrains Mono' — for data, cert codes, technical bits
```

### Visual Language
- **Background texture:** Subtle nautical chart lines (0.03 opacity) on dark sections
- **Dividers:** Thin gold horizontal rules (1px, 30% width, centered)
- **Cards:** Frosted glass effect on dark navy — `bg-navy-mid/80 backdrop-blur border border-navy-light/50`
- **Data displays:** Monospace font, amber/green terminal-style for stats
- **Icons:** Simple emoji or custom nautical line icons — anchor, helm, lighthouse, compass, wave
- **Hero visual:** A silhouette of a superyacht bridge at dawn, with a single glowing screen showing the dashboard. NOT a stock photo of a yacht — that's for charter brochures. This is for the person who drives it.
- **No animations that feel like a tech startup.** Subtle fade-in on scroll. No bouncing, no pulsing CTAs. This audience hates that.

### Tone of Voice
- Direct. Competent. Maritime.
- Not "revolutionary AI platform" → "An extra chief officer who never takes shore leave."
- Not "streamline your workflow" → "Stop tracking 100+ cert expiry dates in a spreadsheet."
- Not "leverage cutting-edge AI" → "The AI scans your crew files every 6 hours and tells you what needs attention."
- Use their language: MLC, STCW, PSCRB, Schengen, port state control, flag state, SEA, rotation, handover.
- Zero startup jargon. Zero "journey." Zero em-dash overuse.
- When you use a nautical metaphor, earn it. "Head to wind" means something. "Chart a course" means something. "Anchors aweigh" is for cruise ship ads.

---

## Page Sections

### SECTION 1: HERO — The 3-Second Close

**Layout:** Full viewport. Dark navy abyss background with subtle chart-line texture. Centered content.

**Visual:** Right side — photograph of a superyacht bridge at twilight, taken from behind the helm. A single screen glows with the Poseidon dashboard (the actual dashboard, not a mockup). The implication: this is the captain's view, alone on the bridge, in control. Left side — the copy.

**Headline (h1, Crimson Text, 4xl, gold):**
> Your Crew. Your Compliance. Your Peace of Mind.
> **Handled.**

**Subhead (Inter, xl, warm-white/80):**
> Poseidon is an AI chief officer that tracks every STCW certificate, MLC requirement, visa expiry, and crew rotation — so you stop doing admin at 10pm and start getting your leave back.

**CTA row:**
- Primary: `[ SEE HOW IT WORKS → ]` — gold bg, navy text, bold, pill shape
- Secondary: `[ Watch a 90-second demo ]` — outline gold, pill shape

**Social proof strip (below CTA, subtle):**
> Trusted by captains on 60m+ vessels | Built with maritime compliance experts | MLC 2006 & STCW compliant

**Scroll indicator:** Subtle downward chevron, gold, slow pulse. "See what you're missing" on hover.

---

### SECTION 2: THE PAIN — Make Them Feel Seen

**Layout:** Dark navy background. Two-column alternating layout. Left text, right visual (or vice versa).

**Section head (centered, small caps, gold, tracked-wide):**
> YOU KNOW THIS FEELING

**Headline (h2, serif, white):**
> It's 10pm. You're on rotation leave. And you're checking a spreadsheet.

**Body (Inter, warm-white/70):**
> You were supposed to be off for two weeks. But Marco's PSCRB expires in 12 days. Sarah's Schengen clock is ticking. The owner wants the monthly ops report by Friday. And you're not sure if the new deckhand's ENG1 medical is actually on file.
>
> 62% of captains work during their leave. You're not alone. But you shouldn't have to be.

**Visual treatment:** Three "pain cards" in a row below, each with a red-tinged dark card:

| The 2AM Thought | The Inspection Dread | The Inbox Abyss |
|---|---|---|
| "Did I miss a cert expiry? If port state control boards tomorrow..." | "MLC audit in 3 days. I need to compile every crew file, every SEA, every cert. That's two days of paperwork." | "Three crew contracts ending this quarter. Three job posts to write. Three rounds of CV screening. Where do I even start?" |

**Each card:** Small icon (⚡🛑📧), the thought as a quote in warm-white, and below it in slate: "Poseidon handles this automatically."

---

### SECTION 3: THE REVEAL — What Changes

**Layout:** Full-width dark section with center headline, then 3-column feature grid.

**Section head (centered, small caps, gold):**
> IMAGINE INSTEAD

**Headline (h2, serif, white, centered):**
> You wake up. You check your phone. One notification.

**Body (centered, warm-white/70, max-w-2xl):**
> *"Good morning, Captain. Cerberus scan complete. 0 expired certifications. 2 expiring in 60+ days — renewal courses booked in Antibes for next month's crew change. Nereus confirms all rotations on schedule. Monthly owner report drafted and ready for review. Enjoy your leave."*

**Three columns below:**

| 🐕 Cerberus | 🌊 Nereus | 📨 Hermes |
|---|---|---|
| **Certification & Compliance** | **Rotation & Scheduling** | **Reporting & Comms** |
| Scans every cert, passport, and visa every 6 hours. Alerts you at 90, 60, 30, 14, 7, and 1 days. Knows STCW dependencies. Auto-books renewal training. Generates MLC 2006 audit reports in seconds. | Tracks every crew rotation. Monitors Schengen 90/180 day rule. Flags returning crew with expiring certs. Optimizes handover scheduling. No more "I thought you had that covered." | Auto-generates monthly owner reports. Creates onboarding checklists for new crew. Manages offboarding. Drafts job posts when crew give notice. Screens incoming CVs. |

**Plus two smaller below:**
> 💰 **Plutus** — Multi-currency payroll, SEA templates, budget vs. actual reporting.
> 🎓 **Mentor** — Career development tracking, retention risk scoring, training recommendations.

---

### SECTION 4: THE COMPARISON — Proof You Need This

**Layout:** Two columns. Left = "Without Poseidon" (red tint). Right = "With Poseidon" (green tint). Dark navy cards.

**Section head (centered, small caps, gold):**
> THE DIFFERENCE

**Comparison table as visual cards, not a boring table:**

| Situation | ❌ Without Poseidon | ✅ With Poseidon |
|---|---|---|
| Cert about to expire | You remember. Maybe. | Cerberus alerted you 90 days ago, booked the course 60 days ago, reminded you yesterday. |
| MLC inspection tomorrow | 2 days of frantic paperwork. Hope nothing's missing. | One click. Findings + recommendations. Audit-ready. |
| Crew member resigns | Weekend writing a job post. Screening CVs manually. | Mentor drafts the JD, screens applicants, schedules interviews. |
| Owner wants monthly report | Sunday evening at your laptop. | Hermes drafted it. You review and send. 5 minutes. |
| Schengen days running low | Crew member tells you when it's too late. | Nereus alerts at 20 days. Rotation adjusted. No overstay. |

**Bottom of section, centered, gold text:**
> *"The AI doesn't replace your judgment. It replaces your remembering."*

---

### SECTION 5: THE BRIDGE — See It Working

**Layout:** Full-width dark section. Dashboard screenshots as the hero.

**Section head (centered, small caps, gold):**
> THE BRIDGE AT A GLANCE

**Headline (h2, serif, white, centered):**
> Everything you need. One screen. Zero searching.

**Screenshot layout:** A large, angled mockup of the actual Poseidon dashboard — the Bridge Overview page. Below it, 4 smaller screenshots in a row showing: Crew Manifest, Certification Tracker, Alert Center, Compliance Report.

**Caption below each:**
- **Bridge** — Vessel status, crew count, cert health, recent agent activity. Your morning briefing.
- **Crew** — Every crew member, every detail. Click to drill down into certs, visas, rotation, onboarding status.
- **Certs** — Color-coded expiry timeline. Filter by 30/60/90 days. Know exactly what needs attention.
- **Compliance** — One-click MLC 2006 and STCW audit reports. AI-written findings and recommendations.

**Device mockups:** Show the same dashboard on a phone — because captains check things on deck, not at a desk. "Bridge on your bridge. Or in your pocket."

---

### SECTION 6: OBJECTIONS — Pre-empt and Destroy

**Layout:** Dark section. Two-column FAQ cards. Each question is gold, answer is warm-white/80.

**Section head (centered, small caps, gold):**
> HONEST ANSWERS

> **"I already have YachtWyse / HelmOps / a spreadsheet. Why switch?"**
> Those tools store your data. Poseidon acts on it. Your spreadsheet won't tell you Marco's PSCRB expires in 7 days. Poseidon will — and it'll suggest where to renew it based on where the vessel is.

> **"Is my crew's data secure?"**
> Encrypted at rest. Your data stays on your instance. We never access it, share it, or train on it. This isn't a SaaS — it's your crew management system. You control it.

> **"What if I have unreliable internet at sea?"**
> Poseidon is a Progressive Web App. It works offline. Syncs when you're back in range. The agents run on your schedule, not ours.

> **"I'm not technical. Can I actually use this?"**
> If you can use WhatsApp and check your email, you can use Poseidon. We built it with captains, not developers. Plus: we'll onboard your entire crew data for you.

> **"How long does setup take?"**
> Send us your crew spreadsheet. We'll have you live within 48 hours. Most captains are fully operational in under 2 hours of their own time.

> **"What happens if it makes a mistake?"**
> Poseidon drafts. You approve. It never auto-submits to authorities. It never books a course without your confirmation. It's a chief officer, not a captain. You're still in command.

> **"What does it cost compared to crew agency fees or one detention?"**
> A single port state detention costs $15,000-50,000 in delays and fines. Recruiting one crew member through an agency costs 1-2 months' salary (€3,000-10,000). Poseidon costs less than a deckhand's monthly salary — and works 24/7/365.

---

### SECTION 7: PRICING — Simple, Confident

**Layout:** Dark navy cards in a 3-column grid. Center column slightly elevated (recommended).

**Section head (centered, small caps, gold):**
> INVESTMENT

**Headline (h2, serif, white, centered):**
> Less than a deckhand. More reliable than a purser.

| | Skipper | Captain ⭐ | Fleet |
|---|---|---|---|
| **Price** | €499/mo | €799/mo | Custom |
| **Vessels** | 1 | 1 | Unlimited |
| **Crew** | Up to 15 | Up to 30 | Unlimited |
| **Agents** | Cerberus + Nereus | All 5 agents | All + white-label |
| **Reports** | Basic alerts | Full compliance + owner reports | Fleet analytics |
| **Support** | Email | Priority email | Dedicated + SLA |
| | `[ START FREE TRIAL ]` | `[ START FREE TRIAL ]` | `[ BOOK A CALL ]` |

**Below pricing cards, centered:**
- "30-day free trial. No credit card. Cancel anytime."
- "Annual billing: save 15% (€679/mo on Captain)"
- "Volume discount for management companies with 3+ vessels"

---

### SECTION 8: SOCIAL PROOF — The Credibility Close

**Layout:** Dark section. Testimonial cards in a 2-column grid.

**Section head (centered, small caps, gold):**
> FROM THE BRIDGE

**Testimonial cards (placeholder — replace with real captain quotes after beta):**

> *"I used to spend Sundays doing owner reports. Now Hermes drafts them and I review in 10 minutes. That's 4 hours of my weekend back, every month."*
> — **Captain R.M.**, 72m Motor Yacht, Mediterranean

> *"Cerberus caught an expired STCW that would have got us detained in Palma. The alert came 30 days before. We rebooked the crew change and renewed it. That one catch paid for Poseidon for two years."*
> — **Captain A.K.**, 58m Sailing Yacht, Caribbean

> *"I was skeptical about 'AI' for crew management. But it's not AI in the startup sense. It's a system that knows maritime compliance and does the checking so I don't have to. That's not hype. That's helpful."*
> — **Chief Officer S.L.**, 65m Motor Yacht, Asia-Pacific

**Trust strip below testimonials:**
- Logo placeholders: "As featured in" — SuperyachtNews, The Islander, YachtCharterFleet, BOAT International (add when real)
- "Built in consultation with active superyacht captains and maritime compliance specialists"

---

### SECTION 9: THE FINAL CLOSE — The Only Question That Matters

**Layout:** Full-viewport dark navy abyss section. Centered. Minimal. Powerful.

**Headline (h1, serif, gold, massive):**
> You didn't become a captain
> to spend your leave doing paperwork.

**Subhead (Inter, xl, warm-white/60):**
> Try Poseidon free for 30 days. If it doesn't save you 20 hours of admin in the first month, you don't pay.

**CTA button (large, gold bg, navy text, bold):**
> `[ START YOUR FREE TRIAL → ]`

**Micro-copy below CTA:**
> No credit card. Setup in 48 hours. Cancel anytime. Built by people who know port from starboard.

**Footer strip:**
> ⚓ Poseidon — Superyacht Crew AI | poseidon.ai | captain@poseidon.ai
> © 2026 Poseidon Maritime Technologies. All rights reserved.

---

## Conversion Mechanics

### The Hook Sequence
1. **Hero (0-3 seconds):** "Handled." — one word that promises relief
2. **Pain (3-15 seconds):** The 10pm spreadsheet. They've been there. They're nodding.
3. **Solution (15-30 seconds):** The morning notification. This is what changes.
4. **Proof (30-60 seconds):** The comparison table. The dashboard screenshots. The real scenarios.
5. **Close (60-90 seconds):** The final question. The free trial.

### Trust Builders Throughout
- Maritime terminology used correctly (not cosplaying)
- Specific certification names (PSCRB, ENG1, STCW BST — not "safety certificates")
- Real compliance frameworks (MLC 2006, ISM, port state control)
- 62% stat (from Quay Group Captain Survey — credible source)
- Captain testimonials with vessel sizes and cruising grounds

### Conversion Triggers
- **Loss aversion:** "A single port state detention costs $15,000-50,000"
- **Time reclamation:** "20 hours of admin back in your first month"
- **Social proof:** Real captain quotes, vessel sizes, cruising regions
- **Risk reversal:** 30-day free trial, no credit card
- **Specificity:** Not "we track certifications" — "Cerberus scans every 6 hours, alerts at 90/60/30/14/7/1 days"
- **Identity reinforcement:** You're the captain. You're in command. We're your chief officer — helpful, competent, never overstepping.

### What This Page Deliberately Avoids
- ❌ "Revolutionary AI platform" — they've heard it
- ❌ "Disrupting the maritime industry" — they don't want disruption, they want reliability
- ❌ Stock photos of smiling people on yachts — this is for the person working, not the guest
- ❌ Pricing that ends in .99 — this is B2B, act like it
- ❌ Animated counters, confetti, urgency timers — this audience is immune to dark patterns
- ❌ "Schedule a demo" as the only CTA — captains don't book demos, they try things

---

## Mobile Considerations

- The page must work on a phone — captains read on deck, in crew mess, between jobs
- Stack all columns vertically on mobile
- CTA buttons full-width on mobile
- Dashboard screenshots: show the mobile PWA version on small screens
- Keep the hero copy short enough to read without scrolling on iPhone SE
- The "pain" section is especially important on mobile — it's the scroll-stopper

---

## Technical Notes (For When We Build)

- Static site, no React needed for the sales page itself (separate from the app)
- Could use Astro or plain HTML + Tailwind for maximum speed
- Lighthouse score target: 95+ (captains may be on slow marina WiFi or satellite)
- No heavy JS. One exception: the pricing toggle (monthly/annual) can be a tiny Alpine.js or vanilla JS component
- Images: WebP, lazy loaded, responsive srcset
- The dashboard screenshots should be actual screenshots of the Poseidon app, not mockups — authenticity matters
- Contact form: just email + message. No phone required. Captains prefer email.
- Analytics: Plausible or Fathom (privacy-first, no cookie consent needed)
