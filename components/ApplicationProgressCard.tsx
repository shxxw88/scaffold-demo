import { View, Text, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  title: string;
  logoUri?: string;
  totalSteps?: number;
  currentStep?: number; // 1..totalSteps
  onPress?: () => void;
};

export default function ApplicationProgressCard({
  title,
  logoUri,
  totalSteps = 5,
  currentStep = 3,
  onPress,
}: Props) {
  const t = Math.max(2, totalSteps);
  const c = Math.min(Math.max(1, currentStep), t);
  const progressPct = ((c - 1) / (t - 1)) * 100;

  return (
    <Pressable
      onPress={onPress}
      className="rounded-[10px] bg-[#F1EFFF] px-4 pt-4 pb-3 mb-3"
      style={{
        // subtle card lift like Figma
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      }}
    >
      {/* top row: status + chevron */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-[18px] leading-[22px] text-[#1F2937]">
          Now you’re <Text className="font-extrabold">in progress</Text>
        </Text>
        <Ionicons name="chevron-forward" size={22} color="#111111" />
      </View>

      {/* title row */}
      <View className="flex-row items-center mb-10">
        {logoUri ? (
          <Image
            source={{ uri: logoUri }}
            className="h-8 w-8 rounded-full mr-3"
          />
        ) : (
          <View className="h-8 w-8 rounded-full mr-3 items-center justify-center bg-white" />
        )}
        <Text
          className="flex-1 text-[20px] leading-[24px] font-extrabold text-[#0B0B0F]"
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>

      {/* rail + nodes */}
      <View className="mb-3">
        <View className="h-[6px] rounded-full bg-[#E5E7EB] overflow-hidden">
          <View
            className="h-full bg-[#F59E0B]"
            style={{ width: `${progressPct}%` }}
          />
        </View>

        <View className="mt-[-9px] flex-row justify-between">
          {Array.from({ length: t }).map((_, i) => {
            const idx = i + 1;
            const isCurrent = idx === c;
            const isPast = idx < c;
            const fill = isCurrent || isPast ? "#F59E0B" : "#D1D5DB";
            const glow = isCurrent ? 0.3 : 0;

            return (
              <View
                key={idx}
                style={{
                  shadowColor: "#F59E0B",
                  shadowOpacity: glow,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: isCurrent ? 3 : 0,
                }}
              >
                <View
                  className="h-[18px] w-[18px] rounded-full border"
                  style={{ backgroundColor: fill, borderColor: fill }}
                />
              </View>
            );
          })}
        </View>
      </View>

      {/* step line */}
      <View className="mt-1 flex-row items-center">
        <View className="h-7 w-7 rounded-full bg-[#D1FAE5] items-center justify-center mr-2">
          <Ionicons name="checkmark" size={16} color="#22C55E" />
        </View>
        <Text className="text-[16px] leading-[20px] text-[#374151]">
          Step 3: submit application
        </Text>
      </View>
    </Pressable>
  );
}
