import ProfileExitModal from '@/components/ProfileExitModal';
import { Theme, Typography } from '@/constants/theme';
import { useProfile } from '@/contexts/ProfileContext';
import VoiceInputOverlay from '@/utilities/useVoiceToText';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PROVINCES = [
  'Nova Scotia',
  'British Columbia',
  'Saskatchewan',
  'New Brunswick',
  'Alberta',
  'Prince Edward Island',
  'Manitoba',
  'Quebec',
  'Newfoundland and Labrador',
  'Ontario',
];

export default function ResidenceProvince() {
  const router = useRouter();
  const { mode, returnTo } = useLocalSearchParams<{
    mode?: string;
    returnTo?: string;
  }>();
  const editingMode = typeof mode === 'string' ? mode : undefined;
  const returnToPath =
    typeof returnTo === 'string' ? returnTo : '/(tabs)/profile';
  const isEditingResidence = editingMode === 'edit-residence';
  const { profileData, updateProfileData } = useProfile();
  const [selectedProvince, setSelectedProvince] = useState(
    profileData.province || ''
  );
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const handleVoiceResult = (text: string) => {
    const lowerText = text.toLowerCase();
    const match = PROVINCES.find(
      (p) =>
        p.toLowerCase() === lowerText || lowerText.includes(p.toLowerCase())
    );
    if (match) {
      setSelectedProvince(match);
      updateProfileData({ province: match });
    }
    setShowVoiceOverlay(false);
  };

  const handleNext = () => {
    if (selectedProvince) {
      updateProfileData({ province: selectedProvince });
      if (isEditingResidence && editingMode) {
        router.push({
          pathname: '/residence-citizenship',
          params: { mode: editingMode, returnTo: returnToPath },
        });
      } else {
        router.push('/residence-citizenship');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Residence information</Text>
        <TouchableOpacity
          onPress={() => setShowExitModal(true)}
          style={styles.headerButton}
        >
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '50%' }]} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.question}>What Province Do You Live in?</Text>

        <View style={styles.provinceGrid}>
          {PROVINCES.map((province) => (
            <TouchableOpacity
              key={province}
              style={[
                styles.provinceButton,
                selectedProvince === province && styles.provinceButtonSelected,
              ]}
              onPress={() => {
                setSelectedProvince(province);
                updateProfileData({ province });
              }}
            >
              <Text
                style={[
                  styles.provinceText,
                  selectedProvince === province && styles.provinceTextSelected,
                ]}
              >
                {province}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.voiceButton}
          onPress={() => setShowVoiceOverlay(true)}
        >
          <Ionicons name="mic" size={24} color={Theme.colors.purple} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.nextButton,
            !selectedProvince && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!selectedProvince}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>

      <VoiceInputOverlay
        visible={showVoiceOverlay}
        onClose={() => setShowVoiceOverlay(false)}
        contextField="province"
        onResult={handleVoiceResult}
      />

      <ProfileExitModal
        visible={showExitModal}
        onCancel={() => setShowExitModal(false)}
        onExit={() => {
          setShowExitModal(false);
          router.replace(returnToPath as any);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
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
  question: {
    ...Typography.h2,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.black,
    textAlign: 'center',
    marginBottom: 60,
  },
  provinceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  provinceButton: {
    borderWidth: 1,
    borderColor: Theme.colors.grey,
    borderRadius: Theme.radius.card,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: '46%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  provinceButtonSelected: {
    borderColor: Theme.colors.brightPurple,
    backgroundColor: Theme.colors.lightPurple,
  },
  provinceText: {
    ...Theme.typography.body,
    color: Theme.colors.grey,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  provinceTextSelected: {
    color: Theme.colors.purple,
    ...Theme.typography.bodyBold,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 52,
    paddingBottom: 120,
    gap: 10,
  },
  voiceButton: {
    width: 52,
    height: 52,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Theme.colors.purple,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
  },
  nextButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Theme.colors.orange,
    borderRadius: Theme.radius.button,
    ...Theme.padding.buttonLg,
    width: 234,
    height: 48,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    ...Theme.typography.button,
    color: Theme.colors.black,
    textAlign: 'center',
  },
});
