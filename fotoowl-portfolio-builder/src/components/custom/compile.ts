/**
 * Compile validated custom component source into a React component.
 * React is injected — generated code cannot import other packages.
 */
import * as React from 'react';
import { createElement, type ComponentType } from 'react';
import { transform } from 'sucrase';
import { validateCustomComponentSource } from './sandbox';

type AnyProps = Record<string, unknown>;

function Fallback({ message }: { message: string }) {
  return createElement(
    'section',
    {
      className: 'fo-custom-fallback',
      'data-component': 'custom.fallback',
      style: {
        padding: '2rem',
        border: '1px dashed #c45',
        color: '#c45',
        fontFamily: 'monospace',
      },
    },
    message,
  );
}

function extractDefaultName(source: string): string | null {
  const match = source.match(/export\s+default\s+function\s+([A-Za-z0-9_]+)/);
  return match?.[1] ?? null;
}

/**
 * Turn TSX source into a React component function.
 */
export function compileCustomComponent(
  source: string,
  componentId: string,
): ComponentType<AnyProps> {
  const validated = validateCustomComponentSource(source);
  if (!validated.ok) {
    return function BrokenCustom() {
      return createElement(Fallback, { message: validated.error });
    };
  }

  const fnName = extractDefaultName(source);
  if (!fnName) {
    return function BrokenCustom() {
      return createElement(Fallback, {
        message: 'Missing export default function',
      });
    };
  }

  try {
    const { code } = transform(source, {
      transforms: ['typescript', 'jsx'],
      production: true,
      jsxRuntime: 'classic',
    });

    const body = code
      .replace(/import\s+[\s\S]*?from\s+['"]react['"];?/g, '')
      .replace(/export\s+default\s+function\s+([A-Za-z0-9_]+)/, 'function $1');

    const factory = new Function(
      'React',
      `${body}\n; return ${fnName};`,
    ) as (react: typeof React) => ComponentType<AnyProps>;

    const Comp = factory(React);
    Comp.displayName = componentId;
    return Comp;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to compile custom component';
    return function BrokenCustom() {
      return createElement(Fallback, {
        message: `${componentId}: ${message}`,
      });
    };
  }
}
