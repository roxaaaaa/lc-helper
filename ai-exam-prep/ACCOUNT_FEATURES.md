# Account & Payment Features Documentation

## Overview

This document describes the comprehensive account management and payment system implemented for the LC Helper App. The system includes personal profile management, trial tracking, subscription management, and secure payment processing.

## Features Implemented

### 1. Enhanced Profile Page (`/profile`)

#### Personal Information Display
- **Full Name**: First and last name
- **Email Address**: User's email
- **School**: User's school name
- **Year Level**: Current academic year
- **Member Since**: Account creation date

#### Subscription Status
- **Current Status**: Shows trial, active subscription, or expired status
- **Trial Days Remaining**: Countdown of remaining trial days
- **Plan Type**: Current subscription plan (if any)
- **Subscription End Date**: When current subscription expires

#### Account Actions
- **Logout**: Secure logout with redirect to landing page
- **Delete Account**: Permanent account deletion with confirmation
- **Manage Subscription**: Link to payment/subscription management

#### Visual Indicators
- **Status Badges**: Color-coded status indicators
- **Trial Warning**: Alert when trial is ending soon (≤7 days)
- **Loading States**: Smooth loading animations

### 2. Payment Page (`/payment`)

#### Subscription Plans
- **Monthly Plan**: $9.99/month
  - Unlimited practice questions
  - Detailed explanations
  - Progress tracking
  - Mock exams

- **Yearly Plan**: $99.99/year (Save 17%)
  - All monthly features
  - Priority support
  - 2 months free

#### Payment Form
- **Card Number**: Auto-formatted with spaces
- **Expiry Date**: MM/YY format
- **CVV**: 3-4 digit security code
- **Cardholder Name**: Full name on card
- **Email**: For payment receipt

#### Order Summary
- **Plan Details**: Selected plan information
- **Price Breakdown**: Clear pricing display
- **Total Amount**: Final payment amount

#### Security Features
- **SSL Encryption**: Industry-standard security
- **Input Validation**: Real-time form validation
- **Secure Processing**: Mock payment processing

### 3. Database Schema

#### Users Table (Extended)
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  school TEXT NOT NULL,
  year TEXT NOT NULL,
  trialStartDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  trialEndDate TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
  subscriptionStatus TEXT DEFAULT 'trial',
  subscriptionType TEXT DEFAULT NULL,
  subscriptionEndDate TIMESTAMP DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Subscription Plans Table
