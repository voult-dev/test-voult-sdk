import { useState } from 'react';

export default function ResponsePanel({ data, error }) {
  const [open, setOpen] = useState(true);

  if (!data && !error) return null;

  return (
    <section className="response-panel">
      <button type="button" className="response-toggle" onClick={() => setOpen((v) => !v)}>
        {open ? 'Hide' : 'Show'} API response
      </button>
      {open && (
        <pre className={error ? 'response-error' : 'response-ok'}>
          {error
            ? JSON.stringify(
                {
                  message: error.message,
                  code: error.code,
                  status: error.status,
                  data: error.data,
                },
                null,
                2,
              )
            : JSON.stringify(data, null, 2)}
        </pre>
      )}
    </section>
  );
}

export function useApiAction() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async (fn) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
  };

  return { data, error, loading, run, reset };
}
