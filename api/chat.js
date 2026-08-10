const NVIDIA_API  = 'https://integrate.api.nvidia.com/v1/chat/completions'
// NIM resolves models per account, and entitlements come and go — kimi-k2.6
// and five others 404 here. Override without a redeploy by setting NIM_MODEL.
//
// The default is chosen on three constraints the widget actually has: it must
// emit tool calls (notify_atul), accept image_url parts (attachments), and
// answer in ~2s. Big models on the free tier queue badly: mistral-medium
// measured 30s and 127s on identical requests, past the function ceiling.
const MODEL       = process.env.NIM_MODEL || 'meta/llama-3.2-11b-vision-instruct'
const WEB3FORMS   = 'https://api.web3forms.com/submit'
const FORMSPREE   = 'https://formspree.io/f/xnjrzlej'   // fallback

/* ─────────────────────────────────────────────────────────
   SYSTEM PROMPT
   Scope: Atul-related only. Off-topic → fun deflect + notify tool.
───────────────────────────────────────────────────────── */
const SYSTEM_PROMPT = `You are atul_ai — the AI version of Atul, living on his personal portfolio at icarus13.in. You speak as a knowledgeable, friendly stand-in for Atul himself. Be conversational, a bit witty, and technically sharp — not stiff or overly formal.

IMPORTANT: He goes by "Atul" — never "Atul Biju" in responses. First name only, always.

ABOUT ATUL:
- CS & AI student, B.Tech at Adi Shankara Institute of Engineering & Technology, Kerala (2023–2027, AI specialization)
- Based in Angamaly, Kerala, India
- Email: atulbiju13@gmail.com | GitHub: github.com/Atul013 | LinkedIn: linkedin.com/in/atul-biju
- Currently open to internships, research collabs, and freelance work

EXPERIENCE:
1. AI Developer Intern @ Torcue Digital (Dec 2025 – Present, Remote / Florida)
   Built a production RAG backend — document lifecycle APIs, vector semantic retrieval, and a chat-driven onboarding agent that routes tasks across sub-agents and handles employee queries autonomously.
   Stack: LangChain, FastAPI, pgvector, PostgreSQL, Claude

2. Pentesting Certification @ Red Team Hacker Academy (Oct 2025 – Present, Kerala)
   Hands-on offensive security — real-world attack simulation, red team methodologies.

3. Cybersecurity Intern @ Corizo (Nov 2023 – Jan 2024, Remote)
   Vulnerability analysis, security tooling, network security basics.

PROJECTS (what Atul's actually built):
1. OrchestrateX — orchestratex.me
   Multi-model LLM orchestration: multiple AI models critique and refine each other's outputs through structured pipelines. One of Atul's most technically interesting builds.
   Stack: Python, LangChain, LLM APIs

2. HackQuest — won an award at a 24-hour hackathon
   Real-time public alert system. ML-powered announcement detection (OpenAI Whisper), geofencing, WebSockets, haptic feedback, cross-platform PWA with Morse-code vibration alerts.
   Stack: Whisper, PyAudio, Supabase, Socket.io, Docker, Google Cloud Run, Firebase

3. Agentic RAG System — built during his internship at Torcue
   Production-scale RAG with document lifecycle APIs, vector embeddings, agentic workflows, LangSmith observability end-to-end.
   Stack: Python, pgvector, PostgreSQL, LangSmith, Claude

4. Lightweight Edge SLM
   Distilled a coding-focused Small Language Model for edge devices — exploring post-transformer architectures, ONNX inference, quantization. Atul's deep dive into efficient AI.
   Stack: Python, PyTorch, Hugging Face, ONNX

5. BOB — in development
   Voice-controlled device system with a RAM-driven workflow. Local-first, natural language commands. Atul's most experimental project right now.
   Stack: Python, System Automation, Voice Processing, Local AI

6. Pazham — pazham.foo (co-built with Amal Babu — github.com/Am4l-babu)
   Predicts how many seeds are inside a banana from a photo. Computer vision meets a wonderfully absurd premise — and it actually works.
   Stack: Python, OpenCV, Machine Learning

SKILLS:
- Languages: Python (his main), Go, C/C++, SQL, Bash
- AI/Agents: LangChain, Claude APIs, PyTorch, Agentic RAG, LangSmith
- Infra/Data: FastAPI, Docker, pgvector, PostgreSQL, Git/GitHub
- Security/Vision: Pentesting, Threat Intel, Digital Forensics, OpenCV, Edge AI

TONE & BEHAVIOUR:
- Refer to yourself in the first person when natural ("I built...", "my work on...") — you ARE Atul's AI stand-in
- Keep answers concise: 2–4 sentences for simple questions, more only when depth is genuinely needed
- Show real enthusiasm for the projects — these aren't just CV items, they're things Atul is proud of
- If someone asks something you genuinely don't know (very personal stuff, things not listed here), be honest — don't make things up
- Never hallucinate experience, skills, or projects not listed above
- If the user shares an image, analyze it helpfully — code screenshots, project diagrams, UI mockups, anything
- For hiring/collab inquiries: point them to atulbiju13@gmail.com or the contact section

═══════════════════════════════════════════════════════════
SCOPE — CRITICAL
═══════════════════════════════════════════════════════════
DEFAULT: ANSWER NORMALLY. Deflection is the rare exception, not the first instinct — when in doubt, just answer.

ALWAYS answer normally, no exceptions, these are NEVER off-topic:
- Greetings, small talk, "hey", "hi", "what's up", how-are-you
- Thanks, goodbyes, casual banter
- "Who are you", "what can you do", questions about atul_ai itself
- Anything about Atul — his work, projects, skills, experience, background, hobbies, life, opinions
- General AI/coding/security/tech questions — these are in Atul's world too (AI, ML, security, Python, Go, Kerala, hackathons, system design, edge AI, etc.)

Only deflect when a question has genuinely NO connection to Atul's world at all — random trivia, anime plots, recipes, celebrity gossip, sports scores, homework help on topics totally unrelated to tech. If you're unsure whether something counts, it counts — answer it, don't deflect.

OFF-TOPIC FLOW — follow this exact sequence:

STEP 1 — Deflect with personality. Pick one of these vibes (rotate, don't repeat):
   - "Ha, Atul would've crushed that one — but that's outside my lane 😄 He's probably mid-set at the gym or buried in some college assignment right now. Want me to ping him anyway?"
   - "Bold question for a portfolio bot lol. Atul would've answered that better — he might be down sick or surviving a deadline rn, but he'd still want to know. Should I send him a note?"
   - "I'm locked in on Atul's world here 😅 He's probably doing something questionable for his CGPA right now, but he'd actually enjoy this question. Want me to notify him?"
   - "Atul definitely has thoughts on that — I, unfortunately, do not 😂 He might be at the gym or knee-deep in college chaos, but should I shoot him a message?"

STEP 2 — If they say yes, ask for BOTH in one message:
   "What's your name and the best way to reach you? (email, Instagram, LinkedIn — whatever works)"

STEP 3 — Once you have their name AND contact info, immediately call notify_atul with all three fields.

STEP 4 — After the tool executes, say something like:
   "Done! Atul's been notified 📨 He'll get back to you within 48 hours — and if he's not drowning in assignments or recovering from leg day, expect a reply in under 2 hours 😄"
   OR: "Sent! He might be busy with college stuff or at the gym rn, but within 48 hours max. If he's free, knowing him it'll be under 2 hours."

IMPORTANT:
- notify_atul sends Atul a real email. Treat it as a genuine interruption of a
  real person's day, not a conversational flourish.
- THREE conditions must ALL be true before you call it. If any one is missing,
  do not call it:
    1. The visitor asked to be put in touch, or said yes to your offer
    2. They gave you their name
    3. They gave you a contact you could actually reach them at
- Never call it just because a question was off-topic, and never to "log" or
  "record" a conversation. An off-topic question on its own is a deflection,
  not a notification.
- If you are unsure whether they want Atul contacted, ask. Do not call the tool
  to find out.
- If they only give a name, ask once more for contact: "And a way to reach you? Email or socials is fine."
- Keep the banter light — this should feel like talking to Atul's slightly sarcastic but helpful AI, not a customer service bot.`

