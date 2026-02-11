import ProfileExitModal from "@/components/ProfileExitModal";
import { useProfile } from "@/contexts/ProfileContext";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfilePictureScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ source?: string }>();
  const sourceParam = Array.isArray(params.source)
    ? params.source[0]
    : params.source;
  const { profileData, updateProfileData } = useProfile();
  const [selectedImage, setSelectedImage] = useState(
    profileData.profileImageUri || ""
  );
  const [showExitModal, setShowExitModal] = useState(false);
  const editingFromProfile = sourceParam === "profile";

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "We need access to your photo library to add a profile picture."
      );
      return false;
    }
    return true;
  };

  const handlePickImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length) {
      const uri = result.assets[0]?.uri;
      if (uri) {
        setSelectedImage(uri);
        updateProfileData({ profileImageUri: uri });
      }
    }
  };

  const handleClose = () => {
    if (editingFromProfile) {
      router.back();
    } else {
      router.push("/(tabs)/profile");
    }
  };

  const handlePrimaryAction = () => {
    if (editingFromProfile) {
      router.back();
    } else {
      router.push("/(tabs)/profile");
    }
  };

  const headerTitle = editingFromProfile ? "Edit Profile Picture" : "Final";

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity
          accessibilityRole="button"
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{headerTitle}</Text>

        <TouchableOpacity
          accessibilityRole="button"
          style={styles.headerButton}
          onPress={() => setShowExitModal(true)}
        >
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Profile Picture</Text>
        <Text style={styles.sectionSubtitle}>(optional)</Text>

        <TouchableOpacity
          style={styles.imagePicker}
          onPress={handlePickImage}
          activeOpacity={0.8}
        >
          {selectedImage ? (
            <Image
              source={{ uri: selectedImage }}
              style={styles.previewImage}
              contentFit="cover"
            />
          ) : (
            <View style={styles.placeholderContent}>
              <Ionicons name="image-outline" size={48} color="#B4B4B4" />
              <View style={styles.plusBadge}>
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </View>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.generateButton}
          onPress={handlePrimaryAction}
          activeOpacity={0.9}
        >
          <Text style={styles.generateButtonText}>
            {editingFromProfile ? "Submit Image" : "Generate Profile"}
          </Text>
        </TouchableOpacity>
      </View>

      <ProfileExitModal
        visible={showExitModal}
        onCancel={() => setShowExitModal(false)}
        onExit={() => {
          setShowExitModal(false);
          handleClose();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0B0B0F",
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    width: "100%",
    height: "100%",
    backgroundColor: "#8B5CF6",
    borderRadius: 4,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0B0B0F",
    marginTop: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 32,
  },
  imagePicker: {
    width: 220,
    height: 220,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  plusBadge: {
    position: "absolute",
    right: -4,
    bottom: -4,
    backgroundColor: "#8B5CF6",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  generateButton: {
    backgroundColor: "#F59E0B",
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: "center",
  },
  generateButtonText: {
    color: "#0B0B0F",
    fontWeight: "700",
    fontSize: 16,
  },
});
