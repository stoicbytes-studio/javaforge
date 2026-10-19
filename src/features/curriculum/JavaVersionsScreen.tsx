import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BackLink } from '@/components/BackLink';
import { Button } from '@/components/Button';
import { Badge, Card, PressableLink } from '@/components/Card';
import { CodeBlock } from '@/components/CodeBlock';
import { Icon } from '@/components/Icon';
import { Inline } from '@/components/Markdown';
import { PageHeader, Screen, SectionHeader } from '@/components/Screen';
import { SegmentedTabs } from '@/components/SegmentedTabs';
import { Text } from '@/components/Text';
import { getLesson } from '@/content';
import {
  JAVA_FEATURES,
  JAVA_RELEASES,
  PROBED_JDKS,
  UPGRADE_PATHS,
  type FeatureCategory,
  type JavaFeature,
} from '@/content/versions/javaReleases';
import { PROBE_GENERATED_AT, PROBE_RESULTS } from '@/content/versions/probes.generated';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

type View_ = 'timeline' | 'upgrade';
type CategoryFilter = 'all' | FeatureCategory;

const LATEST = Math.max(...JAVA_RELEASES.map((r) => r.version));
const LATEST_LTS = Math.max(...JAVA_RELEASES.filter((r) => r.lts).map((r) => r.version));

const STATUS_TONE = { final: 'success', preview: 'warning', incubator: 'warning', removed: 'danger', deprecated: 'danger' } as const;

/** "compiles on JDK 21–27", or the preview range, from the probe results. */
export function probeSummary(feature: JavaFeature): string | undefined {
  const r = PROBE_RESULTS[feature.id];
  if (!r) return undefined;
  const range = (status: string) => {
    const vs = PROBED_JDKS.filter((v) => r[v] === status);
    if (vs.length === 0) return undefined;
    return vs.length === 1 ? `JDK ${vs[0]}` : `JDK ${vs[0]}–${vs[vs.length - 1]}`;
  };
  const final = range('final');
  const preview = range('preview');
  if (feature.status === 'removed') return final ? `compiles up to ${final.replace(/.*–/, 'JDK ')}; fails from JDK ${feature.release}` : undefined;
  return [final && `compiles on ${final}`, preview && `preview on ${preview}`].filter(Boolean).join(' · ');
}

