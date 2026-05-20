export const personalInfo = {
  name: "Atul Biju",
  firstName: "Atul",
  lastName: "Biju",
  initials: "AB",
  roles: ["AI Developer", "Cybersecurity Enthusiast", "Backend Engineer"],
  tagline: "Building intelligent systems at the intersection of AI & security.",
  bio: "I'm a Computer Science and AI student with a strong focus on cybersecurity, artificial intelligence, and scalable backend systems. I enjoy building impactful projects ranging from agentic AI systems and anomaly detection pipelines to lightweight edge AI models. My interests lie at the intersection of AI security, adversarial machine learning, distributed systems, and practical problem-solving through software.",
  location: "Angamaly, Kerala, India",
  email: "atulbiju13@gmail.com",
  domain: "icarus13.in",
  github: "https://github.com/Atul013",
  linkedin: "https://www.linkedin.com/in/atul-biju",
  available: true,
}

export const skillCategories = [
  {
    id: "languages",
    label: "Languages",
    icon: "code",
    color: "#6366f1",
    skills: ["Python", "Go", "C", "C++", "SQL", "Bash/Shell", "JavaScript"],
  },
  {
    id: "aiml",
    label: "AI / ML",
    icon: "brain",
    color: "#8b5cf6",
    skills: [
      "PyTorch", "TensorFlow", "Scikit-learn", "LangChain",
      "RAG Systems", "LLM Orchestration", "Prompt Engineering",
      "Vector Databases", "Model Distillation",
    ],
  },
  {
    id: "cybersecurity",
    label: "Cybersecurity",
    icon: "shield",
    color: "#ec4899",
    skills: [
      "Penetration Testing", "Network Security", "Threat Analysis",
      "Cryptography", "Digital Forensics", "Hash Cracking",
      "Metadata Analysis", "File Carving", "Red Teaming Basics",
    ],
  },
  {
    id: "backend",
    label: "Backend / Systems",
    icon: "server",
    color: "#14b8a6",
    skills: [
      "FastAPI", "Flask", "PostgreSQL", "pgvector",
      "REST APIs", "Docker", "Linux", "Git/GitHub",
    ],
  },
]

export const highlights = ["Python", "AI Systems & RAG", "Cybersecurity", "Backend Engineering", "LLM Orchestration"]

export const experience = [
  {
    company: "Torcue Digital",
    role: "AI Developer Intern",
    location: "Parkland, Florida (Remote)",
    period: "Dec 2025 – Present",
    description:
      "Contributed to a production-scale agentic AI platform by building a RAG backend with document lifecycle APIs and vector-based semantic retrieval; developing a chat-driven onboarding agent that routes tasks across sub-agents and invokes tools to autonomously complete workflows and handle employee queries.",
    tags: ["RAG", "LangChain", "FastAPI", "pgvector", "Agentic AI"],
    current: true,
  },
  {
    company: "Red Team Hacker Academy",
    role: "Pentesting Certification Candidate",
    location: "Kalamassery, Kerala",
    period: "Oct 2025 – Present",
    description:
      "Pursuing hands-on penetration testing certification covering offensive security techniques, real-world attack simulation, and red team methodologies.",
    tags: ["Red Teaming", "Pentesting", "Offensive Security"],
    current: true,
  },
  {
    company: "Corizo",
    role: "Cybersecurity Intern",
    location: "Remote",
    period: "Nov 2023 – Jan 2024",
    description:
      "Worked on cybersecurity fundamentals, vulnerability analysis, and practical security concepts through hands-on tasks and guided projects. Gained exposure to real-world attack surfaces, security tooling, and defensive practices.",
    tags: ["Vulnerability Analysis", "Security Tooling", "Network Security"],
    current: false,
  },
]

