import { useState } from 'react';
import { Icons } from './Icons';
import { FileChip, RichText, SectionLabel } from './Shared';
import type { Source, ToolDef } from '../types';

// TODO: CitePill with "preview in context" — see TODO.md
// CitePill and CitationPanel are kept in their files for future implementation.

interface ToolCallsProps {
  tools: ToolDef[];
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
          {doneCount} steps completed
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

function ToolRow({ tool, state, live }: { tool: ToolDef; state: string; live?: boolean }) {
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
      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)' }}>{tool.label}</div>
      <div style={{ flex: 1 }} />
      {isDone && <span className="mono" style={{ fontSize: 10.5, color: 'var(--green)', fontWeight: 600 }}>done</span>}
      {isRun && <span className="mono" style={{ fontSize: 10.5, color: 'var(--red)', fontWeight: 600 }}>running…</span>}
    </div>
  );
}

function SourcePill({ source, index }: { source: Source; index: number }) {
  const ext = source.file.split('.').pop()?.toLowerCase() ?? 'pdf';
  const [hover, setHover] = useState(false);
  return (
    <span
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, height: 26, padding: '0 9px 0 7px',
        borderRadius: 7, border: '1px solid var(--border-2)', background: 'var(--white)',
        fontSize: 12, fontWeight: 600, color: 'var(--ink)',
      }}>
        <span style={{
          width: 16, height: 16, borderRadius: 5, background: 'var(--red)', color: '#fff',
          fontSize: 10, fontWeight: 700, display: 'grid', placeItems: 'center', flexShrink: 0,
        }}>{index + 1}</span>
        <FileChip type={ext} size={15} />
        <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{source.file}</span>
        <span className="mono" style={{ color: 'var(--ink-3)', fontSize: 11, flexShrink: 0 }}>· p.{source.page}</span>
      </span>
      {hover && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, zIndex: 50,
          background: 'var(--ink)', color: '#fff', borderRadius: 10, padding: '10px 13px',
          fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
          boxShadow: 'var(--sh-lg)', animation: 'pop .12s ease-out', pointerEvents: 'none',
        }}>
          {source.file} — page {source.page}
          <div style={{ position: 'absolute', bottom: -5, left: 16, width: 10, height: 10, background: 'var(--ink)', transform: 'rotate(45deg)' }} />
        </div>
      )}
    </span>
  );
}

interface AnswerCardProps {
  text: string;
  sources: Source[];
  tools?: ToolDef[];
  states?: string[];
}

export function AnswerCard({ text, sources, tools, states }: AnswerCardProps) {
  return (
    <div style={{ animation: 'fadeUp .3s both' }}>
      <div style={{ fontSize: 14.5, lineHeight: 1.62, color: 'var(--ink-2)' }}>
        {text.split('\n').filter(Boolean).map((p, i) => (
          <p key={i} style={{ margin: i ? '11px 0 0' : 0 }}><RichText text={p} /></p>
        ))}
      </div>

      {sources.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <SectionLabel icon="quote" text="Sources" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 9 }}>
            {sources.map((s, i) => <SourcePill key={i} source={s} index={i} />)}
          </div>
        </div>
      )}

      {tools && states && (
        <ToolCalls tools={tools} states={states} collapsed />
      )}
    </div>
  );
}
