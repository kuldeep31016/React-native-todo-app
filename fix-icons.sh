#!/bin/bash

echo "🔧 Fixing Icons - Rebuilding App..."
echo ""

# Step 1: Stop Metro if running
echo "📦 Step 1: Stopping Metro Bundler..."
pkill -f "react-native start" || echo "Metro not running"

# Step 2: Clean Android build
echo "🧹 Step 2: Cleaning Android build..."
cd android
./gradlew clean
cd ..

# Step 3: Remove build folders
echo "🗑️  Step 3: Removing build folders..."
rm -rf android/app/build
rm -rf android/build

# Step 4: Verify fonts are present
echo "✅ Step 4: Verifying fonts..."
if [ -f "android/app/src/main/assets/fonts/MaterialIcons.ttf" ]; then
    echo "✅ MaterialIcons.ttf found!"
else
    echo "❌ MaterialIcons.ttf NOT found! Linking fonts..."
    npx react-native-asset
fi

# Step 5: Rebuild
echo "🔨 Step 5: Rebuilding app..."
echo "This may take a few minutes..."
npx react-native run-android

echo ""
echo "✅ Done! Icons should now be visible."
echo "If icons still don't show, try:"
echo "  1. Close the app completely"
echo "  2. Uninstall and reinstall the app"
echo "  3. Run: adb uninstall com.todoapp && npx react-native run-android"

