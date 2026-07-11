import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { getPasswordValidationError } from '../lib/password';
import { useAuth } from '../context/AuthContext';
import PasswordField from '../components/PasswordField';
import ResponsePanel, { useApiAction } from '../components/ResponsePanel';

export default function SignupPage() {
  const navigate = useNavigate();
  const { refreshSession } = useAuth();
  const { data, error, loading, run } = useApiAction();
  const [mode, setMode] = useState('email');
  const [passwordError, setPasswordError] = useState('');
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    fullName: '',
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (name === 'password') {
      setPasswordError(getPasswordValidationError(value) || '');
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    const validationMessage = getPasswordValidationError(form.password);
    if (validationMessage) {
      setPasswordError(validationMessage);
      return;
    }

    const path = mode === 'email' ? '/auth/register' : '/auth/username-register';
    const body =
      mode === 'email'
        ? {
            email: form.email,
            password: form.password,
            fullName: form.fullName || undefined,
          }
        : {
            username: form.username,
            password: form.password,
            fullName: form.fullName || undefined,
            email: form.email || undefined,
          };

    const result = await run(() => api(path, { method: 'POST', body }));
    await refreshSession();
    if (result?.mfaRequired) {
      navigate('/mfa');
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Sign up</h1>
        <p>
          {mode === 'email' ? 'POST /api/auth/register' : 'POST /api/auth/username-register'}
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
        {mode === 'username' && (
          <label>
            Username
            <input name="username" value={form.username} onChange={onChange} required />
          </label>
        )}
        <label>
          {mode === 'email' ? 'Email' : 'Email (optional)'}
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            required={mode === 'email'}
          />
        </label>
        <label>
          Full name
          <input name="fullName" value={form.fullName} onChange={onChange} />
        </label>
        <PasswordField
          value={form.password}
          onChange={onChange}
          showValidation={Boolean(passwordError)}
        />
        {passwordError && <p className="field-error">{passwordError}</p>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Registering…' : 'Register'}
        </button>
      </form>

      <ResponsePanel data={data} error={error} />
    </div>
  );
}
