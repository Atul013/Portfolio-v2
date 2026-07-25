# Portfolio — Elite Pass

**Design read:** Developer portfolio for recruiters + engineering collaborators. Terminal-native / kinetic-type language. Native CSS variables + Motion + canvas.

**Mode:** Redesign–Preserve. The acid-lime-on-near-black identity is committed and good. Elevate, don't replace.

**Dials:** `DESIGN_VARIANCE: 8` · `MOTION_INTENSITY: 8` · `VISUAL_DENSITY: 4`

**Local:** http://localhost:3000

---

## Audit — what's actually wrong

The site is a solid v2 with real craft. These are the genuine defects, ranked.

| # | Finding | Severity |
|---|---|---|
| A1 | `MobileWarning.jsx` shows a modal telling mobile users to switch to desktop. Directly contradicts the goal of a mobile-reactive site. | **P0** |
| A2 | `window.addEventListener('scroll')` in `Projects.jsx:17` and `Navbar.jsx:21`. Fires every frame, unbatched, sets React state → re-renders the tree on scroll. | **P0** |
| A3 | Hero particle canvas is desktop-only; mobile gets a plain text fallback. The signature moment is missing on half the traffic. | **P0** |
| A4 | 6 section eyebrows across 7 sections. Rule is `ceil(7/3) = 3`. Templated AI rhythm. | P1 |
| A5 | `Projects.jsx:250` uses `viewport={{ once: false }}` — rows re-animate on every scroll pass. Reads as jitter, not motion. | P1 |
| A6 | No `og:image`, no Twitter card, no canonical, no JSON-LD, no `theme-color`. Link previews are blank. | P1 |
| A7 | Google Fonts via render-blocking `<link>`. Inter as the primary face (the discouraged default). | P1 |
| A8 | Reduced-motion is handled in `ParticleText` only. The rest of the motion layer ignores it. | P1 |
| A9 | Hero carries 8 stacked text elements (badge, name, role, location, bio, CTAs, socials, resume). Crowded. | P2 |
| A10 | `ChatBot.jsx` (486 lines) ships in the main bundle despite being below-fold and rarely opened. | P2 |

---

## Plan

### Phase 0 — Foundation
- [x] Delete `MobileWarning`, make mobile a first-class render path (A1)
- [x] Replace both scroll listeners with Motion `useScroll` / `useMotionValueEvent` (A2)
- [x] Shared `useStillness()` hook; Lenis now disabled under reduced motion (A8)
- [x] SEO block: `og:image`, Twitter card, canonical, JSON-LD `Person`, `theme-color` (A6)
- [x] Semantic z-index scale — no raw values left in the codebase
- [x] Skip link + global `:focus-visible` ring

### Phase 1 — Typography
- [x] Non-blocking font load: `preload as=style` + media swap (A7)
- [x] Inter and Familjen Grotesk both dropped for **Archivo** (400–900) vs JetBrains Mono
- [x] `text-wrap: balance` on headings, `pretty` on prose
- [ ] Fluid `clamp()` scale audit across sections

### Phase 2 — Motion system
- [x] Shared primitives in `motion-primitives.jsx`: `Reveal`, `RevealList`, `RevealItem`, `Magnetic`, `Scramble` — all reduced-motion aware
- [x] Scroll progress hairline, driven by `scaleX` off the scroll value (zero renders)
- [x] Magnetic hero CTAs via `useMotionValue`, disabled on coarse pointers
- [x] Text-scramble decode on the Projects heading
- [x] Fixed `once: false` → `once: true` (A5)
- [ ] Retire the per-file `fadeUp` copies in Skills / FAQ / Contact / Experience
- [ ] Cursor-tracking spotlight borders on project rows
- [ ] One pinned scroll moment — exactly one

### Phase 3 — Mobile
- [x] Particle canvas now renders at every size, coarser stride on small screens (A3)
- [x] Touch input drives the particle field; lifting the finger springs it home
- [x] rAF loop parks when the hero is off-screen or the tab is hidden
- [ ] Explicit collapse rules per section, declared in-component
- [ ] `100dvh` everywhere, safe-area insets, 44px touch targets

### Phase 4 — Additions
- [x] Command palette: `⌘K` / `Ctrl+K` / `/`, full keyboard traversal, jump + links + theme
- [x] Live GitHub contribution graph — `api/github.js` proxy + `GitHubActivity` section, with real loading / empty / error states
- [x] OG share card generator — `npm run og`
- [ ] Custom 404
- [ ] An easter egg worth finding

