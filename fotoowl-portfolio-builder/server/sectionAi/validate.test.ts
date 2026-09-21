import { describe, expect, it } from 'vitest';
import { parseAndValidateSectionAiResponse } from './validate';

describe('parseAndValidateSectionAiResponse', () => {
  it('accepts a scoped styles update patch', () => {
    const raw = JSON.stringify({
      ok: true,
      summary: 'Set About background to red',
      patches: [
        {
          op: 'update',
          targetId: 'about_01',
          changes: { styles: { background: 'red' } },
        },
      ],
    });

    const result = parseAndValidateSectionAiResponse(raw, 'about_01');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.patches).toHaveLength(1);
    expect(result.patches[0]).toMatchObject({
      op: 'update',
      targetId: 'about_01',
    });
  });

  it('rejects patches that target another section', () => {
    const raw = JSON.stringify({
      ok: true,
      summary: 'Bad target',
      patches: [
        {
          op: 'update',
          targetId: 'hero_01',
          changes: { props: { title: 'Nope' } },
        },
      ],
    });

    const result = parseAndValidateSectionAiResponse(raw, 'about_01');
    expect(result.ok).toBe(false);
  });

  it('rejects unsupported ops', () => {
    const raw = JSON.stringify({
      ok: true,
      summary: 'Delete',
      patches: [{ op: 'delete', targetId: 'about_01' }],
    });

    const result = parseAndValidateSectionAiResponse(raw, 'about_01');
    expect(result.ok).toBe(false);
  });

  it('parses fenced JSON content', () => {
    const raw = `Here you go:\n\`\`\`json\n${JSON.stringify({
      ok: true,
      summary: 'Updated title',
      patches: [
        {
          op: 'update',
          targetId: 'about_01',
          changes: { props: { title: 'Hello' } },
        },
      ],
    })}\n\`\`\``;

    const result = parseAndValidateSectionAiResponse(raw, 'about_01');
    expect(result.ok).toBe(true);
  });
});
