import type { ReactNode } from 'react';
import { View } from 'react-native';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'soft';
}

const variantClasses = {
  default: 'bg-white shadow-card',
  soft: 'bg-ink-50 shadow-soft'
};

export function Card({ children, variant = 'default' }: CardProps) {
  return (
    <View className={`rounded-2xl p-5 ${variantClasses[variant]}`}>{children}</View>
  );
}
