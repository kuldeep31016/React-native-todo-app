#!/bin/bash
echo "Clearing welcome screen flag..."
adb shell run-as com.todoapp rm /data/data/com.todoapp/files/RCTAsyncLocalStorage_V1/ || echo "Trying alternative method..."
adb shell pm clear com.todoapp
echo "✅ App data cleared! Restart the app to see welcome screen."
