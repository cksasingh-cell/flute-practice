/**
 * Configuration Template
 * 
 * IMPORTANT: Copy this file to 'config.js' and add your actual Google API credentials
 * DO NOT commit config.js with real credentials to version control
 */

window.APP_CONFIG = {
    CLIENT_ID: '744375413516-216ck8kv3r786p4s0fre7ujkfrnm6ji8.apps.googleusercontent.com',
    API_KEY: 'AIzaSyAiFYIbHSCLBVV6wJv5jT0T2a9FGmF_tMY',
    FOLDER_NAME: 'Flute Practice Surs'
};

/**
 * Setup Instructions:
 * 
 * 1. Go to https://console.cloud.google.com
 * 2. Create a new project or select an existing one
 * 3. Enable the Google Drive API
 * 4. Go to "Credentials" in the left sidebar
 * 
 * For API Key:
 * - Click "Create Credentials" > "API Key"
 * - Copy the key and paste it above as API_KEY
 * - Restrict the key to Google Drive API (recommended)
 * 
 * For OAuth Client ID:
 * - Click "Create Credentials" > "OAuth client ID"
 * - Choose "Web application"
 * - Add authorized JavaScript origins:
 *   - http://localhost:8000 (for local testing)
 *   - https://YOUR_USERNAME.github.io (for GitHub Pages)
 * - Add authorized redirect URIs:
 *   - http://localhost:8000 (for local testing)
 *   - https://YOUR_USERNAME.github.io/YOUR_REPO_NAME (for GitHub Pages)
 * - Copy the Client ID and paste it above as CLIENT_ID
 * 
 * 5. Save this file as 'config.js' (not config.example.js)
 * 6. Make sure config.js is listed in .gitignore
 */
