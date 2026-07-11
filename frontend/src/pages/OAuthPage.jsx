import { useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import ResponsePanel, { useApiAction } from '../components/ResponsePanel';

const PROVIDERS = ['google', 'github', 'facebook', 'linkedin', 'microsoft', 'apple'];

const PROVIDER_FIELDS = {
  google: ['idToken', 'accessToken'],
  github: ['code', 'redirectUri'],
  facebook: ['accessToken'],
  linkedin: ['code'],
  microsoft: ['code'],
  apple: ['idToken', 'code', 'fullName', 'email'],
};

export default function OAuthPage() {
  const { refreshSession } = useAuth();
  const { data, error, loading, run } = useApiAction();
  const [provider, setProvider] = useState('google');
  const [intent, setIntent] = useState('login');
  const [form, setForm] = useState({});

  const onChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const submit = async (e) => {
    e.preventDefault();
    const body = {};
    for (const field of PROVIDER_FIELDS[provider]) {
      if (form[field]) body[field] = form[field];
    }

    const result = await run(() =>
      api(`/auth/${provider}/${intent}`, { method: 'POST', body }),
    );
    await refreshSession();
    return result;
  };

  const linkProvider = () =>
    run(() => api(`/oauth/${provider}/link`, { method: 'POST' }));

  const loadLinked = () => run(() => api('/me/oauth-accounts'));

  const unlinkProvider = () =>
    run(() => api(`/me/oauth-accounts/${provider}`, { method: 'DELETE' }));

  return (
    <div className="page">
      <header className="page-header">
        <h1>OAuth</h1>
        <p>POST /api/auth/{'{provider}'}/login|register · linking via /api/oauth/:provider/link</p>
      </header>

      <section className="form-card">
        <h2>Provider token exchange (Model A)</h2>
        <div className="tab-row">
          {PROVIDERS.map((p) => (
            <button
              key={p}
              type="button"
              className={provider === p ? 'tab active' : 'tab'}
              onClick={() => {
                setProvider(p);
                setForm({});
              }}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="tab-row">
          <button
            type="button"
            className={intent === 'login' ? 'tab active' : 'tab'}
            onClick={() => setIntent('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={intent === 'register' ? 'tab active' : 'tab'}
            onClick={() => setIntent('register')}
          >
            Register
          </button>
        </div>

        <form onSubmit={submit}>
          {PROVIDER_FIELDS[provider].map((field) => (
            <label key={field}>
              {field}
              <input
                value={form[field] || ''}
                onChange={(e) => onChange(field, e.target.value)}
                placeholder={field === 'redirectUri' ? 'https://yourapp.com/callback' : ''}
              />
            </label>
          ))}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {intent === 'login' ? 'OAuth login' : 'OAuth register'}
          </button>
        </form>
      </section>

      <section className="form-card">
        <h2>Account linking (authenticated)</h2>
        <p className="endpoint-hint">
          POST /api/oauth/:provider/link · GET /api/me/oauth-accounts · DELETE
          /api/me/oauth-accounts/:provider
        </p>
        <div className="inline-actions">
          <button type="button" className="btn btn-secondary" onClick={linkProvider} disabled={loading}>
            Link {provider}
          </button>
          <button type="button" className="btn btn-secondary" onClick={loadLinked} disabled={loading}>
            List linked accounts
          </button>
          <button type="button" className="btn btn-ghost" onClick={unlinkProvider} disabled={loading}>
            Unlink {provider}
          </button>
        </div>
      </section>

      <ResponsePanel data={data} error={error} />
    </div>
  );
}
