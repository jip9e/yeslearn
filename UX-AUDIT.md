# YesLearn UX/Spec Audit — 2026-02-11

**Scope:** Dashboard, Add Content, Space Detail, Space New, Settings, Contact, Sidebar, Landing/Pricing/Footer/Nav  
**Focus:** Consistency, accessibility, interaction clarity, trust copy, dark mode parity  
**No new features.** Quality-of-existing only.

---

## Severity Labels

| Label | Meaning |
|-------|---------|
| 🔴 **P0 – Blocker** | Broken interaction, data loss risk, or WCAG A violation |
| 🟠 **P1 – High** | Confusing UX, dark-mode breakage, or WCAG AA violation |
| 🟡 **P2 – Medium** | Inconsistency, polish, minor a11y gap |
| 🟢 **P3 – Low** | Nit, copy tweak, nice-to-have |

---

## 1. CROSS-CUTTING ISSUES

### 1.1 🔴 P0 — Dark mode not applied on several pages
- **`/space/new`**: All text colors hard-coded to light-mode values (`text-[#999]`, `text-[#666]`, `bg-white`, `border-[#e5e5e5]`). No `dark:` variants anywhere except the fieldset buttons. White text on white bg in dark mode.
- **`/contact`**: Same problem — `bg-white`, `border-[#e5e5e5]`, `text-[14px]` inputs have no `dark:` variants. Form is invisible in dark mode.
- **`/pricing`**: All plan cards, FAQ section — zero `dark:` classes. White bg on dark body.
- **`navigation.tsx`**: `bg-[rgba(255,255,255,0.5)]` with no dark variant; nav links `text-[#6d6d6d]` have no dark variant. Nav becomes a white bar on dark bg.
- **`footer.tsx`**: `bg-white`, `text-[#6d6d6d]`, `text-black` — all missing `dark:` pairs.
- **Files:** `space/new/page.tsx`, `contact/page.tsx`, `pricing/page.tsx`, `navigation.tsx`, `footer.tsx`

### 1.2 🟠 P1 — Settings page has no dark: classes on most text/borders  
- Several `text-[#666]`, `text-[#999]`, `bg-[#f8f8f8]` missing dark counterparts in Settings Data & Privacy panel.
- **File:** `settings/page.tsx` — Privacy tab section

### 1.3 🟠 P1 — Inconsistent color token usage
The codebase mixes three color systems interchangeably:
- CSS custom properties (`var(--border)`, `var(--muted-foreground)`)
- Tailwind semantic classes (`text-gray-600 dark:text-gray-400`)
- Raw hex literals (`text-[#999]`, `bg-[#f1f1f1]`, `border-[#e5e5e5]`)

This makes theming brittle. The dashboard uses Tailwind gray scale; the add page uses hex literals; the AI panel uses yet another palette (`#8b5cf6`, `#1e1e3a`).

- **Recommendation:** Pick ONE system. Since Tailwind is already the framework, standardize on Tailwind color classes + `dark:` variants. Reserve raw hex only for the AI panel's brand purple.
- **Files:** All page files

### 1.4 🟡 P2 — No `<title>` differentiation per page
- Root layout sets `<title>` to "YesLearn - AI Tutor Made For You" globally.
- No page-level `metadata` exports for `/dashboard`, `/settings`, `/contact`, `/pricing`, `/space/[id]`, `/space/new`.
- Screen readers and browser tabs all show the same title.
- **Files:** Each page.tsx should export `metadata` (for server components) or use `<Head>` / `next/head` equivalent.

### 1.5 🟡 P2 — `pl-14 md:pl-8` padding hack for sidebar overlap
- Dashboard and Add Content pages use `pl-14 md:pl-8` to avoid sidebar overlap on mobile.
- This is fragile — if sidebar width changes, padding breaks. The mobile toggle button is `fixed top-3 left-3` which overlaps content.
- **Better:** The layout already uses flexbox. Remove the manual padding and let flexbox handle it. The sidebar mobile overlay already pushes content via the backdrop.
- **Files:** `dashboard/page.tsx`, `dashboard/add/page.tsx`

