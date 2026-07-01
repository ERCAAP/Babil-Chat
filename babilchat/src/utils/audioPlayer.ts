import AsyncStorage from '@react-native-async-storage/async-storage';
import Sound from 'react-native-sound';
import { getVerseAudioUrl } from './quranDatabase';

// Audio Player Configuration
export interface AudioPlayerConfig {
  volume: number;
  playbackRate: number;
  autoPlay: boolean;
  repeatMode: 'none' | 'verse' | 'surah';
  downloadOffline: boolean;
}

export interface AudioPlayerState {
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  currentReciter: string;
  currentSurah: number;
  currentVerse: number;
  error: string | null;
}

export interface ReciterInfo {
  id: string;
  name: string;
  arabicName: string;
  audioBaseUrl: string;
  language: string;
  recitationStyle: 'hafs' | 'warsh' | 'other';
}

// Storage keys
const AUDIO_CONFIG_KEY = 'audio_player_config';
const DOWNLOADED_AUDIO_KEY = 'downloaded_audio_files';
const PLAYBACK_POSITION_KEY = 'playback_position';

// Initialize Sound
Sound.setCategory('Playback');

// Default configuration
const DEFAULT_CONFIG: AudioPlayerConfig = {
  volume: 0.8,
  playbackRate: 1.0,
  autoPlay: false,
  repeatMode: 'none',
  downloadOffline: false,
};

