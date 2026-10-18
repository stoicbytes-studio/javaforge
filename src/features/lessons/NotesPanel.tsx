import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, TextInput, View } from 'react-native';
import { z } from 'zod';

import { Button } from '@/components/Button';
import { Card, LinkCard } from '@/components/Card';
import { SectionHeader } from '@/components/Screen';
import { Text } from '@/components/Text';
import { getLesson } from '@/content';
import { useLearningStore } from '@/store/learningStore';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, spacing } from '@/theme/tokens';
import type { Lesson } from '@/types/curriculum';

export const NOTE_MAX_LENGTH = 5000;
const noteSchema = z.object({ text: z.string().max(NOTE_MAX_LENGTH, `Notes are limited to ${NOTE_MAX_LENGTH} characters.`) });
type NoteForm = z.infer<typeof noteSchema>;

export function NotesPanel({ lesson }: { lesson: Lesson }) {
  const { colors } = useTheme();
  const note = useLearningStore((s) => s.notes[lesson.id]);
  const saveNote = useLearningStore((s) => s.saveNote);
  const [savedAt, setSavedAt] = useState<number | undefined>(note?.updatedAt);
  const { control, handleSubmit, formState, reset } = useForm<NoteForm>({
    resolver: zodResolver(noteSchema),
    defaultValues: { text: note?.text ?? '' },
  });

  useEffect(() => {
    reset({ text: note?.text ?? '' });
    // Only when switching lessons; typing must not be overwritten.
  }, [lesson.id]);

  const onSave = handleSubmit(({ text }) => {
    saveNote(lesson.id, text);
    setSavedAt(Date.now());
    reset({ text });
  });

  return (
    <View style={{ gap: spacing.lg }}>
      <Card style={{ gap: spacing.sm }}>
        <SectionHeader title="Personal notes" icon="edit" />
        <Controller
          control={control}
          name="text"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              placeholder="Write the explanation you would give a colleague…"
              placeholderTextColor={colors.textSubtle}
              accessibilityLabel={`Notes for ${lesson.title}`}
              style={[styles.input, { color: colors.text, borderColor: formState.errors.text ? colors.danger : colors.border, backgroundColor: colors.surfaceAlt, fontFamily: fonts.sans }]}
              textAlignVertical="top"
            />
          )}
        />
        {formState.errors.text ? (
          <Text variant="small" color="danger">
            {formState.errors.text.message}
          </Text>
        ) : null}
        <View style={styles.rowBetween}>
          <Text variant="small" color="textSubtle">
            {formState.isDirty ? 'Unsaved changes' : savedAt ? `Saved ${new Date(savedAt).toLocaleString()}` : 'Stored on this device'}
          </Text>
          <Button label="Save notes" size="sm" icon="check" onPress={() => onSave()} disabled={!formState.isDirty} />
        </View>
      </Card>

      <Card style={{ gap: spacing.sm }}>
        <SectionHeader title="Revision prompts" icon="refresh" />
        <Text variant="small" color="textMuted">
          These become spaced-repetition cards once you complete the lesson. Answers are hidden until review.
        </Text>
        {lesson.revision.map((r) => (
          <Text key={r.id} variant="small">
            • {r.question}
          </Text>
        ))}
      </Card>

      {lesson.relatedLessonIds.length > 0 ? (
        <View style={{ gap: spacing.sm }}>
          <SectionHeader title="Related concepts" icon="layers" />
          {lesson.relatedLessonIds.map((id) => {
            const related = getLesson(id);
            if (!related) {
              return (
                <Text key={id} variant="small" color="textSubtle">
                  • {id.replace(/^[a-z]+-/, '').replace(/-/g, ' ')} (planned)
                </Text>
              );
            }
            return (
              <LinkCard key={id} href={`/learn/${related.moduleId}/${related.id}`}>
                <Text weight="600">{related.title}</Text>
                <Text variant="small" color="textMuted">
                  {related.summary}
                </Text>
              </LinkCard>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: { minHeight: 140, borderWidth: 1, borderRadius: radius.md, padding: spacing.md, fontSize: 15, lineHeight: 22 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
});
