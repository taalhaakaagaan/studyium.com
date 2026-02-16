#!/bin/bash
# studyium.app - Launcher script

# Navigate to the application directory
APP_DIR="/home/fatih/Public/studyium.app"
cd "$APP_DIR" || exit 1

# Check if node_modules exists, install if not
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Run the electron development mode
echo "Starting Studyium App..."
npm run electron-dev
