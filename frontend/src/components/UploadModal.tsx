import { useState, useRef, CSSProperties } from 'react';
import { Icons } from './Icons';
import { FileChip } from './Shared';
import { documents, ApiError } from '../api';

interface UploadModalProps {
  onClose: () => void;
  onUploaded: () => void;
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

function fileExt(filename: string) {
  return filename.split('.').pop()?.toLowerCase() ?? 'pdf';
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadModal({ onClose, onUploaded }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [cat, setCat] = useState('HR Policies');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function pick(f: File) {
    setError('');
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported.');
      return;
    }
    setFile(f);
  }

  async function submit() {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      await documents.upload(file, cat);
      onUploaded();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed.');
      setUploading(false);
    }
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
              onClick={() => inputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) pick(f); }}
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
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 12 }}>PDF — max 50 MB</div>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf"
                style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) pick(f); }}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: 14, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--sand-2)' }}>
              <FileChip type={fileExt(file.name)} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                <div className="mono" style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>{formatSize(file.size)} · ready to upload</div>
              </div>
              <button onClick={() => setFile(null)} className="btn-subtle" style={{ width: 30, height: 30, borderRadius: 8, border: 'none', color: 'var(--ink-3)' }}>
                <Icons.x size={16} />
              </button>
            </div>
          )}

          {error && <p style={{ margin: '12px 0 0', fontSize: 13, color: 'var(--red-700)', background: 'var(--red-tint)', border: '1px solid var(--red-tint-2)', borderRadius: 8, padding: '9px 12px' }}>{error}</p>}

          <div style={{ marginTop: 18 }}>
            <Field label="Category">
              <Select value={cat} onChange={setCat} options={['HR Policies', 'Compliance', 'IT & Security', 'Operations', 'Finance', 'Product', 'Legal']} />
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
