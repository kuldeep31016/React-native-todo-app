# Firebase Setup Guide

This guide will help you set up Firebase for the Todo App.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

## Step 2: Add Android App

1. In Firebase Console, click the Android icon to add an Android app
2. Enter package name: `com.todoapp`
3. Download `google-services.json`
4. Place the file in `android/app/` directory

## Step 3: Enable Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Google** sign-in provider
3. Add your project's support email
4. Save the changes

## Step 4: Get Web Client ID

1. In Firebase Console, go to **Authentication** > **Sign-in method** > **Google**
2. Copy the **Web client ID** (not the Android client ID)
3. Open `src/services/auth.ts`
4. Replace `webClientId: ''` with your Web Client ID:
   ```typescript
   GoogleSignin.configure({
     webClientId: 'YOUR_WEB_CLIENT_ID_HERE',
     offlineAccess: true,
   });
   ```

## Step 5: Set Up Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Start in **test mode** (we'll add security rules next)
4. Choose a location for your database

## Step 6: Configure Firestore Security Rules

1. In Firebase Console, go to **Firestore Database** > **Rules**
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Tasks Collection - Users can only access their own tasks
    match /tasks/{taskId} {
      // Allow read if user is authenticated and owns the task
      allow read: if isAuthenticated() && 
        (resource == null || resource.data.userId == request.auth.uid);
      
      // Allow create if user is authenticated and sets their own userId
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid;
      
      // Allow update if user is authenticated and owns the task
      allow update: if isAuthenticated() && 
        resource.data.userId == request.auth.uid &&
        request.resource.data.userId == request.auth.uid;
      
      // Allow delete if user is authenticated and owns the task
      allow delete: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
    }
    
    // Users Collection - Users can only access their own profile
    match /users/{userId} {
      // Allow read if user is authenticated and accessing their own profile
      allow read: if isAuthenticated() && request.auth.uid == userId;
      
      // Allow write if user is authenticated and accessing their own profile
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Categories Collection - Users can only access their own categories
    match /categories/{categoryId} {
      // Allow read if user is authenticated and owns the category
      allow read: if isAuthenticated() && 
        (resource == null || resource.data.userId == request.auth.uid);
      
      // Allow create if user is authenticated and sets their own userId
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid;
      
      // Allow update if user is authenticated and owns the category
      allow update: if isAuthenticated() && 
        resource.data.userId == request.auth.uid &&
        request.resource.data.userId == request.auth.uid;
      
      // Allow delete if user is authenticated and owns the category
      allow delete: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

3. Click "Publish"

## Step 7: Add SHA-1 Certificate Fingerprint (CRITICAL for Google Sign-In)

**This step is ESSENTIAL to fix DEVELOPER_ERROR!**

The DEVELOPER_ERROR occurs when SHA-1 fingerprint is not added to Firebase. Follow these steps:

### Get Debug SHA-1 Fingerprint:
1. Open terminal in your project root
2. Navigate to android directory:
   ```bash
   cd android
   ```
3. Run this command to get your debug SHA-1:
   ```bash
   ./gradlew signingReport
   ```
4. Look for the SHA-1 fingerprint in the output (under `Variant: debug`)
5. Copy the SHA-1 fingerprint (it looks like: `AA:BB:CC:DD:EE:FF:...`)

### Add SHA-1 to Firebase:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on the **gear icon** (⚙️) next to "Project Overview"
4. Select **Project Settings**
5. Scroll down to **Your apps** section
6. Find your Android app (`com.todoapp`)
7. Click **Add fingerprint** button
8. Paste your SHA-1 fingerprint
9. Click **Save**

### For Release Build (when building APK):
1. Generate a keystore file (if you haven't already)
2. Get SHA-1 from your release keystore:
   ```bash
   keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
   ```
3. Add this SHA-1 to Firebase as well

**Important:** After adding SHA-1, wait 2-5 minutes for changes to propagate, then try signing in again.

## Step 8: Enable Firestore Indexes (if needed)

If you see index errors in the console, Firebase will provide links to create the required indexes. Click those links to create them automatically.

## Verification Checklist

- [ ] `google-services.json` is in `android/app/` directory
- [ ] Google Sign-In is enabled in Firebase Console
- [ ] Web Client ID is configured in `src/services/auth.ts`
- [ ] **SHA-1 certificate fingerprint is added to Firebase (CRITICAL!)**
- [ ] Firestore database is created
- [ ] Firestore security rules are configured
- [ ] Package name matches: `com.todoapp`

## Troubleshooting

### Google Sign-In DEVELOPER_ERROR (Most Common Issue)
**This is the #1 cause of Google Sign-In failures!**

**Solution:**
1. Get your SHA-1 fingerprint (see Step 7 above)
2. Add it to Firebase Console > Project Settings > Your apps > Android app
3. Wait 2-5 minutes after adding
4. Try signing in again

**Quick SHA-1 Command:**
```bash
cd android && ./gradlew signingReport
```
Look for SHA-1 under "Variant: debug" in the output.

### Google Sign-In not working
- **First:** Make sure SHA-1 fingerprint is added (see Step 7)
- Verify `google-services.json` is in `android/app/` directory
- Check that Web Client ID is correctly set in `src/services/auth.ts`
- Ensure Google Sign-In is enabled in Firebase Console
- Try signing out and signing in again after adding SHA-1

### Firestore permission denied
- Check security rules are published
- Verify user is authenticated
- Check that `userId` field matches authenticated user's UID

### Build errors
- Clean build: `cd android && ./gradlew clean`
- Rebuild: `cd android && ./gradlew assembleDebug`

