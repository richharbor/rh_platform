import { ActivityIndicator, View } from 'react-native';

interface LoaderProps {
  size?: 'small' | 'large';
}

export function Loader({ size = 'large' }: LoaderProps) {
  return (
    <View className="items-center justify-center">
      <ActivityIndicator size={size} color="#5b46ff" />
    </View>
  );
}
