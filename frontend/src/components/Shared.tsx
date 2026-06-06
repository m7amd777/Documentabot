import { CSSProperties } from 'react';
import { Icons } from './Icons';
import { FILE_TYPES } from '../data';

interface FileChipProps {
  type: string;
  size?: number;
}

export function FileChip({ type, size = 36 }: FileChipProps) {
  const ft = FILE_TYPES[type] || FILE_TYPES.txt;
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.27,
      background: ft.bg, color: ft.color,
      display: 'grid', placeItems: 'center', flex: '0 0 auto',
      fontFamily: 'var(--mono)', fontWeight: 700,
      fontSize: size * 0.27, letterSpacing: '-.3px',
    }}>
      {ft.label}
    </div>
  );
}

const STATUS_MAP: Record<string, { cls: string; label: string }> = {
  active:     { cls: 'badge-green', label: 'Active' },
  inactive:   { cls: 'badge-slate', label: 'Inactive' },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] || { cls: 'badge-slate', label: status };
  return (
    <span className={'badge ' + s.cls}>
      <span className="dot" />
      {s.label}
    </span>
  );
}

interface ConfidenceProps {
  value: number;
  compact?: boolean;
}

export function Confidence({ value, compact }: ConfidenceProps) {
  const tone = value >= 90 ? 'var(--green)' : value >= 70 ? 'var(--amber)' : 'var(--red)';
  const label = value >= 90 ? 'High' : value >= 70 ? 'Medium' : value > 0 ? 'Low' : 'None';
  const segs = 5;
  const filled = Math.round((value / 100) * segs);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', gap: 2.5 }}>
        {Array.from({ length: segs }).map((_, i) => (
          <span key={i} style={{
            width: compact ? 5 : 7, height: compact ? 10 : 13, borderRadius: 2,
            background: i < filled ? tone : '#e7e4db',
          }} />
        ))}
      </div>
      <span style={{ fontSize: compact ? 11 : 12, fontWeight: 700, color: tone }}>
        {label}{value > 0 && <span className="mono" style={{ fontWeight: 600, opacity: .85 }}> · {value}%</span>}
      </span>
    </div>
  );
}

export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**')
          ? <strong key={i} style={{ fontWeight: 700, color: 'var(--ink)' }}>{p.slice(2, -2)}</strong>
          : <span key={i}>{p}</span>
      )}
    </>
  );
}

interface SectionLabelProps {
  icon: string;
  text: string;
  style?: CSSProperties;
}

export function SectionLabel({ icon, text, style }: SectionLabelProps) {
  const Icon = Icons[icon];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 7,
      fontSize: 11.5, fontWeight: 700, color: 'var(--ink-3)',
      textTransform: 'uppercase', letterSpacing: '.5px',
      ...style,
    }}>
      <Icon size={13} style={{ color: 'var(--red)' }} /> {text}
    </div>
  );
}
