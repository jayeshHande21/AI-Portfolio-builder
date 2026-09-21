/**
 * Maps Blueprint `component` ids (e.g. hero.editorial) → React implementations.
 * Extend as section families grow.
 */
export const componentRegistry = {} as const;

export type ComponentRegistryKey = keyof typeof componentRegistry;
