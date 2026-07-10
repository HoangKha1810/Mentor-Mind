export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const ACCESS_TOKEN_KEY = 'mentormind.accessToken';

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: { message: string };
};

type ApiFetchInit = RequestInit & {
  skipAuthRefresh?: boolean;
};

let refreshPromise: Promise<string | undefined> | null = null;

function mergeHeaders(
  headers: HeadersInit | undefined,
  values: Record<string, string | undefined>,
) {
  const merged = new Headers(headers);
  Object.entries(values).forEach(([key, value]) => {
    if (value) merged.set(key, value);
  });
  return merged;
}

async function readApiResponse<T>(response: Response) {
  const text = await response.text();
  if (!text) {
    return { success: response.ok, data: undefined } as ApiResponse<T>;
  }
  return JSON.parse(text) as ApiResponse<T>;
}

function canRefreshAfter401(path: string, init?: ApiFetchInit) {
  return (
    !init?.skipAuthRefresh &&
    typeof window !== 'undefined' &&
    !path.startsWith('/auth/login') &&
    !path.startsWith('/auth/register') &&
    !path.startsWith('/auth/refresh') &&
    !path.startsWith('/auth/logout')
  );
}

async function requestJson<T>(path: string, init?: ApiFetchInit, accessToken?: string) {
  const { skipAuthRefresh: _skipAuthRefresh, ...requestInit } = init ?? {};
  const response = await fetch(`${API_URL}${path}`, {
    ...requestInit,
    headers: mergeHeaders(requestInit.headers, {
      'Content-Type': 'application/json',
      Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
    }),
    credentials: 'include',
    cache: 'no-store',
  });
  const json = await readApiResponse<T>(response);
  return { response, json };
}

export async function apiFetch<T>(path: string, init?: ApiFetchInit): Promise<T> {
  let { response, json } = await requestJson<T>(path, init);

  if (response.status === 401 && canRefreshAfter401(path, init)) {
    const token = await refreshSession();
    if (token) {
      ({ response, json } = await requestJson<T>(path, init, token));
    }
  }

  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? 'Yêu cầu thất bại');
  }
  return json.data as T;
}

export async function uploadFile<T>(path: string, file: File): Promise<T> {
  const form = new FormData();
  form.append('file', file);

  async function send(token?: string) {
    return fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : authHeaders(),
      credentials: 'include',
      cache: 'no-store',
      body: form,
    });
  }

  let response = await send();
  if (response.status === 401) {
    const token = await refreshSession();
    if (token) {
      response = await send(token);
    }
  }

  const json = await readApiResponse<T>(response);
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? 'Tải file thất bại');
  }
  return json.data as T;
}

export async function uploadAvatar<T>(file: File): Promise<T> {
  const form = new FormData();
  form.append('file', file);

  async function send(token?: string) {
    return fetch(`${API_URL}/files/avatar`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : authHeaders(),
      credentials: 'include',
      cache: 'no-store',
      body: form,
    });
  }

  let response = await send();
  if (response.status === 401) {
    const token = await refreshSession();
    if (token) {
      response = await send(token);
    }
  }

  const json = await readApiResponse<T>(response);
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? 'Tải ảnh đại diện thất bại');
  }
  return json.data as T;
}

export async function refreshSession() {
  if (typeof window === 'undefined') return undefined;
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          cache: 'no-store',
        });
        const json = await readApiResponse<{ accessToken: string }>(response);
        if (!response.ok || !json.success || !json.data?.accessToken) {
          clearAccessToken();
          return undefined;
        }
        setAccessToken(json.data.accessToken);
        return json.data.accessToken;
      } catch {
        clearAccessToken();
        return undefined;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

export async function ensureAccessToken() {
  return getAccessToken() ?? refreshSession();
}

export async function logoutSession() {
  clearAccessToken();
  try {
    await apiFetch('/auth/logout', {
      method: 'POST',
      skipAuthRefresh: true,
    });
  } catch {
    // The local session is already cleared; stale server cookies should not block logout UX.
  }
}

export function getAccessToken() {
  if (typeof window === 'undefined') return undefined;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY) ?? undefined;
}

export function setAccessToken(token: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function assetUrl(value?: string | null) {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_URL}${value.startsWith('/') ? value : `/${value}`}`;
}
