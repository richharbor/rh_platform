import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

interface SecondaryButtonProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
  style?: any;
}

export function SecondaryButton({
  label,
  onPress,
  disabled,
  icon,
  fullWidth,
  style
}: SecondaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={[
        'rounded-2xl border border-ink-200 bg-white px-6 py-4',
        disabled ? 'opacity-60' : 'active:opacity-90',
        fullWidth ? 'w-full' : 'self-start'
      ].join(' ')}
      style={style}
    >
      <View className="flex-row items-center justify-center">
        {icon ? <View className="mr-3">{icon}</View> : null}
        <Text className="text-base font-semibold text-ink-700">{label}</Text>
      </View>
    </Pressable>
  );
}
