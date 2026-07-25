/*
  Generates public/og.png — the 1200x630 social share card.

  Run: npm run og

  Why paths instead of SVG <text>: the rasteriser resolves fonts through
  fontconfig, and Archivo is not a system font. An SVG that asks for it renders
  byte-identically to one asking for a font that does not exist, i.e. it
  silently falls back and the card stops looking like the site. Converting the
  headline to outlines removes font resolution from the pipeline entirely.

  Colours and type are read from the same values as src/index.css. If the brand
  palette changes there, change it here too.
*/

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
// CJS interop: this package exposes everything on the default export under ESM.
import opentypePkg from 'opentype.js'
import sharp from 'sharp'

const opentype = opentypePkg

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const W = 1200
const H = 630

const C = {
  bg:     '#0a0a0a',
  ink:    '#f0ece4',
  accent: '#b5fd4f',
  muted:  '#888888',
  grid:   'rgba(255,255,255,0.030)',
  hair:   '#242424',
}

const load = (file) =>
  opentype.parse(new Uint8Array(fs.readFileSync(path.join(__dirname, 'fonts', file))).buffer)

const black = load('Archivo-900.ttf')
const medium = load('Archivo-500.ttf')

/**
 * Lay out a string as vector outlines.
 * Goes glyph by glyph on purpose: opentype.js's shaping path throws on this
 * font's ccmp lookup, and we only need Latin with kerning.
 */
function textPath(font, text, x, y, size, tracking = 0) {
  const scale = size / font.unitsPerEm
  const full = new opentype.Path()
  let cx = x
  let prev = null
  for (const ch of text) {
    const g = font.charToGlyph(ch)
    if (prev) cx += font.getKerningValue(prev, g) * scale

    // Round the pen position every glyph. Accumulating advances in a loop
    // drifts into full double precision (258.95000000000005), and opentype.js
    // emits NaN coordinates at that precision. A NaN makes the SVG renderer
    // abort the path mid-parse, so the rest of the string silently disappears.
    // Rounding to 1/1000 px is visually free and keeps the pen on clean values.
    cx = Math.round(cx * 1000) / 1000

    full.extend(g.getPath(cx, y, size))
    cx += g.advanceWidth * scale + tracking
    prev = g
  }
  return { d: full.toPathData(2), width: cx - x - tracking }
}

function measure(font, text, size, tracking = 0) {
  return textPath(font, text, 0, 0, size, tracking).width
}

// ── Compose ────────────────────────────────────────────────────────────────
const PAD = 78
const NAME_SIZE = 168
const LINE_GAP = 8

const l1 = textPath(black, 'ATUL', PAD, 300, NAME_SIZE)
const l2 = textPath(black, 'BIJU.', PAD, 300 + NAME_SIZE + LINE_GAP, NAME_SIZE)

const ROLE = 'AI  ·  SECURITY  ·  BACKEND'
const roleSize = 25
const role = textPath(medium, ROLE, PAD, 176, roleSize, 1.6)

const DOMAIN = 'icarus13.in'
const domainSize = 26
const domain = textPath(medium, DOMAIN, PAD, H - 74, domainSize)

const TAG = 'Agentic RAG  ·  Adversarial ML  ·  Edge models'
const tagSize = 22
const tagW = measure(medium, TAG, tagSize)
const tag = textPath(medium, TAG, W - PAD - tagW, H - 74, tagSize)

// Background grid, matching the hero's grid-lines treatment.
const STEP = 60
let grid = ''
for (let x = STEP; x < W; x += STEP) grid += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${C.grid}" stroke-width="1"/>`
for (let y = STEP; y < H; y += STEP) grid += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${C.grid}" stroke-width="1"/>`

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="glow" cx="18%" cy="26%" r="62%">
      <stop offset="0%" stop-color="${C.accent}" stop-opacity="0.13"/>
      <stop offset="100%" stop-color="${C.accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="${C.bg}"/>
  ${grid}
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- accent rule above the role line -->
  <rect x="${PAD}" y="132" width="64" height="4" rx="2" fill="${C.accent}"/>
  <path d="${role.d}" fill="${C.muted}"/>

  <path d="${l1.d}" fill="${C.ink}"/>
  <path d="${l2.d}" fill="${C.accent}"/>

  <line x1="${PAD}" y1="${H - 112}" x2="${W - PAD}" y2="${H - 112}" stroke="${C.hair}" stroke-width="1"/>
  <path d="${domain.d}" fill="${C.ink}"/>
  <path d="${tag.d}" fill="${C.muted}"/>
</svg>`

// A single NaN silently truncates a path at render time and the card ships
// with missing words. Fail the build instead of writing a broken image.
if (svg.includes('NaN')) {
  const at = svg.indexOf('NaN')
  console.error('Refusing to write og.png: generated SVG contains NaN coordinates.')
  console.error('Context:', JSON.stringify(svg.slice(Math.max(0, at - 90), at + 30)))
  process.exit(1)
}

const outDir = path.join(root, 'public')
fs.mkdirSync(outDir, { recursive: true })
const out = path.join(outDir, 'og.png')

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(out)

const { size } = fs.statSync(out)
console.log(`og.png written -> public/og.png  (${W}x${H}, ${(size / 1024).toFixed(1)} kB)`)
