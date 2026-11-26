# POET — DONG HANH / PARTNERSHIP BENEFITS REDESIGN BRIEF

> **Use this file as the persistent project brief for Codex.** Read it before touching the partnership-benefit sections. This is a targeted redesign of two sections on the existing POET website, not a redesign of the entire website.
>
> Last prepared: 25 November 2026
>
> Live page: https://www.poetnpo.site/dong-hanh/
>
> Existing anchors: `#nha-tai-tro` and `#thuong-hieu`

---

## 1. Project goal

Redesign the complete **quyền lợi** presentation for both partner types on the existing POET website:

1. **FUND FOR FUN** — nhà tài trợ thuần.
2. **BIG JOY LITTLE JOY** — thương hiệu đồng hành / Little Joy.

The result must feel like a considered, human-directed design system for POET, not a generic AI-generated sponsorship page. The two sections should share a visual language and interaction quality, but must not be forced into the same information architecture: their package structures and decision tasks are materially different.

### User-facing jobs to support

- A prospective sponsor can quickly understand the three FUND FOR FUN packages, the contribution thresholds, and the exact benefits included in each tier.
- A prospective Little Joy brand can identify its contribution level among 10 levels and understand what it receives before, during, and after the campaign.
- A visitor can compare benefits without decoding dense prose, scrolling through repetitive cards, or guessing what a dash / blank cell means.
- The content remains accurate, transparent, readable on mobile, and easy for POET to update later.

### Out of scope

- Do not redesign the whole website, header, navigation, hero, donation flow, payment system, project pages, or unrelated sections.
- Do not change fundraising targets, donation/account logic, forms, contact destinations, CTA destinations, or any existing tracking behavior.
- Do not rename or restructure unrelated routes.
- Do not invent new sponsor benefits, add unapproved promises, or rewrite legal/operational commitments to sound more impressive.

---

## 2. Existing website and visual baseline

### Page references

- Live page: https://www.poetnpo.site/dong-hanh/
- Sponsor section: `https://www.poetnpo.site/dong-hanh/#nha-tai-tro`
- Brand section: `https://www.poetnpo.site/dong-hanh/#thuong-hieu`

The supplied screenshots are the current visual baseline. They show the existing POET header, page frame, warm off-white background, pastel brand accents, and the two different benefit experiences.

### Current FUND FOR FUN section

The screenshot at `#nha-tai-tro` shows the sponsor-needs summary followed by a section titled **“Bắt đầu như thế nào?”** with a three-step horizontal process. That process is the area to be replaced by the new FUND FOR FUN benefit presentation. Preserve the surrounding sponsor-needs / budget content and any working link to the season plan unless code inspection proves a change is necessary.

### Current BIG JOY LITTLE JOY section

The screenshot at `#thuong-hieu` shows a three-phase presentation with benefit lists, repeated flower bullets, “Mới” markers, summary metrics (e.g. booth space and event tickets), and “Xem thêm” disclosure rows. This is the area to redesign. Do not simply change the text and keep the same layout if the audit finds that the current structure makes 10 tiers and many benefits hard to scan.

### Existing brand signals to preserve

- POET logo and its multicolour identity.
- The current warm, approachable, youth-led nonprofit character.
- Existing restrained coral / yellow / blue / green accents, where they are already part of the site's design system.
- Existing header, navigation, spacing conventions, icon/logo assets, and global typography unless the code audit shows a specific reason to improve them.

**Important:** inspect the current CSS variables, font files, design tokens, shared components, and actual rendered website before making new visual decisions. Do not invent a new palette or import a default template.

---

## 3. Authoritative source files and data rules

The following Excel master files are the content sources. They must be available in the Codex workspace (for example, place them in `reference/` next to this brief) before any row-level data implementation. If Codex cannot access them, it must report that limitation rather than fabricate or reconstruct benefit details from this summary.

1. `ER _ FUND FOR FUN MASTER FILE.xlsx`
   - Authoritative benefits sheet: **`2.1. BẢNG QUYỀN LỢI NTT`**.
   - Other sheets contain internal tracking, SOP, and administrative information. Do not expose those internal details on the public website.
2. `ER _ BIG JOY LITTLE JOY MASTER FILE.xlsx`
   - Main benefit matrix: **`2. LITTLE JOY BENEFIT`**.
   - The workbook also contains hidden / duplicate / operational sheets. Do not treat an older duplicate or internal tracking sheet as the public source without comparing it against the main benefit matrix and the previously approved publication list.

