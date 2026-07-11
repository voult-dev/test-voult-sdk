import { useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { createPasskey, getPasskey, isWebAuthnSupported } from '../lib/webauthn';
import ResponsePanel, { useApiAction } from '../components/ResponsePanel';

export default function PasskeysPage() {
  const { refreshSession, authenticated } = useAuth();
  const { data, error, loading, run } = useApiAction();
  const [deviceName, setDeviceName] = useState('My passkey');
  const [loginEmail, setLoginEmail] = useState('');
  const [credentials, setCredentials] = useState([]);
  const [renameId, setRenameId] = useState('');
  const [renameValue, setRenameValue] = useState('');

  const checkCompatibility = () => run(() => api('/auth/webauthn/compatibility'));

  const registerPasskey = async () => {
    const optionsRes = await run(() =>
      api('/auth/webauthn/register/options', {
        method: 'POST',
        body: { deviceName },
      }),
    );

    if (!isWebAuthnSupported()) {
      throw new Error('WebAuthn is not supported in this browser');
    }

    const credential = await createPasskey(optionsRes.options);
    await run(() =>
      api('/auth/webauthn/register/verify', {
        method: 'POST',
        body: { credential, deviceName },
      }),
    );
    await loadCredentials();
  };

  const loginWithPasskey = async () => {
    const optionsRes = await run(() =>
      api('/auth/webauthn/login/options', {
        method: 'POST',
        body: loginEmail ? { email: loginEmail } : {},
      }),
    );

    const credential = await getPasskey(optionsRes.options);
    const result = await run(() =>
      api('/auth/webauthn/login/verify', {
        method: 'POST',
        body: { credential },
      }),
    );
    await refreshSession();
    return result;
  };

  const loadCredentials = async () => {
    const result = await run(() => api('/auth/webauthn/credentials'));
    setCredentials(result.credentials || []);
  };

  const renamePasskey = async (e) => {
    e.preventDefault();
    await run(() =>
      api(`/auth/webauthn/credentials/${encodeURIComponent(renameId)}`, {
        method: 'PATCH',
        body: { deviceName: renameValue },
      }),
    );
    await loadCredentials();
  };

  const deletePasskey = async (id) => {
    await run(() =>
      api(`/auth/webauthn/credentials/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    );
    await loadCredentials();
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Passkeys (WebAuthn)</h1>
        <p>All endpoints under <code>/api/auth/webauthn/*</code></p>
      </header>

      <section className="form-card">
        <h2>Compatibility</h2>
        <p className="endpoint-hint">GET /api/auth/webauthn/compatibility</p>
        <button type="button" className="btn btn-secondary" onClick={checkCompatibility} disabled={loading}>
          Check compatibility
        </button>
        <p className="hint">Browser WebAuthn: {isWebAuthnSupported() ? 'supported' : 'not supported'}</p>
      </section>

      <section className="form-card">
        <h2>Register passkey</h2>
        <p className="endpoint-hint">POST register/options → browser ceremony → POST register/verify</p>
        <label>
          Device name
          <input value={deviceName} onChange={(e) => setDeviceName(e.target.value)} />
        </label>
        <button
          type="button"
          className="btn btn-primary"
          onClick={registerPasskey}
          disabled={!authenticated || loading}
        >
          Register passkey
        </button>
      </section>

      <section className="form-card">
        <h2>Sign in with passkey</h2>
        <p className="endpoint-hint">POST login/options → browser ceremony → POST login/verify</p>
        <label>
          Email hint (optional)
          <input
            type="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            placeholder="user@example.com"
          />
        </label>
        <button type="button" className="btn btn-primary" onClick={loginWithPasskey} disabled={loading}>
          Sign in with passkey
        </button>
      </section>

      <section className="form-card">
        <h2>Manage passkeys</h2>
        <p className="endpoint-hint">GET /api/auth/webauthn/credentials · PATCH/DELETE /credentials/:id</p>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={loadCredentials}
          disabled={!authenticated || loading}
        >
          List passkeys
        </button>
        {credentials.length > 0 && (
          <ul className="list">
            {credentials.map((cred) => (
              <li key={cred.id}>
                <strong>{cred.deviceName || cred.id}</strong>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => deletePasskey(cred.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={renamePasskey}>
          <label>
            Credential ID
            <input value={renameId} onChange={(e) => setRenameId(e.target.value)} required />
          </label>
          <label>
            New device name
            <input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} required />
          </label>
          <button type="submit" className="btn btn-secondary" disabled={!authenticated || loading}>
            Rename passkey
          </button>
        </form>
      </section>

      <ResponsePanel data={data} error={error} />
    </div>
  );
}