```sql
CREATE TABLE subscription_plans (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration_months INTEGER NOT NULL,
  features TEXT[] NOT NULL,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Payment History Table
```sql
CREATE TABLE payment_history (
  id SERIAL PRIMARY KEY,
  userId INTEGER REFERENCES users(id) ON DELETE CASCADE,
  planId INTEGER REFERENCES subscription_plans(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL,
  paymentMethod TEXT,
  transactionId TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### 1. User Profile (`GET /api/user/profile`)
- **Purpose**: Fetch detailed user profile with subscription info
- **Authentication**: Required (JWT token)
- **Response**: Complete user profile without password

### 2. Delete Account (`DELETE /api/user/account`)
- **Purpose**: Permanently delete user account
- **Authentication**: Required (JWT token)
- **Features**: Cascading deletion of related data

### 3. Subscription Plans (`GET /api/subscription/plans`)
- **Purpose**: Fetch available subscription plans
- **Authentication**: Not required
- **Response**: Array of active subscription plans

### 4. Create Subscription (`POST /api/subscription/create`)
- **Purpose**: Process payment and create subscription
- **Authentication**: Required (JWT token)
- **Features**: Transaction handling, payment recording

## User Experience Features

### 1. Trial Management
- **30-Day Trial**: All new users get 30 days free
- **Trial Countdown**: Real-time display of remaining days
- **Upgrade Prompts**: Gentle reminders when trial is ending
- **Seamless Transition**: Easy upgrade from trial to paid

### 2. Subscription Status
- **Visual Indicators**: Color-coded status badges
- **Status Types**:
  - 🟢 **Active Subscription**: Paid and active
  - 🔵 **Trial**: Free trial period
  - 🔴 **Expired**: Trial or subscription expired

### 3. Account Security
- **Delete Confirmation**: Type "DELETE" to confirm
- **Secure Logout**: Clears all authentication data
- **Data Protection**: Secure handling of sensitive information

### 4. Payment Security
- **SSL Encryption**: All payment data encrypted
- **Input Validation**: Real-time form validation
- **Transaction Recording**: Complete payment history
- **Error Handling**: Graceful error messages

## Technical Implementation

### 1. Frontend Components
- **Profile Page**: React component with state management
- **Payment Page**: Form handling with validation
- **Modal Dialogs**: Confirmation dialogs for destructive actions
- **Loading States**: Smooth user experience during API calls

### 2. Backend Services
- **JWT Authentication**: Secure token-based authentication
- **Database Transactions**: ACID compliance for payments
- **Error Handling**: Comprehensive error management
- **Data Validation**: Input sanitization and validation

### 3. Security Measures
- **Password Hashing**: bcrypt with salt rounds
- **Token Verification**: JWT signature validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization

## Usage Examples

### 1. Accessing Profile
```typescript
// Navigate to profile page
router.push('/profile');

// Access profile data
const { user, profile } = useAuth();
```

### 2. Making Payments
```typescript
// Navigate to payment page
router.push('/payment');

// Process payment
const response = await apiClient.post('/subscription/create', {
  planId: selectedPlan.id,
  paymentData: paymentFormData
});
```

### 3. Deleting Account
```typescript
// Delete account with confirmation
const response = await apiClient.delete('/user/account');
if (response.ok) {
  logout();
  router.push('/landing');
}
```

## Future Enhancements

### 1. Payment Integration
- **Stripe Integration**: Real payment processing
- **PayPal Support**: Alternative payment method
- **Recurring Billing**: Automatic subscription renewals

### 2. Account Features
- **Profile Editing**: Update personal information
- **Password Change**: Secure password updates
- **Email Verification**: Email confirmation system

### 3. Subscription Management
- **Plan Upgrades/Downgrades**: Change subscription plans
- **Cancellation**: Cancel subscription with proration
- **Billing History**: Complete payment history view

### 4. Analytics
- **Usage Tracking**: Monitor feature usage
- **Payment Analytics**: Revenue and conversion tracking
- **User Behavior**: Engagement metrics

## Testing

### 1. Manual Testing
- **Profile Access**: Verify all profile information displays
- **Payment Flow**: Test complete payment process
- **Account Deletion**: Verify secure account removal
- **Trial Management**: Test trial countdown and expiration

### 2. API Testing
- **Authentication**: Verify JWT token validation
- **Database Operations**: Test CRUD operations
- **Error Handling**: Test various error scenarios
- **Security**: Verify data protection measures

## Deployment Considerations

### 1. Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# JWT
JWT_SECRET=your-secret-key-change-in-production

# Payment (Future)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 2. Database Migration
- Run database initialization script
- Verify all tables are created
- Check default subscription plans are inserted

### 3. Security Checklist
- [ ] JWT_SECRET is set and secure
- [ ] HTTPS is enabled in production
- [ ] Database connections are secure
- [ ] Input validation is working
- [ ] Error messages don't expose sensitive data

## Support and Maintenance

### 1. Monitoring
- **Database Performance**: Monitor query performance
- **Payment Processing**: Track payment success rates
- **User Activity**: Monitor account creation and usage

### 2. Backup Strategy
- **Database Backups**: Regular automated backups
- **Payment Data**: Secure backup of transaction history
- **User Data**: Backup user profiles and preferences

### 3. Updates
- **Security Updates**: Regular security patches
- **Feature Updates**: New subscription plans and features
- **Bug Fixes**: Continuous improvement and bug resolution
