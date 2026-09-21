/**
 * Static sandbox checks + Sucrase transform for AI-generated section components.
 * Does not execute the component — only validates structure / syntax.
 */
import { transform } from 'sucrase';

const BANNED_SUBSTRINGS: Array<{ re: RegExp; reason: string }> = [
  { re: /\beval\s*\(/, reason: 'eval() is not allowed' },
  { re: /\bFunction\s*\(/, reason: 'Function() constructor is not allowed' },
  { re: /\bfetch\s*\(/, reason: 'fetch() is not allowed in custom components' },
  { re: /\bXMLHttpRequest\b/, reason: 'XMLHttpRequest is not allowed' },
  { re: /\bWebSocket\b/, reason: 'WebSocket is not allowed' },
  { re: /\bimportScripts\b/, reason: 'importScripts is not allowed' },
  { re: /\brequire\s*\(/, reason: 'require() is not allowed' },
  {
    re: /\blocalStorage\b|\bsessionStorage\b|\bdocument\.cookie\b/,
    reason: 'Browser storage / cookies are not allowed',
  },
];

export type SandboxSuccess = {
  ok: true;
  transformed: string;
};

export type SandboxFailure = {
  ok: false;
  error: string;
};

export type SandboxResult = SandboxSuccess | SandboxFailure;

function assertOnlyReactImports(source: string): string | null {
  const matches = source.matchAll(/from\s+['"]([^'"]+)['"]/g);
  for (const match of matches) {
    const spec = match[1];
    if (spec !== 'react') {
      return `Only \`react\` imports are allowed (found "${spec}")`;
    }
  }
  return null;
}

/**
 * Validate AI-generated TSX before it can be registered.
 */
export function validateCustomComponentSource(source: string): SandboxResult {
  const trimmed = source.trim();
  if (!trimmed) {
    return { ok: false, error: 'Component source is empty' };
  }

  if (trimmed.length > 40_000) {
    return { ok: false, error: 'Component source is too large' };
  }

  for (const ban of BANNED_SUBSTRINGS) {
    if (ban.re.test(trimmed)) {
      return { ok: false, error: ban.reason };
    }
  }

  const importError = assertOnlyReactImports(trimmed);
  if (importError) {
    return { ok: false, error: importError };
  }

  if (!/export\s+default\s+function\b/.test(trimmed)) {
    return {
      ok: false,
      error: 'Component must use `export default function ...`',
    };
  }

  try {
    const result = transform(trimmed, {
      transforms: ['typescript', 'jsx'],
      production: true,
      jsxRuntime: 'classic',
    });
    return { ok: true, transformed: result.code };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? `Syntax error: ${error.message}`
          : 'Failed to compile component',
    };
  }
}

/**
 * Validate scoped CSS (basic size + banned constructs).
 */
export function validateCustomComponentCss(css: string): SandboxResult {
  const trimmed = css.trim();
  if (trimmed.length > 20_000) {
    return { ok: false, error: 'CSS is too large' };
  }
  if (/@import\b|expression\s*\(|javascript:/i.test(trimmed)) {
    return { ok: false, error: 'CSS contains forbidden constructs' };
  }
  return { ok: true, transformed: trimmed };
}
