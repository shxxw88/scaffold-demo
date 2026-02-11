import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Fonts } from "@/constants/theme";

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function SignUp() {
  const router = useRouter();
  const { signUp, authLoading, session } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      router.replace("/(tabs)");
    }
  }, [router, session]);

  const updateField = (
    key: "name" | "email" | "password" | "confirmPassword",
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!isValidEmail(form.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    const { error: signUpError, session: newSession } = await signUp(
      form.name.trim(),
      form.email.trim().toLowerCase(),
      form.password
    );
    if (signUpError) {
      setError(signUpError);
      return;
    }
    if (newSession) {
      router.replace("/(tabs)");
      return;
    }
    router.replace("/confirm-email");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View style={styles.logoBlock}>
          <Image
            source={require("../assets/images/scaf logo.svg")}
            style={{ width: 82, height: 82 }}
            contentFit="contain"
            accessibilityLabel="Scaffold icon"
          />
          <Text style={styles.heroTitle}>
            Sign up to unlock grants made for you.
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#A0A0A5"
            autoCapitalize="words"
            value={form.name}
            onChangeText={(value) => updateField("name", value)}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#A0A0A5"
            autoCapitalize="none"
            keyboardType="email-address"
            value={form.email}
            onChangeText={(value) => updateField("email", value)}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#A0A0A5"
            secureTextEntry
            value={form.password}
            onChangeText={(value) => updateField("password", value)}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            placeholderTextColor="#A0A0A5"
            secureTextEntry
            value={form.confirmPassword}
            onChangeText={(value) => updateField("confirmPassword", value)}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSubmit}
            activeOpacity={0.9}
            disabled={authLoading}
          >
            {authLoading ? (
              <ActivityIndicator color="#0F172A" />
            ) : (
              <Text style={styles.primaryButtonText}>Sign up</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.switchText}>
            Already have an account?{" "}
            <Text
              style={styles.linkText}
              onPress={() => router.replace("/sign-in")}
            >
              Log in
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    minHeight: "100%",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 28,
    paddingVertical: 40,
    justifyContent: "center",
  },
  logoBlock: {
    alignItems: "center",
    marginBottom: 32,
  },
  heroTitle: {
    textAlign: "center",
    marginTop: 27,
    color: "#7260CC",
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Fonts.bold,
    maxWidth: 220,
  },
  form: {
    gap: 10,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#C9C9D2",
    borderWidth: 1.2,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 20,
    fontSize: 14,
    color: "#0F172A",
    fontFamily: Fonts.medium,
  },
  errorText: {
    color: "#E83B4D",
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
  primaryButton: {
    backgroundColor: "#FF890C",
    borderRadius: 999,
    paddingVertical: 16,
    marginTop: 36, 
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#0F172A",
    fontSize: 15,
    fontFamily: Fonts.medium,
  },
  switchText: {
    textAlign: "center",
    marginTop: 27,
    fontSize: 14,
    color: "#1F2937",
    fontFamily: Fonts.medium
  },
  linkText: {
    textDecorationLine: "underline",
    fontFamily: Fonts.bold
  },
});
