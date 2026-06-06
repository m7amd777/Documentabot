import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icons } from './Icons';
import { FileChip, StatusBadge } from './Shared';
import { UploadModal } from './UploadModal';
import { documents } from '../api';
import type { Doc } from '../types';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export function KnowledgeBase() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('All categories');
  const [ftype, setFtype] = useState('All types');
  const [modal, setModal] = useState(false);
  const [menuFor, setMenuFor] = useState<number | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Doc | null>(null);

  async function fetchDocs() {
    setLoading(true);
    try {
      const data = await documents.list();
      setDocs(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchDocs(); }, []);

  const cats = ['All categories', ...Array.from(new Set(docs.map(d => d.category).filter(Boolean) as string[]))];
  const types = ['All types', 'PDF'];

  const list = docs.filter(d =>
    (cat === 'All categories' || d.category === cat) &&
    (ftype === 'All types' || d.file_type.toUpperCase() === ftype) &&
    (query === '' || d.name.toLowerCase().includes(query.toLowerCase()))
  );

  const active = docs.filter(d => d.status === 'active').length;

  async function handleDelete(id: number) {
    setMenuFor(null);
    try {
      await documents.delete(id);
      setDocs(prev => prev.filter(d => d.id !== id));
    } catch {
      // no-op — could surface a toast later
    }
  }

  function handleUploaded() {
    fetchDocs();
  }

  function handleDownload(doc: Doc) {
    setMenuFor(null);
    const a = document.createElement('a');
    a.href = `/api/documents/${doc.id}/download`;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function handlePreview(doc: Doc) {
    setMenuFor(null);
    setPreviewDoc(doc);
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '26px 30px 60px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--ink-3)', fontWeight: 600 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'inherit', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
            onMouseLeave={e => (e.currentTarget.style.color = '')}>
            <Icons.home size={14} /> Home
          </Link>
          <Icons.chevR size={13} style={{ opacity: .6 }} />
          <span style={{ color: 'var(--ink)' }}>Knowledge Base</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, margin: '14px 0 22px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '-.8px', whiteSpace: 'nowrap' }}>Knowledge Base</h1>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--ink-2)' }}>
              {docs.length} documents · <span style={{ color: 'var(--green)', fontWeight: 600 }}>{active} active</span>
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setModal(true)}>
            <Icons.plus size={16} sw={2.2} /> Add Document
          </button>
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
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '70px 0', color: 'var(--ink-3)' }}>
            <span className="spin" style={{ display: 'inline-flex' }}><Icons.refresh size={22} /></span>
          </div>
        ) : list.length === 0 ? (
          <EmptyState filtered={query !== '' || cat !== 'All categories' || ftype !== 'All types'} onAdd={() => setModal(true)} />
        ) : (
          <DocTable
            list={list}
            menuFor={menuFor}
            setMenuFor={setMenuFor}
            onDelete={handleDelete}
            onDownload={handleDownload}
            onPreview={handlePreview}
            formatSize={formatSize}
            initials={initials}
          />
        )}
      </div>

      {modal && <UploadModal onClose={() => setModal(false)} onUploaded={handleUploaded} />}
      {previewDoc && <PdfPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />}
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
  const active = !value.startsWith('All');
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
  menuFor: number | null;
  setMenuFor: (id: number | null) => void;
  onDelete: (id: number) => void;
  onDownload: (doc: Doc) => void;
  onPreview: (doc: Doc) => void;
  formatSize: (bytes: number) => string;
  initials: (name: string) => string;
}

