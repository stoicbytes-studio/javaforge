import { PlainCodeEditor, type CodeEditorProps } from './PlainCodeEditor';

/** Native (iOS/Android) editor. The web build resolves CodeEditor.web.tsx instead. */
export function CodeEditor(props: CodeEditorProps) {
  return <PlainCodeEditor {...props} />;
}

export type { CodeEditorProps };
