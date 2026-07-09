export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: { message: string };
};

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    credentials: 'include',
    cache: 'no-store',
  });
  const json = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? 'Yêu cầu thất bại');
  }
  return json.data as T;
}

export async function uploadFile<T>(path: string, file: File): Promise<T> {
  const form = new FormData();
  form.append('file', file);
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'include',
    cache: 'no-store',
    body: form,
  });
  const json = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message ?? 'Tải file thất bại');
  }
  return json.data as T;
}

export function getAccessToken() {
  if (typeof window === 'undefined') return undefined;
  return window.localStorage.getItem('mentormind.accessToken') ?? undefined;
}

export function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
