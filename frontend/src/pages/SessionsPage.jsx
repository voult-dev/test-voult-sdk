import { useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import ResponsePanel, { useApiAction } from '../components/ResponsePanel';

export default function SessionsPage() {
  const { authenticated } = useAuth();
  const { data, error, loading, run } = useApiAction();
  const [sessions, setSessions] = useState([]);
  const [revokeId, setRevokeId] = useState('');

  const loadSessions = async () => {
    const result = await run(() => api('/sessions'));
    setSessions(result.sessions || []);
  };

  const refreshTokens = () => run(() => api('/sessions/refresh', { method: 'POST' }));

  const revokeSession = async (id) => {
    await run(() => api(`/sessions/revoke/${encodeURIComponent(id)}`));
    await loadSessions();
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Sessions</h1>
        <p>GET /api/sessions · GET /api/sessions/revoke/:id · POST /api/sessions/refresh</p>
      </header>

      <section className="form-card">
        <div className="inline-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={loadSessions}
            disabled={!authenticated || loading}
          >
            List sessions
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={refreshTokens}
            disabled={!authenticated || loading}
          >
            Refresh tokens
          </button>
        </div>

        {sessions.length > 0 && (
          <ul className="list">
            {sessions.map((session) => (
              <li key={session.id}>
                <div>
                  <strong>{session.id}</strong>
                  <p className="hint">
                    {session.ipAddress} · {session.userAgent?.slice(0, 60)}
                  </p>
                  <p className="hint">
                    Created {session.createdAt} · Last used {session.lastUsedAt}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => revokeSession(session.id)}
                >
                  Revoke
                </button>
              </li>
            ))}
          </ul>
        )}

        <label>
          Revoke by session ID
          <input value={revokeId} onChange={(e) => setRevokeId(e.target.value)} />
        </label>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => revokeSession(revokeId)}
          disabled={!revokeId || !authenticated || loading}
        >
          Revoke session
        </button>
      </section>

      <ResponsePanel data={data} error={error} />
    </div>
  );
}
