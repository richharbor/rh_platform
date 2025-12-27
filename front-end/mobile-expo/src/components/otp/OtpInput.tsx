import { useEffect, useRef } from 'react';
import { TextInput, View } from 'react-native';

interface OtpInputProps {
  length?: number;
  value: string[];
  onChange: (value: string[]) => void;
}

export function OtpInput({ length = 6, value, onChange }: OtpInputProps) {
  const inputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (value.length === 0) {
      onChange(Array.from({ length }, () => ''));
    }
  }, [length, onChange, value.length]);

  const handleChange = (text: string, index: number) => {
    const next = [...value];
    next[index] = text.replace(/[^0-9]/g, '').slice(-1);
    onChange(next);

    if (text && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View className="flex-row items-center justify-between">
      {Array.from({ length }).map((_, index) => (
        <TextInput
          key={`otp-${index}`}
          ref={(ref) => {
            inputs.current[index] = ref;
          }}
          value={value[index] ?? ''}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={({ nativeEvent }) =>
            handleKeyPress(nativeEvent.key, index)
          }
          keyboardType="number-pad"
          maxLength={1}
          className="h-14 w-12 rounded-2xl border border-ink-200 bg-white text-center text-lg font-semibold text-ink-900"
        />
      ))}
    </View>
  );
}
