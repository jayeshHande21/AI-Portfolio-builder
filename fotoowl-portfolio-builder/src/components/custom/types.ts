/**
 * V2 custom component helpers. Definition type lives on the Blueprint.
 */
export type { CustomComponentDefinition } from '../../blueprint';

export function isCustomComponentId(componentId: string | undefined): boolean {
  return typeof componentId === 'string' && componentId.startsWith('custom.');
}

export function createCustomComponentId(slug: string): string {
  const clean = slug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `custom.${clean || 'section'}_${suffix}`;
}
