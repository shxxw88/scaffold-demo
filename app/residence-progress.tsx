import ProfileExitModal from '@/components/ProfileExitModal';
import { Theme } from '@/constants/theme';
import { useProfile } from '@/contexts/ProfileContext';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ResidenceProgress() {
  const router = useRouter();
  const { mode, returnTo } = useLocalSearchParams<{
    mode?: string;
    returnTo?: string;
  }>();
  const editingMode = typeof mode === 'string' ? mode : undefined;
  const returnToPath =
    typeof returnTo === 'string' ? returnTo : '/(tabs)/profile';
  const isEditingResidence = editingMode === 'edit-residence';
  const { profileData } = useProfile();
  const [showExitModal, setShowExitModal] = useState(false);

  // Calculate overall progress (Basic + Residence)
  const progress = useMemo(() => {
    const basicFields = [
      profileData.name,
      profileData.dateOfBirth,
      profileData.gender,
      profileData.phone,
      profileData.email,
    ];
    const residenceFields = [
      profileData.address,
      profileData.postalCode,
      profileData.province,
      profileData.citizenshipStatus,
    ];
    const totalFields = basicFields.length + residenceFields.length;
    const filledFields =
      basicFields.filter((f) => f).length +
      residenceFields.filter((f) => f).length;
    return Math.round((filledFields / totalFields) * 100);
  }, [profileData]);

  const handleContinue = () => {
    if (isEditingResidence) {
      router.replace(returnToPath as any);
    } else {
      router.push('/household-size');
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
        <Text style={styles.progressText}>You are halfway through!</Text>

        <View style={styles.progressBarLarge}>
          <View style={[styles.progressFillLarge, { width: '50%' }]} />
        </View>

        <View style={styles.nextStepContainer}>
          <Text style={styles.nextStepLabel}>Next step:</Text>
          <Text style={styles.nextStepValue}>Household information</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>
            {isEditingResidence ? 'Save & Close' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>

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
    width: '100%',
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
    ...Theme.typography.h2,
    color: Theme.colors.purple,
    textAlign: 'center',
    marginBottom: 30,
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
    ...Theme.typography.body,
    color: Theme.colors.black,
    marginBottom: 12,
  },
  nextStepValue: {
    ...Theme.typography.subhead1,
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
