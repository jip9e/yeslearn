# YesLearn Visual Architect Audit — 2026-02-11

> Full codebase review of every page, component, layout, and CSS token. Covers visual consistency, dark mode, accessibility, information architecture, responsive design, and code quality.

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Design System & Token Health](#2-design-system--token-health)
3. [Dark Mode Audit](#3-dark-mode-audit)
4. [Page-by-Page Findings](#4-page-by-page-findings)
5. [Component-Level Findings](#5-component-level-findings)
6. [Accessibility (A11y)](#6-accessibility)
7. [Responsive & Layout](#7-responsive--layout)
8. [Information Architecture](#8-information-architecture)
9. [Performance & Code Quality](#9-performance--code-quality)
10. [Prioritized Fix List](#10-prioritized-fix-list)

---

## 1. Executive Summary

The app has a solid foundation: semantic CSS variables, a consistent Inter font, reasonable component structure, and good accessibility basics (aria-labels, focus-visible rings, role attributes). Previous sessions addressed the worst blockers (broken dark mode tokens, fake UX, missing confirmations).

**Key remaining issues (in order of severity):**

| # | Issue | Severity | Impact |
|---|-------|----------|--------|
| 1 | Hardcoded colors bypass the design system on 4 marketing pages | 🔴 High | Dark mode inconsistency, maintenance burden |
| 2 | Space detail page (`/space/[id]`) has hardcoded `text-white` everywhere in the AI panel | 🔴 High | Breaks in light mode — white text on white bg |
| 3 | Duplicate `@layer base` blocks in globals.css | 🟡 Medium | Cascade confusion, double `body` rule |
| 4 | `prose-ai-dark` requires manual class toggling, not reactive to `.dark` | 🟡 Medium | Dark prose styling unreliable |
| 5 | Layout triple-duplication across dashboard/settings/space layouts | 🟡 Medium | Maintenance risk |
| 6 | Color palette limited to 4 grays for spaces (no meaningful choice) | 🟡 Medium | UX feels restricted |
| 7 | Pricing page bypasses semantic tokens entirely | 🟡 Medium | Visual drift from rest of app |
| 8 | No `<meta name="theme-color">` or viewport meta in layout | 🟠 Low | Mobile chrome UI mismatch |
| 9 | Several unused Lucide icon imports | 🟢 Info | Bundle bloat |

---

## 2. Design System & Token Health

### ✅ What's working
- CSS custom properties for all core tokens (background, foreground, card, primary, etc.)
- Proper `.dark` class variant with distinct values
- Semantic Tailwind aliases via `@theme` block (`bg-background`, `text-foreground`, etc.)
- Single font (Inter) with consistent weight scale
- Consistent radius tokens (`--radius-sm: 8px`, `--radius-md: 16px`, `--radius-lg: 24px`)

### 🔴 Issues

**2.1 Duplicate `@layer base` blocks**
`globals.css` has **two** `@layer base` declarations:
- Lines ~76–140: Defines `:root` / `.dark` variables, heading styles, container, font classes
- Lines ~169–175: Applies `@apply border-border` and `@apply bg-background text-foreground`

These should be merged into a single `@layer base` block. Having two can cause subtle cascade ordering issues depending on build tooling.

**2.2 Hardcoded warm utilities are unused / orphaned**
```css
.bg-warm { background-color: #faf9f7; }
.bg-warm-subtle { background-color: #f5f3ef; }
.text-warm { color: #4a4a4a; }
.text-warm-muted { color: #8a8a8a; }
.border-warm { border-color: #e8e5df; }
```
These don't appear in any component. Dead code — should be removed.

**2.3 `prose-ai-dark` is a separate class, not a `.dark` descendant**
All `.prose-ai-dark` styles require manually adding a second class. If you forget it (or the dark state changes dynamically), dark prose styling breaks. Should be refactored to:
```css
:is(.dark) .prose-ai { /* dark overrides */ }
```

**2.4 Chart colors are hardcoded hex**
```css
--color-chart-1: #ff6600;
--color-chart-2: #2d8659;
```
These don't change in dark mode. If charts are used, they'll have fixed colors regardless of theme. Minor — only matters if charts are visible.

**2.5 Shadow `--shadow-air` uses `rgba(0,0,0,0.05)` — too subtle in light, invisible in dark**
No dark variant exists. Cards using `shadow-air` class will have no visible shadow in dark mode.

---

## 3. Dark Mode Audit

### Token layer: ✅ Fixed (previous session)
The `@theme` block correctly maps `--color-*` to `var(--*)`, and `.dark` class provides distinct values. This is solid.

### Component layer: 🔴 Major issues remain

**3.1 `/space/[id]/page.tsx` — Hardcoded `text-white` throughout AI panel**

The entire right-side AI panel uses hardcoded dark-theme colors:
- `text-white` appears **23+ times** in the AI panel (learn tab labels, chat messages, quiz options, summary headings)
- `bg-white` appears in SelectionToolbar, ToolCard, content cards
- `dark:bg-gray-900`, `dark:bg-gray-800`, `dark:text-gray-400` throughout

This means **in light mode, many elements show white text on white/light backgrounds** — unreadable.

**Examples:**
```tsx
// Learn tab — button label hardcoded white
<span className="text-[13px] font-medium text-white">Summary</span>

// Summary heading
<h4 className="text-[14px] font-bold text-white">Summary</h4>

// Chat input
className="... text-white placeholder:text-muted-foreground"

// Quiz question
<p className="text-[13px] font-medium text-white mb-3">

// Tab bar — active tab
"bg-background text-white border border-border"
```

**Fix:** Replace all `text-white` with `text-foreground`, all `bg-white` with `bg-background` or `bg-card`, and remove explicit `dark:` prefixed color overrides in favor of semantic tokens.

**3.2 Pricing page (`/pricing/page.tsx`) — Full bypass**
Uses hardcoded:
- `bg-white dark:bg-[#0b0b0b]`
- `bg-[#f8f8f8] dark:bg-[#171717]`
- `border-[#e5e5e5] dark:border-[#2a2a2a]`
- `text-gray-600 dark:text-gray-400`
- Popular plan card: `bg-black text-white` (intentional contrast — acceptable)

Should use `bg-background`, `bg-card`, `border-border`, `text-muted-foreground` etc.

**3.3 Contact page (`/contact/page.tsx`) — Same bypass pattern**
Same hardcoded `bg-white dark:bg-[#0b0b0b]`, hex borders, explicit gray text classes.

**3.4 Careers page (`/careers/page.tsx`) — Same bypass pattern**
Identical issue. Uses `text-[#666]`, `text-[#999]`, `bg-[#f1f1f1] dark:bg-[#1f1f1f]`.

**3.5 Resize handle dark styles use `:is(.dark)` selector**
This is actually correct — it matches the `@custom-variant dark` setup. ✅

---

## 4. Page-by-Page Findings

### 4.1 Landing Page (`/page.tsx`) ✅ Good
- Uses semantic tokens throughout
- Clean section structure
- CTA buttons use `bg-primary text-primary-foreground` — correct
- Minor: The bottom CTA section is nearly identical to the hero CTA — consider consolidating or differentiating

### 4.2 Dashboard (`/dashboard/page.tsx`) ✅ Good
- Clean card grid with semantic tokens
- Good loading skeleton with `animate-pulse`
- `pl-14 md:pl-8` padding accounts for mobile sidebar toggle button — works but fragile
- `QUICK_ACTIONS` array is clean and maintainable

### 4.3 Add Content (`/dashboard/add/page.tsx`) ✅ Good
- Form semantics excellent (fieldset/legend, label associations, required indicators)
- Error clearing on input change — nice UX
- Proper `role="radiogroup"` on content type selector
- `clearError()` pattern is clean

### 4.4 New Space (`/space/new/page.tsx`) ✅ Good
- Live preview is a nice touch
- Color options limited to 4 neutral grays (Slate/Zinc/Stone/Gray) — makes the feature feel pointless. Either add real colors or remove the selector.
- Proper fieldsets and radio roles

### 4.5 Space Detail (`/space/[id]/page.tsx`) 🔴 Needs Work
**This is the most complex page and has the most issues.**

- **Hardcoded `text-white`** — see §3.1 above. Critical light-mode breakage.
- **Massive monolith** — 1442 lines in a single file. The entire study experience (content list, content viewers, AI panel with learn/chat tabs, quiz engine, selection toolbar, resize logic) lives here. Should be split into ~8-10 focused components.
- **ToolCard component defined but never used** — `ToolCard` is defined inline but the learn tab uses custom inline buttons instead. Dead code.
- **Content grid hardcodes `bg-white dark:bg-gray-900`** instead of semantic tokens
- **YouTube embed**: `allow` attribute is comprehensive ✅
- **Chat sessions state is ephemeral** — all sessions lost on page reload. Expected for MVP but worth noting.
- **`handleTextSelection`** — the 200ms delay before clearing selection toolbar could cause ghost toolbar flashes
- **Multiple unused imports**: `Search`, `Sparkles`, `Hash`, `Maximize2`, `Minimize2`, `ExternalLink` are imported but some aren't used in the render

### 4.6 Settings (`/settings/page.tsx`) ✅ Good
- Provider cards are well-structured
- Device code flow UX is thorough (copy code → open GitHub → poll)
- Tab navigation with arrow keys — proper roving tabindex ✅
- Model selector with optgroups — clean
- UTF-8 corruption in source comments (`â"€â"€` instead of `──`) — cosmetic but sloppy

### 4.7 Pricing (`/pricing/page.tsx`) 🟡 Needs Token Migration
- Hardcoded colors throughout (see §3.2)
- Popular plan design is intentionally inverted (black card) — acceptable
- FAQ section well-structured
- Missing `aria-label` or heading association on FAQ items

### 4.8 Contact (`/contact/page.tsx`) 🟡 Needs Token Migration
- Form validation is client-only (no real backend) — expected for MVP
- Hardcoded colors (see §3.3)
- Good form accessibility (labels, required indicators, aria-live for error/success)

### 4.9 Careers (`/careers/page.tsx`) 🟡 Needs Token Migration
- Job cards aren't interactive (no links/buttons) — they look clickable but do nothing
- Hardcoded colors (see §3.4)
- The "Get in Touch" fallback CTA links to `/contact` ✅

### 4.10 Privacy/Terms — Not reviewed (likely static content pages)

---

## 5. Component-Level Findings

### 5.1 Navigation (`navigation.tsx`) ✅ Solid
- Fixed header with backdrop blur — good
- Mobile hamburger with proper `aria-expanded`
- Semantic tokens used correctly
- z-index 100 is high but necessary for fixed nav

### 5.2 Sidebar (`sidebar.tsx`) ✅ Good
- Context-based collapsed/expanded state with localStorage persistence
- Mobile overlay with backdrop
- Space list with active state detection
- Roving tabindex could be added for keyboard navigation in space list (minor)

### 5.3 Hero (`hero.tsx`) ✅ Good
- App mockup is well-crafted with semantic tokens
- Responsive text sizing
- Could add `loading="lazy"` consideration for the mockup if it were an image

### 5.4 Features Grid (`features-grid.tsx`) ✅ Good
- Uses Next.js `<Image>` with `priority` — correct for above-fold
- External Supabase image URL — verify it's reliable/cached
- Semantic tokens

### 5.5 Testimonials (`testimonials.tsx`) ✅ Good
- Renamed to "use cases" content — honest, not fake testimonials ✅
- Clean card grid

### 5.6 Trusted By (`trusted-by.tsx`) ✅ Cleaned
- Previously had fake university logos — now just a simple tagline
- Could be removed entirely or expanded with real social proof later

### 5.7 Coming Soon (`coming-soon.tsx`) ✅ Good
- Clean feature preview cards
- Proper semantic tokens
- `bg-card` section background differentiates it from adjacent sections

### 5.8 Footer (`footer.tsx`) ✅ Good
- Clean link grid
- Semantic tokens
- Copyright 2026 — correct

### 5.9 PDFViewer (`PDFViewer.tsx`) ✅ Good
- Virtual scrolling with intersection observer — smart performance
- Proper memoization with `React.memo`
- Zoom controls with reset
- Page tracking via scroll position
- Hardcoded `bg-white` on individual pages (intentional — PDF pages should be white)
- Toolbar uses `bg-white/80 dark:bg-gray-900/80` — should use `bg-background/80` for consistency

### 5.10 ThemeInit (`ThemeInit.tsx`) ✅ Good
- Reads localStorage, applies dark class — clean
- Handles "auto" with `prefers-color-scheme` media query
- Runs in `useEffect` — may cause brief FOUC on dark mode. Consider inline script in `<head>` instead.

---

## 6. Accessibility

### ✅ Strengths
- Focus-visible outlines on all interactive elements (global rule in CSS)
- `aria-label` on icon-only buttons throughout
- `role="tablist"`, `role="tab"`, `role="tabpanel"` with proper relationships
- `role="radiogroup"` for selection groups
- `aria-live="polite"` on error/success messages
- `aria-expanded` on collapsible elements
- Loading states use `role="status"` with labels
- Delete confirmation dialog before destructive actions

### 🟡 Issues
- **Skip navigation link missing** — No "skip to main content" link for keyboard users
- **Color contrast**: `--muted-foreground: #6b7280` on `--background: #ffffff` = 4.5:1 ratio — passes AA for normal text but fails for small text (< 14px). Several UI elements use `text-[11px]` or `text-[12px]` with muted-foreground.
- **Focus trap missing on mobile sidebar** — When mobile sidebar opens, focus isn't trapped inside it. Users can tab to elements behind the overlay.
- **Focus trap missing on mobile AI panel** — Same issue with the AI panel slide-in overlay
- **Careers job cards** — Look interactive (hover styles) but aren't buttons or links. Screen readers won't announce them as actionable.
- **AI panel tab bar** — Uses `<div>` with `role="tab"` for chat session tabs. Should be `<button>` with `role="tab"` for proper keyboard semantics (Enter/Space activation handled manually but fragile).

---

## 7. Responsive & Layout

### ✅ Strengths
- `h-dvh` for app shell (dynamic viewport height — correct for mobile browsers)
- Sidebar collapses to icon-only on desktop, slides as overlay on mobile
- AI panel has mobile overlay mode at `<600px` width
- Content grids use responsive `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- PDF viewer uses ResizeObserver for container-aware page sizing

### 🟡 Issues
- **Layout duplication**: `dashboard/layout.tsx`, `settings/layout.tsx`, and `space/layout.tsx` are **identical** — same overflow lock effect, same Sidebar+main structure. Should be a shared `AppShellLayout` component.
- **`pl-14 md:pl-8`** hack on dashboard/add pages accounts for the mobile sidebar toggle button but is brittle. If the button size/position changes, these paddings break.
- **AI panel width** is stored in state but not in localStorage — resets to 420px on every page load. Minor UX friction.
- **No max-width on AI panel on very wide screens** — The panel maxes at `min(containerW * 0.7, 800)` via drag, but if you never drag, it stays at 420px. Fine.
- **Coming Soon section** uses `bg-card` which creates a visual band — intentional and works well.

---

## 8. Information Architecture

### ✅ Strengths
- Clear hierarchy: Dashboard → Spaces → Content → Study
- Sidebar provides persistent navigation with space list
- Study view has clean Content / Learn / Chat separation via tabs

### 🟡 Observations
- **No breadcrumbs** in study view — only a back arrow. For deeply nested content, breadcrumbs would help orientation.
- **Settings has only 3 tabs** — "AI Providers", "Appearance", "Data & Privacy". The tab navigation is well-built but possibly over-engineered for 3 items. A vertical list works fine (and it does use one).
- **"Trusted By" section** is essentially empty (just a tagline). Either populate it with real logos/metrics or remove it to avoid dead space.
- **Testimonials section** renamed to "How people use YesLearn" — honest and good, but with no real user quotes or data, it's still effectively hypothetical. Consider removing until there's real content.

---

## 9. Performance & Code Quality

### 🟡 Issues
- **`/space/[id]/page.tsx` is 1442 lines** — way too large for a single component. State management, UI rendering, event handlers, and sub-components are all interleaved. Should be decomposed:
  - `ContentListView` (grid view when no content selected)
  - `ContentViewer` (PDF/YouTube/text display)
  - `AIPanel` (the entire right sidebar)
  - `LearnTab` (summary/quiz generation)
  - `ChatTab` (chat interface)
  - `SelectionToolbar` (already extracted but inline)
  - `QuizView` (quiz rendering/grading)
  - `useChatSession` hook for chat state management

- **Multiple `fetch("/api/spaces")` calls** — The sidebar, dashboard, and add-content page each independently fetch spaces. A shared context or SWR/React Query cache would eliminate redundant requests.

- **`useEffect` cleanup in layout components** — The overflow lock pattern stores `prevHtmlOverflow` but if the user navigates between app routes quickly, the restore might conflict. Consider a ref-based approach or CSS-only solution (`overflow: hidden` on a wrapper div instead of `html`/`body`).

- **`ToolCard` component** defined in space detail page but never rendered. Dead code.

- **Several unused imports** in space detail: `Headphones`, `Hash`, `Maximize2`, `Minimize2` appear to be imported but not used (some may be used in truncated render paths).

---

## 10. Prioritized Fix List

### 🔴 P0 — Ship Blockers
| # | Fix | File(s) | Effort |
|---|-----|---------|--------|
| 1 | Replace all `text-white` / `bg-white` / `dark:bg-gray-*` in AI panel with semantic tokens | `space/[id]/page.tsx` | 1–2h |
| 2 | Migrate Pricing page to semantic tokens | `pricing/page.tsx` | 30min |
| 3 | Migrate Contact page to semantic tokens | `contact/page.tsx` | 30min |
| 4 | Migrate Careers page to semantic tokens | `careers/page.tsx` | 30min |

### 🟡 P1 — Quality
| # | Fix | File(s) | Effort |
|---|-----|---------|--------|
| 5 | Merge duplicate `@layer base` blocks | `globals.css` | 10min |
| 6 | Remove dead `.bg-warm*` / `.text-warm*` utilities | `globals.css` | 5min |
| 7 | Refactor `prose-ai-dark` to use `:is(.dark) .prose-ai` | `globals.css` | 15min |
| 8 | Extract shared `AppShellLayout` from 3 identical layouts | `dashboard/settings/space layout.tsx` | 30min |
| 9 | Remove dead `ToolCard` component from space detail | `space/[id]/page.tsx` | 5min |
| 10 | Add real colors to space color picker (or remove it) | `space/new/page.tsx` | 15min |
| 11 | Make careers job cards into links (or remove hover styling) | `careers/page.tsx` | 10min |
| 12 | Add skip-nav link | `layout.tsx` | 10min |

### 🟢 P2 — Polish
| # | Fix | File(s) | Effort |
|---|-----|---------|--------|
| 13 | Decompose `space/[id]/page.tsx` into focused components | `space/[id]/` | 2–3h |
| 14 | Add focus trap to mobile sidebar and AI panel overlays | `sidebar.tsx`, `space/[id]/page.tsx` | 30min |
| 15 | Move theme init to inline `<script>` to avoid FOUC | `layout.tsx` | 20min |
| 16 | Persist AI panel width in localStorage | `space/[id]/page.tsx` | 10min |
| 17 | Deduplicate spaces fetch with shared context/SWR | Multiple | 1h |
| 18 | Add `<meta name="theme-color">` | `layout.tsx` | 5min |
| 19 | Clean up unused Lucide imports | Multiple | 10min |
| 20 | Add dark variant for `--shadow-air` | `globals.css` | 5min |

---

## Summary

The app's foundation is genuinely strong — the token system, layout structure, and accessibility basics are above average for a project at this stage. The **single biggest issue** is the space detail page's AI panel using hardcoded `text-white` everywhere, which makes it unreadable in light mode. The marketing pages (pricing/contact/careers) bypassing semantic tokens is the second priority.

After fixing P0 items (est. 3h total), the app would be in a ship-ready visual state. P1 items are quality-of-life improvements that reduce maintenance burden. P2 items are architectural improvements for long-term health.
