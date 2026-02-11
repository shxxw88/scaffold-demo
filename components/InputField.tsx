import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

interface InputFieldProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onVoiceInput?: () => void;
  showVoiceButton?: boolean;
  isDropdown?: boolean;
  multiline?: boolean;
}

export default function InputField({
  placeholder,
  value,
  onChangeText,
  onVoiceInput,
  showVoiceButton = false,
  isDropdown = false,
  multiline = false,
}: InputFieldProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
      />
      {isDropdown && (
        <View style={styles.dropdownIcon}>
          <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
        </View>
      )}
    </View>
  );
}

export function InputFieldWithVoice({
  placeholder,
  value,
  onChangeText,
  onVoiceInput,
  isDropdown = false,
  multiline = false,
}: InputFieldProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
      />
      {isDropdown && (
        <View style={styles.dropdownIcon}>
          <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
        </View>
      )}
      {onVoiceInput && (
        <TouchableOpacity
          style={isDropdown ? styles.voiceButton : styles.voiceButtonNoDropdown}
          onPress={onVoiceInput}
          activeOpacity={0.7}
        >
          <Ionicons name="mic" size={20} color="#8B5CF6" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#0B0B0F",
    minHeight: 48,
  },
  multilineInput: {
    minHeight: 100,
    paddingTop: 12,
  },
  dropdownIcon: {
    position: "absolute",
    right: 16,
    top: "50%",
    marginTop: -10,
  },
  voiceButton: {
    position: "absolute",
    right: 50,
    top: "50%",
    marginTop: -12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  voiceButtonNoDropdown: {
    position: "absolute",
    right: 16,
    top: "50%",
    marginTop: -12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
});
