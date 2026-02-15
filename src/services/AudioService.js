/**
 * Audio Service
 * Manages background music with persistence
 */

import { storageService } from './StorageService.js';

export class AudioService {
    constructor() {
        this.audio = null;
        this.isMuted = false;
        this.isInitialized = false;
    }

    /**
     * Initializes the audio service
     * @param {HTMLAudioElement} audioElement - Audio element
     */
    init(audioElement) {
        if (this.isInitialized) return;

        this.audio = audioElement;

        // Load preferences
        const prefs = storageService.getAudioPreferences();
        this.isMuted = prefs.isMuted;

        // Apply muted state
        if (this.isMuted) {
            this.audio.volume = 0;
        }

        this.isInitialized = true;
    }

    /**
     * Plays the audio
     */
    play() {
        if (!this.audio) return;

        this.audio.play().catch(error => {
            console.log('Could not play audio:', error.message);
        });
    }

    /**
     * Pauses the audio
     */
    pause() {
        if (!this.audio) return;
        this.audio.pause();
    }

    /**
     * Stops the audio and resets
     */
    stop() {
        if (!this.audio) return;
        this.audio.pause();
        this.audio.currentTime = 0;
    }

    /**
     * Toggles mute state
     * @returns {boolean} New muted state
     */
    toggleMute() {
        if (!this.audio) return this.isMuted;

        this.isMuted = !this.isMuted;
        this.audio.volume = this.isMuted ? 0 : 1;

        // Save preference
        storageService.saveAudioPreferences({ isMuted: this.isMuted });

        return this.isMuted;
    }

    /**
     * Sets mute state
     * @param {boolean} muted
     */
    setMuted(muted) {
        if (!this.audio) return;

        this.isMuted = muted;
        this.audio.volume = muted ? 0 : 1;

        storageService.saveAudioPreferences({ isMuted: this.isMuted });
    }

    /**
     * Gets muted state
     * @returns {boolean}
     */
    isMutedState() {
        return this.isMuted;
    }

    /**
     * Sets volume
     * @param {number} volume - Volume level (0-1)
     */
    setVolume(volume) {
        if (!this.audio || this.isMuted) return;
        this.audio.volume = Math.max(0, Math.min(1, volume));
    }
}

// Export singleton instance
export const audioService = new AudioService();
