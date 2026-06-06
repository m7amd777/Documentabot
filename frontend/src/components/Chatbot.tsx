import { useState, useRef, useEffect } from 'react';
import { Icons } from './Icons';
import { AnswerCard, ToolCalls } from './ChatParts';
import { chats as chatsApi } from '../api';
import type { ChatSession } from '../api';
import type { Message, ToolDef, Source } from '../types';

const ANIM_TOOLS: ToolDef[] = [
  { id: 'search', label: 'Searching knowledge base',   icon: 'search' },
  { id: 'rank',   label: 'Ranking relevant passages',  icon: 'layers' },
  { id: 'gen',    label: 'Generating answer',           icon: 'spark'  },
];
const STEP_MS = 900;

function dateGroup(dateStr: string): string {
  const d = new Date(dateStr.replace(' ', 'T') + 'Z');
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgStart   = new Date(d.getFullYear(),   d.getMonth(),   d.getDate());
  const diffDays   = Math.round((todayStart.getTime() - msgStart.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7)   return d.toLocaleDateString('en-US', { weekday: 'long' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function Chatbot() {
  const [chatList, setChatList]       = useState<ChatSession[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [messages, setMessages]       = useState<Message[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [input, setInput]             = useState('');
  const [busy, setBusy]               = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatsApi.list()
      .then(setChatList)
      .finally(() => setLoadingChats(false));
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  async function selectChat(id: number) {
    if (busy || id === activeChatId) return;
    setActiveChatId(id);
    setMessages([]);
    setLoadingMsgs(true);
    try {
      const msgs = await chatsApi.messages(id);
      setMessages(msgs.map(m => ({
        role: m.is_response ? 'assistant' : 'user',
        id: `db-${m.id}`,
        text: m.content,
        status: m.is_response ? ('done' as const) : undefined,
      })));
    } finally {
      setLoadingMsgs(false);
    }
  }

  function newChat() {
    if (busy) return;
    setActiveChatId(null);
    setMessages([]);
  }

  async function send(text: string) {
    if (!text.trim() || busy) return;
    setInput('');
    setBusy(true);
    const aId = 'live-' + Date.now();

    setMessages(prev => [
      ...prev,
      { role: 'user', text },
      { role: 'assistant', id: aId, status: 'thinking', states: ANIM_TOOLS.map(() => 'pending') },
    ]);

    // Animate tool steps concurrently with the API call
    let elapsed = 0;
    ANIM_TOOLS.forEach((_, i) => {
      setTimeout(() => setMessages(m => m.map(msg => msg.id === aId
        ? { ...msg, states: msg.states!.map((s, j) => j === i ? 'running' : s) } : msg)), elapsed);
      elapsed += STEP_MS;
      setTimeout(() => setMessages(m => m.map(msg => msg.id === aId
        ? { ...msg, states: msg.states!.map((s, j) => j === i ? 'done' : s) } : msg)), elapsed);
    });

    const animDone = new Promise<void>(r => setTimeout(r, elapsed));

    try {
      let answer: string;
      let sources: Source[];

      if (activeChatId === null) {
        const [result] = await Promise.all([chatsApi.create(text), animDone]);
        answer  = result.answer;
        sources = result.sources;
        setChatList(prev => [result.chat, ...prev]);
        setActiveChatId(result.chat.id);
      } else {
        const [result] = await Promise.all([chatsApi.send(activeChatId, text), animDone]);
        answer  = result.answer;
        sources = result.sources;
      }

      setMessages(m => m.map(msg => msg.id === aId
        ? { ...msg, status: 'done', text: answer, sources }
        : msg));
    } catch {
      await animDone;
      setMessages(m => m.map(msg => msg.id === aId
        ? { ...msg, status: 'done', text: 'Sorry, something went wrong. Please try again.' }
        : msg));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'flex', height: '100%', background: 'var(--bg)' }}>
      <ChatSidebar
        chats={chatList}
        loading={loadingChats}
        activeId={activeChatId}
        onSelect={selectChat}
        onNew={newChat}
      />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          padding: '13px 22px', borderBottom: '1px solid var(--border)',
          background: 'rgba(255,255,255,.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--red)', display: 'grid', placeItems: 'center', color: '#fff', boxShadow: '0 3px 9px rgba(233,0,48,.3)' }}>
            <Icons.chat size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-.2px', display: 'flex', alignItems: 'center', gap: 8 }}>
              Documentabot
              <span className="badge badge-green" style={{ height: 19, padding: '0 7px', fontSize: 10.5 }}><span className="dot" /> Online</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Answers are generated from indexed Benefit documents</div>
          </div>
        </div>

        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '26px 0' }}>
          <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px' }}>
            {loadingMsgs ? (
              <div style={{ textAlign: 'center', paddingTop: 60, color: 'var(--ink-3)' }}>
                <span className="spin" style={{ display: 'inline-flex' }}><Icons.refresh size={22} /></span>
              </div>
            ) : messages.length === 0 ? (
              <Welcome onPrompt={send} />
            ) : (
              messages.map((m, i) =>
                m.role === 'user'
                  ? <UserMsg key={m.id ?? i} text={m.text!} />
                  : <AssistantMsg key={m.id ?? i} msg={m} />
              )
            )}
          </div>
        </div>

        <Composer input={input} setInput={setInput} onSend={() => send(input)} busy={busy} />
      </div>
    </div>
  );
}

// ---------- Sidebar ----------

interface ChatSidebarProps {
  chats: ChatSession[];
  loading: boolean;
  activeId: number | null;
  onSelect: (id: number) => void;
  onNew: () => void;
}

function ChatSidebar({ chats, loading, activeId, onSelect, onNew }: ChatSidebarProps) {
  const groups: Record<string, ChatSession[]> = {};
  chats.forEach(c => {
    const key = c.created_at ? dateGroup(c.created_at) : 'Recent';
    (groups[key] = groups[key] ?? []).push(c);
  });

  return (
    <div style={{ width: 256, flex: '0 0 256px', borderRight: '1px solid var(--border)', background: 'var(--white)', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: 14 }}>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={onNew}>
          <Icons.plus size={16} sw={2.2} /> New Chat
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 14px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', paddingTop: 32, color: 'var(--ink-4)' }}>
            <span className="spin" style={{ display: 'inline-flex' }}><Icons.refresh size={18} /></span>
          </div>
        ) : chats.length === 0 ? (
          <div style={{ padding: '24px 10px', textAlign: 'center', fontSize: 12.5, color: 'var(--ink-4)', fontWeight: 600, lineHeight: 1.5 }}>
            No conversations yet.<br />Start a new chat to begin.
          </div>
        ) : (
          Object.entries(groups).map(([when, items]) => (
            <div key={when} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '.5px', padding: '8px 10px 5px' }}>{when}</div>
              {items.map(c => {
                const on = c.id === activeId;
                return (
                  <button key={c.id} onClick={() => onSelect(c.id)} style={{
                    width: '100%', textAlign: 'left', padding: '9px 11px', borderRadius: 9, marginBottom: 2,
                    border: 'none', background: on ? 'var(--red-tint)' : 'transparent',
                    color: on ? 'var(--red-700)' : 'var(--ink-2)', fontSize: 13, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 9, transition: '.12s',
                    borderLeft: on ? '2px solid var(--red)' : '2px solid transparent',
                  }}
                    onMouseEnter={e => { if (!on) e.currentTarget.style.background = 'var(--hover)'; }}
                    onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent'; }}>
                    <Icons.chat size={15} style={{ flex: '0 0 auto', opacity: on ? 1 : .6 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>

      <div style={{ padding: 13, borderTop: '1px solid var(--border)', fontSize: 11.5, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 8, lineHeight: 1.4 }}>
        <Icons.shield size={15} style={{ flex: '0 0 auto', color: 'var(--green)' }} />
        Conversations stay within your workspace
      </div>
    </div>
  );
}

// ---------- Message components ----------

function Welcome({ onPrompt: _onPrompt }: { onPrompt: (text: string) => void }) {
  return (
    <div style={{ paddingTop: 26, animation: 'fadeUp .4s both' }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--red)', display: 'grid', placeItems: 'center', color: '#fff', boxShadow: '0 6px 18px rgba(233,0,48,.3)', marginBottom: 18 }}>
        <Icons.chat size={28} />
      </div>
      <h2 style={{ margin: 0, fontSize: 25, fontWeight: 800, letterSpacing: '-.6px' }}>Ask a question about your documentation</h2>
      <p style={{ margin: '9px 0 0', fontSize: 14.5, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: 520 }}>
        Documentabot searches your indexed Benefit documents and answers with citations you can verify.
      </p>

      {/* TODO: prompt suggestions — see TODO.md
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginTop: 22 }}>
        {PROMPTS.map((p, i) => (
          <button key={i} onClick={() => _onPrompt(p.q)} style={{
            textAlign: 'left', padding: '14px 15px', borderRadius: 13,
            border: '1px solid var(--border)', background: 'var(--white)', boxShadow: 'var(--sh-xs)',
            display: 'flex', alignItems: 'flex-start', gap: 11, transition: '.14s', cursor: 'pointer',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red-tint-2)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--sh-sm)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--sh-xs)'; }}>
            <span style={{ width: 30, height: 30, borderRadius: 9, flex: '0 0 auto', background: 'var(--sand)', color: 'var(--red)', display: 'grid', placeItems: 'center' }}>
              <Icons.search size={15} />
            </span>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.4 }}>{p.q}</span>
          </button>
        ))}
      </div>
      */}

      <div style={{ marginTop: 28, fontSize: 12, color: 'var(--ink-4)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7 }}>
        <Icons.shield size={14} /> Documentabot only answers using indexed knowledge base documents.
      </div>
    </div>
  );
}

function UserMsg({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 22, animation: 'fadeUp .25s both' }}>
      <div style={{
        maxWidth: '78%', background: 'var(--red)', color: '#fff', padding: '11px 16px',
        borderRadius: '16px 16px 5px 16px', fontSize: 14.5, lineHeight: 1.5, fontWeight: 500,
        boxShadow: '0 3px 10px rgba(233,0,48,.22)',
      }}>{text}</div>
    </div>
  );
}

function AssistantMsg({ msg }: { msg: Message }) {
  const thinking = msg.status === 'thinking';
  return (
    <div style={{ display: 'flex', gap: 13, marginBottom: 26 }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, flex: '0 0 auto', background: 'var(--sand)', border: '1px solid var(--sand-line)', display: 'grid', placeItems: 'center', color: 'var(--red)', marginTop: 2 }}>
        <Icons.chat size={17} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="card" style={{ padding: '17px 18px', boxShadow: 'var(--sh-sm)', borderRadius: '5px 16px 16px 16px' }}>
          {thinking ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 13, fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
                <span style={{ display: 'inline-flex', gap: 3 }}>
                  <Dot d={0} /><Dot d={0.16} /><Dot d={0.32} />
                </span>
                Searching documents…
              </div>
              <ToolCalls tools={ANIM_TOOLS} states={msg.states!} />
            </div>
          ) : (
            <AnswerCard
              text={msg.text ?? ''}
              sources={msg.sources ?? []}
              tools={msg.states ? ANIM_TOOLS : undefined}
              states={msg.states}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Dot({ d }: { d: number }) {
  return <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', display: 'inline-block', animation: `blink 1.2s ${d}s infinite` }} />;
}

// ---------- Composer ----------

function Composer({ input, setInput, onSend, busy }: { input: string; setInput: (v: string) => void; onSend: () => void; busy: boolean }) {
  return (
    <div style={{ padding: '14px 24px 18px', borderTop: '1px solid var(--border)', background: 'var(--white)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 8, padding: '8px',
          border: '1px solid var(--border-2)', borderRadius: 15, background: 'var(--white)',
          boxShadow: 'var(--sh-xs)', transition: '.14s',
        }}
          onFocusCapture={e => (e.currentTarget.style.borderColor = 'var(--red)')}
          onBlurCapture={e => (e.currentTarget.style.borderColor = 'var(--border-2)')}>
          <textarea value={input} rows={1}
            onChange={e => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
            placeholder="Ask about policies, procedures, or documents…"
            style={{ flex: 1, border: 'none', outline: 'none', resize: 'none', fontSize: 14.5, lineHeight: 1.5, padding: '9px 4px', background: 'transparent', maxHeight: 120 }} />
          <button onClick={onSend} disabled={busy || !input.trim()} className="btn btn-primary" style={{ width: 40, height: 40, padding: 0, borderRadius: 11, flex: '0 0 auto' }}>
            {busy ? <Icons.refresh size={17} className="spin" /> : <Icons.send size={17} />}
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: 9, fontSize: 11.5, color: 'var(--ink-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Icons.shield size={13} /> Documentabot only answers using indexed knowledge base documents.
        </div>
      </div>
    </div>
  );
}
