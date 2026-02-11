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

export default function HouseholdGuardian() {
  const router = useRouter();
  const { mode, returnTo } = useLocalSearchParams<{
    mode?: string;
    returnTo?: string;
  }>();
  const editingMode = typeof mode === 'string' ? mode : undefined;
  const returnToPath =
    typeof returnTo === 'string' ? returnTo : '/(tabs)/profile';
  const isEditingHousehold = editingMode === 'edit-household';
  const { profileData, updateProfileData } = useProfile();
  const [firstName, setFirstName] = useState(
    profileData.guardianName.split(' ')[0] || ''
  );
  const [lastName, setLastName] = useState(
    profileData.guardianName.split(' ').slice(1).join(' ') || ''
  );
  const [phone, setPhone] = useState(profileData.guardianPhone || '');
  const [email, setEmail] = useState(profileData.guardianEmail || '');
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const handleVoiceResult = (text: string, extras?: VoiceResultExtras) => {
    const structured = extras?.structuredData;
    let nextFirst = firstName;
    let nextLast = lastName;

    if (structured?.guardianFirstName?.trim()) {
      nextFirst = structured.guardianFirstName.trim();
      setFirstName(nextFirst);
    } else if (!structured && text) {
      nextFirst = text;
      setFirstName(text);
    }

    if (structured?.guardianLastName?.trim()) {
      nextLast = structured.guardianLastName.trim();
      setLastName(nextLast);
    }

    if (structured?.guardianPhone?.trim()) {
      setPhone(structured.guardianPhone.trim());
      updateProfileData({ guardianPhone: structured.guardianPhone.trim() });
    } else if (!structured && !structured?.guardianFirstName && text) {
      setPhone(text);
      updateProfileData({ guardianPhone: text });
    }

    if (structured?.guardianEmail?.trim()) {
      setEmail(structured.guardianEmail.trim());
      updateProfileData({ guardianEmail: structured.guardianEmail.trim() });
    }

    updateProfileData({ guardianName: `${nextFirst} ${nextLast}`.trim() });
    setShowVoiceOverlay(false);
  };

  const handleNext = () => {
    const fullName = `${firstName} ${lastName}`.trim();
    updateProfileData({
      guardianName: fullName,
      guardianPhone: phone,
      guardianEmail: email,
    });
    if (isEditingHousehold) {
      router.replace(returnToPath as any);
    } else {
      router.push('/household-progress');
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
        <Text style={styles.headerTitle}>Household information</Text>
        <TouchableOpacity
          onPress={() => setShowExitModal(true)}
          style={styles.headerButton}
        >
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '75%' }]} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Parents / Guardian information</Text>

        <TextInput
          style={styles.input}
          placeholder="First Name"
          placeholderTextColor="#9CA3AF"
          value={firstName}
          onChangeText={(text) => {
            setFirstName(text);
            const fullName = `${text} ${lastName}`.trim();
            updateProfileData({ guardianName: fullName });
          }}
        />

        <TextInput
          style={styles.input}
          placeholder="Last Name"
          placeholderTextColor="#9CA3AF"
          value={lastName}
          onChangeText={(text) => {
            setLastName(text);
            const fullName = `${firstName} ${text}`.trim();
            updateProfileData({ guardianName: fullName });
          }}
        />

        <TextInput
          style={styles.input}
          placeholder="Phone #"
          placeholderTextColor="#9CA3AF"
          value={phone}
          onChangeText={(text) => {
            setPhone(text);
            updateProfileData({ guardianPhone: text });
          }}
          keyboardType="phone-pad"
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            updateProfileData({ guardianEmail: text });
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.voiceButton}
          onPress={() => setShowVoiceOverlay(true)}
        >
          <Ionicons name="mic" size={24} color={Theme.colors.purple} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {isEditingHousehold ? 'Save & Close' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>

      <VoiceInputOverlay
        visible={showVoiceOverlay}
        onClose={() => {
          setShowVoiceOverlay(false);
        }}
        contextFields={[
          'guardianFirstName',
          'guardianLastName',
          'guardianPhone',
          'guardianEmail',
        ]}
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
  sectionTitle: {
    ...Typography.h2,
    fontFamily: Theme.fonts.bold,
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
    alignSelf: 'center',
  },
  nextButtonText: {
    ...Theme.typography.button,
    color: Theme.colors.black,
    textAlign: 'center',
  },
});
