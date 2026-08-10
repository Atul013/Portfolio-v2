# Plan — icarus13.in audit remediation

Fixes the 14 findings from the 27 Jul 2026 quality audit of the React + Vite
portfolio at icarus13.in. Each finding was reproduced against production.

## Context

- Vite 5 + React 18 SPA, no router. Single page composed in `src/App.jsx`.
- Serverless functions in `api/` (Vercel Node runtime, ESM, default export handler).
- Styling is one hand-written `src/index.css` using CSS custom properties.
  Dark is `:root`, light is `[data-theme="light"]`.
- Deploys are Vercel. Hobby plan.
- Existing tokens: `--bg --text --text-2 --accent --border --font-mono`.

## Global Constraints

- **No new runtime dependencies** except `@vercel/analytics`, which is approved.
- **Do not change visual design.** No new colours, no layout changes, no copy
  rewrites beyond what a task explicitly specifies.
- Match the surrounding code style: 2-space indent, no semicolons, single quotes.
- Comments explain *why*, never *what*. Do not add comments that restate code.
- `npm run build` must pass before any commit.
- Never commit real secrets. `.env` is gitignored and stays that way.
- Preserve existing behaviour: the chat widget, contact form, GitHub graph, and
  command palette must all still work.

## Task 1 — Harden the chat endpoint (2 Critical findings)

`api/chat.js` accepts arbitrary client messages and spreads them into the model
payload at line 193: `messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages]`.

Two verified exploits against production:

1. A client-supplied `{"role":"system"}` message overrides the persona entirely.
   Confirmed: the live endpoint returned generic Python code with no persona.
2. No rate limit and no size cap. A single 200,000-character message returned 200.

Required:

- Sanitise every inbound message before it reaches the payload. Accept **only**
  `role` values of `user` and `assistant`. Drop anything else — never trust a
  client-supplied `system` or `tool` role.
- Preserve multipart content (`[{type:'text'},{type:'image_url'}]`), which the
  chat widget sends for image attachments. Do not flatten it to a string.
- Cap total request size at **12000 characters** across all message content, and
  cap message count at **30**. Over either limit returns HTTP 413 with a JSON
  `error`. Count characters in text parts only; an image data URI does not count
  toward the character budget but the message still counts toward the 30.
- Add a per-IP rate limit: **12 requests per 60 seconds**, keyed on the
  `x-forwarded-for` header (first entry). Over the limit returns HTTP 429 with a
  JSON `error` and a `Retry-After` header. An in-process `Map` is acceptable and
  its limitation (per-instance, not global) must be stated in a comment.
- The existing `notifyAllowed` gating and `looksReachable` validation must keep
  working unchanged.

Verify: unit-test the sanitiser and the limit checks as pure functions in
`api/__tests__/chat-guards.test.mjs`, runnable with `node --test`. Cover: system
role stripped, tool role stripped, user/assistant kept, multipart preserved,
over-length rejected, over-count rejected, rate limiter allows then blocks.

## Task 2 — Remove ~900 KB of image waste (2 High, 1 Medium, 1 Low)

- `public/robot.png` (642 KB) is referenced by **no** source file. Delete it.
- `robot-bg.png` at the **repo root** (262 KB) is a duplicate outside `public/`,
  never served. Delete it.
- `public/robot-bg.png` is a 508×491 PNG (262 KB) displayed at 118×118
  (`src/components/ChatBot.jsx:301`) and 28×28 (`:364`). Produce a WebP at 2× the
  largest display size (236×236) as `public/robot-bg.webp` and reference that
  instead. Keep `alt` text exactly as it is now. Delete the PNG once nothing
  references it.
- Add `loading="lazy"` and `decoding="async"` to every `<img>` that is not
  above the fold.

Use `sharp` as a **dev-time one-off** via `npx`, not as a project dependency.
If conversion is impossible in this environment, report BLOCKED rather than
committing a broken reference.

Verify: `grep -rn "robot.png\|robot-bg.png" src/ index.html` returns nothing;
`npm run build` passes; `dist/` contains the webp and neither png.

## Task 3 — vercel.json: caching and function duration (1 High)

The project has no `vercel.json`. Every asset is served
`Cache-Control: public, max-age=0, must-revalidate`, including content-hashed
files under `/assets/`.

Required:

- Create `vercel.json` with a `headers` block giving `/assets/(.*)` a
  `Cache-Control: public, max-age=31536000, immutable`.
- Give static images (`.png`, `.webp`, `.svg`, `.ico`) at the root a
  `max-age=86400, stale-while-revalidate=604800` — they are not content-hashed,
  so they must not be immutable.
- Add a `functions` block setting `api/chat.js` `maxDuration` to 60 so a slow
  upstream degrades into a slow reply instead of a timeout error.
- Do **not** add rewrites or redirects; the SPA has no client router and the
  custom 404 at `public/404.html` depends on Vercel's default static handling.

Verify: `npx vercel build` succeeds and the generated config is valid JSON.

## Task 4 — Accessibility fixes (1 High, 1 Medium)

- `src/components/Contact.jsx` has three `<label class="cf-label">` elements and
  zero `htmlFor`. Give each input a stable `id` and each label a matching
  `htmlFor`. WCAG 1.3.1 / 3.3.2.
- Across `src/components/*.jsx` there are 15 `<button>` elements and only 8
  `aria-label` attributes. Audit every button whose visible content is an icon
  only, and give it an accurate `aria-label`. Do **not** add labels to buttons
  that already have visible text — that creates a redundant accessible name.
- Do not change any visual styling.

Verify: every `<label>` in Contact.jsx has `htmlFor` matching an input `id`;
no icon-only button lacks an accessible name; `npm run build` passes.

## Task 5 — Vercel Analytics + privacy policy (1 Medium, 1 Low)

- Add `@vercel/analytics` (approved dependency) and mount `<Analytics />` in
  `src/App.jsx`.
- Add a privacy page at `public/privacy.html`, a standalone static page styled to
  match `public/404.html` (same token approach, same fonts, both themes).

  It must be **factually accurate to this codebase** — do not invent practices.
  What actually happens: the contact form posts to Web3Forms with a Formspree
  fallback; chat messages go to NVIDIA NIM for inference; the GitHub graph is
  proxied server-side; Vercel Analytics collects anonymous page views with no
  cookies; chat history is kept in the browser's own storage. State the contact
  email `atulbiju13@gmail.com` for data requests.
- Link it from the footer (`src/components/Footer.jsx`) using existing footer
  link styling.

Verify: `npm run build` passes; `/privacy.html` exists in `dist/`; the footer
link resolves.

## Task 6 — Tighten chat scope rules (1 Low)

A plain "hey" sometimes triggers the off-topic deflection, so the bot reads as
broken on the first message. The SCOPE section of `SYSTEM_PROMPT` in
`api/chat.js` is over-applied by the small model now in use.

Required:

- Revise the SCOPE section so greetings, small talk, and any question about
  Atul, his work, or general tech are answered normally.
- State explicitly that the deflection is only for questions with no connection
  to Atul's world, and that a greeting is never off-topic.
- Do not change the deflection copy itself or the `notify_atul` rules — only the
  classification guidance.

Verify: state the reasoning; no automated test required. Do not change any
JavaScript logic in this task.
