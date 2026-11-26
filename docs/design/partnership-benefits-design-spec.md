# POET — Partnership Benefits Design Specification

**Status:** Design direction only. No UI or content changes are authorized by this document.
**Prepared:** 25 November 2026
**Scope:** The Fund For Fun and Big Joy Little Joy benefit sections on `/dong-hanh/`.

> **Content gate:** Fund For Fun has a design interpretation for QL07 (01 video, 20–30 seconds, with the November–December 2026 delivery period kept separate). QL18's tier benefit values are present but its delivery timeline is blank; POET must decide whether the benefit may be shown with timing omitted. Big Joy Little Joy is **not content-ready**: the workbook has 55 candidate records, but the exact 46 public IDs and 9 approval-only IDs are not mapped. This specification contains no proposed row-level public-status assignment.

## 1. Design rationale

The two programs ask visitors to make different decisions. Fund For Fun has three sponsor levels and 23 source rows, so visitors need direct comparison. Big Joy Little Joy has ten levels and a large benefit set, so visitors need to choose one level and inspect its benefits without scanning ten narrow columns. Its phases also represent different moments: pre-event activity, the Pop-up event itself, and the school trip with related trip and post-trip activity.

The current Little Joy implementation combines a ten-level selector, a slider, tier details, three phase columns, summary metrics, repeated flower bullets, and “Xem thêm” disclosures. The number of controls and repeated visual treatments compete with the commitments visitors are trying to understand. A selected-tier view is a useful foundation, but its content cannot be treated as the approved 46-item list: that mapping remains unresolved.

The current checkout also has a source/output mismatch for Fund For Fun. `tools/site-templates.mjs` still emits the existing needs summary and three-step “Bắt đầu như thế nào?” block, while the uncommitted `dong-hanh/index.html` contains a tier selector and benefit details. The design is therefore a proposal for the owning template and data model to adopt later; the generated HTML alone is not the source of truth.

### Design goals

- Help a sponsor compare exact commitments without decoding dense prose.
- Keep the 10-tier Little Joy experience focused on the selected tier.
- Preserve quantities, delivery conditions, tier availability, and the distinction between `-` and blank source cells.
- Keep the two programs visually related while giving each a layout that fits its decision task.
- Preserve the surrounding page, route, anchors, CTAs, navigation, and payment behavior.

## 2. Visual direction

### Shared foundations

- **Typography:** Keep the existing local Product Sans loading and POET type scale. Use a clear order: section heading, phase heading, benefit title, then quieter timing/condition text. Benefit copy should remain comfortable body text; do not shrink it to fit a dense grid.
- **Color:** Reuse the existing cream, ink, green, coral, yellow, blue, muted, and border tokens in `site.css`. Use color to identify phase or selected state. Give all three Fund For Fun tiers equal visual weight; price should not determine typographic prominence.
- **Grid and spacing:** Keep `.section-shell`, `--site-gutter`, and the current section rhythm. Align the intro, selector, and benefit content to the same page edges. Use spacing and thin rules to group data before adding surfaces.
- **Surfaces and borders:** Prefer a white or cream content ground, restrained separators, and phase rules. Do not put each benefit in its own card or nest cards inside tier cards.
- **Iconography:** A benefit row does not need a decorative flower. Use text, quantities, and a clear included/not-included mark where the comparison requires one. An icon must have a real meaning and an accessible name or be hidden from assistive technology.
- **Motion:** Keep selection and disclosure feedback short and quiet. Do not animate rows into view or make reading wait for motion. Under `prefers-reduced-motion`, preserve the stable layout and remove movement.

### Fund For Fun visual grammar

Use one comparison table with a descriptive first column and three equally sized tier columns. Give the tier headings a thin accent rule using existing POET colors, not large colored cards. Keep delivery timing and conditions directly under the benefit label so visitors can read the commitment and its limits together. Preserve the source phase labels `TRƯỚC CHUYẾN ĐI`, `TRONG CHUYẾN ĐI`, and `SAU CHUYẾN ĐI`; these are specific to Fund For Fun.

### Big Joy Little Joy visual grammar

Use a tier progression as navigation, then show the selected tier and its benefits in a single content area. The selected tier's name and contribution stay visible with the benefits. Phase navigation changes the visible phase panel while retaining the selected tier. Use three distinct labels: `TRƯỚC SỰ KIỆN` for pre-event activity, `POP-UP` for benefits and activity at the Pop-up, and `CHUYẾN ĐI` for school-trip benefits and related post-trip activity. Do not collapse the third label into “SAU SỰ KIỆN.” Do not display a ten-column matrix.

