import { View } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
}

export function Skeleton({ width = '100%', height = 16 }: SkeletonProps) {
  return (
    <View
      className="overflow-hidden rounded-xl bg-ink-100"
      style={{ width, height }}
    />
  );
}