// Audio Player Class
export class QuranAudioPlayer {
  private sound: Sound | null = null;
  private state: AudioPlayerState = {
    isPlaying: false,
    isPaused: false,
    isLoading: false,
    currentTime: 0,
    duration: 0,
    currentReciter: 'mishary',
    currentSurah: 1,
    currentVerse: 1,
    error: null,
  };
  private config: AudioPlayerConfig = DEFAULT_CONFIG;
  private listeners: ((state: AudioPlayerState) => void)[] = [];
  private progressInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadConfig();
  }

  // Configuration Management
  private async loadConfig(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(AUDIO_CONFIG_KEY);
      if (stored) {
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Error loading audio config:', error);
    }
  }

  public async updateConfig(newConfig: Partial<AudioPlayerConfig>): Promise<void> {
    try {
      this.config = { ...this.config, ...newConfig };
      await AsyncStorage.setItem(AUDIO_CONFIG_KEY, JSON.stringify(this.config));
      
      // Apply volume change immediately
      if (this.sound && newConfig.volume !== undefined) {
        this.sound.setVolume(newConfig.volume);
      }
      
      // Apply playback rate change
      if (this.sound && newConfig.playbackRate !== undefined) {
        this.sound.setSpeed(newConfig.playbackRate);
      }
    } catch (error) {
      console.warn('Error updating audio config:', error);
    }
  }

  // State Management
  private setState(updates: Partial<AudioPlayerState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  public getState(): AudioPlayerState {
    return { ...this.state };
  }

  public getConfig(): AudioPlayerConfig {
    return { ...this.config };
  }

  // Event Listeners
  public addStateListener(listener: (state: AudioPlayerState) => void): void {
    this.listeners.push(listener);
  }

  public removeStateListener(listener: (state: AudioPlayerState) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Audio Loading and Playing
  public async loadVerse(reciterId: string, surahNumber: number, verseNumber: number): Promise<void> {
    try {
      this.setState({ 
        isLoading: true, 
        error: null,
        currentReciter: reciterId,
        currentSurah: surahNumber,
        currentVerse: verseNumber
      });

      // Stop current playback
      if (this.sound) {
        this.stop();
      }

      // Get audio URL
      const audioUrl = getVerseAudioUrl(reciterId, surahNumber, verseNumber);
      if (!audioUrl) {
        throw new Error('Audio URL not found');
      }

      // Create sound instance
      this.sound = new Sound(audioUrl, '', (error) => {
        if (error) {
          console.error('Failed to load audio:', error);
          this.setState({ 
            isLoading: false, 
            error: 'Audio yüklenemedi' 
          });
          return;
        }

        // Audio loaded successfully
        this.setState({
          isLoading: false,
          duration: this.sound?.getDuration() || 0,
        });

        // Auto play if enabled
        if (this.config.autoPlay) {
          this.play();
        }
      });

      // Set volume
      this.sound.setVolume(this.config.volume);

    } catch (error) {
      console.error('Error loading verse audio:', error);
      this.setState({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      });
    }
  }

  public play(): void {
    if (!this.sound) {
      this.setState({ error: 'Ses dosyası yüklenmedi' });
      return;
    }

    this.sound.play((success) => {
      if (success) {
        this.setState({ isPlaying: false, isPaused: false });
        this.onPlaybackComplete();
      } else {
        this.setState({ 
          isPlaying: false, 
          error: 'Oynatma başarısız' 
        });
      }
    });

    this.setState({ isPlaying: true, isPaused: false });
    this.startProgressTracking();
  }

  public pause(): void {
    if (this.sound && this.state.isPlaying) {
      this.sound.pause();
      this.setState({ isPlaying: false, isPaused: true });
      this.stopProgressTracking();
    }
  }

  public resume(): void {
    if (this.sound && this.state.isPaused) {
      this.sound.play();
      this.setState({ isPlaying: true, isPaused: false });
      this.startProgressTracking();
    }
  }

  public stop(): void {
    if (this.sound) {
      this.sound.stop();
      this.sound.release();
      this.sound = null;
    }
    
    this.setState({
      isPlaying: false,
      isPaused: false,
      currentTime: 0,
    });
    
    this.stopProgressTracking();
  }

  public seekTo(position: number): void {
    if (this.sound) {
      this.sound.setCurrentTime(position);
      this.setState({ currentTime: position });
    }
  }

  // Progress Tracking
  private startProgressTracking(): void {
    this.stopProgressTracking();
    
    this.progressInterval = setInterval(() => {
      if (this.sound && this.state.isPlaying) {
        this.sound.getCurrentTime((seconds) => {
          this.setState({ currentTime: seconds });
        });
      }
    }, 1000);
  }

  private stopProgressTracking(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  // Playback Events
  private async onPlaybackComplete(): Promise<void> {
    // Save position
    await this.savePlaybackPosition();

    // Handle repeat mode
    switch (this.config.repeatMode) {
      case 'verse':
        // Repeat current verse
        this.play();
        break;
        
      case 'surah':
        // Move to next verse or repeat surah
        await this.playNextVerse();
        break;
        
      case 'none':
      default:
        // Stop playback
        this.setState({ isPlaying: false, isPaused: false });
        break;
    }
  }

  public async playNextVerse(): Promise<void> {
    // This would need integration with QuranDatabase to get next verse
    const nextVerse = this.state.currentVerse + 1;
    await this.loadVerse(this.state.currentReciter, this.state.currentSurah, nextVerse);
  }

  public async playPreviousVerse(): Promise<void> {
    const prevVerse = Math.max(1, this.state.currentVerse - 1);
    await this.loadVerse(this.state.currentReciter, this.state.currentSurah, prevVerse);
  }

  // Offline Management
  public async downloadVerse(reciterId: string, surahNumber: number, verseNumber: number): Promise<void> {
    // This would implement offline audio downloading
    console.log('Downloading verse for offline use:', { reciterId, surahNumber, verseNumber });
  }

  public async isVerseDownloaded(reciterId: string, surahNumber: number, verseNumber: number): Promise<boolean> {
    try {
      const downloaded = await AsyncStorage.getItem(DOWNLOADED_AUDIO_KEY);
      if (downloaded) {
        const files = JSON.parse(downloaded);
        const key = `${reciterId}_${surahNumber}_${verseNumber}`;
        return files.includes(key);
      }
      return false;
    } catch (error) {
      console.warn('Error checking downloaded audio:', error);
      return false;
    }
  }

  // Position Saving
  private async savePlaybackPosition(): Promise<void> {
    try {
      const position = {
        reciterId: this.state.currentReciter,
        surahNumber: this.state.currentSurah,
        verseNumber: this.state.currentVerse,
        currentTime: this.state.currentTime,
        timestamp: Date.now(),
      };
      
      await AsyncStorage.setItem(PLAYBACK_POSITION_KEY, JSON.stringify(position));
    } catch (error) {
      console.warn('Error saving playback position:', error);
    }
  }

  public async getLastPlaybackPosition(): Promise<{
    reciterId: string;
    surahNumber: number;
    verseNumber: number;
    currentTime: number;
  } | null> {
    try {
      const stored = await AsyncStorage.getItem(PLAYBACK_POSITION_KEY);
      if (stored) {
        const position = JSON.parse(stored);
        return position;
      }
      return null;
    } catch (error) {
      console.warn('Error getting playback position:', error);
      return null;
    }
  }

  // Cleanup
  public dispose(): void {
    this.stop();
    this.listeners = [];
  }
}

// Global audio player instance
export const quranAudioPlayer = new QuranAudioPlayer();

// React Hook for Audio Player
export const useQuranAudioPlayer = () => {
  const [state, setState] = React.useState(quranAudioPlayer.getState());
  
  React.useEffect(() => {
    const handleStateChange = (newState: AudioPlayerState) => {
      setState(newState);
    };
    
    quranAudioPlayer.addStateListener(handleStateChange);
    
    return () => {
      quranAudioPlayer.removeStateListener(handleStateChange);
    };
  }, []);
  
  return {
    ...state,
    config: quranAudioPlayer.getConfig(),
    loadVerse: quranAudioPlayer.loadVerse.bind(quranAudioPlayer),
    play: quranAudioPlayer.play.bind(quranAudioPlayer),
    pause: quranAudioPlayer.pause.bind(quranAudioPlayer),
    resume: quranAudioPlayer.resume.bind(quranAudioPlayer),
    stop: quranAudioPlayer.stop.bind(quranAudioPlayer),
    seekTo: quranAudioPlayer.seekTo.bind(quranAudioPlayer),
    playNext: quranAudioPlayer.playNextVerse.bind(quranAudioPlayer),
    playPrevious: quranAudioPlayer.playPreviousVerse.bind(quranAudioPlayer),
    updateConfig: quranAudioPlayer.updateConfig.bind(quranAudioPlayer),
  };
};

// Audio Controls Component Hook
export const useAudioControls = () => {
  const audioPlayer = useQuranAudioPlayer();
  
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const getProgress = (): number => {
    if (audioPlayer.duration === 0) return 0;
    return audioPlayer.currentTime / audioPlayer.duration;
  };
  
  return {
    ...audioPlayer,
    formatTime,
    progress: getProgress(),
    formattedCurrentTime: formatTime(audioPlayer.currentTime),
    formattedDuration: formatTime(audioPlayer.duration),
  };
}; 