import type { ComponentType } from 'react';
import { FO_STYLES_PROP } from '../../canvas/puck/styleProp';
import type { NodeStyles } from '../../blueprint/types';
import { stylesToCss } from '../../lib/stylesToCss';
import { getRuntimeCustomComponent } from './runtimeRegistry';

export type CustomSectionHostProps = {
  componentId: string;
  [FO_STYLES_PROP]?: NodeStyles;
  [key: string]: unknown;
};

/**
 * Puck host for V2 custom.* components — resolves from the runtime registry.
 */
export function CustomSectionHost(props: CustomSectionHostProps) {
  const { componentId, [FO_STYLES_PROP]: foStyles, ...rest } = props;
  const Comp = getRuntimeCustomComponent(componentId) as
    | ComponentType<Record<string, unknown>>
    | null;

  if (!Comp) {
    return (
      <section
        className="fo-custom-fallback"
        data-component={componentId || 'custom.missing'}
        style={{
          padding: '2rem',
          border: '1px dashed #c45',
          color: '#c45',
          fontFamily: 'monospace',
        }}
      >
        Custom component “{componentId || 'unknown'}” is not registered.
      </section>
    );
  }

  return (
    <div style={stylesToCss(foStyles)} data-fo-custom-host={componentId}>
      <Comp {...rest} componentId={componentId} />
    </div>
  );
}
