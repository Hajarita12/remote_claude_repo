const BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api').replace(/\/$/, '');

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Merge any caller-supplied headers (handle Headers instance, string[][], and plain object)
  const callerHeaders = options.headers;
  if (callerHeaders) {
    if (callerHeaders instanceof Headers) {
      callerHeaders.forEach((value, key) => { headers[key] = value; });
    } else if (Array.isArray(callerHeaders)) {
      callerHeaders.forEach(([key, value]) => { headers[key] = value; });
    } else {
      Object.assign(headers, callerHeaders);
    }
  }

  // Client-side: inject stored auth token
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BASE}${normalizedPath}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMsg = `${response.status} ${response.statusText}`;
      try {
        const errBody = await response.json();
        if (errBody?.error) errorMsg = errBody.error;
      } catch {}
      return { data: null, error: errorMsg };
    }

    // Guard against 204 No Content
    if (response.status === 204) {
      return { data: null, error: null };
    }

    const json = await response.json();
    return { data: json.data ?? json, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Network error' };
  }
}
