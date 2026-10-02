# Data visualization brief — time tracker

Handoff notes for a data-visualization expert. Written 2026-10-02 against
branch `features/DashboardWeeklyBreakdown`.

**What's wanted:** proposals for what else is worth visualizing from the data
already in the system. This document covers what the data actually is, what's
already been built (so it isn't re-proposed), and the constraints any proposal
has to live inside. It deliberately does *not* contain a recommendation — that's
the ask.

---

## 1. The data model

One fact table and a handful of dimensions. Full schema with rationale comments:
`dataconnect/schema/schema.gql`.

### `TimeEntry` — the fact table

Grain: **one contiguous block of work by one user**. Everything analytic starts here.

| Field | Type | Notes |
|---|---|---|
| `user` | ref `User!` | Owner. Every client-side query is scoped to self — see §5. |
| `workLog` | ref `WorkLog` | Nullable. The day's log this entry was parsed out of. |
| `startTime` | `Timestamp!` | Full timestamp — **carries time of day**. |
| `endTime` | `Timestamp!` | Duration = `endTime - startTime` (`minutesBetween`). |
| `date` | `Date!` | Calendar day, denormalized. All bucketing keys off this. |
| `description` | `String` | Free text, per entry. |
| `ticket` | ref `Ticket` | Nullable — un-ticketed time is a real and common state. |
| `officeNumber` | `String` | **Vestigial. Do not use.** See §6. |
| `createdAt` | `Timestamp!` | When the row was written, *not* when the work happened. |

### Dimensions

- **`Ticket`** (keyed on `ticketNumber: Int!`) — `office`, `ticketTitle`,
  `ticketLink`, `color`. A shared lookup row: all users see the same office and
  title for a given ticket. `color` is a user-chosen identity color (`#rrggbb`,
  nullable, validated in `lib/ticketColor.ts`, never by the DB).
- **`WorkLog`** — `name`, `description`, `workLogDate`, `isDeleted`. One per
  user per day in practice. Soft-deletable (see the trap in §7).
- **`User`** — `username`, `email`, `userType`, plus ~10 display-preference
  columns (opacity, blur, corners, weekend toggle). The preferences are **not
  analytic data**; ignore them except `dashboardShowWeekends`, which an existing
  widget reads.
- **`Team`** / **`TeamMember`** — many-to-many. `Team.weeklyTargetHours` is
  nullable and is the only *target* anywhere in the schema, so it's the only
  thing attainment can be measured against.
- **`UserType`** / **`Feature`** / **`UserTypeFeature`** — permission tiers.
  Low analytic value; they gate *who sees what*, not what's measured.
- **`ColorScheme`** / **`Theme`** — runtime theming (see §5). Not data to chart.
- **`GoogleCalendarConnection`** — holds a live OAuth credential. Every
  operation over it is `NO_ACCESS`. **Not chartable, don't propose it.**

### Volume & cardinality (from `scripts/seed-stress-test.mjs`, realistic shape)

- ~9,900 time entries for the primary seeded user, spanning multiple years.
- 12 offices (`"01"`–`"12"`), ~6 recurring applications, 4 teams, several
  hundred tickets with a handful of high-frequency ones.
- Entry durations cluster on 15-minute boundaries; a day is typically
  5–20 entries. Weekends are mostly but not entirely empty.

---

## 2. Derivable measures

Everything below is already computable from the fields above — no schema change:

duration · entry count · distinct-ticket count · active-day count ·
day/week/month/weekday bucket totals · per-ticket and per-office shares ·
**start-of-day and end-of-day clock times** · **hour-of-day distribution** ·
**within-day gaps and overlaps** · **entry-duration distribution** ·
**entries-per-day (fragmentation)** · **`createdAt - date` logging lag** ·
**per-ticket first-touch → last-touch calendar span** · un-ticketed share ·
team totals and attainment vs. `weeklyTargetHours`.

Bolded ones are **not currently visualized anywhere**.

Helper libraries that already exist and should be reused rather than
reimplemented: `lib/timeTotals.ts`, `lib/weekBuckets.ts`, `lib/monthBuckets.ts`,
`lib/dayKeys.ts`, `lib/weekdayBreakdown.ts`, `lib/adminTeamMetrics.ts`.

---

## 3. What's already built

**Dashboard → Overview** (`components/Dashboard/OverviewReport.tsx`) — owns one
week selector and a weekend toggle; every widget below is presentational
(entries in, chart out):

| Widget | Question it answers | Form |
|---|---|---|
| `WeeklyStatTiles` | How was this week vs. last? | 4 tiles + deltas |
| `WeekdayBreakdown` | Which days, and on what? | Per-day hero number + ranked ticket list |
| `WeeklyTicketColumns` | Top tickets this week | Columns |
| `TicketsByOffice` | Which offices this week | Grouped by `Ticket.office` |
| `WeeklyTrendChart` | Hours per week over 4/12/26/52w | Line |
| `CalendarHeatmap` | Which days, year-to-date | Sequential heatmap |
| `MonthlyHoursBar` | Hours per month this year | Bars |
| Two all-time tiles | Total hours / total entries | Tiles |

**Dashboard → Tickets:** weekly ticket breakdown + horizontal hours bar chart.
**Dashboard → Work Logs:** 3 stat tiles + hours bar chart.
**Dashboard → Admin** (feature-gated, cross-user): team selector, range toggle,
team totals (incl. attainment vs. target), per-member cards with top ticket,
an ISO stacked bar chart, and a per-member day drill-down dialog.

So: **day, week, month, and year-over-calendar are well covered. Time-of-day,
duration shape, and anything distributional are not covered at all.**

---

## 4. Rendering stack

**There is no charting library.** No Recharts, Chart.js, nivo, or Plotly.
Everything is hand-rolled SVG on top of `d3-scale`, `d3-shape`, and `d3-array`.
Shared pieces: `components/Dashboard/ChartTooltip.tsx`,
`components/Dashboard/StatTile.tsx`, `components/Admin/IsoStackedBarChart.tsx`.

Practical consequence: **a proposal's cost is roughly "how much custom SVG does
this need."** A mark type with no precedent in the repo (violin, beeswarm,
sankey, calendar-ribbon) is a from-scratch build. Say so explicitly if you
propose one — it may still be the right call, but it should be a deliberate
trade rather than a surprise.

