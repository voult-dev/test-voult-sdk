import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { navItems, isNavItemEnabled } from '../lib/navAccess';
import RouteAccess from './RouteAccess';

export default function Layout() {
  const navigate = useNavigate();
  const authState = useAuth();
  const { authenticated, user, mfaPending, loading, refreshSession } = authState;
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
          <img className="brand-mark" src="/images/favicon.png" alt="voult.dev" />
          <div>
            <strong>voult.dev</strong>
            <p>Auth playground</p>
          </div>
        </div>

        <nav className="nav">
          {navItems.map((item) => {
            const enabled = isNavItemEnabled(item, authState);

            if (!enabled) {
              return (
                <span
                  key={item.to}
                  className="nav-link disabled"
                  aria-disabled="true"
                  title={
                    item.access === 'guest'
                      ? 'Sign out to use this flow'
                      : 'Sign in to use this feature'
                  }
                >
                  {item.label}
                </span>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="session-card">
          <p className="session-label">Session</p>
          {loading ? (
            <p className="session-muted">Checking…</p>
          ) : authenticated ? (
            <>
              <p className="session-user">{user?.email || user?.username || user?.name}</p>
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
        <RouteAccess>
          <Outlet />
        </RouteAccess>
      </main>
    </div>
  );
}