### 1.6 🟢 P3 — Font loading: `@import url(...)` in CSS blocks render
- `globals.css` uses `@import url('https://fonts.googleapis.com/css2?...')` which is render-blocking.
- **Better:** Use `next/font/google` for Inter, which automatically handles font optimization.
- **File:** `globals.css`, `layout.tsx`

---

## 2. DASHBOARD (`/dashboard`)

### 2.1 🟠 P1 — No error handling for failed API fetch
- `Promise.all([fetch(...), fetch(...)])` — if either fetch fails (network error, 500), `r.json()` throws and the page stays in loading state forever.
- **Fix:** Add `.catch()` per fetch, show an error state, and add a retry button.
- **File:** `dashboard/page.tsx` L67-73

### 2.2 🟡 P2 — "Welcome to YesLearn" is static, impersonal
- Header always says "Welcome to YesLearn" even after weeks of use. No user name.
- Settings page has `name: "YesLearn User"` but never persists or fetches it.
- **Quick fix:** Change to "Your Dashboard" or "Learning Dashboard" — more honest than a fake welcome.
- **File:** `dashboard/page.tsx` L97

### 2.3 🟡 P2 — Stats not interactive / not linked
- "Active Spaces", "Total Items", "Quizzes Completed" stat cards are display-only. Clicking them does nothing.
- Users expect clickable stats. At minimum, make "Active Spaces" link to the spaces section below, and "Total Items" link to the first space.
- **File:** `dashboard/page.tsx` stat cards section

### 2.4 🟡 P2 — `timeAgo()` says "1 hours ago", "1 days ago"
- No singular/plural handling for 1-unit values.
- **Fix:** `${n} hour${n !== 1 ? 's' : ''} ago`
- **File:** `dashboard/page.tsx` L54-60 (also duplicated in `space/[id]/page.tsx`)

### 2.5 🟢 P3 — Quick actions: only 3 of 4 content types shown
- "Text / Notes" content type exists in add page but missing from dashboard quick actions.
- Either add it or document the omission.
- **File:** `dashboard/page.tsx` QUICK_ACTIONS array

### 2.6 🟢 P3 — Animations may cause motion sickness
- Heavy use of `motion.div` with stagger delays. No `prefers-reduced-motion` check.
- **Fix:** Wrap animations with `useReducedMotion()` from framer-motion.
- **File:** `dashboard/page.tsx`

---

## 3. ADD CONTENT (`/dashboard/add`)

### 3.1 🔴 P0 — Error state set but not cleared on type change
- If user gets an error on YouTube type, then switches to PDF, the old error message persists.
- **Fix:** Clear `error` in `setSelectedType()` callback.
- **File:** `dashboard/add/page.tsx` — add `setError("")` when `setSelectedType` fires

### 3.2 🟠 P1 — No file size validation before upload
- PDF upload accepts "Max 50MB" per the label but there's no client-side check. A 200MB file will POST and likely fail server-side with a cryptic error.
- **Fix:** Check `file.size > 50 * 1024 * 1024` in `handleSubmit` and show a clear error.
- **File:** `dashboard/add/page.tsx` handleSubmit, PDF section

### 3.3 🟠 P1 — Success redirect has no fallback
- On success, `setTimeout(() => router.push(...), 1000)` — if router.push fails or spaceId is invalid, user is stuck on the success screen.
- **Fix:** Add error handling around the redirect, or make the success screen a link the user can click.
- **File:** `dashboard/add/page.tsx` L90-92

