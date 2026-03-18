# 🚀 Firebase Quick Setup Guide

## ⚠️ IMPORTANT: You Need Your Own Firebase Project!

The current Firebase project in the code doesn't exist. Follow these steps to set up your own.

---

## 📋 Step-by-Step Setup

### **1️⃣ Create Firebase Project**

1. Go to https://console.firebase.google.com
2. Click **"Add project"**
3. Enter project name: `textile-ecommerce` (or any name)
4. Click **Continue** → **Create project**
5. Wait for creation → Click **Continue**

---

### **2️⃣ Add Web App to Firebase**

1. Click the **web icon (`</>`)** in "Your apps" section
2. Enter app nickname: `Coolbros Web`
3. **Copy the `firebaseConfig`** object shown
4. It will look like:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXX",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123def456"
   };
   ```

---

### **3️⃣ Update Your Code**

Open `src/firebase/config.js` and replace the config with YOUR values:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
}
```

**Replace each placeholder with the actual values from Firebase!**

---

### **4️⃣ Enable Authentication Methods**

1. In Firebase Console → **Authentication** → **Sign-in method**

2. **Enable Email/Password:**
   - Click "Email/Password"
   - Toggle **Enable**
   - Click **Save**

3. **Enable Google Sign-In:**
   - Click "Google"
   - Toggle **Enable**
   - Add support email
   - Click **Save**

4. **Enable GitHub Sign-In:**
   - Click "GitHub"
   - Toggle **Enable**
   - Copy the **Authorization callback URL**
   - Click **Save**

---

### **5️⃣ Configure GitHub OAuth**

1. Go to https://github.com/settings/developers

2. Click **"New OAuth App"**

3. Fill in:
   ```
   Application name: Coolbros E-commerce
   Homepage URL: http://localhost:5173
   Authorization callback URL: [paste from Firebase]
   ```

4. Click **"Register application"**

5. Copy:
   - **Client ID**
   - Generate & copy **Client Secret**

6. Back in **Firebase Console** → Authentication → Sign-in method → GitHub
   - Paste Client ID
   - Paste Client Secret
   - Click **Save**

---

### **6️⃣ Set Up Firestore Database**

1. In Firebase Console → Click **"Firestore Database"**

2. Click **"Create database"**

3. Choose **Start in test mode** (for development)

4. Select location → Click **Enable**

---

### **7️⃣ Restart Your App**

After updating the config file:

```bash
# Stop the current dev server (Ctrl+C)
# Then restart:
npm run dev
```

---

### **8️⃣ Test Login**

1. Go to http://localhost:5173/login
2. Try signing up with email/password
3. Check if user appears in Firebase Console → Authentication

---

## ✅ Checklist

```
☐ Created Firebase project
☐ Added web app and copied config
☐ Updated src/firebase/config.js with real values
☐ Enabled Email/Password auth
☐ Enabled Google auth
☐ Enabled GitHub auth
☐ Created GitHub OAuth app
☐ Added GitHub credentials to Firebase
☐ Created Firestore database
☐ Tested login/signup
```

---

## 🔍 How to Verify It Works

1. **Sign up with email/password**
   - Should create account successfully
   
2. **Check Firebase Console → Authentication**
   - Should see your user listed

3. **Try "Continue with Google"**
   - Should redirect to Google login
   - After authorization, should return logged in

4. **Try "Continue with GitHub"**
   - Should redirect to GitHub login
   - After authorization, should return logged in

---

## 🆘 Troubleshooting

### "Invalid API key"
→ You didn't copy the config correctly. Double-check every value in `config.js`

### "App not found"
→ Make sure `projectId` matches your actual Firebase project ID

### "Auth/provider-not-enabled"
→ You forgot to enable the provider in Firebase Console

### Still seeing Firebase errors?
→ Check browser console (F12) for specific error messages

---

## 📞 Need Help?

1. Check browser console (F12) for errors
2. Verify all config values match Firebase Console
3. Make sure Authentication is enabled in Firebase
4. Check that Firestore database exists

---

**Next Steps:**
- Once Firebase is working, you can set up Grafana monitoring
- Push your changes to GitHub (but NOT the config file with real keys!)
