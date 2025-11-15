# Firestore Security Rules

## ⚠️ IMPORTANT: Copy these rules to Firebase Console

Go to Firebase Console → Firestore Database → Rules and paste these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the resource
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
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

## How to Apply These Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `to-do-8415a`
3. Go to **Firestore Database** → **Rules** tab
4. Delete the existing rules
5. Paste the rules above
6. Click **Publish**

## What These Rules Do

- ✅ **Tasks**: Users can only create, read, update, and delete their own tasks
- ✅ **Users**: Users can only access their own profile data
- ✅ **Categories**: Users can only manage their own categories
- ✅ **Security**: All operations require authentication
- ✅ **Data Isolation**: Users cannot access other users' data

## Testing

After applying these rules:
1. Sign in to your app
2. Try creating a task
3. It should work without permission errors

