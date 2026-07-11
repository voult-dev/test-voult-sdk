import { useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import ResponsePanel, { useApiAction } from '../components/ResponsePanel';

export default function AccountPage() {
  const { refreshSession, authenticated } = useAuth();
  const { data, error, loading, run } = useApiAction();
  const [fullName, setFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [verifyToken, setVerifyToken] = useState('');
  const [verifyAppId, setVerifyAppId] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetForm, setResetForm] = useState({ token: '', password: '', appId: '' });

  const loadProfile = () => run(() => api('/user/me'));

  const updateProfile = async (e) => {
    e.preventDefault();
    await run(() => api('/user/me', { method: 'PATCH', body: { fullName } }));
    await refreshSession();
  };

  const submitSetPassword = async (e) => {
    e.preventDefault();
    await run(() => api('/me/set-password', { method: 'POST', body: { password: newPassword } }));
  };

  const verifyEmail = async (e) => {
    e.preventDefault();
    const params = new URLSearchParams({ token: verifyToken, appId: verifyAppId });
    await run(() => api(`/user/verify-email?${params.toString()}`));
  };

  const forgotPassword = async (e) => {
    e.preventDefault();
    await run(() => api('/user/forgot-password', { method: 'POST', body: { email: forgotEmail } }));
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    await run(() =>
      api('/user/reset-password', {
        method: 'POST',
        body: resetForm,
      }),
    );
  };

  const disableAccount = async () => {
    await run(() => api('/user/disable', { method: 'POST' }));
    await refreshSession();
  };

  const reenableAccount = async () => {
    await run(() => api('/user/reenable', { method: 'POST' }));
    await refreshSession();
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Account</h1>
        <p>GET|PATCH /api/user/me · password reset · disable/reenable</p>
      </header>

      <section className="form-card">
        <h2>Profile</h2>
        <button type="button" className="btn btn-secondary" onClick={loadProfile} disabled={!authenticated || loading}>
          GET /api/user/me
        </button>
        <form onSubmit={updateProfile}>
          <label>
            Full name
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </label>
          <button type="submit" className="btn btn-primary" disabled={!authenticated || loading}>
            PATCH /api/user/me
          </button>
        </form>
      </section>

      <section className="form-card">
        <h2>Set password (social-only accounts)</h2>
        <p className="endpoint-hint">POST /api/me/set-password</p>
        <form onSubmit={submitSetPassword}>
          <label>
            New password
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="btn btn-secondary" disabled={!authenticated || loading}>
            Set password
          </button>
        </form>
      </section>

      <section className="form-card">
        <h2>Email verification</h2>
        <p className="endpoint-hint">GET /api/user/verify-email?token=&appId=</p>
        <form onSubmit={verifyEmail}>
          <label>
            Token
            <input value={verifyToken} onChange={(e) => setVerifyToken(e.target.value)} required />
          </label>
          <label>
            App ID
            <input value={verifyAppId} onChange={(e) => setVerifyAppId(e.target.value)} required />
          </label>
          <button type="submit" className="btn btn-secondary" disabled={loading}>
            Verify email
          </button>
        </form>
      </section>

      <section className="form-card">
        <h2>Password reset</h2>
        <form onSubmit={forgotPassword}>
          <label>
            Email
            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="btn btn-secondary" disabled={loading}>
            POST /api/user/forgot-password
          </button>
        </form>
        <form onSubmit={resetPassword}>
          <label>
            Reset token
            <input
              value={resetForm.token}
              onChange={(e) => setResetForm((f) => ({ ...f, token: e.target.value }))}
              required
            />
          </label>
          <label>
            App ID
            <input
              value={resetForm.appId}
              onChange={(e) => setResetForm((f) => ({ ...f, appId: e.target.value }))}
              required
            />
          </label>
          <label>
            New password
            <input
              type="password"
              value={resetForm.password}
              onChange={(e) => setResetForm((f) => ({ ...f, password: e.target.value }))}
              required
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            POST /api/user/reset-password
          </button>
        </form>
      </section>

      <section className="form-card danger-zone">
        <h2>Account lifecycle</h2>
        <p className="endpoint-hint">POST /api/user/disable · POST /api/user/reenable</p>
        <div className="inline-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={disableAccount}
            disabled={!authenticated || loading}
          >
            Disable account
          </button>
          <button type="button" className="btn btn-secondary" onClick={reenableAccount} disabled={loading}>
            Re-enable account
          </button>
        </div>
      </section>

      <ResponsePanel data={data} error={error} />
    </div>
  );
}