---

## 5. Hard constraints

**Color is runtime-themed and must stay that way.** Users pick a `ColorScheme`
(Ocean/Forest/Sunset/Grape) × light/dark, applied as CSS custom properties at
runtime. **No widget may hardcode a hex palette.** All color goes through
`components/Dashboard/chartColor.ts`:

- Categorical: 8 hues derived by `hue-rotate()`-ing the single `--accent` token
  in 45° steps. A fixed budget — `CATEGORICAL_HUE_COUNT = 8`, never cycled;
  callers with more categories must fold the overflow into "Other".
- **Flagged, unresolved:** that rotation table has never been run through a
  colorblind-vision validator. **Worth your opinion.** It's also why stacked
  multi-color marks have been avoided so far (see the deferred decision below).
- Sequential: one hue, lightness steps mixed toward `--surface` in OKLCH — this
  one is perceptually sound and dark-mode-correct by construction.
- Status (up/down/flat) uses fixed `--success`/`--danger`, deliberately *not*
  scheme-derived, so good/bad never shifts meaning.
- `Ticket.color` overrides the categorical slot when a user has set one and
  `User.ticketColorsEnabled` is on (`hooks/useTicketColors.ts`).

**Widget count on the Overview is capped at ~8.** Reading speed degrades past
~10 elements. A 9th widget means something comes out — propose the swap.

