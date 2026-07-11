import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/signup', label: 'Sign up' },
  { to: '/signin', label: 'Sign in' },
  { to: '/mfa', label: 'MFA' },
  { to: '/passkeys', label: 'Passkeys' },
  { to: '/magic-link', label: 'Magic link' },
  { to: '/oauth', label: 'OAuth' },
  { to: '/account', label: 'Account' },
  { to: '/sessions', label: 'Sessions' },
  { to: '/utilities', label: 'Utilities' },
];

export default function Layout() {
  const navigate = useNavigate();
  const { authenticated, user, mfaPending, loading, refreshSession } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const logout = async () => {
    setLoggingOut(true);
    try {
      await api('/auth/logout', { method: 'POST' });
      await refreshSession();
      navigate('/');
    } catch {
      await refreshSession();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">V</span>
          <div>
            <strong>voult.dev</strong>
            <p>Auth playground</p>
          </div>
        </div>

        <nav className="nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="session-card">
          <p className="session-label">Session</p>
          {loading ? (
            <p className="session-muted">Checking…</p>
          ) : authenticated ? (
            <>
              <p className="session-user">{user?.email || user?.username || user?.id}</p>
              <span className="badge badge-ok">Authenticated</span>
              <button
                type="button"
                className="btn btn-logout"
                onClick={logout}
                disabled={loggingOut}
              >
                {loggingOut ? 'Signing out…' : 'Sign out'}
              </button>
            </>
          ) : mfaPending ? (
            <span className="badge badge-warn">MFA required</span>
          ) : (
            <span className="badge badge-muted">Signed out</span>
          )}
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
