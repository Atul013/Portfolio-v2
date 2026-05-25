const NVIDIA_API  = 'https://integrate.api.nvidia.com/v1/chat/completions'
const MODEL       = 'moonshotai/kimi-k2.6'
const FORMSPREE   = 'https://formspree.io/f/xnjrzlej'

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
You ONLY discuss topics connected to Atul — his work, projects, skills, experience, background, or anything in his domain (AI, ML, security, Python, Go, Kerala, hackathons, system design, edge AI, etc.).

Be GENEROUS with what counts as related: if someone asks a general AI/coding/security/tech question, answer it — it's in Atul's world. Same for anything about his hobbies, life, opinions on tech, etc.

ONLY hard-redirect truly off-topic stuff — random trivia, anime plot summaries, recipes, celebrity gossip, sports scores, homework help on topics totally outside Atul's world, etc.

OFF-TOPIC FLOW:
1. Do NOT answer the off-topic question.
2. Say something fun and self-aware. Examples:
   - "Ha, Atul would've nailed that one — this is a bit outside my lane 😄 Want me to ping him?"
   - "Bold question for a portfolio bot lol. Atul would've answered that better — should I let him know you dropped by?"
   - "I'm pretty locked in on Atul's world here, but he might actually know the answer. Want me to send him a note?"
3. Ask for their name: "What's your name? I'll shoot him a quick message."
4. Once you have their name, call the notify_atul tool immediately — pass their name + a short summary of what they asked.
5. After the tool executes, respond casually: "Done! Atul's been notified — he'll probably get back to you within a day or two. Anything else about his work I can help with?"

IMPORTANT: Never call notify_atul unless the user has explicitly said yes and given you their name. Collect both pieces of info conversationally before calling the tool.`

/* ─────────────────────────────────────────────────────────
   TOOL DEFINITION — notify_atul
───────────────────────────────────────────────────────── */
const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'notify_atul',
      description: 'Sends Atul an email notification about a visitor who asked an off-topic question and wants to connect. Only call this after collecting the visitor\'s name.',
      parameters: {
        type: 'object',
        properties: {
          visitor_name: {
            type: 'string',
            description: "The visitor's first name or full name",
          },
          question: {
            type: 'string',
            description: 'A short summary of what the visitor asked (the off-topic question or topic)',
          },
        },
        required: ['visitor_name', 'question'],
      },
    },
  },
]

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

async function sendNotification(visitor_name, question) {
  // Format time in IST (Atul's timezone)
  const now     = new Date()
  const timeIST = now.toLocaleTimeString('en-IN', {
    hour:     '2-digit',
    minute:   '2-digit',
    hour12:   false,
    timeZone: 'Asia/Kolkata',
  })
  const dateIST = now.toLocaleDateString('en-IN', {
    day:      'numeric',
    month:    'short',
    year:     'numeric',
    timeZone: 'Asia/Kolkata',
  })

  const message =
    `${visitor_name} visited icarus13.in today at ${timeIST} hours (${dateIST} IST) ` +
    `and asked: "${question}" — your AI had to redirect them, it was funny lol.\n\n` +
    `— atul_ai 🤖`

  const body = JSON.stringify({
    name:     visitor_name,
    email:    'atul_ai@icarus13.in',
    message,
    _subject: `Portfolio ping from ${visitor_name} 👀`,
  })

  const res = await fetch(FORMSPREE, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body,
  })

  if (!res.ok) console.error('Formspree error:', res.status, await res.text())
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

  try {
    // ── First LLM call (tools enabled) ──
    const data   = await callLLM(messages, true, apiKey)
    const choice = data.choices?.[0]
    const msg    = choice?.message

    // ── Tool call branch ──
    if (choice?.finish_reason === 'tool_calls' && msg?.tool_calls?.length) {
      const call = msg.tool_calls[0]

      let args = {}
      try { args = JSON.parse(call.function.arguments) } catch {}

      // Execute the tool server-side
      await sendNotification(args.visitor_name ?? 'Someone', args.question ?? '(unknown)')

      // Feed tool result back for a natural follow-up response
      const withResult = [
        ...messages,
        msg,   // assistant message containing the tool_calls
        {
          role:        'tool',
          tool_call_id: call.id,
          content:     JSON.stringify({ success: true }),
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
