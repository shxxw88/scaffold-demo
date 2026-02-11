import { Pressable, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  title: string;
  onPress?: () => void;
};

export default function ApplicationStepCard({ title, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-3 flex-row items-center justify-between rounded-[10px] border border-gray-200 bg-[#F8F8F8] p-4 active:opacity-80"
    >
      <View className="flex-row items-center">
        <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-green-100">
          <Ionicons name="checkmark" size={16} color="#22C55E" />
        </View>
        <Text className="text-base font-medium text-gray-800">{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#6B7280" />
    </Pressable>
  );
}
