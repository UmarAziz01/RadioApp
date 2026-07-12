import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';

// ─────────────────────────────────────────────────────────────────────────
// PENTING — ISI URL STREAM DI SINI
// ─────────────────────────────────────────────────────────────────────────
// URL video (.m3u8 / HLS) makkahlive.net dimuat lewat JavaScript di sisi
// mereka, jadi tidak bisa saya ambil otomatis dari HTML halaman.
// Cara mendapatkannya sendiri (untuk penggunaan pribadi/edukasi):
//   1. Buka halaman targetnya, mis. https://makkahlive.net/en/live/makkah
//   2. Buka DevTools (F12) → tab "Network" → filter "Fetch/XHR" atau ketik "m3u8"
//   3. Putar videonya, lalu cari request yang berakhiran .m3u8
//   4. Klik kanan → "Copy URL" lalu tempel ke bawah ini
// Ulangi untuk tiap tombol "Stream 1/2/3/4..." yang ada di halaman itu.
// Jika linknya kosong (''), tombol otomatis disembunyikan dari UI.
// ─────────────────────────────────────────────────────────────────────────

type StreamSource = {
  label: string;
  url: string; // link .m3u8 (HLS) atau mp4 langsung
};

type Channel = {
  id: string;
  name: string;
  description: string;
  poster: string;
  streams: StreamSource[];
};

const CHANNELS: Channel[] = [
  {
    id: 'makkah',
    name: 'Makkah',
    description: 'Masjid al-Haram, Mekah',
    poster: 'https://makkahlive.net/posters/makkah.webp',
    streams: [
      { label: 'Stream 1', url: '' },
      { label: 'Stream 2', url: '' },
      { label: 'Stream 3', url: '' },
    ],
  },
  {
    id: 'madinah',
    name: 'Madinah',
    description: 'Masjid an-Nabawi, Madinah',
    poster: 'https://makkahlive.net/posters/madinah.webp',
    streams: [
      { label: 'Stream 1', url: '' },
      { label: 'Stream 2', url: '' },
      { label: 'Stream 3', url: '' },
    ],
  },
  {
    id: 'aqsa',
    name: 'Al-Aqsa',
    description: 'Masjid al-Aqsa, Yerusalem',
    poster: 'https://makkahlive.net/posters/aqsa.webp',
    streams: [
      { label: 'Stream 1', url: '' },
      { label: 'Stream 2', url: '' },
    ],
  },
  {
    id: 'hajj',
    name: 'Hajj',
    description: 'Siaran Musim Haji',
    poster: 'https://makkahlive.net/posters/hajj.webp',
    streams: [
      { label: 'Stream 1', url: '' },
      { label: 'Stream 2', url: '' },
    ],
  },
];

// ─── Warna (senada dengan tema radio) ───
const C = {
  bg: '#0F1115',
  surface: '#161922',
  primary: '#00dbe9',
  primaryGlow: 'rgba(0, 219, 233, 0.3)',
  secondary: '#ffb3b2',
  onSurface: '#e2e2e8',
  onSurfaceVariant: '#b9cacb',
  textMuted: '#849495',
  border: 'rgba(255, 255, 255, 0.08)',
  liveRed: '#ff4d4f',
  danger: '#ff4d4f',
};

const BREAKPOINT_TABLET = 600;
const BREAKPOINT_DESKTOP = 1024;