### Shared page frame

Keep the POET page header, business-type switch, existing anchors (`#thuong-hieu`, `#nha-tai-tro`), contact destination, and nearby sponsor-needs/budget content. The two benefit sections may share phase labels, row typography, selection feedback, and divider treatment; they do not share one forced layout.

## 3. Fund For Fun wireframes

### Desktop

```text
Existing sponsor-needs and budget content stays above

FUND FOR FUN · NHÀ TÀI TRỢ
Three contribution levels / short explanatory introduction

┌ BENEFIT / DELIVERY / CONDITION ┬ DIAMOND · from 25m ┬ GOLD · from 12m ┬ SILVER · from 5m ┐
│ TRƯỚC CHUYẾN ĐI                │                    │                  │                   │
│ QL01  Benefit description      │ exact tier value   │ exact value      │ exact value       │
│       condition / timing       │                    │                  │                   │
│ QL02 ...                       │ ...                │ ...              │ ...               │
│ ... 9 source rows              │                    │                  │                   │
│ TRONG CHUYẾN ĐI                │                    │                  │                   │
│ ... 6 source rows              │                    │                  │                   │
│ SAU CHUYẾN ĐI                  │                    │                  │                   │
│ ... 8 source rows              │                    │                  │                   │
└────────────────────────────────┴────────────────────┴──────────────────┴───────────────────┘

Existing “Xem kế hoạch & dự toán Mùa 6” link and sponsor contact remain available.
```

The matrix has four logical columns: benefit plus its timing/condition, then one column per tier. Use semantic table markup with grouped phase rows. Keep the tier names, thresholds, and quantities in the table header or cells; never reduce quantified benefits to generic checkmarks. A source dash means not included. A blank source field stays visibly unresolved or is omitted from the public timing line until POET supplies an approved value.

### Mobile

```text
FUND FOR FUN · NHÀ TÀI TRỢ
Intro

[Chọn một gói · chưa chọn sẵn]

Chọn DIAMOND · từ 25m, GOLD · từ 12m hoặc SILVER · từ 5m để xem quyền lợi.

TRƯỚC CHUYẾN ĐI
QL01  Benefit description
      Exact quantity, condition, timing
...

TRONG CHUYẾN ĐI
...

SAU CHUYẾN ĐI
...

[Trao đổi cơ hội tài trợ]
```

At narrow widths, replace the comparison view with one selected tier at a time, using the same source data. Do not make the page scroll sideways. Keep all applicable rows available in the document; phase headings group the list but do not conceal it behind multiple nested disclosures.

## 4. Big Joy Little Joy wireframes

The frame below describes structure only. Benefit names, summary highlights, and counts must be filled from the verified public mapping after POET identifies all 46 public IDs and 9 approval-only IDs. The 9 pending items must not appear in rendered HTML or client-side data. The source worksheet also has separate long-term partnership and recognition groups; their mapping to the approved three user-facing phases must be confirmed rather than inferred.

### Desktop

```text
BIG JOY LITTLE JOY · THƯƠNG HIỆU ĐỒNG HÀNH
Intro and one sentence explaining how to explore the ten levels

┌ TIER PROGRESSION ─────────────┬ BENEFIT DETAILS ────────────────────────────────┐
│ BABY STEP       1m             │ Chọn một mức để xem quyền lợi                   │
│ SPARK           3m             │ Không có gói nào được chọn sẵn                 │
│ GROW            5m             │                                                  │
│ RISE           10m             │ Sau khi chọn: tier summary, phase controls,     │
│ SHINE          15m             │ benefit groups, exact quantities and conditions │
│ TURNING POINT  20m             │                                                  │
│ THRIVE         25m             │                                                  │
│ SPREAD         30m             │                                                  │
│ AMPLIFY        35m             │                                                  │
│ TRIUMPH        40m             │                                                  │
└───────────────────────────────┴──────────────────────────────────────────────────┘
```

The tier list is a vertical progression with readable names and amounts; it is not a row of ten tiny controls. No tier is preselected: the detail region asks the visitor to choose a level, avoiding a visual recommendation or default anchor. After selection, show the active tier summary and phase navigation in the detail region. Phase selection replaces the benefit panel without changing the tier. Short benefit titles remain visible; only long secondary explanations may use a single-level inline disclosure.

### Mobile

