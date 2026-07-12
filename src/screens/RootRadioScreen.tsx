import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  TouchableOpacityProps,
  useWindowDimensions,
  StatusBar,
  ScrollView,
  Animated as RNAnimated,
  Modal,
  PanResponder,
  TextInput,
} from 'react-native';
import {
  createAudioPlayer,
  useAudioRecorder,
  setAudioModeAsync,
  requestRecordingPermissionsAsync,
  RecordingPresets,
  AudioPlayer,
} from 'expo-audio';
import { AudioRecorder } from 'expo-audio/build/AudioModule.types'; // Import AudioRecorder as a type if still needed for type hints, but not for instantiation
import { useNavigation } from '../context/NavigationContext';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AnimatedBackground from '../components/AnimatedBackground';
import { useTheme } from '../theme/ThemeContext';
import {
  IconPlay,
  IconPause,
  IconStop,
  IconLive,
  IconVolume,
  IconVolumeX,
  IconMoreVertical,
  IconDownload,
  IconTrash,
  IconEdit,
  IconClose,
} from '../components/Icons';

// ─── Warna ───
const C = {
  bg: '#0F1115',
  primary: '#00dbe9',
  primaryGlow: 'rgba(0, 219, 233, 0.3)',
  secondary: '#ffb3b2',
  onSurface: '#e2e2e8',
  onSurfaceVariant: '#b9cacb',
  textMuted: '#849495',
  border: 'rgba(255, 255, 255, 0.08)',
  recRed: '#ff4d4f',
  recRedGlow: 'rgba(255, 77, 79, 0.3)',
};

const STREAM_URL = 'https://pu.klikhost.com/proxy/suaramuslim/stream';
const NUM_BARS = 40;

// ─── Breakpoints responsive ───
const BREAKPOINT_TABLET = 600;
const BREAKPOINT_DESKTOP = 1024;

// ─── LocalStorage key ───
const RECORDINGS_KEY = 'sm-recordings';

// ─── Helper: format detik ke HH:MM:SS ───
const formatTime = (totalSeconds: number): string => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

// ─── Helper: nama hari Indonesia ───
const HARI_INDONESIA = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const formatDateTimeID = (timestamp: number): string => {
  const d = new Date(timestamp);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const dd = pad(d.getDate());
  const mm = pad(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `${dd}-${mm}-${yyyy} ${hh}:${mi}:${ss}`;
};

const getRecordingName = (startTime: number, endTime: number): string => {
  const dayName = HARI_INDONESIA[new Date(startTime).getDay()];
  const startStr = formatDateTimeID(startTime);
  const endStr = formatDateTimeID(endTime);
  return `${dayName}, ${startStr} - ${endStr} Suara_Muslim`;
};

// ─── RecordingEntry type (web localStorage) ───
interface RecordingEntry {
  name: string;
  timestamp: number;
  durationSeconds: number;
  mimeType: string;
  data: string; // base64 encoded audio
}

// ─── LocalStorage helpers (web only) ───
function loadWebRecordings(): RecordingEntry[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem(RECORDINGS_KEY);
    return raw ? (JSON.parse(raw) as RecordingEntry[]) : [];
  } catch {
    return [];
  }
}

function addWebRecordingToStorage(entry: RecordingEntry): RecordingEntry[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const existing = loadWebRecordings();
    const updated = [entry, ...existing].slice(0, 20); // simpan maks 20 rekaman
    localStorage.setItem(RECORDINGS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Gagal menyimpan ke localStorage:', e);
    return loadWebRecordings();
  }
}

function deleteWebRecordingFromStorage(timestamp: number): RecordingEntry[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const updated = loadWebRecordings().filter((r) => r.timestamp !== timestamp);
    localStorage.setItem(RECORDINGS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return loadWebRecordings();
  }
}

function renameWebRecordingInStorage(timestamp: number, newName: string): RecordingEntry[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const updated = loadWebRecordings().map((r) =>
      r.timestamp === timestamp ? { ...r, name: newName } : r
    );
    localStorage.setItem(RECORDINGS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return loadWebRecordings();
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // result = "data:<mimeType>;base64,<data>"
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function triggerBlobDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

function downloadFromBase64(base64: string, name: string, mimeType: string) {
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: mimeType });
    triggerBlobDownload(blob, name);
  } catch (e) {
    console.error('Gagal men-download rekaman:', e);
  }
}

interface FocusableTouchableOpacityProps extends TouchableOpacityProps {
  children: React.ReactNode;
  focusStyle?: object;
  hasTVPreferredFocus?: boolean;
}

