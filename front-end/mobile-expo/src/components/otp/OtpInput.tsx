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
    <View className="flex-row items-center justify-between w-full gap-2">
      {Array.from({ length }).map((_, index) => {
        const isActive = value.length === index;
        const isFilled = !!value[index];

        return (
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
            cursorColor="#5b46ff" // Brand color
            selectionColor="#FDF4FF"
            className={`h-16 flex-1 rounded-2xl border bg-white text-center text-2xl font-bold ${isActive || isFilled
              ? 'border-brand-500 text-brand-950 bg-brand-50/10'
              : 'border-ink-200 text-ink-900'
              }`}
            style={{
              // iOS shadow
              shadowColor: isActive ? '#D946EF' : '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isActive ? 0.2 : 0.05,
              shadowRadius: 4,
              elevation: isActive ? 4 : 1, // Android shadow
            }}
          />
        );
      })}
    </View>
  );
}
