import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { BackLink } from '@/components/BackLink';
import { Badge, Card, LinkCard } from '@/components/Card';
import { Collapsible } from '@/components/Collapsible';
import { Icon } from '@/components/Icon';
import { Inline } from '@/components/Markdown';
import { ProgressBar } from '@/components/Progress';
import { EmptyState, PageHeader, Screen, SectionHeader } from '@/components/Screen';
import { Text } from '@/components/Text';
import { getModule, getProject, PROJECTS } from '@/content';
import { milestoneKey, useLearningStore } from '@/store/learningStore';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';
import type { Project } from '@/types/practice';

function useMilestoneProgress(project: Project) {
  const milestones = useLearningStore((s) => s.milestones);
  const done = project.milestones.filter((m) => milestones[milestoneKey(project.id, m.id)]).length;
  return { done, total: project.milestones.length };
}

export function ProjectsScreen() {
  return (
    <Screen>
      <PageHeader
        eyebrow="Projects"
        title="Build real applications"
        subtitle="Each project has requirements, milestones with acceptance criteria, edge cases, tests to write and design trade-offs. Build them in your own IDE."
      />
      {PROJECTS.length === 0 ? <EmptyState title="No projects yet" body="Projects are being prepared." /> : null}
      {PROJECTS.map((p) => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </Screen>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const { done, total } = useMilestoneProgress(project);
  return (
    <LinkCard href={`/projects/${project.id}`} accessibilityLabel={`${project.title}, ${done} of ${total} milestones`}>
      <View style={{ gap: spacing.sm }}>
        <View style={styles.rowBetween}>
          <Text variant="heading" style={{ flex: 1 }}>
            {project.title}
          </Text>
          <Badge label={project.difficulty} tone={project.difficulty === 'advanced' ? 'accent' : 'primary'} />
        </View>
        <Text variant="small" color="textMuted">
          {project.summary}
        </Text>
        <View style={[styles.row, { flexWrap: 'wrap' }]}>
          {project.skills.map((s) => (
            <Badge key={s} label={s} />
          ))}
        </View>
        <ProgressBar value={total ? done / total : 0} label="Milestones" height={5} />
        <Text variant="small" color="textSubtle">
          {done}/{total} milestones checked off
        </Text>
      </View>
    </LinkCard>
  );
}

export function ProjectScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const project = getProject(projectId ?? '');
  const { colors } = useTheme();
  const milestones = useLearningStore((s) => s.milestones);
  const toggle = useLearningStore((s) => s.toggleMilestone);

  if (!project) {
    return (
      <Screen>
        <BackLink href="/projects" label="Projects" />
        <EmptyState icon="alert" title="Project not found" body="This project does not exist." />
      </Screen>
    );
  }
  const done = project.milestones.filter((m) => milestones[milestoneKey(project.id, m.id)]).length;

  return (
    <Screen maxWidth={900}>
      <BackLink href="/projects" label="Projects" />
      <PageHeader eyebrow={`Project · ${project.difficulty}`} title={project.title} subtitle={project.summary} />
      <View style={[styles.row, { flexWrap: 'wrap' }]}>
        <Text variant="small" color="textMuted">
          Uses:
        </Text>
        {project.moduleIds.map((id) => (
          <Badge key={id} label={getModule(id)?.shortTitle ?? id} tone="primary" />
        ))}
      </View>

      <Card style={{ gap: spacing.xs }}>
        <SectionHeader title="Requirements" icon="target" />
        {project.requirements.map((r) => (
          <Inline key={r} text={`• ${r}`} variant="small" />
        ))}
      </Card>

      <View style={{ gap: spacing.sm }}>
        <SectionHeader title={`Milestones · ${done}/${project.milestones.length}`} icon="check" />
        <Text variant="small" color="textMuted" style={{ marginTop: -spacing.sm }}>
          Check a milestone off when its acceptance criteria pass in your own build. Milestones are self-reported, so they track your plan but do not award XP or mastery.
        </Text>
        {project.milestones.map((m, i) => {
          const checked = !!milestones[milestoneKey(project.id, m.id)];
          return (
            <Card key={m.id} style={{ gap: spacing.sm, borderColor: checked ? colors.success : colors.border }}>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked }}
                accessibilityLabel={`Milestone ${i + 1}: ${m.title}`}
                onPress={() => toggle(project.id, m.id)}
                style={(s) => {
                  const { focused } = s as { pressed: boolean; focused?: boolean };
                  return [styles.row, focused && { outlineColor: colors.focus, outlineWidth: 2, outlineStyle: 'solid' }] as StyleProp<ViewStyle>;
                }}
              >
                <View style={[styles.box, { borderColor: checked ? colors.success : colors.borderStrong, backgroundColor: checked ? colors.success : 'transparent' }]}>
                  {checked ? <Icon name="check" size={14} color={colors.onPrimary} strokeWidth={3} /> : null}
                </View>
                <Text variant="heading" style={{ flex: 1 }}>
                  {i + 1}. {m.title}
                </Text>
              </Pressable>
              <Inline text={m.description} variant="small" color="textMuted" />
              <Text variant="small" weight="700">
                Acceptance criteria
              </Text>
              {m.acceptanceCriteria.map((c) => (
                <Inline key={c} text={`• ${c}`} variant="small" />
              ))}
              <Text variant="small" weight="700">
                Tests to write
              </Text>
              {m.tests.map((t) => (
                <Inline key={t} text={`• ${t}`} variant="small" />
              ))}
            </Card>
          );
        })}
      </View>

      <Collapsible title="Edge cases to handle" icon="alert">
        {project.edgeCases.map((e) => (
          <Inline key={e} text={`• ${e}`} variant="small" />
        ))}
      </Collapsible>
      <Collapsible title="Design trade-offs" icon="layers">
        {project.tradeOffs.map((t) => (
          <View key={t.decision} style={{ gap: 2 }}>
            <Text variant="small" weight="700">
              {t.decision}
            </Text>
            <Inline text={t.guidance} variant="small" />
          </View>
        ))}
      </Collapsible>
      <Collapsible title="Stretch goals" icon="trophy">
        {project.stretchGoals.map((s) => (
          <Inline key={s} text={`• ${s}`} variant="small" />
        ))}
      </Collapsible>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  box: { width: 22, height: 22, borderRadius: radius.sm, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
