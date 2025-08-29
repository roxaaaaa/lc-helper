import { JWTService } from './jwt';

interface AuthenticatedRequestOptions extends RequestInit {
  token?: string;
  requireAuth?: boolean;
}

interface RefreshResponse {
  token: string;
  user: any;
}

/**
 * Helper functions to reduce cognitive complexity
 */
const localStorageUtils = {
  getToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  },
  
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  },
  
  setUser(user: any): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  },
  
  clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
};

/**
 * Refresh authentication token
 */
async function refreshToken(authToken: string): Promise<RefreshResponse> {
  const refreshResponse = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  });

  if (!refreshResponse.ok) {
    localStorageUtils.clearAuth();
    throw new Error('Token refresh failed');
  }

  const refreshData = await refreshResponse.json();
  localStorageUtils.setToken(refreshData.token);
  localStorageUtils.setUser(refreshData.user);
  
  return refreshData;
}

/**
 * Handle token refresh with error handling
 */
async function handleTokenRefresh(authToken: string): Promise<string | null> {
  try {
    const refreshData = await refreshToken(authToken);
    return refreshData.token;
  } catch (error) {
    console.error('Token refresh error:', error);
    localStorageUtils.clearAuth();
    throw new Error('Authentication failed');
  }
}

/**
 * Add authorization header to fetch options
 */
function addAuthHeader(fetchOptions: RequestInit, token: string): RequestInit {
  return {
    ...fetchOptions,
    headers: {
      ...fetchOptions.headers,
      'Authorization': `Bearer ${token}`,
    },
  };
}

/**
 * Handle 401 response by attempting token refresh
 */
async function handleUnauthorizedResponse(
  url: string, 
  fetchOptions: RequestInit, 
  authToken: string
): Promise<Response> {
  try {
    const refreshData = await refreshToken(authToken);
    const updatedOptions = addAuthHeader(fetchOptions, refreshData.token);
    return await fetch(url, updatedOptions);
  } catch (error) {
    console.error('Token refresh error on 401:', error);
    localStorageUtils.clearAuth();
    return new Response(null, { status: 401 });
  }
}

/**
 * Make an authenticated API request with automatic token refresh
 */
export async function authenticatedFetch(
  url: string, 
  options: AuthenticatedRequestOptions = {}
): Promise<Response> {
  const { token, requireAuth = true, ...fetchOptions } = options;
  
  // Get token from localStorage if not provided
  const authToken = token || localStorageUtils.getToken();
  
  if (requireAuth && !authToken) {
    throw new Error('No authentication token available');
  }

  let finalToken = authToken;

  // Check if token needs refresh
  if (authToken && JWTService.shouldRefreshToken(authToken)) {
    finalToken = await handleTokenRefresh(authToken);
  }

  // Add authorization header if token exists
  const requestOptions = finalToken 
    ? addAuthHeader(fetchOptions, finalToken)
    : fetchOptions;

  // Make the actual request
  const response = await fetch(url, requestOptions);

  // Handle 401 response
  if (response.status === 401 && authToken) {
    return handleUnauthorizedResponse(url, fetchOptions, authToken);
  }

  return response;
}

/**
 * Create an API client with authentication
 */
export class AuthenticatedAPIClient {
  private baseURL: string;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
  }

  async get(endpoint: string, options: AuthenticatedRequestOptions = {}) {
    return authenticatedFetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      ...options,
    });
  }

  async post(endpoint: string, data: any, options: AuthenticatedRequestOptions = {}) {
    return authenticatedFetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(data),
      ...options,
    });
  }

  async put(endpoint: string, data: any, options: AuthenticatedRequestOptions = {}) {
    return authenticatedFetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(data),
      ...options,
    });
  }

  async delete(endpoint: string, options: AuthenticatedRequestOptions = {}) {
    return authenticatedFetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      ...options,
    });
  }
}

// Export a default API client instance
export const apiClient = new AuthenticatedAPIClient();
