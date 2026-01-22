# Admin User Credentials

## 🔐 Default Admin Credentials

**Email**: `admin@alfajer.com`  
**Password**: `Admin@Alfajer2024!`

⚠️ **IMPORTANT**: Change this password immediately after first login!

## 📋 Setup Instructions

### Option 1: Create via Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to your project: `065f9dca-b87d8002-d-alfajer-new`
3. Go to **Authentication** → **Users**
4. Click **"Add User"** → **"Create new user"**
5. Fill in:
   - **Email**: `admin@alfajer.com`
   - **Password**: `Admin@Alfajer2024!`
   - **Auto Confirm User**: ✅ (checked)
6. Click **"Create User"**

### Step 2: Set Admin Role

After creating the user, run this SQL in **SQL Editor**:

```sql
UPDATE auth.users
SET 
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
  jsonb_build_object(
    'role', 'admin',
    'isAdmin', true,
    'name', 'Admin User'
  )
WHERE email = 'admin@alfajer.com';
```

### Step 3: Verify Admin Access

Run this to verify:

```sql
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data->>'isAdmin' as is_admin
FROM auth.users
WHERE email = 'admin@alfajer.com';
```

You should see:
- `role`: `admin`
- `is_admin`: `true`

## 🚀 Alternative: Use Environment Variable

If you prefer using email list instead of metadata:

1. Add to your `.env` file:
   ```env
   ADMIN_EMAILS=admin@alfajer.com
   ```

2. No need to set user metadata in this case.

## ✅ Testing

1. Go to `/admin/login`
2. Enter:
   - Email: `admin@alfajer.com`
   - Password: `Admin@Alfajer2024!`
3. You should be redirected to `/admin/dashboard`

## 🔒 Security Recommendations

1. **Change Password Immediately**: Use a strong, unique password
2. **Enable 2FA**: If available in Supabase
3. **Use Email List Method**: Add `ADMIN_EMAILS` to `.env` for easier management
4. **Regular Audits**: Review admin users periodically
5. **Limit Admin Count**: Only create admin users when necessary

## 📝 Notes

- The password `Admin@Alfajer2024!` meets strong password requirements:
  - At least 8 characters ✅
  - Contains uppercase ✅
  - Contains lowercase ✅
  - Contains numbers ✅
  - Contains special characters ✅

- You can create additional admin users by:
  1. Creating user in Supabase Dashboard
  2. Running the UPDATE SQL with their email
  3. Or adding their email to `ADMIN_EMAILS` in `.env`
