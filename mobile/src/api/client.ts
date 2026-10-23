import { API_BASE_URL } from '../config';

export class ApiError extends Error { constructor(message: string, public status?: number) { super(message); } }
export async function api<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
  } catch { throw new ApiError('Unable to reach the API. Check the LAN IP and Wi-Fi connection.'); }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(body?.error?.message ?? 'Request failed.', response.status);
  return body as T;
}
