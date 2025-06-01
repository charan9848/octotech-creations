# Email Uniqueness Implementation

## Overview
This implementation ensures that email addresses are unique across all artist registrations in the system. This prevents multiple accounts from using the same email address.

## Features

### 1. Backend Validation
- **Registration API** (`/api/register-artist`): Checks for email and artistid uniqueness before creating new accounts
- **Profile Update APIs**: Validates email uniqueness when updating existing profiles
- **Database Indexes**: Unique indexes on `email` and `artistid` fields for database-level constraint enforcement

### 2. Real-time Frontend Validation
- **Live Email Checking**: Validates email availability as users type (debounced)
- **Live Artist ID Checking**: Validates artist ID availability as users type (debounced)
- **Visual Feedback**: Shows checkmarks (✅) for available emails/IDs and X marks (❌) for taken ones
- **Loading Indicators**: Shows spinner while checking availability
- **Smart Submit Button**: Disabled when emails/IDs are not available or being checked

### 3. API Endpoints

#### Check Email Availability
```
POST /api/check-email
Content-Type: application/json

{
  "email": "user@example.com"
}

Response:
{
  "available": true/false,
  "message": "Email is available" | "Email already exists"
}
```

#### Check Artist ID Availability
```
POST /api/check-artistid
Content-Type: application/json

{
  "artistid": "artist123"
}

Response:
{
  "available": true/false,
  "message": "Artist ID is available" | "Artist ID already exists"
}
```

## Database Setup

### Setup Unique Indexes
Run this command to create unique database indexes:
```bash
npm run setup-db
```

This will create:
- Unique index on `email` field
- Unique index on `artistid` field

### Cleanup Duplicates (if needed)
If you have existing duplicate data, run:
```bash
npm run cleanup-duplicates
```

This will:
- Find duplicate emails and remove all but the oldest entry
- Find duplicate artist IDs and remove all but the oldest entry
- Preserve the account that was created first

## Error Handling

### MongoDB Duplicate Key Errors
All APIs handle MongoDB duplicate key errors (code 11000) gracefully:
- Returns user-friendly error messages
- Distinguishes between email and artistid conflicts
- Provides appropriate HTTP status codes (400 for validation errors)

### Frontend Error Handling
- Displays real-time validation feedback
- Shows appropriate error messages for each field
- Prevents form submission when validation fails
- Handles API call failures gracefully

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── check-email/route.js          # Email availability check
│   │   ├── check-artistid/route.js       # Artist ID availability check
│   │   ├── register-artist/route.js      # Registration with uniqueness validation
│   │   └── artists/[id]/route.js         # Profile update with uniqueness validation
│   └── artist-register/page.jsx          # Registration form with real-time validation
└── scripts/
    ├── setup-database-indexes.js         # Database index setup script
    └── cleanup-duplicates.js             # Duplicate cleanup utility
```

## Usage Examples

### Registration Form Validation
The registration form now includes:
- Debounced real-time email validation (500ms delay)
- Debounced real-time artist ID validation (500ms delay)
- Visual indicators for field availability
- Submit button disabled until all validations pass

### API Usage
```javascript
// Check email availability
const checkEmail = async (email) => {
  const response = await fetch('/api/check-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await response.json();
  return data.available;
};

// Register with validation
const register = async (userData) => {
  const response = await fetch('/api/register-artist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return response.json();
};
```

## Benefits

1. **Data Integrity**: Prevents duplicate email registrations at both application and database levels
2. **User Experience**: Real-time feedback helps users choose available emails/IDs quickly
3. **Performance**: Database indexes ensure fast uniqueness checks
4. **Reliability**: Multiple layers of validation (frontend, backend, database)
5. **Maintainability**: Clear error messages and proper error handling

## Migration Guide

If you're adding this to an existing system:

1. **Check for existing duplicates**: Run `npm run cleanup-duplicates`
2. **Create database indexes**: Run `npm run setup-db`
3. **Update registration forms**: Use the real-time validation pattern
4. **Update APIs**: Include uniqueness validation in all relevant endpoints

## Security Considerations

- Email validation prevents enumeration attacks by using consistent response times
- Database indexes prevent race conditions during concurrent registrations
- Input validation prevents injection attacks
- Error messages don't reveal sensitive information about existing users
