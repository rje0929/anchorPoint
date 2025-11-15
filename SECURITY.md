# Security Implementation Guide

This document explains the security measures implemented in the Anchor Point application.

## Authentication & Authorization

### Supabase Authentication

The application uses **Supabase Authentication** with JWT tokens for user authentication. This provides:

- ✅ Secure password hashing
- ✅ Email/password authentication
- ✅ Session management with JWT tokens
- ✅ Automatic token refresh

### JWT Token Verification

All API routes (except `/health`) require authentication:

- Frontend sends JWT token in `Authorization` header: `Bearer <token>`
- Backend verifies token with Supabase before processing request
- Invalid/expired tokens receive `401 Unauthorized` response

## Row Level Security (RLS)

### What is RLS?

Row Level Security is database-level security that restricts which rows users can access. Even if someone bypasses the API, the database enforces access control.

### RLS Policies Applied

#### Read Access (Authenticated Users)

All authenticated users can **read** provider data:

- Providers
- Addresses
- Contact Information
- Services Offered
- Training & Education
- Accessibility Information

#### Write Access (Service Role Only)

Only the **service role** (admin) can create/update/delete data:

- Prevents unauthorized data modification
- Write operations require admin privileges

### Setting Up RLS

**Run this SQL in Supabase SQL Editor:**

```sql
-- See supabase/setup-rls.sql for the complete SQL script
```

Or use the provided script:

```bash
# In Supabase Dashboard > SQL Editor, paste the contents of:
cat supabase/setup-rls.sql
```

## Security Features

### 1. **Backend API Protection**

- All `/api/providers/*` routes require valid JWT token
- Token verification happens before any database query
- User information attached to request for potential audit logging

### 2. **Frontend Token Management**

- Tokens automatically included in all API requests
- Session state managed by Supabase Auth context
- Automatic token refresh
- Clear error messages for unauthenticated requests

### 3. **CORS Configuration**

Currently configured for development:

```typescript
app.use(cors()); // Wide open for dev
```

**For production**, update to:

```typescript
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'https://your-frontend-domain.com',
    credentials: true
  })
);
```

## Environment Variables Required

### Frontend (.env)

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_APP_API_URL=http://localhost:3010/
```

### Backend (.env)

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: For admin operations, use service role key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## How It Works

### 1. User Login Flow

```
1. User enters credentials in login form
2. Frontend calls supabase.auth.signInWithPassword()
3. Supabase validates credentials and returns JWT token
4. Token stored in session
5. User redirected to dashboard
```

### 2. API Request Flow

```
1. Frontend makes request to /api/providers
2. providerService.getAuthHeaders() retrieves JWT from session
3. Request sent with Authorization: Bearer <token>
4. Backend verifyToken middleware validates token with Supabase
5. If valid: request proceeds to route handler
6. If invalid: 401 error returned
```

### 3. Database Query Flow (with RLS)

```
1. API route handler queries database via Prisma
2. PostgreSQL RLS policies check user's authentication
3. Only rows user is authorized to see are returned
4. Write operations blocked unless user has service_role
```

## Testing Security

### Test 1: Unauthenticated Request

```bash
curl http://localhost:3010/api/providers
# Expected: 401 Unauthorized - No token provided
```

### Test 2: Invalid Token

```bash
curl -H "Authorization: Bearer invalid_token" http://localhost:3010/api/providers
# Expected: 401 Unauthorized - Invalid or expired token
```

### Test 3: Valid Token (after login)

```bash
# Get token from browser DevTools > Application > Local Storage
TOKEN="your_actual_jwt_token"
curl -H "Authorization: Bearer $TOKEN" http://localhost:3010/api/providers
# Expected: 200 OK with provider data
```

## Security Best Practices

### ✅ Implemented

- JWT token authentication on all routes
- Database-level Row Level Security
- Automatic token refresh
- Secure password hashing (Supabase)
- HTTPS recommended for production

### 🔒 Additional Recommendations

1. **Enable RLS in Supabase** - Run the setup-rls.sql script
2. **Restrict CORS** - Update CORS origin for production
3. **Use HTTPS** - Always use HTTPS in production
4. **Rotate Secrets** - Periodically rotate Supabase keys
5. **Monitor Access** - Enable Supabase logging to track API access
6. **Rate Limiting** - Consider adding rate limiting middleware
7. **Input Validation** - Validate all user inputs before database queries

## Troubleshooting

### "No active session. Please log in"

- User is not logged in
- Session expired
- Solution: Redirect to /login

### "Invalid or expired token"

- JWT token has expired
- Token was manually modified
- Solution: Log out and log back in

### "401 Unauthorized" on API calls

- Check that user is logged in
- Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correct
- Check browser console for auth errors

## Admin Operations

For admin operations (create/update/delete providers), you'll need to:

1. Create an admin user in Supabase
2. Store their role in user metadata or a separate admin table
3. Update verifyToken middleware to check for admin role
4. Only allow admin users to perform write operations

Example admin check:

```typescript
const verifyAdmin = async (req, res, next) => {
  const user = (req as any).user;

  // Check if user has admin role (implement your logic)
  const isAdmin = await checkIfUserIsAdmin(user.id);

  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden - Admin access required' });
  }

  next();
};

// Apply to write routes
app.post('/api/providers', verifyToken, verifyAdmin, async (req, res) => {
  // ...
});
```

## Questions?

For more information:

- [Supabase Authentication Docs](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)

Next Steps for You:
Enable Row Level Security in Supabase:
Go to Supabase Dashboard > SQL Editor
Copy/paste contents of supabase/setup-rls.sql
Run the SQL to enable RLS policies
Test the Authentication:
Login at /login (credentials are pre-filled in the form for dev)
Navigate to /dashboard/providers
Providers should load normally with authentication
For Production:
Update CORS in server/index.ts to restrict origins
Add SUPABASE_SERVICE_ROLE_KEY to your .env for admin operations
Consider adding admin role checks for create/update/delete operations
