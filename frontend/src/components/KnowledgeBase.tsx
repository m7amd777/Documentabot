import { useState, useRef, useEffect } from 'react';
import { Icons } from './Icons';
import { FileChip, StatusBadge } from './Shared';
import { UploadModal } from './UploadModal';
import type { Doc } from '../types';

type Screen = 'home' | 'kb' | 'chat';

interface KnowledgeBaseProps {
  docs: Doc[];
  addDoc: (doc: Doc) => void;
  navigate: (screen: Screen) => void;
}

export function KnowledgeBase({ docs, addDoc, navigate }: KnowledgeBaseProps) {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('All categories');
  const [ftype, setFtype] = useState('All types');
  const [modal, setModal] = useState(false);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [emptyDemo, setEmptyDemo] = useState(false);

  const cats = ['All categories', ...Array.from(new Set(docs.map(d => d.cat)))];
  const types = ['All types', 'PDF', 'DOCX', 'XLSX', 'MD'];

  let list = docs.filter(d =>
    (cat === 'All categories' || d.cat === cat) &&
    (ftype === 'All types' || d.type.toUpperCase() === ftype) &&
    (query === '' || d.name.toLowerCase().includes(query.toLowerCase()))
  );
  if (emptyDemo) list = [];

  const indexed = docs.filter(d => d.status === 'indexed').length;
  const processing = docs.filter(d => d.status === 'processing').length;

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '26px 30px 60px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--ink-3)', fontWeight: 600 }}>
          <span onClick={() => navigate('home')} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
            onMouseLeave={e => (e.currentTarget.style.color = '')}>
            <Icons.home size={14} /> Home
          </span>
          <Icons.chevR size={13} style={{ opacity: .6 }} />
          <span style={{ color: 'var(--ink)' }}>Knowledge Base</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, margin: '14px 0 22px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '-.8px', whiteSpace: 'nowrap' }}>Knowledge Base</h1>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--ink-2)' }}>
              {docs.length} documents · <span style={{ color: 'var(--green)', fontWeight: 600 }}>{indexed} indexed</span>
              {processing > 0 && <> · <span style={{ color: 'var(--amber)', fontWeight: 600 }}>{processing} processing</span></>}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 9 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setEmptyDemo(e => !e)} title="Toggle empty-state demo">
              <Icons.eye size={15} /> {emptyDemo ? 'Show docs' : 'Empty state'}
            </button>
            <button className="btn btn-primary" onClick={() => setModal(true)}>
              <Icons.plus size={16} sw={2.2} /> Add Document
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 280px', minWidth: 220 }}>
            <Icons.search size={17} style={{ position: 'absolute', left: 13, top: 11.5, color: 'var(--ink-3)' }} />
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search documents…"
              style={{
                width: '100%', height: 40, padding: '0 14px 0 38px',
                borderRadius: 10, border: '1px solid var(--border-2)', background: 'var(--white)',
                fontSize: 14, outline: 'none', boxShadow: 'var(--sh-xs)',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--red)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border-2)')} />
          </div>
          <Dropdown value={cat} options={cats} onChange={setCat} icon="folder" />
          <Dropdown value={ftype} options={types} onChange={setFtype} icon="doc" />
          <Dropdown value="Any date" options={['Any date', 'Last 7 days', 'Last 30 days', 'This year']} onChange={() => {}} icon="clock" />
          <Dropdown value="All owners" options={['All owners', 'Dana Whitfield', 'Marcus Reed', 'Priya Nair']} onChange={() => {}} icon="settings" />
        </div>

        {list.length === 0
          ? <EmptyState empty={emptyDemo} onAdd={() => setModal(true)} />
          : <DocTable list={list} menuFor={menuFor} setMenuFor={setMenuFor} />}
      </div>

      {modal && <UploadModal onClose={() => setModal(false)} onUpload={addDoc} />}
    </div>
  );
}

interface DropdownProps {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  icon: string;
}

