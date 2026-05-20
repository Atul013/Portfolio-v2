const row1 = ['Python', 'LangChain', 'RAG Systems', 'PyTorch', 'FastAPI', 'pgvector', 'Docker', 'LLM Orchestration', 'Penetration Testing', 'Go', 'PostgreSQL', 'Cybersecurity', 'Edge AI']
const row2 = ['Model Distillation', 'Vector Databases', 'Red Teaming', 'Prompt Engineering', 'TensorFlow', 'Network Security', 'Agentic AI', 'Cryptography', 'Flask', 'Bash', 'C++', 'Digital Forensics', 'ONNX']

function Row({ items, dir = 'left', inverted = false }) {
  const doubled = [...items, ...items]
  return (
    <div className="marquee-row">
      <div className={`marquee-move ${dir}${inverted ? ' inv' : ''}`}>
        {doubled.map((item, i) => (
          <span key={i} className={`marquee-item${inverted ? ' inv' : ''}`}>
            {item}
            {i < doubled.length - 1 && <span>✦</span>}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function MarqueeStrip() {
  return (
    <div className="marquee-section">
      <div className="marquee-track-wrap">
        <Row items={row1} dir="left" />
        <Row items={row2} dir="right" inverted />
      </div>
    </div>
  )
}
