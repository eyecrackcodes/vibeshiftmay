#!/bin/bash

# Script to deploy VibeShift to GitHub

# Initialize Git repository if not already initialized
if [ ! -d .git ]; then
  echo "Initializing Git repository..."
  git init
fi

# Add all files to Git
echo "Adding files to Git..."
git add .

# Commit changes
echo "Committing changes..."
read -p "Enter commit message (default: 'Initial commit'): " commit_message
commit_message=${commit_message:-"Initial commit"}
git commit -m "$commit_message"

# Set main branch
echo "Setting main branch..."
git branch -M main

# Add remote repository
echo "Adding remote repository..."
git remote add origin https://github.com/eyecrackcodes/vibeshiftmay.git

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main

echo "Deployment complete! Your code is now on GitHub."
echo "Visit: https://github.com/eyecrackcodes/vibeshiftmay" 