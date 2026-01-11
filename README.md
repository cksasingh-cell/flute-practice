# Sur Practice — Flute Practice App

A beautiful, minimalist web application for randomized flute sur practice. Upload your practice audio files to Google Drive and play them in random order for effective practice sessions.

![App Screenshot](https://via.placeholder.com/800x400/5a7d7c/ffffff?text=Sur+Practice)

## ✨ Features

- **Random Playback**: Plays selected audio files in shuffled order without immediate repetition
- **Google Drive Integration**: Securely store and stream your practice files from Google Drive
- **Clean, Zen Design**: Calming aesthetic perfect for focused practice
- **Continuous Playback**: Automatically moves to the next file when current file finishes
- **File Management**: Upload, select, and delete audio files easily
- **Progress Tracking**: Visual progress bar and time display
- **Keyboard Shortcuts**: Space to play/pause, right arrow to skip
- **Responsive Design**: Works beautifully on desktop, tablet, and mobile
- **Cross-Browser**: Compatible with Chrome, Firefox, Safari, and Edge

## 🎵 Supported Audio Formats

- MP3 (`.mp3`)
- WAV (`.wav`)
- M4A (`.m4a`)

## 🚀 Quick Start

### Prerequisites

- A Google account
- A GitHub account
- Basic knowledge of GitHub Pages

### Installation

1. **Fork or Clone this Repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/flute-practice-app.git
   cd flute-practice-app
   ```

2. **Set Up Google Cloud Project**

   Follow the [Google API Setup Guide](#google-api-setup) below to:
   - Create a Google Cloud Project
   - Enable Google Drive API
   - Create OAuth 2.0 credentials
   - Create an API key

3. **Configure the App**

   ```bash
   # Copy the example config file
   cp config.example.js config.js
   ```

   Edit `config.js` and add your credentials:
   ```javascript
   window.APP_CONFIG = {
       CLIENT_ID: 'your-client-id.apps.googleusercontent.com',
       API_KEY: 'your-api-key'
   };
   ```

4. **Deploy to GitHub Pages**

   - Push your code to GitHub (config.js won't be committed thanks to .gitignore)
   - Go to your repository Settings > Pages
   - Select your branch (usually `main`) and root directory
   - Save and wait for deployment

5. **Configure OAuth Redirect URLs**

   Go back to your Google Cloud Console and add your GitHub Pages URL to the authorized origins and redirect URIs:
   - `https://YOUR_USERNAME.github.io`
   - `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME`

6. **Access Your App**

   Visit `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME`

## 🔧 Google API Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Select a project" > "New Project"
3. Enter a project name (e.g., "Flute Practice App")
4. Click "Create"

### Step 2: Enable Google Drive API

1. In your project, go to "APIs & Services" > "Library"
2. Search for "Google Drive API"
3. Click on it and press "Enable"

### Step 3: Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. (Recommended) Click "Restrict Key":
   - Under "API restrictions", select "Restrict key"
   - Choose "Google Drive API" from the dropdown
   - Save

### Step 4: Create OAuth 2.0 Client ID

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in app name, user support email, and developer contact
   - Add scope: `https://www.googleapis.com/auth/drive.file`
   - Save and continue
4. Back to "Create OAuth client ID":
   - Application type: "Web application"
   - Name: "Flute Practice App"
   - Authorized JavaScript origins:
     - `http://localhost:8000` (for local testing)
     - `https://YOUR_USERNAME.github.io`
   - Authorized redirect URIs:
     - `http://localhost:8000`
     - `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME`
   - Click "Create"
5. Copy the Client ID

### Step 5: Update config.js

Paste your credentials into `config.js`:

```javascript
window.APP_CONFIG = {
    CLIENT_ID: 'paste-your-client-id-here.apps.googleusercontent.com',
    API_KEY: 'paste-your-api-key-here'
};
```

## 📖 Usage Guide

### First Time Setup

1. Open the app in your browser
2. Click "Connect Google Drive"
3. Sign in with your Google account
4. Grant permissions to access Google Drive
5. The app will create a folder called "Flute Practice Surs" in your Drive

### Uploading Files

1. Click the "Upload Files" button
2. Select one or more audio files (MP3, WAV, or M4A)
3. Wait for upload to complete
4. Files will appear in the list on the right

### Playing Practice Sessions

1. **Select Files**: Check the boxes next to the files you want to practice
   - Use "Select All" to select everything
   - Use "Deselect All" to clear selections
2. **Start Playing**: Click the large play button in the center
3. **Control Playback**:
   - Click play/pause button to pause/resume
   - Click skip button (or press right arrow) to skip to next file
   - Press spacebar to play/pause
4. Files will play in random order until all selected files have played
5. After all files play once, the app automatically reshuffles and continues

### Managing Files

- **Delete a file**: Click the trash icon next to any file
- **See what's playing**: The currently playing file is highlighted in the list
- **Track progress**: Watch the progress bar to see playback position

## ⌨️ Keyboard Shortcuts

- `Space` - Play/Pause
- `→` (Right Arrow) - Skip to next file

## 🔒 Privacy & Security

- Your credentials never leave your browser
- Audio files are stored in your personal Google Drive
- The app only accesses the specific folder it creates
- All authentication is handled by Google's secure OAuth 2.0
- No data is sent to any third-party servers

## 🛠️ Local Development

To test locally before deploying:

1. **Start a local server**:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   
   # Node.js (with npx)
   npx http-server -p 8000
   ```

2. **Open in browser**: `http://localhost:8000`

3. **Make sure** your Google OAuth credentials include `http://localhost:8000` in authorized origins

## 🐛 Troubleshooting

### "Authentication failed" error

- Check that your CLIENT_ID and API_KEY are correct in config.js
- Verify that your GitHub Pages URL is added to authorized origins in Google Cloud Console
- Make sure Google Drive API is enabled in your Google Cloud Project

### "Failed to load files" error

- Ensure you've granted the app permission to access Google Drive
- Check your internet connection
- Try signing out and signing in again

### Audio won't play

- Make sure the file format is supported (MP3, WAV, M4A)
- Check that at least one file is selected
- Try a different browser (Chrome recommended for best compatibility)
- Check browser console for error messages

### "Please configure your Google API credentials" message

- Make sure you've created a `config.js` file (not just config.example.js)
- Check that the file contains valid CLIENT_ID and API_KEY
- Clear browser cache and reload

### CORS errors

- This typically happens if trying to open index.html directly (file://)
- Always use a web server (locally or GitHub Pages)
- Make sure authorized origins match exactly (including https vs http)

## 📱 Browser Compatibility

Tested and working on:

- ✅ Chrome/Edge (latest)
- ✅ Safari (latest)
- ✅ Firefox (latest)
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

## 📂 Project Structure

```
flute-practice-app/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # All styles (zen-inspired design)
├── js/
│   ├── app.js             # Main application controller
│   ├── gdrive.js          # Google Drive API integration
│   └── audio-player.js    # Audio playback logic
├── config.example.js       # Configuration template
├── .gitignore             # Git ignore file
└── README.md              # This file
```

## 🎨 Design Philosophy

The app features a calm, zen-inspired design to create a peaceful practice environment:

- **Typography**: Elegant Cormorant Garamond for headings, clean DM Sans for body text
- **Colors**: Soothing earth tones with teal-green accents
- **Layout**: Generous white space, clear visual hierarchy
- **Animations**: Subtle, smooth transitions that don't distract
- **Accessibility**: WCAG AA compliant with proper focus states

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Designed for musicians who want to improve their practice routine
- Built with modern web technologies and Google Drive API
- Inspired by the needs of flute practitioners

## 💡 Tips for Effective Practice

- Start with a smaller selection of surs you're working on
- Gradually increase the number as you improve
- Listen carefully to pitch, rhythm, and tone quality
- Practice regularly - consistency is key!
- Use the randomization to test your familiarity

---

**Made with 🎵 for dedicated musicians**

For questions or support, please [open an issue](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/issues).
