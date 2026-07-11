import { useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import ResponsePanel, { useApiAction } from '../components/ResponsePanel';

export default function MfaPage() {
  const { refreshSession, authenticated } = useAuth();
  const { data, error, loading, run } = useApiAction();
  const [verifyForm, setVerifyForm] = useState({ mfaPendingToken: '', mfaToken: '' });
  const [enableToken, setEnableToken] = useState('');
  const [disableForm, setDisableForm] = useState({ password: '', mfaToken: '' });
  const [regenToken, setRegenToken] = useState('');
  const [setupResult, setSetupResult] = useState(null);

  const verifyLogin = async (e) => {
    e.preventDefault();
    const result = await run(() =>
      api('/auth/mfa/verify', { method: 'POST', body: verifyForm }),
    );
    await refreshSession();
    return result;
  };

  const loadStatus = () => run(() => api('/auth/mfa/status'));

  const startSetup = async () => {
    const result = await run(() => api('/auth/mfa/setup', { method: 'POST' }));
    setSetupResult(result);
  };

  const enableMfa = async (e) => {
    e.preventDefault();
    await run(() => api('/auth/mfa/enable', { method: 'POST', body: { token: enableToken } }));
    await refreshSession();
  };

  const disableMfa = async (e) => {
    e.preventDefault();
    await run(() =>
      api('/auth/mfa/disable', { method: 'POST', body: disableForm }),
    );
    await refreshSession();
  };

  const regenerate = async (e) => {
    e.preventDefault();
    await run(() =>
      api('/auth/mfa/backup-codes/regenerate', {
        method: 'POST',
        body: { token: regenToken },
      }),
    );
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>MFA (TOTP)</h1>
        <p>All endpoints under <code>/api/auth/mfa/*</code></p>
      </header>

      <section className="form-card">
        <h2>Login step-up</h2>
        <p className="endpoint-hint">POST /api/auth/mfa/verify</p>
        <form onSubmit={verifyLogin}>
          <label>
            MFA pending token
            <input
              value={verifyForm.mfaPendingToken}
              onChange={(e) =>
                setVerifyForm((f) => ({ ...f, mfaPendingToken: e.target.value }))
              }
              placeholder="From email-login response"
            />
          </label>
          <label>
            TOTP or backup code
            <input
              value={verifyForm.mfaToken}
              onChange={(e) => setVerifyForm((f) => ({ ...f, mfaToken: e.target.value }))}
              required
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            Verify MFA
          </button>
        </form>
      </section>

      <section className="form-card">
        <h2>Status</h2>
        <p className="endpoint-hint">GET /api/auth/mfa/status</p>
        <button type="button" className="btn btn-secondary" onClick={loadStatus} disabled={!authenticated || loading}>
          Get MFA status
        </button>
      </section>

      <section className="form-card">
        <h2>Enable MFA</h2>
        <p className="endpoint-hint">POST /api/auth/mfa/setup → POST /api/auth/mfa/enable</p>
        <button type="button" className="btn btn-secondary" onClick={startSetup} disabled={!authenticated || loading}>
          Start setup
        </button>
        {setupResult?.qrCode && (
          <div className="qr-block">
            <img src={setupResult.qrCode} alt="MFA QR code" width={200} height={200} />
            <p>
              <strong>Secret:</strong> <code>{setupResult.secret}</code>
            </p>
            {setupResult.backupCodes?.length > 0 && (
              <div>
                <strong>Backup codes (save now):</strong>
                <ul>
                  {setupResult.backupCodes.map((code) => (
                    <li key={code}>
                      <code>{code}</code>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        <form onSubmit={enableMfa}>
          <label>
            6-digit TOTP to confirm
            <input value={enableToken} onChange={(e) => setEnableToken(e.target.value)} required />
          </label>
          <button type="submit" className="btn btn-primary" disabled={!authenticated || loading}>
            Enable MFA
          </button>
        </form>
      </section>

      <section className="form-card">
        <h2>Disable MFA</h2>
        <p className="endpoint-hint">POST /api/auth/mfa/disable</p>
        <form onSubmit={disableMfa}>
          <label>
            Password
            <input
              type="password"
              value={disableForm.password}
              onChange={(e) => setDisableForm((f) => ({ ...f, password: e.target.value }))}
              required
            />
          </label>
          <label>
            TOTP / backup code
            <input
              value={disableForm.mfaToken}
              onChange={(e) => setDisableForm((f) => ({ ...f, mfaToken: e.target.value }))}
              required
            />
          </label>
          <button type="submit" className="btn btn-secondary" disabled={!authenticated || loading}>
            Disable MFA
          </button>
        </form>
      </section>

      <section className="form-card">
        <h2>Regenerate backup codes</h2>
        <p className="endpoint-hint">POST /api/auth/mfa/backup-codes/regenerate</p>
        <form onSubmit={regenerate}>
          <label>
            Current TOTP
            <input value={regenToken} onChange={(e) => setRegenToken(e.target.value)} required />
          </label>
          <button type="submit" className="btn btn-secondary" disabled={!authenticated || loading}>
            Regenerate
          </button>
        </form>
      </section>

      <ResponsePanel data={data} error={error} />
    </div>
  );
}