function Dropdown({ value, options, onChange, icon }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const Icon = Icons[icon];
  const active = !value.startsWith('All') && value !== 'Any date';
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        height: 40, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 8,
        borderRadius: 10, border: '1px solid ' + (active ? 'var(--red-tint-2)' : 'var(--border-2)'),
        background: active ? 'var(--red-tint)' : 'var(--white)', color: active ? 'var(--red-700)' : 'var(--ink-2)',
        fontSize: 13, fontWeight: 600, boxShadow: 'var(--sh-xs)', whiteSpace: 'nowrap',
      }}>
        <Icon size={15} /> {value} <Icons.chevD size={14} style={{ opacity: .6 }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 46, left: 0, minWidth: 180, zIndex: 30,
          background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12,
          boxShadow: 'var(--sh-lg)', padding: 6, animation: 'pop .14s ease-out',
        }}>
          {options.map(o => (
            <button key={o} onClick={() => { onChange(o); setOpen(false); }} style={{
              width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 8,
              border: 'none', background: o === value ? 'var(--hover)' : 'transparent',
              fontSize: 13, fontWeight: 600, color: 'var(--ink)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = o === value ? 'var(--hover)' : 'transparent')}>
              {o} {o === value && <Icons.check size={15} style={{ color: 'var(--red)' }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface DocTableProps {
  list: Doc[];
  menuFor: string | null;
  setMenuFor: (id: string | null) => void;
}

function DocTable({ list, menuFor, setMenuFor }: DocTableProps) {
  const cols = 'minmax(220px,2.4fr) 86px 1.3fr 1.3fr 1fr 1.2fr 44px';
  return (
    <div className="card" style={{ overflow: 'visible', boxShadow: 'var(--sh-sm)' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: cols, gap: 12, padding: '12px 18px',
        borderBottom: '1px solid var(--border)', fontSize: 11.5, fontWeight: 700,
        color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.5px',
      }}>
        <div>File name</div><div>Type</div><div>Category</div><div>Uploaded by</div>
        <div>Last updated</div><div>Status</div><div></div>
      </div>
      {list.map((d, i) => (
        <div key={d.id} style={{
          display: 'grid', gridTemplateColumns: cols, gap: 12, padding: '13px 18px',
          alignItems: 'center', borderBottom: i < list.length - 1 ? '1px solid var(--border)' : 'none',
          fontSize: 13.5, transition: '.12s', position: 'relative',
          animation: d.isNew ? 'fadeUp .4s both' : 'none',
          background: d.isNew ? 'var(--sand-2)' : 'transparent',
        }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = d.isNew ? 'var(--sand-2)' : 'transparent')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <FileChip type={d.type} size={34} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {d.name}.{d.type}
              </div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 1 }}>
                {d.size} · {d.pages} pp{d.chunks ? ` · ${d.chunks} chunks` : ''}
              </div>
            </div>
          </div>
          <div className="mono" style={{ fontSize: 12, color: 'var(--ink-2)', textTransform: 'uppercase' }}>{d.type}</div>
          <div style={{ color: 'var(--ink-2)' }}>{d.cat}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 24, height: 24, borderRadius: '50%', flex: '0 0 auto',
              background: 'var(--sand)', color: 'var(--ink-2)', fontSize: 10, fontWeight: 700,
              display: 'grid', placeItems: 'center',
            }}>{d.ownerInit}</span>
            <span style={{ color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.owner}</span>
          </div>
          <div className="mono" style={{ fontSize: 12, color: 'var(--ink-2)' }}>{d.updated}</div>
          <div><StatusBadge status={d.status} /></div>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setMenuFor(menuFor === d.id ? null : d.id)} style={{
              width: 30, height: 30, borderRadius: 8, border: 'none', background: 'transparent',
              color: 'var(--ink-3)', display: 'grid', placeItems: 'center',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--white)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <Icons.dots size={18} />
            </button>
            {menuFor === d.id && <RowMenu onClose={() => setMenuFor(null)} />}
          </div>
        </div>
      ))}
    </div>
  );
}

function RowMenu({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const items = [
    { label: 'View',     icon: 'eye' },
    { label: 'Replace',  icon: 'swap' },
    { label: 'Re-index', icon: 'refresh' },
    { label: 'Delete',   icon: 'trash', danger: true },
  ];
  return (
    <div ref={ref} style={{
      position: 'absolute', top: 34, right: 0, width: 168, zIndex: 30,
      background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 11,
      boxShadow: 'var(--sh-lg)', padding: 6, animation: 'pop .13s ease-out',
    }}>
      {items.map(it => {
        const Icon = Icons[it.icon];
        return (
          <button key={it.label} onClick={onClose} style={{
            width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 8,
            border: 'none', background: 'transparent', fontSize: 13, fontWeight: 600,
            color: it.danger ? 'var(--red)' : 'var(--ink)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}
            onMouseEnter={e => (e.currentTarget.style.background = it.danger ? 'var(--red-tint)' : 'var(--hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <Icon size={15} /> {it.label}
          </button>
        );
      })}
    </div>
  );
}

function EmptyState({ empty, onAdd }: { empty: boolean; onAdd: () => void }) {
  return (
    <div className="card" style={{
      padding: '64px 30px', textAlign: 'center', boxShadow: 'var(--sh-sm)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <div style={{
        width: 66, height: 66, borderRadius: 18, background: 'var(--sand)',
        display: 'grid', placeItems: 'center', color: 'var(--red)', marginBottom: 18,
      }}>
        <Icons.folder size={32} sw={1.5} />
      </div>
      <h3 style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>
        {empty ? 'No documents yet' : 'No documents match your filters'}
      </h3>
      <p style={{ margin: '8px 0 20px', fontSize: 14, color: 'var(--ink-2)', maxWidth: 380, lineHeight: 1.5 }}>
        {empty
          ? 'Upload your first document to start building the knowledge base. Documentabot can only answer from indexed files.'
          : 'Try clearing a filter or searching for a different term.'}
      </p>
      {empty && <button className="btn btn-primary" onClick={onAdd}><Icons.upload size={16} /> Upload Document</button>}
      {empty && (
        <div style={{ marginTop: 22, fontSize: 12, color: 'var(--ink-4)', fontWeight: 600 }}>
          Supported: PDF · DOCX · Markdown · TXT · XLSX
        </div>
      )}
    </div>
  );
}
