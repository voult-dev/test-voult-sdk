import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import PasswordField from '../components/PasswordField';
import ResponsePanel, { useApiAction } from '../components/ResponsePanel';

export default function SigninPage() {
  const navigate = useNavigate();
  const { refreshSession, setMfaPending } = useAuth();
  const { data, error, loading, run } = useApiAction();
  const [mode, setMode] = useState('email');
  const [form, setForm] = useState({ email: '', username: '', password: '' });

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const path = mode === 'email' ? '/auth/email-login' : '/auth/username-login';
    const body =
      mode === 'email'
        ? { email: form.email, password: form.password }
        : { username: form.username, password: form.password };

    const result = await run(() => api(path, { method: 'POST', body }));
    await refreshSession();

    if (result?.mfaRequired || result?.step === 'mfa') {
      setMfaPending(true);
      navigate('/mfa');
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Sign in</h1>
        <p>
          {mode === 'email' ? 'POST /api/auth/email-login' : 'POST /api/auth/username-login'}
        </p>
      </header>

      <div className="tab-row">
        <button
          type="button"
          className={mode === 'email' ? 'tab active' : 'tab'}
          onClick={() => setMode('email')}
        >
          Email
        </button>
        <button
          type="button"
          className={mode === 'username' ? 'tab active' : 'tab'}
          onClick={() => setMode('username')}
        >
          Username
        </button>
      </div>

      <form className="form-card" onSubmit={submit}>
        {mode === 'email' ? (
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={onChange} required />
          </label>
        ) : (
          <label>
            Username
            <input name="username" value={form.username} onChange={onChange} required />
          </label>
        )}
        <PasswordField
          value={form.password}
          onChange={onChange}
          showHint={false}
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <ResponsePanel data={data} error={error} />
    </div>
  );
}
