// Universal fetch wrapper with standard error normalization
export class ApiError extends Error {
  status: number;
  details?: any;

  constructor(message: string, status: number = 500, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('urbanico_admin_session');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
  // Check if the endpoint already includes /api, if not prepend it, unless it's an absolute URL
  let url = endpoint.startsWith('http') ? endpoint : `${apiBaseUrl}${endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  let data: any;
  try {
    data = await res.json();
  } catch {
    data = { error: 'Invalid JSON response from server' };
  }

  if (!res.ok || data.success === false) {
    const errorMsg = data.error || data.message || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

