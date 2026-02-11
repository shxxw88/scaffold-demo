import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const { session, initializing } = useAuth();

  useEffect(() => {
    if (initializing) return;
    router.replace(session ? "/eligibility-info" : "/sign-in");
  }, [initializing, session, router]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
      }}
    >
      <ActivityIndicator size="large" color="#8B5CF6" />
    </View>
  );
}