```text
BIG JOY LITTLE JOY · THƯƠNG HIỆU ĐỒNG HÀNH
Intro

Mức đồng hành
[Select: Chọn mức đồng hành                     ▾]

Choose one of ten levels
Selected tier details appear after a choice and after the approved public mapping is available.
```

After a level is chosen, show the three phase controls and the active phase's approved benefit groups, quantities, and confirmed delivery/condition details. Keep the prompt state free of a selected tier or phase.

Use a labeled native select for the ten levels on mobile; every option includes the tier name and amount. Its initial prompt is not a selectable sponsorship level. All ten levels remain equally discoverable. Once chosen, the active tier summary remains above the three phase controls while the selected phase changes in place, so visitors do not lose their selection context. The phase control may wrap at the smallest supported width, but it must not create horizontal overflow.

**Phase and date semantics:** the workbook labels the Pop-up Instagram Story timing “Ngay tại Pop-up, dự kiến 20–21/12/2026” (`2. LITTLE JOY BENEFIT!L41:L42`). That is a benefit timing tied to Pop-up activity, not a verified full-event date. The supplied Step 2.1 request reports a current screenshot showing the event period 20–22.12.2026. The live page and screenshot could not be reopened for independent visual verification in this pass. Keep both source statements in the audit trail; do not place either disputed range into new public-facing copy until POET confirms the event schedule. Treat the trip date 22–24/01/2027 as the event period where the workbook says “dự kiến,” not as a benefit delivery date.

## 5. Interaction specifications

| Control | Default and selected | Hover and focus | Expanded / keyboard | Mobile and reduced motion |
|---|---|---|---|---|
| Fund For Fun tier chooser | Desktop comparison shows all three tiers at once. Mobile starts with no tier selected and asks the visitor to choose; no contribution level is preselected. | Hover is a subtle color/border cue on pointer devices. Focus uses the existing visible focus ring and is never indicated by color alone. | A labeled native `<select>` or radio group. For radio, Tab enters/leaves the group and arrow keys move among tiers. Selection immediately shows the matching benefits. | Controls target at least 44px height. Reduce/remove movement; selection state updates immediately. |
| Little Joy tier navigation | Desktop shows all ten levels with no initial selection. The empty detail panel invites a choice and does not imply BABY STEP is recommended. Selected state includes both tier name and amount. | Hover is optional feedback only on hover-capable devices. Focus is visible and distinct from selection. | Desktop uses one labeled tier tab/radio set with proper arrow-key behavior and a linked panel. Mobile uses a labeled native `<select>` with a prompt. Tier changes update the selected panel and concise accessible summary. | Keep names and amounts in the option text; no overflow. Do not move focus or scroll the page to the top after selection. |
| Little Joy phase navigation | Phases are `TRƯỚC SỰ KIỆN`, `POP-UP`, and `CHUYẾN ĐI`. After a tier is chosen, the first phase is initially active; its title and heading both identify it. | No hover-only content. Focus stays visible. | Use three semantic tabs with `aria-controls`, or ordinary in-page links if all phases remain in the document. Arrow keys move between tabs; Home/End may move to first/last. Selection retains the tier. Do not present event dates as benefit delivery dates. | Labels may wrap instead of clipping. Switching phases does not animate position; optional short opacity feedback must be removed/reduced under reduced motion. |
| Benefit details | Titles, quantities, and inclusion state are visible by default. | No hover-only quantity, condition, or eligibility. | If a long condition needs disclosure, use one native `<details>/<summary>` level with an accurate summary and keyboard support. `-` and blank must never collapse into the same state. | Summaries remain touch-friendly. No height animation that delays reading; reduced motion keeps disclosure immediate. |
| CTA and page anchors | Existing labels, destinations, and business switch remain unchanged. | Existing button/link feedback. | Native links/buttons keep their current keyboard behavior. | Existing contact and plan links remain reachable without relying on hover or animation. |

### Accessibility, loading, and no-JavaScript behavior

