import { describe, expect, it } from 'vitest';
import { buildLocalCustomComponent } from './localTemplate';
import { parseAndValidateCodeAiResponse } from './validate';

describe('Code AI local template', () => {
  it('builds a sandboxed footer custom component', () => {
    const componentId = 'custom.footer_demo_abc123';
    const cssScope = 'fo-custom-footer_demo_abc123';
    const local = buildLocalCustomComponent({
      prompt: 'Generate a brand-new custom component',
      sectionId: 'footer_01',
      componentId,
      cssScope,
      section: {
        component: 'footer.minimal',
        props: { brand: 'Maya' },
      },
    });

    const checked = parseAndValidateCodeAiResponse(
      JSON.stringify({
        ok: true,
        summary: local.summary,
        component: {
          label: local.definition.label,
          source: local.definition.source,
          css: local.definition.css,
          defaultProps: local.definition.defaultProps,
        },
      }),
      componentId,
      'local',
    );

    expect(checked.ok).toBe(true);
    if (!checked.ok) return;
    expect(checked.definition.id).toBe(componentId);
    expect(checked.definition.source).toContain(componentId);
  });
});
