const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8008/api';

let activeAccessToken: string | null = localStorage.getItem('rsl_access_token_v2');
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

export function setAccessToken(token: string | null) {
  activeAccessToken = token;
  if (token) {
    localStorage.setItem('rsl_access_token_v2', token);
  } else {
    localStorage.removeItem('rsl_access_token_v2');
  }
}

export function getAccessToken(): string | null {
  return activeAccessToken;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (activeAccessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${activeAccessToken}`);
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Include HttpOnly refresh cookies
  };

  let response: Response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (err: any) {
    throw new Error(err?.message || 'Network error occurred while connecting to API.');
  }

  // Handle 401 Unauthorized - Attempt Controlled Refresh
  if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/signup') && !endpoint.includes('/auth/refresh')) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          const newToken = data.access_token;
          setAccessToken(newToken);
          isRefreshing = false;
          onRefreshed(newToken);

          // Retry initial request
          headers.set('Authorization', `Bearer ${newToken}`);
          return apiRequest<T>(endpoint, { ...options, headers });
        } else {
          isRefreshing = false;
          setAccessToken(null);
          window.dispatchEvent(new CustomEvent('rsl_auth_expired'));
        }
      } catch (e) {
        isRefreshing = false;
        setAccessToken(null);
        window.dispatchEvent(new CustomEvent('rsl_auth_expired'));
      }
    } else {
      // Wait for active refresh to complete
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken: string) => {
          headers.set('Authorization', `Bearer ${newToken}`);
          resolve(apiRequest<T>(endpoint, { ...options, headers }));
        });
      });
    }
  }

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMsg = data?.detail || data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}
