// useDataFetch — a generic hook for fetching data from Firebase Data Connect.
// Usage: const { data, loading, error, refetch } = useDataFetch(fetcher, deps, { pollInterval: 15000 });
// Where `fetcher` is an async function returning the data.

import { useState, useEffect, useCallback, useRef } from 'react';

export const useDataFetch = (fetcher, deps = [], options = {}) => {
  const { defaultValue = null, skip = false, pollInterval = 0 } = options;
  const [data, setData] = useState(defaultValue);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const run = useCallback(async (isSilent = false) => {
    if (skip || typeof fetcher !== 'function') return;
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (mountedRef.current) setData(result);
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message || 'Failed to load data');
        console.error('[useDataFetch]', err);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, skip]);

  useEffect(() => {
    run();
    if (pollInterval > 0 && !skip) {
      const timer = setInterval(() => run(true), pollInterval);
      return () => clearInterval(timer);
    }
  }, [run, pollInterval, skip]);

  return { data, loading, error, refetch: () => run(false) };
};

export default useDataFetch;
