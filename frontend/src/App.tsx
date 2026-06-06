import { BrowserRouter, Routes, Route, Navigate, NavLink, Link, Outlet } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Icons } from './components/Icons';
import { Landing } from './components/Landing';
import { KnowledgeBase } from './components/KnowledgeBase';
import { Chatbot } from './components/Chatbot';
import { Login } from './components/Login';
import { Signup } from './components/Signup';

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function Spinner() {
  return (
    <div className="auth-shell">
      <span className="spin" style={{ color: 'var(--ink-3)' }}>
        <Icons.settings size={22} />
      </span>
    </div>
  );
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function ProtectedLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app">
      <nav className="topnav">
        <Link to="/" className="brand" style={{ textDecoration: 'none' }}>
          <div className="brand-mark"><Icons.bolt size={17} fill="#fff" stroke="#fff" /></div>
          <div className="brand-name">Benefit <b>Documentabot</b></div>
        </Link>

        <div className="nav-links">
          <NavLink to="/kb" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            <Icons.folder size={16} /> Knowledge Base
          </NavLink>
          <NavLink to="/chat" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            <Icons.chat size={16} /> Chatbot
          </NavLink>
          <button className="nav-link"><Icons.settings size={16} /> Settings</button>
          <div className="nav-divider" />
          <div className="nav-user">
            <div className="avatar" title={user.name}>{initials(user.name)}</div>
            <button className="nav-link nav-logout" onClick={handleLogout} title="Sign out">
              <Icons.send size={15} />
            </button>
          </div>
        </div>
      </nav>

      <div className="screen">
        <Outlet />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login"  element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route element={<ProtectedLayout />}>
            <Route path="/"     element={<Landing />} />
            <Route path="/kb"   element={<KnowledgeBase />} />
            <Route path="/chat" element={<Chatbot />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
