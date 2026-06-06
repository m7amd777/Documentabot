import { Icons } from './Icons';

type Screen = 'home' | 'kb' | 'chat';

interface LandingProps {
  navigate: (screen: Screen) => void;
}

export function Landing({ navigate }: LandingProps) {
  const cards = [
    {
      key: 'kb', icon: 'folder', go: 'kb' as Screen,
      title: 'View Knowledge Base',
      desc: 'Browse and manage available documents',
      foot: '124 documents · 8 categories',
    },
    {
      key: 'chat', icon: 'chat', go: 'chat' as Screen,
      title: 'Open Documentabot',
      desc: 'Ask questions and get cited answers',
      foot: 'Grounded in indexed documents',
      primary: true,
    },
  ];

  return (
    <div style={{
      height: '100%', overflowY: 'auto',
      background: 'radial-gradient(120% 80% at 50% -10%, var(--sand) 0%, var(--sand-2) 38%, var(--bg) 78%)',
    }}>
      <div style={{ maxWidth: 940, margin: '0 auto', padding: '76px 28px 56px', textAlign: 'center' }}>

        {/* <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 13px 6px 9px', borderRadius: 999,
          background: 'var(--white)', border: '1px solid var(--border)',
          boxShadow: 'var(--sh-xs)', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)',
          animation: 'fadeUp .5s both', whiteSpace: 'nowrap',
        }}>
          <span className="badge badge-green" style={{ height: 20, padding: '0 7px' }}>
            <span className="dot" /> Live
          </span>
          Internal knowledge assistant · secured to your workspace
        </div> */}

        <h1 style={{
          fontSize: 52, lineHeight: 1.04, letterSpacing: '-1.6px', fontWeight: 800,
          margin: '26px 0 0', color: 'var(--ink)', animation: 'fadeUp .5s .05s both',
        }}>
          Chat with Benefit<br />Documentation
        </h1>

        <p style={{
          fontSize: 18.5, lineHeight: 1.5, color: 'var(--ink-2)', fontWeight: 450,
          maxWidth: 560, margin: '20px auto 0',
          animation: 'fadeUp .5s .1s both',
        }}>
          Search policies, procedures, manuals, and internal documents
          through a personalized AI assistant, every answer traced back to its source.
        </p>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18,
          maxWidth: 700, margin: '44px auto 0', animation: 'fadeUp .5s .16s both',
        }}>
          {cards.map((c) => {
            const Icon = Icons[c.icon];
            return (
              <button key={c.key} onClick={() => navigate(c.go)}
                className="land-card"
                style={{
                  textAlign: 'left', background: 'var(--white)',
                  border: '1px solid ' + (c.primary ? 'var(--red-tint-2)' : 'var(--border)'),
                  borderRadius: 'var(--r-lg)', padding: '24px 22px 20px',
                  boxShadow: 'var(--sh-sm)', cursor: 'pointer', transition: '.18s',
                  position: 'relative', overflow: 'hidden',
                }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 14, marginBottom: 50,
                  display: 'grid', placeItems: 'center',
                  background: c.primary ? 'var(--red)' : 'var(--sand)',
                  color: c.primary ? '#fff' : 'var(--red)',
                  boxShadow: c.primary ? '0 4px 12px rgba(233,0,48,.32)' : 'none',
                }}>
                  <Icon size={24} sw={1.8} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 19, fontWeight: 700, letterSpacing: '-.3px' }}>{c.title}</h3>
                  <span className="land-arrow" style={{
                    width: 30, height: 30, borderRadius: 9, flex: '0 0 auto',
                    display: 'grid', placeItems: 'center',
                    background: c.primary ? 'var(--red-tint)' : 'var(--hover)',
                    color: c.primary ? 'var(--red)' : 'var(--ink-2)', transition: '.18s',
                  }}>
                    <Icons.arrowR size={17} sw={2} />
                  </span>
                </div>
                <p style={{ margin: '7px 0 16px', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.45 }}>{c.desc}</p>
                {/* <div style={{
                  paddingTop: 13, borderTop: '1px solid var(--border)',
                  fontSize: 12, fontWeight: 600, color: 'var(--ink-3)',
                  display: 'flex', alignItems: 'center', gap: 7,
                }}>
                  <Icons.shield size={14} /> {c.foot}
                </div> */}
              </button>
            );
          })}
        </div>

        {/* <div style={{
          display: 'flex', justifyContent: 'center', gap: 0, marginTop: 40,
          animation: 'fadeUp .5s .22s both',
        }}>
          {[
            { v: '124', l: 'documents indexed' },
            { v: '8', l: 'knowledge categories' },
            { v: 'Today', l: 'last sync' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              {i > 0 && <div style={{ width: 1, background: 'var(--border-2)', margin: '4px 28px' }} />}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.6px', color: 'var(--ink)' }}>{s.v}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600, marginTop: 2 }}>{s.l}</div>
              </div>
            </div>
          ))}
        </div> */}

        <div style={{
          marginTop: 46, fontSize: 12, color: 'var(--ink-4)', fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          animation: 'fadeIn .6s .3s both',
        }}>
          <Icons.shield size={14} /> Answers are restricted to documents indexed in your Benefit workspace.
        </div>
      </div>
    </div>
  );
}
