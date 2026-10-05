import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Send, X, CircleDashed, Sparkles, FileText, RotateCcw } from 'lucide-react';
import { getAgentConfig, createAgentSession, sendAgentMessage, deleteAgentSession } from '../api/client';

/**
 * RationalizationAgentChat — a slide-over chat drawer backed by the Agentforce
 * agent (via the BFF Agent-API proxy). Adapted from the DISW KnowledgeAgentChat:
 * creates a session on open, sends messages, renders the agent reply, and turns
 * a relative /capability/<id> Markdown link in the reply into an in-app pill.
 *
 * Exposes AgentChatContext.openAgent(prompt?) so the RoadmapTile launcher and the
 * header button (and any page) can open it, optionally pre-filling a prompt.
 *
 * When the agent isn't configured (BFF returns configured:false / 501), the
 * drawer shows the roadmap message instead of erroring.
 */
export const AgentChatContext = createContext({ openAgent: () => {}, available: false });
export function useAgentChat() {
  return useContext(AgentChatContext);
}

const SUGGESTED = [
  'What Salesforce capabilities do we already own?',
  'Where does Salesforce overlap with Gong?',
  'What are the retire candidates in A2R?',
  'What covers our forecasting stack?',
];

// Extract the agent's reply text from the Agent API message payload.
function extractReply(payload) {
  const msgs = payload?.messages;
  if (Array.isArray(msgs) && msgs.length) {
    const m = msgs.find((x) => x?.message) || msgs[0];
    return m?.message || m?.text || '';
  }
  return payload?.message || '';
}

// Render a reply with [text](/capability/id) links as in-app pills and
// [text](http...) as external anchors. Dependency-free.
function renderReply(text) {
  const parts = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const label = m[1];
    const href = m[2];
    if (href.startsWith('/capability/')) {
      parts.push(
        <Link
          key={key++}
          to={href}
          className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium align-baseline"
          style={{ borderColor: 'var(--bb-accent)', color: 'var(--bb-accent)' }}
        >
          <FileText size={11} />
          {label}
        </Link>
      );
    } else {
      parts.push(
        <a key={key++} href={href} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--bb-accent)' }}>
          {label}
        </a>
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function AgentChatProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [available, setAvailable] = useState(false);
  const [status, setStatus] = useState('checking'); // checking | ready | roadmap
  const [messages, setMessages] = useState([]); // {role, text}
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const sessionRef = useRef(null);
  const scrollRef = useRef(null);
  const pendingPrefill = useRef(null);

  useEffect(() => {
    getAgentConfig()
      .then((c) => {
        setAvailable(!!c.configured);
        setStatus(c.configured ? 'ready' : 'roadmap');
      })
      .catch(() => setStatus('roadmap'));
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, busy]);

  const ensureSession = useCallback(async () => {
    if (sessionRef.current) return sessionRef.current;
    const s = await createAgentSession();
    sessionRef.current = s.sessionId || s.id;
    return sessionRef.current;
  }, []);

  const send = useCallback(
    async (text) => {
      const q = (text ?? input).trim();
      if (!q || busy) return;
      setInput('');
      setMessages((prev) => [...prev, { role: 'user', text: q }]);
      setBusy(true);
      try {
        const sid = await ensureSession();
        const payload = await sendAgentMessage(sid, q);
        setMessages((prev) => [...prev, { role: 'agent', text: extractReply(payload) || '(no reply)' }]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          { role: 'agent', text: err?.status === 501 ? 'The agent isn’t enabled on this deployment yet.' : `Error: ${err.message}` },
        ]);
      } finally {
        setBusy(false);
      }
    },
    [input, busy, ensureSession]
  );

  const openAgent = useCallback(
    (prompt) => {
      setOpen(true);
      if (prompt) {
        if (available) send(prompt);
        else pendingPrefill.current = prompt;
      }
    },
    [available, send]
  );

  // Clear the conversation and start a fresh session — ends the current Agent API
  // session (best-effort) so the next question begins clean, no page refresh.
  const reset = useCallback(() => {
    const old = sessionRef.current;
    sessionRef.current = null;
    setMessages([]);
    setInput('');
    setBusy(false);
    deleteAgentSession(old);
  }, []);

  return (
    <AgentChatContext.Provider value={{ openAgent, available }}>
      {children}

      {open && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md bg-surface-card border-l border-surface-border flex flex-col h-full shadow-card-hover">
            {/* Header */}
            <div className="h-14 px-4 flex items-center justify-between border-b border-surface-border">
              <div className="flex items-center gap-2">
                <Bot size={18} style={{ color: 'var(--bb-accent)' }} />
                <span className="text-sm font-semibold text-th-primary">Rationalization Agent</span>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={reset}
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-th-faint hover:text-th-secondary hover:bg-surface-card-hover transition-colors"
                    title="Start a new conversation"
                    aria-label="New conversation"
                  >
                    <RotateCcw size={14} />
                    <span className="text-[11px] font-medium hidden sm:inline">New chat</span>
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-th-faint hover:text-th-secondary p-1" aria-label="Close">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {status === 'roadmap' && (
                <div className="rounded-lg border border-violet-500/25 bg-violet-500/10 p-3 text-sm text-th-muted leading-relaxed">
                  The agent isn’t enabled on this deployment yet. Once the IDO-org config vars are set, it answers
                  grounded questions about what Blackbaud owns, overlaps, and can retire.
                </div>
              )}
              {status === 'ready' && messages.length === 0 && (
                <div className="text-sm text-th-muted leading-relaxed">
                  Ask about Blackbaud’s rationalization picture — grounded in Salesforce capabilities, owned
                  entitlements, and A2R/I2R tooling.
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === 'user' ? 'text-white' : 'bg-surface-card-hover text-th-secondary'
                    }`}
                    style={m.role === 'user' ? { backgroundColor: 'var(--bb-accent)' } : undefined}
                  >
                    {m.role === 'agent' ? renderReply(m.text) : m.text}
                  </div>
                </div>
              ))}
              {busy && (
                <div className="flex items-center gap-2 text-xs text-th-muted">
                  <CircleDashed size={13} className="animate-spin" /> Thinking…
                </div>
              )}
            </div>

            {/* Suggested prompts */}
            {status === 'ready' && messages.length === 0 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="pill-btn text-[11px]"
                  >
                    <Sparkles size={11} /> {s}
                  </button>
                ))}
              </div>
            )}

            {/* Composer */}
            {status === 'ready' && (
              <div className="p-3 border-t border-surface-border flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  placeholder="Ask about capabilities, entitlements, tools…"
                  className="flex-1 rounded-md border border-surface-border bg-surface-card px-3 py-2 text-sm focus:outline-none focus:border-[color:var(--bb-accent)]"
                />
                <button
                  onClick={() => send()}
                  disabled={busy || !input.trim()}
                  className="rounded-md px-3 py-2 text-white disabled:opacity-40"
                  style={{ backgroundColor: 'var(--bb-accent)' }}
                  aria-label="Send"
                >
                  <Send size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </AgentChatContext.Provider>
  );
}
