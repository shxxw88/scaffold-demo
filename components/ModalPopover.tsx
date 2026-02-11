import { Theme, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

type Action = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary'; // optional CTA row (if you ever need it)
};

type Props = {
  visible: boolean;
  onClose: () => void;

  // Title row
  title?: string; // e.g. "09/01 – 09/14"
  titleIconName?: string; // e.g. "calendar-outline"
  titleIconBg?: string; // e.g. "#F59E0B"
  titleIconColor?: string; // e.g. "#FFFFFF"

  // Body
  lines?: string[]; // each line becomes its own <Text>
  children?: React.ReactNode; // or pass custom JSX

  // Optional CTAs
  actions?: Action[];
};

export default function ModalPopover({
  visible,
  onClose,
  title,
  titleIconName = 'calendar-outline',
  titleIconBg = '#F59E0B',
  titleIconColor = '#FFFFFF',
  lines,
  children,
  actions = [],
}: Props) {
  const cardShadow = {
    shadowColor: Theme.colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          // Semi-transparent black backdrop (only the background is faded)
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 20,
        }}
      >
        {/* Stop touches from bubbling to the backdrop */}
        <Pressable
          onPress={() => {}}
          style={{
            ...cardShadow,
            width: '100%',
            maxWidth: 295,
            borderRadius: Theme.radius.card,
            backgroundColor: Theme.colors.white,
            paddingVertical: 29,
            paddingHorizontal: 29,
          }}
        >
          {/* Title row */}
          {!!title && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <View
                style={{
                  width: 25,
                  height: 25,
                  borderRadius: 50,
                  backgroundColor: titleIconBg,
                  marginRight: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons
                  name={titleIconName as any}
                  size={14}
                  color={titleIconColor}
                />
              </View>
              <Text
                style={{
                  ...Typography.subhead1,
                  color: Theme.colors.black,
                }}
              >
                {title}
              </Text>
            </View>
          )}

          {/* Body */}
          {children ? (
            children
          ) : (
            <View style={{ marginTop: 10 }}>
              {(lines ?? []).map((line, i) => (
                <Text
                  key={i}
                  style={{
                    ...Typography.body,
                    color: Theme.colors.black,
                    marginBottom: 8,
                  }}
                >
                  {line}
                </Text>
              ))}
            </View>
          )}

          {/* Optional actions row */}
          {actions.length > 0 && (
            <View
              style={{
                marginTop: 12,
                flexDirection: 'row',
                justifyContent: 'flex-end',
                gap: 5,
              }}
            >
              {actions.map(({ label, onPress, variant = 'secondary' }) => (
                <Pressable
                  key={label}
                  onPress={onPress}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 10,
                    backgroundColor:
                      variant === 'primary'
                        ? Theme.colors.purple
                        : Theme.colors.grey,
                  }}
                >
                  <Text
                    style={{
                      ...Typography.subhead2,
                      color:
                        variant === 'primary'
                          ? Theme.colors.white
                          : Theme.colors.black,
                      fontFamily: Theme.fonts.semibold,
                    }}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
