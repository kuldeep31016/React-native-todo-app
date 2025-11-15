# 🚨 Quick Fix for Icons Not Showing

## The Problem
Icons are showing as red boxes or not visible at all. This happens because the app needs to be **completely rebuilt** after linking fonts.

## ✅ Solution - Run These Commands

### Option 1: Use the Fix Script (Easiest)
```bash
./fix-icons.sh
```

### Option 2: Manual Steps

1. **Stop Metro Bundler** (Press `Ctrl+C` in terminal)

2. **Uninstall the app from emulator**:
   ```bash
   adb uninstall com.todoapp
   ```

3. **Clean everything**:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   rm -rf android/app/build
   rm -rf android/build
   ```

4. **Rebuild and install**:
   ```bash
   npx react-native run-android
   ```

### Option 3: Using Android Studio

1. Open Android Studio
2. Open the `android` folder
3. **Build** → **Clean Project**
4. **Build** → **Rebuild Project**
5. **Run** → **Run 'app'**

## ⚠️ Important Notes

- **You MUST uninstall the old app** before rebuilding
- **You MUST clean the build** before rebuilding
- The fonts are already linked - you just need to rebuild

## 🔍 Verify Fonts Are Linked

Check if fonts exist:
```bash
ls android/app/src/main/assets/fonts/MaterialIcons.ttf
```

If this file exists, fonts are linked correctly. You just need to rebuild!

## ✅ After Rebuild

1. The app will reinstall automatically
2. All icons should now be visible:
   - ✅ Delete icons (red trash)
   - ✅ Check icons
   - ✅ All MaterialIcons

## 🆘 Still Not Working?

If icons still don't show after rebuild:

1. **Check Metro Bundler is running**:
   ```bash
   npm start
   ```

2. **Reload the app** (Press `R` twice in emulator)

3. **Check console for errors**:
   ```bash
   adb logcat | grep -i "icon\|font"
   ```

4. **Try clearing cache**:
   ```bash
   npm start -- --reset-cache
   ```