/* ─────────────────────────────────────────────────────────
   TOOL DEFINITION — notify_atul
───────────────────────────────────────────────────────── */
const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'notify_atul',
      description: "Sends Atul an email notification about a visitor who asked an off-topic question and wants to connect. Only call this after collecting BOTH the visitor's name AND their contact info.",
      parameters: {
        type: 'object',
        properties: {
          visitor_name: {
            type: 'string',
            description: "The visitor's name",
          },
          contact_info: {
            type: 'string',
            description: "How to reach the visitor — email, Instagram handle, LinkedIn, phone, whatever they gave",
          },
          question: {
            type: 'string',
            description: 'A short summary of what the visitor asked (the off-topic question or topic)',
          },
        },
        required: ['visitor_name', 'contact_info', 'question'],
      },
    },
  },
]

/* ─────────────────────────────────────────────────────────
   NOTIFY GATING

   The tool used to be offered on every single turn, so a small model would
   reach for it during ordinary chat and fire an email for visitors who never
   asked to be put in touch. Prompt wording alone doesn't hold, so the tool is
   withheld from the payload unless the conversation has actually reached the
   point of exchanging contact details — a model can't call a tool it can't see.
───────────────────────────────────────────────────────── */

// Visitor explicitly asking to reach Atul.
const CONTACT_INTENT = /\b(ping|notify|contact|reach (?:out|him)|message him|tell (?:him|atul)|let (?:him|atul) know|email him|dm him|get in touch|hire|collab|opportunity|work together)\b/i

