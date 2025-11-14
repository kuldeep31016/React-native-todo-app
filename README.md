# React Native TODO Application

A feature-rich TODO application built with React Native CLI, Firebase, and Google Sign-In authentication. Optimized for Android with a modern, clean UI/UX and smooth animations.

## Features

### 🔐 Authentication
- Google Sign-In integration
- Session persistence
- User profile management

### ✅ Task Management
- **Create Tasks**: Title, description, due date, priority, and category
- **Read Tasks**: Beautiful card-based list view with filtering and sorting
- **Update Tasks**: Edit any task field, mark as complete/incomplete
- **Delete Tasks**: Swipe to delete with confirmation

### 🎯 Advanced Features
- **Task Categories**: Personal, Work, Shopping, Health, and custom categories
- **Priority Levels**: High, Medium, Low with color coding
- **Filtering**: All, Active, Completed, Overdue
- **Sorting**: By due date, priority, created date, or alphabetical
- **Search**: Real-time task search
- **Due Date Management**: Date and time pickers with visual indicators
- **Statistics Dashboard**: Task completion rates, category breakdown, priority analysis
- **Dark Mode**: System-based or manual theme toggle
- **Offline Support**: Local storage with Firebase sync

### 🎨 UI/UX
- Modern, clean design
- Smooth animations with React Native Reanimated
- Pull-to-refresh functionality
- Empty states with helpful messages
- Toast notifications
- Loading states
- Error handling

## Technical Stack

- **Framework**: React Native CLI 0.82.1
- **Language**: TypeScript
- **Backend**: Firebase (Firestore, Authentication)
- **Authentication**: Google Sign-In
- **State Management**: React Context API
- **Navigation**: React Navigation v7
- **UI Components**: Custom components with React Native Paper styling
- **Icons**: React Native Vector Icons
- **Animations**: React Native Reanimated
- **Storage**: AsyncStorage for offline support

## Prerequisites

- Node.js >= 20
- React Native development environment set up
- Android Studio and Android SDK
- Firebase project with Authentication and Firestore enabled
- Google Sign-In configured in Firebase Console

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kuldeep31016/React-native-todo-app.git
   cd React-native-todo-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication and select Google Sign-In method
   - Create a Firestore database
   - Add an Android app to your Firebase project
   - Download `google-services.json` from Firebase Console
   - Place `google-services.json` in `android/app/` directory
   - Get your Web Client ID from Firebase Console > Authentication > Sign-in method > Google
   - Update `src/services/auth.ts` with your Web Client ID:
     ```typescript
     GoogleSignin.configure({
       webClientId: 'YOUR_WEB_CLIENT_ID_HERE',
       offlineAccess: true,
     });
     ```

4. **Firestore Security Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /tasks/{taskId} {
         allow read, write: if request.auth != null && request.resource.data.userId == request.auth.uid;
       }
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       match /categories/{categoryId} {
         allow read, write: if request.auth != null && request.resource.data.userId == request.auth.uid;
       }
     }
   }
   ```

## Running the App

### Android

1. **Start Metro bundler**
   ```bash
   npm start
   ```

2. **Run on Android device/emulator**
   ```bash
   npm run android
   ```

   Or use Android Studio to build and run the app.

## Building APK

### Debug APK

```bash
cd android
./gradlew assembleDebug
```

The APK will be located at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK (Signed)

1. **Generate a signing key** (one-time setup)
   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure signing in `android/app/build.gradle`**
   ```gradle
   android {
       ...
       signingConfigs {
           release {
               storeFile file('my-release-key.keystore')
               storePassword 'YOUR_STORE_PASSWORD'
               keyAlias 'my-key-alias'
               keyPassword 'YOUR_KEY_PASSWORD'
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
               ...
           }
       }
   }
   ```

3. **Build release APK**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

   The APK will be located at: `android/app/build/outputs/apk/release/app-release.apk`

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable components (LoadingSpinner, EmptyState)
│   ├── task/            # Task-related components (TaskCard)
│   └── auth/            # Auth-related components
├── screens/
│   ├── AuthScreen.tsx
│   ├── HomeScreen.tsx
│   ├── AddTaskScreen.tsx
│   ├── TaskDetailScreen.tsx
│   ├── SettingsScreen.tsx
│   └── StatisticsScreen.tsx
├── navigation/
│   └── AppNavigator.tsx
├── services/
│   ├── firebase.ts
│   ├── auth.ts
│   └── firestore.ts
├── context/
│   ├── AuthContext.tsx
│   ├── TaskContext.tsx
│   └── ThemeContext.tsx
├── utils/
│   ├── helpers.ts
│   └── constants.ts
└── theme/
    └── colors.ts
```

## Firebase Data Structure

### Tasks Collection
```
tasks/
  {taskId}/
    userId: string
    title: string
    description: string
    completed: boolean
    priority: 'high' | 'medium' | 'low'
    category: string
    dueDate: timestamp (optional)
    createdAt: timestamp
    updatedAt: timestamp
```

### Users Collection
```
users/
  {userId}/
    profile: {
      name: string
      email: string
      photoURL: string (optional)
      createdAt: timestamp
    }
    settings: {
      theme: 'light' | 'dark' | 'system'
      notifications: boolean
    }
```

### Categories Collection
```
categories/
  {categoryId}/
    userId: string
    name: string
    color: string
    icon: string (optional)
```

## Features in Detail

### Task Filtering
- **All**: Shows all tasks
- **Active**: Shows only incomplete tasks
- **Completed**: Shows only completed tasks
- **Overdue**: Shows incomplete tasks past their due date

### Task Sorting
- **Due Date**: Sorted by due date (earliest first)
- **Priority**: Sorted by priority (high to low)
- **Created Date**: Sorted by creation time (newest first)
- **Alphabetical**: Sorted by title (A-Z)

### Priority System
- **High** (Red): Urgent tasks requiring immediate attention
- **Medium** (Orange): Important tasks
- **Low** (Green): Regular tasks

### Dark Mode
- System-based theme detection
- Manual toggle in settings
- Smooth theme transitions

### Offline Support
- Tasks are cached locally using AsyncStorage
- Automatic sync when connection is restored
- Offline indicator (can be added)

## Troubleshooting

### Google Sign-In Issues
- Ensure `google-services.json` is in `android/app/` directory
- Verify Web Client ID is correctly configured
- Check that Google Sign-In is enabled in Firebase Console

### Build Issues
- Clean build: `cd android && ./gradlew clean`
- Clear Metro cache: `npm start -- --reset-cache`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Firebase Connection Issues
- Verify Firestore rules are correctly set
- Check network connectivity
- Ensure Firebase project is active

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Author

Built with ❤️ by Kuldeep Raj

## Support

For issues and questions, please open an issue on GitHub.

---

**Note**: Remember to add your `google-services.json` file and configure your Web Client ID before running the app. Do not commit sensitive files to version control.
