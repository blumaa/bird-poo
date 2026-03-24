#!/bin/sh

# Xcode Cloud post-clone script
# Installs Node.js via Homebrew, then installs node_modules
# so Capacitor SPM local package references resolve

export HOMEBREW_NO_INSTALL_CLEANUP=TRUE
brew install node

cd "$CI_PRIMARY_REPOSITORY_PATH"
npm ci
