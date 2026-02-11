import { Theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';

type Props = {
  percent: number; // 0..1  e.g., 0.4
  ctaLabel: string; // e.g., "Education Information"
  onPress?: () => void;
};

export default function FinishProfileCard({
  percent = 0.4,
  ctaLabel,
  onPress,
}: Props) {
  const pct = Math.max(0, Math.min(1, percent)) * 100;

  return (
    <View
      style={{
        backgroundColor: Theme.colors.lightPurple,
        borderRadius: Theme.radius.card,
        padding: 20,
      }}
    >
      {/* Text block */}
      <Text style={[Theme.typography.h3, { color: Theme.colors.black }]}>
        Your profile is{' '}
        <Text className="font-montserrat-bold text-[18px] text-[#FF890C] ml-1">
          {Math.round(pct)}%
        </Text>{' '}
        complete!
      </Text>
      <Text
        style={[
          Theme.typography.body,
          { color: Theme.colors.black, marginTop: 3 },
        ]}
      >
        Fill out the next step now.
      </Text>

      {/* Progress bar */}
      <View
        style={{
          marginTop: 24,
          height: 14,
          backgroundColor: Theme.colors.white,
          borderRadius: 100,
          overflow: 'hidden',
        }}
      >
        {/* gradient fill */}
        <View
          style={{
            width: `${pct}%`,
            height: '100%',
          }}
          className="rounded-full"
        >
          <LinearGradient
            colors={[Theme.colors.lightOrange, Theme.colors.purpleStroke]} // orange → lavender
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ flex: 1 }}
          />
        </View>

        {/* white thumb */}
        {/*<View
          style={{
            position: 'absolute',
            left: `${pct}%`,
            top: '50%',
            marginLeft: -11,
            marginTop: -11,
          }}
          className="h-[22px] w-[22px] rounded-full bg-white"
        />*/}
      </View>

      {/* CTA */}
      <View
        style={{
          marginTop: 24,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 16,
        }}
      >
        <Text
          style={[Theme.typography.subhead1, { color: Theme.colors.purple }]}
        >
          {ctaLabel}
        </Text>

        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          style={{
            width: 30,
            height: 30,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Theme.colors.purple,
            borderRadius: 50,
          }}
        >
          <Ionicons
            name="arrow-forward-outline"
            size={22}
            color={Theme.colors.white}
          />
        </Pressable>
      </View>
    </View>
  );
}
