# Admin Account Setup & Management Guide

This document provides step-by-step instructions to create an administrative user, link their account in the database, and access the store management dashboard.

---

## 1. Overview of Admin Architecture

The administration portal at `/admin` employs a secure, two-factor authorization model:

1. **Authentication (Supabase Auth)**:
   * The user enters their email and password on `/admin/login`.
   * Credentials are authenticated directly via Supabase Auth (`supabase.auth.signInWithPassword`).
   * Supabase sets a cryptographically secure session cookie.

2. **Authorization (`public.admin_users` table)**:
   * [middleware.js](file:///c:/Users/rajesh/OneDrive/Desktop/New%20folder/middleware.js) and [lib/services/auth.js](file:///c:/Users/rajesh/OneDrive/Desktop/New%20folder/lib/services/auth.js) intercept all `/admin/*` and `/api/admin/*` requests.
   * The system verifies that the authenticated user's `id` (UUID) exists in the `admin_users` table with `role = 'admin'` or `role = 'superadmin'`.
   * If an authenticated user is NOT in `admin_users`, they are redirected to `/admin/unauthorized`.
   * Unauthenticated visitors are redirected to `/admin/login?next=/admin`.

---

## 2. Step-by-Step: Creating an Admin User

### Step 1: Create the User in Supabase Authentication

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project.
3. In the left-hand navigation sidebar, click on **Authentication** (icon with users).
4. Click on the **Users** tab.
5. Click the **Add user** button (top right) $\rightarrow$ select **Create user**.
6. Fill in the modal:
   * **User Email**: (e.g. `admin@mobilestore.com`)
   * **User Password**: Enter a strong password
   * **Auto Confirm User?**: Ensure this checkbox is **checked** (so email verification is not required for your admin account).
7. Click **Create user**.

---

### Step 2: Copy the User's UUID

1. In the **Authentication $\rightarrow$ Users** table, locate the newly created user.
2. In the **User UID** column, click the copy icon to copy the UUID (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).

---

### Step 3: Grant Admin Privileges in SQL Editor

1. In the left-hand sidebar of your Supabase dashboard, click on **SQL Editor**.
2. Click **New query** (or open a blank editor).
3. Paste the following SQL statement, replacing `<USER_UUID_FROM_STEP_2>` and `<USER_EMAIL>` with your actual values:

```sql
-- Insert the admin record linked to auth.users
INSERT INTO public.admin_users (id, email, role)
VALUES (
  '<USER_UUID_FROM_STEP_2>',
  'admin@mobilestore.com',
  'admin' -- or 'superadmin'
)
ON CONFLICT (id) DO UPDATE
SET role = EXCLUDED.role, email = EXCLUDED.email;
```

4. Click **Run** (or press `Ctrl+Enter`).
5. Confirm that the query returns `Success. No rows returned` or `INSERT 0 1`.

---

## 3. Logging into the Admin Portal

1. Start or ensure your Next.js development server is running (`npm run dev`).
2. Navigate to [http://localhost:3000/admin/login](http://localhost:3000/admin/login).
3. Enter your administrative email and password.
4. Click **Sign In to Dashboard**.
5. You will be redirected directly to the store dashboard at [http://localhost:3000/admin](http://localhost:3000/admin).

---

## 4. Admin Portal Capabilities

Once logged in, you have full control over the store:

* **Dashboard Overview (`/admin`)**:
  * Real-time metrics: Total Revenue, Total Mobiles, Total Orders, Order Status Breakdown, and New Customer Inquiries.
  * Recent activity feeds for orders and customer inquiries.

* **Product Management (`/admin/mobiles`)**:
  * Browse, search, filter, and sort catalog items.
  * Toggle **Visibility** (Hide/Show products).
  * Toggle **Featured** status (Featured products appear on the homepage).
  * **Add New Device (`/admin/mobiles/new`)**: Upload product specifications (Brand, Model, Pricing, Storage, RAM, Processor, Display, Camera, Battery, Description, Stock Status, and up to 5 Image URLs).
  * **Edit Device (`/admin/mobiles/[id]`)**: Update device specs, stock status, or pricing.

* **Order Management (`/admin/orders`)**:
  * View all customer orders.
  * Open order details (`/admin/orders/[id]`) to inspect customer address, phone number, and line-item snapshots.
  * Update order lifecycle status (`pending` $\rightarrow$ `confirmed` $\rightarrow$ `processing` $\rightarrow$ `shipped` $\rightarrow$ `delivered` $\rightarrow$ `cancelled`).

* **Inquiry Management (`/admin/inquiries`)**:
  * Review customer support submissions.
  * Update inquiry status (`new` $\rightarrow$ `read` $\rightarrow$ `resolved`).

---

## 5. Troubleshooting & FAQ

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| Redirected to `/admin/unauthorized` | The user authenticated successfully, but their UUID is missing from `public.admin_users`. | Run the SQL query in Step 3 to insert the user's UUID into `admin_users`. |
| "Invalid email or password" on login | Wrong password or user not created in Supabase Auth. | Check Supabase Auth $\rightarrow$ Users and reset the password if needed. |
| Redirected to `/admin/login` when visiting `/admin` | Session has expired or user is unauthenticated. | Sign in with valid admin credentials. |
