import { Text, TextInput, View } from 'react-native';

interface TextFieldProps {
  label?: string;
  value?: string;
  placeholder?: string;
  onChangeText?: (text: string) => void;
  error?: string;
  helper?: string;
  secureTextEntry?: boolean;
}

export function TextField({
  label,
  value,
  placeholder,
  onChangeText,
  error,
  helper,
  secureTextEntry
}: TextFieldProps) {
  const helperText = error ?? helper;

  return (
    <View className="w-full">
      {label ? (
        <Text className="mb-2 text-sm font-medium text-ink-700">{label}</Text>
      ) : null}
      <TextInput
        value={value}
        placeholder={placeholder}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        placeholderTextColor="#8a8a9c"
        className={[
          'rounded-2xl border px-4 py-4 text-base text-ink-900',
          error ? 'border-danger-500' : 'border-ink-200'
        ].join(' ')}
      />
      {helperText ? (
        <Text
          className={[
            'mt-2 text-xs',
            error ? 'text-danger-500' : 'text-ink-500'
          ].join(' ')}
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}
