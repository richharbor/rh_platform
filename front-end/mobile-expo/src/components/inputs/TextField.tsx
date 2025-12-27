import { Text, TextInput, type TextInputProps, View } from 'react-native';

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
}

export function TextField({
  label,
  error,
  helper,
  className,
  ...props
}: TextFieldProps) {
  const helperText = error ?? helper;

  return (
    <View className="w-full">
      {label ? (
        <Text className="mb-2 text-sm font-medium text-ink-700">{label}</Text>
      ) : null}
      <TextInput
        placeholderTextColor="#8a8a9c"
        className={[
          'rounded-2xl border px-4 py-4 text-base text-ink-900',
          error ? 'border-danger-500' : 'border-ink-200'
        ].join(' ')}
        {...props}
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
