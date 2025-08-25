# JWT Token Implementation Guide

## Overview

This project implements a robust JWT (JSON Web Token) authentication system with automatic token refresh, secure storage, and comprehensive error handling.

## What are JWT Tokens?

JWT tokens are compact, URL-safe tokens that contain claims (information) about a user. They consist of three parts:
1. **Header** - Contains token type and signing algorithm
2. **Payload** - Contains the actual data (claims)
3. **Signature** - Verifies the token hasn't been tampered with

## Why Use JWT Tokens?

### 1. **Stateless Authentication**
- No need to store session data on the server
- Each request contains all necessary authentication information
- Scales better across multiple servers

### 2. **Security Benefits**
- Tamper-proof (signature verification)
- Can include expiration times
- Can be revoked by changing the secret key

### 3. **Cross-Domain Compatibility**
- Work well with microservices
- Can be used across different domains
- Ideal for API authentication

## Implementation Details

### 1. JWT Service (`src/lib/jwt.ts`)

Centralized JWT operations with the following features:

```typescript
// Generate a new token
const token = JWTService.generateToken({
  userId: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName
});

// Verify a token
const payload = await JWTService.verifyToken(token);

// Check if token is expired
const isExpired = JWTService.isTokenExpired(token);

// Check if token should be refreshed
const shouldRefresh = JWTService.shouldRefreshToken(token);
```

### 2. Authentication Context (`src/contexts/AuthContext.tsx`)

Enhanced React context with automatic token refresh:

```typescript
const { user, token, login, logout, refreshToken, isLoading, isRefreshing } = useAuth();

// Automatic token refresh on app load
// Manual token refresh
const success = await refreshToken();
```

### 3. API Routes

#### Login (`/api/auth/login`)
- Validates user credentials
- Generates JWT token with 7-day expiration
- Sets httpOnly cookie for security
- Returns user data and token

#### Refresh (`/api/auth/refresh`)
- Verifies current token
- Generates new token with fresh expiration
- Updates both cookie and response data

#### Logout (`/api/auth/logout`)
- Clears authentication cookies
- Removes stored tokens

### 4. Middleware Protection (`src/middleware.ts`)

Route protection with automatic token verification:

```typescript
// Protected routes
const protectedRoutes = ['/main', '/dashboard', '/profile'];

// Auth routes (redirect if already authenticated)
const authRoutes = ['/auth/login', '/auth/signup'];
```

### 5. Authenticated API Client (`src/lib/auth-utils.ts`)

Utility for making authenticated requests with automatic token refresh:

```typescript
import { apiClient } from '../lib/auth-utils';

// Make authenticated requests
const response = await apiClient.get('/protected-endpoint');
const data = await apiClient.post('/api/data', { key: 'value' });

// Or use the lower-level function
const response = await authenticatedFetch('/api/protected', {
  method: 'POST',
  body: JSON.stringify(data)
});
```

## Security Features

### 1. **Token Storage**
- **HttpOnly Cookies**: Primary storage for server-side access
- **localStorage**: Backup for client-side access
- **Automatic Cleanup**: Removes invalid tokens

### 2. **Token Validation**
- **Signature Verification**: Ensures token integrity
- **Expiration Checking**: Prevents use of expired tokens
- **Issuer/Audience Validation**: Additional security layer

### 3. **Automatic Refresh**
- **Proactive Refresh**: Refreshes tokens before expiration
- **Retry Logic**: Handles failed requests with token refresh
- **Graceful Degradation**: Logs out user if refresh fails

### 4. **Error Handling**
- **Network Errors**: Handles connection issues
- **Invalid Tokens**: Clears stored data on validation failure
- **Server Errors**: Provides meaningful error messages

## Environment Configuration

```env
# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production

# Development
NODE_ENV=development
DEBUG=false
```

## Usage Examples

### 1. **Login Flow**
```typescript
const handleLogin = async (email: string, password: string) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (response.ok) {
      const { token, user } = await response.json();
      login(token, user);
      router.push('/main');
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### 2. **Protected API Calls**
```typescript
const fetchUserData = async () => {
  try {
    const response = await apiClient.get('/user/profile');
    if (response.ok) {
      const userData = await response.json();
      setUserData(userData);
    }
  } catch (error) {
    console.error('Failed to fetch user data:', error);
  }
};
```

### 3. **Manual Token Refresh**
```typescript
const handleRefresh = async () => {
  const success = await refreshToken();
  if (success) {
    console.log('Token refreshed successfully');
  } else {
    console.log('Token refresh failed, user logged out');
  }
};
```

## Best Practices

### 1. **Token Management**
- Always use the provided utilities for token operations
- Don't manually manipulate tokens
- Let the system handle automatic refresh

### 2. **Error Handling**
- Always handle authentication errors gracefully
- Provide clear feedback to users
- Log errors for debugging

### 3. **Security**
- Never expose JWT_SECRET in client-side code
- Use HTTPS in production
- Regularly rotate JWT secrets

### 4. **Performance**
- Tokens are automatically refreshed only when needed
- Failed requests are retried once with fresh tokens
- Minimal overhead for token validation

## Troubleshooting

### Common Issues

1. **Token Expired Errors**
   - Check if JWT_SECRET is properly set
   - Verify token expiration time
   - Ensure refresh endpoint is working

2. **Authentication Failures**
   - Check browser console for errors
   - Verify API routes are accessible
   - Ensure middleware is properly configured

3. **Refresh Loop Issues**
   - Check network connectivity
   - Verify refresh endpoint returns valid tokens
   - Ensure proper error handling

### Debug Mode

Enable debug mode to see detailed token information:

```typescript
// Check token details
const token = localStorage.getItem('token');
const decoded = JWTService.decodeToken(token);
console.log('Token payload:', decoded);
```

## Migration from Previous Implementation

If you're upgrading from a previous authentication system:

1. **Update Environment Variables**
   - Ensure JWT_SECRET is set
   - Update any old authentication configs

2. **Update API Calls**
   - Replace manual fetch calls with `apiClient`
   - Use `authenticatedFetch` for custom requests

3. **Update Components**
   - Use the enhanced `useAuth` hook
   - Remove manual token management code

4. **Test Thoroughly**
   - Verify login/logout flows
   - Test token refresh scenarios
   - Check protected route access

## Future Enhancements

Potential improvements for the JWT system:

1. **Token Blacklisting**: Track revoked tokens
2. **Multiple Token Types**: Access vs refresh tokens
3. **Rate Limiting**: Prevent token abuse
4. **Audit Logging**: Track authentication events
5. **Device Management**: Multiple device support
