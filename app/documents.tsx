import DocumentStatusOverlay from '@/components/DocumentStatusOverlay';
import { useProfile } from '@/contexts/ProfileContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RetrieveResponse } from 'roughlyai';
const SMIGGS = require('@/assets/images/smiggs.png');
const SMIGGS_DONE = require('@/assets/images/smiggs-done.png');

type StoredDocument = {
  id: string;
  name: string;
  uri: string;
  mimeType?: string | null;
  size?: number | null;
};

const STORAGE_KEY = '@scaffold-documents';

export default function Documents() {
  const router = useRouter();
  const { updateProfileData } = useProfile();
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const persistDocuments = async (next: StoredDocument[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.warn('Failed to persist documents', error);
    }
  };

  const addDocumentToList = (file: DocumentPicker.DocumentPickerAsset) => {
    const nextDoc: StoredDocument = {
      id: `${Date.now()}-${file.name}`,
      name: file.name,
      uri: file.uri,
      mimeType: file.mimeType,
      size: file.size,
    };

    setDocuments((prev) => {
      const next = [nextDoc, ...prev];
      persistDocuments(next);
      return next;
    });
  };

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setDocuments(JSON.parse(raw));
        }
      } catch (error) {
        console.warn('Failed to load documents', error);
      }
    })();
  }, []);

  const handleUpload = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return;
    }

    const file = result.assets[0];
    addDocumentToList(file);
  };

  const handleBuildProfile = async () => {
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
      addDocumentToList(file);

      const _resp = await fetch(
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
      if (!_resp.ok) {
        throw new Error(`Failed to fetch presigned URL.`);
      }

      const uploadUrl: any = JSON.parse(await _resp.json());
      if (!uploadUrl?.url[0]) {
        throw new Error(`Invalid presigned URL.`);
      }

      const fileUri = file.uri ?? file.uri;
      const resp = await fetch(fileUri);
      const fileBlob = await resp.blob();

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
        throw new Error(`Failed to upload the file to S3.`);
      }

      const _resp_train = await fetch(
        'https://m3rcwp4vofeta3kqelrykbgosi0rswzn.lambda-url.ca-central-1.on.aws/',
        {
          method: 'POST',
          body: JSON.stringify({
            type: 'train',
            project_name: 'Scaffold',
          }),
        }
      );

      if (!_resp_train.ok) {
        throw new Error(`Failed to fetch presigned URL.`);
      }

      const trainUrl: any = JSON.parse(await _resp_train.json());
      if (!trainUrl?.url) {
        throw new Error(`Invalid presigned URL.`);
      }

      const _trained = await RetrieveResponse(trainUrl.url);
      if (!_trained) {
        throw new Error(`Training failed.`);
      }

      const _prompt = await fetch(
        'https://m3rcwp4vofeta3kqelrykbgosi0rswzn.lambda-url.ca-central-1.on.aws/',
        {
          method: 'POST',
          body: JSON.stringify({
            project_name: 'Scaffold',
            prompt: `From the document "${file.name}", extract every detail that can populate the profile. Respond ONLY with JSON (no prose) that matches {"first_name":string,"last_name":string,"email":string,"phone":string,"address":string,"postal_code":string,"province":string,"date_of_birth":string,"gender":string,"citizenship_status":string,"household_size":string,"family_composition":string,"annual_family_net_income":string,"guardian_name":string,"guardian_phone":string,"guardian_email":string,"highest_education":string,"school_name":string,"graduation_date":string,"trade_school_name":string,"trade_program_name":string,"trade_graduation_date":string,"trade":string,"apprenticeship_level":string}. When identifying apprenticeship_level, return the exact level label mentioned (e.g., "Level 1", "Level 2", "Level 3", "Level 4", or "Red Seal"). Use empty strings when a value cannot be found.`,
          }),
        }
      );

      if (!_prompt.ok) {
        throw new Error(`Failed to fetch presigned URL.`);
      }

      const _promptUrl: any = JSON.parse(await _prompt.json());
      if (!_promptUrl?.url) {
        throw new Error(`Invalid presigned URL.`);
      }

      const _prompt_response: any = await RetrieveResponse(_promptUrl.url);
      const answerRaw = _prompt_response?.answer;
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
            return 'Fourth Year Apprentice';
          }
          if (
            lower.includes('third') ||
            lower.includes('level 3') ||
            lower.includes('3rd')
          ) {
            return 'Third Year Apprentice';
          }
          if (
            lower.includes('second') ||
            lower.includes('level 2') ||
            lower.includes('2nd')
          ) {
            return 'Second Year Apprentice';
          }
          if (
            lower.includes('first') ||
            lower.includes('level 1') ||
            lower.includes('1st')
          ) {
            return 'First Year Apprentice';
          }
          return value;
        };

        const first = pickValue(
          parsedAnswer.first_name,
          parsedAnswer.firstName
        );
        const last = pickValue(parsedAnswer.last_name, parsedAnswer.lastName);
        const school = pickValue(
          parsedAnswer.school_name,
          parsedAnswer.schoolName,
          parsedAnswer.high_school_name,
          parsedAnswer.highSchoolName
        );
        const email = pickValue(parsedAnswer.email);
        const phone = pickValue(
          parsedAnswer.phone,
          parsedAnswer.phone_number,
          parsedAnswer.phoneNumber
        );
        const address = pickValue(
          parsedAnswer.address,
          parsedAnswer.residential_address
        );
        const postal = pickValue(
          parsedAnswer.postal_code,
          parsedAnswer.postalCode
        );
        const province = pickValue(
          parsedAnswer.province,
          parsedAnswer.state,
          parsedAnswer.province_state
        );
        const dateOfBirth = pickValue(
          parsedAnswer.date_of_birth,
          parsedAnswer.dateOfBirth,
          parsedAnswer.dob
        );
        const gender = pickValue(parsedAnswer.gender);
        const citizenshipStatus = pickValue(
          parsedAnswer.citizenship_status,
          parsedAnswer.citizenshipStatus,
          parsedAnswer.status
        );
        const householdSize = pickValue(
          parsedAnswer.household_size,
          parsedAnswer.householdSize
        );
        const familyComposition = pickValue(
          parsedAnswer.family_composition,
          parsedAnswer.familyComposition
        );
        const annualIncome = pickValue(
          parsedAnswer.annual_family_net_income,
          parsedAnswer.annualFamilyNetIncome,
          parsedAnswer.annual_income
        );
        const guardianName = pickValue(
          parsedAnswer.guardian_name,
          parsedAnswer.guardianName
        );
        const guardianPhone = pickValue(
          parsedAnswer.guardian_phone,
          parsedAnswer.guardianPhone
        );
        const guardianEmail = pickValue(
          parsedAnswer.guardian_email,
          parsedAnswer.guardianEmail
        );
        const highestEducation = pickValue(
          parsedAnswer.highest_education,
          parsedAnswer.highestEducation
        );
        const graduationDate = pickValue(
          parsedAnswer.graduation_date,
          parsedAnswer.graduationDate
        );
        const tradeSchoolName = pickValue(
          parsedAnswer.trade_school_name,
          parsedAnswer.tradeSchoolName
        );
        const tradeProgramName = pickValue(
          parsedAnswer.trade_program_name,
          parsedAnswer.tradeProgramName
        );
        const tradeGraduationDate = pickValue(
          parsedAnswer.trade_graduation_date,
          parsedAnswer.tradeGraduationDate
        );
        const tradeField = pickValue(parsedAnswer.trade);
        const apprenticeshipLevelRaw = pickValue(
          parsedAnswer.apprenticeship_level,
          parsedAnswer.apprenticeshipLevel
        );
        const apprenticeshipLevel = normalizeApprenticeshipLevel(
          apprenticeshipLevelRaw
        );

        const updates: Record<string, string> = {};
        const fullName = [first, last].filter(Boolean).join(' ').trim();
        if (fullName) updates.name = fullName;
        if (school) updates.highSchoolName = school;
        if (email) updates.email = email;
        if (phone) updates.phone = phone;
        if (address) updates.address = address;
        if (postal) updates.postalCode = postal;
        if (province) updates.province = province;
        if (dateOfBirth) updates.dateOfBirth = dateOfBirth;
        if (gender) updates.gender = gender;
        if (citizenshipStatus) updates.citizenshipStatus = citizenshipStatus;
        if (householdSize) updates.householdSize = householdSize;
        if (familyComposition) updates.familyComposition = familyComposition;
        if (annualIncome) updates.annualFamilyNetIncome = annualIncome;
        if (guardianName) updates.guardianName = guardianName;
        if (guardianPhone) updates.guardianPhone = guardianPhone;
        if (guardianEmail) updates.guardianEmail = guardianEmail;
        if (highestEducation) updates.highestEducation = highestEducation;
        if (graduationDate) updates.graduationDate = graduationDate;
        if (tradeSchoolName) updates.tradeSchoolName = tradeSchoolName;
        if (tradeProgramName) updates.tradeProgramName = tradeProgramName;
        if (tradeGraduationDate)
          updates.tradeGraduationDate = tradeGraduationDate;
        if (tradeField) updates.trade = tradeField;
        if (apprenticeshipLevel)
          updates.apprenticeshipLevel = apprenticeshipLevel;

        if (Object.keys(updates).length) {
          updateProfileData(updates);
        }
      }

      setIsComplete(true);
    } catch (error) {
      console.error('Error building profile:', error);
      Alert.alert(
        'Upload failed',
        "We couldn't process that document. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePreview = async (doc: StoredDocument) => {
    try {
      await Linking.openURL(doc.uri);
    } catch (error) {
      console.warn('Failed to open document', error);
      Alert.alert(
        'Unable to open file',
        "We couldn't open this document on your device."
      );
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="#0B0B0F" />
        </TouchableOpacity>

        <Text style={styles.title}>Documents</Text>
        <Text style={styles.subtitle}>
          Securely upload and manage all documents linked to your profile or
          applications.
        </Text>

        <TouchableOpacity
          style={styles.buildButton}
          onPress={handleBuildProfile}
          activeOpacity={0.85}
        >
          <View style={styles.buildRow}>
            <Ionicons name="cloud-upload-outline" size={20} color="#4F3CC9" />
            <Text style={styles.buildText}>Build profile</Text>
            <Ionicons name="chevron-forward" size={18} color="#4F3CC9" />
          </View>
          <Text style={styles.buildSubtext}>
            Upload your resume to auto-fill your profile details.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.uploadCard}
          onPress={handleUpload}
          activeOpacity={0.85}
        >
          <Text style={styles.uploadText}>Upload</Text>
          <Ionicons name="cloud-upload-outline" size={22} color="#4F3CC9" />
        </TouchableOpacity>

        <View style={styles.filesSection}>
          <Text style={styles.filesTitle}>My Files</Text>
          {documents.length === 0 ? (
            <Text style={styles.emptyState}>
              No documents yet. Upload a file to see it here.
            </Text>
          ) : (
            documents.map((doc, index) => (
              <TouchableOpacity
                key={doc.id}
                style={[
                  styles.fileRow,
                  index === documents.length - 1 && styles.fileRowLast,
                ]}
                activeOpacity={0.7}
                onPress={() => handlePreview(doc)}
              >
                <Ionicons
                  name="document-outline"
                  size={22}
                  color="#242425"
                  style={styles.fileIcon}
                />
                <Text style={styles.fileName}>{doc.name}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
      <DocumentStatusOverlay
        showProcessing={isProcessing}
        showComplete={isComplete}
        processingTitle="We are building your profile"
        completeTitle="Complete!"
        completeButtonLabel="Go to Profile"
        processingImageSource={SMIGGS}
        completeImageSource={SMIGGS_DONE}
        onCompletePress={() => {
          setIsComplete(false);
          router.push('/(tabs)/profile');
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 40,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0B0B0F',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 28,
  },
  buildButton: {
    backgroundColor: '#E5E0FF',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 16,
    gap: 6,
  },
  buildRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  buildText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3E3B6E',
    flex: 1,
  },
  buildSubtext: {
    fontSize: 13,
    color: '#4B5563',
  },
  uploadCard: {
    backgroundColor: '#CEC9FF',
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3E3B6E',
  },
  filesSection: {
    marginTop: 8,
  },
  filesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  fileRowLast: {
    borderBottomWidth: 0,
  },
  fileIcon: {
    marginRight: 12,
  },
  fileName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
  },
  emptyState: {
    fontSize: 14,
    color: '#6B7280',
    paddingVertical: 12,
  },
});
