import { Theme } from '@/constants/theme';
import { Image, ImageSourcePropType, Text, View } from 'react-native';
import MoneyIcon from './icons/MoneyIcon';

export default function EligibilityBanner({
  count,
  grants,
  total,
  icons,
}: {
  count: number;
  grants: string[];
  total: number;
  icons?: ImageSourcePropType[];
}) {
  return (
    <View
      style={{
        borderRadius: Theme.radius.card,
        backgroundColor: Theme.colors.lightPurple,
        paddingHorizontal: 14,
        paddingVertical: 20,
        marginTop: Theme.spacing.lg,
      }}
    >
      <Text
        style={[
          Theme.typography.h3,
          { color: Theme.colors.black, marginBottom: 22 },
        ]}
      >
        You’re eligible for{' '}
       <Text className="font-montserrat-bold text-[18px] text-[#FF890C] ml-1">
          {count} Grants
        </Text>
      </Text>

      <View style={{ marginBottom: 22, gap: 10 }}>
        {grants.map((g, index) => (
          <View
            key={g}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Image
              source={
                icons && icons[index]
                  ? icons[index]
                  : require('../assets/images/workBC.png')
              }
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                marginRight: 15,
              }}
              resizeMode="cover"
            />
            <Text
              style={[
                {
                  color: Theme.colors.black,
                  flex: 1,
                  fontFamily: Theme.fonts.medium,
                  fontSize: 15,
                  lineHeight: 20,
                },
              ]}
              numberOfLines={1}
            >
              {g}
            </Text>
          </View>
        ))}
      </View>

      <View
        style={{
          paddingTop: 20,
          paddingBottom: 0,
          borderTopWidth: 3,
          borderTopColor: Theme.colors.lightGrey,
          borderStyle: 'solid',
        }}
      >
        <View className="flex-row items-center justify-end">
          <MoneyIcon size={24} />
          <Text className="ml-2 text-[15px] font-montserrat-semibold text-[#27252F] flex justify-end items-center">
            Total up to{' '}
            <Text className="font-montserrat-bold text-[26px] text-[#FF890C] ml-1">
              ${total.toLocaleString()}
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
}