- **Fund For Fun table:** use a `<caption>`, column headers with `scope="col"`, phase divider rows spanning all columns, and row headers for benefit names. Keep description, tier value, timing, and conditions programmatically associated. Use explicit text such as “Không áp dụng” for source `-`; do not expose an ambiguous empty cell as an inclusion state.
- **Tier controls:** every control has a visible label and accessible name that includes the tier and contribution amount. Selection is conveyed with text and a non-color state. Announce the selected tier and updated result count or phase heading through a concise polite live region; do not move focus.
- **Phase controls:** use tab semantics only if the complete keyboard model is implemented; otherwise use ordinary links to visible phase headings. For tabs, keep one tab in the tab order, support Left/Right and Home/End, and connect each tab to its panel with `aria-controls` / `aria-labelledby`.
- **Focus and touch:** preserve the site's visible focus style and adequate contrast. Target at least 44 × 44 CSS pixels for primary tier/phase controls where layout permits; do not make close-spaced controls depend on hover.
- **Loading and empty states:** this content is local static data, so it should not show a network spinner. If data is unavailable or still awaiting approval, show a clear content-status message, not an empty panel that looks like “no benefits.” Before a tier is selected, label the empty panel as an invitation to choose.
- **JavaScript-disabled fallback:** render approved benefit content in semantic HTML first. JavaScript may enhance tier and phase selection, but must not be required to expose the approved facts. For Little Joy, the fallback remains blocked until the exact public mapping is approved; never use pending records as fallback content.
- **Reduced motion:** selection and phase changes remain immediate. No row stagger, scroll animation, or animated height. Honor `prefers-reduced-motion` for any optional opacity/color feedback.

## 6. Component architecture

These are boundaries for the existing vanilla template/data approach, not framework components to install.

- **Program-specific section builders:** Fund For Fun comparison and Little Joy tier explorer keep separate data shapes and layout logic.
- **Section heading helper:** existing eyebrow/title/lead conventions, with no new global header component unless an existing helper already owns it.
- **Tier navigation:** distinct implementations for three-tier comparison/mobile choice and ten-tier progression/mobile select; share only selected-state tokens and accessibility conventions.
- **Benefit phase:** phase heading and ordered benefit group container, with program-specific labels and counts.
- **Benefit group:** source grouping such as channel or activity, only where it preserves source meaning and does not imply a new entitlement.
- **Benefit row:** source ID, exact description, tier values, quantity, delivery timing, conditions, and separate source states: `included`, `not included` (source `-`), `shared merged value`, `blank / unspecified`, `approval-only`, and `approval status unknown`. A merged value may be a shared tier entitlement, group-level condition, timing note, or just a heading; the merge's location and wording determine its interpretation.
- **Data boundary:** one reviewed record per source row. Preserve the anchor coordinate, merged range, covered columns, exact anchor text, and source workbook/sheet for each merged cell. Do not flatten merged blanks into generic `unspecified`. Do not let merge state establish public approval. Keep all 55 Little Joy approval records in a non-public review source until the full 46/9 mapping is approved; the public renderer must omit the nine approval-only records from HTML, JavaScript, JSON, and downloadable client payloads.
- **Missing approval map:** POET must supply or approve one complete row for every candidate record in this reconciliation table. All 55 IDs must be accounted for exactly once; until then, phase and status assignments remain unapproved.

| Source row | Benefit ID | Phase | Public status | Tier availability | Approval evidence |
|---|---|---|---|---|---|
| [worksheet row] | [one BJLJ ID] | [approved phase] | [public / approval-only] | [exact ten tier states, retaining merge references] | [approved list or written approval reference] |

Repeat the blank template once for each of the 55 source records. It is not the missing mapping and contains no assignment. Do not ship it as public content.
- **Interaction handler:** delegated vanilla JavaScript for tier/phase state, with semantic HTML remaining readable if JavaScript fails wherever practical.

Do not introduce React, Tailwind, a component library, or a second animation library for this work. The existing route and anchors remain the integration boundary.

## 7. Anti-slop checklist

- [ ] Composition is specific to comparing nonprofit sponsorship commitments.
- [ ] No generic SaaS dashboard shell, purple/blue gradient, or glass surface.
- [ ] Fund For Fun uses a comparison table, not three identical pricing cards.
- [ ] Big Joy Little Joy uses a tier selector, not ten columns or ten tiny horizontal buttons.
- [ ] No repeated nested cards for benefits, phases, and tiers.
- [ ] Benefit titles, quantities, durations, and conditions remain readable at body size.
- [ ] POET’s existing font, colors, spacing tokens, and restrained accent use are preserved.
- [ ] A color cue has a meaning and a non-color equivalent (label, text, or selected state).
- [ ] Icons are not repeated as the sole hierarchy for every benefit.
- [ ] Important content is not hidden behind hover or a stack of “Xem thêm” controls.
- [ ] No unsupported key benefit, promise, statistic, or tier highlight appears.
- [ ] Motion clarifies selection only; there is no scroll choreography, decorative loop, or delayed reading.
- [ ] Keyboard, focus, touch, and reduced-motion states are designed alongside the default state.
- [ ] The 9 approval-only rows never enter rendered HTML, JSON, or client-side bundles.

