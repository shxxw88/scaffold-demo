import { GrantDefinition } from "@/constants/grants";
import { Theme } from "@/constants/theme";
import { useProfile } from "@/contexts/ProfileContext";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import React, { useEffect, useMemo, useState } from "react";
import {
  Linking,
  Platform,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import ApplyHereButton from "./ApplyHereButton";
import SavePDFButton from "./SavePDFButton";
import SparkleIcon from "./SparkleIcon";

const PRESET_GOAL =
  "My future goal is to become a certified journey person and eventually lead my own crew on complex builds. I want to keep learning advanced techniques so I can mentor other apprentices.";
const PRESET_CAREER =
  "I chose this trade because I enjoy building tangible projects, solving problems with my hands, and seeing the impact our work has on communities.";
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

type FormData = {
  // Basic Profile
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  email: string;
  currentEmployer: string;
  // Education and Training
  costOfTuition: string;
  graduationDate: string;
  apprenticeshipLevel: string;
  // References
  refFirstName: string;
  refLastName: string;
  refPhone: string;
  // Written Answers
  futureGoal: string;
  careerChoice: string;
};

type ApplicationTempletProps = {
  grant?: GrantDefinition | null;
};

type CopyableInputProps = TextInputProps & {
  value: string;
  onChangeText: (text: string) => void;
};

const buildName = (value: string) => {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { first: "", last: "" };
  }
  const [first, ...rest] = parts;
  return { first, last: rest.join(" ") };
};

