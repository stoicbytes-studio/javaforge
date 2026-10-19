import { Editor, loader } from '@monaco-editor/react';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';
import { PlainCodeEditor, type CodeEditorProps } from './PlainCodeEditor';

// Monaco is self-hosted from /monaco/vs (copied by scripts/copy-monaco.mjs)
// instead of the default third-party CDN.
loader.config({ paths: { vs: '/monaco/vs' } });

const LOAD_TIMEOUT_MS = 10_000;

/** Web editor: Monaco with Java highlighting, falling back to the plain editor if Monaco fails to load. */
export function CodeEditor(props: CodeEditorProps) {
  const { scheme, colors } = useTheme();
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => !cancelled && setStatus((s) => (s === 'loading' ? 'failed' : s)), LOAD_TIMEOUT_MS);
    loader
      .init()
      .then(() => !cancelled && setStatus('ready'))
      .catch(() => !cancelled && setStatus('failed'));
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  if (status === 'failed') {
    return (
      <View style={{ gap: 6 }}>
        <Text variant="small" color="textSubtle">
          The advanced editor could not load; using the basic editor.
        </Text>
        <PlainCodeEditor {...props} />
      </View>
    );
  }

  return (
    <View
      style={{ height: props.height ?? 360, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, overflow: 'hidden' }}
      accessibilityLabel={props.accessibilityLabel ?? 'Java code editor'}
    >
      {status === 'loading' ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.codeBg }}>
          <ActivityIndicator color={colors.primary} accessibilityLabel="Loading editor" />
        </View>
      ) : (
        <Editor
          height="100%"
          language="java"
          theme={scheme === 'dark' ? 'vs-dark' : 'light'}
          value={props.value}
          onChange={(v) => props.onChange(v ?? '')}
          options={{
            readOnly: props.readOnly,
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'ui-monospace, "JetBrains Mono", Menlo, Consolas, monospace',
            scrollBeyondLastLine: false,
            tabSize: 4,
            automaticLayout: true,
            renderLineHighlight: 'line',
            ariaLabel: props.accessibilityLabel ?? 'Java code editor',
            accessibilitySupport: 'auto',
            tabFocusMode: false,
          }}
        />
      )}
    </View>
  );
}

export type { CodeEditorProps };
