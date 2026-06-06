import { useState, useRef, CSSProperties } from 'react';
import { Icons } from './Icons';
import { FileChip } from './Shared';
import type { Doc } from '../types';

interface FakeFile {
  name: string;
  type: string;
  size: string;
  pages: number;
}

interface UploadModalProps {
  onClose: () => void;
  onUpload: (doc: Doc) => void;
}

const inp: CSSProperties = {
  width: '100%', height: 40, padding: '0 12px', borderRadius: 9,
  border: '1px solid var(--border-2)', background: 'var(--white)',
  fontSize: 13.5, outline: 'none',
};

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-2)', marginBottom: 6 }}>
        {label}{optional && <span style={{ color: 'var(--ink-4)', fontWeight: 500 }}> · optional</span>}
      </div>
      {children}
    </label>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div style={{ position: 'relative' }}>
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        ...inp, appearance: 'none', paddingRight: 32, cursor: 'pointer', fontWeight: 600,
      }}>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <Icons.chevD size={15} style={{ position: 'absolute', right: 11, top: 12.5, color: 'var(--ink-3)', pointerEvents: 'none' }} />
    </div>
  );
}

export function UploadModal({ onClose, onUpload }: UploadModalProps) {
  const [file, setFile] = useState<FakeFile | null>(null);
  const [drag, setDrag] = useState(false);
  const [title, setTitle] = useState('');
  const [cat, setCat] = useState('HR Policies');
  const [access, setAccess] = useState('All employees');
  const [desc, setDesc] = useState('');
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const FAKE: FakeFile = { name: 'Remote Work Policy 2026', type: 'pdf', size: '1.3 MB', pages: 18 };

  function pick() {
    setFile(FAKE);
    if (!title) setTitle(FAKE.name);
  }

  function submit() {
    if (!file) return;
    setUploading(true);
    setTimeout(() => {
      onUpload({
        id: 'new' + Date.now(),
        name: title || file.name, type: file.type, cat,
        owner: 'You', ownerInit: 'YO', updated: 'Just now',
        size: file.size, pages: file.pages, status: 'processing', chunks: 0,
        access, isNew: true,
      });
      onClose();
    }, 900);
  }

  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 60,
      background: 'rgba(31,31,31,.42)', backdropFilter: 'blur(3px)',
      display: 'grid', placeItems: 'center', padding: 24, animation: 'fadeIn .16s',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 520, background: 'var(--white)', borderRadius: 18,
        boxShadow: 'var(--sh-lg)', overflow: 'hidden', animation: 'pop .2s ease-out',
      }}>
        <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Add Document</h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--ink-2)' }}>It will be indexed automatically after upload.</p>
          </div>
          <button onClick={onClose} className="btn-subtle" style={{ width: 34, height: 34, borderRadius: 9, border: 'none', display: 'grid', placeItems: 'center', color: 'var(--ink-3)' }}>
            <Icons.x size={18} />
          </button>
        </div>

        <div style={{ padding: 22, maxHeight: '62vh', overflowY: 'auto' }}>
          {!file ? (
            <div
              onClick={pick}
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); pick(); }}
              style={{
                border: '2px dashed ' + (drag ? 'var(--red)' : 'var(--border-2)'),
                background: drag ? 'var(--red-tint)' : 'var(--sand-2)',
                borderRadius: 14, padding: '34px 20px', textAlign: 'center', cursor: 'pointer', transition: '.15s',
              }}>
              <div style={{ width: 48, height: 48, margin: '0 auto 12px', borderRadius: 13, background: 'var(--white)', border: '1px solid var(--border)', display: 'grid', placeItems: 'center', color: 'var(--red)' }}>
                <Icons.upload size={22} />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 700 }}>Drag & drop a file here</div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4 }}>or <span style={{ color: 'var(--red)', fontWeight: 700 }}>browse</span> from your computer</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 12 }}>PDF · DOCX · MD · TXT · XLSX — max 50 MB</div>
              <input ref={inputRef} type="file" style={{ display: 'none' }} />
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: 14, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--sand-2)' }}>
              <FileChip type={file.type} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{file.name}.{file.type}</div>
                <div className="mono" style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>{file.size} · {file.pages} pages · ready to upload</div>
              </div>
              <button onClick={() => setFile(null)} className="btn-subtle" style={{ width: 30, height: 30, borderRadius: 8, border: 'none', color: 'var(--ink-3)' }}>
                <Icons.x size={16} />
              </button>
            </div>
          )}

          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Document title">
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Remote Work Policy 2026" style={inp} />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Category">
                <Select value={cat} onChange={setCat} options={['HR Policies', 'Compliance', 'IT & Security', 'Operations', 'Finance', 'Product', 'Legal']} />
              </Field>
              <Field label="Access level">
                <Select value={access} onChange={setAccess} options={['All employees', 'Managers only', 'Finance, Managers', 'Support team', 'Legal, IT']} />
              </Field>
            </div>
            <Field label="Description" optional>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2}
                placeholder="Short summary to help colleagues find this document…"
                style={{ ...inp, height: 'auto', padding: '10px 12px', resize: 'vertical', lineHeight: 1.5 }} />
            </Field>
          </div>
        </div>

        <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10, background: 'var(--sand-2)' }}>
          <button className="btn btn-ghost" onClick={onClose} disabled={uploading}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={!file || uploading} style={{ minWidth: 168 }}>
            {uploading ? <><Icons.refresh size={16} className="spin" /> Uploading…</> : <><Icons.upload size={16} /> Upload Document</>}
          </button>
        </div>
      </div>
    </div>
  );
}
