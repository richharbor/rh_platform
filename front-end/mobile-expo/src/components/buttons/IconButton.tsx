import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

interface IconButtonProps {
  icon: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-9 w-9',
  md: 'h-12 w-12',
  lg: 'h-14 w-14'
};

export function IconButton({
  icon,
  onPress,
  disabled,
  size = 'md'
}: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={[
        'items-center justify-center rounded-2xl bg-ink-900/5',
        sizeClasses[size],
        disabled ? 'opacity-60' : 'active:opacity-90'
      ].join(' ')}
    >
      <View>{icon}</View>
    </Pressable>
  );
}