export function JavaVersionsScreen() {
  const [view, setView] = useState<View_>('timeline');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [ltsOnly, setLtsOnly] = useState(false);
  const releases = useMemo(
    () => [...JAVA_RELEASES].filter((r) => !ltsOnly || r.lts).sort((a, b) => b.version - a.version),
    [ltsOnly],
  );

  return (
    <Screen maxWidth={980}>
      <BackLink href="/learn" label="Curriculum" />
      <PageHeader
        eyebrow="Java version updates"
        title={`Java 8 → Java ${LATEST}`}
        subtitle={`What changed in every release, which features are final or still in preview, and how to upgrade between LTS versions. Latest release: Java ${LATEST}. Latest LTS: Java ${LATEST_LTS}.`}
      />
      <Card tone="outline" style={styles.note}>
        <Icon name="check" size={16} />
        <Text variant="small" color="textMuted" style={{ flex: 1 }}>
          Code-level claims are verified by compiling a probe program for each feature on JDK {PROBED_JDKS.join(', ')} (last run {PROBE_GENERATED_AT}). Features without a probe (JVM, tooling) are summarised from the official release notes.
        </Text>
      </Card>

      <SegmentedTabs
        label="Java versions view"
        value={view}
        onChange={setView}
        options={[
          { value: 'timeline', label: 'Release timeline' },
          { value: 'upgrade', label: 'LTS upgrade paths' },
        ]}
      />

      {view === 'timeline' ? (
        <>
          <View style={[styles.row, { flexWrap: 'wrap' }]}>
            <SegmentedTabs<CategoryFilter>
              label="Feature category"
              value={category}
              onChange={setCategory}
              options={[
                { value: 'all', label: 'All' },
                { value: 'language', label: 'Language' },
                { value: 'api', label: 'APIs' },
                { value: 'jvm', label: 'JVM' },
                { value: 'tooling', label: 'Tools' },
                { value: 'security', label: 'Security' },
                { value: 'removal', label: 'Removals' },
              ]}
            />
            <Button
              label={ltsOnly ? 'Showing LTS only' : 'Show LTS only'}
              size="sm"
              variant={ltsOnly ? 'primary' : 'secondary'}
              accessibilityRole="switch"
              accessibilityState={{ checked: ltsOnly }}
              onPress={() => setLtsOnly((v) => !v)}
            />
          </View>
          {releases.map((release) => {
            const features = JAVA_FEATURES.filter((f) => f.release === release.version && (category === 'all' || f.category === category));
            return <ReleaseCard key={release.version} version={release.version} ga={release.ga} lts={release.lts} headline={release.headline} features={features} />;
          })}
        </>
      ) : (
        <View style={{ gap: spacing.md }}>
          <Text color="textMuted">Most teams move from LTS to LTS. Each step below lists what typically breaks and what is worth adopting.</Text>
          {UPGRADE_PATHS.map((p) => (
            <Card key={`${p.from}-${p.to}`} style={{ gap: spacing.sm }}>
              <SectionHeader title={`Java ${p.from} → Java ${p.to}`} icon="layers" />
              {p.checklist.map((item) => (
                <View key={item} style={styles.row}>
                  <Icon name="check" size={15} />
                  <View style={{ flex: 1 }}>
                    <Inline text={item} variant="small" />
                  </View>
                </View>
              ))}
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}

function ReleaseCard({
  version,
  ga,
  lts,
  headline,
  features,
}: {
  version: number;
  ga: string;
  lts: boolean;
  headline: string;
  features: JavaFeature[];
}) {
  const { colors } = useTheme();
  return (
    <Card style={[{ gap: spacing.md }, lts && { borderColor: colors.accent }]}>
      <View style={[styles.row, { flexWrap: 'wrap' }]}>
        <Text variant="title">Java {version}</Text>
        {lts ? <Badge label="LTS" tone="accent" /> : null}
        {version === LATEST ? <Badge label="Latest" tone="primary" /> : null}
        <Text variant="small" color="textSubtle">
          GA {ga}
        </Text>
      </View>
      <Text color="textMuted">{headline}</Text>
      {features.length === 0 ? (
        <Text variant="small" color="textSubtle">
          No features in this category for this release.
        </Text>
      ) : (
        features.map((f) => <FeatureRow key={f.id} feature={f} />)
      )}
    </Card>
  );
}

function FeatureRow({ feature: f }: { feature: JavaFeature }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const evidence = probeSummary(f);
  return (
    <View style={[styles.feature, { borderLeftColor: colors[STATUS_TONE[f.status]] }]}>
      <View style={[styles.row, { flexWrap: 'wrap' }]}>
        <Text weight="600" style={{ flexShrink: 1 }}>
          {f.title}
        </Text>
        <Badge label={f.status} tone={STATUS_TONE[f.status]} />
        <Badge label={f.category} />
        {f.jep ? <Badge label={`JEP ${f.jep}`} /> : null}
      </View>
      <Inline text={f.summary} variant="small" color="textMuted" />
      {f.previewedIn?.length ? (
        <Text variant="small" color="textSubtle">
          Previewed or incubated in Java {f.previewedIn.join(', ')}
        </Text>
      ) : null}
      {evidence ? (
        <View style={styles.row}>
          <Icon name="terminal" size={13} color={colors.success} />
          <Text variant="small" color="success">
            Verified: {evidence}
          </Text>
        </View>
      ) : null}
      {f.example || f.probe ? (
        open ? (
          <CodeBlock code={f.example ?? f.probe!.code} title={f.example ? 'Example' : 'Probe program'} />
        ) : (
          <Button label="Show code" size="sm" variant="ghost" icon="code" onPress={() => setOpen(true)} accessibilityLabel={`Show code for ${f.title}`} style={{ alignSelf: 'flex-start' }} />
        )
      ) : null}
      {(f.lessonIds ?? []).map((id) => {
        const lesson = getLesson(id);
        return lesson ? (
          <PressableLink key={id} href={`/learn/${lesson.moduleId}/${lesson.id}`}>
            <Text variant="small" color="primary">
              Lesson: {lesson.title} →
            </Text>
          </PressableLink>
        ) : null;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  note: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  feature: { borderLeftWidth: 3, paddingLeft: spacing.md, gap: 4, borderRadius: radius.sm },
});
