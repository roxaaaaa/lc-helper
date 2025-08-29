# JWT Implementation in AI Exam Prep App

## Quick Summary

This app uses a **unified JWT authentication system** that automatically adapts to different runtime environments (Edge Runtime and Node.js) while maintaining a single, consistent API. The system provides secure token-based authentication with automatic refresh capabilities.

## What is JWT?

**JWT (JSON Web Token)** is a secure way to transmit information between parties as a JSON object. Think of it as a digital passport that:
- Contains user information (ID, email, name)
- Is cryptographically signed to prevent tampering
- Has an expiration time for security
- Can be verified without storing session data on the server

## How It's Implemented in This App

### 🏗️ **Unified Architecture**

The app uses a **single JWT service** (`src/lib/jwt.ts`) that automatically detects the runtime environment:

```typescript
// Automatically uses the right library based on environment
const token = await JWTService.generateToken({
  userId: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName
});
```

**Edge Runtime** → Uses `jose` library (async operations)
**Node.js Runtime** → Uses `jsonwebtoken` library (sync operations)

### 🔐 **Security Features**

1. **Secure Secret Management**
   ```typescript
   // Throws error in production if secret not set
   const getJwtSecret = (): string => {
     const secret = process.env.JWT_SECRET;
     if (!secret && process.env.NODE_ENV === 'production') {
       throw new Error('JWT_SECRET is required in production');
     }
     return secret || 'default-secret-for-development';
   };
   ```

2. **Payload Standardization**
   ```typescript
   // Ensures consistent data types across environments
   const standardizedPayload = {
     userId: Number(payload.userId),
     email: String(payload.email),
     firstName: String(payload.firstName),
     lastName: String(payload.lastName)
   };
   ```

3. **Type-Safe Validation**
   ```typescript
   // Validates payload structure before processing
   function isJWTPayload(payload: any): payload is JWTPayload {
     return (
       payload &&
       (typeof payload.userId === 'number' || typeof payload.userId === 'string') &&
       typeof payload.email === 'string' &&
       typeof payload.firstName === 'string' &&
       typeof payload.lastName === 'string'
     );
   }
   ```

### 🛡️ **Authentication Flow**

1. **Login** (`/api/auth/login`)
   - User provides email/password
   - Server validates credentials
   - Generates JWT token (7-day expiration)
   - Sets secure httpOnly cookie
   - Returns user data and token

2. **Route Protection** (`middleware.ts`)
   - Checks for valid token on protected routes
   - Redirects to login if token invalid/missing
   - Allows access to authenticated users

3. **Token Refresh** (`/api/auth/refresh`)
   - Automatically refreshes tokens before expiration
   - Updates both cookie and client storage
   - Handles failed refresh gracefully

### 🔄 **Automatic Token Management**

The app includes smart token management utilities:

```typescript
// Client-side utilities (auth-utils.ts)
const response = await apiClient.get('/protected-endpoint');
// Automatically handles token refresh if needed

// Manual refresh
const success = await refreshToken();
```

### 📍 **Where JWT is Used**

| Location | Purpose | Runtime |
|----------|---------|---------|
| `middleware.ts` | Route protection | Edge Runtime |
| `/api/auth/login` | Generate tokens | Edge Runtime |
| `/api/auth/refresh` | Refresh tokens | Edge Runtime |
| `/api/user/*` | Verify tokens | Node.js |
| `auth-utils.ts` | Client utilities | Node.js |

### 🚀 **Key Benefits**

1. **Single Codebase**: One service works everywhere
2. **Automatic Adaptation**: Chooses optimal library per environment
3. **Type Safety**: Full TypeScript support with validation
4. **Security First**: Secure defaults and production requirements
5. **Developer Friendly**: Simple API with complex logic hidden

### 🔧 **Environment Setup**

```env
# Required in production
JWT_SECRET=your-super-secure-secret-key

# Optional - for debugging
NODE_ENV=development
```

### 📝 **Usage Examples**

**Generate Token:**
```typescript
const token = await JWTService.generateToken({
  userId: 123,
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe'
});
```

**Verify Token:**
```typescript
const payload = await JWTService.verifyToken(token);
console.log('User:', payload.email);
```

**Protected API Call:**
```typescript
const response = await apiClient.get('/user/profile');
// Token automatically included and refreshed if needed
```

This unified approach eliminates the complexity of managing multiple JWT implementations while providing optimal performance in each runtime environment.