### Phase 5 — Polish
- [x] Eyebrows cut from 6 to **0** — every section now carries a real `h2` instead (A4)
- [x] Projects gained the section heading it never had, plus a lede
- [x] Skip link + global `:focus-visible` ring + `.sr-only` utility
- [x] Lazy-loaded `ChatBot` — now a separate 9.92 kB chunk (A10)
- [ ] Contrast pass at WCAG AA across both themes
- [ ] Lighthouse: LCP < 2.5s, INP < 200ms, CLS < 0.1

**Build:** passing. 357 kB main / 112 kB gzip, ChatBot split out.

---

## Decisions

1. **`og:image`** — rendered from the page. `npm run og` generates `public/og.png` from `scripts/og.mjs`. Done.
2. **Testimonials** — skipped. No invented quotes.
3. **GitHub activity** — server route with a token. Done, needs `GITHUB_TOKEN` set.

### Chatbot failure — diagnosed

Reported as "maybe the model got outdated". It was not the model.

- `moonshotai/kimi-k2.6` **is** live in NVIDIA's public catalog. Verified against `GET /v1/models`. Nothing to change there.
- **Cause 1 (mine):** moving Vite to port 3000 meant the `/api` proxy pointed at 3001, where nothing was running. The dev log shows `http proxy error: /api/chat  ECONNREFUSED` at **12:21:09**, matching the clock in the reported screenshot. The request never reached the function.
- **Cause 2:** `NVIDIA_API_KEY=` is empty in `.env`, so the handler returns its own `API key not configured` 500 before calling NVIDIA.

Fix: `vite.config.js` now runs the `api/*.js` handlers in-process as dev middleware, so `npm run dev` alone serves a working `/api` on the same origin. No second `vercel dev` process, and no proxy that fails silently when that process is not running. Routing verified: real handler runs, unknown routes 404.

### Action needed from Atul

- **Set `NVIDIA_API_KEY` in `.env`** — it is currently blank. If the deployed site's chatbot works, the key lives in Vercel's env settings and was never copied locally. Paste it into `.env` directly; do not send it through chat.
- Set `GITHUB_TOKEN` in `.env` (and in Vercel project settings) for the Activity section to populate. A fine-grained PAT with **no scopes** is enough — the calendar is public data, but GitHub's GraphQL endpoint requires auth regardless. Until it's set the section hides itself rather than erroring, so nothing breaks in the meantime.

---

## Log

- Killed stale process on :3000, pinned Vite to `strictPort: 3000`, moved the `/api` proxy target to 3001 so it stops pointing at itself.
- **Cursor bug found while fixing the layout-thrash finding:** Motion's `x`/`y` write `transform`, which silently overrode the CSS `translate(-50%,-50%)`. The ring had been sitting ~17px off-center from the dot. Now centered with negative margins and scaled via a spring instead of animating `width`/`height`.
- **Nav underline** animated `left`/`right` (layout properties) on a fixed element. Now `transform: scaleX()`.
- **Particle engine bugs:** it mutated a module-level `CFG` object for reduced motion, leaking that state into every later mount; and it hardcoded `'Familjen Grotesk'` for canvas sampling, which the type change would have silently broken into a `sans-serif` fallback that no longer matched the CSS. Both fixed.
- Kept `no-js` fallback path for the wordmark so the name is never an empty gap.
- **OG card bug, caught by looking at the render:** the first generated card read `AI · SECURITY · ▮` with "BACKEND" missing. Not a font problem — all 27 glyphs resolved. The pen position accumulated float drift to `258.95000000000005`, and opentype.js emits `NaN` coordinates at that precision, which makes the SVG renderer abort the path mid-parse and drop everything after it. Fixed by rounding the pen each glyph; the script now hard-fails if `NaN` reaches the SVG, so it can't ship silently again.
- Verified Archivo is *not* a system font here: an SVG requesting it rendered byte-identical to one requesting a deliberately fake name. That's why the card converts text to outlines rather than trusting `font-family`.
- Classified impeccable's `single-font` finding on index.html as a false positive: two families ship (Archivo + JetBrains Mono); the detector isn't counting the mono, which carries every label, chip, and meta line in this design.
