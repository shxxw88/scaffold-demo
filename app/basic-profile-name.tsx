import ProfileExitModal from '@/components/ProfileExitModal';
import { Theme, Typography } from '@/constants/theme';
import { useProfile } from '@/contexts/ProfileContext';
import VoiceInputOverlay, {
  VoiceResultExtras,
} from '@/utilities/useVoiceToText';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function BasicProfileName() {
  const router = useRouter();
  const { mode, returnTo } = useLocalSearchParams<{
    mode?: string;
    returnTo?: string;
  }>();
  const editingMode = typeof mode === 'string' ? mode : undefined;
  const returnToPath =
    typeof returnTo === 'string' ? returnTo : '/(tabs)/profile';
  const isEditingBasic = editingMode === 'edit-basic';
  const { profileData, updateProfileData } = useProfile();
  const [firstName, setFirstName] = useState(
    profileData.name.split(' ')[0] || ''
  );
  const [lastName, setLastName] = useState(
    profileData.name.split(' ').slice(1).join(' ') || ''
  );
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const handleVoiceResult = (text: string, extras?: VoiceResultExtras) => {
    const structured = extras?.structuredData;
    const nextFirst = structured?.firstName?.trim();
    const nextLast = structured?.lastName?.trim();

    let updatedFirst = firstName;
    let updatedLast = lastName;

    if (nextFirst) {
      updatedFirst = nextFirst;
      setFirstName(nextFirst);
    } else if (!structured && text) {
      updatedFirst = text;
      setFirstName(text);
    }

    if (nextLast) {
      updatedLast = nextLast;
      setLastName(nextLast);
    } else if (!structured && !nextFirst && text) {
      updatedLast = text;
      setLastName(text);
    }

    updateProfileData({
      name: `${updatedFirst} ${updatedLast}`.trim(),
    });
    setShowVoiceOverlay(false);
  };

  const navigateForward = (path: string) => {
    if (isEditingBasic && editingMode) {
      router.push({
        pathname: path as any,
        params: { mode: editingMode, returnTo: returnToPath },
      });
    } else {
      router.push(path as any);
    }
  };

  const handleNext = () => {
    const fullName = `${firstName} ${lastName}`.trim();
    updateProfileData({ name: fullName });
    navigateForward('/basic-profile-dob');
  };

  const handleExit = () => {
    setShowExitModal(false);
    router.replace(returnToPath as any);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Basic Profile</Text>
        <TouchableOpacity
          onPress={() => setShowExitModal(true)}
          style={styles.headerButton}
        >
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '15%' }]} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.instruction}>Enter Your Full Name</Text>

        <TextInput
          style={styles.input}
          placeholder="First Name"
          placeholderTextColor="#9CA3AF"
          value={firstName}
          onChangeText={(text) => {
            setFirstName(text);
            updateProfileData({ name: `${text} ${lastName}`.trim() });
          }}
        />

        <TextInput
          style={styles.input}
          placeholder="Last Name"
          placeholderTextColor="#9CA3AF"
          value={lastName}
          onChangeText={(text) => {
            setLastName(text);
            updateProfileData({ name: `${firstName} ${text}`.trim() });
          }}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.voiceButton}
          onPress={() => setShowVoiceOverlay(true)}
        >
          <Ionicons name="mic" size={24} color={Theme.colors.purple} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>

      <VoiceInputOverlay
        visible={showVoiceOverlay}
        onClose={() => {
          setShowVoiceOverlay(false);
        }}
        contextFields={['firstName', 'lastName']}
        onResult={handleVoiceResult}
      />

      <ProfileExitModal
        visible={showExitModal}
        onCancel={() => setShowExitModal(false)}
        onExit={handleExit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 16,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.black,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: Theme.colors.lightGrey,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Theme.colors.purple,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  instruction: {
    ...Theme.typography.h2,
    color: Theme.colors.black,
    textAlign: 'center',
    marginBottom: 60,
  },
  input: {
    backgroundColor: Theme.colors.white,
    borderWidth: 1,
    borderColor: Theme.colors.grey,
    borderRadius: Theme.radius.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: 330,
    height: 60,
    ...Typography.body,
    color: Theme.colors.black,
    marginBottom: 10,
    alignSelf: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 52,
    paddingBottom: 120,
    gap: 10,
  },
  voiceButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Theme.colors.purple,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
  },
  nextButton: {
    alignItems: 'center',
    backgroundColor: Theme.colors.orange,
    borderRadius: Theme.radius.button,
    ...Theme.padding.buttonLg,
    width: 234,
    alignSelf: 'center',
    height: 48,
  },
  nextButtonText: {
    ...Theme.typography.button,
    color: Theme.colors.black,
    textAlign: 'center',
  },
});
