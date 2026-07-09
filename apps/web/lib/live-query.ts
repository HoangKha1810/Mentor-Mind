'use client';

import { useEffect, useState } from 'react';
import { apiFetch, authHeaders, getAccessToken } from './api';

type LiveQueryState<T> = {
  data: T | null;
  loading: boolean;
  error: string;
  unauthenticated: boolean;
};

export function useLiveQuery<T>(
  path: string | null,
  options: { auth?: boolean; deps?: unknown[] } = {},
) {
  const [version, setVersion] = useState(0);
  const [state, setState] = useState<LiveQueryState<T>>({
    data: null,
    loading: Boolean(path),
    error: '',
    unauthenticated: false,
  });
  const deps = options.deps ?? [];

  useEffect(() => {
    let active = true;

    async function load() {
      if (!path) {
        setState({ data: null, loading: false, error: '', unauthenticated: false });
        return;
      }

      if (options.auth && !getAccessToken()) {
        setState({ data: null, loading: false, error: '', unauthenticated: true });
        return;
      }

      setState((current) => ({ ...current, loading: true, error: '', unauthenticated: false }));
      try {
        const data = await apiFetch<T>(path, {
          headers: options.auth ? authHeaders() : undefined,
        });
        if (active) {
          setState({ data, loading: false, error: '', unauthenticated: false });
        }
      } catch (error) {
        if (active) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Không tải được dữ liệu',
            unauthenticated: false,
          });
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [path, options.auth, version, ...deps]);

  return {
    ...state,
    reload: () => setVersion((current) => current + 1),
  };
}