const FocusableTouchableOpacity: React.FC<FocusableTouchableOpacityProps> = ({
  children,
  style,
  focusStyle,
  onPress,
  onFocus,
  onBlur,
  hasTVPreferredFocus,
  ...props
}) => {
  const [focused, setFocused] = useState(false);

  const handleFocus = useCallback((e: any) => {
    setFocused(true);
    onFocus && onFocus(e);
  }, [onFocus]);

  const handleBlur = useCallback((e: any) => {
    setFocused(false);
    onBlur && onBlur(e);
  }, [onBlur]);

  return (
    <TouchableOpacity
      style={[style, focused && focusStyle]}
      onPress={onPress}
      onFocus={handleFocus}
      onBlur={handleBlur}
      focusable={true}
      hasTVPreferredFocus={hasTVPreferredFocus}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};

const RootRadioScreen = () => {
  const { colors, isDark } = useTheme();
  const { setActiveScreen } = useNavigation();
  const { width: winWidth, height: winHeight } = useWindowDimensions();

  // ── Responsive helpers ──
  const isDesktop = winWidth >= BREAKPOINT_DESKTOP;
  const isTablet = winWidth >= BREAKPOINT_TABLET && winWidth < BREAKPOINT_DESKTOP;
  const isCompact = winWidth < 360;
  const isShort = winHeight < 700;
  const contentMaxWidth = isDesktop ? 480 : isTablet ? 440 : winWidth;
  const horizontalPadding = isDesktop || isTablet ? 32 : isCompact ? 16 : 24;
  const titleSize = isDesktop ? 40 : isTablet ? 38 : isCompact ? 30 : 36;
  const playButtonSize = isDesktop || isTablet ? 112 : isShort ? 88 : 100;
  const stopButtonSize = isDesktop || isTablet ? 60 : isShort ? 50 : 56;
  const recordButtonSize = isDesktop || isTablet ? 60 : isShort ? 50 : 56;
  const headerMarginBottom = isShort ? 20 : 40;
  const visualizerHeight = isShort ? 110 : 160;
  const visualizerMarginBottom = isShort ? 20 : 40;
  const stopwatchMarginBottom = isShort ? 10 : 20;
  const controlsMarginBottom = isShort ? 16 : 24;

  const [sound, setSound] = useState<AudioPlayer | null>(null);
  const [playerState, setPlayerState] = useState<'stopped' | 'playing' | 'paused'>('stopped');
  const [isLoading, setIsLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // ── Recording state ──
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingBusy, setIsRecordingBusy] = useState(false);
  const [recordingElapsed, setRecordingElapsed] = useState(0);
  const [lastRecordingName, setLastRecordingName] = useState<string | null>(null);
  const [lastRecordingUri, setLastRecordingUri] = useState<string | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  // ── Volume state ──
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(1.0);
  const [showVolumeModal, setShowVolumeModal] = useState(false);

  // ── Web recordings list (loaded from localStorage) ──
  const [savedWebRecordings, setSavedWebRecordings] = useState<RecordingEntry[]>([]);

  // ── Recording item playback state (web) ──
  const [playingRecordId, setPlayingRecordId] = useState<number | null>(null);
  const playingAudioRef = useRef<HTMLAudioElement | null>(null);

  // ── Action modal state ──
  const [selectedRecording, setSelectedRecording] = useState<RecordingEntry | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);

  // ── Rename modal state ──
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  // Audio ref for web
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── Stopwatch refs ──
  const sessionStartRef = useRef<number | null>(null);
  const pauseStartRef = useRef<number | null>(null);
  const totalPausedRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPlaying = playerState === 'playing';

  // ── Recording refs ──
  const recordingStartRef = useRef<number | null>(null);
  const recordingTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Using useAudioRecorder hook here for native recording management
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY, (status) => {
    console.log('AudioRecorder Status:', status);
    // You might want to update some state based on status here
  });

  // ── Web MediaRecorder refs ──
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Animasi visualizer bars
  const barAnimations = useRef(
    Array.from({ length: NUM_BARS }, () => new RNAnimated.Value(0.3))
  ).current;

  // Animasi pulsating untuk dot REC
  const recDotOpacity = useRef(new RNAnimated.Value(1)).current;

  // ── Load web recordings dari localStorage saat mount ──
  useEffect(() => {
    if (Platform.OS === 'web') {
      setSavedWebRecordings(loadWebRecordings());
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
      if (playingAudioRef.current) {
        playingAudioRef.current.pause();
        playingAudioRef.current.src = '';
        playingAudioRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop(); } catch {}
      }
      if (audioRecorder) {
        audioRecorder.stop().catch(() => {});
      }
    };
  }, []);

  // ── Stopwatch tick (playback) ──
  useEffect(() => {
    if (playerState === 'playing') {
      const tick = () => {
        if (sessionStartRef.current !== null) {
          const now = Date.now();
          const total = Math.floor((now - sessionStartRef.current) / 1000) - totalPausedRef.current;
          setElapsed(total);
        }
      };
      tick();
      tickRef.current = setInterval(tick, 1000);
      return () => {
        if (tickRef.current) clearInterval(tickRef.current);
      };
    }
  }, [playerState]);

  // Reset stopwatch saat stopped
  useEffect(() => {
    if (playerState === 'stopped') {
      setElapsed(0);
    }
  }, [playerState]);

  // ── Timer recording ──
  useEffect(() => {
    if (isRecording) {
      const tick = () => {
        if (recordingStartRef.current !== null) {
          setRecordingElapsed(Math.floor((Date.now() - recordingStartRef.current) / 1000));
        }
      };
      tick();
      recordingTickRef.current = setInterval(tick, 1000);
      return () => {
        if (recordingTickRef.current) clearInterval(recordingTickRef.current);
      };
    }
  }, [isRecording]);

  // ── Animasi dot REC berkedip ──
  useEffect(() => {
    if (isRecording) {
      const loop = RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.timing(recDotOpacity, { toValue: 0.2, duration: 600, useNativeDriver: false }),
          RNAnimated.timing(recDotOpacity, { toValue: 1, duration: 600, useNativeDriver: false }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      recDotOpacity.setValue(1);
    }
  }, [isRecording, recDotOpacity]);

  // ── Recording item playback helpers ──
  const stopPlayingRecording = useCallback(() => {
    if (playingAudioRef.current) {
      playingAudioRef.current.pause();
      playingAudioRef.current.src = '';
      playingAudioRef.current = null;
    }
    setPlayingRecordId(null);
  }, []);

  const togglePlayRecording = useCallback((rec: RecordingEntry) => {
    if (Platform.OS !== 'web') return;

    // If the same recording is playing → pause it
    if (playingRecordId === rec.timestamp) {
      stopPlayingRecording();
      return;
    }

    // Stop any currently playing recording
    if (playingAudioRef.current) {
      playingAudioRef.current.pause();
      playingAudioRef.current.src = '';
      playingAudioRef.current = null;
    }

    try {
      const binary = atob(rec.data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: rec.mimeType });
      const url = URL.createObjectURL(blob);

      const audio = new window.Audio(url);
      audio.addEventListener('ended', () => {
        setPlayingRecordId(null);
        URL.revokeObjectURL(url);
        playingAudioRef.current = null;
      });
      audio.addEventListener('error', () => {
        setPlayingRecordId(null);
        URL.revokeObjectURL(url);
        playingAudioRef.current = null;
      });

      audio.play();
      playingAudioRef.current = audio;
      setPlayingRecordId(rec.timestamp);
    } catch (e) {
      console.error('Gagal memutar rekaman:', e);
    }
  }, [playingRecordId, stopPlayingRecording]);

  // ── Action modal helpers ──
  const openActionModal = useCallback((rec: RecordingEntry) => {
    setSelectedRecording(rec);
    setShowActionModal(true);
  }, []);

  const closeActionModal = useCallback(() => {
    setShowActionModal(false);
    setSelectedRecording(null);
  }, []);

  const handleActionDownload = useCallback(() => {
    if (!selectedRecording) return;
    downloadFromBase64(selectedRecording.data, selectedRecording.name, selectedRecording.mimeType);
    closeActionModal();
  }, [selectedRecording, closeActionModal]);

  const handleActionDelete = useCallback(() => {
    if (!selectedRecording) return;
    if (playingRecordId === selectedRecording.timestamp) {
      stopPlayingRecording();
    }
    const updated = deleteWebRecordingFromStorage(selectedRecording.timestamp);
    setSavedWebRecordings(updated);
    closeActionModal();
  }, [selectedRecording, playingRecordId, stopPlayingRecording, closeActionModal]);

  const handleActionRename = useCallback(() => {
    if (!selectedRecording) return;
    setRenameValue(selectedRecording.name);
    setShowActionModal(false);
    setShowRenameModal(true);
  }, [selectedRecording]);

  const handleRenameConfirm = useCallback(() => {
    if (!selectedRecording) return;
    const trimmed = renameValue.trim();
    if (!trimmed) return;
    const updated = renameWebRecordingInStorage(selectedRecording.timestamp, trimmed);
    setSavedWebRecordings(updated);
    setShowRenameModal(false);
    setSelectedRecording(null);
    setRenameValue('');
  }, [selectedRecording, renameValue]);

  const handleRenameCancel = useCallback(() => {
    setShowRenameModal(false);
    setSelectedRecording(null);
    setRenameValue('');
  }, []);

  const playRadio = useCallback(async () => {
    const wasStopped = playerState === 'stopped';
    setIsLoading(true);
    setRecordingError(null);

    if (Platform.OS === 'web') {
      try {
        if (wasStopped || !audioRef.current) {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
            audioRef.current = null;
          }
          const audio = new window.Audio(STREAM_URL);
          audio.crossOrigin = 'anonymous'; // dibutuhkan agar captureStream() bisa dipakai
          audio.volume = isMuted ? 0 : volume;
          audioRef.current = audio;

          audio.addEventListener('playing', () => {
            setPlayerState('playing');
            setIsLoading(false);
          });

          audio.addEventListener('error', (_e: Event) => {
            console.error('Audio error');
            setIsLoading(false);
          });

          await audio.play();
        } else {
          await audioRef.current.play();
          setPlayerState('playing');
          setIsLoading(false);
        }
      } catch (e) {
        console.error('Failed to play radio (web):', e);
        setIsLoading(false);
        return;
      }
    } else {
      try {
        if (wasStopped) {
          if (sound) {
            sound.remove();
          }

          const newSound = createAudioPlayer(STREAM_URL);
          newSound.volume = isMuted ? 0 : volume;
          newSound.play();
          setPlayerState('playing');
          setIsLoading(false);
          setSound(newSound);
        } else {
          if (sound) {
            sound.play();
            setPlayerState('playing');
            setIsLoading(false);
          }
        }
      } catch (e) {
        console.error('Failed to play radio:', e);
        setIsLoading(false);
        return;
      }
    }

    if (wasStopped) {
      sessionStartRef.current = Date.now();
      totalPausedRef.current = 0;
      pauseStartRef.current = null;
    } else {
      if (pauseStartRef.current !== null) {
        totalPausedRef.current += Math.floor((Date.now() - pauseStartRef.current) / 1000);
        pauseStartRef.current = null;
      }
    }
  }, [playerState, sound]);

  const pauseRadio = useCallback(async () => {
    pauseStartRef.current = Date.now();

    if (Platform.OS === 'web') {
      try {
        if (audioRef.current) {
          audioRef.current.pause();
          setPlayerState('paused');
        }
      } catch (e) {
        console.error('Failed to pause radio (web):', e);
      }
      return;
    }

    if (sound) {
      try {
        sound.pause();
        setPlayerState('paused');
      } catch (e) {
        console.error('Failed to pause radio:', e);
      }
    }
  }, [sound]);

  const stopRadio = useCallback(async () => {
    if (Platform.OS === 'web') {
      try {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
          audioRef.current = null;
        }
      } catch (e) {
        console.error('Failed to stop radio (web):', e);
      }
    }

    if (sound) {
      try {
        sound.remove();
        setSound(null);
      } catch (e) {
        console.error('Failed to stop radio:', e);
      }
    }

    sessionStartRef.current = null;
    pauseStartRef.current = null;
    totalPausedRef.current = 0;
    setPlayerState('stopped');
    setIsLoading(false);
  }, [sound]);

  const handlePlay = useCallback(() => {
    if (playerState === 'playing') {
      pauseRadio();
    } else {
      playRadio();
    }
  }, [playerState, playRadio, pauseRadio]);

  const handleStop = useCallback(() => {
    if (playerState !== 'stopped') {
      stopRadio();
    }
  }, [playerState, stopRadio]);

  const saveNativeRecording = useCallback(async (rawUri: string, startTime: number, endTime: number) => {
    try {
      const dir = (FileSystem as any).documentDirectory + 'recordings/';
      const dirInfo = await FileSystem.getInfoAsync(dir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      }

      const fileName = `${getRecordingName(startTime, endTime)}.m4a`;
      const destUri = `${dir}${fileName}`;
      await FileSystem.moveAsync({ from: rawUri, to: destUri });

      setLastRecordingUri(destUri);
      setLastRecordingName(fileName);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(destUri, {
          mimeType: 'audio/m4a',
          dialogTitle: 'Simpan atau bagikan rekaman',
        });
      }
    } catch (e) {
      console.error('Gagal menyimpan file rekaman:', e);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!isRecording) return;
    setIsRecordingBusy(true);

    try {
      if (Platform.OS === 'web') {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          // Wrap in a promise to wait for onstop
          await new Promise<void>((resolve) => {
            if (!mediaRecorderRef.current) {
              resolve();
              return;
            }
            const recEndTime = Date.now();
            const recStartTime = recordingStartRef.current ?? recEndTime;
            mediaRecorderRef.current.onstop = async () => {
              try {
                const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
                const blob = new Blob(chunksRef.current, { type: mimeType });
                
                // M4A/WebM format
                const ext = mimeType.includes('ogg') ? 'ogg' : 'webm';
                const fileName = `${getRecordingName(recStartTime, recEndTime)}.${ext}`;
                
                // Save to localStorage
                const base64Data = await blobToBase64(blob);
                const dur = Math.floor((recEndTime - recStartTime) / 1000);
                
                const newEntry: RecordingEntry = {
                  name: fileName,
                  timestamp: Date.now(),
                  durationSeconds: dur,
                  mimeType: mimeType,
                  data: base64Data,
                };
                
                const updatedList = addWebRecordingToStorage(newEntry);
                setSavedWebRecordings(updatedList);
                
                // Download automatically
                triggerBlobDownload(blob, fileName);
                
                setLastRecordingName(fileName);
              } catch (err) {
                console.error('Error saat menyimpan rekaman:', err);
                setRecordingError('Gagal menyimpan hasil rekaman');
              } finally {
                chunksRef.current = [];
                mediaRecorderRef.current = null;
                resolve();
              }
            };
            mediaRecorderRef.current.stop();
          });
        }
      } else {
        if (audioRecorder) {
          const nativeEndTime = Date.now();
          const nativeStartTime = recordingStartRef.current ?? nativeEndTime;
          const rawUri = audioRecorder.uri;
          await audioRecorder.stop();
          // audioRecorder is managed by the hook, so we don't nullify it.
          if (rawUri) {
            await saveNativeRecording(rawUri, nativeStartTime, nativeEndTime);
          }
        }
        await setAudioModeAsync({ allowsRecording: false });
      }
    } catch (e) {
      console.error('Gagal menghentikan rekaman:', e);
      setRecordingError('Gagal menghentikan rekaman');
    } finally {
      recordingStartRef.current = null;
      setRecordingElapsed(0);
      setIsRecording(false);
      setIsRecordingBusy(false);
    }
  }, [isRecording, saveNativeRecording]);

  const startRecording = useCallback(async () => {
    if (playerState !== 'playing' || isRecording || isRecordingBusy) return;
    setIsRecordingBusy(true);
    setLastRecordingUri(null);
    setLastRecordingName(null);
    setRecordingError(null);

    try {
      if (Platform.OS === 'web') {
        if (!audioRef.current) {
          setRecordingError('Radio belum diputar.');
          setIsRecordingBusy(false);
          return;
        }

        const captureStream = (audioRef.current as any).captureStream || (audioRef.current as any).mozCaptureStream;
        if (!captureStream) {
          setRecordingError('Browser tidak mendukung captureStream.');
          setIsRecordingBusy(false);
          return;
        }

        const stream = captureStream.call(audioRef.current) as MediaStream;
        const audioTracks = stream.getAudioTracks();
        
        if (audioTracks.length === 0 || audioTracks[0].muted) {
          setRecordingError('Perekaman ditolak. Stream radio tidak mengizinkan akses (CORS).');
          setIsRecordingBusy(false);
          return;
        }

        // Gunakan WebM atau Ogg (biasanya didukung browser untuk recording)
        const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg']
          .find(t => MediaRecorder.isTypeSupported(t)) || '';

        const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        mediaRecorder.start(1000);
        mediaRecorderRef.current = mediaRecorder;
      } else {
        const perm = await requestRecordingPermissionsAsync();
        if (!perm.granted) {
          setRecordingError('Izin mikrofon ditolak.');
          setIsRecordingBusy(false);
          return;
        }

        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
        });

        // Use the audioRecorder instance from the hook
        await audioRecorder.prepareToRecordAsync();
        await audioRecorder.record();
      }

      recordingStartRef.current = Date.now();
      setRecordingElapsed(0);
      setIsRecording(true);
    } catch (e) {
      console.error('Gagal memulai rekaman:', e);
      setRecordingError('Terjadi kesalahan saat mulai merekam.');
    } finally {
      setIsRecordingBusy(false);
    }
  }, [playerState, isRecording, isRecordingBusy]);

  const handleToggleRecord = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // Kalau radio berhenti/dijeda, otomatis hentikan rekaman
  useEffect(() => {
    if (playerState !== 'playing' && isRecording) {
      stopRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerState]);

  // ── Animasi visualizer ──
  useEffect(() => {
    if (isPlaying) {
      const animateBars = () => {
        barAnimations.forEach((anim, index) => {
          const delay = index * 30;
          const randomValue = 0.3 + Math.random() * 0.7;
          const duration = 200 + Math.random() * 300;

          RNAnimated.sequence([
            RNAnimated.delay(delay),
            RNAnimated.timing(anim, {
              toValue: randomValue,
              duration: duration,
              useNativeDriver: false,
            }),
          ]).start();
        });
      };

      const interval = setInterval(animateBars, 800);
      animateBars();

      return () => clearInterval(interval);
    } else {
      barAnimations.forEach((anim) => {
        RNAnimated.timing(anim, {
          toValue: 0.2,
          duration: 500,
          useNativeDriver: false,
        }).start();
      });
    }
  }, [isPlaying, barAnimations]);

  // ── Volume handlers ──
  const SLIDER_TRACK_HEIGHT = 160;

  const applyVolume = useCallback((vol: number) => {
    if (Platform.OS === 'web') {
      if (audioRef.current) {
        audioRef.current.volume = vol;
      }
    } else {
      if (sound) {
        sound.volume = vol;
      }
    }
  }, [sound]);

  const handleVolumeChange = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolume(clamped);
    if (clamped > 0) {
      setIsMuted(false);
      setPreviousVolume(clamped);
    }
    applyVolume(clamped);
  }, [applyVolume]);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(previousVolume);
      applyVolume(previousVolume);
    } else {
      setPreviousVolume(volume);
      setIsMuted(true);
      setVolume(0);
      applyVolume(0);
    }
  }, [isMuted, volume, previousVolume, applyVolume]);

  const volumePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {},
      onPanResponderMove: () => {},
    })
  ).current;

  // We recreate the panResponder to capture latest handleVolumeChange
  const volumePanRef = useRef({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt: any) => {
      const locationY = evt.nativeEvent.locationY;
      const val = 1 - locationY / SLIDER_TRACK_HEIGHT;
      handleVolumeChange(val);
    },
    onPanResponderMove: (evt: any) => {
      const locationY = evt.nativeEvent.locationY;
      const val = 1 - locationY / SLIDER_TRACK_HEIGHT;
      handleVolumeChange(val);
    },
  });

  useEffect(() => {
    volumePanRef.current = {
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: any) => {
        const locationY = evt.nativeEvent.locationY;
        const val = 1 - locationY / SLIDER_TRACK_HEIGHT;
        handleVolumeChange(val);
      },
      onPanResponderMove: (evt: any) => {
        const locationY = evt.nativeEvent.locationY;
        const val = 1 - locationY / SLIDER_TRACK_HEIGHT;
        handleVolumeChange(val);
      },
    };
  }, [handleVolumeChange]);

  const sliderPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gs) => {
        volumePanRef.current.onPanResponderGrant(evt);
      },
      onPanResponderMove: (evt, gs) => {
        volumePanRef.current.onPanResponderMove(evt);
      },
    })
  ).current;

  const effectiveVolume = isMuted ? 0 : volume;

  const recordDisabled = playerState !== 'playing' || isRecordingBusy;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <View style={{ position: 'absolute', top: 100, left: 0, right: 0, bottom: 0, zIndex: -1 }}>
        <AnimatedBackground />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.content,
            {
              maxWidth: contentMaxWidth,
              paddingHorizontal: horizontalPadding,
              alignSelf: 'center',
              width: '100%',
            },
          ]}
        >
          <View style={styles.textElementsContainer}>
            <View style={[styles.header, { marginBottom: headerMarginBottom }]}>
              <Text style={[styles.radioTitle, { fontSize: titleSize }]}>Suara Muslim</Text>
              <View style={styles.badgeRow}>
                <View style={styles.liveBadge}>
                  <IconLive size={8} color={C.secondary} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>

                {isRecording && (
                  <View style={styles.recBadge}>
                    <RNAnimated.View style={[styles.recDot, { opacity: recDotOpacity }]} />
                    <Text style={styles.recBadgeText}>REC {formatTime(recordingElapsed)}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View
            style={[
              styles.visualizerContainer,
              { height: visualizerHeight, marginBottom: visualizerMarginBottom },
            ]}
          >
            <View style={styles.visualizer}>
              {barAnimations.map((anim, index) => (
                <RNAnimated.View
                  key={index}
                  style={[
                    styles.bar,
                    { transform: [{ scaleY: anim }] },
                  ]}
                />
              ))}
            </View>
            <View style={styles.visualizerMirror}>
              {barAnimations.map((anim, index) => (
                <RNAnimated.View
                  key={`mirror-${index}`}
                  style={[
                    styles.barMirror,
                    { transform: [{ scaleY: anim }] },
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={[styles.stopwatchRow, { marginBottom: stopwatchMarginBottom }]}>
            <Text style={[styles.stopwatchText, isCompact && { fontSize: 24 }]}>
              {formatTime(elapsed)}
            </Text>
          </View>

          {isRecording && (
            <View style={styles.recProgressTrack}>
              <RNAnimated.View style={[styles.recProgressFill, { opacity: recDotOpacity }]} />
            </View>
          )}

          <View style={[styles.controlsRow, { marginBottom: controlsMarginBottom }]}>
            <FocusableTouchableOpacity
              style={[
                styles.secondaryButton,
                { width: stopButtonSize, height: stopButtonSize, borderRadius: stopButtonSize / 2 },
                playerState === 'stopped' && styles.secondaryButtonHidden,
              ]}
              onPress={handleStop}
              activeOpacity={0.8}
              disabled={playerState === 'stopped'}
            >
              <IconStop size={26} color={C.onSurface} />
            </FocusableTouchableOpacity>

            <FocusableTouchableOpacity
              style={[
                styles.playButton,
                { width: playButtonSize, height: playButtonSize, borderRadius: playButtonSize / 2 },
                isPlaying && styles.playButtonActive,
              ]}
              onPress={handlePlay}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <Text style={styles.loadingText}>...</Text>
              ) : playerState === 'playing' ? (
                <IconPause size={44} color={C.bg} />
              ) : (
                <IconPlay size={44} color={C.bg} />
              )}
            </FocusableTouchableOpacity>

            <FocusableTouchableOpacity
              style={[
                styles.secondaryButton,
                { width: recordButtonSize, height: recordButtonSize, borderRadius: recordButtonSize / 2 },
                isRecording && styles.recordButtonActive,
                recordDisabled && styles.buttonDisabled,
              ]}
              onPress={handleToggleRecord}
              activeOpacity={0.8}
              disabled={recordDisabled}
            >
              {isRecording ? (
                <View style={styles.recStopIcon} />
              ) : (
                <View style={styles.recDotIcon} />
              )}
            </FocusableTouchableOpacity>
          </View>

          <Text style={styles.statusText}>
            {playerState === 'playing'
              ? isRecording
                ? 'Sedang Memutar & Merekam'
                : 'Sedang Memutar'
              : playerState === 'paused'
              ? 'Dijeda'
              : 'Ketuk untuk Memutar'}
          </Text>
          {playerState !== 'playing' && (
            <Text style={styles.recordHintText}>Putar radio terlebih dahulu untuk merekam</Text>
          )}

          {recordingError && (
            <Text style={styles.errorText}>{recordingError}</Text>
          )}

          {!isRecording && lastRecordingName && !recordingError && (
            <View style={styles.savedRow}>
              <Text style={styles.savedText} numberOfLines={1}>
                ✓ Tersimpan: {lastRecordingName}
              </Text>
              {Platform.OS !== 'web' && lastRecordingUri && (
                <FocusableTouchableOpacity
                  onPress={() =>
                    Sharing.isAvailableAsync().then((can) => {
                      if (can && lastRecordingUri) {
                        Sharing.shareAsync(lastRecordingUri, { mimeType: 'audio/m4a' });
                      }
                    })
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.savedShareLink}>Bagikan lagi</Text>
                </FocusableTouchableOpacity>
              )}
            </View>
          )}

          {/* Web recordings list */}
          {Platform.OS === 'web' && savedWebRecordings.length > 0 && (
            <View style={styles.recordingsListContainer}>
              <Text style={styles.recordingsListTitle}>Rekaman Tersimpan</Text>
              {savedWebRecordings.map((rec) => (
                <View key={rec.timestamp} style={styles.recordingItem}>
                  {/* ── Play / Pause button ── */}
                  <FocusableTouchableOpacity
                    style={styles.recPlayBtn}
                    onPress={() => togglePlayRecording(rec)}
                    activeOpacity={0.75}
                  >
                    {playingRecordId === rec.timestamp ? (
                      <IconPause size={14} color={C.primary} />
                    ) : (
                      <IconPlay size={14} color={C.primary} />
                    )}
                  </FocusableTouchableOpacity>

                  {/* ── Nama file (horizontal scroll) + meta ── */}
                  <View style={styles.recordingItemInfo}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.recNameScroll}
                      contentContainerStyle={styles.recNameScrollContent}
                    >
                      <Text style={styles.recordingItemName} numberOfLines={1}>
                        {rec.name}
                      </Text>
                    </ScrollView>
                    <Text style={styles.recordingItemMeta}>
                      {new Date(rec.timestamp).toLocaleTimeString('id-ID')} • {formatTime(rec.durationSeconds)}
                    </Text>
                  </View>

                  {/* ── Action button (three dots) ── */}
                  <FocusableTouchableOpacity
                    style={styles.recActionBtn}
                    onPress={() => openActionModal(rec)}
                    activeOpacity={0.75}
                  >
                    <IconMoreVertical size={18} color={C.onSurfaceVariant} />
                  </FocusableTouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
        {/* ── Floating Volume Button (kanan layar) ── */}
        <FocusableTouchableOpacity
          style={styles.floatingVolumeBtn}
          onPress={() => setShowVolumeModal(true)}
          activeOpacity={0.8}
        >
          {isMuted || effectiveVolume === 0 ? (
            <IconVolumeX size={22} color={C.recRed} />
          ) : (
            <IconVolume size={22} color={C.primary} />
          )}
        </FocusableTouchableOpacity>

        {/* ── Floating Navigation Button (bawah volume) ── */}
        <FocusableTouchableOpacity
          style={styles.floatingNavBtn}
          onPress={() => setActiveScreen('stream')}
          activeOpacity={0.8}
        >
          <Text style={styles.floatingNavBtnText}>stream</Text>
        </FocusableTouchableOpacity>

      {/* ── Volume Modal ── */}
      <Modal
        visible={showVolumeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowVolumeModal(false)}
      >
        <FocusableTouchableOpacity
          style={styles.volumeModalOverlay}
          activeOpacity={1}
          onPress={() => setShowVolumeModal(false)}
        >
          <FocusableTouchableOpacity
            style={styles.volumeDialog}
            activeOpacity={1}
            onPress={() => {}}
          >
            {/* Dialog Header */}
            <View style={styles.volumeDialogHeader}>
              <Text style={styles.volumeDialogTitle}>Volume</Text>
              <FocusableTouchableOpacity onPress={() => setShowVolumeModal(false)} style={styles.volumeCloseBtn}>
                <IconClose size={18} color={C.textMuted} />
              </FocusableTouchableOpacity>
            </View>

            {/* Percentage */}
            <Text style={styles.volumePercentText}>
              {Math.round(effectiveVolume * 100)}%
            </Text>

            {/* Vertical Slider */}
            <View
              style={styles.sliderOuterContainer}
              {...sliderPanResponder.panHandlers}
            >
              <View style={styles.sliderTrack} pointerEvents="none">
                <View
                  style={[
                    styles.sliderFill,
                    { height: `${effectiveVolume * 100}%` },
                  ]}
                  pointerEvents="none"
                />
                <View
                  style={[
                    styles.sliderThumb,
                    { bottom: `${effectiveVolume * 100}%` },
                  ]}
                  pointerEvents="none"
                />
              </View>
            </View>

            {/* Mute Button */}
            <FocusableTouchableOpacity
              style={[
                styles.muteButton,
                isMuted && styles.muteButtonActive,
              ]}
              onPress={toggleMute}
              activeOpacity={0.8}
            >
              {isMuted ? (
                <IconVolumeX size={18} color={C.recRed} />
              ) : (
                <IconVolume size={18} color={C.primary} />
              )}
              <Text style={[styles.muteButtonText, isMuted && styles.muteButtonTextActive]}>
                {isMuted ? 'Unmute' : 'Mute'}
              </Text>
            </FocusableTouchableOpacity>
          </FocusableTouchableOpacity>
        </FocusableTouchableOpacity>
      </Modal>

      {/* ── Action Modal (Unduh / Hapus / Rename) ── */}
      <Modal
        visible={showActionModal}
        transparent
        animationType="fade"
        onRequestClose={closeActionModal}
      >
        <FocusableTouchableOpacity
          style={styles.actionModalOverlay}
          activeOpacity={1}
          onPress={closeActionModal}
        >
          <FocusableTouchableOpacity
            style={styles.actionDialog}
            activeOpacity={1}
            onPress={() => {}}
          >
            {/* Dialog title */}
            <View style={styles.actionDialogHeader}>
              <Text style={styles.actionDialogTitle} numberOfLines={1}>
                {selectedRecording?.name ?? ''}
              </Text>
              <FocusableTouchableOpacity onPress={closeActionModal} style={styles.volumeCloseBtn}>
                <IconClose size={18} color={C.textMuted} />
              </FocusableTouchableOpacity>
            </View>

            {/* Unduh */}
            <FocusableTouchableOpacity style={styles.actionRow} onPress={handleActionDownload} activeOpacity={0.75}>
              <View style={styles.actionIconBox}>
                <IconDownload size={18} color={C.primary} />
              </View>
              <Text style={styles.actionRowText}>Unduh</Text>
            </FocusableTouchableOpacity>

            <View style={styles.actionDivider} />

            {/* Rename */}
            <FocusableTouchableOpacity style={styles.actionRow} onPress={handleActionRename} activeOpacity={0.75}>
              <View style={styles.actionIconBox}>
                <IconEdit size={18} color={C.onSurfaceVariant} />
              </View>
              <Text style={styles.actionRowText}>Rename</Text>
            </FocusableTouchableOpacity>

            <View style={styles.actionDivider} />

            {/* Hapus */}
            <FocusableTouchableOpacity style={styles.actionRow} onPress={handleActionDelete} activeOpacity={0.75}>
              <View style={[styles.actionIconBox, styles.actionIconBoxDanger]}>
                <IconTrash size={18} color={C.recRed} />
              </View>
              <Text style={[styles.actionRowText, styles.actionRowTextDanger]}>Hapus</Text>
            </FocusableTouchableOpacity>
          </FocusableTouchableOpacity>
        </FocusableTouchableOpacity>
      </Modal>

      {/* ── Rename Modal ── */}
      <Modal
        visible={showRenameModal}
        transparent
        animationType="fade"
        onRequestClose={handleRenameCancel}
      >
        <FocusableTouchableOpacity
          style={styles.actionModalOverlay}
          activeOpacity={1}
          onPress={handleRenameCancel}
        >
          <FocusableTouchableOpacity
            style={styles.renameDialog}
            activeOpacity={1}
            onPress={() => {}}
          >
            <Text style={styles.renameTitle}>Rename Rekaman</Text>
            <TextInput
              style={styles.renameInput}
              value={renameValue}
              onChangeText={setRenameValue}
              placeholder="Nama baru..."
              placeholderTextColor={C.textMuted}
              autoFocus
              selectTextOnFocus
            />
            <View style={styles.renameActions}>
              <FocusableTouchableOpacity
                style={styles.renameCancelBtn}
                onPress={handleRenameCancel}
                activeOpacity={0.8}
              >
                <Text style={styles.renameCancelText}>Batal</Text>
              </FocusableTouchableOpacity>
              <FocusableTouchableOpacity
                style={[styles.renameConfirmBtn, !renameValue.trim() && { opacity: 0.4 }]}
                onPress={handleRenameConfirm}
                activeOpacity={0.8}
                disabled={!renameValue.trim()}
              >
                <Text style={styles.renameConfirmText}>Simpan</Text>
              </FocusableTouchableOpacity>
            </View>
          </FocusableTouchableOpacity>
        </FocusableTouchableOpacity>
      </Modal>
    </View>
  );
};

// ─── STYLES ───
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scroll: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0,
    paddingBottom: 32,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  textElementsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginTop: 0,
    paddingTop: 0,
  },
  radioTitle: {
    fontWeight: '800',
    color: C.onSurface,
    marginBottom: 16,
    marginTop: 0,
    paddingTop: 0,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 179, 178, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 178, 0.3)',
  },
  liveText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.secondary,
    letterSpacing: 1,
  },
  recBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 77, 79, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 79, 0.35)',
  },
  recDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.recRed,
  },
  recBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.recRed,
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
  },
  visualizerContainer: {
    width: '100%',
    height: 160,
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visualizer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 80,
    gap: 3,
    flexWrap: 'wrap',
  },
  visualizerMirror: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: 80,
    gap: 3,
    flexWrap: 'wrap',
  },
  bar: {
    width: 4,
    height: 60,
    backgroundColor: C.primary,
    borderRadius: 2,
    opacity: 0.9,
  },
  barMirror: {
    width: 4,
    height: 60,
    backgroundColor: C.primary,
    borderRadius: 2,
    opacity: 0.4,
  },
  stopwatchRow: {
    marginBottom: 20,
    alignItems: 'center',
  },
  stopwatchText: {
    fontSize: 28,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    color: C.onSurface,
    letterSpacing: 2,
  },
  recProgressTrack: {
    width: '100%',
    maxWidth: 260,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 77, 79, 0.15)',
    marginBottom: 28,
    overflow: 'hidden',
  },
  recProgressFill: {
    width: '100%',
    height: '100%',
    backgroundColor: C.recRed,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  playButton: {
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  playButtonActive: {
    backgroundColor: C.primary,
    shadowColor: C.primaryGlow,
    shadowOpacity: 0.6,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  secondaryButtonHidden: {
    opacity: 0,
  },
  recordButtonActive: {
    backgroundColor: 'rgba(255, 77, 79, 0.15)',
    borderColor: C.recRed,
  },
  buttonDisabled: {
    opacity: 0.35,
  },
  recDotIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.recRed,
  },
  recStopIcon: {
    width: 16,
    height: 16,
    borderRadius: 3,
    backgroundColor: C.recRed,
  },
  loadingText: {
    fontSize: 24,
    color: C.bg,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 16,
    color: C.onSurfaceVariant,
    fontWeight: '500',
    textAlign: 'center',
  },
  recordHintText: {
    fontSize: 12,
    color: C.textMuted,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 6,
  },
  errorText: {
    fontSize: 14,
    color: C.recRed,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 20,
  },
  savedRow: {
    marginTop: 14,
    alignItems: 'center',
    gap: 4,
    maxWidth: '100%',
  },
  savedText: {
    fontSize: 12,
    color: C.primary,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 280,
  },
  savedShareLink: {
    fontSize: 12,
    color: C.onSurfaceVariant,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  // ── Recordings list ──
  recordingsListContainer: {
    marginTop: 40,
    width: '100%',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  recordingsListTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.onSurface,
    marginBottom: 12,
  },
  recordingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    gap: 12,
  },
  recPlayBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 219, 233, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingItemInfo: {
    flex: 1,
    overflow: 'hidden',
  },
  recNameScroll: {
    flexGrow: 0,
  },
  recNameScrollContent: {
    alignItems: 'center',
  },
  recordingItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: C.onSurface,
    marginBottom: 2,
    maxWidth: 200, // so it doesn't push the layout, but can scroll horizontally if needed
  },
  recordingItemMeta: {
    fontSize: 12,
    color: C.textMuted,
  },
  recActionBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  // ── Volume floating button ──
  floatingVolumeBtn: {
    position: 'absolute',
    right: 16,
    top: '70%',
    transform: [{ translateY: -24 }],
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  floatingNavBtn: {
    position: 'absolute',
    right: 16,
    top: '70%',
    transform: [{ translateY: 30 }],
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 219, 233, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 219, 233, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  floatingNavBtnText: {
    color: C.primary,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  // ── Volume Modal ──
  volumeModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 24,
  },
  volumeDialog: {
    width: 100,
    backgroundColor: 'rgba(22, 24, 30, 0.97)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20,
  },
  volumeDialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  volumeDialogTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: C.onSurface,
    letterSpacing: 0.5,
  },
  volumeCloseBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  volumePercentText: {
    fontSize: 18,
    fontWeight: '800',
    color: C.primary,
    fontVariant: ['tabular-nums'] as any,
    marginBottom: 12,
  },
  // ── Custom Vertical Slider ──
  sliderOuterContainer: {
    width: 44,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  sliderTrack: {
    width: 6,
    height: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 3,
    position: 'relative',
    overflow: 'visible',
  },
  sliderFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.primary,
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    left: -7,
    marginBottom: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.onSurface,
    borderWidth: 2,
    borderColor: C.primary,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  // ── Mute Button ──
  muteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  muteButtonActive: {
    backgroundColor: 'rgba(255, 77, 79, 0.15)',
    borderColor: 'rgba(255, 77, 79, 0.35)',
  },
  muteButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.onSurfaceVariant,
  },
  muteButtonTextActive: {
    color: C.recRed,
  },
  
  // ── Action Modal ──
  actionModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  actionDialog: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: 'rgba(22, 24, 30, 0.97)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingTop: 16,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20,
  },
  actionDialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  actionDialogTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: C.onSurface,
    marginRight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 12,
  },
  actionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 219, 233, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIconBoxDanger: {
    backgroundColor: 'rgba(255, 77, 79, 0.1)',
  },
  actionRowText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.onSurface,
  },
  actionRowTextDanger: {
    color: C.recRed,
  },
  actionDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
  },

  // ── Rename Modal ──
  renameDialog: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: 'rgba(22, 24, 30, 0.97)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20,
  },
  renameTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.onSurface,
    marginBottom: 16,
  },
  renameInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    color: C.onSurface,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  renameActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  renameCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  renameCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textMuted,
  },
  renameConfirmBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: C.primary,
  },
  renameConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.bg,
  },

  // Focus Styles
  focusedItem: {
    borderColor: C.primary,
    borderWidth: 2,
    transform: [{ scale: 1.05 }],
  },
  focusedButton: {
    borderColor: C.primary,
    borderWidth: 2,
    backgroundColor: 'rgba(0, 219, 233, 0.2)',
    transform: [{ scale: 1.05 }],
  },
  focusedFloatingButton: {
    borderColor: C.primary,
    borderWidth: 3,
    transform: [{ scale: 1.1 }],
  },
  focusedOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  focusedDialog: {
    borderColor: C.primary,
    borderWidth: 2,
  },
  focusedCloseButton: {
    borderColor: C.primary,
    borderWidth: 2,
  },
  focusedDeleteButton: {
    borderColor: C.recRed,
    borderWidth: 2,
  },
});

export default RootRadioScreen;
