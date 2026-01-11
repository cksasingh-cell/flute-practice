/**
 * Main Application Controller
 * Coordinates UI, Google Drive, and Audio Player
 */

(function() {
    'use strict';
    
    // State
    let files = [];
    let selectedFiles = new Set();
    
    // UI Elements
    const elements = {
        authBtn: document.getElementById('authBtn'),
        uploadBtn: document.getElementById('uploadBtn'),
        fileInput: document.getElementById('fileInput'),
        selectAllBtn: document.getElementById('selectAllBtn'),
        deselectAllBtn: document.getElementById('deselectAllBtn'),
        playPauseBtn: document.getElementById('playPauseBtn'),
        skipBtn: document.getElementById('skipBtn'),
        fileList: document.getElementById('fileList'),
        currentFileName: document.getElementById('currentFileName'),
        currentTime: document.getElementById('currentTime'),
        totalTime: document.getElementById('totalTime'),
        progressFill: document.getElementById('progressFill'),
        statusMessage: document.getElementById('statusMessage'),
        loadingOverlay: document.getElementById('loadingOverlay')
    };
    
    /**
     * Initialize the application
     */
    async function init() {
        console.log('Initializing application...');
        
        // Check if config exists
        if (!window.APP_CONFIG || !window.APP_CONFIG.CLIENT_ID) {
            showStatus('error', 'Please configure your Google API credentials in config.js');
            return;
        }
        
        // Initialize audio player
        AudioPlayer.init('audioPlayer');
        
        // Set up event listeners
        setupEventListeners();
        setupAudioPlayerEvents();
        
        // Initialize Google Drive API
        try {
            showLoading('Initializing Google Drive API...');
            await GDrive.init();
            hideLoading();
            console.log('Google Drive API initialized');
        } catch (error) {
            hideLoading();
            showStatus('error', 'Failed to initialize Google Drive API: ' + error.message);
            console.error('Init error:', error);
        }
        
        // Load saved state
        loadSavedState();
    }
    
    /**
     * Set up UI event listeners
     */
    function setupEventListeners() {
        // Authentication
        elements.authBtn.addEventListener('click', handleAuth);
        
        // File upload
        elements.uploadBtn.addEventListener('click', () => {
            elements.fileInput.click();
        });
        
        elements.fileInput.addEventListener('change', handleFileUpload);
        
        // Selection controls
        elements.selectAllBtn.addEventListener('click', selectAll);
        elements.deselectAllBtn.addEventListener('click', deselectAll);
        
        // Playback controls
        elements.playPauseBtn.addEventListener('click', togglePlayPause);
        elements.skipBtn.addEventListener('click', () => AudioPlayer.skip());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboard);
    }
    
    /**
     * Set up audio player event listeners
     */
    function setupAudioPlayerEvents() {
        document.addEventListener('audioplayer:trackstart', (e) => {
            const file = e.detail.file;
            console.log('Track started:', file.name);
            elements.currentFileName.textContent = file.name;
            elements.currentFileName.classList.add('pulse');
            setTimeout(() => elements.currentFileName.classList.remove('pulse'), 500);
            updatePlayingIndicator(file.id);
            elements.playPauseBtn.classList.add('playing');
        });
        
        document.addEventListener('audioplayer:paused', () => {
            elements.playPauseBtn.classList.remove('playing');
        });
        
        document.addEventListener('audioplayer:resumed', () => {
            elements.playPauseBtn.classList.add('playing');
        });
        
        document.addEventListener('audioplayer:stopped', () => {
            elements.currentFileName.textContent = 'Select files to begin';
            elements.playPauseBtn.classList.remove('playing');
            updatePlayingIndicator(null);
        });
        
        document.addEventListener('audioplayer:timeupdate', (e) => {
            const { currentTime, duration, progress } = e.detail;
            elements.currentTime.textContent = AudioPlayer.formatTime(currentTime);
            elements.totalTime.textContent = AudioPlayer.formatTime(duration);
            elements.progressFill.style.width = progress + '%';
        });
        
        document.addEventListener('audioplayer:loadedmetadata', (e) => {
            elements.totalTime.textContent = AudioPlayer.formatTime(e.detail.duration);
        });
        
        document.addEventListener('audioplayer:error', (e) => {
            showStatus('error', e.detail.message);
        });
        
        document.addEventListener('audioplayer:playlistempty', () => {
            showStatus('info', 'Please select at least one file to play');
        });
    }
    
    /**
     * Handle authentication
     */
    async function handleAuth() {
        if (GDrive.isAuthenticated()) {
            // Sign out
            GDrive.signOut();
            updateAuthButton(false);
            clearFileList();
            showStatus('info', 'Signed out successfully');
        } else {
            // Sign in
            try {
                showLoading('Connecting to Google Drive...');
                await GDrive.authenticate();
                hideLoading();
                updateAuthButton(true);
                showStatus('success', 'Connected to Google Drive');
                
                // Load files
                await loadFiles();
            } catch (error) {
                hideLoading();
                showStatus('error', 'Authentication failed: ' + error.message);
                console.error('Auth error:', error);
            }
        }
    }
    
    /**
     * Update authentication button state
     */
    function updateAuthButton(isAuthenticated) {
        if (isAuthenticated) {
            elements.authBtn.classList.add('authenticated');
            elements.authBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 11 12 14 22 4"></polyline>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                <span>Connected</span>
            `;
            elements.uploadBtn.disabled = false;
            elements.selectAllBtn.disabled = false;
            elements.deselectAllBtn.disabled = false;
        } else {
            elements.authBtn.classList.remove('authenticated');
            elements.authBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10 17 15 12 10 7"></polyline>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                <span>Connect Google Drive</span>
            `;
            elements.uploadBtn.disabled = true;
            elements.selectAllBtn.disabled = true;
            elements.deselectAllBtn.disabled = true;
        }
    }
    
    /**
     * Load files from Google Drive
     */
    async function loadFiles() {
        try {
            showLoading('Loading your sur files...');
            const driveFiles = await GDrive.listFiles();
            hideLoading();
            
            files = driveFiles;
            console.log('Loaded files:', files.length);
            
            renderFileList();
            
            if (files.length === 0) {
                showEmptyState();
            }
        } catch (error) {
            hideLoading();
            showStatus('error', 'Failed to load files: ' + error.message);
            console.error('Load files error:', error);
        }
    }
    
    /**
     * Handle file upload
     */
    async function handleFileUpload(e) {
        const filesToUpload = Array.from(e.target.files);
        
        if (filesToUpload.length === 0) return;
        
        console.log('Uploading', filesToUpload.length, 'files...');
        
        for (let i = 0; i < filesToUpload.length; i++) {
            const file = filesToUpload[i];
            
            try {
                showLoading(`Uploading ${file.name} (${i + 1}/${filesToUpload.length})...`);
                
                await GDrive.uploadFile(file, (progress) => {
                    console.log(`Upload progress: ${Math.round(progress)}%`);
                });
                
                console.log('Uploaded:', file.name);
                
            } catch (error) {
                console.error('Upload error:', error);
                showStatus('error', `Failed to upload ${file.name}: ${error.message}`);
            }
        }
        
        hideLoading();
        showStatus('success', `Uploaded ${filesToUpload.length} file(s)`);
        
        // Reload file list
        await loadFiles();
        
        // Clear file input
        e.target.value = '';
    }
    
    /**
     * Render file list
     */
    function renderFileList() {
        if (files.length === 0) {
            showEmptyState();
            return;
        }
        
        elements.fileList.innerHTML = '';
        
        files.forEach((file, index) => {
            const fileItem = createFileItem(file, index);
            elements.fileList.appendChild(fileItem);
        });
    }
    
    /**
     * Create file item element
     */
    function createFileItem(file, index) {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.dataset.fileId = file.id;
        
        const isSelected = selectedFiles.has(file.id);
        
        item.innerHTML = `
            <input type="checkbox" ${isSelected ? 'checked' : ''} data-file-id="${file.id}">
            <div class="file-item-content">
                <div class="file-item-name">${file.name}</div>
                <div class="playing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
            <button class="delete-button" aria-label="Delete file">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        `;
        
        // Checkbox change handler
        const checkbox = item.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', (e) => {
            handleFileSelection(file.id, e.target.checked);
        });
        
        // Delete button handler
        const deleteBtn = item.querySelector('.delete-button');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleDeleteFile(file);
        });
        
        // Click on item to toggle checkbox
        item.addEventListener('click', (e) => {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
                checkbox.checked = !checkbox.checked;
                handleFileSelection(file.id, checkbox.checked);
            }
        });
        
        return item;
    }
    
    /**
     * Handle file selection
     */
    function handleFileSelection(fileId, isSelected) {
        if (isSelected) {
            selectedFiles.add(fileId);
        } else {
            selectedFiles.delete(fileId);
        }
        
        // Update audio player playlist
        const selected = files.filter(f => selectedFiles.has(f.id));
        
        if (AudioPlayer.isPlaying()) {
            AudioPlayer.updatePlaylist(selected);
        } else {
            AudioPlayer.setPlaylist(selected);
        }
        
        // Save to localStorage
        saveState();
        
        console.log('Selected files:', selectedFiles.size);
    }
    
    /**
     * Handle file deletion
     */
    async function handleDeleteFile(file) {
        const confirmed = confirm(`Delete "${file.name}"?`);
        if (!confirmed) return;
        
        try {
            showLoading('Deleting file...');
            await GDrive.deleteFile(file.id);
            hideLoading();
            
            showStatus('success', 'File deleted');
            
            // Remove from selection
            selectedFiles.delete(file.id);
            
            // Reload files
            await loadFiles();
            
            // Update playlist
            const selected = files.filter(f => selectedFiles.has(f.id));
            AudioPlayer.updatePlaylist(selected);
            
        } catch (error) {
            hideLoading();
            showStatus('error', 'Failed to delete file: ' + error.message);
            console.error('Delete error:', error);
        }
    }
    
    /**
     * Select all files
     */
    function selectAll() {
        files.forEach(file => selectedFiles.add(file.id));
        renderFileList();
        
        const selected = files.filter(f => selectedFiles.has(f.id));
        AudioPlayer.setPlaylist(selected);
        saveState();
    }
    
    /**
     * Deselect all files
     */
    function deselectAll() {
        selectedFiles.clear();
        renderFileList();
        
        if (AudioPlayer.isPlaying()) {
            AudioPlayer.updatePlaylist([]);
        } else {
            AudioPlayer.setPlaylist([]);
        }
        
        saveState();
    }
    
    /**
     * Toggle play/pause
     */
    function togglePlayPause() {
        if (AudioPlayer.isPlaying()) {
            AudioPlayer.pause();
        } else {
            const selected = files.filter(f => selectedFiles.has(f.id));
            AudioPlayer.setPlaylist(selected);
            AudioPlayer.play();
        }
    }
    
    /**
     * Update playing indicator in file list
     */
    function updatePlayingIndicator(fileId) {
        document.querySelectorAll('.file-item').forEach(item => {
            if (item.dataset.fileId === fileId) {
                item.classList.add('playing');
            } else {
                item.classList.remove('playing');
            }
        });
    }
    
    /**
     * Show empty state
     */
    function showEmptyState() {
        elements.fileList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
                <p>Upload your first audio file to begin</p>
            </div>
        `;
    }
    
    /**
     * Clear file list
     */
    function clearFileList() {
        files = [];
        selectedFiles.clear();
        showEmptyState();
    }
    
    /**
     * Handle keyboard shortcuts
     */
    function handleKeyboard(e) {
        // Spacebar for play/pause (unless typing in input)
        if (e.code === 'Space' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            togglePlayPause();
        }
        
        // Arrow right for skip
        if (e.code === 'ArrowRight' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            AudioPlayer.skip();
        }
    }
    
    /**
     * Show status message
     */
    function showStatus(type, message) {
        elements.statusMessage.textContent = message;
        elements.statusMessage.className = 'status-message ' + type + ' show';
        
        setTimeout(() => {
            elements.statusMessage.classList.remove('show');
        }, 5000);
    }
    
    /**
     * Show loading overlay
     */
    function showLoading(message) {
        const loadingText = document.getElementById('loadingText');
        if (loadingText) {
            loadingText.textContent = message;
        }
        elements.loadingOverlay.classList.remove('hidden');
    }
    
    /**
     * Hide loading overlay
     */
    function hideLoading() {
        elements.loadingOverlay.classList.add('hidden');
    }
    
    /**
     * Save state to localStorage
     */
    function saveState() {
        try {
            localStorage.setItem('selectedFiles', JSON.stringify(Array.from(selectedFiles)));
        } catch (e) {
            console.warn('Could not save state:', e);
        }
    }
    
    /**
     * Load saved state from localStorage
     */
    function loadSavedState() {
        try {
            const saved = localStorage.getItem('selectedFiles');
            if (saved) {
                const savedIds = JSON.parse(saved);
                selectedFiles = new Set(savedIds);
            }
        } catch (e) {
            console.warn('Could not load saved state:', e);
        }
    }
    
    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
