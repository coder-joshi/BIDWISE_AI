import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { BIDDERS, TENDER } from '../../data/dummyData'

const QUICK_PROMPTS = [
  'Why did this bid fail?',
  'Which document is missing?',
  'Show failed compliance points',
  'Explain the risk score',
  'Compare bidder A and C',
]

const AI_RESPONSES = {
  'Why did this bid fail?': `**Rajveer Tech Solutions (BID-2026-0843)** failed for the following reasons:\n\n1. **Edited PDF detected** — GST Certificate shows modification after digital signing (Confidence: 97%)\n2. **Font Manipulation** — PAN Card copy has inconsistent font embedding in the number field\n3. **Compliance Score: 38/100** — Below the minimum threshold of 60\n4. **Annual Turnover ₹9.2 Cr** — Does not meet the ₹20 Cr minimum requirement\n\nRecommendation: Disqualify bid and issue notice to bidder.`,
  'Which document is missing?': `For **Bharat Engineering Solutions (BID-2026-0841)**, all mandatory documents have been received. The only gap:\n\n• **PAN–Aadhaar Linkage Confirmation** — DigiLocker verification is pending due to API latency. This is a minor issue and should not block approval.`,
  'Show failed compliance points': `The following compliance requirements have status **PENDING** or **FAIL**:\n\n• **CR-08: PAN–Aadhaar Linked** — Status: Pending (DigiLocker verification in progress)\n\nAll other 9 compliance points have **PASSED** for BID-2026-0841. Overall compliance score: **94/100**.`,
  'Explain the risk score': `The **Risk Score of 23/100 (Low)** for Bharat Engineering was calculated as follows:\n\n| Factor | Weight | Score |\n|---|---|---|\n| Document Authenticity | 30% | 9/30 |\n| GST Compliance | 20% | 4/20 |\n| Financial Stability | 20% | 5/20 |\n| Experience Match | 15% | 3/15 |\n| Regulatory Compliance | 10% | 2/10 |\n| DigiLocker | 5% | 0/5 |\n\nLow score = low risk. This bidder is safe to proceed.`,
  'Compare bidder A and C': `**Side-by-Side Comparison:**\n\n| | Bharat Engineering | Rajveer Tech |\n|---|---|---|\n| Compliance | 94/100 ✓ | 38/100 ✗ |\n| Risk Score | 23 (Low) | 88 (High) |\n| GST | Active | Suspended |\n| Turnover | ₹28.4 Cr ✓ | ₹9.2 Cr ✗ |\n| Fraud | 0 signals | 3 signals |\n\n**Recommendation:** Bharat Engineering is clearly the compliant choice.`,
}

function formatResponse(text) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return <p key={i} className="font-semibold text-gem-white mb-1">{line.replace(/\*\*/g, '')}</p>
    }
    if (line.startsWith('•')) {
      return <p key={i} className="ml-3 text-gem-muted mb-1">{line}</p>
    }
    if (line.startsWith('|')) return null
    return <p key={i} className="text-gem-muted mb-1">{line.replace(/\*\*/g, '')}</p>
  })
}

export default function AiAssistantPage() {
  const [messages, setMessages] = useState([
    { id: 0, from: 'ai', text: `Hello, Arjun! I'm your AI assistant for GeM BidVerify. I can answer questions about bids, compliance failures, document issues, and risk scores for **Tender ${TENDER.id}**. What would you like to know?` },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (text) => {
    const query = text || input.trim()
    if (!query) return
    setInput('')
    setMessages(prev => [...prev, { id: Date.now(), from: 'user', text: query }])
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    const response = AI_RESPONSES[query] ||
      `I've analyzed the bid data for **${query}**. Based on the current verification results for Tender ${TENDER.id}, all three bidders (Bharat Engineering, Nexgen Infrastructure, Rajveer Tech) have been processed. Bharat Engineering leads with 94/100 compliance and a Low risk score of 23. Would you like more specific details?`
    setMessages(prev => [...prev, { id: Date.now() + 1, from: 'ai', text: response }])
    setLoading(false)
  }

  return (
    <div className="h-screen flex flex-col p-6 lg:p-8 animate-fade-in max-w-3xl">
      <div className="mb-4">
        <h1 className="font-display font-bold text-2xl text-gem-white flex items-center gap-2">
          <Sparkles size={22} className="text-gem-blue-light" /> AI Assistant
        </h1>
        <p className="text-gem-muted font-body text-sm mt-1">Ask me about bid compliance, fraud, or risk</p>
      </div>

      {/* Quick prompts */}
      <div className="flex flex-wrap gap-2 mb-4">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => send(p)}
            className="text-xs px-3 py-1.5 rounded-full bg-gem-blue/15 border border-gem-blue/25 text-gem-blue-light hover:bg-gem-blue/25 transition-colors font-body"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto glass-card p-5 space-y-4 mb-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.from === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
              msg.from === 'ai' ? 'bg-gem-blue/20 border border-gem-blue/30' : 'bg-gradient-to-br from-gem-blue to-gem-green'
            }`}>
              {msg.from === 'ai' ? <Bot size={14} className="text-gem-blue-light" /> : <User size={14} className="text-white" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
              msg.from === 'user'
                ? 'bg-gem-blue text-white font-body rounded-tr-sm'
                : 'glass-card rounded-tl-sm font-body'
            }`}>
              {msg.from === 'ai' ? formatResponse(msg.text) : msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gem-blue/20 border border-gem-blue/30 flex items-center justify-center">
              <Bot size={14} className="text-gem-blue-light" />
            </div>
            <div className="glass-card rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
              {[0, 0.2, 0.4].map((d, i) => (
                <div key={i} className="w-1.5 h-1.5 bg-gem-blue-light rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={(e) => { e.preventDefault(); send() }} className="flex gap-3">
        <input
          type="text"
          className="flex-1 input-base"
          placeholder="Ask about bid compliance, fraud, risk score..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <Button type="submit" variant="primary" size="md" icon={Send} disabled={!input.trim() || loading} />
      </form>
    </div>
  )
}