### Data integrity rules — both sections

- Preserve Vietnamese wording, quantities, durations, eligibility, and conditions from the source unless an explicit approved copy edit is supplied.
- Do not invent benefits, quantities, dates, account handles, usage rights, exclusivity, content deliverables, or timing.
- Keep the difference between **not included**, **blank / unspecified**, and **pending approval**. These are not interchangeable states.
- A `-` in a tier cell means that benefit is not included in that tier. It is not a pending-approval marker.
- A blank cell means no confirmed value is provided in that cell. Do not silently turn it into `✓`, `-`, or a made-up quantity. Respect merged-cell ranges in Excel where a value intentionally spans multiple tiers.
- If the source is internally inconsistent or incomplete, preserve the verified values and flag the issue in the audit report. Do not silently “correct” it.
- Keep content/data separate from presentation components where practical, so POET can update one source object instead of editing duplicated text in multiple components.

---

## 4. FUND FOR FUN — confirmed content facts

### Package structure

FUND FOR FUN is a **three-tier sponsor package**:

| Tier | Vietnamese label | Contribution threshold |
|---|---|---:|
| DIAMOND | Kim Cương | From 25,000,000 VND |
| GOLD | Vàng | From 12,000,000 VND |
| SILVER | Bạc | From 5,000,000 VND |

The source defines the contribution as cash or in-kind support converted according to the project KPI valuation. Do not display the example in-kind values as a fixed promise or as the only accepted form of contribution.

### Benefit phases and row IDs

The authoritative sheet contains 23 benefit items:

| Phase | Source rows / QL IDs | Count |
|---|---|---:|
| TRƯỚC CHUYẾN ĐI | QL01–QL09 | 9 |
| TRONG CHUYẾN ĐI | QL10–QL15 | 6 |
| SAU CHUYẾN ĐI | QL16–QL23 | 8 |
| **Total** | **QL01–QL23** | **23** |

The sheet's tier totals are:

| Tier | Number of included benefit items |
|---|---:|
| DIAMOND | 23 |
| GOLD | 16 |
| SILVER | 11 |

Use the source matrix for the exact description and tier-specific quantity of every benefit. The totals above are useful summary data, not a substitute for row-level mapping.

### Source anomalies to preserve and flag

- **QL07:** the tier cell specifies `1 video 20–30s`, while the delivery specification states `1 video 30s`; the source also gives a November–December 2026 window. Do not reconcile the duration on your own. Surface the discrepancy in the audit / content checklist.
- **QL18:** the delivery-timing cell is blank in the source. Do not infer a due date or display a made-up delivery promise. If the UI needs timing, show only the confirmed content or omit the timing line.
- Do not remove a right simply because one tier has `-`; show it for tiers where the source includes it.

### UX recommendation for FUND FOR FUN

There are only three tiers, so a true comparison layout is appropriate. Explore a readable comparison matrix with:

- Three clearly distinguishable tier columns (Diamond / Gold / Silver).
- Benefit descriptions grouped under the three source phases.
- Clear quantities / specifications in the tier cells, not just generic checkmarks when the source gives a quantity.
- A clear display of the minimum contribution per tier.
- Desktop layout that avoids tiny type and remains scannable across 23 rows.
- Mobile behavior that does not force a wide, unreadable table. Consider a tier switcher or phase accordions on narrow screens.

Do not use three large, identical cards with every benefit crammed inside them if a structured comparison is clearer.

---

## 5. BIG JOY LITTLE JOY — confirmed content facts and publication boundary

### Tier structure

The main sheet `2. LITTLE JOY BENEFIT` defines 10 contribution levels:

| Order | Tier | Contribution threshold |
|---:|---|---:|
| 1 | BABY STEP | 1,000,000 VND |
| 2 | SPARK | 3,000,000 VND |
| 3 | GROW | 5,000,000 VND |
| 4 | RISE | 10,000,000 VND |
| 5 | SHINE | 15,000,000 VND |
| 6 | TURNING POINT | 20,000,000 VND |
| 7 | THRIVE | 25,000,000 VND |
| 8 | SPREAD | 30,000,000 VND |
| 9 | AMPLIFY | 35,000,000 VND |
| 10 | TRIUMPH | 40,000,000 VND |