## 8. Design decisions and trade-offs

| Decision | Selected direction | Alternative considered | Why it fits POET | Trade-off / validation needed |
|---|---|---|---|---|
| Fund For Fun structure | Three-column comparison table, grouped into the 9/6/8 source phases | Three tier cards or a tier-only selector | Three levels are few enough for direct comparison; differences stay aligned row by row. | 23 rows are dense on desktop. Validate line length and row height at 1440 and 1024; use a selected-tier list on mobile. |
| Little Joy structure | Ten-level desktop progression with one selected tier; native select on mobile | Ten-column matrix or ten-card row | Keeps the amount and selected benefits together without forcing the data into ten narrow columns. | A vertical selector takes space. Test its height and selected-tier visibility at tablet widths. |
| Initial tier | No Fund For Fun mobile tier selected; no Little Joy tier selected on desktop or mobile | SILVER / BABY STEP preselected, or highest/middle tier | Avoids anchoring visitors to any contribution level. The empty panel clearly prompts a choice; all tier names and amounts remain visible. | A choice is required before benefits appear. Check that the prompt is clear and that the all-tier option list is immediately available. |
| Phase interaction | Three distinct in-place Little Joy phases: `TRƯỚC SỰ KIỆN`, `POP-UP`, `CHUYẾN ĐI`; visible source groups for Fund For Fun | Generic Before / During / After labels shared across programs | Keeps Pop-up and school-trip moments distinct while preserving Fund For Fun’s own pre-trip / trip / post-trip model. | The full 30/4/12 approved mapping must be reconciled to the three headings before implementation; long-term and recognition source groups need an approved placement. |
| QL07 | Use `01 video, thời lượng 20–30 giây`; keep `Từ tháng 11–12/2026` in a separate delivery-period field | Display only the single 30-second tier wording | Both source expressions are compatible: 30 seconds is within the 20–30 second range. The workbook explicitly describes a product review video, horizontal size, and potential ad use; preserve that source wording without adding a new format. | Do not conflate production duration with delivery period. Re-open only if another source conflict is found. |
| QL18 | Preserve tier benefit/eligibility and set delivery timeline to `blank / unspecified` | Treat entire row as unavailable until a date is approved | The blank is limited to the delivery-timeline cell; it does not erase tier values or imply approval is pending. | POET must decide whether to display the benefit while omitting the timeline. Do not invent or borrow dates. |
| Surfaces | Thin rules, whitespace, and limited summary surface | Card around each tier and each benefit | Preserves POET’s editorial character and reduces repeated containers. | Need a real browser pass for contrast and density; no screenshot was independently inspected in this correction. |
| Motion | Minimal state feedback, no movement-heavy transitions | Animated tier ladder, staggered rows, scroll reveals | The task is to understand commitments; immediate content access matters more than spectacle. | Feedback may feel plain. Use existing button press/focus treatment, not a new motion system. |
| Content integrity | Block Big Joy Little Joy content until the 46/9 map is approved | Infer from blanks, dashes, current copy, or row position | A visual polish cannot resolve public approval status. | The visual architecture can be reviewed now; final copy and counts cannot. |

## 9. Self-critique and limits

### Taste Skill instructions read; formal workflow not run

- The two layouts follow the visitor’s task and stay within POET’s current visual world instead of applying a generic pricing-page template.
- The specification uses the project’s own type, tokens, content, and vanilla architecture. It does not add a new hero image, illustration, icon family, or framework to a data-heavy section.
- The Taste Skill contains generic page-building rules that do not fit this scoped section redesign (for example, requiring hero treatment or a one-section-per-screen composition). The project brief and `AGENTS.md` take precedence; those rules are not carried into this feature.
- Main risk: even a well-structured table can become tiring across 23 rows. The phase groupings, benefit/condition pairing, and mobile selected-tier view reduce that risk, but the result needs real viewport review.

### Impeccable instructions read; formal critique not run

- The installed Impeccable context command recognized the incumbent POET visual implementation and found no `PRODUCT.md` or `DESIGN.md` at the repository root. The existing brief, root `AGENTS.md`, and draft `docs/DESIGN_SYSTEM.md` provide the scoped project facts used here.
- Installed skills and review stages are separated below. The full Impeccable critique workflow was not run: it requires two isolated assessments and a rendered browser target. No dual-assessment or screenshot result is claimed.
- Static critique: repeated cards, ten-column comparison, overuse of decorative flower bullets, hidden quantities, and mismatched template/generated output are the most important patterns to address. This is a source-based assessment, not a visual score.

