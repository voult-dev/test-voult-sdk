import { Link } from 'react-router-dom';
import { endpoints } from '../lib/api';

const flows = [
  {
    title: 'Password auth',
    description: 'Register and sign in with email or username.',
    links: [
      { to: '/signup', label: 'Sign up' },
      { to: '/signin', label: 'Sign in' },
    ],
    endpoint: 'POST /api/auth/register, /email-login, /logout',
  },
  {
    title: 'MFA (TOTP)',
    description: 'Enable MFA, complete login step-up, manage backup codes.',
    links: [{ to: '/mfa', label: 'MFA flows' }],
    endpoint: '/api/auth/mfa/*',
  },
  {
    title: 'Passkeys (WebAuthn)',
    description: 'Register and sign in with passkeys.',
    links: [{ to: '/passkeys', label: 'Passkeys' }],
    endpoint: '/api/auth/webauthn/*',
  },
  {
    title: 'Magic link',
    description: 'Passwordless email authentication.',
    links: [{ to: '/magic-link', label: 'Magic link' }],
    endpoint: 'POST /api/send-magic-link, /validate-magic-link',
  },
  {
    title: 'OAuth',
    description: 'Social sign-in with Google, GitHub, and more.',
    links: [{ to: '/oauth', label: 'OAuth' }],
    endpoint: 'POST /api/auth/{provider}/login|register',
  },
  {
    title: 'Account & sessions',
    description: 'Profile, sessions, audit logs, password reset.',
    links: [
      { to: '/account', label: 'Account' },
      { to: '/sessions', label: 'Sessions' },
      { to: '/utilities', label: 'Utilities' },
    ],
    endpoint: '/api/user/me, /api/sessions, /api/audit-logs/me',
  },
];

export default function HomePage() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>Voult Auth Playground</h1>
        <p>
          Interactive test app for every authentication endpoint documented in{' '}
          <code>docs/integration/VOULT_AUTH.md</code>. Your browser talks to this
          playground BFF; the BFF holds <code>X-Client-Secret</code> and proxies to
          Voult.
        </p>
      </header>

      <div className="card-grid">
        {flows.map((flow) => (
          <article key={flow.title} className="card">
            <h2>{flow.title}</h2>
            <p>{flow.description}</p>
            <p className="endpoint-hint">{flow.endpoint}</p>
            <div className="card-actions">
              {flow.links.map((link) => (
                <Link key={link.to} to={link.to} className="btn btn-secondary">
                  {link.label}
                </Link>
              ))}
            </div>
          </article>
        ))}
      </div>

      <section className="card">
        <h2>Quick reference</h2>
        <p className="endpoint-hint">Session check: {endpoints.session}</p>
        <p>
          Start with register → verify email → email-login → GET /api/user/me →
          refresh → logout.
        </p>
      </section>
    </div>
  );
}