The workbook's main sheet contains 55 candidate benefit items across pre-event, Pop-up, school-trip, long-term partnership, and recognition groupings. Some rows contain detailed quantities, some contain checkmarks, some are unavailable for lower tiers, and some cells are blank / merged.

### Public-display rule agreed in the earlier content audit

- The website should display **46 approved public benefits** only.
- The approved public presentation is grouped as **30 before / 4 during / 12 after** (46 total).
- **9 approval-only items must remain hidden** and must not be presented as finalized benefits.

**Critical reconciliation requirement:** the uploaded main worksheet does not have a clean, dedicated approval-status column that unambiguously labels those 9 exclusions. Do not guess which 9 rows to hide based on blank cells, dashes, or visual formatting. Before implementing this list, locate the exact approved 46-item mapping in existing repository content / prior approved website data / available project documentation. If the exact mapping cannot be found, produce a row-by-row reconciliation report and stop before publishing ambiguous items. Never substitute a guessed 46-item list.

### Current source groupings and timing notes

The workbook's own section headings include:

- `TRƯỚC SỰ KIỆN POP-UP BIG JOY`
- `TRONG SỰ KIỆN POP-UP BIG JOY`
- `CHUYẾN ĐI TỚI ĐIỂM TRƯỜNG`
- `HỢP TÁC DÀI HẠN`
- `GHI NHẬN`

These raw worksheet groupings are **not automatically the same as the approved website split of 30 / 4 / 12**. Follow the approved public mapping if found; do not recalculate or reinterpret it from row ranges.

Dates shown in the current website screenshot and workbook must be compared carefully. The current screenshot shows the Pop-up period as **20–22.12.2026**; one detailed source timing cell refers to an Instagram Story at the Pop-up on **20–21/12/2026**. Do not normalize or overwrite date ranges without verifying the correct event schedule with POET. The school trip timing in the source is **22–24/01/2027**.

### UX recommendation for BIG JOY LITTLE JOY

Do not render 10 tier columns side by side. That will be unreadable on standard desktop widths and unusable on mobile.

Explore an interaction model based on:

- A clear **10-level contribution selector / tier ladder** showing each name and threshold.
- One selected tier at a time, with its exact benefits shown across the approved public campaign phases.
- Clear phase labels and differentiated content groups (e.g. communication, Pop-up experience, school-trip impact, recognition / long-term relationship) only where this preserves the approved content meaning.
- A compact summary of the selected tier's most decision-relevant benefits, followed by the full approved list.
- Keyboard-operable controls, visible focus, a sensible default state, and a mobile-friendly selector.

This is a design direction to validate during audit, not permission to omit or rewrite approved benefits.

---

## 6. Shared design direction — anti-generic / anti-AI-slop rules

### Design intent

POET is a youth-led nonprofit with a playful but credible identity. The interface should feel **warm, editorial, lively, and well-art-directed**, while remaining trustworthy enough for brands and sponsors making financial or in-kind commitments.

Build a visual language that feels specific to POET rather than selecting a generic SaaS / startup landing-page template. Use the actual POET logo, existing typefaces, color variables, and visual assets as the starting point.

### Avoid these generic patterns

- Purple-to-blue gradients, random neon gradients, or glassmorphism without a real brand reason.
- Inter / generic sans-serif as the automatic answer without checking the current font system.
- Repetitive rounded cards for every content block.
- Cards nested inside cards, or multiple layers of borders and shadows.
- The same three-column card grid repeated across unrelated content.
- A rounded-square icon tile above every heading.
- Repeating decorative flower icons as the only visual hierarchy for every benefit row.
- Excessive pills, badges, “New” labels, decorative icons, and arbitrary hover effects.
- Every heading, item, and statistic having the same size / visual weight.
- Dense content hidden behind too many “Xem thêm” interactions.
- Animation that delays reading, causes layout shift, or exists only to look impressive.

### Prefer

- Strong typographic hierarchy and deliberate line lengths.
- A clear editorial grid, varied but disciplined spacing, and asymmetry where it improves hierarchy.
- A small number of meaningful surface treatments; use rules, whitespace, typography, color blocks, and section labels before adding another card.
- POET's existing pastel accents as purposeful signals rather than a full rainbow on every item.
- One distinctive motif derived from POET's existing visual identity only if it strengthens recognition; do not add arbitrary decoration.
- Benefit rows that are easy to scan, with quantities and conditions visually separated from the description.
- A cohesive visual system across both sections, but different layouts for the 3-tier and 10-tier information models.