### 3.4 🟡 P2 — URL validation is too loose
- YouTube and website URLs only check `!url.trim()`. No actual URL format validation. User can type "hello" and it'll be submitted.
- The `<input type="url">` provides browser validation, but `handleSubmit()` bypasses it (it's a `<button onClick>`, not a `<form onSubmit>`).
- **Fix:** Add `try { new URL(url) } catch { setError("Please enter a valid URL") }`.
- **File:** `dashboard/add/page.tsx` handleSubmit

### 3.5 🟡 P2 — No drag-and-drop for PDF upload
- The upload zone looks like a drop zone (dashed border, centered icon) but doesn't support drag-and-drop.
- Users will try to drag files and nothing will happen.
- **Fix:** Add `onDragOver`/`onDrop` handlers.
- **File:** `dashboard/add/page.tsx` PDF upload button

### 3.6 🟢 P3 — Content type radio group lacks keyboard navigation
- Buttons have `role="radio"` but no `tabIndex` management. Arrow key navigation won't work as expected for a radiogroup.
- **Fix:** Set `tabIndex={selectedType === type.id ? 0 : -1}` on each button and add ArrowUp/ArrowDown key handlers.
- **File:** `dashboard/add/page.tsx` content type selector

---

## 4. SPACE DETAIL (`/space/[id]`)

### 4.1 🔴 P0 — `window.confirm()` for delete is not accessible
- Delete uses `window.confirm()` which is blocking, not styled, and provides no undo path.
- **Fix:** Replace with an inline confirmation or use a modal dialog component.
- **File:** `space/[id]/page.tsx` handleDeleteContent

### 4.2 🟠 P1 — YouTube chapters are fake/hardcoded
- The transcript section shows a hardcoded "Introduction" chapter at 00:00 with `extractedText.slice(0, 150)`. This is misleading — it's not a real chapter parser.
- Two buttons "Chapters" / "Transcripts" are rendered but non-functional (no state, no switching logic).
- **Fix:** Either make the tabs functional or remove them and show the transcript directly with a simple heading.
- **File:** `space/[id]/page.tsx` — YouTube section

### 4.4 🟠 P1 — AI panel tab architecture fragile: chat session `div` has `role="tab"` but is a `div`
- Chat session tabs use `<div role="tab">` instead of `<button>`. Divs aren't focusable by default. The `onKeyDown` handler helps but it's still not semantically correct.
- **Fix:** Change to `<button role="tab">`.
- **File:** `space/[id]/page.tsx` — chat session tabs

### 4.5 🟠 P1 — Mobile: AI panel overlaps content with no way to see content behind it
- On mobile (`< 600px`), the AI panel takes `85vw`. There's a backdrop, but no way to swipe it away. The close button is small.
- The 600px breakpoint doesn't match the 768px (md) breakpoint used elsewhere.
- **Fix:** Unify breakpoints. Consider a swipe-to-dismiss gesture for mobile.
- **File:** `space/[id]/page.tsx` — mobile detection and AI panel

### 4.6 🟠 P1 — Content items: `<button>` wrapping complex content has no accessible name
- Content grid items use `<button>` with `className` but no `aria-label`. Screen readers will read all nested text as one blob.
- **Fix:** Add `aria-label={item.name}`.
- **File:** `space/[id]/page.tsx` — content grid items

### 4.7 🟡 P2 — SelectionToolbar: hard-coded width assumption (position calc uses `window.innerWidth - 420`)
- `clampedX = Math.max(8, Math.min(position.x, window.innerWidth - 420))` — assumes toolbar is 420px wide, but it's actually variable width.
- **Fix:** Use a ref to measure actual toolbar width.
- **File:** `space/[id]/page.tsx` SelectionToolbar

### 4.8 🟡 P2 — Quiz options: no focus styling when navigating with keyboard
- Quiz answer buttons have no `focus-visible` ring.
- **Fix:** Add `focus-visible:ring-2 focus-visible:ring-[#8b5cf6]` class.
- **File:** `space/[id]/page.tsx` quiz options

### 4.9 🟡 P2 — Chat "copy" button doesn't show confirmation
- AI message copy button uses raw `navigator.clipboard.writeText` with no visual feedback.
- The `CopyButton` component exists and shows a check icon, but it's not used for AI message actions.
- **Fix:** Use `CopyButton` component consistently.
- **File:** `space/[id]/page.tsx` — AI message actions

### 4.10 🟡 P2 — Flashcards/Podcast buttons are disabled with no explanation
- Two buttons in the learn panel are `disabled` with `opacity-40 cursor-not-allowed` but no tooltip or text saying "Coming soon".
- **Fix:** Add a "Coming soon" badge or tooltip.
- **File:** `space/[id]/page.tsx` — learn panel generate grid

### 4.11 🟡 P2 — Chat input duplicated in learn tab and chat tab
- The "Ask AI" textarea at the bottom of the learn tab and the chat composer in the chat tab are duplicate UI with slightly different behavior. Typing in one doesn't affect the other (they share `chatInput` state), which is confusing.
- **Fix:** Either remove the learn-tab composer and have a single "Open chat" button, or clarify the relationship.
- **File:** `space/[id]/page.tsx`

### 4.12 🟢 P3 — `iframe` for YouTube has no `title` attribute
- `<iframe src={...} className="w-full h-full" allowFullScreen ...>` — missing `title` for a11y.
- **Fix:** Add `title={selectedItem.name || "YouTube video"}`.
- **File:** `space/[id]/page.tsx`

### 4.13 🟢 P3 — AI disclaimer copy "AI may make mistakes" is buried
- The disclaimer `<p>` is `text-[10px] text-[#444]` — nearly invisible. This is a trust/legal concern.
- **Fix:** Make it at least `text-[11px]` with proper contrast ratio (min 4.5:1 for WCAG AA).
- **File:** `space/[id]/page.tsx` — chat composer bottom

### 4.14 🟢 P3 — `showMentions` and `mentionResults` state declared but never used
- Dead state that adds noise. Remove.
- **File:** `space/[id]/page.tsx`

---

## 5. NEW SPACE (`/space/new`)

### 5.1 🔴 P0 — No dark mode support (see 1.1 above)
- Entire page is light-only. Critical for users who have set dark mode in settings.

### 5.2 🟠 P1 — Tags feature: tags are collected but never sent to API
- `handleCreate` sends `name`, `description`, `icon`, `color` — but not `tags`.
- The tags UI is deceiving: users add tags thinking they'll be saved, but they're discarded.
- **Fix:** Either send tags to the API or remove the tags UI.
- **File:** `space/new/page.tsx` handleCreate

### 5.3 🟠 P1 — Error not specific
- `setError("Failed to create space. Please try again.")` for all failure types. Could be network, validation, server error.
- **Fix:** Parse the response body for a specific error message.
- **File:** `space/new/page.tsx` handleCreate catch

### 5.4 🟡 P2 — Color and icon state not persisted if user navigates away
- No "unsaved changes" warning. User fills out the entire form, accidentally hits the "Cancel" link, and loses everything.
- **Fix:** Add `beforeunload` handler or at minimum `Link` click confirmation.
- **File:** `space/new/page.tsx`

---

## 6. SETTINGS (`/settings`)

### 6.1 🟠 P1 — Settings sidebar tabs aren't wired with proper `aria-controls`
- `aria-controls` references `${tab.id}-panel` but only Appearance and Privacy tabs have matching `id` attributes. The AI Providers tab has no panel `id`.
- **Fix:** Add `id="ai-providers-panel" role="tabpanel"` to the AIProvidersTab wrapper.
- **File:** `settings/page.tsx`

### 6.3 🟠 P1 — Tab keyboard navigation missing
- Settings sidebar tabs are buttons but there's no ArrowUp/ArrowDown keyboard handler. Users can only tab between them (which is wrong for a tablist — only the active tab should be focusable).
- **Fix:** Add `tabIndex` management and arrow key handlers like the space detail AI panel does.
- **File:** `settings/page.tsx`

### 6.4 🟠 P1 — "Profile" and "Notifications" tabs removed but `name`/`email` state remains
- `name` and `email` state variables are declared but never used (no Profile tab renders them). Dead code.
- **Fix:** Remove unused state.
- **File:** `settings/page.tsx`

### 6.5 🟡 P2 — Model selector silently fails on save error
- `handleModelChange` has `catch { // Silently fail }`. User thinks model is saved but it might not be.
- **Fix:** Show a brief error toast or inline error.
- **File:** `settings/page.tsx` ModelSelector

### 6.6 🟡 P2 — Settings page not mobile-responsive
- `<div className="flex gap-8">` with `w-[200px]` sidebar — on mobile, this forces horizontal scroll or squishes the content.
- **Fix:** Stack sidebar tabs above content on mobile (`flex-col md:flex-row`).
- **File:** `settings/page.tsx`

### 6.7 🟡 P2 — Theme preview has no system detection feedback
- "System" theme shows a gradient preview but doesn't indicate what the current system preference IS.
- **Fix:** Add a small label: "Your system prefers: Dark" under the System option.
- **File:** `settings/page.tsx` Appearance tab

### 6.8 🟢 P3 — `handleSave` function declared but never connected to a button
- `handleSave` sets `saved` state but no save button exists. Dead code.
- **File:** `settings/page.tsx`

---

## 7. CONTACT (`/contact`)

### 7.1 🔴 P0 — No dark mode (see 1.1)

### 7.2 🔴 P0 — Form doesn't actually submit
- `onClick={() => setSent(true)}` — the form shows "Message Sent!" without actually sending anything. No API call, no email, nothing.
- This is a **trust violation**. Users believe their message was sent.
- **Fix:** Either wire up a real API endpoint/email service, or clearly label this as a placeholder: "Contact form coming soon. Email us at hello@yeslearn.ai."
- **File:** `contact/page.tsx`

### 7.3 🟠 P1 — No form validation
- Required fields have `required` attribute but the submit button uses `onClick`, bypassing HTML validation.
- User can submit with all fields empty.
- **Fix:** Wrap in `<form onSubmit={...}>` and change button to `type="submit"`.
- **File:** `contact/page.tsx`

### 7.4 🟡 P2 — "Live chat available" claim
- Footer says "Live chat available" with a chat icon. There is no live chat.
- **Fix:** Remove or change to "Email support".
- **File:** `contact/page.tsx`

### 7.5 🟡 P2 — Success state has no return action
- After "sending", user sees a success screen with no button to go back or send another message.
- **Fix:** Add a "Send another message" button.
- **File:** `contact/page.tsx`

---

## 8. SIDEBAR

### 8.1 🟠 P1 — Search bar is non-functional
- Sidebar search shows a styled `<div>` with `<span>Search...</span>` — not an actual input. Clicking does nothing.
- **Fix:** Either make it a real search input or remove it to avoid confusion.
- **File:** `sidebar.tsx`

### 8.2 🟡 P2 — Mobile toggle button lacks `aria-label`
- `<button onClick={toggle}>` with only an icon, no accessible name.
- **Fix:** Add `aria-label="Open sidebar"`.
- **File:** `sidebar.tsx`

### 8.3 🟡 P2 — Sidebar fetches spaces on every pathname change
- `useEffect` with `[pathname]` dependency fetches `/api/spaces` on every navigation. This is excessive.
- **Fix:** Use SWR or React Query with caching, or fetch once and update on mutations.
- **File:** `sidebar.tsx`

### 8.4 🟡 P2 — Collapsed sidebar: space icons show letter initial, not the emoji icon
- Space creation allows choosing an emoji icon (📚, 🧬, etc.) but the sidebar always renders `getInitial(space.name)` (first letter).
- **Fix:** Show `space.icon` if available, fall back to initial.
- **File:** `sidebar.tsx`

### 8.5 🟢 P3 — `closeMobile` called in useEffect with missing dependency
- `useEffect(() => { closeMobile(); }, [pathname])` — `closeMobile` should be in deps or wrapped in a ref.
- **File:** `sidebar.tsx`

---

## 9. LANDING PAGE & NAVIGATION

### 9.1 🟠 P1 — "Join thousands of learners" — unsubstantiated claim
- The CTA section claims "Join thousands of learners using YesLearn". If this isn't true, it's a trust issue.
- **Fix:** Remove the number claim or make it honest: "Start learning with YesLearn."
- **File:** `page.tsx`

### 9.2 🟠 P1 — Navigation mobile menu has no focus trap
- Mobile nav opens a dropdown but focus can escape behind it. No Escape key handler.
- **Fix:** Add focus trap and Escape key handler.
- **File:** `navigation.tsx`

### 9.3 🟡 P2 — Mobile menu button has no `aria-label`
- `<button className="md:hidden p-2">` — no accessible name.
- **Fix:** `aria-label={mobileOpen ? "Close menu" : "Open menu"}`, `aria-expanded={mobileOpen}`.
- **File:** `navigation.tsx`

### 9.4 🟡 P2 — Skip-to-content link missing
- No skip link for keyboard users to bypass the navigation.
- **Fix:** Add `<a href="#main-content" className="sr-only focus:not-sr-only ...">Skip to content</a>`.
- **File:** `layout.tsx` or `navigation.tsx`

---

## 10. PRICING

### 10.1 🔴 P0 — No dark mode (see 1.1)

### 10.2 🟠 P1 — Plan CTAs all go to `/dashboard` or `/contact`
- "Start Free Trial" button goes to `/dashboard` with no trial logic. Misleading.
- **Fix:** If there's no trial system, change CTA to "Get Started" or "Sign Up".
- **File:** `pricing/page.tsx`

### 10.3 🟡 P2 — FAQ not using accordion — all answers visible
- FAQ items are always expanded. No toggle. This is fine for 4 items but doesn't scale.
- **File:** `pricing/page.tsx`

---

## IMPLEMENTATION CHECKLIST — EXECUTION BLOCKS

### 🔥 Block 1: Day 1 (Critical Fixes — ~6 hours)

| # | Severity | Task | File(s) |
|---|----------|------|---------|
| 1 | 🔴 P0 | Add dark mode to `/space/new` | `space/new/page.tsx` |
| 2 | 🔴 P0 | Add dark mode to `/contact` | `contact/page.tsx` |
| 3 | 🔴 P0 | Add dark mode to navigation + footer | `navigation.tsx`, `footer.tsx` |
| 4 | 🔴 P0 | Add dark mode to `/pricing` | `pricing/page.tsx` |
| 5 | 🔴 P0 | Fix contact form: either wire API or add "placeholder" disclaimer | `contact/page.tsx` |
| 6 | 🔴 P0 | Clear error state on content type change in Add page | `dashboard/add/page.tsx` |
| 7 | 🟠 P1 | Add error handling to dashboard API fetches | `dashboard/page.tsx` |
| 8 | 🟠 P1 | Add client-side file size validation (50MB limit) | `dashboard/add/page.tsx` |
| 9 | 🟠 P1 | Fix `timeAgo()` singular/plural | `dashboard/page.tsx`, `space/[id]/page.tsx` |

### ⚡ Block 2: Day 2 (High-Priority Polish — ~6 hours)

| # | Severity | Task | File(s) |
|---|----------|------|---------|
| 11 | 🟠 P1 | Remove or make sidebar search functional | `sidebar.tsx` |
| 12 | 🟠 P1 | Fix YouTube chapters: remove fake UI or show raw transcript | `space/[id]/page.tsx` |
| 13 | 🟠 P1 | Change chat session tabs from `<div>` to `<button>` | `space/[id]/page.tsx` |
| 14 | 🟠 P1 | Remove tags UI from new space (tags aren't sent to API) | `space/new/page.tsx` |
| 15 | 🟠 P1 | Add `role="tabpanel" id="ai-providers-panel"` to Settings AI tab | `settings/page.tsx` |
| 16 | 🟠 P1 | Remove dead state: `name`, `email`, `handleSave` in settings; `showMentions`/`mentionResults` in space | `settings/page.tsx`, `space/[id]/page.tsx` |
| 17 | 🟠 P1 | Make settings responsive: stack tab sidebar on mobile | `settings/page.tsx` |
| 18 | 🟠 P1 | Fix trust copy: remove "thousands of learners" claim | `page.tsx` |
| 19 | 🟠 P1 | Fix trust copy: remove "Live chat available" | `contact/page.tsx` |
| 20 | 🟠 P1 | Fix trust copy: change "Start Free Trial" to "Get Started" on pricing | `pricing/page.tsx` |
| 21 | 🟡 P2 | Add URL validation in Add Content submit handler | `dashboard/add/page.tsx` |
| 22 | 🟡 P2 | Add `aria-label` to sidebar mobile toggle, nav mobile toggle | `sidebar.tsx`, `navigation.tsx` |
| 23 | 🟡 P2 | Add `aria-label` to content grid buttons in space detail | `space/[id]/page.tsx` |
| 24 | 🟡 P2 | Add `title` to YouTube iframe | `space/[id]/page.tsx` |
| 25 | 🟡 P2 | Add "Coming soon" badge to disabled Flashcards/Podcast buttons | `space/[id]/page.tsx` |

### 📋 Block 3: Day 3+ (Medium-Priority Polish)

| # | Severity | Task | File(s) |
|---|----------|------|---------|
| 26 | 🟡 P2 | Replace `window.confirm()` with modal dialog for delete | `space/[id]/page.tsx` |
| 27 | 🟡 P2 | Add skip-to-content link | `layout.tsx` |
| 28 | 🟡 P2 | Use `CopyButton` component for AI message copy | `space/[id]/page.tsx` |
| 29 | 🟡 P2 | Add keyboard nav to content type radiogroup | `dashboard/add/page.tsx` |
| 30 | 🟡 P2 | Add keyboard nav to settings tab list | `settings/page.tsx` |
| 31 | 🟡 P2 | Add drag-and-drop to PDF upload zone | `dashboard/add/page.tsx` |
| 32 | 🟡 P2 | Show space emoji icon in sidebar instead of letter initial | `sidebar.tsx` |
| 33 | 🟡 P2 | Remove `pl-14 md:pl-8` padding hack | `dashboard/page.tsx`, `dashboard/add/page.tsx` |
| 34 | 🟡 P2 | Add page-level `<title>` metadata | All page files |
| 35 | 🟡 P2 | Resolve duplicated chat input in learn vs chat tab | `space/[id]/page.tsx` |
| 36 | 🟢 P3 | Switch to `next/font/google` for Inter | `globals.css`, `layout.tsx` |
| 37 | 🟢 P3 | Add `prefers-reduced-motion` check for dashboard animations | `dashboard/page.tsx` |
| 38 | 🟢 P3 | Add "Text / Notes" to dashboard quick actions | `dashboard/page.tsx` |
| 39 | 🟢 P3 | Fix SelectionToolbar width calculation | `space/[id]/page.tsx` |
| 40 | 🟢 P3 | Fix AI disclaimer contrast (text-[10px] text-[#444]) | `space/[id]/page.tsx` |

---

## Summary

| Severity | Count |
|----------|-------|
| 🔴 P0 | 6 |
| 🟠 P1 | 17 |
| 🟡 P2 | 22 |
| 🟢 P3 | 8 |
| **Total** | **53** |

**Top 3 systemic issues:**
1. **Dark mode is broken** on 5+ pages (all marketing/public pages + new space form)
2. **Trust copy is dishonest** in 4 places (fake contact form, "thousands of learners", "live chat", "free trial")
3. **Accessibility gaps** — missing aria-labels, broken tab semantics, no skip link, no keyboard nav on custom controls

**Recommended first action:** Batch all dark-mode fixes (items 1-4) since they're mechanical and high-impact, then fix the contact form trust issue (item 5).
