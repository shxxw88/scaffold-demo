import DocumentStatusOverlay from '@/components/DocumentStatusOverlay';
import { Theme } from '@/constants/theme';
import { useProfile } from '@/contexts/ProfileContext';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RetrieveResponse } from 'roughlyai';

const AI_ICON = require('../assets/images/Ai-icon.png');
const ADD_FILE = require('../assets/images/add-file.png');

export default function UploadResume() {
  const router = useRouter();
  const { updateProfileData } = useProfile();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      setIsProcessing(true);

      const presignResp = await fetch(
        'https://m3rcwp4vofeta3kqelrykbgosi0rswzn.lambda-url.ca-central-1.on.aws/',
        {
          method: 'POST',
          body: JSON.stringify({
            type: 'upload',
            project_name: 'Scaffold',
            filename: file.name.toLocaleLowerCase(),
          }),
        }
      );

      if (!presignResp.ok) {
        throw new Error('Failed to fetch presigned URL.');
      }

      const uploadUrl: any = JSON.parse(await presignResp.json());
      if (!uploadUrl?.url?.[0]) {
        throw new Error('Invalid presigned URL.');
      }

      const fileUri = file.uri ?? file.uri;
      const fileResp = await fetch(fileUri);
      const fileBlob = await fileResp.blob();

      const uploadResponse = await fetch(uploadUrl.url[0], {
        method: 'PUT',
        headers: {
          'Content-Type':
            file.mimeType ||
            (file.mimeType as string) ||
            'application/octet-stream',
        },
        body: fileBlob,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload the file to S3.');
      }

      const trainResp = await fetch(
        'https://m3rcwp4vofeta3kqelrykbgosi0rswzn.lambda-url.ca-central-1.on.aws/',
        {
          method: 'POST',
          body: JSON.stringify({
            type: 'train',
            project_name: 'Scaffold',
          }),
        }
      );

      if (!trainResp.ok) {
        throw new Error('Failed to fetch presigned URL.');
      }

      const trainUrl: any = JSON.parse(await trainResp.json());
      if (!trainUrl?.url) {
        throw new Error('Invalid presigned URL.');
      }

      const trained = await RetrieveResponse(trainUrl.url);
      if (!trained) {
        throw new Error('Training failed.');
      }

      const promptResp = await fetch(
        'https://m3rcwp4vofeta3kqelrykbgosi0rswzn.lambda-url.ca-central-1.on.aws/',
        {
          method: 'POST',
          body: JSON.stringify({
            project_name: 'Scaffold',
            prompt: `From the document "${file.name}", extract every detail that can populate the profile. Respond ONLY with JSON (no prose) that matches {"first_name":string,"last_name":string,"email":string,"phone":string,"address":string,"postal_code":string,"province":string,"date_of_birth":string,"gender":string,"citizenship_status":string,"household_size":string,"family_composition":string,"annual_family_net_income":string,"guardian_name":string,"guardian_phone":string,"guardian_email":string,"highest_education":string,"school_name":string,"graduation_date":string,"trade_school_name":string,"trade_program_name":string,"trade_graduation_date":string,"trade":string,"apprenticeship_level":string}. When identifying apprenticeship_level, return the exact level label mentioned (e.g., "Level 1", "Level 2", "Level 3", "Level 4", or "Red Seal"). Use empty strings when a value cannot be found.`,
          }),
        }
      );

      if (!promptResp.ok) {
        throw new Error('Failed to fetch presigned URL.');
      }

      const promptUrl: any = JSON.parse(await promptResp.json());
      if (!promptUrl?.url) {
        throw new Error('Invalid presigned URL.');
      }

      const promptResponse: any = await RetrieveResponse(promptUrl.url);
      const answerRaw = promptResponse?.answer;
      let parsedAnswer: Record<string, string> | null = null;

      try {
        if (typeof answerRaw === 'string') {
          parsedAnswer = JSON.parse(answerRaw);
        } else if (answerRaw && typeof answerRaw === 'object') {
          parsedAnswer = answerRaw;
        }
      } catch (parseError) {
        console.error('Failed to parse extracted profile info', parseError);
      }

      if (parsedAnswer) {
        const pickValue = (...values: unknown[]) => {
          for (const value of values) {
            if (value !== undefined && value !== null) {
              return typeof value === 'string'
                ? value.trim()
                : String(value).trim();
            }
          }
          return '';
        };
        const normalizeApprenticeshipLevel = (value: string) => {
          const lower = value.toLowerCase();
          if (!lower) return '';
          if (lower.includes('journeyman') || lower.includes('red seal')) {
            return 'Journeyman';
          }
          if (
            lower.includes('fourth') ||
            lower.includes('level 4') ||
            lower.includes('4th')
          ) {
            return 'Level 4';
          }
          if (
            lower.includes('third') ||
            lower.includes('level 3') ||
            lower.includes('3rd')
          ) {
            return 'Level 3';
          }
          if (
            lower.includes('second') ||
            lower.includes('level 2') ||
            lower.includes('2nd')
          ) {
            return 'Level 2';
          }
          if (
            lower.includes('first') ||
            lower.includes('level 1') ||
            lower.includes('1st')
          ) {
            return 'Level 1';
          }
          return value.trim();
        };

        updateProfileData({
          name: `${pickValue(parsedAnswer.first_name)} ${pickValue(
            parsedAnswer.last_name
          )}`.trim(),
          email: pickValue(parsedAnswer.email),
          phone: pickValue(parsedAnswer.phone),
          address: pickValue(parsedAnswer.address),
          postalCode: pickValue(parsedAnswer.postal_code),
          province: pickValue(parsedAnswer.province),
          dateOfBirth: pickValue(parsedAnswer.date_of_birth),
          gender: pickValue(parsedAnswer.gender),
          citizenshipStatus: pickValue(parsedAnswer.citizenship_status),
          householdSize: pickValue(parsedAnswer.household_size),
          familyComposition: pickValue(parsedAnswer.family_composition),
          annualFamilyNetIncome: pickValue(
            parsedAnswer.annual_family_net_income
          ),
          guardianName: pickValue(parsedAnswer.guardian_name),
          guardianPhone: pickValue(parsedAnswer.guardian_phone),
          guardianEmail: pickValue(parsedAnswer.guardian_email),
          highestEducation: pickValue(parsedAnswer.highest_education),
          highSchoolName: pickValue(parsedAnswer.school_name),
          graduationDate: pickValue(parsedAnswer.graduation_date),
          tradeSchoolName: pickValue(parsedAnswer.trade_school_name),
          tradeProgramName: pickValue(parsedAnswer.trade_program_name),
          tradeGraduationDate: pickValue(parsedAnswer.trade_graduation_date),
          trade: pickValue(parsedAnswer.trade),
          apprenticeshipLevel: normalizeApprenticeshipLevel(
            pickValue(parsedAnswer.apprenticeship_level)
          ),
        });

        setIsComplete(true);
        setIsProcessing(false);
        return;
      } else {
        Alert.alert(
          'No details found',
          "We couldn't extract profile details from that file. Try another document or fill your profile manually."
        );
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert(
        'Upload failed',
        "We couldn't process that document. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.content}>
          <Image
            source={AI_ICON}
            style={styles.sparkle}
            contentFit="contain"
            accessibilityLabel="AI icon"
          />
          <Text style={styles.title}>
            Upload your resume and we’ll build your profile for you!
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={pickDocument}
            style={styles.uploadBox}
          >
            <Image
              source={ADD_FILE}
              style={styles.addFile}
              contentFit="contain"
              accessibilityLabel="Upload resume"
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/basic-profile-name')}
          >
            <Text style={styles.subText}>
              Or enter your info manually with Scaffold’s AI voice support
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/basic-profile-name')}
          activeOpacity={0.9}
        >
          <Text style={styles.primaryButtonText}>Enter Manually</Text>
        </TouchableOpacity>
      </View>

      <DocumentStatusOverlay
        showProcessing={isProcessing}
        showComplete={isComplete}
        processingTitle="We are building your profile"
        completeTitle="Complete!"
        completeButtonLabel="Go to Profile"
        onCompletePress={() => {
          setIsComplete(false);
          router.replace('/(tabs)');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 50,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: 24,
    gap: 12,
  },
  sparkle: {
    width: 72,
    height: 72,
  },
  title: {
    textAlign: 'center',
    fontSize: 22,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.black,
    paddingHorizontal: 24,
  },
  uploadBox: {
    width: 227,
    height: 227,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addFile: {
    width: '100%',
    height: '100%',
  },
  subText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 22,
    paddingHorizontal: 18,
  },
  primaryButton: {
    backgroundColor: Theme.colors.orange,
    borderRadius: Theme.radius.button,
    ...Theme.padding.buttonLg,
    width: 234,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    ...Theme.typography.button,
    color: Theme.colors.black,
    textAlign: 'center',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7C3AED',
    textAlign: 'center',
    marginBottom: 32,
  },
  loadingArt: {
    width: 190,
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingRing: {
    width: 190,
    height: 190,
  },
  loadingCharacter: {
    position: 'absolute',
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