// The assistant offered to pass something on, so a bare "yes" is consent.
const OFFER_MADE = /(ping him|ping you|notify him|notify you|send him a note|shoot him a message|should i send|want me to ping|message him)/i

// Flatten either a plain string or the multipart array used for images.
const textOf = (content) =>
  typeof content === 'string'
    ? content
    : Array.isArray(content)
      ? content.filter(p => p?.type === 'text').map(p => p.text).join(' ')
      : ''

function notifyAllowed(messages) {
  const lastUser = [...messages].reverse().find(m => m.role === 'user')
  if (CONTACT_INTENT.test(textOf(lastUser?.content))) return true
  // Otherwise only if there's an outstanding offer they could be agreeing to.
  return messages.some(m => m.role === 'assistant' && OFFER_MADE.test(textOf(m.content)))
}

// Last line of defence: the model can still hallucinate arguments, so refuse to
// send unless the contact string is actually something Atul could reply to.
const looksReachable = (s = '') =>
  /@|https?:\/\/|\+?\d[\d\s-]{7,}|instagram|linkedin|twitter|x\.com|telegram|github/i.test(s)

/* ─────────────────────────────────────────────────────────
   REQUEST GUARDS

   The endpoint is public and unauthenticated, so everything the client sends
   is hostile until proven otherwise: a spoofed `system` role overrides the
   persona, and an unbounded payload or request rate runs up the NIM bill.
───────────────────────────────────────────────────────── */
const ALLOWED_ROLES  = new Set(['user', 'assistant'])
const MAX_CHARS       = 12000
const MAX_MESSAGES    = 30

// Only role and content survive — a client can't smuggle a system/tool role,
// and any other fields (e.g. a forged tool_call_id) never reach the payload.
function sanitiseMessages(messages) {
  return messages
    .filter(m => m && ALLOWED_ROLES.has(m.role))
    .map(m => ({ role: m.role, content: m.content }))
}

// Text-only budget: image data URIs are large by nature and already bounded
// by the multipart shape, so they'd swamp a byte-count without being the
// abuse vector the cap targets.
function totalChars(messages) {
  return messages.reduce((sum, m) => sum + textOf(m.content).length, 0)
}

function validateSize(messages) {
  if (messages.length > MAX_MESSAGES) return 'Too many messages'
  if (totalChars(messages) > MAX_CHARS) return 'Request too large'
  return null
}

// Per-instance only — a warm serverless container shares this Map across
// requests it handles, but a cold start or a different instance gets a fresh
// one, so this is a speed bump, not a hard global limit.
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX       = 12
const rateLimitStore = new Map()

function checkRateLimit(ip, now = Date.now()) {
  // Prune on every touch so the Map can't grow unbounded across the
  // instance's lifetime.
  for (const [key, entry] of rateLimitStore) {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) rateLimitStore.delete(key)
  }

  const entry = rateLimitStore.get(ip)
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { windowStart: now, count: 1 })
    return { allowed: true }
  }

  entry.count += 1
  if (entry.count > RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((entry.windowStart + RATE_LIMIT_WINDOW_MS - now) / 1000)
    return { allowed: false, retryAfter }
  }
  return { allowed: true }
}

function clientIp(req) {
  const header = req.headers?.['x-forwarded-for']
  if (!header) return 'unknown'
  const first = Array.isArray(header) ? header[0] : header
  return first.split(',')[0].trim()
}

// Named exports alongside the default handler, purely so the guards above
// can be unit-tested as pure functions — Vercel only ever imports the default.
export {
  sanitiseMessages,
  totalChars,
  validateSize,
  checkRateLimit,
  clientIp,
  MAX_CHARS,
  MAX_MESSAGES,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX,
}

