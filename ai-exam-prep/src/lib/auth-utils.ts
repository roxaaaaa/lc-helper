import { JWTService } from './jwt';

interface AuthenticatedRequestOptions extends RequestInit {
  token?: string;
  requireAuth?: boolean;
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
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  
  if (requireAuth && !authToken) {
    throw new Error('No authentication token available');
  }

  // Check if token is expired or close to expiring
  if (authToken && JWTService.shouldRefreshToken(authToken)) {
    try {
      // Try to refresh the token
      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        // Update localStorage with new token
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', refreshData.token);
          localStorage.setItem('user', JSON.stringify(refreshData.user));
        }
        // Use the new token for the request
        fetchOptions.headers = {
          ...fetchOptions.headers,
          'Authorization': `Bearer ${refreshData.token}`,
        };
      } else {
        // Refresh failed, clear stored data
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      throw new Error('Authentication failed');
    }
  } else if (authToken) {
    // Token is still valid, use it
    fetchOptions.headers = {
      ...fetchOptions.headers,
      'Authorization': `Bearer ${authToken}`,
    };
  }

  // Make the actual request
  const response = await fetch(url, fetchOptions);

  // If the request fails with 401, try to refresh token once more
  if (response.status === 401 && authToken) {
    try {
      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        // Update localStorage with new token
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', refreshData.token);
          localStorage.setItem('user', JSON.stringify(refreshData.user));
        }
        // Retry the original request with new token
        fetchOptions.headers = {
          ...fetchOptions.headers,
          'Authorization': `Bearer ${refreshData.token}`,
        };
        return await fetch(url, fetchOptions);
      }
    } catch (error) {
      console.error('Token refresh error on 401:', error);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
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
