import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import ResponsePanel, { useApiAction } from '../components/ResponsePanel';

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || 'http://localhost:2000';

export default function OAuthPage() {
  const [searchParams] = useSearchParams();
  const { refreshSession } = useAuth();
  const { data, error, loading, run, reset } = useApiAction();
  const [config, setConfig] = useState({ google: { configured: false }, github: { configured: false } });
  const [intent, setIntent] = useState('login');
  const [provider, setProvider] = useState('google');
  const [manualForm, setManualForm] = useState({});

  useEffect(() => {
    api('/oauth/config')
      .then(setConfig)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError) {
      reset();
    }
  }, [searchParams, reset]);

  const oauthError = searchParams.get('error');

  const startOAuth = (selectedProvider) => {
    window.location.href = `${API_ORIGIN}/oauth/${selectedProvider}/start?intent=${intent}`;
  };

  const submitManual = async (e) => {
    e.preventDefault();
    const body = { ...manualForm };
    const result = await run(() =>
      api(`/auth/${provider}/${intent}`, { method: 'POST', body }),
    );
    await refreshSession();
    return result;
  };

  const linkProvider = () => run(() => api(`/oauth/${provider}/link`, { method: 'POST' }));
  const loadLinked = () => run(() => api('/me/oauth-accounts'));
  const unlinkProvider = () =>
    run(() => api(`/me/oauth-accounts/${provider}`, { method: 'DELETE' }));

  const manualFields = {
    google: ['idToken', 'accessToken'],
    github: ['code', 'redirectUri'],
    facebook: ['accessToken'],
    linkedin: ['code'],
    microsoft: ['code'],
    apple: ['idToken', 'code', 'fullName', 'email'],
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>OAuth</h1>
        <p>One-click Google/GitHub sign-in, then Voult token exchange.</p>
      </header>

      {oauthError && (
        <section className="form-card danger-zone">
          <p className="field-error">OAuth error: {oauthError}</p>
        </section>
      )}

      <section className="form-card">
        <h2>Sign in with provider</h2>
        <p className="endpoint-hint">
          Redirect flow → callback → POST /api/auth/{'{provider}'}/login|register
        </p>

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

        <div className="oauth-buttons">
          <button
            type="button"
            className="btn btn-oauth btn-google"
            onClick={() => startOAuth('google')}
            disabled={!config.google.configured}
          >
            Continue with Google
          </button>
          <button
            type="button"
            className="btn btn-oauth btn-github"
            onClick={() => startOAuth('github')}
            disabled={!config.github.configured}
          >
            Continue with GitHub
          </button>
        </div>

        {!config.google.configured && (
          <p className="hint">Google: set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env</p>
        )}
        {!config.github.configured && (
          <p className="hint">GitHub: set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in backend/.env</p>
        )}
        <p className="hint">
          Register this callback in Google/GitHub:{' '}
          <code>http://localhost:2000/oauth/callback/google</code> or{' '}
          <code>/oauth/callback/github</code>
        </p>
      </section>

      <section className="form-card">
        <h2>Advanced: manual token exchange</h2>
        <p className="hint">For testing Model A directly with tokens or codes you already have.</p>

        <div className="tab-row">
          {['google', 'github', 'facebook', 'linkedin', 'microsoft', 'apple'].map((p) => (
            <button
              key={p}
              type="button"
              className={provider === p ? 'tab active' : 'tab'}
              onClick={() => {
                setProvider(p);
                setManualForm({});
              }}
            >
              {p}
            </button>
          ))}
        </div>

        <form onSubmit={submitManual}>
          {manualFields[provider].map((field) => (
            <label key={field}>
              {field}
              <input
                value={manualForm[field] || ''}
                onChange={(e) => setManualForm((f) => ({ ...f, [field]: e.target.value }))}
              />
            </label>
          ))}
          <button type="submit" className="btn btn-secondary" disabled={loading}>
            Manual {intent}
          </button>
        </form>
      </section>

      <section className="form-card">
        <h2>Account linking (authenticated)</h2>
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
