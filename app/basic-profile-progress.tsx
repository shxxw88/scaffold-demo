import ProfileExitModal from '@/components/ProfileExitModal';
import { Theme, Typography } from '@/constants/theme';
import { useProfile } from '@/contexts/ProfileContext';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function BasicProfileProgress() {
  const router = useRouter();
  const { mode, returnTo } = useLocalSearchParams<{
    mode?: string;
    returnTo?: string;
  }>();
  const editingMode = typeof mode === 'string' ? mode : undefined;
  const returnToPath =
    typeof returnTo === 'string' ? returnTo : '/(tabs)/profile';
  const isEditingBasic = editingMode === 'edit-basic';
  const { profileData } = useProfile();
  const [showExitModal, setShowExitModal] = useState(false);

  // Calculate completion for basic profile section
  const progress = useMemo(() => {
    const fields = [
      profileData.name,
      profileData.dateOfBirth,
      profileData.gender,
      profileData.phone,
      profileData.email,
    ];
    const filled = fields.filter((f) => f).length;
    return Math.round((filled / 5) * 100);
  }, [profileData]);

  const handleContinue = () => {
    if (isEditingBasic) {
      router.replace(returnToPath as any);
    } else {
      router.push('/residence-address');
    }
  };

  const handleExit = () => {
    setShowExitModal(false);
    router.push('/(tabs)/profile');
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
        <Text style={styles.headerTitle}>Basic Profile</Text>
        <TouchableOpacity
          onPress={() => setShowExitModal(true)}
          style={styles.headerButton}
        >
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '25%' }]} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.progressText}>
          Your Basic Profile is{' '}
          <Text style={styles.progressPercent}>{progress}%</Text> complete!
        </Text>

        <View style={styles.progressBarLarge}>
          <View style={[styles.progressFillLarge, { width: `${progress}%` }]} />
        </View>

        <View style={styles.nextStepContainer}>
          <Text style={styles.nextStepLabel}>Next step:</Text>
          <Text style={styles.nextStepValue}>Residence Information</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>
            {isEditingBasic ? 'Save & Close' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>

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
    ...Typography.h3,
    fontFamily: Theme.fonts.bold,
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
    alignItems: 'center',
  },
  progressText: {
    ...Typography.h2,
    color: Theme.colors.purple,
    textAlign: 'center',
    marginBottom: 30,
  },
  progressPercent: {
    color: Theme.colors.orange,
    ...Typography.h2,
    fontFamily: Theme.fonts.bold,
  },
  progressBarLarge: {
    width: '100%',
    height: 14,
    backgroundColor: Theme.colors.lightGrey,
    borderRadius: 7,
    overflow: 'hidden',
    marginBottom: 40,
  },
  progressFillLarge: {
    height: '100%',
    backgroundColor: Theme.colors.purple,
  },
  nextStepContainer: {
    alignItems: 'center',
  },
  nextStepLabel: {
    ...Typography.body,
    color: Theme.colors.black,
    marginBottom: 12,
  },
  nextStepValue: {
    ...Typography.subhead1,
    color: Theme.colors.purple,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  continueButton: {
    alignItems: 'center',
    backgroundColor: Theme.colors.orange,
    borderRadius: Theme.radius.button,
    ...Theme.padding.buttonLg,
    width: 234,
    height: 48,
    alignSelf: 'center',
  },
  continueButtonText: {
    ...Theme.typography.button,
    color: Theme.colors.black,
    textAlign: 'center',
  },
});