export const projects = [
  {
    id: "orchestratex",
    name: "OrchestrateX",
    tagline: "Multi-model LLM orchestration platform",
    description:
      "A multi-model LLM orchestration platform where multiple AI models critique, refine, and improve each other's outputs collaboratively through structured pipelines.",
    tech: ["Python", "LangChain", "LLM APIs"],
    features: ["Multi-agent workflows", "Response refinement", "Orchestration pipelines"],
    link: "https://orchestratex.me",
    github: null,
    award: false,
    status: "live",
  },
  {
    id: "hackquest",
    name: "HackQuest",
    tagline: "Award-winning real-time public alert system",
    description:
      "Award-winning real-time public alert system built in a 24-hour hackathon. Uses ML-powered announcement detection with OpenAI Whisper, geofencing, WebSockets, and haptic feedback to deliver critical alerts to nearby users in real time. Built as a cross-platform PWA with Morse-code vibration alerts and QR onboarding.",
    tech: ["OpenAI Whisper", "PyAudio", "Supabase", "WebSockets", "Socket.io", "Docker", "Google Cloud Run", "Firebase"],
    features: ["ML-powered detection", "Real-time alerts", "PWA", "Haptic feedback", "Geofencing"],
    link: null,
    github: null,
    award: true,
    status: "complete",
  },
  {
    id: "agentic-rag",
    name: "Agentic RAG System",
    tagline: "Production-scale retrieval-augmented generation",
    description:
      "A Retrieval-Augmented Generation system with document lifecycle APIs, vector embeddings, and decision-driven agentic workflows. Features full observability via LangSmith tracing.",
    tech: ["Python", "pgvector", "PostgreSQL", "LangSmith", "Claude"],
    features: ["Semantic retrieval", "Agentic workflows", "Tracing & observability", "Document lifecycle APIs"],
    link: null,
    github: null,
    award: false,
    status: "complete",
  },
  {
    id: "edge-slm",
    name: "Lightweight Edge SLM",
    tagline: "Distilled coding SLM for edge devices",
    description:
      "A lightweight coding-focused Small Language Model distilled from an LLM, optimized for Python code generation on edge devices. Explores post-transformer architectures, efficient distillation pipelines, and quantization techniques.",
    tech: ["Python", "PyTorch", "Hugging Face", "ONNX", "Quantization"],
    features: ["Model distillation", "Edge optimization", "ONNX inference", "Quantization"],
    link: null,
    github: null,
    award: false,
    status: "complete",
  },
  {
    id: "bob",
    name: "BOB",
    tagline: "Voice-controlled intelligent device system",
    description:
      "An experimental voice-controlled intelligent system for device interaction using a RAM-driven workflow. Blends systems programming, automation, and local AI for ultra-fast, local-first device orchestration via natural voice commands.",
    tech: ["Python", "System Automation", "Voice Processing", "Local AI"],
    features: ["Voice control", "Local-first", "RAM-driven", "Device orchestration"],
    link: null,
    github: null,
    award: false,
    status: "in-dev",
  },
  {
    id: "pazham",
    name: "Pazham",
    tagline: "ML-powered banana seed predictor",
    description:
      "A fun experimental ML project (built with @AmalBabu) that predicts the number of seeds inside a banana through real-time camera capture or image upload — combining computer vision with a wonderfully absurd premise.",
    tech: ["Python", "OpenCV", "Machine Learning", "Computer Vision"],
    features: ["Real-time camera capture", "Image upload", "CV pipeline"],
    link: null,
    github: null,
    award: false,
    status: "complete",
  },
]

export const education = [
  {
    degree: "B.Tech in Computer Science & Engineering (AI)",
    institution: "Adi Shankara Institute of Engineering and Technology",
    period: "2023 – 2027",
    current: true,
    detail: "Specialization in Artificial Intelligence",
  },
  {
    degree: "Higher Secondary Education — Computer Science",
    institution: "Carmel HSS, Chalakudy",
    period: "2021 – 2023",
    current: false,
    detail: null,
  },
]

export const faq = [
  {
    q: "What areas are you most interested in?",
    a: "I'm primarily interested in AI security, LLMs, intelligent systems, backend engineering, and cybersecurity research — especially where these fields intersect and create new attack surfaces or defensive opportunities.",
  },
  {
    q: "What kind of projects do you enjoy building?",
    a: "I enjoy building impactful systems that combine AI with real-world utility — especially security-focused or highly scalable applications. If there's a hard problem with a creative technical solution, I'm in.",
  },
  {
    q: "Are you open to collaborations?",
    a: "Yes, always. I'm open to collaborating on interesting AI, cybersecurity, and open-source projects. Reach out and let's build something together.",
  },
  {
    q: "What technologies do you currently work with the most?",
    a: "Python, AI/LLM systems, backend APIs with FastAPI, vector databases (pgvector), and cybersecurity tooling — with a growing interest in Go for systems-level work.",
  },
  {
    q: "What are you currently learning?",
    a: "I'm exploring adversarial machine learning, quantum cryptography concepts, and lightweight AI systems for edge deployment — always curious about what comes next.",
  },
  {
    q: "Do you participate in hackathons or research projects?",
    a: "Yes. I actively participate in hackathons, team-based AI projects, and experimental system design. HackQuest won an award at a 24-hour hackathon — always open to teaming up for the next one.",
  },
]
