import BottomNavigation from "@/components/BottomNavigation";
import SparkleIcon from "@/components/SparkleIcon";
import { getGrantById } from "@/constants/grants";
import { Theme } from "@/constants/theme";
import { useProfile } from "@/contexts/ProfileContext";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Linking,
  LayoutChangeEvent,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";

const MIN_WRITTEN_ANSWER_HEIGHT = 80;
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export default function GeneratedApplicationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const grant = getGrantById(params.id);
  const { profileData } = useProfile();
  const [writtenAnswers, setWrittenAnswers] = useState({
    goal: "",
    career: "",
  });
  const [isGenerating, setIsGenerating] = useState({
    goal: false,
    career: false,
  });
  const [goalAnswerHeight, setGoalAnswerHeight] = useState(
    MIN_WRITTEN_ANSWER_HEIGHT
  );
  const [careerAnswerHeight, setCareerAnswerHeight] = useState(
    MIN_WRITTEN_ANSWER_HEIGHT
  );
  const handleGoalMirrorLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const height = event.nativeEvent.layout.height;
      if (!height) return;
      setGoalAnswerHeight((prev) => {
        const next = Math.max(
          MIN_WRITTEN_ANSWER_HEIGHT,
          Math.ceil(height)
        );
        return Math.abs(prev - next) < 0.5 ? prev : next;
      });
    },
    []
  );

  const handleCareerMirrorLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const height = event.nativeEvent.layout.height;
      if (!height) return;
      setCareerAnswerHeight((prev) => {
        const next = Math.max(
          MIN_WRITTEN_ANSWER_HEIGHT,
          Math.ceil(height)
        );
        return Math.abs(prev - next) < 0.5 ? prev : next;
      });
    },
    []
  );

  const autoFilledProfile = useMemo(
    () => ({
      // Mirror the profile into the printable template; show prompts when missing.
      fullName: profileData.name || "Add your name",
      streetAddress: profileData.address || "Add your address",
      city:
        [profileData.province, profileData.postalCode].filter(Boolean).join(", ") ||
        "Add your city/province",
      email: profileData.email || "Add your email",
      phone: profileData.phone || "Add your phone number",
      currentEmployer:
        profileData.tradeSchoolName ||
        profileData.guardianName ||
        "Add your current employer or school",
      tuitionCost: "$4500" || "Add your tuition estimate",
      apprenticeshipLevel:
        profileData.apprenticeshipLevel || "Add your apprenticeship level",
    }),
    [profileData, grant]
  );

  const profileContext = useMemo(
    () =>
      [
        `Name: ${profileData.name || "Unknown"}`,
        `Email: ${profileData.email || "Unknown"}`,
        `Phone: ${profileData.phone || "Unknown"}`,
        `Address: ${profileData.address || "Unknown"}`,
        `Province: ${profileData.province || "Unknown"}`,
        `Postal Code: ${profileData.postalCode || "Unknown"}`,
        `Trade: ${profileData.trade || "Unknown"}`,
        `Apprenticeship Level: ${profileData.apprenticeshipLevel || "Unknown"}`,
        `Highest education: ${profileData.highestEducation || "Unknown"}`,
        `School: ${profileData.highSchoolName || profileData.tradeSchoolName || "Unknown"}`,
        `Graduation date: ${
          profileData.graduationDate ||
          profileData.tradeGraduationDate ||
          "Unknown"
        }`,
        `Household: ${profileData.familyComposition || "Unknown"}, size ${
          profileData.householdSize || "Unknown"
        }, income ${profileData.annualFamilyNetIncome || "Unknown"}`,
        `Citizenship status: ${profileData.citizenshipStatus || "Unknown"}`,
      ].join("\n"),
    [profileData]
  );

  const grantContext = useMemo(() => {
    if (!grant) return "No grant selected.";
    const facts =
      grant.detailFacts?.map((fact) => `${fact.label}: ${fact.details?.join("; ") || ""}`) ||
      [];
    return [
      `Title: ${grant.title}`,
      `Organization: ${grant.organization}`,
      `Summary: ${grant.summary}`,
      `Amount: ${grant.amount}`,
      `Deadline: ${grant.deadline}`,
      `Notes: ${grant.notes.join(" | ")}`,
      `Apply instructions: ${grant.apply.portal.instructions || grant.apply.portal.label}`,
      `Tags: ${grant.tags.join(", ")}`,
      `Facts: ${facts.join(" | ")}`,
    ].join("\n");
  }, [grant]);

  const questions = {
    goal: "What is your future goal in your trade?",
    career: "Why have you chosen this career path?",
  } as const;

  const generateAnswer = async (field: keyof typeof questions) => {
    if (!OPENAI_API_KEY) {
      Alert.alert(
        "Missing API key",
        "Add EXPO_PUBLIC_OPENAI_API_KEY to generate answers."
      );
      return;
    }
    setIsGenerating((prev) => ({ ...prev, [field]: true }));
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You draft concise, authentic grant application answers in first person for a trades applicant. Use the profile and grant context provided. Stay truthful; avoid inventing specifics that are not present. Aim for 120-170 words. Show alignment with what the grant supports.",
            },
            {
              role: "user",
              content: [
                `Grant details:\n${grantContext}`,
                `Applicant profile:\n${profileContext}`,
                `Question: ${questions[field]}`,
                "Write a single cohesive paragraph. Keep tone genuine and professional.",
              ].join("\n\n"),
            },
          ],
          temperature: 0.5,
          max_tokens: 320,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI error ${response.status}`);
      }

      const data = await response.json();
      const next =
        data?.choices?.[0]?.message?.content?.trim() ||
        "Unable to generate an answer right now.";

      setWrittenAnswers((prev) => ({ ...prev, [field]: next }));
    } catch (error) {
      console.error("Failed to generate answer", error);
      Alert.alert(
        "Generation failed",
        "We couldn't generate an answer right now. Please try again."
      );
    } finally {
      setIsGenerating((prev) => ({ ...prev, [field]: false }));
    }
  };

  const docList = grant?.apply.requiredDocuments ?? [
    "Unofficial transcript (high school or post-secondary)",
    "Proof of registration and acceptance in your program",
    "Letter of support from your current employer",
  ];

  const handleApplyPress = () => {
    const url = grant?.apply.portal.url;
    if (url) {
      Linking.openURL(url).catch(() => console.log("Unable to open portal URL"));
      return;
    }
    console.log("Apply button pressed - navigate to external portal");
  };

  const handleUploadDocuments = () => {
    console.log("Upload documents pressed");
  };

  const insertPresetGoal = () => {
    setWrittenAnswers((prev) => ({ ...prev, goal: PRESET_GOAL }));
  };
  const insertPresetCareer = () => {
    setWrittenAnswers((prev) => ({ ...prev, career: PRESET_CAREER }));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 24,
          paddingTop: Theme.spacing.md,
        }}
      >
        <Stack.Screen options={{ headerShown: false }} />

        {/* Custom Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back-outline" size={22} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="bookmark-outline" size={22} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Top Section */}
        <View
          style={{
            marginBottom: 34,
          }}
        >
          <Text
            style={[
              Theme.typography.body,
              { color: Theme.colors.black, marginBottom: 10 },
            ]}
          >
            You&apos;re almost done!
          </Text>
          <Text
            style={[
              Theme.typography.h2,
              { color: Theme.colors.black, marginBottom: 10 },
            ]}
          >
            {grant?.title ?? "Grant application template"}
          </Text>
          <Text
            style={[
              Theme.typography.body,
              { color: Theme.colors.black, marginBottom: 23 },
            ]}
          >
            We&apos;ve auto-filled your application using your profile{" "}
            <Text
              style={[Theme.typography.body, { color: Theme.colors.purple }]}
            >
              Finish applying through the{" "}
              <Text
                style={[
                  Theme.typography.bodyBold,
                  { color: Theme.colors.purple },
                ]}
              >
                {grant?.apply.portal.label || "portal"}
              </Text>
            </Text>
            .
          </Text>

          <TouchableOpacity
            style={{
              backgroundColor: Theme.colors.green,
              borderRadius: Theme.radius.card,
              paddingTop: 25,
              paddingBottom: 25,
              paddingLeft: 16,
              paddingRight: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
            onPress={handleApplyPress}
          >
            <Text
              style={[Theme.typography.body, { color: Theme.colors.black }]}
            >
              {grant?.apply.portal.label || "Apply here"}
            </Text>
            <Ionicons name="open-outline" size={20} color="black" />
          </TouchableOpacity>
        </View>

        {/* Application Template Section */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={[
              Theme.typography.h2,
              { color: Theme.colors.black, marginBottom: 20 },
            ]}
          >
            Your application
          </Text>

          {/* Basic Profile */}
          <View style={styles.applicationCard}>
            <Text style={styles.applicationCardTitle}>Basic Profile</Text>

            <View style={styles.applicationCardContent}>
              <View style={styles.applicationCardItem}>
                <Text style={styles.applicationCardItemLabel}>Full Name</Text>
                <Text style={styles.applicationCardItemValue}>
                  {autoFilledProfile.fullName}
                </Text>
              </View>

              <View style={styles.applicationCardItem}>
                <Text style={styles.applicationCardItemLabel}>
                  Street Address
                </Text>
                <Text style={styles.applicationCardItemValue}>
                  {autoFilledProfile.streetAddress}
                </Text>
              </View>

              <View style={styles.applicationCardItem}>
                <Text style={styles.applicationCardItemLabel}>City</Text>
                <Text style={styles.applicationCardItemValue}>
                  {autoFilledProfile.city}
                </Text>
              </View>

              <View style={styles.applicationCardItem}>
                <Text style={styles.applicationCardItemLabel}>Email</Text>
                <Text style={styles.applicationCardItemValue}>
                  {autoFilledProfile.email}
                </Text>
              </View>

              <View style={styles.applicationCardItem}>
                <Text style={styles.applicationCardItemLabel}>Phone</Text>
                <Text style={styles.applicationCardItemValue}>
                  {autoFilledProfile.phone}
                </Text>
              </View>

              <View style={styles.applicationCardItem}>
                <Text style={styles.applicationCardItemLabel}>
                  Current Employer
                </Text>
                <Text style={styles.applicationCardItemValue}>
                  {autoFilledProfile.currentEmployer}
                </Text>
              </View>
            </View>
          </View>

          {/* Education and training */}
          <View style={styles.applicationCard}>
            <Text style={styles.applicationCardTitle}>
              Education and training
            </Text>

            <View style={styles.applicationCardContent}>
              <View style={styles.applicationCardItem}>
                <Text style={styles.applicationCardItemLabel}>
                  Cost of Tuition
                </Text>
                <Text style={styles.applicationCardItemValue}>
                  {autoFilledProfile.tuitionCost}
                </Text>
              </View>

              <View style={styles.applicationCardItem}>
                <Text style={styles.applicationCardItemLabel}>
                  Apprenticeship Level
                </Text>
                <Text style={styles.applicationCardItemValue}>
                  {autoFilledProfile.apprenticeshipLevel}
                </Text>
              </View>
            </View>
          </View>

          {/* References */}
          <View style={styles.applicationCard}>
            <Text style={styles.applicationCardTitle}>References</Text>

            <View style={styles.applicationCardContent}>
              <View style={styles.applicationCardItem}>
                <Text style={styles.applicationCardItemLabel}>Full Name</Text>
                <Text style={styles.applicationCardItemValue}>
                  Not provided
                </Text>
              </View>

              <View style={styles.applicationCardItem}>
                <Text style={styles.applicationCardItemLabel}>Phone</Text>
                <Text style={styles.applicationCardItemValue}>
                  Not provided
                </Text>
              </View>
            </View>
          </View>

          {/* Written Answers */}
          <View style={styles.applicationCard}>
            <Text style={styles.applicationCardTitle}>Written Answers</Text>

            <View style={styles.applicationCardContent}>
              <View>
                {/* Label + sparkle icon */}
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={[
                      Theme.typography.body,
                      {
                        color: Theme.colors.darkGrey,
                        marginBottom: Theme.spacing.sm,
                        fontStyle: "italic",
                      },
                    ]}
                  >
                    What is your future goal in your trade?
                  </Text>

                  <TouchableOpacity
                    style={{ position: "absolute", right: 0, top: 0 }}
                    onPress={() => generateAnswer("goal")}
                    disabled={isGenerating.goal}
                    hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel="Insert suggested answer"
                  >
                    {isGenerating.goal ? (
                      <ActivityIndicator size="small" color={Theme.colors.purple} />
                    ) : (
                      <SparkleIcon />
                    )}
                  </TouchableOpacity>
                </View>

                <View style={{ marginBottom: Theme.spacing.sm }}>
                  <View style={styles.answerInputWrap}>
                    <TextInput
                      style={[
                        styles.answerInput,
                        { height: goalAnswerHeight },
                      ]}
                      placeholderTextColor={Theme.colors.grey}
                      placeholder="Enter your response here..."
                      value={writtenAnswers.goal}
                      onChangeText={(text) =>
                        setWrittenAnswers((prev) => ({ ...prev, goal: text }))
                      }
                      multiline
                      scrollEnabled={false}
                      textAlignVertical="top"
                    />
                    <Text
                      style={[styles.answerInput, styles.answerMirror]}
                      onLayout={handleGoalMirrorLayout}
                    >
                      {writtenAnswers.goal || " "}
                    </Text>
                  </View>
                </View>
              </View>

              <View>
                <Text
                  style={[
                    Theme.typography.body,
                    {
                      color: Theme.colors.darkGrey,
                      marginBottom: Theme.spacing.sm,
                      fontStyle: "italic",
                      paddingRight: 10,
                    },
                  ]}
                >
                  Why have you chosen this career path?
                </Text>
                <TouchableOpacity
                  style={{ position: "absolute", right: 0, top: 0 }}
                  onPress={() => generateAnswer("career")}
                  disabled={isGenerating.career}
                  hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                  accessibilityRole="button"
                  accessibilityLabel="Insert suggested answer"
                >
                  {isGenerating.career ? (
                    <ActivityIndicator size="small" color={Theme.colors.purple} />
                  ) : (
                    <SparkleIcon />
                  )}
                </TouchableOpacity>
                <View style={{ marginBottom: Theme.spacing.sm }}>
                  <View style={styles.answerInputWrap}>
                    <TextInput
                      style={[
                        styles.answerInput,
                        { height: careerAnswerHeight },
                      ]}
                      placeholderTextColor={Theme.colors.grey}
                      placeholder="Enter your response here..."
                      value={writtenAnswers.career}
                      onChangeText={(text) =>
                        setWrittenAnswers((prev) => ({ ...prev, career: text }))
                      }
                      multiline
                      scrollEnabled={false}
                      textAlignVertical="top"
                    />
                    <Text
                      style={[styles.answerInput, styles.answerMirror]}
                      onLayout={handleCareerMirrorLayout}
                    >
                      {writtenAnswers.career || " "}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Documents */}
          <View style={styles.applicationCard}>
            <Text style={styles.applicationCardTitle}>Documents</Text>

            <View style={styles.applicationCardContent}>
              {docList.map((doc, index) => (
                <View key={doc} style={styles.applicationCardItem}>
                  <Ionicons name="folder" size={20} color={Theme.colors.orange} />
                  <Text style={styles.documentItem}>{doc}</Text>
                </View>
              ))}

              <TouchableOpacity
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: Theme.spacing.md,
                  }}
                  onPress={handleUploadDocuments}
                >
                  <Ionicons
                    name="cloud-upload-outline"
                  size={20}
                  color={Theme.colors.darkGrey}
                />
                <Text
                  style={[
                    Theme.typography.body,
                    {
                      color: Theme.colors.darkGrey,
                      marginLeft: Theme.spacing.sm,
                    },
                  ]}
                >
                  Upload documents
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <BottomNavigation activeTab="grants" />
    </SafeAreaView>
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
    marginBottom: 26,
  },
  applicationCard: {
    backgroundColor: Theme.colors.lightGrey,
    borderWidth: 1,
    borderColor: Theme.colors.green,
    borderRadius: Theme.radius.card,
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginBottom: 12,
  },
  applicationCardTitle: {
    ...Theme.typography.subhead1,
    color: Theme.colors.black,
    marginBottom: 20,
  },
  applicationCardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  applicationCardItem: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    gap: 12,
  },
  applicationCardItemLabel: {
    ...Theme.typography.body,
    color: Theme.colors.darkGrey,
    flexShrink: 0,
    maxWidth: '40%',
  },
  applicationCardItemValue: {
    ...Theme.typography.body,
    color: Theme.colors.black,
    textAlign: "right",
    flexGrow: 1,
    flexBasis: '55%',
    flexShrink: 1,
    minWidth: 0,
  },
  documentItem: {
    ...Theme.typography.body,
    color: Theme.colors.black,
    marginLeft: Theme.spacing.md,
    textAlign: 'left',
    flex: 1,
    alignSelf: 'flex-start',
  },
  answerInput: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.radius.card,
    padding: Theme.spacing.md,
    minHeight: 80,
    ...Theme.typography.body,
    width: "100%",
  },
  answerInputWrap: {
    width: "100%",
    position: "relative",
  },
  answerMirror: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    opacity: 0,
    zIndex: -1,
    pointerEvents: "none",
  },
});
