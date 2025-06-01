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
    } else if (reply.status !== 403) {
      let parsedError = null;

      try {
        parsedError = await reply.json();
      // eslint-disable-next-line no-unused-vars
      } catch (e) {
        // No se pudo convertir el error a json
      }
      setError({
        status: reply?.status,
        message: parsedError?.err?.trim() || reply?.statusMessage?.trim() || reply?.statusText?.trim() || 'Ocurrió un error.',
      });
    } else {
      // Forbidden error, force logout
      logout();
      return;
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
