import { Theme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ApplyHereButtonProps = {
    onApplyHere?: () => void;
    disabled?: boolean;
};

export default function ApplyHereButton({
    onApplyHere,
    disabled,
}: ApplyHereButtonProps) {
    return (
        <View style={styles.container}>
            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    pressed && !disabled && styles.buttonPressed,
                    disabled && styles.buttonDisabled,
                ]}
                onPress={onApplyHere}
                disabled={disabled}
            >
                <Text
                    style={[
                        styles.buttonText,
                        disabled && styles.buttonTextDisabled,
                    ]}
                >
                    Apply here
                </Text>
                <Ionicons
                    name="open-outline"
                    size={20}
                    color={Theme.colors.black}
                    style={styles.iconApplyHere}
                />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 0,
        paddingBottom: 0,
        paddingTop: 0,
        alignSelf: "center",
    },
    button: {
        borderRadius: 8,
        paddingVertical: 14,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: Theme.colors.green,
    },
    buttonPressed: {
        opacity: 0.8,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        ...Theme.typography.button,
        color: Theme.colors.black,
    },
    buttonTextDisabled: {
        color: Theme.colors.darkGrey,
    },
    iconApplyHere: {
        marginLeft: 100,
        marginRight: 0,
    },
});
