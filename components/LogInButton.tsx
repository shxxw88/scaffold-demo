import { Theme } from "@/constants/theme";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type LogInButtonProps = {
    onLogIn?: () => void;
};

export default function LogInButton({ onLogIn }: LogInButtonProps) {
    return (
        <View style={styles.container}>
            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed,
                ]}
                onPress={onLogIn}
            >
                <Text style={styles.buttonText}>Sign up / Log in</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        paddingTop: 16,
    },
    button: {
        borderRadius: 8,
        paddingVertical: 14,
        paddingHorizontal: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Theme.colors.orange,
    },
    buttonPressed: {
        opacity: 0.8,
    },
    buttonText: {
        ...Theme.typography.button,
        color: Theme.colors.black,
    },
});
