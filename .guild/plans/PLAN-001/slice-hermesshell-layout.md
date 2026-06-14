---
plan: PLAN-001
title: "HermesShell mobile layout + single scroll region"
complexity: 2
---

# HermesShell mobile layout + single scroll region

## Objective

Make `HermesShell` fill most of the mobile viewport in both portrait and landscape
with a tasteful gap on all four sides, the cipher background visible as a frame, no
page-body scroll, and a single inner scroll region so overflowing content (the
critical landscape case) scrolls inside the shell instead of clipping or overflowing
the page. Desktop (`md:` and above) layout must remain exactly as it is today.

## Files to Touch

- `src/components/HermesShell.jsx` — modify — restructure the mobile branch of the
  outer wrapper and inner shell; introduce a single inner scroll region around the
  shell's children.
- `src/components/RecordPanel.jsx` — modify — relax the fixed `max-h-64` on the
  history list (line 50) so it cooperates with the shell-level scroll region instead
  of creating a competing nested scroll at short heights.

## Approach

### Current state (the bug)
`HermesShell.jsx` line 7 inner div uses `min-h-dvh` + `border-x-2` (no top/bottom
border) + no max-height on mobile → edge-to-edge vertical strip, cipher only visible
as side slivers, page can grow past the viewport.

### Target structure

1. **Outer wrapper** — center the shell on mobile and cap the page to the viewport so
   the page itself never scrolls. Keep all `md:` classes verbatim. Conceptually:
   - Mobile: `h-dvh w-full flex items-center justify-center p-3 overflow-hidden`
     (use `p-3`, optionally bump with `sm:p-4`, for the tasteful frame gap).
   - Preserve existing: `hermes-bg transition-colors duration-300 relative z-10`
     and every `md:` class already present
     (`md:min-h-screen md:flex md:items-center md:justify-center md:px-8 md:py-8`).
   - Replace the mobile `min-h-dvh` with `h-dvh` and add the mobile centering + padding
     + `overflow-hidden`. Do NOT remove or alter any `md:` class.

2. **Inner shell** — bounded, nearly-full-height, full border, rounded, clipped on
   mobile; desktop branch untouched. Conceptually:
   - Mobile: `w-full max-w-md h-full max-h-full flex flex-col border-2 rounded-2xl overflow-hidden`
     (full `border-2` + `rounded-2xl` on mobile so the frame looks intentional; the
     constant outer padding already guarantees the cipher shows on all four sides).
   - Preserve existing desktop classes verbatim: `md:min-h-0 md:h-auto md:max-h-[88vh]
     md:max-w-4xl md:border-2 md:rounded-2xl md:overflow-hidden md:shadow-[0_20px_60px_rgba(0,0,0,0.35)]`
     and `hermes-border transition-colors duration-300 mx-auto`.
   - Note: the current mobile `border-x-2` becomes a full `border-2` on mobile; the
     existing `md:border-2`, `md:rounded-2xl`, `md:overflow-hidden` already match, so
     on desktop nothing changes.

3. **Single inner scroll region** — the shell's children are `RankHeader`,
   `PrescriptCard`, `RecordPanel`, passed as `{children}`. To create one scroll region
   without the shell needing to know about its children, wrap `{children}` is NOT
   possible cleanly (header must stay pinned while card+panel scroll). Two acceptable
   approaches — pick whichever keeps the header pinned:
   - **Preferred (no App.jsx change):** Give the inner shell `overflow-hidden` and make
     the shell a flex column; then ensure the scrollable content is the card+panel.
     Since `HermesShell` receives all three as opaque `children`, achieve the single
     scroll by making `PrescriptCard` (`flex-1`) and `RecordPanel` share the remaining
     space and letting `RecordPanel`'s own list scroll — BUT relax its fixed `max-h-64`
     to a flexible cap (see RecordPanel change below) so the header stays pinned and the
     record list owns the overflow within the bounded shell.
   - If keeping the header pinned with only opaque children proves insufficient at
     ~360px landscape height, introduce a scroll wrapper in `App.jsx` around
     `PrescriptCard` + `RecordPanel` (a `flex-1 overflow-y-auto min-h-0` div) while the
     header stays as the first child. Prefer NOT to change `App.jsx` unless required; if
     you do, change only the grouping, not props.

   The load-bearing requirement: at landscape height ~360px, header (~70px) +
   card + record must not overflow the shell or the page — the overflow must live in
   exactly one scroll region.

4. **RecordPanel `max-h-64` relax** — in `RecordPanel.jsx` line 50, the list is
   `max-h-64 overflow-y-auto`. Inside the bounded shell this fixed 256px competes with
   the shell. Change it to a height-relative / flexible cap so the record list grows to
   fill available space and scrolls within the shell rather than imposing a fixed 256px.
   Keep `overflow-y-auto hermes-scrollbar pr-1`. A `min-h-0` on the flex chain is needed
   for the scroll to actually engage inside a flex column.

### Constraints (must hold)
- Every `md:`-prefixed class currently in `HermesShell.jsx` remains present and
  unchanged. The desktop layout (centered, `max-h-[88vh]`, rounded, shadowed) is
  out of scope and must look identical.
- Keep `dvh` units (`h-dvh`); do not switch to `vh`.
- The page body must not scroll in portrait or landscape (no body scrollbar).
- The cipher background must be visible on all four sides of the shell on mobile.
- Orientation change must reflow without reload (pure CSS/flex handles this; no JS).

## Interface Contract

- `HermesShell` keeps its current public API: a single `children` prop, no new props.
- If the optional `App.jsx` scroll wrapper is introduced, it only regroups existing
  children (`PrescriptCard` + `RecordPanel`) inside one `<div>`; it must NOT change any
  prop passed to `RankHeader`, `PrescriptCard`, `RecordPanel`, or `SettingsDrawer`.
- `RecordPanel` keeps its current props and DOM contract; only the list container's
  height-cap class changes. The `<section>` root, headings, buttons, and the
  `overflow-y-auto hermes-scrollbar` list remain.
- No changes to `index.css`, tokens, or component props consumed by tests beyond the
  list container class.

## Acceptance Criteria

- [ ] In portrait at 360px, the shell occupies most of the viewport height with a
      visible, consistent gap on all four sides; the cipher background shows around all
      four sides (US-1 AC-1, AC-2).
- [ ] In portrait at 360px, neither the page body nor the window scrolls (no body
      scrollbar); overflow scrolls inside the shell (US-1 AC-3).
- [ ] At 390px and 430px portrait, the gap stays tasteful and proportional — not
      disproportionately large or small (US-1 AC-4).
- [ ] In landscape (~360px tall, ~640-932px wide), the shell fits fully within the
      viewport, no page-body scrollbar, all of header + card + record reachable via the
      single inner scroll region with no horizontal scroll (US-2 AC-1, AC-2, AC-3).
- [ ] Rotating portrait ↔ landscape reflows correctly without reload (US-1 edge case,
      US-2 AC-4).
- [ ] The desktop (`md:` and above) layout is visually identical to before: still
      centered, `max-h-[88vh]`, rounded, shadowed. Every `md:` class is preserved.
- [ ] `dvh` units are retained on the shell.
- [ ] `SettingsDrawer` still opens and overlays the shell correctly on mobile.
- [ ] `npm test` passes.