**No server-side aggregation exists.** Data arrives as flat entry arrays via
paginated fetch (500/page, `lib/dataconnectPagination.ts`), aggregated in the
browser. The Overview issues **exactly two** date ranges: week-scoped (selected
+ prior week) and long-horizon (52 weeks back). Proposals that fit inside those
two windows are nearly free. **Anything needing all-time or multi-year data
needs a new aggregate query first** — the two all-time stat tiles currently pull
all ~9,900 rows to length-check them, which is known debt, not a pattern to
follow.

**Authorization splits the surface in two.** Client-callable queries are
self-only (`user: { googleUid: { eq_expr: "auth.uid" } }`). Any cross-user read
must be a `NO_ACCESS` operation behind a server route gated by
`requireFeature` — this was a real IDOR fix, not a style preference. So:
**single-person views go on the Overview; anything comparative lives in Admin.**
Admin queries also deliberately omit `description` — an admin counting hours has
no reason to receive what someone wrote. Keep that line.

**One deferred decision, not rejected:** box-and-whisker / distributional marks
were deferred because with one person's data they answer a question nobody is
asking. The stated condition for revisiting is **the admin view making
cross-person comparison the actual question.** If your proposal is
distributional, aim it there.

---

## 6. Fields that look useful but aren't

- **`TimeEntry.officeNumber`** — vestigial. Mutations deliberately stopped
  writing it; office is read from `Ticket.office` instead, so the entry column
  holds stale values for older rows and nulls for newer ones. Querying it will
  produce a plausible-looking wrong answer.
- **`User` display preferences** — opacity/blur/borders/corners are UI taste,
  not behavior worth charting.
- **`Theme` / `ColorScheme` rows** — infrastructure for §5.
- **`UserType` / `Feature`** — permission plumbing.
- **`GoogleCalendarConnection`** — credential store, `NO_ACCESS` throughout.

---

## 7. Traps

1. **Timezone day keys.** Never build a day key with
   `date.toISOString().slice(0, 10)` — it shifts the day for UTC-positive
   timezones. This was a live bug in `CalendarHeatmap`: every cell read the
   wrong day's minutes, invisible in local (UTC-negative) testing. Always use
   `normalizeDayKey()` / `toDayKey()` from `lib/dayKeys.ts`.
2. **Soft-deleted work logs.** `WorkLog.isDeleted` entries must be excluded from
   every total. Existing queries handle it with a three-branch `_or`
   (`isDeleted: false` OR `isDeleted` null OR `workLogId` null) — the null cases
   are load-bearing, not defensive padding. A past bug counted deleted logs'
   hours in every total.
3. **Offset pagination needs a total order.** Queries paged through
   `fetchAllPages` order by a non-unique column *plus* `id` as tiebreaker.
   Without the tiebreaker, rows duplicate and vanish across page boundaries —
   measured at 4,835 fetched / 4,784 unique in one case.
4. **Entries may overlap.** Nothing in the schema prevents two entries covering
   the same minutes. Summing durations can exceed wall-clock elapsed time, so
   any "% of day" or coverage-style viz needs an explicit stance on overlap.
5. **`Ticket.color` is unvalidated text.** A malformed value reaching a CSS
   `color-mix()` silently drops the whole declaration. Read it through
   `lib/ticketColor.ts`.
6. **No categories, no billable flag, no project field.** The only grouping
   dimensions that exist are ticket, office, work log, and team. If a proposal
   needs anything else, it needs a schema change — call that out.
7. **All-time fetches are slow** (~9,900 entries, several seconds). Browser
   verification must let the page settle before asserting on computed values.

---

## 8. Open questions

1. Is the 8-hue `hue-rotate()` categorical palette defensible for CVD, and if
   not, what replaces it that still derives from one runtime `--accent` token?
2. Time-of-day is the largest wholly unexploited dimension. What's the right
   mark for it here — hour × weekday matrix, per-day span ribbons, something
   else?
3. Fragmentation / context-switching (entries per day, median entry length,
   distinct tickets per day) is computable today. Is it one widget or three?
4. Given the ~8-widget cap, which of the existing Overview widgets is the
   weakest and should be first out?
5. Does the deferred distributional work belong in Admin now, and in what form?
