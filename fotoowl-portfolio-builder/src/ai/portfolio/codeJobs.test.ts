import { describe, expect, it } from 'vitest';
import { validateBlueprint } from '../../blueprint';
import { createPortfolioFromTheme, theme01 } from '../../themes';
import {
  planPortfolioCodeAiJobs,
  wantsCodeAi,
} from './codeJobs';

function sample() {
  return validateBlueprint(createPortfolioFromTheme(theme01));
}

describe('Portfolio Code AI jobs', () => {
  it('detects Code AI intent phrases', () => {
    expect(wantsCodeAi('Create a custom footer')).toBe(true);
    expect(wantsCodeAi('Add a brand-new custom section')).toBe(true);
    expect(wantsCodeAi('Make the palette warmer')).toBe(false);
  });

  it('plans a footer replace job', () => {
    const bp = sample();
    const jobs = planPortfolioCodeAiJobs(bp, 'Create a custom footer');
    expect(jobs).toHaveLength(1);
    expect(jobs[0]?.mode).toBe('replace');
    expect(jobs[0]?.kind).toBe('footer');
    expect(jobs[0]?.targetSectionId).toBe('footer_01');
  });

  it('plans an add job for a brand-new custom section', () => {
    const bp = sample();
    const jobs = planPortfolioCodeAiJobs(
      bp,
      'Add a brand-new custom section',
    );
    expect(jobs).toHaveLength(1);
    expect(jobs[0]?.mode).toBe('add');
    expect(jobs[0]?.kind).toBe('section');
  });
});
