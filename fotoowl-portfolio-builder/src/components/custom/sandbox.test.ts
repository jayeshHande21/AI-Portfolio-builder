import { describe, expect, it } from 'vitest';
import { compileCustomComponent } from './compile';
import { validateCustomComponentSource } from './sandbox';

const SAMPLE = `import React from 'react';

type Props = { title?: string };

export default function DemoSection({ title = 'Hello' }: Props) {
  return (
    <section className="fo-demo" data-component="custom.demo_abc">
      <h2>{title}</h2>
    </section>
  );
}
`;

describe('custom component sandbox', () => {
  it('accepts a valid default-export React section', () => {
    const result = validateCustomComponentSource(SAMPLE);
    expect(result.ok).toBe(true);
  });

  it('rejects fetch()', () => {
    const result = validateCustomComponentSource(
      SAMPLE.replace(
        'return (',
        'fetch("/x");\n  return (',
      ),
    );
    expect(result.ok).toBe(false);
  });

  it('rejects non-react imports', () => {
    const result = validateCustomComponentSource(
      `import x from 'lodash';\n${SAMPLE}`,
    );
    expect(result.ok).toBe(false);
  });

  it('compiles into a renderable component', () => {
    const Comp = compileCustomComponent(SAMPLE, 'custom.demo_abc');
    expect(typeof Comp).toBe('function');
  });
});
