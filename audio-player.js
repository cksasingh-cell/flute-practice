/**
 * Audio Player Module
 * Handles random playback, shuffle logic, and playback controls
 */

const AudioPlayer = (function() {
    'use strict';
    
    let audioElement = null;
    let playlist = []; // All selected files
    let shuffledPlaylist = []; // Current shuffle order
    let currentIndex = -1;
    let isPlaying = false;
    let currentFile = null;
    
    /**
     * Fisher-Yates shuffle algorithm
     */
    function shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    /**
     * Initialize the audio player
     */
    function init(audioElementId) {
        audioElement = document.getElementById(audioElementId);
        
        if (!audioElement) {
            console.error('Audio element not found');
            return;
        }
        
        // Set up event listeners
        audioElement.addEventListener('ended', handleTrackEnd);
        audioElement.addEventListener('timeupdate', handleTimeUpdate);
        audioElement.addEventListener('error', handleError);
        audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
        
        console.log('Audio player initialized');
    }
    
    /**
     * Handle track end - automatically play next
     */
    function handleTrackEnd() {
        console.log('Track ended, playing next...');
        playNext();
    }
    
    /**
     * Handle time update for progress bar
     */
    function handleTimeUpdate() {
        if (audioElement && audioElement.duration) {
            const progress = (audioElement.currentTime / audioElement.duration) * 100;
            dispatchEvent('timeupdate', {
                currentTime: audioElement.currentTime,
                duration: audioElement.duration,
                progress: progress
            });
        }
    }
    
    /**
     * Handle metadata loaded
     */
    function handleLoadedMetadata() {
        dispatchEvent('loadedmetadata', {
            duration: audioElement.duration
        });
    }
    
    /**
     * Handle audio errors
     */
    function handleError(e) {
        console.error('Audio error:', e);
        let errorMessage = 'Error playing audio';
        
        if (audioElement.error) {
            switch (audioElement.error.code) {
                case 1:
                    errorMessage = 'Audio loading aborted';
                    break;
                case 2:
                    errorMessage = 'Network error loading audio';
                    break;
                case 3:
                    errorMessage = 'Audio format not supported';
                    break;
                case 4:
                    errorMessage = 'Audio source not found';
                    break;
            }
        }
        
        dispatchEvent('error', { message: errorMessage });
        
        // Try to play next track after error
        setTimeout(() => playNext(), 1000);
    }
    
    /**
     * Set the playlist (all selected files)
     */
    function setPlaylist(files) {
        playlist = files;
        
        // Create new shuffled playlist
        if (playlist.length > 0) {
            shuffledPlaylist = shuffle(playlist);
            currentIndex = -1;
        } else {
            shuffledPlaylist = [];
            currentIndex = -1;
        }
        
        console.log('Playlist set:', playlist.length, 'files');
    }
    
    /**
     * Update playlist while playing (when user changes selections)
     */
    function updatePlaylist(files) {
        playlist = files;
        
        // If currently playing file is no longer in playlist, it will finish
        // Then we'll create a new shuffle from remaining files
        
        // Remove deselected files from current shuffle
        shuffledPlaylist = shuffledPlaylist.filter(file => 
            playlist.some(f => f.id === file.id)
        );
        
        // If current file was removed and we're playing, stop after current track
        if (currentFile && !playlist.some(f => f.id === currentFile.id)) {
            console.log('Current file removed from playlist');
        }
    }
    
    /**
     * Play the next track in the shuffle
     */
    async function playNext() {
        if (playlist.length === 0) {
            stop();
            dispatchEvent('playlistempty', {});
            return;
        }
        
        // Move to next track
        currentIndex++;
        
        // If we've reached the end, reshuffle and start over
        if (currentIndex >= shuffledPlaylist.length) {
            console.log('Reshuffling playlist...');
            shuffledPlaylist = shuffle(playlist);
            currentIndex = 0;
            dispatchEvent('reshuffled', {});
        }
        
        currentFile = shuffledPlaylist[currentIndex];
        
        try {
            dispatchEvent('trackloading', { file: currentFile });
            
            // Get audio URL from Google Drive
            const audioUrl = GDrive.getFileUrl(currentFile.id);
            
            // Load and play
            audioElement.src = audioUrl;
            await audioElement.play();
            isPlaying = true;
            
            dispatchEvent('trackstart', { file: currentFile });
            
        } catch (error) {
            console.error('Error playing track:', error);
            dispatchEvent('error', { message: 'Could not play track: ' + currentFile.name });
            
            // Try next track
            setTimeout(() => playNext(), 1000);
        }
    }
    
    /**
     * Play/Resume
     */
    async function play() {
        if (playlist.length === 0) {
            dispatchEvent('error', { message: 'Please select at least one file' });
            return;
        }
        
        // If paused, resume
        if (audioElement.src && audioElement.paused) {
            try {
                await audioElement.play();
                isPlaying = true;
                dispatchEvent('resumed', {});
                return;
            } catch (error) {
                console.error('Error resuming:', error);
            }
        }
        
        // Otherwise, start new playback session
        playNext();
    }
    
    /**
     * Pause
     */
    function pause() {
        if (audioElement && !audioElement.paused) {
            audioElement.pause();
            isPlaying = false;
            dispatchEvent('paused', {});
        }
    }
    
    /**
     * Stop completely
     */
    function stop() {
        if (audioElement) {
            audioElement.pause();
            audioElement.src = '';
        }
        isPlaying = false;
        currentFile = null;
        currentIndex = -1;
        dispatchEvent('stopped', {});
    }
    
    /**
     * Skip to next track
     */
    function skip() {
        if (playlist.length === 0) return;
        playNext();
    }
    
    /**
     * Get current playback state
     */
    function getState() {
        return {
            isPlaying: isPlaying,
            currentFile: currentFile,
            currentTime: audioElement ? audioElement.currentTime : 0,
            duration: audioElement ? audioElement.duration : 0,
            playlistLength: playlist.length,
            currentIndex: currentIndex
        };
    }
    
    /**
     * Dispatch custom events
     */
    function dispatchEvent(eventName, detail) {
        const event = new CustomEvent('audioplayer:' + eventName, { detail });
        document.dispatchEvent(event);
    }
    
    /**
     * Format time in MM:SS
     */
    function formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Public API
    return {
        init: init,
        setPlaylist: setPlaylist,
        updatePlaylist: updatePlaylist,
        play: play,
        pause: pause,
        stop: stop,
        skip: skip,
        getState: getState,
        formatTime: formatTime,
        isPlaying: () => isPlaying,
        getCurrentFile: () => currentFile
    };
})();
