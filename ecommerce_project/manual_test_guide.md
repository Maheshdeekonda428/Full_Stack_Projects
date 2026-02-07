# Manual Testing Guide: Access & Refresh Tokens

Since you've set the Access Token to 1 min and Refresh Token to 5 mins, here is how to verify it manually:

### 1. Initial Login
1. Open your frontend in the browser (e.g., `http://localhost:5173`).
2. Log in with your admin credentials.
3. Open **Developer Tools** (F12 or Right-click > Inspect).
4. Go to the **Application** tab (Chrome/Edge) or **Storage** tab (Firefox).
5. In the left sidebar, click **Cookies** > `http://localhost:8000`.
   - ✅ You should see `refresh_token` with `HttpOnly` checked.
6. Click **Local Storage** > `http://localhost:5173`.
   - ✅ You should see `token` (this is the short-lived access token).

### 2. Verify Access Token Expiry (Wait 1 Minute)
1. Stay on the dashboard or profile page.
2. **Wait for 1 minute** (the access token will expire).
3. Try to click a button that fetches data (like "My Orders" or "Profile").
4. Watch the **Network** tab in DevTools:
   - 🔄 You should see a request to `/api/auth/refresh`.
   - ✅ It should return a `200 OK` with a **new** access token.
   - ✅ The original request should then retry and succeed.

### 3. Verify Refresh Token Expiry (Wait 5 Minutes)
1. **Wait for 5 minutes total** without activity.
2. Try to refresh the page or click a protected link.
3. Watch the **Network** tab:
   - 🔄 The request to `/api/auth/refresh` will now fail with `401 Unauthorized` (because the 5-min refresh token is dead).
   - ✅ Your frontend should automatically redirect you to the **Login** page.

### 4. Verify Logout
1. Log in again.
2. Click **Logout**.
3. Check the **Application > Cookies** tab.
   - ✅ The `refresh_token` cookie should be gone.
