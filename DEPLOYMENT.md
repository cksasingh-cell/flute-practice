# Deployment Guide

This guide will walk you through deploying the Flute Practice App to GitHub Pages step-by-step.

## Prerequisites

- GitHub account
- Google account
- Git installed on your computer (or use GitHub web interface)

## Part 1: Google Cloud Setup (20-30 minutes)

### Step 1: Create Google Cloud Project

1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Sign in with your Google account
3. Click the project dropdown at the top (next to "Google Cloud")
4. Click "NEW PROJECT"
5. Enter project name: `Flute Practice App`
6. Click "CREATE"
7. Wait for project creation (you'll see a notification)
8. Select your new project from the dropdown

### Step 2: Enable Google Drive API

1. In the left sidebar, click "APIs & Services" > "Library"
2. In the search bar, type "Google Drive API"
3. Click on "Google Drive API" in the results
4. Click the blue "ENABLE" button
5. Wait for it to enable (takes a few seconds)

### Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen" (left sidebar)
2. Select "External" user type
3. Click "CREATE"
4. Fill in the required fields:
   - **App name**: Flute Practice App
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click "SAVE AND CONTINUE"
6. On the "Scopes" page:
   - Click "ADD OR REMOVE SCOPES"
   - Filter for "drive"
   - Check the box for `.../auth/drive.file` scope
   - Click "UPDATE"
   - Click "SAVE AND CONTINUE"
7. On "Test users" page:
   - Click "ADD USERS"
   - Add your email address (you can add more later)
   - Click "ADD"
   - Click "SAVE AND CONTINUE"
8. Review and click "BACK TO DASHBOARD"

### Step 4: Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "CREATE CREDENTIALS" at the top
3. Select "API key"
4. An API key will be created - **copy it immediately** and save it somewhere safe
5. Click "RESTRICT KEY" (recommended for security):
   - Give it a name: "Flute Practice API Key"
   - Under "API restrictions":
     - Select "Restrict key"
     - Click "Select APIs" dropdown
     - Check "Google Drive API"
   - Click "SAVE"

### Step 5: Create OAuth 2.0 Client ID

1. Still in "APIs & Services" > "Credentials"
2. Click "CREATE CREDENTIALS" > "OAuth client ID"
3. Application type: Select "Web application"
4. Name: `Flute Practice Web Client`
5. **Authorized JavaScript origins**:
   - Click "ADD URI"
   - For local testing: `http://localhost:8000`
   - Click "ADD URI" again
   - For GitHub Pages: `https://YOUR_GITHUB_USERNAME.github.io`
     (Replace YOUR_GITHUB_USERNAME with your actual GitHub username)
6. **Authorized redirect URIs**:
   - Click "ADD URI"
   - Add: `http://localhost:8000`
   - Click "ADD URI"
   - Add: `https://YOUR_GITHUB_USERNAME.github.io/flute-practice-app`
     (Replace with your GitHub username and repository name)
7. Click "CREATE"
8. A dialog will show your Client ID - **copy it** and save it somewhere safe
9. Click "OK"

### Important: Save These Credentials

You now have two important credentials:
- **API Key**: AIza... (starts with AIza)
- **Client ID**: ...apps.googleusercontent.com (ends with .apps.googleusercontent.com)

Save these securely - you'll need them in the next part!

## Part 2: GitHub Repository Setup (10 minutes)

### Option A: Using GitHub Web Interface (Easier)

1. Go to [GitHub](https://github.com)
2. Click the "+" icon in the top right > "New repository"
3. Repository name: `flute-practice-app`
4. Description: "Random sur practice application for flute"
5. Choose "Public" (required for free GitHub Pages)
6. Check "Add a README file"
7. Click "Create repository"
8. In your new repository, click "Add file" > "Create new file"
9. Create the following files one by one (copy from the project):
   - `index.html`
   - `css/styles.css` (note: include the css/ folder)
   - `js/app.js`
   - `js/gdrive.js`
   - `js/audio-player.js`
   - `config.js`
   - `.gitignore`
   
   For each file:
   - Enter the filename (e.g., `css/styles.css`)
   - Paste the content
   - Scroll down and click "Commit new file"

### Option B: Using Git (Command Line)

```bash
# Clone this repository or download it
git clone https://github.com/YOUR_SOURCE/flute-practice-app.git
cd flute-practice-app

# Create a new repository on GitHub first, then:
git remote set-url origin https://github.com/YOUR_USERNAME/flute-practice-app.git

# Add your credentials to config.js (see next section)

# Commit and push
git add .
git commit -m "Initial commit"
git push -u origin main
```

## Part 3: Configure Your App (5 minutes)

### Edit config.js

1. In your GitHub repository, click on `config.js`
2. Click the pencil icon (Edit this file)
3. Replace the placeholder values:

```javascript
window.APP_CONFIG = {
    CLIENT_ID: 'paste-your-client-id-here.apps.googleusercontent.com',
    API_KEY: 'paste-your-api-key-here',
    FOLDER_NAME: 'Flute Practice Surs'
};
```

4. Paste your actual credentials from Part 1
5. Scroll down and click "Commit changes"

**Security Note**: The config.js file with your credentials will be public. This is OK because:
- These are client-side credentials meant to be public
- The API Key is restricted to Google Drive API only
- OAuth requires user consent before accessing their data
- The credentials can only access files the user explicitly grants permission to

However, if you prefer, you can:
- Keep the repository private (but you'll need GitHub Pro for Pages)
- Use environment variables (requires a build step)

## Part 4: Enable GitHub Pages (5 minutes)

1. In your repository, click "Settings" (top right)
2. In the left sidebar, scroll down to "Pages"
3. Under "Source":
   - Select "Deploy from a branch"
   - Branch: Select `main`
   - Folder: Select `/ (root)`
4. Click "Save"
5. Wait 1-2 minutes for deployment
6. Refresh the page - you should see a URL like:
   `https://YOUR_USERNAME.github.io/flute-practice-app/`
7. Click "Visit site" to open your app

## Part 5: Update Google OAuth Settings (5 minutes)

Now that you have your GitHub Pages URL, update your Google Cloud settings:

1. Go back to [Google Cloud Console](https://console.cloud.google.com)
2. Select your "Flute Practice App" project
3. Go to "APIs & Services" > "Credentials"
4. Click on your OAuth 2.0 Client ID
5. Under "Authorized JavaScript origins":
   - Make sure your GitHub Pages URL is there
   - Example: `https://yourusername.github.io`
6. Under "Authorized redirect URIs":
   - Make sure your full app URL is there
   - Example: `https://yourusername.github.io/flute-practice-app`
7. Click "SAVE"

**Important**: Changes to OAuth settings can take 5-10 minutes to propagate!

## Part 6: Test Your App (5 minutes)

1. Open your GitHub Pages URL
2. Click "Connect Google Drive"
3. Sign in with your Google account
4. You should see a consent screen asking for permission
5. Click "Allow"
6. The app should now show "Connected" status
7. Try uploading a test audio file
8. Select it and press play!

## Troubleshooting Deployment Issues

### "Authentication failed" Error

**Cause**: OAuth credentials not configured correctly

**Solutions**:
1. Double-check CLIENT_ID in config.js matches Google Cloud Console
2. Verify your GitHub Pages URL is in authorized origins (exact match)
3. Wait 5-10 minutes for Google changes to propagate
4. Clear browser cache and try again
5. Check browser console (F12) for specific error messages

### "Please configure your Google API credentials" Message

**Cause**: config.js not loaded or has invalid format

**Solutions**:
1. Verify config.js exists in your repository root
2. Check for JavaScript syntax errors in config.js
3. Make sure you replaced the placeholder values
4. Check browser console for loading errors

### Page Shows 404 Error

**Cause**: GitHub Pages not properly configured

**Solutions**:
1. Wait a few minutes for initial deployment
2. Check Settings > Pages shows "Your site is live at..."
3. Verify branch is set to `main` and folder to `/ (root)`
4. Make sure index.html is in the repository root
5. Check repository is public

### Files Not Uploading to Google Drive

**Cause**: Insufficient permissions or API not enabled

**Solutions**:
1. Verify Google Drive API is enabled in Cloud Console
2. Check OAuth consent screen is configured
3. Make sure you granted permission when signing in
4. Try signing out and signing in again
5. Check if you're signed in with a different Google account

### Audio Won't Play

**Cause**: File format or CORS issues

**Solutions**:
1. Verify file is MP3, WAV, or M4A format
2. Try a different browser (Chrome recommended)
3. Check browser console for error messages
4. Make sure file uploaded successfully to Google Drive
5. Try with a smaller file first

## Local Testing Before Deployment

To test locally before deploying to GitHub Pages:

1. **Start a local web server**:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Or Python 2
   python -m SimpleHTTPServer 8000
   ```

2. **Open browser**: http://localhost:8000

3. **Make sure** your OAuth settings include:
   - Authorized origin: `http://localhost:8000`
   - Redirect URI: `http://localhost:8000`

4. Test all features locally before pushing to GitHub

## Updating Your Deployed App

To make changes after initial deployment:

### Using GitHub Web Interface:
1. Navigate to the file you want to edit
2. Click the pencil icon
3. Make your changes
4. Commit changes
5. Wait 1-2 minutes for redeployment

### Using Git:
```bash
# Make your changes locally
git add .
git commit -m "Description of changes"
git push origin main
```

GitHub Pages will automatically rebuild and redeploy your site.

## Security Best Practices

1. **Never commit sensitive data** to the repository
2. **Monitor your Google Cloud Console** for unexpected API usage
3. **Restrict your API key** to only Google Drive API
4. **Use test users** during development in OAuth consent screen
5. **Regularly review** OAuth consent screen settings

## Need Help?

If you encounter issues not covered here:

1. Check the main [README.md](README.md) troubleshooting section
2. Search existing [GitHub Issues](https://github.com/YOUR_USERNAME/flute-practice-app/issues)
3. Create a new issue with:
   - Detailed description of the problem
   - Browser and OS information
   - Screenshot of any error messages
   - Steps to reproduce the issue

## Success Checklist

Before considering your deployment complete, verify:

- [ ] Google Cloud project created
- [ ] Google Drive API enabled
- [ ] OAuth consent screen configured
- [ ] API Key created and restricted
- [ ] OAuth Client ID created
- [ ] GitHub repository created
- [ ] All files committed to repository
- [ ] config.js updated with real credentials
- [ ] GitHub Pages enabled
- [ ] OAuth settings include GitHub Pages URL
- [ ] App loads without errors
- [ ] Authentication works
- [ ] File upload works
- [ ] Audio playback works
- [ ] Mobile responsive design works

Congratulations! Your Flute Practice App is now deployed! 🎉🎵
