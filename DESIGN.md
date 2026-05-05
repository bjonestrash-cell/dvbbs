# DVBBS HQ — design system

This document is the source of truth for visual language across the app.
Anchor page: `/tour` (List view). Every surface answers to it.

The intent is **editorial, premium, restrained**. New York Times Magazine
product team, not generic SaaS dashboard. Typography does the work.
Color is information, never decoration. Hairlines, not chrome.

## 1. Type families and roles

Three families. Each carries exactly one role per surface; never let two
families compete for the same job.

- **Display** (Geist Sans) — page heroes, section anchors, primary card
  titles. Lowercase by default for hero titles. Negative letter spacing
  -0.005 to -0.025 depending on size.
- **Sans** (Inter) — body, descriptions, inline values, secondary card
  titles, form text.
- **Mono** (Geist Mono) — eyebrows, markers, labels, codes (IATA, ISRC,
  flight number), tabular numerics, dates and times. Uppercase + tracked
  out for labels (0.14em); plain for numerics.

The full type scale is documented at the top of `src/app/globals.css`.

## 2. Page frame

Every page surface uses the same frame. PageHeader at top, content below.

### PageHeader

- Eyebrow: mono uppercase 10px tracking 0.14em fg-faint, plus a faint
  " /" suffix. Examples: `TOUR /`, `CATALOG /`, `TRAVEL /`.
- Title: display lowercase, `clamp(28px, 4.5vw, 48px)`, weight 500,
  letter-spacing -0.025em, line-height 1. Always lowercase.
- Accent rule: 1px tall, 16px wide, `bg-accent`. Sits 4-8px below the
  title. The only place the accent color appears as a flat fill anywhere
  on the page — its job is to signal "this is the masthead."
- Description (optional): sans 14-15px, fg-dim, leading 1.55-1.6,
  max-w 520px.
- Actions: right-aligned on desktop (`sm:items-end`), wrapping below the
  title block on mobile. Buttons use the standard `sm` size.

Padding: `px-6 md:px-10` horizontal, `pt-6 md:pt-10` / `pb-7 md:pb-10`
vertical. Bottom hairline separator.

### Body padding

- Page-level horizontal: `px-6 md:px-10`.
- Vertical breathing: `pt-6 md:pt-8` for the first child after the
  header. `pb-10` at the page bottom.

## 3. Cards and rows

The core unit. Two flavors: **row** (horizontal, dense, list context) and
**panel** (block, contains a small section of related content).

### Row card

```
border border-line bg-surface
hover:border-line-strong hover:shadow-[0_4px_12px_rgba(26,22,18,0.04)]
[transition-duration:80ms]
```

- 1px hairline border. Never colored fills, never tinted backgrounds.
- Hover lifts the border to `line-strong` and adds a soft shadow.
  No translate, no scale, no tilt. The surface stays put.
- Content uses an explicit grid on desktop with named columns; collapses
  to a flex stack on mobile.
- `py-3` to `py-4`, `px-3` to `px-4`.

### Panel card

```
border border-line bg-surface p-5 md:p-6
```

- Same hairline rules. No hover unless the whole panel is a link.
- Internal section uses `marker` + `display 18-20px` heading.

### Color in cards

- **Status indicators only.** A 2px left edge in the status color is
  permitted on draggable kanban tiles. A small status dot before the
  title is permitted anywhere a status pill would otherwise live.
- **Never** fill the card background with a status tint. Even a 5%
  tint reads as decoration and breaks the editorial register.
- **Never** use a badge / chip with a colored fill (red banner, green
  pill). Status is communicated via the dot+label `StatusBracket`.

## 4. Section headers (within a page body)

When a page contains multiple grouped sections (Upcoming / Past on
Flights, status groups in Releases List, etc.), each section header
follows this pattern:

```
<h2 className="font-display text-[18px] text-fg" style={{ fontWeight: 500 }}>
  {title}
</h2>
<span className="opacity-50 font-mono text-[11px]">·</span>
<span className="num font-mono text-[11px] tracking-[0.06em] text-fg-faint">
  {count.toString().padStart(2, "0")}
</span>
```

`pb-4` below the header before the section content.

A `marker` (mono uppercase 10px tracking 0.14em) may appear above the
display heading when there's room and the section is a featured block.

## 5. Filter row

Above a list with multiple filter dimensions:

- Search input: `h-10 border border-line bg-surface px-3 sans 14px`,
  search icon at `left-3` 16px fg-faint.
- Date range or numeric inputs: `h-10` matching the search.
- Filter pills (`FilterBracket`): `h-10 md:h-8` rounded-full hairline.
  Active state inverts to `bg-inverted text-fg-inverted`.
- Filter row sits below the PageHeader, above the content sections,
  with `border-b border-line` to separate.

## 6. Empty states

Use the existing `<EmptyState>` component. Centered, generous vertical
padding, `ChevronGlyph` ornament at top, display 20-24 weight 500
title, sans 13 fg-dim subline, optional action button below.

## 7. Hover, focus, motion

- Default transition: `[transition-duration:80ms]` for hover. Apple-grade
  speed, not laggy.
- Focus ring: `1px solid var(--color-accent)` with 2px offset, declared
  globally in `globals.css`.
- Drag and drop: `120ms` for the slot transitions, no bounce.
- Reduced-motion: globals.css already disables animations under
  `prefers-reduced-motion`.

## 8. Color discipline

The cream page is the canvas. The white surface is the elevation. The
warm near-black is the type. Hairlines are the structure.

The accent (warm coffee `#8b6f4e`) is reserved for:
- The PageHeader's accent rule.
- The "Today" marker in calendars and timelines.
- Active state of the kanban left-edge for `released` / `scheduled`
  status tiers (because their status palette IS the accent family).
- Charts: the `merch` series in the finance bar chart, the line color
  in the merch sales chart.

Status palette (warm desaturated) is reserved for:
- Status dots (`StatusBracket`).
- Kanban left-edge accent (2px).
- Optional 1px column-header dot in a kanban.

That's the entire color budget. No buttons in color, no tabs in color,
no CTAs in color. Primary CTA is the inverted (black) button. Secondary
is the bracket (white + hairline) button.

## 9. Density expectations

A row should display in ~40-56px of vertical space on desktop. A
kanban tile in ~52-72px. A card in ~96-160px. If a card is taller than
160px without scrollable content, it's probably trying to do too much
and should be a panel with rows inside, or a detail page link target.

The Flights page's upcoming list is the test case — boarding-pass
cards at ~140px each with 56px airport codes broke this rule. Now
collapsed to row-style cards at ~64px.

## 10. What's allowed to differ between pages

The system is in *typography, spacing rhythm, card construction, and
color discipline* — not in identical layouts. Pages that legitimately
need different layouts:

- Tour calendar — month grid is a different layout but the eyebrow,
  title, accent rule, and card surface inside cells all follow the
  system.
- Releases kanban — column-and-tile layout is a different layout but
  every tile is the same row-card construction with a status edge.
- Merch grid — product tiles with cover art are a grid because product
  is visual; tiles use the same hairline + 80ms hover.
- Smart-link public landing (`/link/[slug]`) — fan-facing, allowed a
  small flair allowance (cover art prominent, gradient backdrop) but
  inherits the type families.

When in doubt: copy the Tour List rhythm and adapt.
