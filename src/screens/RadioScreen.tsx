import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
  StatusBar,
  ScrollView,
  Animated as RNAnimated,
} from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AnimatedBackground from '../components/AnimatedBackground';
import { useTheme } from '../theme/ThemeContext';
import { IconPlay, IconPause, IconStop, IconLive } from '../components/Icons';

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

// ─── Helper: format detik ke HH:MM:SS ───
const formatTime = (totalSeconds: number): string => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

const RootRadioScreen = () => {
  const { colors, isDark } = useTheme();
  const { width: winWidth, height: winHeight } = useWindowDimensions();

  // ── Responsive helpers ──
  const isDesktop = winWidth >= BREAKPOINT_DESKTOP;
  const isTablet = winWidth >= BREAKPOINT_TABLET && winWidth < BREAKPOINT_DESKTOP;
  const isCompact = winWidth < 360;
  // Layar pendek (hp kecil, browser dgn address bar, landscape) → rapatkan jarak vertikal
  // supaya semua elemen (termasuk teks "Ketuk untuk Memutar") tetap muat tanpa terpotong.
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

  // Jarak dihilangkan supaya judul benar-benar menempel di paling atas.
  const contentTopPadding = 0;

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playerState, setPlayerState] = useState<'stopped' | 'playing' | 'paused'>('stopped');
  const [isLoading, setIsLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0); // total detik stopwatch

  // ── Recording state ──
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingBusy, setIsRecordingBusy] = useState(false); // saat start/stop sedang diproses
  const [recordingElapsed, setRecordingElapsed] = useState(0);
  const [lastRecordingName, setLastRecordingName] = useState<string | null>(null);
  const [lastRecordingUri, setLastRecordingUri] = useState<string | null>(null); // hanya dipakai di mobile, untuk tombol "Bagikan lagi"

  // Audio ref for web
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── Stopwatch refs ──
  const sessionStartRef = useRef<number | null>(null);  // timestamp kapan play (dari stop)
  const pauseStartRef = useRef<number | null>(null);     // timestamp kapan pause dimulai
  const totalPausedRef = useRef(0);                      // akumulasi detik pause di sesi ini
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPlaying = playerState === 'playing';

  // ── Recording refs ──
  const recordingStartRef = useRef<number | null>(null);
  const recordingTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nativeRecordingRef = useRef<Audio.Recording | null>(null); // mobile

  // ── Refs khusus web: pipeline encoding MP3 langsung dari audio yang diputar ──
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const sourceAudioElRef = useRef<HTMLAudioElement | null>(null); // elemen audio yang sedang tersambung ke sourceNode
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const muteGainRef = useRef<GainNode | null>(null);
  const mp3EncoderRef = useRef<any>(null);
  const mp3DataRef = useRef<Int8Array[]>([]);

  // Animasi visualizer bars
  const barAnimations = useRef(
    Array.from({ length: NUM_BARS }, () => new RNAnimated.Value(0.3))
  ).current;

  // Animasi pulsating untuk dot REC
  const recDotOpacity = useRef(new RNAnimated.Value(1)).current;

  // Cleanup
  useEffect(() => {
    return () => {
      // Cleanup web audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
      // Cleanup pipeline recording MP3 (web)
      if (processorNodeRef.current) {
        try {
          processorNodeRef.current.disconnect();
          processorNodeRef.current.onaudioprocess = null;
        } catch {}
      }
      if (muteGainRef.current) {
        try { muteGainRef.current.disconnect(); } catch {}
      }
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch {}
      }
      // Cleanup recorder mobile kalau masih aktif
      if (nativeRecordingRef.current) {
        nativeRecordingRef.current.stopAndUnloadAsync().catch(() => {});
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
      tick(); // update segera
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

  const playRadio = useCallback(async () => {
    const wasStopped = playerState === 'stopped';
    setIsLoading(true);

    if (Platform.OS === 'web') {
      try {
        if (wasStopped || !audioRef.current) {
          // Create fresh audio element (stop → play)
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
            audioRef.current = null;
          }
          const audio = new window.Audio(STREAM_URL);
          audio.crossOrigin = 'anonymous'; // dibutuhkan agar captureStream() bisa dipakai untuk recording
          audioRef.current = audio;

          audio.addEventListener('playing', () => {
            setPlayerState('playing');
            setIsLoading(false);
          });

          audio.addEventListener('pause', () => {
            // hanya update jika bukan karena stop
          });

          audio.addEventListener('error', (_e: Event) => {
            console.error('Audio error');
            setIsLoading(false);
          });

          await audio.play();
        } else {
          // Resume from pause
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
      // Mobile/Expo
      try {
        if (wasStopped) {
          // Stop existing sound if any
          if (sound) {
            await sound.stopAsync();
            await sound.unloadAsync();
          }

          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: STREAM_URL },
            { shouldPlay: true },
            (status) => {
              if (status.isLoaded && status.isPlaying) {
                setPlayerState('playing');
                setIsLoading(false);
              }
            }
          );
          setSound(newSound);
        } else {
          // Resume from pause
          if (sound) {
            await sound.playAsync();
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

    // ── Stopwatch logic ──
    if (wasStopped) {
      // Mulai stopwatch baru dari 0
      sessionStartRef.current = Date.now();
      totalPausedRef.current = 0;
      pauseStartRef.current = null;
    } else {
      // Resume — kurangi durasi pause
      if (pauseStartRef.current !== null) {
        totalPausedRef.current += Math.floor((Date.now() - pauseStartRef.current) / 1000);
        pauseStartRef.current = null;
      }
    }
  }, [playerState, sound]);

  const pauseRadio = useCallback(async () => {
    // Catat waktu pause untuk stopwatch
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
        await sound.pauseAsync();
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
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      } catch (e) {
        console.error('Failed to stop radio:', e);
      }
    }

    // Reset stopwatch
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

  // Pindahkan file rekaman dari cache sementara ke folder permanen aplikasi,
  // lalu buka share sheet supaya user bisa langsung simpan ke Files/Drive/WhatsApp/dll.
  const saveNativeRecording = useCallback(async (rawUri: string) => {
    try {
      const dir = (FileSystem as any).documentDirectory + 'recordings/';
      const dirInfo = await FileSystem.getInfoAsync(dir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      }

      const fileName = `suara-muslim-${Date.now()}.m4a`;
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

  // ─── RECORDING ───
  const startRecording = useCallback(async () => {
    if (playerState !== 'playing' || isRecording || isRecordingBusy) return;
    setIsRecordingBusy(true);
    setLastRecordingUri(null);
    setLastRecordingName(null);

    try {
      if (Platform.OS === 'web') {
        if (!audioRef.current) {
          console.error('Radio belum diputar.');
          setIsRecordingBusy(false);
          return;
        }

        // lamejs = encoder MP3 murni JS, di-load dinamis supaya tidak ikut ter-bundle di build native.
        // Perlu ditambahkan ke project: npm install lamejs
        // @ts-ignore - lamejs tidak menyertakan tipe TypeScript
        const lamejsModule = await import('lamejs');
        const Lame: any = (lamejsModule as any).default || lamejsModule;

        if (!audioCtxRef.current) {
          const AudioContextCtor =
            window.AudioContext || (window as any).webkitAudioContext;
          audioCtxRef.current = new AudioContextCtor();
        }
        const audioCtx = audioCtxRef.current;
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }

        // createMediaElementSource() hanya boleh dipanggil sekali per elemen <audio>.
        // Kalau elemen audio berganti (setelah Stop lalu Play lagi), buat source baru.
        if (sourceNodeRef.current && sourceAudioElRef.current !== audioRef.current) {
          try { sourceNodeRef.current.disconnect(); } catch {}
          sourceNodeRef.current = null;
        }
        if (!sourceNodeRef.current) {
          const node = audioCtx.createMediaElementSource(audioRef.current);
          node.connect(audioCtx.destination); // penting: supaya suara radio tetap terdengar
          sourceNodeRef.current = node;
          sourceAudioElRef.current = audioRef.current;
        }

        const sampleRate = audioCtx.sampleRate;
        mp3EncoderRef.current = new Lame.Mp3Encoder(1, sampleRate, 128); // mono, 128kbps
        mp3DataRef.current = [];

        const bufferSize = 4096;
        const processor = audioCtx.createScriptProcessor(bufferSize, 1, 1);
        processor.onaudioprocess = (e: AudioProcessingEvent) => {
          const input = e.inputBuffer.getChannelData(0);
          const samples = new Int16Array(input.length);
          for (let i = 0; i < input.length; i++) {
            const s = Math.max(-1, Math.min(1, input[i]));
            samples[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
          }
          const mp3buf = mp3EncoderRef.current.encodeBuffer(samples);
          if (mp3buf.length > 0) {
            mp3DataRef.current.push(new Int8Array(mp3buf));
          }
        };

        // Rute processor ke gain bervolume 0 (bukan langsung ke destination) supaya
        // tidak menggandakan suara yang sudah keluar lewat sourceNode di atas,
        // sekaligus tetap menjaga graph "aktif" agar onaudioprocess terus jalan.
        const muteGain = audioCtx.createGain();
        muteGain.gain.value = 0;
        sourceNodeRef.current.connect(processor);
        processor.connect(muteGain);
        muteGain.connect(audioCtx.destination);

        processorNodeRef.current = processor;
        muteGainRef.current = muteGain;
      } else {
        // Mobile/Expo — merekam via microphone (mengikuti output radio)
        const perm = await Audio.requestPermissionsAsync();
        if (!perm.granted) {
          console.error('Izin mikrofon ditolak.');
          setIsRecordingBusy(false);
          return;
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });

        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        nativeRecordingRef.current = recording;
      }

      recordingStartRef.current = Date.now();
      setRecordingElapsed(0);
      setIsRecording(true);
    } catch (e) {
      console.error('Gagal memulai rekaman:', e);
    } finally {
      setIsRecordingBusy(false);
    }
  }, [playerState, isRecording, isRecordingBusy]);

  const stopRecording = useCallback(async () => {
    if (!isRecording) return;
    setIsRecordingBusy(true);

    try {
      if (Platform.OS === 'web') {
        // Lepas processor & mute-gain (sourceNode tetap tersambung supaya radio terus terdengar)
        if (processorNodeRef.current) {
          processorNodeRef.current.disconnect();
          processorNodeRef.current.onaudioprocess = null;
          processorNodeRef.current = null;
        }
        if (muteGainRef.current) {
          muteGainRef.current.disconnect();
          muteGainRef.current = null;
        }

        if (mp3EncoderRef.current) {
          const finalBuf = mp3EncoderRef.current.flush();
          if (finalBuf.length > 0) {
            mp3DataRef.current.push(new Int8Array(finalBuf));
          }

          const blob = new Blob(mp3DataRef.current as BlobPart[], { type: 'audio/mpeg' });
          const url = URL.createObjectURL(blob);
          const fileName = `suara-muslim-${Date.now()}.mp3`;
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 2000);
          setLastRecordingName(fileName);

          mp3EncoderRef.current = null;
          mp3DataRef.current = [];
        }
      } else {
        if (nativeRecordingRef.current) {
          const rawUri = nativeRecordingRef.current.getURI();
          await nativeRecordingRef.current.stopAndUnloadAsync();
          nativeRecordingRef.current = null;
          if (rawUri) {
            await saveNativeRecording(rawUri);
          }
        }
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      }
    } catch (e) {
      console.error('Gagal menghentikan rekaman:', e);
    } finally {
      recordingStartRef.current = null;
      setRecordingElapsed(0);
      setIsRecording(false);
      setIsRecordingBusy(false);
    }
  }, [isRecording, saveNativeRecording]);

  const handleToggleRecord = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const recordDisabled = playerState !== 'playing' || isRecordingBusy;

  // ─── RENDER ───
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <View style={{ position: 'absolute', top: 100, left: 0, right: 0, bottom: 0, zIndex: -1 }}>
  <AnimatedBackground />
</View>

      {/* ScrollView memastikan seluruh konten (termasuk teks status di bawah) selalu bisa
          dijangkau walaupun layar pendek atau ada elemen tambahan (badge/progress rekaman) */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─────── KONTEN UTAMA (dibatasi lebar & center supaya rapi di tablet/desktop) ─────── */}
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
        {/* Container untuk elemen teks utama (center horizontal & vertikal) */}
        <View style={styles.textElementsContainer}>
          {/* Judul Radio */}
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

        {/* Visualizer */}
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
                  {
                    transform: [{ scaleY: anim }],
                  },
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
                  {
                    transform: [{ scaleY: anim }],
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Stopwatch */}
        <View style={[styles.stopwatchRow, { marginBottom: stopwatchMarginBottom }]}>
          <Text style={[styles.stopwatchText, isCompact && { fontSize: 24 }]}>
            {formatTime(elapsed)}
          </Text>
        </View>

        {/* Progress bar rekaman (indeterminate, tampil hanya saat merekam) */}
        {isRecording && (
          <View style={styles.recProgressTrack}>
            <RNAnimated.View style={[styles.recProgressFill, { opacity: recDotOpacity }]} />
          </View>
        )}

        {/* Tombol Stop / Play-Pause / Record */}
        <View style={[styles.controlsRow, { marginBottom: controlsMarginBottom }]}>
          <TouchableOpacity
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
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.playButton,
              {
                width: playButtonSize,
                height: playButtonSize,
                borderRadius: playButtonSize / 2,
              },
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
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              {
                width: recordButtonSize,
                height: recordButtonSize,
                borderRadius: recordButtonSize / 2,
              },
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
          </TouchableOpacity>
        </View>

        {/* Status Text */}
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

        {/* Konfirmasi file rekaman terakhir */}
        {!isRecording && lastRecordingName && (
          <View style={styles.savedRow}>
            <Text style={styles.savedText} numberOfLines={1}>
              ✓ Tersimpan: {lastRecordingName}
            </Text>
            {Platform.OS !== 'web' && lastRecordingUri && (
              <TouchableOpacity
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
              </TouchableOpacity>
            )}
          </View>
        )}
        </View>
      </ScrollView>
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
});

export default RootRadioScreen;