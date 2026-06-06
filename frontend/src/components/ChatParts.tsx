import { useState } from 'react';
import { Icons } from './Icons';
import { FileChip, Confidence, RichText, SectionLabel, StatusBadge } from './Shared';
import type { Cite, AnswerData, Tool } from '../types';

interface CitePillProps {
  cite: Cite;
  onOpen: (cite: Cite) => void;
}

export function CitePill({ cite, onOpen }: CitePillProps) {
  const [hover, setHover] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <button onClick={() => onOpen(cite)} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, height: 26, padding: '0 9px 0 7px',
        borderRadius: 7, border: '1px solid var(--border-2)', background: 'var(--white)',
        fontSize: 12, fontWeight: 600, color: 'var(--ink)', transition: '.12s',
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.background = 'var(--red-tint)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.background = 'var(--white)'; }}>
        <span style={{
          width: 16, height: 16, borderRadius: 5, background: 'var(--red)', color: '#fff',
          fontSize: 10, fontWeight: 700, display: 'grid', placeItems: 'center',
        }}>{cite.id}</span>
        <FileChip type={cite.type} size={15} />
        <span style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cite.doc}</span>
        <span className="mono" style={{ color: 'var(--ink-3)', fontSize: 11 }}>· {cite.ref}</span>
      </button>
      {hover && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 9px)', left: 0, width: 290, zIndex: 50,
          background: 'var(--ink)', color: '#fff', borderRadius: 12, padding: 13,
          boxShadow: 'var(--sh-lg)', animation: 'pop .13s ease-out', pointerEvents: 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <FileChip type={cite.type} size={22} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cite.doc}.{cite.type}</div>
              <div className="mono" style={{ fontSize: 10.5, color: 'rgba(255,255,255,.6)' }}>{cite.ref}</div>
            </div>
          </div>
          <div style={{
            fontSize: 12, lineHeight: 1.5, color: 'rgba(255,255,255,.88)',
            borderLeft: '2px solid var(--red)', paddingLeft: 9, fontStyle: 'italic',
          }}>"{cite.snippet}"</div>
          <div style={{ marginTop: 10, paddingTop: 9, borderTop: '1px solid rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,.6)', fontWeight: 600 }}>MATCH CONFIDENCE</span>
            <span className="mono" style={{ fontSize: 11.5, fontWeight: 700, color: cite.conf >= 90 ? '#4ade80' : '#fbbf24' }}>{cite.conf}%</span>
          </div>
          <div style={{ marginTop: 8, fontSize: 10.5, color: 'rgba(255,255,255,.5)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Icons.open size={11} /> Click to preview in context
          </div>
          <div style={{ position: 'absolute', bottom: -5, left: 18, width: 10, height: 10, background: 'var(--ink)', transform: 'rotate(45deg)' }} />
        </div>
      )}
    </span>
  );
}

interface ToolCallsProps {
  tools: Tool[];
  states: string[];
  collapsed?: boolean;
  defaultOpen?: boolean;
}

export function ToolCalls({ tools, states, collapsed, defaultOpen }: ToolCallsProps) {
  const [open, setOpen] = useState(defaultOpen || false);
  const doneCount = states.filter(s => s === 'done').length;

  if (collapsed) {
    return (
      <div style={{ marginTop: 12 }}>
        <button onClick={() => setOpen(o => !o)} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, height: 28, padding: '0 11px',
          borderRadius: 8, border: '1px solid var(--border)', background: 'var(--sand-2)',
          fontSize: 11.5, fontWeight: 600, color: 'var(--ink-2)',
        }}>
          <Icons.zap size={13} style={{ color: 'var(--red)' }} />
          {doneCount} actions used
          <Icons.chevD size={13} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '.15s', opacity: .6 }} />
        </button>
        {open && (
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {tools.map((t, i) => <ToolRow key={t.id} tool={t} state={states[i]} />)}
          </div>
        )}
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {tools.map((t, i) => <ToolRow key={t.id} tool={t} state={states[i]} live />)}
    </div>
  );
}

