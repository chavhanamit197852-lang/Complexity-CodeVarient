'use client';
import { useCallback, useState } from 'react';

export function useDropAction() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const run = useCallback(async (handler) => {
    setError(null); setSuccess(false); setPending(true);
    try {
      const result = await handler();
      setSuccess(true);
      return { ok: true, result };
    } catch (e) {
      setError(e?.message ?? 'Action failed');
      return { ok: false, error: e?.message };
    } finally {
      setPending(false);
    }
  }, []);

  const reset = useCallback(() => { setError(null); setSuccess(false); }, []);
  return { run, pending, error, success, reset };
}
