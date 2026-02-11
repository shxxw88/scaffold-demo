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
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

export default function ResidenceAddress() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const stackInputs = width < 420;
  const { mode, returnTo } = useLocalSearchParams<{
    mode?: string;
    returnTo?: string;
  }>();
  const editingMode = typeof mode === 'string' ? mode : undefined;
  const returnToPath =
    typeof returnTo === 'string' ? returnTo : '/(tabs)/profile';
  const isEditingResidence = editingMode === 'edit-residence';
  const { profileData, updateProfileData } = useProfile();
  const [addressLine1, setAddressLine1] = useState(
    profileData.address.split(',')[0] || ''
  );
  const [addressLine2, setAddressLine2] = useState(
    profileData.address.split(',')[1] || ''
  );
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState(profileData.postalCode || '');
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const handleVoiceResult = (text: string, extras?: VoiceResultExtras) => {
    const structured = extras?.structuredData;
    let nextLine1 = addressLine1;
    let nextLine2 = addressLine2;
    let nextCity = city;
    let nextPostal = postalCode;

    if (structured) {
      if (structured.addressLine1?.trim()) {
        nextLine1 = structured.addressLine1.trim();
        setAddressLine1(nextLine1);
      }
      if (structured.addressLine2?.trim()) {
        nextLine2 = structured.addressLine2.trim();
        setAddressLine2(nextLine2);
      }
      if (structured.city?.trim()) {
        nextCity = structured.city.trim();
        setCity(nextCity);
      }
      if (structured.postalCode?.trim()) {
        nextPostal = structured.postalCode.trim();
        setPostalCode(nextPostal);
      }
    } else if (text) {
      nextLine1 = text;
      setAddressLine1(text);
    }

    const fullAddress = [nextLine1, nextLine2, nextCity]
      .filter(Boolean)
      .join(', ');
    updateProfileData({ address: fullAddress, postalCode: nextPostal });
    setShowVoiceOverlay(false);
  };

  const handleNext = () => {
    const fullAddress = [addressLine1, addressLine2, city]
      .filter(Boolean)
      .join(', ');
    updateProfileData({ address: fullAddress, postalCode });
    if (isEditingResidence && editingMode) {
      router.push({
        pathname: '/residence-province',
        params: { mode: editingMode, returnTo: returnToPath },
      });
    } else {
      router.push('/residence-province');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ flex: 1 }}>
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
            <View style={[styles.progressFill, { width: '33%' }]} />
          </View>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={{
            flex: 1,
            paddingBottom: 24,
            justifyContent: 'center',
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <TextInput
            style={styles.input}
            placeholder="Address line1"
            placeholderTextColor="#9CA3AF"
            value={addressLine1}
            onChangeText={(text) => {
              setAddressLine1(text);
              const fullAddress = [text, addressLine2, city]
                .filter(Boolean)
                .join(', ');
              updateProfileData({ address: fullAddress });
            }}
          />

          <TextInput
            style={styles.input}
            placeholder="Address line2"
            placeholderTextColor="#9CA3AF"
            value={addressLine2}
            onChangeText={(text) => {
              setAddressLine2(text);
              const fullAddress = [addressLine1, text, city]
                .filter(Boolean)
                .join(', ');
              updateProfileData({ address: fullAddress });
            }}
          />

          <View style={[styles.row, stackInputs && styles.rowStack]}>
            <TextInput
              style={
                stackInputs
                  ? [styles.input, styles.fullWidthInput]
                  : [styles.input, styles.cityInput]
              }
              placeholder="City"
              placeholderTextColor="#9CA3AF"
              value={city}
              onChangeText={(text) => {
                setCity(text);
                const fullAddress = [addressLine1, addressLine2, text]
                  .filter(Boolean)
                  .join(', ');
                updateProfileData({ address: fullAddress });
              }}
            />

            <TextInput
              style={
                stackInputs
                  ? [styles.input, styles.fullWidthInput]
                  : [styles.input, styles.postalInput]
              }
              placeholder="Postal Code"
              placeholderTextColor="#9CA3AF"
              value={postalCode}
              onChangeText={(text) => {
                setPostalCode(text);
                updateProfileData({ postalCode: text });
              }}
            />
          </View>
        </ScrollView>

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
          contextFields={['addressLine1', 'addressLine2', 'city', 'postalCode']}
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
    </KeyboardAvoidingView>
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
    paddingHorizontal: 20,
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
    width: '100%',
    height: 60,
    ...Typography.body,
    color: Theme.colors.black,
    marginBottom: 10,
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    flexWrap: 'wrap',
  },
  rowStack: {
    flexDirection: 'column',
  },
  cityInput: {
    flexGrow: 3,
    flexBasis: '60%',
    flexShrink: 0,
  },
  postalInput: {
    flexGrow: 1,
    flexBasis: '35%',
    flexShrink: 0,
  },
  fullWidthInput: {
    width: '100%',
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