### Vercel Web Design Guidelines read; no rendered UI audit run

- The specification calls for semantic tables/lists, labeled selection controls, visible focus, keyboard operation, non-color selected states, touch-friendly targets, readable copy, and no hover-only information.
- Phase and tier changes must be immediate and not depend on animation. Any mobile layout must fit without page-level horizontal overflow.
- This is a plan-only review. It does not claim measured contrast, focus order, hit areas, screen-reader output, or viewport screenshots.

### Emil Design Engineering read; no component review run

- Tier and phase selection are frequent actions, so they should not wait on an entrance animation. Use immediate state updates and short, interruptible feedback only where it confirms selection.
- If animation is later used, limit it to transform/opacity or color, gate hover effects to hover-capable devices, and respect `prefers-reduced-motion`.
- The benefit content is the product here. No staggered reveal, parallax, scroll-linked movement, or decorative loop is recommended.

### Better Design skill read; MCP workflow unavailable

The repository has the Better Design skill, but this Codex session does not expose its MCP tools. No design principles, review rules, comprehension result, or measured spacing result are attributed to that MCP. Its repository setup reference is https://github.com/marvkr/better-design#setup.

### Skill and QA evidence status

| Skill | Installed in project | Instructions read | Workflow executed in this correction | Browser result verified |
|---|---|---|---|---|
| Taste Skill | Yes | Yes | No formal page workflow; source-based spec review only | No |
| Impeccable | Yes | Yes | Context command previously ran; full critique workflow not run | No |
| Vercel Web Design Guidelines | Yes | Yes | Requirements applied to the written spec; no rendered UI audit run | No |
| Emil Design Engineering | Yes | Yes | Interaction guidance applied to the written spec; no component review run | No |
| Better Design | Yes | Yes | MCP principles/review tools unavailable in this session; not run | No |

No accessibility test, responsive test, screenshot comparison, visual critique score, or browser pass is claimed. The live page was inaccessible through the available web tool and no standalone screenshot file was available in the workspace. The supplied request reports the screenshot date as 20–22.12.2026; that statement is preserved as reported evidence, not independently rechecked here.

### Verified source facts and blockers

- The original Fund For Fun workbook sheet `2.1. BẢNG QUYỀN LỢI NTT` has 23 rows QL01–QL23. QL07 has `1 video 20-30s` in its tier cell and `Số lượng: 1 video 30s` plus `Từ tháng 11 - 12/2026` in its delivery/specification cells. The values are compatible; use 01 video of 20–30 seconds and keep the delivery period separate. The source description explicitly calls it a product review video and notes horizontal size / possible ads.
- QL18 has tier values in the workbook and a blank delivery-timeline cell. Preserve the benefit and tier eligibility in the source record with timeline `blank / unspecified`. POET must decide whether to publish the benefit without a timeline; no date is inferred.
- The Little Joy workbook sheet `2. LITTLE JOY BENEFIT` has 55 candidate records and 10 tier columns. Its source phase/section headings include pre-event Pop-up, at Pop-up, school trip, long-term partnership, and recognition groups. The user-facing phase model in this spec is `TRƯỚC SỰ KIỆN`, `POP-UP`, and `CHUYẾN ĐI`; exact row mapping remains approval-dependent.
- The expected public set remains 46 records (30/4/12) and 9 approval-only records. No exact ID list or approval evidence was found in the checked source files. Do not infer public status from dashes, blank cells, merges, colors, row order, or the rendered page.
- Verified merge coordinates and source meanings are recorded in the Data semantics section below. In particular, `F42:K42` anchors one shared `1 story` value, and `I66:K66` anchors one shared `1 video ≤ 10s` value. These confirm source cell scope, not public status. The latter wording still needs format clarification against its Instagram Story row label.
- The workbook's Pop-up Story timing at `L41:L42` says “Ngay tại Pop-up, dự kiến 20-21/12/2026.” The current screenshot date reported in the supplied request is 20–22.12.2026. This remains an unresolved event-schedule discrepancy; do not publish a disputed date. The workbook's 22–24/01/2027 note refers to the school-trip event period, not a delivery deadline.
- Before implementation, capture and review 1440px desktop, 1024px laptop/tablet, 768px tablet, 390px mobile, and 375px mobile. Check keyboard, touch, focus, semantics, contrast, overflow, and reduced motion. These are planned checks, not completed results.

