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
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnimatedBackground from '../components/AnimatedBackground';
import { useTheme } from '@/theme/ThemeContext';
import { Audio } from 'expo-av';
import { useNavigation } from '../context/NavigationContext';
import { IconVolume, IconVolumeX } from '../components/Icons';

let WebView: any = null;
if (Platform.OS !== 'web') {
  WebView = require('react-native-webview').WebView;
}

const STORAGE_KEY = 'live_streams_v2_v1';

type StreamSource = {
  id: string;
  label: string;
  youtubeUrl: string;
  audioStreamUrl: string;
};

type Channel = {
  id: string;
  name: string;
  description: string;
  streams: StreamSource[];
};

const uid = () => Math.random().toString(36).slice(2, 10);

const DEFAULT_CHANNELS: Channel[] = [
  {
    id: 'makkah',
    name: 'Makkah',
    description: 'Masjid al-Haram, Mekah',
    streams: [
      { id: uid(), label: 'Stream 1', youtubeUrl: 'https://www.youtube.com/live/24JXS383N1c', audioStreamUrl: '' },
    ],
  },
];

function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{6,})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{6,})/,
    /youtube\.com\/live\/([a-zA-Z0-9_-]{6,})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/,
    /[?&]v=([a-zA-Z0-9_-]{6,})/,
  ];
  for (const re of patterns) {
    const m = trimmed.match(re);
    if (m && m[1]) return m[1];
  }
  if (/^[a-zA-Z0-9_-]{10,12}$/.test(trimmed)) return trimmed;
  return null;
}

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
};

const YouTubeEmbed = ({ videoId }: { videoId: string }) => {
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1`;
  if (Platform.OS === 'web') {
    return <iframe src={embedUrl} style={{ width: '100%', height: '100%', border: '0' }} allowFullScreen />;
  }
  return <WebView source={{ uri: embedUrl }} style={{ width: '100%', height: '100%' }} />;
};

const StreamV2Screen = () => {
  const { colors, isDark } = useTheme();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [channels, setChannels] = useState<Channel[]>(DEFAULT_CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState(DEFAULT_CHANNELS[0].id);
  const [streamIndex, setStreamIndex] = useState(0);

  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  const activeChannel = channels.find((c) => c.id === activeChannelId) ?? channels[0];
  const currentStream = activeChannel.streams[streamIndex];

  const playAudio = useCallback(async (url: string) => {
    if (sound) {
      await sound.unloadAsync();
    }
    const { sound: newSound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true });
    setSound(newSound);
    setIsPlaying(true);
  }, [sound]);

  const stopAudio = useCallback(async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
    }
  }, [sound]);

  useEffect(() => {
    if (currentStream?.audioStreamUrl) {
      playAudio(currentStream.audioStreamUrl);
    } else {
      stopAudio();
    }
  }, [currentStream?.audioStreamUrl, playAudio, stopAudio]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.playerWrap}>
          {currentStream?.youtubeUrl ? (
            <YouTubeEmbed videoId={extractYoutubeId(currentStream.youtubeUrl) || ''} />
          ) : (
            <Text style={{ color: C.onSurface }}>Video tidak tersedia</Text>
          )}
        </View>
        <Text style={{ color: C.onSurface, marginTop: 20 }}>
          Audio: {isPlaying ? 'Playing in background' : 'Stopped'}
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 20, alignItems: 'center' },
  playerWrap: { width: '100%', aspectRatio: 16 / 9, borderRadius: 16, overflow: 'hidden', backgroundColor: '#000' },
});

export default StreamV2Screen;