import { useState } from 'react';
import { Icons } from './components/Icons';
import { Landing } from './components/Landing';
import { KnowledgeBase } from './components/KnowledgeBase';
import { Chatbot } from './components/Chatbot';
import { DOCUMENTS } from './data';
import type { Doc } from './types';

type Screen = 'home' | 'kb' | 'chat';

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [docs, setDocs] = useState<Doc[]>(DOCUMENTS);

  function addDoc(d: Doc) {
    setDocs(prev => [d, ...prev]);
    setTimeout(() => {
      setDocs(prev => prev.map(x => x.id === d.id ? { ...x, status: 'indexed', chunks: 47, isNew: false } : x));
    }, 6000);
  }

  const navItems: { id: Screen; label: string; icon: string }[] = [
    { id: 'kb',   label: 'Knowledge Base', icon: 'folder' },
    { id: 'chat', label: 'Chatbot',         icon: 'chat' },
  ];

  return (
    <div className="app">
      <nav className="topnav">
        <div className="brand" onClick={() => setScreen('home')}>
          <div className="brand-mark"><Icons.bolt size={17} fill="#fff" stroke="#fff" /></div>
          <div className="brand-name">Benefit <b>Documentabot</b></div>
        </div>
        <div className="nav-links">
          {navItems.map(n => {
            const Icon = Icons[n.icon];
            return (
              <button key={n.id} className={'nav-link' + (screen === n.id ? ' active' : '')} onClick={() => setScreen(n.id)}>
                <Icon size={16} /> {n.label}
              </button>
            );
          })}
          <button className="nav-link"><Icons.settings size={16} /> Settings</button>
          <div className="nav-divider" />
          <div className="avatar" title="Your profile">AV</div>
        </div>
      </nav>

      <div className="screen">
        {screen === 'home' && <Landing navigate={setScreen} />}
        {screen === 'kb'   && <KnowledgeBase docs={docs} addDoc={addDoc} navigate={setScreen} />}
        {screen === 'chat' && <Chatbot />}
      </div>
    </div>
  );
}

export default App;
