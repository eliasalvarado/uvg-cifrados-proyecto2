import { useState } from 'react';
import useLogout from './useLogout';

function useFetch() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const logout = useLogout();

  const callFetch = async ({
    uri,
    method = 'GET',
    body,
    headers,
    signal,
    toJson = true,
    toBlob = false,
    parse = true,
    removeContentType = false,
  }) => {
    setResult(null);
    setError(null);
    setLoading(true);

    const heads = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (removeContentType) delete heads['Content-Type'];

    const reply = await fetch(uri, {
      method,
      body,
      headers: heads,
      signal,
      credentials: 'include',
    });

    if (reply.ok) {

      let res;
      if (!parse) res = reply;
      else if (toBlob) res = await reply.blob();
      else if (toJson) res = await reply.json();
      else res = await reply.text();

      setResult(res ?? true);
    } else {
      // If forbidden, force logout first (avoid negated condition)
      if (reply.status === 403) {
        logout();
        return;
      }

      let parsedError = null;
      try {
        parsedError = await reply.json();
      } catch (e) {
        // No se pudo convertir el error a json
        console.error('Error parsing fetch error response as JSON:', e);
      }

      setError({
        status: reply?.status,
        message: parsedError?.err?.trim() || reply?.statusMessage?.trim() || parsedError?.error?.trim() || parsedError?.message?.trim() || reply?.statusText?.trim() || 'Ocurrió un error.',
      });
    }

    setLoading(false);
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setLoading(false);
  }

  return {
    callFetch,
    result,
    error,
    loading,
    reset,
  };
}

export default useFetch;