const LiveStreamsScreen = () => {
  const { width: winWidth } = useWindowDimensions();
  const isDesktop = winWidth >= BREAKPOINT_DESKTOP;
  const isTablet = winWidth >= BREAKPOINT_TABLET && winWidth < BREAKPOINT_DESKTOP;
  const contentMaxWidth = isDesktop ? 900 : isTablet ? 700 : winWidth;
  const horizontalPadding = isDesktop || isTablet ? 32 : 16;

  const [activeChannelId, setActiveChannelId] = useState(CHANNELS[0].id);
  const [streamIndex, setStreamIndex] = useState(0);
  const [status, setStatus] = useState<'loading' | 'playing' | 'error' | 'paused'>('loading');
  const [isMuted, setIsMuted] = useState(false);

  const videoRef = useRef<Video | null>(null);

  const activeChannel = CHANNELS.find((c) => c.id === activeChannelId) ?? CHANNELS[0];
  const availableStreams = activeChannel.streams.filter((s) => !!s.url);
  const currentStream = availableStreams[streamIndex];

  // Reset ke stream pertama tiap kali ganti channel
  useEffect(() => {
    setStreamIndex(0);
    setStatus('loading');
  }, [activeChannelId]);

  const handleSelectChannel = useCallback((id: string) => {
    setActiveChannelId(id);
  }, []);

  const handleSelectStream = useCallback((idx: number) => {
    setStreamIndex(idx);
    setStatus('loading');
  }, []);

  // Kalau stream aktif gagal, otomatis coba stream berikutnya (mirip perilaku situs aslinya)
  const handlePlaybackError = useCallback(() => {
    setStatus('error');
    if (streamIndex < availableStreams.length - 1) {
      setTimeout(() => {
        setStreamIndex((prev) => prev + 1);
        setStatus('loading');
      }, 1200);
    }
  }, [streamIndex, availableStreams.length]);

  const handleStatusUpdate = useCallback((s: AVPlaybackStatus) => {
    if (!s.isLoaded) {
      if (s.error) handlePlaybackError();
      return;
    }
    if (s.isPlaying) setStatus('playing');
  }, [handlePlaybackError]);

  const togglePlayPause = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    const s = await video.getStatusAsync();
    if (!s.isLoaded) return;
    if (s.isPlaying) {
      await video.pauseAsync();
      setStatus('paused');
    } else {
      await video.playAsync();
      setStatus('playing');
    }
  }, []);

  const toggleMute = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    await video.setIsMutedAsync(!isMuted);
    setIsMuted((prev) => !prev);
  }, [isMuted]);

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }]}>
          <Text style={styles.title}>Live Streams</Text>
          <Text style={styles.subtitle}>Masjid al-Haram, Masjid an-Nabawi, al-Aqsa & Hajj</Text>

          {/* ── Channel selector ── */}
          <View style={styles.channelRow}>
            {CHANNELS.map((ch) => {
              const active = ch.id === activeChannelId;
              return (
                <TouchableOpacity
                  key={ch.id}
                  style={[styles.channelChip, active && styles.channelChipActive]}
                  onPress={() => handleSelectChannel(ch.id)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.channelChipText, active && styles.channelChipTextActive]}>
                    {ch.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.channelDescription}>{activeChannel.description}</Text>

          {/* ── Player ── */}
          <View style={styles.playerWrap}>
            {currentStream ? (
              <>
                <Video
                  ref={videoRef}
                  style={styles.video}
                  source={{ uri: currentStream.url }}
                  useNativeControls={Platform.OS !== 'web'}
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay
                  isMuted={isMuted}
                  posterSource={{ uri: activeChannel.poster }}
                  usePoster
                  onPlaybackStatusUpdate={handleStatusUpdate}
                  onError={handlePlaybackError}
                />
                {status === 'loading' && (
                  <View style={styles.overlay} pointerEvents="none">
                    <ActivityIndicator size="large" color={C.primary} />
                  </View>
                )}
                {status === 'error' && (
                  <View style={styles.overlay} pointerEvents="none">
                    <Text style={styles.errorText}>
                      Stream bermasalah, mencoba sumber lain…
                    </Text>
                  </View>
                )}
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveBadgeText}>LIVE</Text>
                </View>
              </>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  Belum ada URL stream untuk channel ini.{'\n'}
                  Isi array `streams` pada `CHANNELS` dengan link .m3u8 yang valid.
                </Text>
              </View>
            )}
          </View>

          {/* ── Web-only controls (native controls sudah otomatis muncul di mobile) ── */}
          {Platform.OS === 'web' && currentStream && (
            <View style={styles.controlsRow}>
              <TouchableOpacity style={styles.controlButton} onPress={togglePlayPause} activeOpacity={0.8}>
                <Text style={styles.controlButtonText}>
                  {status === 'playing' ? 'Jeda' : 'Putar'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlButton} onPress={toggleMute} activeOpacity={0.8}>
                <Text style={styles.controlButtonText}>{isMuted ? 'Suarakan' : 'Bisukan'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Stream source selector ── */}
          {availableStreams.length > 0 && (
            <View style={styles.streamRow}>
              {availableStreams.map((s, idx) => {
                const active = idx === streamIndex;
                return (
                  <TouchableOpacity
                    key={s.label}
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
            Kalau stream berhenti atau buffering terus, coba pilih Stream 2/3/4 di atas.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1, width: '100%' },
  scrollContent: { flexGrow: 1, paddingVertical: 24, alignItems: 'center' },
  content: { width: '100%' },

  title: {
    fontSize: 32,
    fontWeight: '800',
    color: C.onSurface,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: C.textMuted,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
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
  channelChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.onSurfaceVariant,
  },
  channelChipTextActive: {
    color: C.primary,
  },

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
  video: { width: '100%', height: '100%' },

  overlay: {
    ...StyleSheet.absoluteFill as Object,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  errorText: {
    color: C.onSurface,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 20,
  },

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
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.liveRed,
  },
  liveBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyStateText: {
    color: C.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },

  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 14,
  },
  controlButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  controlButtonText: {
    color: C.onSurface,
    fontSize: 13,
    fontWeight: '600',
  },

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
  streamButtonActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  streamButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.onSurfaceVariant,
  },
  streamButtonTextActive: {
    color: C.bg,
  },

  hintText: {
    fontSize: 12,
    color: C.textMuted,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default LiveStreamsScreen;