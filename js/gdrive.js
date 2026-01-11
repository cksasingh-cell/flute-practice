/**
 * Google Drive API Integration
 * Handles authentication, file upload, retrieval, and deletion
 */

const GDrive = (function() {
    'use strict';
    
    const FOLDER_NAME = 'Flute Practice Surs';
    const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
    const SCOPES = 'https://www.googleapis.com/auth/drive.file';
    
    let isAuthenticated = false;
    let folderId = null;
    let tokenClient = null;
    let gapiInited = false;
    let gisInited = false;
    
    /**
     * Wait for global objects to be available
     */
    function waitForGlobals() {
        return new Promise((resolve) => {
            const checkGlobals = setInterval(() => {
                if (typeof gapi !== 'undefined' && typeof google !== 'undefined') {
                    clearInterval(checkGlobals);
                    resolve();
                }
            }, 100);
        });
    }
    
    /**
     * Initialize Google API client
     */
    async function initGapi() {
        await waitForGlobals();
        return new Promise((resolve, reject) => {
            gapi.load('client', async () => {
                try {
                    await gapi.client.init({
                        apiKey: window.APP_CONFIG.API_KEY,
                        discoveryDocs: DISCOVERY_DOCS,
                    });
                    gapiInited = true;
                    console.log('GAPI initialized');
                    resolve();
                } catch (error) {
                    console.error('Error initializing GAPI:', error);
                    reject(error);
                }
            });
        });
    }
    
    /**
     * Initialize Google Identity Services
     */
    async function initGis() {
        await waitForGlobals();
        return new Promise((resolve) => {
            tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: window.APP_CONFIG.CLIENT_ID,
                scope: SCOPES,
                callback: '', // Will be set during handleAuth
            });
            gisInited = true;
            console.log('GIS initialized');
            resolve();
        });
    }
    
    /**
     * Handle authentication
     */
    function handleAuth() {
        return new Promise((resolve, reject) => {
            if (!gapiInited || !gisInited) {
                reject(new Error('Google APIs not initialized'));
                return;
            }
            
            tokenClient.callback = async (response) => {
                if (response.error !== undefined) {
                    reject(response);
                    return;
                }
                
                isAuthenticated = true;
                
                // Save token to localStorage
                try {
                    localStorage.setItem('gdrive_token', gapi.client.getToken().access_token);
                } catch (e) {
                    console.warn('Could not save token to localStorage:', e);
                }
                
                resolve();
            };
            
            // Check if we have a saved token
            const savedToken = localStorage.getItem('gdrive_token');
            if (savedToken) {
                gapi.client.setToken({ access_token: savedToken });
                
                // Verify token is still valid
                gapi.client.drive.about.get({ fields: 'user' })
                    .then(() => {
                        isAuthenticated = true;
                        resolve();
                    })
                    .catch(() => {
                        // Token invalid, request new one
                        localStorage.removeItem('gdrive_token');
                        tokenClient.requestAccessToken({ prompt: 'consent' });
                    });
            } else {
                tokenClient.requestAccessToken({ prompt: 'consent' });
            }
        });
    }
    
    /**
     * Sign out
     */
    function signOut() {
        const token = gapi.client.getToken();
        if (token !== null) {
            google.accounts.oauth2.revoke(token.access_token);
            gapi.client.setToken('');
            localStorage.removeItem('gdrive_token');
        }
        isAuthenticated = false;
        folderId = null;
    }
    
    /**
     * Find or create the practice folder
     */
    async function ensureFolder() {
        if (folderId) return folderId;
        
        try {
            // Search for existing folder
            const response = await gapi.client.drive.files.list({
                q: `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
                fields: 'files(id, name)',
                spaces: 'drive'
            });
            
            if (response.result.files && response.result.files.length > 0) {
                folderId = response.result.files[0].id;
                console.log('Found existing folder:', folderId);
                return folderId;
            }
            
            // Create new folder
            const folderMetadata = {
                name: FOLDER_NAME,
                mimeType: 'application/vnd.google-apps.folder'
            };
            
            const folder = await gapi.client.drive.files.create({
                resource: folderMetadata,
                fields: 'id'
            });
            
            folderId = folder.result.id;
            console.log('Created new folder:', folderId);
            return folderId;
            
        } catch (error) {
            console.error('Error ensuring folder:', error);
            throw error;
        }
    }
    
    /**
     * Upload a file to Google Drive
     */
    async function uploadFile(file, onProgress) {
        const folder = await ensureFolder();
        
        const metadata = {
            name: file.name,
            mimeType: file.type,
            parents: [folder]
        };
        
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', file);
        
        const token = gapi.client.getToken().access_token;
        
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable && onProgress) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    onProgress(percentComplete);
                }
            });
            
            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response);
                } else {
                    reject(new Error(`Upload failed: ${xhr.statusText}`));
                }
            });
            
            xhr.addEventListener('error', () => {
                reject(new Error('Upload failed'));
            });
            
            xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart');
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            xhr.send(form);
        });
    }
    
    /**
     * List all audio files in the practice folder
     */
    async function listFiles() {
        const folder = await ensureFolder();
        
        try {
            const response = await gapi.client.drive.files.list({
                q: `'${folder}' in parents and trashed=false and (mimeType='audio/mpeg' or mimeType='audio/wav' or mimeType='audio/x-m4a' or mimeType='audio/mp4')`,
                fields: 'files(id, name, mimeType, size, webContentLink)',
                orderBy: 'name',
                pageSize: 100
            });
            
            return response.result.files || [];
        } catch (error) {
            console.error('Error listing files:', error);
            throw error;
        }
    }
    
    /**
     * Delete a file from Google Drive
     */
    async function deleteFile(fileId) {
        try {
            await gapi.client.drive.files.delete({
                fileId: fileId
            });
            console.log('File deleted:', fileId);
            return true;
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }
    
    /**
     * Get a download URL for a file
     */
    function getFileUrl(fileId) {
        const token = gapi.client.getToken().access_token;
        return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&access_token=${token}`;
    }
    
    /**
     * Download file content as blob (for audio playback)
     */
    async function downloadFile(fileId) {
        const url = getFileUrl(fileId);
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Download failed: ${response.statusText}`);
            }
            return await response.blob();
        } catch (error) {
            console.error('Error downloading file:', error);
            throw error;
        }
    }
    
    // Public API
    return {
        init: async function() {
            await initGapi();
            await initGis();
        },
        
        authenticate: handleAuth,
        signOut: signOut,
        isAuthenticated: () => isAuthenticated,
        
        uploadFile: uploadFile,
        listFiles: listFiles,
        deleteFile: deleteFile,
        getFileUrl: getFileUrl,
        downloadFile: downloadFile
    };
})();
