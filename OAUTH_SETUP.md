# 🔐 OAuth Login Setup Guide (Google + GitHub)

## ✅ What's Been Added

Your application now supports **three login methods**:
1. ✉️ Email & Password
2. 🔵 Google OAuth
3. 🐙 GitHub OAuth

---

## ⚙️ Configuration Steps

### 1️⃣ Enable GitHub Authentication in Firebase

**Step 1: Go to Firebase Console**
1. Visit https://console.firebase.google.com
2. Select your project
3. Go to **Authentication** → **Sign-in method**

**Step 2: Enable GitHub Provider**
1. Click on **GitHub** in the providers list
2. Toggle **"Enable"** to ON
3. You'll need to add:
   - **Authorization callback URL**
   - **Consumer Key (Client ID)**
   - **Consumer Secret (Client Secret)**

**Step 3: Get Firebase Callback URL**
- In the GitHub provider settings, copy the **Authorization callback URL**
- It looks like: `https://your-project-id.firebaseapp.com/__/auth/handler`

**Step 4: Configure GitHub OAuth App**
1. Go to https://github.com/settings/developers
2. Click **"New OAuth App"**
3. Fill in:
   ```
   Application name: Coolbros E-commerce
   Homepage URL: https://your-domain.com (or http://localhost:5173 for local dev)
   Authorization callback URL: (paste the Firebase URL from Step 3)
   ```
4. Click **"Register application"**

**Step 5: Get GitHub Credentials**
1. After registration, you'll see:
   - **Client ID** (copy this)
   - Click **"Generate a new client secret"** (copy this too!)

**Step 6: Add Credentials to Firebase**
1. Back in Firebase Console → GitHub provider
2. Paste:
   - **Client ID**: Your GitHub Client ID
   - **Client Secret**: Your GitHub Client Secret
3. Click **"Save"**

**Step 7: Enable Google Provider** (if not already enabled)
1. Click on **Google** in the providers list
2. Toggle **"Enable"** to ON
3. Add your support email
4. Click **"Save"**

---

## 🧪 Test Locally

Your app is already running! Just test it:

1. **Go to Login page:**
   http://localhost:5173/login

2. **You should see three options:**
   - Email & Password form
   - "Continue with Google" button
   - "Continue with GitHub" button

3. **Click "Continue with GitHub"**
   - You'll be redirected to GitHub login
   - Authorize the application
   - You'll be redirected back to your app
   - Success! 🎉

---

## 📝 How It Works

### First-Time GitHub Login:
1. User clicks "Continue with GitHub"
2. Redirected to GitHub for authentication
3. User authorizes your app
4. Firebase creates a new user account
5. User profile saved to Firestore automatically
6. User redirected back to your app

### Returning Users:
1. User clicks "Continue with GitHub"
2. Quick GitHub authentication
3. Firebase recognizes the user
4. Instant login - no re-authorization needed
5. User data loaded from Firestore

---

## 🔒 Security Features

✅ **Automatic user creation** in Firestore  
✅ **Role assignment** (customer by default)  
✅ **Email verification** (for email/password signups)  
✅ **Secure token handling** by Firebase  
✅ **No passwords stored** for OAuth users  

---

## 🌐 Production Deployment

When you deploy to production:

1. **Update GitHub OAuth App:**
   - Go to GitHub Settings → Developer Settings → OAuth Apps
   - Edit your app
   - Update **Homepage URL** to your production domain
   - The callback URL stays the same (Firebase handles it)

2. **Add production domain to Firebase:**
   - Firebase Console → Authentication → Settings
   - Add your domain to **Authorized domains**

---

## 🎨 Customization

### Change Button Styles
Edit these files:
- `src/pages/Login.jsx` (lines 129-164)
- `src/pages/Signup.jsx` (lines 203-235)

### Modify User Data Structure
Edit `src/firebase/auth.js`:
- `signInWithGithub()` function (line 58)
- `signInWithGoogle()` function (line 49)

---

## 🐛 Troubleshooting

### "Invalid callback URL" error
→ Make sure the callback URL in GitHub OAuth app matches exactly with Firebase

### "User already exists with different credentials"
→ This happens if someone used email/password first, then tries OAuth with the same email
→ Solution: Merge accounts manually or update security rules

### GitHub login works but no user data in Firestore
→ Check Firestore rules in Firebase
→ Make sure authenticated users can read/write their own data

### "Access blocked" or "App not verified"
→ For local testing, click "Advanced" → "Proceed to localhost (unsafe)"
→ For production, verify your app with Google/GitHub

---

## 📊 View Users in Firestore

After users log in:

1. Go to Firebase Console
2. Click **Firestore Database**
3. Open the `users` collection
4. See all users with their profiles!

Each user document contains:
```javascript
{
  uid: "github-or-google-uid",
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  displayName: "John Doe",
  role: "customer",
  isBlocked: false,
  createdAt: Timestamp
}
```

---

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Login page shows both Google and GitHub buttons
- ✅ Clicking GitHub redirects to github.com
- ✅ After authorization, user returns to your app logged in
- ✅ User appears in Firestore database
- ✅ No errors in browser console

---

## 📚 Resources

- [Firebase GitHub Auth Docs](https://firebase.google.com/docs/auth/web/github-auth)
- [Firebase Google Auth Docs](https://firebase.google.com/docs/auth/web/google-signin)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)

---

**Need Help?** Check the Firebase Console logs or browser console for detailed error messages!
