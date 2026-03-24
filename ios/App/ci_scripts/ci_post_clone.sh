#!/bin/sh

# Xcode Cloud post-clone script
# Installs node_modules so Capacitor SPM local package references resolve

cd "$CI_PRIMARY_REPOSITORY_PATH"
npm ci
