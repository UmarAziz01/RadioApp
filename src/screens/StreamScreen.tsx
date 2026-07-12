import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
  StatusBar,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Alert,
  PanResponder,
} from 'react-native';
// Add import for Audio
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnimatedBackground from '../components/AnimatedBackground';
import { useTheme } from '@/theme/ThemeContext';
import { Audio } from 'expo-av';
import { useNavigation } from '../context/NavigationContext';
import { IconVolume, IconVolumeX } from '../components/Icons';

// react-native-webview cuma jalan di native (iOS/Android). Di web kita pakai
// <iframe> DOM biasa, jadi import-nya dibuat aman untuk kedua platform.
let WebView: any = null;
if (Platform.OS !== 'web') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  WebView = require('react-native-webview').WebView;
}

// ─────────────────────────────────────────────────────────────────────────
// STORAGE KEY
// ─────────────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'live_streams_channels_v1';

// ─── Tipe data ───
type StreamSource = {
  id: string;
  label: string;
  youtubeUrl: string; // link YouTube apa saja (watch, live, youtu.be, embed)
  audioUrl: string; // Link direct stream audio (MP3/AAC/HLS) untuk background playback
  audioStreamUrl: string;
};

type Channel = {
  id: string;
  name: string;
  description: string;
  streams: StreamSource[];
};

const uid = () => Math.random().toString(36).slice(2, 10);

// ─── Default channel & contoh isian awal (kosong — isi lewat dialog Setting) ───
const DEFAULT_CHANNELS: Channel[] = [
  {
    id: 'makkah',
    name: 'Makkah',
    description: 'Masjid al-Haram, Mekah',
    streams: [
      { id: uid(), label: 'Stream 1', youtubeUrl: 'https://www.youtube.com/live/24JXS383N1c', audioUrl: '', audioStreamUrl: '' },
      { id: uid(), label: 'Stream 2', youtubeUrl: 'https://www.youtube.com/live/p5mvSivF5Hc', audioUrl: '', audioStreamUrl: '' },
      { id: uid(), label: 'Stream 3', youtubeUrl: 'https://www.youtube.com/live/8OB5WmcfUTk', audioUrl: '', audioStreamUrl: '' },
    ],
  },
  {
    id: 'madinah',
    name: 'Madinah',
    description: 'Masjid an-Nabawi, Madinah',
    streams: [
      { id: uid(), label: 'Stream 1', youtubeUrl: 'https://www.youtube.com/live/rHWSRMcGGBQ', audioUrl: '', audioStreamUrl: '' },
      // Link ini bukan link video (hanya URL beranda YouTube dgn parameter tracking,
      // tanpa video ID) — ganti lewat dialog ⚙️ Pengaturan dengan link video yang valid.
      { id: uid(), label: 'Stream 2', youtubeUrl: '', audioUrl: '', audioStreamUrl: '' },
    ],
  },
  {
    id: 'aqsa',
    name: 'Al-Aqsa',
    description: 'Masjid al-Aqsa, Yerusalem',
    streams: [
      // Link yang diberikan juga tidak mengandung video ID — isi lewat ⚙️ Pengaturan.
      { id: uid(), label: 'Stream 1', youtubeUrl: '', audioUrl: '', audioStreamUrl: '' },
    ],
  },
  {
    id: 'hajj',
    name: 'Hajj',
    description: 'Siaran Musim Haji',
    streams: [
      { id: uid(), label: 'Stream 1', youtubeUrl: 'https://www.youtube.com/live/yYJjtr3fbZE', audioUrl: '', audioStreamUrl: '' },
      { id: uid(), label: 'Stream 2', youtubeUrl: 'https://www.youtube.com/live/ZZgws2PxldM', audioUrl: '', audioStreamUrl: '' },
    ],
  },
  {
    id: 'gontor',
    name: 'Gontor',
    description: 'Siaran dari Masjid Gontor, Ponorogo',
    streams: [
      { id: uid(), label: 'Stream 1', youtubeUrl: 'https://www.youtube.com/live/0w2YHmvRIDo', audioUrl: '', audioStreamUrl: '' },
    ],
  },
];