## 10. Data semantics and merged-cell reconciliation

### Source-state rules

- `-` is not included / not applicable at that tier.
- An independent blank tier cell is missing or unspecified; it is not a dash and is not approval evidence.
- A blank inside a merged range takes the anchor value only within that exact range. Record whether the merge is a tier entitlement, shared note, group condition, or heading; do not turn every merged blank into an entitlement.
- An explicit `✓` is included. An explicit quantity or specification is included and must retain its exact unit and wording.
- Cell color, formatting, position, current page output, and merged-cell presence do not prove public approval.
- Preserve provenance as workbook name + sheet + anchor/range. For a shared note, keep its source range and scope; do not duplicate it into a per-benefit delivery promise unless POET confirms that scope.

### Verified merges on `2. LITTLE JOY BENEFIT`

The list below includes every merged range found in the source worksheet. “Shared note” means the source text occupies a merged region spanning rows; it does not by itself prove each separate benefit has an independent deadline. Header merges are not entitlements.

| Merged range | Anchor | Covered columns | Verified source meaning for data handling | Provenance |
|---|---|---|---|---|
| A2:A3 | A2 | A | “QUYỀN LỢI” column heading only | `2. LITTLE JOY BENEFIT!A2:A3` |
| L2:L3 | L2 | L | “THỜI GIAN TRẢ QUYỀN LỢI” column heading only | `2. LITTLE JOY BENEFIT!L2:L3` |
| L18:L19 | L18 | L | Shared timing note “Từ tháng 11, linh hoạt theo lịch đăng tải bài của POET” over two UGC video rows; retain as a source-scoped note | `2. LITTLE JOY BENEFIT!L18:L19` |
| L23:L24 | L23 | L | Shared note “Kể từ 3-5 ngày thời điểm Little Joy hoàn tất thanh toán đợt 1” spans the reconnaissance image and 12-month usage-right rows; preserve exact text and range, and confirm intended delivery scope / missing separator before rendering as a deadline | `2. LITTLE JOY BENEFIT!L23:L24` |
| L29:L35 | L29 | L | Payment-completion eligibility condition spans the Pop-up participation group; group condition, not a benefit entitlement | `2. LITTLE JOY BENEFIT!L29:L35` |
| E35:G35 | E35 | E–G | Shared logo-size value “1/5 so với kích thước logo POET” across three tier columns; explicit tier entitlement value | `2. LITTLE JOY BENEFIT!E35:G35` |
| H35:J35 | H35 | H–J | Shared logo-size value “1/2 so với kích thước logo POET” across three tier columns; explicit tier entitlement value | `2. LITTLE JOY BENEFIT!H35:J35` |
| L39:L40 | L39 | L | Shared Instagram recap note: one post, within 5–7 days after Pop-up; preserve group scope rather than asserting a separate quantity for each row | `2. LITTLE JOY BENEFIT!L39:L40` |
| L41:L42 | L41 | L | Shared timing “Ngay tại Pop-up, dự kiến 20-21/12/2026”; it is the event date associated with Pop-up Stories, not a post-event delivery deadline | `2. LITTLE JOY BENEFIT!L41:L42` |
| F42:K42 | F42 | F–K | One shared “1 story” value across six tier columns for BJLJ-28; this resolves its source tier range, not its public approval status | `2. LITTLE JOY BENEFIT!F42:K42` |
| L44:L45 | L44 | L | Shared “within 5–7 days after Pop-up ends” delivery note for two TikTok recap rows; preserve as shared scope | `2. LITTLE JOY BENEFIT!L44:L45` |
| L49:L51 | L49 | L | Merged note says about 5–10 photos and expected within 7 days of Pop-up, spanning three media rows. Its wording describes an image set; retain the merged provenance and do not copy quantity/deadline to the other rows without approval | `2. LITTLE JOY BENEFIT!L49:L51` |
| L55:L58 | L55 | L | School-trip event period “Dự kiến 22-24/01/2027” plus payment-completion condition for the trip participation group; event date and eligibility condition, not benefit delivery date | `2. LITTLE JOY BENEFIT!L55:L58` |
| I56:K56 | I56 | I–K | Shared explicit representative speaking opportunity, with the highest-contributing Little Joy speaking for 2 minutes; tier-scoped value, not a heading | `2. LITTLE JOY BENEFIT!I56:K56` |
| L60:L61 | L60 | L | Shared note says one Facebook post after the final trip, timing flexible to POET's posting schedule; keep group scope | `2. LITTLE JOY BENEFIT!L60:L61` |
| L63:L64 | L63 | L | Shared note says one Instagram post after the final trip, timing flexible to POET's posting schedule; keep group scope | `2. LITTLE JOY BENEFIT!L63:L64` |
| L65:L66 | L65 | L | “Ngay tại chuyến đi cuối, dự kiến 22-24/01/2027”; event period for the trip group, not delivery timing | `2. LITTLE JOY BENEFIT!L65:L66` |
| I66:K66 | I66 | I–K | Shared “1 video ≤ 10s” value across three tier columns for BJLJ-45; source tier range is resolved, but the IG Story row title conflicts with the video unit and approval status remains unknown | `2. LITTLE JOY BENEFIT!I66:K66` |
| L68:L69 | L68 | L | Shared TikTok recap delivery note: within 5–7 days after the final trip ends, flexible to POET's posting schedule | `2. LITTLE JOY BENEFIT!L68:L69` |
| L71:L74 | L71 | L | Merged note combines about 10 photos, a 5–7 day post-trip window, and payment-completion eligibility across four media rows; keep each fact distinct and confirm scope before assigning it per item | `2. LITTLE JOY BENEFIT!L71:L74` |
| L76:L78 | L76 | L | “Sau khi hoàn tất nghĩa vụ đồng hành của chương trình” applies to the long-term partnership group; shared timing/condition, not a separate benefit | `2. LITTLE JOY BENEFIT!L76:L78` |

