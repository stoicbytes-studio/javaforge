/**
 * Minimal Java lexer for syntax highlighting. It is intentionally forgiving:
 * anything it does not recognise becomes plain text, so malformed learner code
 * still renders.
 */

export type TokenKind = 'keyword' | 'string' | 'comment' | 'number' | 'annotation' | 'type' | 'plain';

export interface Token {
  kind: TokenKind;
  text: string;
}

const KEYWORDS = new Set(
  (
    'abstract assert boolean break byte case catch char class const continue default do double else enum ' +
    'extends final finally float for goto if implements import instanceof int interface long native new ' +
    'package private protected public return short static strictfp super switch synchronized this throw ' +
    'throws transient try void volatile while var record yield sealed permits non-sealed true false null'
  ).split(' '),
);

const PATTERNS: [TokenKind, RegExp][] = [
  ['comment', /^\/\/[^\n]*/],
  ['comment', /^\/\*[\s\S]*?(?:\*\/|$)/],
  ['string', /^"""[\s\S]*?(?:"""|$)/],
  ['string', /^"(?:\\.|[^"\\\n])*"?/],
  ['string', /^'(?:\\.|[^'\\\n])*'?/],
  ['number', /^(?:0[xX][0-9a-fA-F_]+|0[bB][01_]+|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?)[lLfFdD]?/],
  ['annotation', /^@[A-Za-z_]\w*/],
  ['plain', /^[A-Za-z_$][\w$]*/],
  ['plain', /^\s+/],
  ['plain', /^[\s\S]/],
];

export function tokenizeJava(source: string): Token[] {
  const tokens: Token[] = [];
  let rest = source;
  while (rest.length > 0) {
    for (const [kind, re] of PATTERNS) {
      const m = re.exec(rest);
      if (!m) continue;
      const text = m[0];
      let finalKind = kind;
      if (kind === 'plain' && /^[A-Za-z_$]/.test(text)) {
        if (KEYWORDS.has(text)) finalKind = 'keyword';
        else if (/^[A-Z]/.test(text)) finalKind = 'type';
      }
      const last = tokens[tokens.length - 1];
      if (last && last.kind === finalKind && finalKind === 'plain') last.text += text;
      else tokens.push({ kind: finalKind, text });
      rest = rest.slice(text.length);
      break;
    }
  }
  return tokens;
}

/** Splits a token stream into per-line token arrays (multi-line comments/strings are split too). */
export function tokenizeLines(source: string): Token[][] {
  const lines: Token[][] = [[]];
  for (const token of tokenizeJava(source)) {
    const parts = token.text.split('\n');
    parts.forEach((part, i) => {
      if (i > 0) lines.push([]);
      if (part.length > 0) lines[lines.length - 1]!.push({ kind: token.kind, text: part });
    });
  }
  return lines;
}