// ─── Ekstrak video ID YouTube dari berbagai format URL ───
function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{6,})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{6,})/,
    /youtube\.com\/live\/([a-zA-Z0-9_-]{6,})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/,
    /[?&]v=([a-zA-Z0-9_-]{6,})/,
  ];
  for (const re of patterns) {
    const m = trimmed.match(re);
    if (m && m[1]) return m[1];
  }
  // Kalau user langsung paste video ID mentah (11 karakter khas YouTube)
  if (/^[a-zA-Z0-9_-]{10,12}$/.test(trimmed)) return trimmed;
  return null;
}

// ─── Warna ───
const C = {
  bg: '#0F1115',
  surface: '#161922',
  surfaceAlt: '#1d212c',
  primary: '#00dbe9',
  onSurface: '#e2e2e8',
  onSurfaceVariant: '#b9cacb',
  textMuted: '#849495',
  border: 'rgba(255, 255, 255, 0.08)',
  liveRed: '#ff4d4f',
  danger: '#ff4d4f',
  recRed: '#ff4d4f',
};

const BREAKPOINT_TABLET = 600;
const BREAKPOINT_DESKTOP = 1024;

// ─── Gabungkan data tersimpan dengan default terbaru ───
// Tujuannya: URL default selalu muncul di Settings & tersimpan otomatis,
// tanpa menghapus stream tambahan yang sudah dibuat/diedit sendiri oleh user.
function mergeWithDefaults(stored: Channel[]): Channel[] {
  const merged: (Channel | null)[] = DEFAULT_CHANNELS.map((defaultCh) => {
    const storedCh = stored.find((c) => c.id === defaultCh.id);
    // Kalau grup default ini sudah tidak ada di storage, berarti user pernah
    // menghapusnya sendiri → jangan dimunculkan lagi.
    if (!storedCh) return null;

    const mergedStreams: StreamSource[] = defaultCh.streams.map((defaultStream) => {
      const storedStream = storedCh.streams.find((s) => s.label === defaultStream.label);
      if (!storedStream) return defaultStream; // stream default belum ada → tambahkan
      // Kalau URL tersimpan kosong tapi default punya URL, isi otomatis.
      // Kalau user sudah isi URL sendiri, jangan ditimpa.
      const youtubeUrl = storedStream.youtubeUrl?.trim() ? storedStream.youtubeUrl : defaultStream.youtubeUrl;
      const audioUrl = storedStream.audioUrl?.trim() ? storedStream.audioUrl : defaultStream.audioUrl;
      const audioStreamUrl = storedStream.audioStreamUrl?.trim() ? storedStream.audioStreamUrl : defaultStream.audioStreamUrl;
      return { ...storedStream, youtubeUrl, audioUrl, audioStreamUrl };
    });

    // Tambahkan stream ekstra yang dibuat sendiri oleh user (tidak ada di default)
    const extraStreams = storedCh.streams.filter(
      (s) => !defaultCh.streams.some((d) => d.label === s.label)
    );

    return { ...storedCh, streams: [...mergedStreams, ...extraStreams] };
  });

  const mergedChannels = merged.filter((c): c is Channel => c !== null);

  // Tambahkan grup ekstra yang dibuat sendiri oleh user (custom, di luar 4 default)
  const extraChannels = stored.filter((c) => !DEFAULT_CHANNELS.some((d) => d.id === c.id));

  return [...mergedChannels, ...extraChannels];
}


