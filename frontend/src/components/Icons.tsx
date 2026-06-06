import { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  sw?: number;
  fill?: string;
}

const Ic = ({ d, children, size = 24, fill = 'none', sw = 1.7, ...p }: IconProps & { d?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={fill}
    stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...p}>
    {d ? <path d={d} /> : children}
  </svg>
);

export const Icons: Record<string, (p: IconProps) => JSX.Element> = {
  chat:     (p) => <Ic {...p} d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1-.9-3.8A8.38 8.38 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z" />,
  folder:   (p) => <Ic {...p} d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />,
  search:   (p) => <Ic {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></Ic>,
  settings: (p) => <Ic {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a7.8 7.8 0 0 0 .1-3l1.7-1.3-1.8-3.1-2 .8a7.5 7.5 0 0 0-2.6-1.5l-.3-2.1H10l-.3 2.1A7.5 7.5 0 0 0 7 6.9l-2-.8-1.8 3.1L4.9 10.5a7.8 7.8 0 0 0 0 3l-1.7 1.3 1.8 3.1 2-.8a7.5 7.5 0 0 0 2.6 1.5l.3 2.1h3.6l.3-2.1a7.5 7.5 0 0 0 2.6-1.5l2 .8 1.8-3.1z"/></Ic>,
  layers:   (p) => <Ic {...p}><path d="m12 3 9 5-9 5-9-5 9-5z"/><path d="m3 13 9 5 9-5"/></Ic>,
  zap:      (p) => <Ic {...p} d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />,
  doc:      (p) => <Ic {...p}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></Ic>,
  send:     (p) => <Ic {...p} d="M4 12 20 4l-6 16-3-7-7-1z" />,
  plus:     (p) => <Ic {...p}><path d="M12 5v14M5 12h14"/></Ic>,
  arrowR:   (p) => <Ic {...p} d="M5 12h14M13 6l6 6-6 6" />,
  upload:   (p) => <Ic {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M12 16V4M7 9l5-5 5 5"/></Ic>,
  x:        (p) => <Ic {...p}><path d="M6 6l12 12M18 6 6 18"/></Ic>,
  chevD:    (p) => <Ic {...p} d="m6 9 6 6 6-6" />,
  chevR:    (p) => <Ic {...p} d="m9 6 6 6-6 6" />,
  dots:     (p) => <Ic {...p}><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></Ic>,
  check:    (p) => <Ic {...p} d="M5 12.5 10 17l9-10" />,
  shield:   (p) => <Ic {...p}><path d="M12 3 5 6v6c0 4 3 6.5 7 8 4-1.5 7-4 7-8V6l-7-3z"/><path d="m9 12 2 2 4-4"/></Ic>,
  clock:    (p) => <Ic {...p}><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></Ic>,
  filter:   (p) => <Ic {...p} d="M4 5h16l-6 7v6l-4 2v-8L4 5z" />,
  eye:      (p) => <Ic {...p}><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/></Ic>,
  refresh:  (p) => <Ic {...p}><path d="M20 11a8 8 0 0 0-14-4.3L4 9"/><path d="M4 4v5h5"/><path d="M4 13a8 8 0 0 0 14 4.3l2-2.3"/><path d="M20 20v-5h-5"/></Ic>,
  trash:    (p) => <Ic {...p}><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13h10l1-13"/></Ic>,
  swap:     (p) => <Ic {...p}><path d="M7 4 3 8l4 4"/><path d="M3 8h13a4 4 0 0 1 0 8h-2"/><path d="m17 20 4-4-4-4"/></Ic>,
  warn:     (p) => <Ic {...p}><path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17.5v.5"/></Ic>,
  spark:    (p) => <Ic {...p} d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6L12 3z" />,
  link:     (p) => <Ic {...p}><path d="M9 12h6"/><path d="M10 8H8a4 4 0 0 0 0 8h2"/><path d="M14 8h2a4 4 0 0 1 0 8h-2"/></Ic>,
  quote:    (p) => <Ic {...p}><path d="M9 7H6a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v3H5M19 7h-3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v3h-3"/></Ic>,
  open:     (p) => <Ic {...p}><path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/></Ic>,
  home:     (p) => <Ic {...p}><path d="m3 11 9-7 9 7"/><path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9"/></Ic>,
  database: (p) => <Ic {...p}><ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></Ic>,
  bolt:     (p) => <Ic {...p} d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />,
  paperclip:(p) => <Ic {...p} d="M21 11.5 12.5 20a5 5 0 0 1-7-7l8-8a3.3 3.3 0 0 1 4.7 4.7l-8 8a1.6 1.6 0 0 1-2.3-2.3l7.3-7.3" />,
  sliders:  (p) => <Ic {...p}><path d="M4 7h10M18 7h2M4 17h6M14 17h6"/><circle cx="16" cy="7" r="2"/><circle cx="12" cy="17" r="2"/></Ic>,
  page:     (p) => <Ic {...p}><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/></Ic>,
};
