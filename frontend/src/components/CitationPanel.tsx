import { Icons } from './Icons';
import { FileChip, Confidence, SectionLabel } from './Shared';
import type { Cite } from '../types';

interface CitationPanelProps {
  cite: Cite;
  searched: string[];
  onClose: () => void;
}

export function CitationPanel({ cite, searched, onClose }: CitationPanelProps) {
  const before = 'This section establishes the standards that apply across all Benefit entities. Definitions used here follow the Group Glossary unless stated otherwise. ';
  const after = ' Exceptions require written approval from the document owner and are reviewed annually by the governing department.';

  return (
    <div style={{
      width: 388, flex: '0 0 388px', borderLeft: '1px solid var(--border)',
      background: 'var(--white)', display: 'flex', flexDirection: 'column',
      height: '100%', animation: 'slideIn .24s ease-out',
    }}>
      <style>{`@keyframes slideIn{from{transform:translateX(30px);opacity:0}to{transform:none;opacity:1}}`}</style>

      <div style={{ padding: '15px 17px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <FileChip type={cite.type} size={36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cite.doc}.{cite.type}</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 1 }}>{cite.ref} · updated May 28, 2026</div>
        </div>
        <button onClick={onClose} className="btn-subtle" style={{ width: 32, height: 32, borderRadius: 8, border: 'none', color: 'var(--ink-3)', display: 'grid', placeItems: 'center' }}>
          <Icons.x size={17} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 17 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 13px', borderRadius: 11, background: 'var(--sand-2)', border: '1px solid var(--border)', marginBottom: 15 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icons.shield size={16} style={{ color: 'var(--green)' }} />
            <span style={{ fontSize: 12.5, fontWeight: 700 }}>Cited passage</span>
          </div>
          <Confidence value={cite.conf} compact />
        </div>

        <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--sh-xs)' }}>
          <div style={{ padding: '9px 13px', borderBottom: '1px solid var(--border)', background: 'var(--sand-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600 }}>{cite.doc} — {cite.ref}</span>
            <Icons.page size={14} style={{ color: 'var(--ink-3)' }} />
          </div>
          <div style={{ padding: '16px 16px 20px', fontSize: 12.5, lineHeight: 1.7, color: 'var(--ink-3)' }}>
            <div style={{ height: 9, width: '55%', background: 'var(--hover)', borderRadius: 3, marginBottom: 13 }} />
            {before}
            <mark style={{
              background: 'var(--red-tint)', color: 'var(--ink)', padding: '2px 3px',
              borderRadius: 3, boxShadow: 'inset 0 -2px 0 var(--red)', fontWeight: 600, fontStyle: 'italic',
            }}>{cite.snippet}</mark>
            {after}
            <div style={{ height: 8, width: '92%', background: 'var(--hover)', borderRadius: 3, marginTop: 13 }} />
            <div style={{ height: 8, width: '78%', background: 'var(--hover)', borderRadius: 3, marginTop: 7 }} />
          </div>
        </div>

        {/* TODO: preview context actions — see TODO.md
        <button className="btn btn-primary" style={{ width: '100%', marginTop: 15 }}>
          <Icons.open size={16} /> Open document
        </button>
        <button className="btn btn-ghost" style={{ width: '100%', marginTop: 9 }}>
          <Icons.link size={15} /> Copy link to passage
        </button>
        */}

        <div style={{ marginTop: 22 }}>
          <SectionLabel icon="search" text="Documents searched" />
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 7 }}>
            {searched.map((s, i) => {
              const hit = s === cite.doc;
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 9,
                  border: '1px solid ' + (hit ? 'var(--red-tint-2)' : 'var(--border)'),
                  background: hit ? 'var(--red-tint)' : 'var(--white)',
                }}>
                  <Icons.doc size={15} style={{ color: hit ? 'var(--red)' : 'var(--ink-3)' }} />
                  <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: 'var(--ink)' }}>{s}</span>
                  {hit
                    ? <span className="badge badge-red" style={{ height: 20, padding: '0 7px' }}><span className="dot" /> matched</span>
                    : <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-4)' }}>no match</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