### Motion and interaction

- Motion should clarify state changes, reveal hierarchy, or provide feedback.
- Prefer subtle, short transitions; avoid parallax / elaborate scroll choreography unless it genuinely helps comprehension.
- Respect `prefers-reduced-motion`.
- Use clear hover, pressed, selected, disabled, and focus states.
- Do not make content depend on hover; all important information must be accessible with touch and keyboard.

---

## 7. Technical and accessibility constraints

Before changing code, inspect and respect the existing stack, routing, component structure, styles, and package manager. Do not migrate frameworks or add libraries just to implement visual polish.

Preserve:

- The page URL and existing anchor behavior for `#nha-tai-tro` and `#thuong-hieu`.
- Current navigation and CTA interactions.
- Existing donation/payment logic and unrelated content.
- Working responsive behavior outside the two target sections.
- Existing image / logo asset paths and licensing.

Accessibility and responsive acceptance:

- Keyboard navigation works for every interactive control.
- Visible focus styles are not hidden behind sticky elements.
- Use semantic headings, lists, buttons, tables, and disclosures appropriate to the content.
- Provide accessible names / labels for controls and icons.
- Touch targets should be comfortably usable on mobile (target at least 44px where practical).
- Maintain readable contrast; do not encode package inclusion by color alone.
- No horizontal overflow at 375px, 768px, 1024px, and 1440px viewport widths.
- Respect `prefers-reduced-motion`.
- Ensure all 46 approved BJLJ rights and all 23 FFF rights remain reachable in the UI.

---

## 8. Recommended design / coding references

These are complementary tools, not five competing design systems. Do not blindly apply all of them at once. The project-owned POET design context in this brief (and a concise repo `AGENTS.md` / `DESIGN.md` when approved) takes precedence over generic examples.