const CopyableInput = ({
  value,
  onChangeText,
  multiline,
  style,
  ...rest
}: CopyableInputProps) => {
  const handleCopy = () => Clipboard.setStringAsync(value || "");

  return (
    <View style={styles.inputWrapper}>
      <TextInput
        {...rest}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        style={[multiline ? styles.multilineInput : styles.input, style]}
        textAlignVertical={multiline ? "top" : "center"}
      />
      <TouchableOpacity
        onPress={handleCopy}
        activeOpacity={0.7}
        style={[styles.copyButton, multiline && styles.copyButtonMultiline]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="copy-outline" size={18} color={Theme.colors.darkGrey} />
      </TouchableOpacity>
    </View>
  );
};

export default function ApplicationTemplet({ grant }: ApplicationTempletProps) {
  const { profileData } = useProfile();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phone: "",
    address: "4500 Still Creek Dr",
    city: "Burnaby",
    province: "",
    email: "",
    currentEmployer: "",
    costOfTuition: "",
    graduationDate: "",
    apprenticeshipLevel: "",
    refFirstName: "",
    refLastName: "",
    refPhone: "",
    futureGoal: PRESET_GOAL,
    careerChoice: PRESET_CAREER,
  });

  const autoFilledValues = useMemo(() => {
    // Pull whatever we can from ProfileContext and fall back to template defaults.
    const { first: nameFirst, last: nameLast } = buildName(
      profileData.name || ""
    );
    const { first: guardianFirst, last: guardianLast } = buildName(
      profileData.guardianName || ""
    );
    const locationLine = [profileData.province, profileData.postalCode]
      .filter(Boolean)
      .join(", ");

    return {
      firstName: nameFirst,
      lastName: nameLast,
      phone: profileData.phone || "",
      address: "4500 Still Creek Dr",
      city: "Burnaby",
      province: profileData.province || "",
      email: profileData.email || "",
      currentEmployer:
        profileData.tradeSchoolName ||
        profileData.guardianName ||
        profileData.tradeProgramName ||
        "",
      costOfTuition: "$4500",
      graduationDate: "06/25",
      apprenticeshipLevel: profileData.apprenticeshipLevel || "",
      refFirstName: "Mateo",
      refLastName: "Alverez",
      refPhone: profileData.guardianPhone || "(604) 421-4122",
      futureGoal: "",
      careerChoice: "",
    } satisfies Partial<FormData>;
  }, [profileData, grant]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      ...autoFilledValues,
    }));
  }, [autoFilledValues]);

  const [isGenerating, setIsGenerating] = useState({
    futureGoal: false,
    careerChoice: false,
  });

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
    futureGoal: "What is your future goal as a mason?",
    careerChoice: "Why have you chosen a career in masonry?",
  } as const;

  const generateAnswer = async (field: keyof typeof questions) => {
    if (!OPENAI_API_KEY) {
      Alert.alert(
        "Missing API key",
        "Add EXPO_PUBLIC_OPENAI_API_KEY to generate answers."
      );
      return;
    }
    // Inline spinner per field keeps UI responsive if both prompts are used back-to-back.
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

      setFormData((prev) => ({ ...prev, [field]: next }));
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

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const applyUrl = grant?.apply.portal.url;

  const handleApplyPress = () => {
    if (!applyUrl) {
      return;
    }

    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.open(
        applyUrl,
        "_blank",
        "noopener,noreferrer,width=1200,height=900"
      );
      return;
    }

    Linking.openURL(applyUrl).catch((err) =>
      console.log("Unable to open portal URL", err)
    );
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Basic Profile Section */}
        <View>
          <Text style={styles.sectionTitle}>Basic Profile</Text>

          <View style={styles.contentContainer}>
            <View style={styles.row}>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>First Name</Text>
                <CopyableInput
                  value={formData.firstName}
                  onChangeText={(text) => handleChange("firstName", text)}
                  placeholder=""
                />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Last Name</Text>
                <CopyableInput
                  value={formData.lastName}
                  onChangeText={(text) => handleChange("lastName", text)}
                  placeholder=""
                />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Phone #</Text>
                <CopyableInput
                  value={formData.phone}
                  onChangeText={(text) => handleChange("phone", text)}
                  placeholder=""
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.fieldContainer, styles.fieldFullWidth]}>
                <Text style={styles.label}>Address</Text>
                <CopyableInput
                  value={formData.address}
                  onChangeText={(text) => handleChange("address", text)}
                  placeholder=""
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>City</Text>
                <CopyableInput
                  value={formData.city}
                  onChangeText={(text) => handleChange("city", text)}
                  placeholder=""
                />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Province</Text>
                <CopyableInput
                  value={formData.province}
                  onChangeText={(text) => handleChange("province", text)}
                  placeholder=""
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.fieldContainer, styles.fieldHalfWidth]}>
                <Text style={styles.label}>Email</Text>
                <CopyableInput
                  value={formData.email}
                  onChangeText={(text) => handleChange("email", text)}
                  placeholder=""
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={[styles.fieldContainer, styles.fieldHalfWidth]}>
                <Text style={styles.label}>Current Employer</Text>
                <CopyableInput
                  value={formData.currentEmployer}
                  onChangeText={(text) => handleChange("currentEmployer", text)}
                  placeholder=""
                />
              </View>
            </View>
          </View>
        </View>

        {/* Education and Training Section */}
        <View>
          <Text style={styles.sectionTitle}>Education and Training</Text>

          <View style={styles.contentContainer}>
            <View style={styles.row}>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Cost of Tuition</Text>
                <CopyableInput
                  value={formData.costOfTuition}
                  onChangeText={(text) => handleChange("costOfTuition", text)}
                  placeholder=""
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Graduation mm/yy</Text>
                <CopyableInput
                  value={formData.graduationDate}
                  onChangeText={(text) => handleChange("graduationDate", text)}
                  placeholder=""
                />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Apprenticeship Level</Text>
                <CopyableInput
                  value={formData.apprenticeshipLevel}
                  onChangeText={(text) =>
                    handleChange("apprenticeshipLevel", text)
                  }
                  placeholder=""
                />
              </View>
            </View>
          </View>
        </View>

        {/* References Section */}
        <View>
          <Text style={styles.sectionTitle}>References</Text>

          <View style={styles.contentContainer}>
            <View style={styles.row}>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>First Name</Text>
                <CopyableInput
                  value={formData.refFirstName}
                  onChangeText={(text) => handleChange("refFirstName", text)}
                  placeholder=""
                />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Last Name</Text>
                <CopyableInput
                  value={formData.refLastName}
                  onChangeText={(text) => handleChange("refLastName", text)}
                  placeholder=""
                />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Phone #</Text>
                <CopyableInput
                  value={formData.refPhone}
                  onChangeText={(text) => handleChange("refPhone", text)}
                  placeholder=""
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Written Answers Section */}
        <View>
          <View style={styles.writtenAnswersHeader}>
            <Text style={styles.writtenAnswersTitle}>Written Answers</Text>
            <SparkleIcon size={18} />
          </View>
          <Text style={styles.subtitle}>
            We&apos;ve generated some answers for you.
          </Text>

          <View style={styles.writtenAnswersContent}>
            <View style={styles.writtenAnswersColumn}>
              <View style={styles.questionRow}>
                <Text style={styles.questionLabel}>
                  What is your future goal as a mason?
                </Text>
                <TouchableOpacity
                  onPress={() => generateAnswer("futureGoal")}
                  disabled={isGenerating.futureGoal}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  accessibilityRole="button"
                  accessibilityLabel="Generate answer with AI"
                >
                  {isGenerating.futureGoal ? (
                    <ActivityIndicator size="small" color={Theme.colors.purple} />
                  ) : (
                    <SparkleIcon size={18} />
                  )}
                </TouchableOpacity>
              </View>
              <CopyableInput
                value={formData.futureGoal}
                onChangeText={(text) => handleChange("futureGoal", text)}
                placeholder=""
                multiline
              />
            </View>

            <View style={styles.writtenAnswersColumn}>
              <View style={styles.questionRow}>
                <Text style={styles.questionLabel}>
                  Why have you chosen a career in masonry?
                </Text>
                <TouchableOpacity
                  onPress={() => generateAnswer("careerChoice")}
                  disabled={isGenerating.careerChoice}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  accessibilityRole="button"
                  accessibilityLabel="Generate answer with AI"
                >
                  {isGenerating.careerChoice ? (
                    <ActivityIndicator size="small" color={Theme.colors.purple} />
                  ) : (
                    <SparkleIcon size={18} />
                  )}
                </TouchableOpacity>
              </View>
              <CopyableInput
                value={formData.careerChoice}
                onChangeText={(text) => handleChange("careerChoice", text)}
                placeholder=""
                multiline
              />
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={styles.buttonsContainer}>
        <ApplyHereButton onApplyHere={handleApplyPress} disabled={!applyUrl} />
        <SavePDFButton />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Theme.colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
    paddingTop: 30,
    paddingHorizontal: 24,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 8,
    backgroundColor: Theme.colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.colors.green,
    marginBottom: Theme.spacing.lg,
  },

  sectionTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 15,
    lineHeight: 18.26,
    color: Theme.colors.black,
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  fieldContainer: {
    flex: 1,
    marginBottom: Theme.spacing.sm,
  },
  fieldFullWidth: {
    flex: 1,
  },
  fieldHalfWidth: {
    flex: 1,
  },
  label: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 10,
    lineHeight: 16,
    color: "#868686",
    marginBottom: Theme.spacing.xs,
  },
  input: {
    backgroundColor: Theme.colors.white,
    borderWidth: 1,
    borderColor: "#E4E4E4",
    borderRadius: 2,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    paddingRight: 44,
    ...Theme.typography.body,
    color: Theme.colors.black,
    minHeight: 34,
  },
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  questionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: Theme.spacing.sm,
  },
  copyButton: {
    position: "absolute",
    right: 10,
    top: "50%",
    marginTop: -14,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.colors.white,
  },
  writtenAnswersHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.sm,
    marginBottom: 4,
  },
  writtenAnswersTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 15,
    lineHeight: 18.26,
    color: Theme.colors.black,
  },
  subtitle: {
    fontFamily: Theme.fonts.medium,
    fontSize: 10,
    lineHeight: 16,
    color: Theme.colors.black,
    marginBottom: 15,
  },
  writtenAnswersContent: {
    padding: 20,
    paddingBottom: 20,
    backgroundColor: Theme.colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.colors.green,
    marginBottom: Theme.spacing.lg,
    flexDirection: "row",
    gap: Theme.spacing.md,
  },
  writtenAnswersColumn: {
    flex: 1,
  },
  questionLabel: {
    fontFamily: Theme.fonts.medium,
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.black,
    fontStyle: "italic",
    marginBottom: 10,
  },
  multilineInput: {
    backgroundColor: Theme.colors.white,
    borderWidth: 1,
    borderColor: "#E4E4E4",
    borderRadius: 8,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    paddingRight: 44,
    ...Theme.typography.body,
    color: Theme.colors.black,
    minHeight: 120,
    textAlignVertical: "top",
  },
  copyButtonMultiline: {
    top: 8,
    marginTop: 0,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 0,
  },
});
