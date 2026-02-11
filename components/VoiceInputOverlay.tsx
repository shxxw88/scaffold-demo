import { Theme } from '@/constants/theme';
import { transcribeAndCleanAudio } from '@/utilities/voiceTranscription';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export interface VoiceResultExtras {
  rawText: string;
  structuredData?: Record<string, string>;
}

interface VoiceInputOverlayProps {
  visible: boolean;
  onClose: () => void;
  onResult: (text: string, extras?: VoiceResultExtras) => void;
  contextField?: string | null;
  contextFields?: string[];
  contextPrompt?: string;
}

const BAR_COUNT = 6;
const BAR_BASE_HEIGHT = 24;

export default function VoiceInputOverlay({
  visible,
  onClose,
  onResult,
  contextField,
  contextFields,
  contextPrompt,
}: VoiceInputOverlayProps) {
  const [phase, setPhase] = useState<
    'idle' | 'listening' | 'processing' | 'review'
  >('idle');
  const [recognizedText, setRecognizedText] = useState('');
  const [rawTranscript, setRawTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [structuredData, setStructuredData] = useState<Record<
    string,
    string
  > | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const bars = useRef(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(1))
  ).current;

  useEffect(() => {
    if (isListening) {
      const loops = bars.map((bar) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(bar, {
              toValue: Math.random() * 2 + 1,
              duration: 250,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(bar, {
              toValue: 1,
              duration: 250,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        )
      );
      loops.forEach((animation) => animation.start());
      return () => loops.forEach((animation) => animation.stop());
    }
  }, [bars, isListening]);

  const resetState = () => {
    setPhase('idle');
    setRecognizedText('');
    setRawTranscript('');
    setIsListening(false);
    setErrorMessage(null);
    setStructuredData(null);
  };

  const cancelRecording = useCallback(async () => {
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        if (uri) {
          await FileSystem.deleteAsync(uri, { idempotent: true });
        }
      } catch {
        // ignore cleanup errors
      } finally {
        recordingRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      void cancelRecording();
    };
  }, [cancelRecording]);

  const handleClosePress = () => {
    cancelRecording();
    resetState();
    onClose();
  };

  const startListening = async () => {
    try {
      if (Platform.OS === 'web') {
        alert('Voice recording works best on a device or emulator.');
        return;
      }

      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        alert('Microphone access is required for voice input.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recording.startAsync();

      recordingRef.current = recording;
      setPhase('listening');
      setIsListening(true);
      setRecognizedText('');
      setRawTranscript('');
      setErrorMessage(null);
    } catch (e) {
      console.error('Speech start failed:', e);
      setErrorMessage('Unable to start recording. Please try again.');
    }
  };

  const stopListening = async () => {
    if (!recordingRef.current) {
      setPhase('review');
      return;
    }

    setIsListening(false);
    setPhase('processing');
    setErrorMessage(null);
    setRecognizedText('Transcribing your response...');

    let uri: string | null = null;
    try {
      await recordingRef.current.stopAndUnloadAsync();
      uri = recordingRef.current.getURI();
    } catch (error) {
      console.error('Unable to stop recording:', error);
    } finally {
      recordingRef.current = null;
    }

    if (!uri) {
      setErrorMessage('Recording file unavailable. Please try again.');
      setPhase('review');
      return;
    }

    try {
      const { rawText, cleanedText, structuredData } =
        await transcribeAndCleanAudio({
          uri,
          field: contextField,
          fields: contextFields,
          promptOverride: contextPrompt,
        });
      setRawTranscript(rawText);
      setRecognizedText(cleanedText || rawText || '');
      setStructuredData(structuredData || null);
    } catch (error) {
      console.error('Transcription failed:', error);
      setRawTranscript('');
      setRecognizedText('');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to transcribe. Please try again.'
      );
    } finally {
      setPhase('review');
      try {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      } catch {
        // ignore cleanup errors
      }
    }
  };

  const handleStopPress = () => {
    stopListening();
  };

  const handleRetry = () => {
    resetState();
  };

  const handleConfirm = () => {
    onResult(
      recognizedText.trim(),
      rawTranscript
        ? {
            rawText: rawTranscript,
            structuredData: structuredData || undefined,
          }
        : undefined
    );
    resetState();
  };

  const renderWaveform = () => (
    <View style={styles.waveformContainer}>
      {bars.map((bar, i) => (
        <Animated.View
          key={i}
          style={[styles.waveBar, { transform: [{ scaleY: bar }] }]}
        />
      ))}
    </View>
  );

  const isProcessing = phase === 'processing';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <TouchableOpacity onPress={handleClosePress} style={styles.close}>
            <Ionicons name="close" size={24} color={Theme.colors.grey} />
          </TouchableOpacity>

          <View style={{ marginBottom: 36 }}>{renderWaveform()}</View>

          {phase === 'idle' && (
            <>
              <Text style={styles.heading}>Go ahead, I&apos;m listening!</Text>
              <TouchableOpacity
                style={[
                  styles.startButton,
                  isProcessing && styles.disabledButton,
                ]}
                onPress={startListening}
                disabled={isProcessing}
              >
                <Ionicons
                  name="mic-outline"
                  size={22}
                  color={Theme.colors.brightPurple}
                />
                <Text style={styles.startText}>Start</Text>
              </TouchableOpacity>
            </>
          )}

          {phase === 'listening' && (
            <>
              <ScrollView style={styles.scroll}>
                <Text style={styles.transcript}>
                  {recognizedText || 'Listening... speak now'}
                </Text>
              </ScrollView>
              <TouchableOpacity
                style={styles.stopButton}
                onPress={handleStopPress}
              >
                <Ionicons name="pause" size={26} color={Theme.colors.white} />
                <Text style={styles.stopText}>Stop</Text>
              </TouchableOpacity>
            </>
          )}

          {phase === 'processing' && (
            <>
              <ScrollView style={styles.scroll}>
                <Text style={styles.transcript}>
                  {recognizedText || 'Transcribing your response...'}
                </Text>
              </ScrollView>
              <View style={styles.processingButton}>
                <ActivityIndicator color={Theme.colors.white} />
                <Text style={styles.stopText}>Processing</Text>
              </View>
            </>
          )}

          {phase === 'review' && (
            <>
              <Text style={styles.subHeading}>
                Got it. Should I go ahead with this?
              </Text>
              <ScrollView style={styles.scroll}>
                <Text style={styles.transcript}>
                  {recognizedText || 'No transcript available.'}
                </Text>
              </ScrollView>
              {errorMessage && (
                <Text style={styles.errorText}>{errorMessage}</Text>
              )}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.circleLight}
                  onPress={handleRetry}
                >
                  <Ionicons
                    name="refresh"
                    size={22}
                    color={Theme.colors.brightPurple}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.circleOutline}
                  onPress={startListening}
                  disabled={isProcessing}
                >
                  <Ionicons
                    name="mic-outline"
                    size={22}
                    color={Theme.colors.brightPurple}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.circleConfirm,
                    (!recognizedText || !!errorMessage) &&
                      styles.disabledConfirm,
                  ]}
                  onPress={handleConfirm}
                  disabled={!recognizedText || !!errorMessage}
                >
                  <Ionicons
                    name="checkmark"
                    size={22}
                    color={Theme.colors.white}
                  />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: Theme.colors.white,
    borderRadius: 16,
    width: '85%',
    paddingVertical: 38,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  close: { position: 'absolute', top: 20, left: 20 },
  heading: {
    fontSize: 16,
    color: Theme.colors.brightPurple,
    fontFamily: Theme.fonts.bold,
    marginBottom: 26,
  },
  subHeading: {
    fontSize: 15,
    color: Theme.colors.brightPurple,
    marginBottom: 24,
    textAlign: 'center',
  },
  scroll: { maxHeight: 140, marginBottom: 32 },
  transcript: {
    textAlign: 'center',
    ...Theme.typography.body,
    color: Theme.colors.black,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: Theme.colors.brightPurple,
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  startText: {
    ...Theme.typography.button,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.brightPurple,
  },
  stopButton: {
    alignItems: 'center',
    backgroundColor: Theme.colors.brightPurple,
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  processingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Theme.colors.brightPurple,
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  stopText: {
    color: Theme.colors.white,
    ...Theme.typography.button,
    marginTop: 6,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  circleLight: {
    backgroundColor: Theme.colors.lightPurple,
    borderRadius: 50,
    padding: 14,
  },
  circleOutline: {
    borderWidth: 2,
    borderColor: Theme.colors.brightPurple,
    borderRadius: 50,
    padding: 14,
  },
  circleConfirm: {
    backgroundColor: Theme.colors.orange,
    borderRadius: 50,
    padding: 14,
  },
  disabledConfirm: {
    opacity: 0.5,
  },
  disabledButton: {
    opacity: 0.6,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 16,
    height: BAR_BASE_HEIGHT * 2,
  },
  waveBar: {
    width: 6,
    height: BAR_BASE_HEIGHT,
    marginHorizontal: 3,
    borderRadius: 3,
    backgroundColor: Theme.colors.brightPurple,
  },
  errorText: {
    color: Theme.colors.red,
    textAlign: 'center',
    marginBottom: 12,
  },
});
