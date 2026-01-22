# Admin Login Setup Guide

## ✅ What's Been Implemented

### 1. Admin Login Page (`/admin/login`)
- Beautiful, secure login page with email/password authentication
- Automatic redirect if already logged in
- Error handling and user feedback
- Redirects to intended page after login

### 2. Middleware Protection (`src/middleware.ts`)
- Automatically protects all `/admin/*` routes
- Redirects unauthenticated users to `/admin/login`
- Checks admin privileges before allowing access
- Works at the edge for maximum security

### 3. Admin Layout Protection (`src/app/admin/layout.tsx`)
- Client-side authentication check
- Shows loading state while verifying access
- Redirects to login if not authenticated
- Prevents unauthorized access

### 4. Admin Access Check API (`src/app/api/admin/check-access/route.ts`)
- Server-side verification of admin status
- Multiple methods to check admin access:
  1. User metadata (`user_metadata.role === 'admin'`)
  2. Environment variable email list (`ADMIN_EMAILS`)
  3. Database roles table (commented out, ready to use)

### 5. Logout Functionality
- Added logout button in admin navbar
- Properly clears session and redirects to login

## 🔧 Configuration Required

### Step 1: Add Admin Emails to Environment Variables

Add this to your `.env` file:

```env
# Admin Access Configuration
# Comma-separated list of admin email addresses
ADMIN_EMAILS=admin@yourdomain.com,another-admin@yourdomain.com
```

**Important**: Replace with your actual admin email addresses.

### Step 2: Set Admin Role in Supabase (Alternative Method)

If you prefer using user metadata instead of email list:

1. Go to Supabase Dashboard → Authentication → Users
2. Find your admin user
3. Click "Edit User"
4. In "Raw User Meta Data", add:
   ```json
   {
     "role": "admin"
   }
   ```
   Or:
   ```json
   {
     "isAdmin": true
   }
   ```

### Step 3: Create Admin User in Supabase

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" → "Create new user"
3. Enter admin email and password
4. Set user metadata (if using metadata method):
   ```json
   {
     "role": "admin",
     "name": "Admin User"
   }
   ```
5. Or add email to `ADMIN_EMAILS` in `.env` (if using email list method)

## 🔐 How Admin Access Works

The system checks admin access in this order:

1. **User Metadata Check**: 
   - `user_metadata.role === 'admin'`
   - `user_metadata.isAdmin === true`
   - `user_metadata.admin === true`

2. **Email List Check**:
   - Checks if user email is in `ADMIN_EMAILS` environment variable

3. **Database Check** (Optional):
   - Uncomment code in `src/app/api/admin/check-access/route.ts`
   - Requires a `user_roles` table with `user_id` and `role` columns

## 🚀 Usage

### Accessing Admin Panel

1. Navigate to any `/admin/*` route (e.g., `/admin/dashboard`)
2. If not logged in, you'll be redirected to `/admin/login`
3. Enter admin email and password
4. After successful login, you'll be redirected to the intended page

### Logging Out

1. Click on your avatar in the top-right corner of admin panel
2. Click "Log out"
3. You'll be redirected to login page

## 🛡️ Security Features

1. **Middleware Protection**: All admin routes are protected at the edge
2. **Server-Side Verification**: Admin status is verified on the server
3. **Session Management**: Uses Supabase Auth for secure session handling
4. **Automatic Redirects**: Unauthorized users are automatically redirected
5. **Error Handling**: Proper error messages without exposing sensitive info

## 📝 Notes

- The login page is excluded from admin layout (no sidebar/navbar)
- Middleware runs before page loads for maximum security
- Admin access is checked on both client and server side
- You can use either email list OR user metadata (or both)

## ⚠️ Important

1. **Never commit `.env` file** - It contains sensitive information
2. **Use strong passwords** for admin accounts
3. **Limit admin emails** - Only add trusted email addresses
4. **Regularly review** admin access in Supabase dashboard

## 🔄 Testing

1. Try accessing `/admin/dashboard` without logging in → Should redirect to login
2. Log in with non-admin account → Should show "Access denied"
3. Log in with admin account → Should access admin panel
4. Click logout → Should redirect to login page

## 🐛 Troubleshooting

### "Access denied" even with admin email
- Check `ADMIN_EMAILS` in `.env` matches exactly (case-insensitive)
- Or set user metadata `role: "admin"` in Supabase

### Redirect loop
- Clear browser cookies
- Check middleware is not blocking login page
- Verify Supabase auth is working

### Can't log in
- Check Supabase user exists
- Verify email/password are correct
- Check browser console for errors