const YouTubeEmbed = ({ videoId }: { videoId: string }) => {
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3`;
  const webContainerRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || !webContainerRef.current) return;
    const container = webContainerRef.current;
    container.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.style.border = '0';
    iframe.allow =
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    container.appendChild(iframe);
    return () => {
      container.innerHTML = '';
    };
  }, [embedUrl]);

  if (Platform.OS === 'web') {
    // @ts-ignore - ref dipakai untuk manipulasi DOM langsung (lihat useEffect di atas)
    return <View ref={webContainerRef} style={styles.embedFill} />;
  }

  return (
    <WebView
      source={{ uri: embedUrl }}
      style={styles.embedFill}
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
      javaScriptEnabled
      domStorageEnabled
      allowsFullscreenVideo
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────
// Ikon sederhana (tanpa dependency icon library tambahan)
// ─────────────────────────────────────────────────────────────────────────
const GearIcon = () => <Text style={{ fontSize: 20 }}>⚙️</Text>;
const CloseIcon = () => <Text style={{ fontSize: 22, color: C.onSurface }}>✕</Text>;
const TrashIcon = () => <Text style={{ fontSize: 16 }}>🗑️</Text>;

// ─────────────────────────────────────────────────────────────────────────
// Layar utama
// ─────────────────────────────────────────────────────────────────────────
const LiveStreamsYouTubeScreen = () => {
  const { width: winWidth } = useWindowDimensions();
  const isDesktop = winWidth >= BREAKPOINT_DESKTOP;
  const isTablet = winWidth >= BREAKPOINT_TABLET && winWidth < BREAKPOINT_DESKTOP;
  const contentMaxWidth = isDesktop ? 900 : isTablet ? 700 : winWidth;
  const horizontalPadding = isDesktop || isTablet ? 32 : 16;

  const { colors, isDark } = useTheme();
  const { setActiveScreen } = useNavigation();

  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(1.0);
  const [showVolumeModal, setShowVolumeModal] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playerState, setPlayerState] = useState<'stopped' | 'playing' | 'paused'>('stopped');
  const [isLoading, setIsLoading] = useState(false);
  const [channels, setChannels] = useState<Channel[]>(DEFAULT_CHANNELS);
  const [loaded, setLoaded] = useState(false);
  const [activeChannelId, setActiveChannelId] = useState(DEFAULT_CHANNELS[0].id);
  const [streamIndex, setStreamIndex] = useState(0);
  const [settingsVisible, setSettingsVisible] = useState(false);

  // ── Load pengaturan tersimpan, digabung dengan default terbaru ──
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: Channel[] = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setChannels(mergeWithDefaults(parsed));
          } else {
            setChannels(DEFAULT_CHANNELS);
          }
        } else {
          // Belum ada data sama sekali → langsung pakai default
          setChannels(DEFAULT_CHANNELS);
        }
      } catch (e) {
        console.error('Gagal memuat pengaturan stream:', e);
        setChannels(DEFAULT_CHANNELS);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // ── Simpan otomatis tiap kali channels berubah ──
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(channels)).catch((e) =>
      console.error('Gagal menyimpan pengaturan stream:', e)
    );
  }, [channels, loaded]);

  const activeChannel = channels.find((c) => c.id === activeChannelId) ?? channels[0];
  const availableStreams = useMemo(
    () => activeChannel.streams.filter((s) => !!extractYoutubeId(s.youtubeUrl)),
    [activeChannel]
  );
  const currentStream = availableStreams[streamIndex];
  const currentVideoId = currentStream ? extractYoutubeId(currentStream.youtubeUrl) : null;

  useEffect(() => {
    setStreamIndex(0);
  }, [activeChannelId]);

  const handleSelectChannel = useCallback((id: string) => {
    setActiveChannelId(id);
  }, []);

  const stopStreamAudio = useCallback(async () => {
    if (Platform.OS === 'web') {
      try {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
          audioRef.current = null;
        }
      } catch (e) {
        console.error('Failed to stop stream audio (web):', e);
      }
    }

    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      } catch (e) {
        console.error('Failed to stop stream audio:', e);
      }
    }
    setPlayerState('stopped');
  }, [sound]);

  const playStreamAudio = useCallback(async (url: string) => {
    if (!url) return;
    setIsLoading(true);

    try {
      // Stop current sound first
      await stopStreamAudio();

      if (Platform.OS === 'web') {
        const audio = new window.Audio(url);
        audio.crossOrigin = 'anonymous';
        audio.volume = isMuted ? 0 : volume;
        audioRef.current = audio;

        audio.addEventListener('playing', () => {
          setPlayerState('playing');
          setIsLoading(false);
        });

        audio.addEventListener('error', (e) => {
          console.error('Audio error:', e);
          setIsLoading(false);
        });

        await audio.play();
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: url },
          { shouldPlay: true, volume: isMuted ? 0 : volume },
          (status) => {
            if (status.isLoaded && status.isPlaying) {
              setPlayerState('playing');
              setIsLoading(false);
            }
          }
        );
        setSound(newSound);
      }
    } catch (e) {
      console.error('Failed to play stream audio:', e);
      setIsLoading(false);
    }
  }, [isMuted, volume, stopStreamAudio]);

  const handleSelectStream = useCallback((idx: number) => {
    setStreamIndex(idx);
  }, []);

  // ── Auto-play audio when stream changes ───
  useEffect(() => {
    if (currentStream?.audioUrl) {
      playStreamAudio(currentStream.audioUrl);
    } else {
      stopStreamAudio();
    }
  }, [currentStream, playStreamAudio, stopStreamAudio]);

  // ── Cleanup on unmount ───
  useEffect(() => {
    return () => {
      stopStreamAudio();
    };
  }, [stopStreamAudio]);

  // ── Fungsi kelola channel/stream dari dialog Setting ──
  const updateStream = useCallback(
    (channelId: string, streamId: string, patch: Partial<StreamSource>) => {
      setChannels((prev) =>
        prev.map((ch) =>
          ch.id !== channelId
            ? ch
            : { ...ch, streams: ch.streams.map((s) => (s.id === streamId ? { ...s, ...patch } : s)) }
        )
      );
    },
    []
  );

  const addStream = useCallback((channelId: string) => {
    setChannels((prev) =>
      prev.map((ch) =>
        ch.id !== channelId
          ? ch
          : {
              ...ch,
              streams: [
                ...ch.streams,
                { id: uid(), label: `Stream ${ch.streams.length + 1}`, youtubeUrl: '', audioUrl: '', audioStreamUrl: '' },
              ],
            }
      )
    );
  }, []);

  const removeStream = useCallback((channelId: string, streamId: string) => {
    setChannels((prev) =>
      prev.map((ch) =>
        ch.id !== channelId ? ch : { ...ch, streams: ch.streams.filter((s) => s.id !== streamId) }
      )
    );
  }, []);

  const confirmRemoveStream = useCallback(
    (channelId: string, streamId: string, label: string) => {
      if (Platform.OS === 'web') {
        removeStream(channelId, streamId);
        return;
      }
      Alert.alert('Hapus stream?', `Hapus "${label}" dari daftar?`, [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: () => removeStream(channelId, streamId) },
      ]);
    },
    [removeStream]
  );

  // ── Fungsi kelola GRUP (channel) dari dialog Setting ──
  const updateChannel = useCallback((channelId: string, patch: Partial<Pick<Channel, 'name' | 'description'>>) => {
    setChannels((prev) => prev.map((ch) => (ch.id === channelId ? { ...ch, ...patch } : ch)));
  }, []);

  const addChannel = useCallback(() => {
    const newChannel: Channel = {
      id: uid(),
      name: '',
      description: '',
      streams: [{ id: uid(), label: 'Stream 1', youtubeUrl: '', audioUrl: '', audioStreamUrl: '' }],
    };
    setChannels((prev) => [...prev, newChannel]);
  }, []);

  const removeChannel = useCallback(
    (channelId: string) => {
      setChannels((prev) => {
        if (prev.length <= 1) return prev; // selalu sisakan minimal 1 grup
        const next = prev.filter((ch) => ch.id !== channelId);
        if (activeChannelId === channelId) {
          setActiveChannelId(next[0].id);
        }
        return next;
      });
    },
    [activeChannelId]
  );

  const confirmRemoveChannel = useCallback(
    (channelId: string, name: string) => {
      if (channels.length <= 1) {
        if (Platform.OS === 'web') {
          window.alert?.('Minimal harus ada 1 grup stream.');
        } else {
          Alert.alert('Tidak bisa dihapus', 'Minimal harus ada 1 grup stream.');
        }
        return;
      }
      if (Platform.OS === 'web') {
        removeChannel(channelId);
        return;
      }
      Alert.alert('Hapus grup stream?', `Hapus grup "${name || '(tanpa nama)'}" beserta semua streamnya?`, [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: () => removeChannel(channelId) },
      ]);
    },
    [channels.length, removeChannel]
  );

    // ── Volume handlers ──
    const SLIDER_TRACK_HEIGHT = 160;
  
    const applyVolume = useCallback((vol: number) => {
      if (Platform.OS === 'web') {
        if (audioRef.current) {
          audioRef.current.volume = vol;
        }
      } else {
        if (sound) {
          sound.setVolumeAsync(vol).catch(() => {});
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

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <View style={{ position: 'absolute', top: 100, left: 0, right: 0, bottom: 0, zIndex: -1 }}>
        <AnimatedBackground />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }]}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Live Streams</Text>
            <Text style={styles.subtitle}>Masjid al-Haram, an-Nabawi, al-Aqsa, Hajj & Gontor</Text>
          </View>

          {/* ── Channel selector ── */}
          <View style={styles.channelRow}>
            {channels.map((ch) => {
              const active = ch.id === activeChannelId;
              return (
                <TouchableOpacity
                  key={ch.id}
                  style={[styles.channelChip, active && styles.channelChipActive]}
                  onPress={() => handleSelectChannel(ch.id)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.channelChipText, active && styles.channelChipTextActive]}>
                    {ch.name || 'Grup Baru'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.channelDescription}>{activeChannel.description}</Text>


          {/* ── Player ── */}
          <View style={styles.playerWrap}>
            {currentVideoId ? (
              <>
                <YouTubeEmbed videoId={currentVideoId} />
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveBadgeText}>LIVE</Text>
                </View>
              </>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  Belum ada link YouTube untuk channel ini.{'\n'}
                  Ketuk ⚙️ di pojok kanan atas untuk menambahkannya.
                </Text>
                <TouchableOpacity
                  style={styles.emptyStateButton}
                  onPress={() => setSettingsVisible(true)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.emptyStateButtonText}>Buka Pengaturan</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* ── Stream source selector ── */}
          {availableStreams.length > 0 && (
            <View style={styles.streamRow}>
              {availableStreams.map((s, idx) => {
                const active = idx === streamIndex;
                return (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.streamButton, active && styles.streamButtonActive]}
                    onPress={() => handleSelectStream(idx)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.streamButtonText, active && styles.streamButtonTextActive]}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <Text style={styles.hintText}>
            Kalau stream berhenti/error, coba pilih tombol Stream lain di atas, atau tambah link baru
            lewat ⚙️ Pengaturan.
          </Text>
        </View>

                  {/* ── Tombol Setting (di tengah) ── */}
          <View style={styles.settingsButtonRow}>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => setSettingsVisible(true)}
              activeOpacity={0.8}
            >
              <GearIcon />
              <Text style={styles.settingsButtonText}>Pengaturan Stream</Text>
            </TouchableOpacity>
          </View>
      </ScrollView>

      {/* ── Floating Volume Button (kanan layar) ── */}
      <TouchableOpacity
        style={styles.floatingVolumeBtn}
        onPress={() => setShowVolumeModal(true)}
        activeOpacity={0.8}
      >
        {isMuted || effectiveVolume === 0 ? (
          <IconVolumeX size={22} color={C.recRed} />
        ) : (
          <IconVolume size={22} color={C.primary} />
        )}
      </TouchableOpacity>

      {/* ── Floating Navigation Button (bawah volume) ── */}
      <TouchableOpacity
        style={styles.floatingNavBtn}
        onPress={() => setActiveScreen('root')}
        activeOpacity={0.8}
      >
        <Text style={styles.floatingNavBtnText}>{'Radio'}</Text>
      </TouchableOpacity>

      {/* ── Volume Modal ── */}
      <Modal
        visible={showVolumeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowVolumeModal(false)}
      >
        <TouchableOpacity
          style={styles.volumeModalOverlay}
          activeOpacity={1}
          onPress={() => setShowVolumeModal(false)}
        >
          <TouchableOpacity
            style={styles.volumeDialog}
            activeOpacity={1}
            onPress={() => {}}
          >
            {/* Dialog Header */}
            <View style={styles.volumeDialogHeader}>
              <Text style={styles.volumeDialogTitle}>Volume</Text>
              <TouchableOpacity onPress={() => setShowVolumeModal(false)} style={styles.volumeCloseBtn}>
                <Text style={styles.volumeCloseBtnText}>✕</Text>
              </TouchableOpacity>
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
            <TouchableOpacity
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
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ── Dialog Pengaturan (fullscreen) ── */}
      <Modal
        visible={settingsVisible}
        animationType="slide"
        presentationStyle={Platform.OS === 'ios' ? 'fullScreen' : undefined}
        onRequestClose={() => setSettingsVisible(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: colors.background }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
          <View style={styles.settingsHeader}>
            <Text style={styles.settingsTitle}>Pengaturan Stream</Text>
            <TouchableOpacity onPress={() => setSettingsVisible(false)} activeOpacity={0.8}>
              <CloseIcon />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.settingsScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {channels.map((ch) => (
              <View key={ch.id} style={styles.settingsChannelCard}>
                <View style={styles.channelHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      style={[styles.input, styles.channelNameInput]}
                      value={ch.name}
                      placeholder="Nama grup (mis. Makkah)"
                      placeholderTextColor={C.textMuted}
                      onChangeText={(text) => updateChannel(ch.id, { name: text })}
                    />
                    <TextInput
                      style={[styles.input, { marginTop: 6 }]}
                      value={ch.description}
                      placeholder="Deskripsi grup (mis. Masjid al-Haram, Mekah)"
                      placeholderTextColor={C.textMuted}
                      onChangeText={(text) => updateChannel(ch.id, { description: text })}
                    />
                  </View>
                  <TouchableOpacity
                    style={[styles.deleteButton, styles.deleteChannelButton]}
                    onPress={() => confirmRemoveChannel(ch.id, ch.name)}
                    activeOpacity={0.8}
                  >
                    <TrashIcon />
                  </TouchableOpacity>
                </View>

                {ch.streams.map((s) => {
                  const youtubeValid = !!extractYoutubeId(s.youtubeUrl);
                  // For audioStreamUrl, a simple non-empty check is sufficient for basic validity
                  const audioValid = !!s.audioStreamUrl?.trim();
                  return (
                    <View key={s.id}>
                      <View style={styles.streamEditRow}>
                        <View style={{ flex: 1 }}>
                          <TextInput
                            style={styles.input}
                            value={s.label}
                            placeholder="Nama stream (mis. Stream 1)"
                            placeholderTextColor={C.textMuted}
                            onChangeText={(text) => updateStream(ch.id, s.id, { label: text })}
                          />
                          <TextInput
                            style={[styles.input, { marginTop: 6 }]}
                            value={s.youtubeUrl}
                            placeholder="Tempel link YouTube di sini"
                            placeholderTextColor={C.textMuted}
                            autoCapitalize="none"
                            autoCorrect={false}
                            onChangeText={(text) => updateStream(ch.id, s.id, { youtubeUrl: text })}
                          />
                          {s.youtubeUrl.length > 0 && (
                            <Text style={[styles.validationText, youtubeValid ? styles.validText : styles.invalidText]}>
                              {youtubeValid ? '✓ Link valid' : '✕ Link tidak dikenali'}
                            </Text>
                          )}
                          <TextInput
                            style={[styles.input, { marginTop: 6 }]}
                            value={s.audioStreamUrl}
                            placeholder="Tempel link Audio Stream di sini"
                            placeholderTextColor={C.textMuted}
                            autoCapitalize="none"
                            autoCorrect={false}
                            onChangeText={(text) => updateStream(ch.id, s.id, { audioStreamUrl: text })}
                          />
                          {s.audioStreamUrl.length > 0 && (
                            <Text style={[styles.validationText, audioValid ? styles.validText : styles.invalidText]}>
                              {audioValid ? '✓ Link audio valid' : '✕ Link audio tidak valid'}
                            </Text>
                          )}
                        </View>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => confirmRemoveStream(ch.id, s.id, s.label)}
                          activeOpacity={0.8}
                        >
                          <TrashIcon />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.streamDivider} />
                    </View>
                  );
                })}

                <TouchableOpacity
                  style={styles.addStreamButton}
                  onPress={() => addStream(ch.id)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.addStreamButtonText}>+ Tambah Stream</Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* ── Tambah grup stream baru (custom, nama & deskripsi bebas) ── */}
            <TouchableOpacity
              style={styles.addChannelButton}
              onPress={addChannel}
              activeOpacity={0.85}
            >
              <Text style={styles.addChannelButtonText}>+ Tambahkan Grup Stream Baru</Text>
            </TouchableOpacity>

            <Text style={styles.settingsFooterHint}>
              Contoh link yang didukung: youtube.com/watch?v=..., youtube.com/live/..., youtu.be/...
            </Text>
          </ScrollView>

          <View style={styles.settingsDoneRow}>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setSettingsVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.doneButtonText}>Selesai</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1, width: '100%' },
  scrollContent: { flexGrow: 1, paddingVertical: 24, alignItems: 'center' },
  content: { width: '100%' },

  titleRow: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: C.onSurface,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: C.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  settingsButtonRow: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 18,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  settingsButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.onSurfaceVariant,
  },

  channelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 8,
  },
  channelChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  channelChipActive: {
    backgroundColor: 'rgba(0, 219, 233, 0.15)',
    borderColor: C.primary,
  },
  channelChipText: { fontSize: 14, fontWeight: '600', color: C.onSurfaceVariant },
  channelChipTextActive: { color: C.primary },

  channelDescription: {
    fontSize: 13,
    color: C.textMuted,
    textAlign: 'center',
    marginBottom: 18,
  },

  playerWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: C.border,
  },
  embedFill: { width: '100%', height: '100%' },

  liveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.liveRed },
  liveBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 1 },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 14 },
  emptyStateText: { color: C.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 20 },
  emptyStateButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: C.primary,
  },
  emptyStateButtonText: { color: C.bg, fontWeight: '700', fontSize: 13 },

  streamRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 18,
  },
  streamButton: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: C.border,
  },
  streamButtonActive: { backgroundColor: C.primary, borderColor: C.primary },
  streamButtonText: { fontSize: 13, fontWeight: '600', color: C.onSurfaceVariant },
  streamButtonTextActive: { color: C.bg },

  hintText: { fontSize: 12, color: C.textMuted, textAlign: 'center', marginTop: 16 },

  // ── Settings dialog ──
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  settingsTitle: { fontSize: 20, fontWeight: '800', color: C.onSurface },

  settingsScrollContent: { padding: 20, paddingBottom: 40, gap: 16 },

  settingsChannelCard: {
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    gap: 10,
    marginBottom: 16,
  },
  settingsChannelName: { fontSize: 16, fontWeight: '700', color: C.onSurface },
  settingsChannelDesc: { fontSize: 12, color: C.textMuted, marginBottom: 4 },

  channelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  channelNameInput: {
    fontSize: 15,
    fontWeight: '700',
  },
  deleteChannelButton: {
    backgroundColor: 'rgba(255,77,79,0.16)',
  },

  streamEditRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  input: {
    backgroundColor: C.surfaceAlt,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: C.onSurface,
    fontSize: 13,
  },
  validationText: { fontSize: 11, marginTop: 4, fontWeight: '600' },
  validText: { color: '#4ade80' },
  invalidText: { color: C.danger },

  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,77,79,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,77,79,0.3)',
    marginTop: 2,
  },

  addStreamButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(0,219,233,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,219,233,0.3)',
    marginTop: 4,
  },
  addStreamButtonText: { color: C.primary, fontSize: 13, fontWeight: '700' },

  addChannelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(0,219,233,0.08)',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(0,219,233,0.4)',
    marginBottom: 16,
  },
  addChannelButtonText: { color: C.primary, fontSize: 14, fontWeight: '700' },

  settingsFooterHint: {
    fontSize: 11,
    color: C.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },

  settingsDoneRow: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  doneButton: {
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneButtonText: { color: C.bg, fontWeight: '800', fontSize: 15 },

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
  // ── Floating Navigation Button ──
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
  volumeCloseBtnText: {
    fontSize: 12,
    color: C.textMuted,
    fontWeight: '700',
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
  streamDivider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 10,
    marginHorizontal: -16, // Adjust to extend across the card
  },
});

export default LiveStreamsYouTubeScreen;
