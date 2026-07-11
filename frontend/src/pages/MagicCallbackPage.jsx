import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function MagicCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      navigate(`/magic-link?token=${encodeURIComponent(token)}`, { replace: true });
    } else {
      navigate('/magic-link', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="page">
      <p>Redirecting to magic link validation…</p>
    </div>
  );
}