/* ─────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────── */
async function callLLM(messages, withTools = true, apiKey) {
  const payload = {
    model: MODEL,
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
    temperature: 0.7,
    max_tokens: 1024,
    ...(withTools ? { tools: TOOLS, tool_choice: 'auto' } : {}),
  }

  const res = await fetch(NVIDIA_API, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization:  `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const txt = await res.text()
    console.error('NIM error:', res.status, txt)
    throw new Error(`NIM ${res.status}`)
  }
  return res.json()
}

async function sendNotification(visitor_name, contact_info, question) {
  const now     = new Date()
  const timeIST = now.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata',
  })
  const dateIST = now.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata',
  })

  const message =
    `${visitor_name} dropped by icarus13.in today at ${timeIST} hours (${dateIST} IST) ` +
    `and asked: "${question}" — your AI had to redirect them, it was funny lol.\n\n` +
    `Reach them at: ${contact_info}\n\n` +
    `— atul_ai 🤖`

  // ── Primary: Web3Forms (250 / month free) ──
  const w3key = process.env.WEB3FORMS_KEY
  if (w3key) {
    try {
      const res = await fetch(WEB3FORMS, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: w3key,
          name:       visitor_name,
          email:      'atul_ai@icarus13.in',
          message,
          subject:    `👀 ${visitor_name} pinged you from icarus13.in`,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (res.ok && json.success) {
        console.log('Web3Forms: sent ✓')
        return   // success — don't hit fallback
      }
      console.warn('Web3Forms non-success:', res.status, json)
    } catch (e) {
      console.warn('Web3Forms fetch failed:', e.message)
    }
  }

  // ── Fallback: Formspree (50 / month free) ──
  try {
    const res = await fetch(FORMSPREE, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name:     visitor_name,
        email:    'atul_ai@icarus13.in',
        message,
        _subject: `👀 ${visitor_name} pinged you from icarus13.in`,
      }),
    })
    if (res.ok) { console.log('Formspree fallback: sent ✓'); return }
    console.error('Formspree error:', res.status, await res.text())
  } catch (e) {
    console.error('Formspree fetch failed:', e.message)
  }

  throw new Error('All notification providers failed')
}

/* ─────────────────────────────────────────────────────────
   HANDLER
───────────────────────────────────────────────────────── */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.NVIDIA_API_KEY
  if (!apiKey)  return res.status(500).json({ error: 'API key not configured' })

  const { messages } = req.body || {}
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array required' })
  }

  const rate = checkRateLimit(clientIp(req))
  if (!rate.allowed) {
    res.setHeader('Retry-After', String(rate.retryAfter))
    return res.status(429).json({ error: 'Too many requests' })
  }

  const clean = sanitiseMessages(messages)
  const sizeError = validateSize(clean)
  if (sizeError) return res.status(413).json({ error: sizeError })

  try {
    // ── First LLM call (tools enabled) ──
    const data   = await callLLM(clean, notifyAllowed(clean), apiKey)
    const choice = data.choices?.[0]
    const msg    = choice?.message

    // ── Tool call branch ──
    if (choice?.finish_reason === 'tool_calls' && msg?.tool_calls?.length) {
      const call = msg.tool_calls[0]

      let args = {}
      try { args = JSON.parse(call.function.arguments) } catch {}

      // Execute the tool server-side, but only for a call that carries a real
      // name and a contact string worth replying to. A refusal here is fed
      // back as success:false, so the model asks for the details instead of
      // telling the visitor a message was sent that never was.
      let notifyOk = true
      const name    = (args.visitor_name ?? '').trim()
      const contact = (args.contact_info ?? '').trim()

      if (!name || !looksReachable(contact)) {
        notifyOk = false
        console.warn('notify_atul refused — insufficient args:', JSON.stringify(args))
      } else {
        try {
          await sendNotification(name, contact, args.question ?? '(unknown)')
        } catch (e) {
          notifyOk = false
          console.error('Notification send failed:', e.message)
        }
      }

      // Feed tool result back for a natural follow-up response
      const withResult = [
        ...clean,
        msg,   // assistant message containing the tool_calls
        {
          role:         'tool',
          tool_call_id: call.id,
          content:      JSON.stringify({ success: notifyOk }),
        },
      ]

      const data2  = await callLLM(withResult, false, apiKey)  // no tools on second pass
      const reply2 = data2.choices?.[0]?.message?.content ?? 'Done!'
      return res.status(200).json({ reply: reply2 })
    }

    // ── Normal text response ──
    const reply = msg?.content ?? 'No response'
    return res.status(200).json({ reply })

  } catch (err) {
    console.error('Chat handler error:', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
