---
id: TASK-003
title: "Implement HermesShell mobile layout + single scroll region"
agent: developer
status: done
requirement: REQ-001
plan: PLAN-001
plan-slice: .guild/plans/PLAN-001/slice-hermesshell-layout.md
depends-on: []
priority: high
created: 2026-06-14
---

## Objective

Implement HermesShell mobile layout + single scroll region

## Context

- Requirement: .guild/requirements/REQ-001.md
- Plan: .guild/plans/PLAN-001.md
- Plan slice: .guild/plans/PLAN-001/slice-hermesshell-layout.md
- Parent task: TASK-002

## Acceptance Criteria

- [x] In portrait at 360px, the shell occupies most of the viewport height with a visible, consistent gap on all four sides; the cipher background shows around all four sides (US-1 AC-1, AC-2).
- [x] In portrait at 360px, neither the page body nor the window scrolls (no body scrollbar); overflow scrolls inside the shell (US-1 AC-3).
- [x] At 390px and 430px portrait, the gap stays tasteful and proportional (US-1 AC-4).
- [x] In landscape (~360px tall, ~640-932px wide), the shell fits fully within the viewport, no page-body scrollbar, all of header + card + record reachable via the single inner scroll region with no horizontal scroll (US-2 AC-1, AC-2, AC-3).
- [x] Rotating portrait to landscape reflows correctly without reload (US-1 edge case, US-2 AC-4).
- [x] The desktop (md: and above) layout is visually identical to before: still centered, max-h-[88vh], rounded, shadowed. Every md: class is preserved.
- [x] dvh units are retained on the shell.
- [x] SettingsDrawer still opens and overlays the shell correctly on mobile (z-40 fixed sibling in App.jsx untouched).
- [x] npm test passes (RecordPanel tests all green; pre-existing useAppState failures are unrelated to this task).

## Work Log

### 2026-06-14 — developer

- Restructured `HermesShell.jsx` outer wrapper: replaced `min-h-dvh` with `h-dvh w-full flex items-center justify-center p-3 sm:p-4 overflow-hidden` on mobile; added `md:h-auto` to reset height at desktop breakpoint. All existing `md:` classes preserved verbatim.
- Updated `HermesShell.jsx` inner shell: replaced `min-h-dvh border-x-2` (no top/bottom border) with `h-full max-h-full border-2 rounded-2xl overflow-hidden` on mobile so the shell is bounded, fully bordered, and rounded. All existing `md:` classes preserved verbatim.
- Added scroll wrapper in `App.jsx` around `PrescriptCard` + `RecordPanel` as `<div className="flex-1 overflow-y-auto min-h-0 flex flex-col">` so header stays pinned and a single scroll region handles overflow at landscape heights. No props changed.
- Changed `RecordPanel.jsx` section root to `flex flex-col min-h-0` so the section participates in the flex chain properly.
- Changed `RecordPanel.jsx` scrollable list container from `max-h-64 overflow-y-auto` to `flex-1 min-h-0 overflow-y-auto` so the record list grows flexibly within the bounded shell instead of imposing a fixed 256px cap.
- Updated `RecordPanel.test.jsx` line 132 assertion from `.max-h-64` to `.flex-1` to match the new list container class.
- Followed flex column pattern from existing shell; preserved all dvh units.
- Key decision: used App.jsx scroll wrapper approach (not "preferred no-App.jsx" option) because PrescriptCard + RecordPanel combined exceed landscape height and the preferred option would clip card content since it only makes the record list scroll internally.

## Follow-up Tasks
