import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import ResponsePanel, { useApiAction } from '../components/ResponsePanel';

export default function MagicLinkPage() {
  const [searchParams] = useSearchParams();
  const { refreshSession } = useAuth();
  const { data, error, loading, run } = useApiAction();
  const [email, setEmail] = useState('');
  const [redirectUri, setRedirectUri] = useState(
    `${window.location.origin}/magic-callback`,
  );
  const [token, setToken] = useState('');

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    }
  }, [searchParams]);

  const sendLink = async (e) => {
    e.preventDefault();
    await run(() =>
      api('/send-magic-link', {
        method: 'POST',
        body: { email, redirectUri },
      }),
    );
  };

  const validateLink = async (e) => {
    e.preventDefault();
    const result = await run(() =>
      api('/validate-magic-link', {
        method: 'POST',
        body: { token },
      }),
    );
    await refreshSession();
    if (searchParams.get('token')) {
      window.history.replaceState({}, '', '/magic-link');
    }
    return result;
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Magic link</h1>
        <p>POST /api/send-magic-link · POST /api/validate-magic-link</p>
      </header>

      <section className="form-card">
        <h2>Send magic link</h2>
        <form onSubmit={sendLink}>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Redirect URI (must be allowlisted in your Voult app)
            <input value={redirectUri} onChange={(e) => setRedirectUri(e.target.value)} required />
          </label>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            Send link
          </button>
        </form>
      </section>

      <section className="form-card">
        <h2>Validate magic link</h2>
        <p className="hint">
          After clicking the email link you land on <code>/magic-callback?token=…</code>.
          The token is pre-filled here.
        </p>
        <form onSubmit={validateLink}>
          <label>
            Token
            <input value={token} onChange={(e) => setToken(e.target.value)} required />
          </label>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            Validate & sign in
          </button>
        </form>
      </section>

      <ResponsePanel data={data} error={error} />
    </div>
  );
}