function DocTable({ list, menuFor, setMenuFor, onDelete, onDownload, onPreview, formatSize, initials }: DocTableProps) {
  const cols = 'minmax(220px,2.4fr) 80px 1.4fr 1.6fr 1.2fr 44px';
  return (
    <div className="card" style={{ overflow: 'visible', boxShadow: 'var(--sh-sm)' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: cols, gap: 12, padding: '12px 18px',
        borderBottom: '1px solid var(--border)', fontSize: 11.5, fontWeight: 700,
        color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.5px',
      }}>
        <div>File name</div><div>Type</div><div>Category</div><div>Uploaded by</div>
        <div>Status</div><div />
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
            <FileChip type={d.file_type} size={34} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {d.name}
              </div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 1 }}>
                {formatSize(d.file_size)}
                {d.pages ? ` · ${d.pages} pp` : ''}
                {d.chunks ? ` · ${d.chunks} chunks` : ''}
              </div>
            </div>
          </div>
          <div className="mono" style={{ fontSize: 12, color: 'var(--ink-2)', textTransform: 'uppercase' }}>{d.file_type}</div>
          <div style={{ color: 'var(--ink-2)' }}>{d.category ?? '—'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 24, height: 24, borderRadius: '50%', flex: '0 0 auto',
              background: 'var(--sand)', color: 'var(--ink-2)', fontSize: 10, fontWeight: 700,
              display: 'grid', placeItems: 'center',
            }}>{initials(d.owner_name)}</span>
            <span style={{ color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.owner_name}</span>
          </div>
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
            {menuFor === d.id && (
              <RowMenu
                onClose={() => setMenuFor(null)}
                onPreview={() => onPreview(d)}
                onDownload={() => onDownload(d)}
                onDelete={() => onDelete(d.id)}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

interface RowMenuProps {
  onClose: () => void;
  onPreview: () => void;
  onDownload: () => void;
  onDelete: () => void;
}

function RowMenu({ onClose, onPreview, onDownload, onDelete }: RowMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const items: { label: string; icon: string; action: () => void; danger?: boolean }[] = [
    { label: 'Preview',  icon: 'eye',      action: onPreview },
    { label: 'Download', icon: 'download', action: onDownload },
    { label: 'Delete',   icon: 'trash',    action: onDelete, danger: true },
  ];

  return (
    <div ref={ref} style={{
      position: 'absolute', top: 34, right: 0, width: 160, zIndex: 30,
      background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 11,
      boxShadow: 'var(--sh-lg)', padding: 6, animation: 'pop .13s ease-out',
    }}>
      {items.map((it, i) => {
        const Icon = Icons[it.icon];
        return (
          <button key={it.label} onClick={it.action} style={{
            width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 8,
            border: 'none', background: 'transparent', fontSize: 13, fontWeight: 600,
            color: it.danger ? 'var(--red)' : 'var(--ink)',
            display: 'flex', alignItems: 'center', gap: 10,
            marginTop: it.danger && i > 0 ? 2 : 0,
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

function PdfPreviewModal({ doc, onClose }: { doc: Doc; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 80,
        background: 'rgba(15,15,15,.65)', backdropFilter: 'blur(4px)',
        display: 'flex', flexDirection: 'column', padding: 28, animation: 'fadeIn .18s',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
          background: 'var(--white)', borderRadius: 16, overflow: 'hidden',
          boxShadow: 'var(--sh-lg)', animation: 'pop .2s ease-out',
        }}
      >
        <div style={{
          padding: '13px 18px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 12, flex: '0 0 auto',
        }}>
          <Icons.doc size={18} style={{ color: 'var(--red)', flexShrink: 0 }} />
          <span style={{ fontWeight: 700, fontSize: 14.5, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {doc.name}
          </span>
          <a
            href={`/api/documents/${doc.id}/download`}
            download={doc.name}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: 33, padding: '0 12px', borderRadius: 8, fontSize: 12.5, fontWeight: 600,
              background: 'var(--surface)', border: '1px solid var(--border-2)',
              color: 'var(--ink-2)', textDecoration: 'none', boxShadow: 'var(--sh-xs)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface)')}
          >
            <Icons.download size={14} /> Download
          </a>
          <button
            onClick={onClose}
            style={{
              width: 33, height: 33, borderRadius: 8, border: 'none',
              background: 'transparent', color: 'var(--ink-3)', display: 'grid', placeItems: 'center',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <Icons.x size={18} />
          </button>
        </div>
        <iframe
          src={`/api/documents/${doc.id}/view`}
          title={doc.name}
          style={{ flex: 1, border: 'none', width: '100%', display: 'block' }}
        />
      </div>
    </div>
  );
}

function EmptyState({ filtered, onAdd }: { filtered: boolean; onAdd: () => void }) {
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
        {filtered ? 'No documents match your filters' : 'No documents yet'}
      </h3>
      <p style={{ margin: '8px 0 20px', fontSize: 14, color: 'var(--ink-2)', maxWidth: 380, lineHeight: 1.5 }}>
        {filtered
          ? 'Try clearing a filter or searching for a different term.'
          : 'Upload your first document to start building the knowledge base.'}
      </p>
      {!filtered && <button className="btn btn-primary" onClick={onAdd}><Icons.upload size={16} /> Upload Document</button>}
      {!filtered && (
        <div style={{ marginTop: 22, fontSize: 12, color: 'var(--ink-4)', fontWeight: 600 }}>
          Supported: PDF
        </div>
      )}
    </div>
  );
}
