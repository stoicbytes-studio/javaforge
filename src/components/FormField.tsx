import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';
import { Text } from './Text';

/** Labelled text input bound to react-hook-form, with inline validation errors. */
export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  hint,
  onSubmitEditing,
  ...input
}: {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  hint?: string;
} & Pick<TextInputProps, 'secureTextEntry' | 'autoComplete' | 'keyboardType' | 'autoCapitalize' | 'placeholder' | 'onSubmitEditing' | 'returnKeyType'>) {
  const { colors } = useTheme();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
        <View style={{ gap: spacing.xs }}>
          <Text variant="small" weight="600">
            {label}
          </Text>
          <TextInput
            value={(value as string | undefined) ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            autoCorrect={false}
            autoCapitalize="none"
            placeholderTextColor={colors.textSubtle}
            accessibilityLabel={label}
            accessibilityHint={hint}
            onSubmitEditing={onSubmitEditing}
            {...input}
            style={[
              styles.input,
              { color: colors.text, borderColor: error ? colors.danger : colors.border, backgroundColor: colors.surfaceAlt },
            ]}
          />
          {error ? (
            <Text variant="small" color="danger" accessibilityLiveRegion="polite">
              {error.message}
            </Text>
          ) : hint ? (
            <Text variant="small" color="textSubtle">
              {hint}
            </Text>
          ) : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, minHeight: 44, fontSize: 15 },
});