The merged tier ranges establish shared values only where the merge is across tier columns. The merged cells in column L preserve shared timing, eligibility, or group notes. None establishes which 46 of the 55 candidate benefits are approved for public display.

## 11. Revision 2.1 — Data Semantics & Design Clarifications

**What changed:** Big Joy Little Joy now has separate `TRƯỚC SỰ KIỆN`, `POP-UP`, and `CHUYẾN ĐI` groups. The Pop-up and school-trip event periods are explicitly distinguished from benefit-delivery timing. All 21 worksheet merges are recorded with anchors, covered columns, semantics, and provenance. QL07's compatible duration statements are reconciled for planning, while QL18 retains its tier benefit with a blank/unspecified timeline and a clear POET approval question. Default tier anchoring was removed. Accessibility, empty/loading, reduced-motion, and JavaScript-disabled requirements were made explicit. Skill execution and browser evidence are reported by actual status.

**Why:** The previous wording blurred Pop-up and trip stages, treated QL07's precision difference as a contradiction, and did not distinguish shared merge values/notes from independent blanks or approval status. Preselecting low tiers could also steer visitor choice.

**Source support:** Original workbooks: `ER _ BIG JOY LITTLE JOY MASTER FILE.xlsx`, sheet `2. LITTLE JOY BENEFIT`, including the verified ranges above; and `ER _ FUND FOR FUN MASTER FILE.xlsx`, sheet `2.1. BẢNG QUYỀN LỢI NTT`, cells D11/E11/H11 and D22/E22/F22/G22/H22. Also checked `POET_DONG_HANH_CODEX_BRIEF.md`, `docs/SPONSORSHIP_CONTENT_AUDIT.md`, root `AGENTS.md`, and current repository content. The supplied Step 2.1 request reports the screenshot date as 20–22.12.2026; no screenshot file was independently available in this correction.

**Still requires POET approval:** QL18 display with no delivery timeline; the 46 public and 9 approval-only Little Joy IDs and evidence; row-to-phase mapping including long-term/recognition; the Pop-up event-date discrepancy; BJLJ-23's shared logo-size value is resolved from the workbook but still subject to public-content approval; ambiguous shared delivery-note scope; and BJLJ-45's Story-versus-video format.

## Implementation handoff gate

Before Step 3, QL07's duration interpretation no longer blocks design; preserve its source text and separate delivery period. POET must decide whether QL18 is shown with its timeline omitted. Do not implement Little Joy benefits until all 55 IDs are accounted for as exactly 46 public and 9 approval-only with evidence, tier values, and approved phase mapping. Resolve the Pop-up date and shared-note scope first. Keep this specification as the design reference; implementation should edit the data/template source and regenerate the route only after the current generated-page/template mismatch is reconciled. **This correction does not authorize Step 3.**
