import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import type { ExecutorState } from '@/services/execution/useExecutor';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

/** Always tells the learner whether their code really runs. */
export function ExecutionBanner({ state }: { state: ExecutorState }) {
  const { colors } = useTheme();
  const real = state.executor.mode === 'remote';
  return (
    <View
      accessibilityRole="summary"
      style={[styles.banner, { backgroundColor: real ? colors.successMuted : colors.warningMuted, borderColor: real ? colors.success : colors.warning }]}
    >
      <Icon name={real ? 'terminal' : 'alert'} size={16} color={real ? colors.success : colors.warning} />
      <View style={{ flex: 1 }}>
        <Text variant="small" weight="700" color={real ? 'success' : 'warning'}>
          {real ? 'Real Java execution' : 'Simulation mode — code is not executed'}
        </Text>
        <Text variant="small" color="textMuted">
          {real
            ? `${state.health?.javaVersion ? `Java ${state.health.javaVersion}` : 'Remote JVM'}${state.health?.sandbox ? ` · ${state.health.sandbox} sandbox` : ''}. Code runs in an isolated, time- and memory-limited process.`
            : `${state.reason ?? ''} Only static checks run; passing tests requires the execution service.`}
        </Text>
      </View>
      {!real ? (
        <Link href="/settings" style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>
          Settings
        </Link>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, borderWidth: 1 },
});
