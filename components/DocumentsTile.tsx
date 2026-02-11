import { Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  onPress?: () => void;
};

export default function DocumentsTile({ onPress }: Props) {
  return (
    <Pressable
      accessibilityLabel="Open documents"
      onPress={onPress}
      className="w-[104px] h-[84px] shrink-0 rounded-[10px] bg-[#CBC6FF] items-center justify-center active:opacity-80 overflow-hidden"
    >
      <Ionicons name="folder-outline" size={30} color="#7B6CF6" />
      <Text
        className="mt-1 text-[15px] font-semibold text-gray-900"
        numberOfLines={1}
      >
        Documents
      </Text>
    </Pressable>
  );
}
