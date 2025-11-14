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
    // Tasks collection - users can only access their own tasks
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && 
        (request.resource.data.userId == request.auth.uid || 
         resource.data.userId == request.auth.uid);
    }
    
    // Users collection - users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Categories collection - users can only access their own categories
    match /categories/{categoryId} {
      allow read, write: if request.auth != null && 
        (request.resource.data.userId == request.auth.uid || 
         resource.data.userId == request.auth.uid);
    }
  }
}
```

3. Click "Publish"

## Step 7: Enable Firestore Indexes (if needed)

If you see index errors in the console, Firebase will provide links to create the required indexes. Click those links to create them automatically.

## Verification Checklist

- [ ] `google-services.json` is in `android/app/` directory
- [ ] Google Sign-In is enabled in Firebase Console
- [ ] Web Client ID is configured in `src/services/auth.ts`
- [ ] Firestore database is created
- [ ] Firestore security rules are configured
- [ ] Package name matches: `com.todoapp`

## Troubleshooting

### Google Sign-In not working
- Verify `google-services.json` is in the correct location
- Check that Web Client ID is correctly set
- Ensure Google Sign-In is enabled in Firebase Console
- Make sure SHA-1 fingerprint is added to Firebase (for release builds)

### Firestore permission denied
- Check security rules are published
- Verify user is authenticated
- Check that `userId` field matches authenticated user's UID

### Build errors
- Clean build: `cd android && ./gradlew clean`
- Rebuild: `cd android && ./gradlew assembleDebug`

