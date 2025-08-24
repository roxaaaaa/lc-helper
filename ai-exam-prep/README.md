# LC Helper - AI-Powered Exam Preparation

A comprehensive web application for Leaving Certificate exam preparation with AI-generated questions and user authentication.

## Features

- **User Authentication**: Secure login/signup system with JWT tokens
- **Database**: SQLite database for user management
- **AI-Powered Questions**: Generate personalized practice questions
- **Modern UI**: Beautiful, responsive design with Tailwind CSS
- **Progress Tracking**: Monitor study progress and performance

## Authentication System

### Database Setup

The application uses SQLite for user management. The database is automatically created when the first user signs up.

**Database Schema:**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  school TEXT NOT NULL,
  year TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Authentication Flow

1. **Signup**: Users create accounts with email, password, and profile information
2. **Login**: Users authenticate with email and password
3. **JWT Tokens**: Secure authentication using JSON Web Tokens
4. **Protected Routes**: Middleware protects routes requiring authentication
5. **Context Management**: React Context manages authentication state

### API Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-exam-prep
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
JWT_SECRET=your-secret-key-change-in-production
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
ai-exam-prep/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   └── auth/
│   │   │       ├── login/
│   │   │       │   └── route.ts
│   │   │       ├── signup/
│   │   │       │   └── route.ts
│   │   │       └── logout/
│   │   │           └── route.ts
│   │   ├── landing/
│   │   │   └── page.tsx
│   │   ├── main/
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   └── middleware.ts
├── users.db (auto-generated)
└── package.json
```

## Security Features

- **Password Hashing**: Passwords are hashed using bcrypt with 12 salt rounds
- **JWT Tokens**: Secure authentication tokens with 7-day expiration
- **Input Validation**: Server-side validation for all user inputs
- **SQL Injection Protection**: Parameterized queries prevent SQL injection
- **CORS Configuration**: Proper CORS setup for API security

## User Management

### User Registration
Users can sign up with:
- First Name
- Last Name
- Email (unique)
- Password (minimum 6 characters)
- School Name
- Year Level (5th Year, 6th Year, Other)

### User Authentication
- Email/password authentication
- JWT token generation
- Automatic token storage in localStorage
- Protected route access

### Profile Management
- View user profile information
- Logout functionality
- Account management features

## Database Implementation

The application uses SQLite for simplicity and ease of deployment:

### Advantages of SQLite:
- **No server setup required**
- **File-based storage**
- **Automatic table creation**
- **Cross-platform compatibility**

### Database Operations:
- **User Creation**: Secure user registration with password hashing
- **User Authentication**: Email/password verification
- **User Retrieval**: Fetch user data for profile display
- **Data Validation**: Server-side validation for all inputs

## Development

### Adding New Features

1. **New API Routes**: Add to `src/app/api/`
2. **New Pages**: Add to `src/app/`
3. **Database Changes**: Modify the `initDb()` function in API routes
4. **Authentication**: Use the `useAuth()` hook for protected features

### Environment Variables

Create a `.env.local` file:
```env
JWT_SECRET=your-secure-secret-key
OPEN_AI_KEY=your-openai-api-key
```

## Deployment

### Production Considerations

1. **JWT Secret**: Use a strong, unique secret in production
2. **Database**: Consider using PostgreSQL for production
3. **HTTPS**: Always use HTTPS in production
4. **Environment Variables**: Set proper environment variables
5. **Database Backups**: Implement regular database backups

### Database Migration

For production, consider migrating to PostgreSQL:

```sql
-- PostgreSQL equivalent schema
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  school VARCHAR(255) NOT NULL,
  year VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Troubleshooting

### Common Issues

1. **Database not created**: Check file permissions in the project directory
2. **Authentication errors**: Verify JWT_SECRET is set in environment variables
3. **CORS errors**: Ensure proper CORS configuration in API routes
4. **Password validation**: Check password length requirements (minimum 6 characters)

### Debug Mode

Enable debug logging by adding to `.env.local`:
```env
DEBUG=true
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
