import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState, type ComponentRef } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Badge, LinkCard } from '@/components/Card';
import { Icon, type IconName } from '@/components/Icon';
import { PageHeader, Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';
import { buildIndex, KIND_LABEL, search, SUGGESTED_SEARCHES, type SearchKind, type SearchResult } from './searchIndex';

type Filter = 'all' | 'learn' | 'practice' | 'interview' | 'versions';

const FILTERS: { value: Filter; label: string; kinds?: SearchKind[] }[] = [
  { value: 'all', label: 'All' },
  { value: 'learn', label: 'Lessons & topics', kinds: ['lesson', 'topic', 'module'] },
  { value: 'practice', label: 'Practice', kinds: ['challenge', 'bug-hunt', 'incident', 'project', 'jvm'] },
  { value: 'interview', label: 'Interview', kinds: ['interview'] },
  { value: 'versions', label: 'Java versions', kinds: ['java-feature'] },
];

const KIND_ICON: Record<SearchKind, IconName> = {
  lesson: 'book',
  topic: 'layers',
  module: 'grid',
  challenge: 'code',
  interview: 'message',
  'bug-hunt': 'bug',
  incident: 'activity',
  project: 'folder',
  jvm: 'cpu',
  'java-feature': 'clock',
};

/** Global search across lessons, "types of X" topics, practice, interview questions and Java versions. */
export function SearchScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(typeof params.q === 'string' ? params.q : '');
  const [debounced, setDebounced] = useState(query);
  const [filter, setFilter] = useState<Filter>('all');
  const input = useRef<ComponentRef<typeof TextInput>>(null);
  const total = useMemo(() => buildIndex().length, []);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 120);
    return () => clearTimeout(t);
  }, [query]);

  // Keep the query in the URL so a search can be shared or revisited.
  useEffect(() => {
    if (Platform.OS === 'web') router.setParams({ q: debounced || undefined });
  }, [debounced]);

  useEffect(() => {
    const t = setTimeout(() => input.current?.focus(), 50);
    return () => clearTimeout(t);
  }, []);

  const kinds = FILTERS.find((f) => f.value === filter)?.kinds;
  const results = useMemo(() => search(debounced, { kinds, limit: 60 }), [debounced, kinds]);
  const counts = useMemo(() => {
    const all = search(debounced, { limit: 1000 });
    return Object.fromEntries(FILTERS.map((f) => [f.value, f.kinds ? all.filter((r) => f.kinds!.includes(r.doc.kind)).length : all.length])) as Record<Filter, number>;
  }, [debounced]);

  return (
    <Screen maxWidth={880}>
      <PageHeader eyebrow="Search" title="Search everything" subtitle={`Lessons, every "types of" topic, challenges, interview questions and Java features — ${total} entries.`} />
      <View style={[styles.box, { borderColor: colors.brandStrong, backgroundColor: colors.surface }]}>
        <Icon name="search" size={20} color={colors.textMuted} />
        <TextInput
          ref={input}
          value={query}
          onChangeText={setQuery}
          placeholder="Try “types of inheritance”, “HashMap”, “virtual threads”…"
          placeholderTextColor={colors.textSubtle}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Search JavaForge"
          // The whole box shows focus (yellow border), so hide the browser's inner outline.
          style={[styles.input, { color: colors.text }, Platform.OS === 'web' && ({ outlineStyle: 'none' } as object)]}
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={8}>
            <Icon name="x" size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {debounced.trim() ? (
        <View style={{ gap: spacing.md }}>
          <View style={styles.filters} accessibilityRole="tablist">
            {FILTERS.map((f) => {
              const selected = f.value === filter;
              return (
                <Pressable
                  key={f.value}
                  onPress={() => setFilter(f.value)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected }}
                  style={[styles.chip, { borderColor: selected ? colors.brandStrong : colors.border, backgroundColor: selected ? colors.brandMuted : colors.surface }]}
                >
                  <Text variant="small" weight={selected ? '700' : '500'} color={selected ? 'text' : 'textMuted'}>
                    {`${f.label} · ${counts[f.value]}`}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text variant="small" color="textMuted" accessibilityLiveRegion="polite">
            {results.length === 0 ? `No results for “${debounced.trim()}”.` : `${results.length}${results.length === 60 ? '+' : ''} result${results.length === 1 ? '' : 's'}`}
          </Text>
          {results.length === 0 ? (
            <Text color="textMuted">Check the spelling, try fewer words, or try a related term (for example “map” instead of “dictionary”).</Text>
          ) : (
            results.map((r) => <ResultRow key={r.doc.id} result={r} query={debounced} />)
          )}
        </View>
      ) : (
        <View style={{ gap: spacing.md }}>
          <Text variant="heading">Popular searches</Text>
          <View style={styles.filters}>
            {SUGGESTED_SEARCHES.map((s) => (
              <Pressable
                key={s}
                onPress={() => setQuery(s)}
                accessibilityRole="button"
                accessibilityLabel={`Search for ${s}`}
                style={[styles.chip, { borderColor: colors.border, backgroundColor: colors.surface }]}
              >
                <Text variant="small">{s}</Text>
              </Pressable>
            ))}
          </View>
          {Platform.OS === 'web' ? (
            <Text variant="small" color="textSubtle">
              Tip: press Ctrl+K (or ⌘K) or / anywhere to open search.
            </Text>
          ) : null}
        </View>
      )}
    </Screen>
  );
}

/** Splits text so that query words can be emphasised. */
function highlight(text: string, query: string) {
  const words = query
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 1)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!words.length) return [{ text, hit: false }];
  // Splitting on a capture group puts every match at an odd index.
  return text
    .split(new RegExp(`(${words.join('|')})`, 'i'))
    .map((part, i) => ({ text: part, hit: i % 2 === 1 }))
    .filter((p) => p.text.length > 0);
}

function ResultRow({ result, query }: { result: SearchResult; query: string }) {
  const { colors } = useTheme();
  const { doc, snippet } = result;
  return (
    <LinkCard href={doc.href as never} accessibilityLabel={`${KIND_LABEL[doc.kind]}: ${doc.title}. ${doc.context}`}>
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: doc.kind === 'lesson' || doc.kind === 'topic' ? colors.brandMuted : colors.surfaceAlt }]}>
          <Icon name={KIND_ICON[doc.kind]} size={18} color={doc.kind === 'lesson' || doc.kind === 'topic' ? colors.onBrandMuted : colors.textMuted} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <View style={[styles.row, { gap: spacing.sm, flexWrap: 'wrap' }]}>
            <Badge label={KIND_LABEL[doc.kind]} tone={doc.kind === 'lesson' ? 'primary' : doc.kind === 'topic' ? 'accent' : 'neutral'} />
            <Text variant="small" color="textSubtle" style={{ flexShrink: 1 }} numberOfLines={1}>
              {doc.context}
            </Text>
          </View>
          <Text variant="heading">
            {highlight(doc.title, query).map((p, i) => (
              <Text key={i} variant="heading" style={p.hit ? { backgroundColor: colors.brandMuted } : undefined}>
                {p.text}
              </Text>
            ))}
          </Text>
          {snippet ? (
            <Text variant="small" color="textMuted" numberOfLines={2}>
              {snippet}
            </Text>
          ) : null}
        </View>
        <Icon name="chevronRight" size={18} color={colors.textSubtle} />
      </View>
    </LinkCard>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 1.5, borderRadius: radius.lg, paddingHorizontal: spacing.lg },
  input: { flex: 1, minHeight: 54, fontSize: 17 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: { width: 38, height: 38, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});
