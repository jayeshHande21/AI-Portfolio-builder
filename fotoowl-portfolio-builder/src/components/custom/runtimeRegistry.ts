/**
 * Runtime registry for V2 custom components (compiled React functions + CSS).
 * Built-in registry stays static; customs are registered after sandbox validation.
 */
import type { ComponentType } from 'react';
import { compileCustomComponent } from './compile';
import { validateCustomComponentCss } from './sandbox';
import type { CustomComponentDefinition } from './types';
import { isCustomComponentId } from './types';

type AnyProps = Record<string, unknown>;

const runtimeComponents = new Map<string, ComponentType<AnyProps>>();
const injectedStyleIds = new Set<string>();

export function getRuntimeCustomComponent(
  componentId: string,
): ComponentType<AnyProps> | null {
  return runtimeComponents.get(componentId) ?? null;
}

export function injectCustomComponentCss(
  componentId: string,
  css: string,
): void {
  if (typeof document === 'undefined') return;
  const styleId = `fo-custom-style-${componentId.replace(/\./g, '-')}`;
  if (injectedStyleIds.has(styleId)) {
    const existing = document.getElementById(styleId);
    if (existing) {
      existing.textContent = css;
      return;
    }
  }
  const el = document.createElement('style');
  el.id = styleId;
  el.setAttribute('data-fotoowl-custom', componentId);
  el.textContent = css;
  document.head.appendChild(el);
  injectedStyleIds.add(styleId);
}

/**
 * Compile + register a custom component definition for Canvas rendering.
 */
export function registerCustomComponent(
  definition: CustomComponentDefinition,
): { ok: true } | { ok: false; error: string } {
  if (!isCustomComponentId(definition.id)) {
    return { ok: false, error: 'Custom component id must start with custom.' };
  }

  const cssCheck = validateCustomComponentCss(definition.css);
  if (!cssCheck.ok) {
    return cssCheck;
  }

  const Comp = compileCustomComponent(definition.source, definition.id);
  runtimeComponents.set(definition.id, Comp);
  injectCustomComponentCss(definition.id, cssCheck.transformed);
  return { ok: true };
}

export function registerCustomComponents(
  definitions: Record<string, CustomComponentDefinition> | undefined,
): void {
  if (!definitions) return;
  for (const definition of Object.values(definitions)) {
    registerCustomComponent(definition);
  }
}

export function clearRuntimeCustomComponents(): void {
  runtimeComponents.clear();
  if (typeof document !== 'undefined') {
    for (const id of injectedStyleIds) {
      document.getElementById(id)?.remove();
    }
  }
  injectedStyleIds.clear();
}
