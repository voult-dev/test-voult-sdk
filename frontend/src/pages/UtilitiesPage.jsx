import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import ResponsePanel, { useApiAction } from '../components/ResponsePanel';

export default function UtilitiesPage() {
  const { authenticated } = useAuth();
  const { data, error, loading, run } = useApiAction();

  const loadAuditLogs = () => run(() => api('/audit-logs/me'));
  const loadProviders = () => run(() => api('/provider-visibility'));

  return (
    <div className="page">
      <header className="page-header">
        <h1>Utilities</h1>
        <p>Audit logs and provider visibility</p>
      </header>

      <section className="form-card">
        <h2>Audit logs</h2>
        <p className="endpoint-hint">GET /api/audit-logs/me</p>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={loadAuditLogs}
          disabled={!authenticated || loading}
        >
          Load my audit logs
        </button>
      </section>

      <section className="form-card">
        <h2>Provider visibility</h2>
        <p className="endpoint-hint">GET /api/provider-visibility/:clientId</p>
        <button type="button" className="btn btn-secondary" onClick={loadProviders} disabled={loading}>
          Check enabled OAuth providers
        </button>
      </section>

      <ResponsePanel data={data} error={error} />
    </div>
  );
}