| Reference | Best use in this project | Notes |
|---|---|---|
| [Impeccable](https://github.com/pbakaus/impeccable) | Design vocabulary, UX critique, layout / typography / motion polish, anti-pattern detection | Provides setup context (`PRODUCT.md` / `DESIGN.md`), targeted commands, and a deterministic detector. Especially useful for catching repeated AI-looking patterns. |
| [Taste Skill](https://github.com/Leonxlnx/taste-skill) | Primary existing-project redesign guidance | Prefer the `redesign-existing-projects` skill for auditing and improving an existing codebase. `gpt-taste` is the stricter Codex-oriented alternative; do not install both by default. The repository labels its newer default v2 skill experimental. |
| [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | Optional design research: styles, palettes, typography pairings, and framework-specific implementation guidance | Use as a searchable reference, not as a command to apply a preset. Its library is broad; an automatically selected style can still look generic if not grounded in POET. |
| [Vercel Web Design Guidelines skill](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines) and [Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines) | Technical design review: accessibility, interaction, responsive behavior, semantics, and UI implementation quality | Use primarily as a final / post-implementation audit. |
| [Emil Kowalski — Design Engineering](https://github.com/emilkowalski/skills/tree/main/skills/emil-design-eng) | Component-level interaction and motion polish | Use selectively after structure and content are correct; do not add animation to every element. |

### Suggested installation commands (Codex)

Run these only after checking whether the skills are already available. Prefer project-local installation so the workflow is reproducible and does not change other projects.

```bash
# 1) Existing-project redesign workflow from Taste Skill
npx skills add https://github.com/Leonxlnx/taste-skill --skill "redesign-existing-projects"

# 2) Vercel web design / implementation guidelines
npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines

# 3) Emil's design-engineering / motion guidance
npx skills add emilkowalski/skills --skill emil-design-eng

# 4) Impeccable (includes Codex provider support)
npx impeccable install --providers=codex --scope=project
```

For Impeccable, run `/impeccable init` in Codex after installation and inspect the generated `PRODUCT.md` / `DESIGN.md` before accepting them. Review any Codex hook prompt before enabling it.

UI UX Pro Max is optional; its documented CLI flow is:

```bash
npm install -g ui-ux-pro-max-cli
uipro init --ai codex
```

Do not install every reference at once if the project already has overlapping skills. First check existing instructions / skills and report duplication or conflict. Keep one clear POET-specific design source of truth.

### Codex persistence note

A new Codex chat does not inherently erase repo-level guidance or installed skills. Codex supports persistent repo guidance via `AGENTS.md` and reusable skills via `.agents/skills/` in the repository (or user-level skill folders). Chat-only decisions may not carry over, which is why this brief must live in the project repo and be referenced explicitly in every major step.

---

## 9. Suggested delivery sequence

Work in small, reviewable steps. Do not combine all phases into one large implementation prompt.

1. **Audit and content reconciliation (no code changes).** Inspect the repo, current page, route components, styles, responsive behavior, all installed skills, and both Excel sources. Identify the exact 46 approved BJLJ rows and unresolved source inconsistencies. Produce a concrete plan.
2. **Design direction and structural proposal.** Propose distinct information architectures for the three-tier FFF table and 10-tier BJLJ selector. Define the shared POET visual rules from the existing codebase. No implementation until the user reviews the proposed direction.
3. **Implement FUND FOR FUN.** Replace only the “Bắt đầu như thế nào?” block with the approved 23-item / 3-tier comparison experience. Preserve surrounding page functionality.
4. **Implement BIG JOY LITTLE JOY.** Rebuild only its approved 46-item public benefit experience and its 10-level selector, using the reconciled source mapping.
5. **Responsive, accessibility, and interaction polish.** Verify keyboard / touch / reduced-motion and the four viewport widths.
6. **Visual QA and regression check.** Compare screenshots against the current site and approved direction; run the project's actual build / lint / test scripts; check anchor navigation, CTA links, payment / donation flows, and untouched sections.

At every step:

- State which files will change before broad edits.
- Keep a clean diff and avoid unrelated refactors.
- Do not overwrite existing work; inspect `git status` first.
- Do not commit, push, deploy, or edit production data unless separately instructed.
- If a content ambiguity affects a public promise, stop and report it rather than guessing.
- After implementation, give a concise summary of changed files, checks run, and remaining issues.

---

## 10. Definition of done

The redesign is complete only when:

- FUND FOR FUN has all 23 approved source rights across its 3 tiers, with correct inclusion / quantity / threshold and the two source anomalies flagged rather than invented away.
- BIG JOY LITTLE JOY exposes only the 46 approved public items, excludes all 9 approval-only items, and preserves the 10 contribution levels exactly.
- The two sections feel related to POET but use the right information architecture for their different tier counts.
- The result no longer relies on repetitive cards, nested cards, generic gradients, repeated icon bullets, or excessive hidden content to create visual interest.
- The desktop and mobile experiences are readable, accessible, and free of horizontal overflow.
- Existing header, navigation, page anchors, CTA destinations, donation / payment behavior, and unrelated sections remain functional.
- The codebase passes its available build / lint / test checks, and visual QA has been performed at the specified viewports.

## CURRENT PROJECT STATE

### Active scope
- Step 3A Parts 1–3: Fund For Fun data, responsive UI, generated `/dong-hanh/` integration, and local Edge QA are complete.
- Step 4A: BJLJ source reconciliation is complete as a data audit only; no BJLJ UI or generated page was changed.

### Confirmed decisions
- Keep QL01–QL23, all source tier values and phase labels. QL07 presentation: one product review video, 20–30 seconds; delivery November–December 2026. QL18 keeps verified tier eligibility with no timeline displayed.

### Implementation state
- Data: `data/fund-for-fun.mjs`, transcribed from `reference/source/ER_FUND_FOR_FUN_MASTER.tsv` (workbook sheet `2.1. BẢNG QUYỀN LỢI NTT`). Source wording/values remain in the records; `approvedDisplay` stores only QL07/QL18 presentation handling.

### QA state
- Part 3 completed: isolated full-site generation succeeded in a temporary project copy; only the generated Fund For Fun sponsor section was integrated into `dong-hanh/index.html`. Browser QA passed at 1440×900, 768×1024, 390×844, and 320×700. No horizontal overflow or final browser console errors; see the Part 3 record below.

### Blockers
- None for the data module. Source TSV retains QL07's original “20-30s” and “30s” cells; approved display normalization reconciles them. QL18 source timeline remains blank.

### Next authorized action
- Step 4A audit: `docs/BJLJ_SOURCE_RECONCILIATION.md`. Next: user confirms the 46 public IDs, 9 unfinalized IDs, BJLJ-28/45 semantics, Pop-up date, and remaining phase/shared-cell questions. Only then begin BJLJ implementation.

### Project invariants
- Preserve existing edits; no reset, clean, stash, restore, commit, push, or deploy. The workbook/TSV is the factual source. Do not modify Big Joy Little Joy until the exact approved 46 public and 9 approval-only IDs are supplied and mapped.


### Part 2 UI implementation
- Files: tools/site-templates.mjs, site.css, site.js. Semantic 23-row comparison table grouped into source phases (9/6/8); surrounding sponsor needs, season-plan link, CTAs, and business switch remain in the template.
- Mobile uses a labeled native tier select and the same table data. JavaScript filters tier cells; without JavaScript all tier values remain available.
- QL07 uses the approved duration and separate delivery period; QL18 timeline is omitted.
- Part 2 checks: node --check tools/site-templates.mjs; node --check site.js; focused `partner('../')` render assertions; git diff --check. Part 3 browser QA supersedes the earlier unverified status.


### Part 3 isolated integration and browser QA (26 November 2026)
- Build: ran `node tools/build-site.mjs` in an isolated temporary copy. Build succeeded; its output includes multiple routes. Integrated only the generated sponsor section into `dong-hanh/index.html`; surrounding before/after content was preserved. No other generated route was integrated.
- Browser: Microsoft Edge headless via the existing Playwright package; local static preview and script `.design-tools/output/step3a3-qa.cjs` (created for QA). Final run: `node .\output\step3a3-qa.cjs` from `.design-tools`. Captures: `.design-tools/output/step3a3-viewport/section-{1440x900,768x1024,390x844,320x700}.png`.
- Results: 23 benefits rendered with phase groups in 9/6/8 order; all 69 tier cells matched source values (dash cells retain an accessible “Không áp dụng” label); tier thresholds read 25 / 12 / 5 triệu VNĐ. QL07 shows one 20–30 second product review video and Nov–Dec 2026. QL18 remains visible with Diamond and Gold entitlements and no timeline.
- Responsive / interaction: no document or body horizontal overflow at all four sizes. At 768, 390, and 320 widths, each selector choice showed 23 selected-tier cells and hid 46 other-tier cells. Keyboard from the empty selector (ArrowDown, Enter) selected DIAMOND with focus visible. With JavaScript disabled, all 23 benefits and 69 tier values remained available. Reduced-motion preference was enabled; Fund For Fun has no section-specific animation rules.
- Accessibility / console: one table caption, 23 row headers, four column headers; the native selector has a visible associated label. Final browser console and page errors: none.
- Files changed for Part 3: `dong-hanh/index.html` (sponsor section only) and this brief at `C:\Users\trang\Downloads\POET_DONG_HANH_CODEX_BRIEF.md`. No Big Joy Little Joy content or other generated route was changed.
- Remaining limits: this was local headless Edge QA, not testing another browser or a live deployment. The temporary-copy build generated unrelated routes only inside the temporary copy; they were not integrated.
- Next: review the route diff; begin Big Joy Little Joy only after its exact approved public mapping is confirmed.




### Step 4A BJLJ source audit (26 November 2026)
- Canonical master brief: this repository-root file; copied from the latest Downloads brief, preserving Step 3A QA.
- Audit: [docs/BJLJ_SOURCE_RECONCILIATION.md](docs/BJLJ_SOURCE_RECONCILIATION.md), based on the workbook sheet “2. LITTLE JOY BENEFIT” and checked against the existing PDF and data/content.mjs mapping. It maps 55 source rows to audit-only IDs and exact sheet rows.
- Reconciliation: 46 PUBLIC in the existing map + 9 UNRESOLVED/unfinalized = 55; workbook has no approval-status column, so PUBLIC is not independent approval proof and no explicit APPROVAL-ONLY label can be sourced. Unresolved IDs: BJLJ-13, -15, -16, -28, -35, -42, -43, -44, -45.
- BJLJ-28 merged F42:K42 places “1 story” across SHINE–TRIUMPH. BJLJ-45 merged I66:K66 places “1 video ≤ 10s” across AMPLIFY–TRIUMPH; its row label says IG Story. Merges prove tier placement only.
- Workbook Pop-up Story timing is 20–21 Dec 2026; earlier screenshot reference says 20–22 Dec. Workbook timing used in audit; live date still needs confirmation. Long-term/recognition benefits are grouped with trip follow-up, with source timing after program obligations. Shared merged-note ranges and blank tier cells are explicitly flagged in the audit.
- No BJLJ UI, source data, template, or generated page was modified in Step 4A.
- Next: receive the decisions listed in the audit, then authorize implementation as a separate step.


### Fund For Fun interaction refinement
- Fund For Fun now uses one interaction model at desktop and mobile: selectable SILVER, GOLD, DIAMOND cards with SILVER selected by default; one selected tier’s phase-grouped benefits shown below. The 23 authoritative records remain in data/fund-for-fun.mjs; no duplicate record data was added.
- Files changed: tools/site-templates.mjs, site.css, site.js, dong-hanh/index.html, and this brief. Big Joy Little Joy source/UI were not changed.
- Isolated build: copied the current working tree (excluding .git, .design-tools, node_modules) to a temporary directory, ran node tools/build-site.mjs successfully, then integrated only the sponsor section into dong-hanh/index.html; before/after route content was preserved.
- Headless Edge at 1440×900, 768×1024, 390×844, 320×700: no horizontal overflow. Counts on switch: SILVER 11, GOLD 16, DIAMOND 23; all three phase groups are present. Repeated switching, keyboard ArrowRight selection/focus, QL07 text/timing, QL18 presence/no timeline passed. Browser console/page errors: none.
- Reduced-motion CSS rule is present, but Playwright’s Edge session did not activate the emulated prefers-reduced-motion media query; runtime reduced-motion behavior remains unverified. Better Design MCP guidance tools were unavailable in this session; existing POET tokens and site patterns were used.
- Next: review locally; no BJLJ work authorized by this refinement.


### Step 4B decision brief
- Review: [docs/BJLJ_DECISION_BRIEF.md](docs/BJLJ_DECISION_BRIEF.md). Six confirmations cover approval scope, BJLJ-28, BJLJ-45, Pop-up date, phase grouping, and shared-note/blank-cell scope.
- Status: awaiting user decisions. No BJLJ UI, data, template, styles, scripts, or generated pages changed.
- Next: apply the confirmed decisions to the audit, then proceed to a separately authorized BJLJ implementation.


### Step 4B user decisions recorded
- Decision brief updated at docs/BJLJ_DECISION_BRIEF.md. D1 is conditional on POET separately confirming the exact 46 PUBLIC IDs; the workbook does not establish approval. The 9 unresolved IDs remain excluded.
- D2: BJLJ-28 means one shared Instagram Story for SHINE–TRIUMPH, pending approval. D3: BJLJ-45 remains excluded pending deliverable clarification. D4: omit Pop-up date until official schedule confirmation.
- D5: retain three phases and place long-term/recognition items in “Sau khi hoàn tất chương trình” under CHUYẾN ĐI. D6: shared notes apply only within exact merged ranges and explicit eligible tiers; blanks remain unspecified.
- These are content interpretations, not POET or sponsor approval. No BJLJ public UI or generated page authorized. Next: obtain approval of the exact 46 IDs and confirm pending approval/deliverable/schedule items before implementation.


### Step 4B — Option 1 selections recorded
- D1 A conditional: the 46 mapped PUBLIC IDs still require POET's separate confirmation; the nine unresolved IDs remain excluded. No approval is inferred.
- D2 A conditional: BJLJ-28 is interpreted as one shared IG Story for SHINE–TRIUMPH; do not publish before approval.
- D3 A interpretation only: BJLJ-45 is read as an IG Story up to 10 seconds, pending approval before publication.
- D4 A: 20–21 Dec 2026 selected, but official schedule confirmation is still required before publishing the date.
- D5 A: retain three phases; long-term/recognition items go under a post-program group in CHUYẾN ĐI. D6 A: shared notes apply within exact merged ranges and only to explicitly eligible tiers; blanks remain unspecified.
- These option selections are content direction only, not POET/sponsor approval. No implementation authorized; BJLJ public content remains on hold pending confirmations above.


### Fund For Fun Playwright visual QA refinement (26 November 2026)
- Playwright was already present under .design-tools/node_modules (v1.64.0-alpha-1790635538000); launched installed Microsoft Edge headless. Local /dong-hanh/ preview returned HTTP 200. No dependency installed.
- Visual review led to a small CSS refinement in site.css: align selected-tier summary as an editorial heading and reserve consistent mobile card space for the selected label. Source data, BJLJ, template logic, and other routes were not changed in this QA pass.
- Rechecked 1440, 1024, 768, 390, and 320 px. No horizontal overflow. SILVER default; repeated SILVER/GOLD/DIAMOND switching passed with 11/16/23 benefits, one visible tier panel, all three phases in order, no reload. QL07 video/delivery and QL18 benefit/no timeline passed. Keyboard ArrowRight moved focus and selection to GOLD with visible outline. Console errors and failed requests: none.
- Screenshots before/after refinement: .design-tools/output/fff-visual-qa/before-1440.png, before-390.png, after-1440.png, after-390.png.
- Reduced-motion runtime emulation could not be activated in this Edge session; CSS includes a prefers-reduced-motion override, but runtime verification remains outstanding.


### Fund For Fun bullet and text alignment (26 November 2026)
- Reused the existing BJLJ four-petal SVG bullet in the Fund For Fun benefit list. Phase bullets use POET coral, blue, and green; benefit text stays in the existing POET ink color. This repairs the narrow first column visible before integration and keeps entitlements and timing unchanged.
- Changed for this refinement: tools/site-templates.mjs, site.css, dong-hanh/index.html (sponsor section only), and this brief. No BJLJ content or other generated route was modified.
- Rebuilt in a temporary project copy with node tools/build-site.mjs; integrated only the generated sponsor section with tools/.design-tools/output/integrate-fff-section.cjs. Build completed and the surrounding route HTML was preserved.
- Headless Edge / Playwright visual and interaction checks: 1440x900, 1024x800, 768x1024, 390x844, 320x700; no horizontal overflow, console errors, or failed requests. SILVER/GOLD/DIAMOND show 11/16/23 benefits; keyboard ArrowRight changes focus and selection. QL07 approved duration and Nov-Dec 2026 delivery verified; QL18 remains visible without a delivery line.
- Before/after screenshots: .design-tools/output/fff-visual-qa/before-bullet-unify-1440.png, before-bullet-unify-390.png, after-bullet-unify-1440.png, after-bullet-unify-390.png. Better Design MCP tools were unavailable; review followed existing POET/BJLJ styles.


### Fund For Fun compact benefit layout (26 November 2026)
- Replaced the long entitlement rows with the existing BJLJ phase-list pattern: two phase columns on desktop, one on mobile, colored flower bullets, and per-phase "Xem th?m" controls after five items. Entitlement quantities and timing remain attached to each source benefit.
- Changed: tools/site-templates.mjs, site.css, site.js, dong-hanh/index.html (sponsor section only), and this brief. The authoritative 23-row dataset and BJLJ content were not changed.
- Isolated build: temporary copy + node tools/build-site.mjs succeeded; only the generated sponsor section was integrated into /dong-hanh/.
- Playwright/Edge: 1440x900, 1024x800, 768x1024, 390x844, 320x700; no overflow, console errors, or failed requests. Counts remain SILVER 11, GOLD 16, DIAMOND 23. All three phases render in order; initial visible benefits are capped at five per phase, expand/collapse works by keyboard, tier ArrowRight selection works without reload. QL07 delivery and QL18 no-timeline display verified.
- Screenshots: .design-tools/output/fff-visual-qa/before-compact-1440.png, before-compact-390.png, after-compact-benefits-1440.png, after-compact-benefits-390.png.


### Fund For Fun phase hierarchy refinement
- Promoted TRONG CHUY?N ?I to a full-width pale-blue highlight block above the remaining phases. TR??C CHUY?N ?I and SAU CHUY?N ?I now share one aligned two-column row on desktop; they stack on mobile. The selected-tier interaction, source wording, quantities, and per-phase expanders remain intact.
- Changed: tools/site-templates.mjs, site.css, dong-hanh/index.html (sponsor section only), and this brief. No data or BJLJ UI/content changed.
- Isolated temporary-copy build completed and only the generated sponsor section was integrated. Playwright/Edge checked 1440x900, 1024x800, 768x1024, 390x844, and 320x700: no overflow, console errors, or failed requests; tier counts remain 11/16/23; highlight and two-column layout verified; expand/collapse and keyboard tier selection pass; QL07 and QL18 remain correct.
- Screenshots: .design-tools/output/fff-visual-qa/after-phase-highlight-1440.png, after-phase-highlight-390.png, after-phase-columns-390.png.
