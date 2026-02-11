import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  amount: number | string;
  title?: string;
  variant?: "compact" | "default";
};

export default function GrantsReceivedCard({
  amount,
  title = "Total grants received",
  variant = "compact", // compact for the dashboard tile
}: Props) {
  const isCompact = variant === "compact";

  return (
    <View
      className="rounded-[10px] bg-[#CBC6FF] overflow-hidden"
      style={{ height: isCompact ? 84 : undefined }}
    >
      <View className="h-full flex-row items-center">
        {/* Icon */}
        <View className={isCompact ? "ml-5 mr-4" : "ml-[23px] mr-[23.5px]"}>
          <Ionicons
            // Lock matches your Figma; change to "bag-handle-outline" if you prefer
            name="lock-open-outline"
            size={isCompact ? 28 : 56}
            color="#7B6CF6"
          />
        </View>

        {/* Text */}
        <View className="flex-1 pr-5">
          <Text
            className={
              isCompact
                ? "text-sm text-gray-900"
                : "text-[22px] leading-[26px] text-gray-900"
            }
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>

          <Text
            className={
              isCompact
                ? "mt-1 text-xl font-extrabold text-gray-900"
                : "mt-2 text-[28px] leading-[32px] font-extrabold text-gray-900"
            }
            numberOfLines={1}
            ellipsizeMode="clip"
          >
            ${amount}
          </Text>
        </View>
      </View>
    </View>
  );
}