function ToolRow({ tool, state, live }: { tool: Tool; state: string; live?: boolean }) {
  const Icon = Icons[tool.icon];
  const isDone = state === 'done', isRun = state === 'running';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 11, padding: '9px 12px',
      borderRadius: 10, border: '1px solid ' + (isRun ? 'var(--red-tint-2)' : 'var(--border)'),
      background: isRun ? 'var(--red-tint)' : 'var(--white)',
      opacity: state === 'pending' ? .45 : 1, transition: '.2s',
      animation: live && state !== 'pending' ? 'fadeUp .25s both' : 'none',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8, flex: '0 0 auto', display: 'grid', placeItems: 'center',
        background: isDone ? 'var(--green-bg)' : isRun ? 'var(--red)' : 'var(--hover)',
        color: isDone ? 'var(--green)' : isRun ? '#fff' : 'var(--ink-3)',
      }}>
        {isRun ? <Icons.refresh size={15} className="spin" /> : isDone ? <Icons.check size={16} sw={2.4} /> : <Icon size={15} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)' }}>{tool.label}</div>
        <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{tool.detail}</div>
      </div>
      {isDone && <span className="mono" style={{ fontSize: 10.5, color: 'var(--green)', fontWeight: 600 }}>done</span>}
      {isRun && <span className="mono" style={{ fontSize: 10.5, color: 'var(--red)', fontWeight: 600 }}>running…</span>}
    </div>
  );
}

interface AnswerCardProps {
  data: AnswerData;
  tools: Tool[];
  states: string[];
  onOpenCite: (cite: Cite) => void;
  onFollowup: (text: string) => void;
}

export function AnswerCard({ data, tools, states, onOpenCite, onFollowup }: AnswerCardProps) {
  return (
    <div style={{ animation: 'fadeUp .3s both' }}>
      <div style={{ fontSize: 14.5, lineHeight: 1.62, color: 'var(--ink-2)' }}>
        {data.noAnswer && (
          <div style={{
            display: 'flex', gap: 11, padding: '12px 14px', marginBottom: 13, borderRadius: 11,
            background: 'var(--amber-bg)', border: '1px solid #f0e0b8',
          }}>
            <Icons.warn size={18} style={{ color: 'var(--amber)', flex: '0 0 auto', marginTop: 1 }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: '#8a5e06' }}>
              Not enough indexed information found
            </div>
          </div>
        )}
        {data.answer.map((p, i) => (
          <p key={i} style={{ margin: i ? '11px 0 0' : 0 }}><RichText text={p} /></p>
        ))}
      </div>

      {data.missingDoc && (
        <div style={{
          marginTop: 13, padding: 13, borderRadius: 12, border: '1px dashed var(--border-2)',
          background: 'var(--sand-2)', display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <FileChip type={data.missingDoc.type} size={34} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{data.missingDoc.name}.{data.missingDoc.type}</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 1 }}>Likely source · not yet available to search</div>
          </div>
          <StatusBadge status={data.missingDoc.status} />
          <button className="btn btn-ghost btn-sm"><Icons.refresh size={14} /> Re-index</button>
        </div>
      )}

      {data.cites.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <SectionLabel icon="quote" text="Sources" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 9 }}>
            {data.cites.map(c => <CitePill key={c.id} cite={c} onOpen={onOpenCite} />)}
          </div>
        </div>
      )}

      <div style={{
        marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.4px' }}>Confidence</span>
          <Confidence value={data.confidence} />
        </div>
        {data.related.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.4px' }}>Related</span>
            {data.related.map(r => (
              <span key={r} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600,
                color: 'var(--ink-2)', padding: '3px 8px', borderRadius: 7, background: 'var(--hover)',
              }}><Icons.doc size={12} /> {r}</span>
            ))}
          </div>
        )}
      </div>

      <ToolCalls tools={tools} states={states} collapsed />

      {data.followups.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <SectionLabel icon="spark" text="Follow-up" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 9 }}>
            {data.followups.map(f => (
              <button key={f} onClick={() => onFollowup(f)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                textAlign: 'left', padding: '10px 13px', borderRadius: 10,
                border: '1px solid var(--border)', background: 'var(--white)',
                fontSize: 13, fontWeight: 600, color: 'var(--ink)', transition: '.12s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red-tint-2)'; e.currentTarget.style.background = 'var(--red-tint)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--white)'; }}>
                {f} <Icons.arrowR size={15} style={{ color: 'var(--red)', flex: '0 0 auto' }} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
