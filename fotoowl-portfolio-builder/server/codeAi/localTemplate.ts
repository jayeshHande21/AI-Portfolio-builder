/**
 * Local Code AI template — used when no LLM key is configured.
 * Still goes through the same sandbox + registry path.
 */
import type { CustomComponentDefinition } from '../../src/blueprint/types';

export function buildLocalCustomComponent(input: {
  prompt: string;
  sectionId: string;
  componentId: string;
  cssScope: string;
  section: { component?: string; props?: Record<string, unknown> };
}): {
  definition: CustomComponentDefinition;
  summary: string;
} {
  const props = input.section.props ?? {};
  const isFooter = (input.section.component ?? '').includes('footer');
  const label = isFooter ? 'Footer · Custom AI' : 'Section · Custom AI';

  const source = isFooter
    ? footerSource(input.componentId, input.cssScope)
    : sectionSource(input.componentId, input.cssScope);

  const css = isFooter
    ? footerCss(input.cssScope)
    : sectionCss(input.cssScope);

  const defaultProps = isFooter
    ? {
        brand: String(props.brand ?? 'Studio'),
        tagline: String(props.tagline ?? 'Custom AI footer'),
        email: String(props.email ?? 'hello@studio.example'),
        linksLabel: 'Selected work',
      }
    : {
        title: String(props.title ?? 'A custom section'),
        body: String(
          props.body ??
            props.subtitle ??
            'Generated as a brand-new React component via Code AI.',
        ),
        ctaLabel: String(props.ctaLabel ?? 'Get in touch'),
      };

  return {
    summary: `Created custom component ${input.componentId} from local Code AI template (set OPENAI_API_KEY for LLM generation). Prompt: ${input.prompt.slice(0, 80)}`,
    definition: {
      id: input.componentId,
      label,
      source,
      css,
      defaultProps,
      description: input.prompt.slice(0, 160),
      createdAt: new Date().toISOString(),
    },
  };
}

function sectionSource(componentId: string, cssScope: string): string {
  return `import React from 'react';

type Props = {
  title?: string;
  body?: string;
  ctaLabel?: string;
};

export default function CustomAiSection({
  title = 'A custom section',
  body = 'Generated as a brand-new React component.',
  ctaLabel = 'Get in touch',
}: Props) {
  return (
    <section className="${cssScope}" data-component="${componentId}">
      <div className="${cssScope}__inner">
        <p className="${cssScope}__eyebrow">Custom component</p>
        <h2 className="${cssScope}__title">{title}</h2>
        <p className="${cssScope}__body">{body}</p>
        {ctaLabel ? (
          <button type="button" className="${cssScope}__cta">
            {ctaLabel}
          </button>
        ) : null}
      </div>
    </section>
  );
}
`;
}

function footerSource(componentId: string, cssScope: string): string {
  return `import React from 'react';

type Props = {
  brand?: string;
  tagline?: string;
  email?: string;
  linksLabel?: string;
};

export default function CustomAiFooter({
  brand = 'Studio',
  tagline = 'Custom AI footer',
  email = 'hello@studio.example',
  linksLabel = 'Selected work',
}: Props) {
  return (
    <footer className="${cssScope}" data-component="${componentId}">
      <div className="${cssScope}__grid">
        <div>
          <p className="${cssScope}__brand">{brand}</p>
          <p className="${cssScope}__tagline">{tagline}</p>
        </div>
        <div className="${cssScope}__meta">
          <p className="${cssScope}__label">{linksLabel}</p>
          <a className="${cssScope}__email" href={"mailto:" + email}>
            {email}
          </a>
        </div>
      </div>
    </footer>
  );
}
`;
}

function sectionCss(cssScope: string): string {
  return `
.${cssScope} {
  padding: clamp(3rem, 8vw, 6rem) clamp(1.25rem, 4vw, 3rem);
  background: linear-gradient(160deg, #1a2228, #0f1418);
  color: #f3f1ec;
}
.${cssScope}__inner { max-width: 40rem; }
.${cssScope}__eyebrow {
  margin: 0 0 0.75rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 0.72rem;
  color: #9aa3ab;
}
.${cssScope}__title {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.1;
  letter-spacing: -0.03em;
}
.${cssScope}__body {
  margin: 1rem 0 1.5rem;
  color: #c8cfcf;
  line-height: 1.6;
}
.${cssScope}__cta {
  border: 0;
  padding: 0.75rem 1.1rem;
  background: #0f6e6a;
  color: #f3f1ec;
  cursor: pointer;
}
`.trim();
}

function footerCss(cssScope: string): string {
  return `
.${cssScope} {
  padding: clamp(2.5rem, 6vw, 4rem) clamp(1.25rem, 4vw, 3rem);
  background: #0d1114;
  color: #e8e6e1;
  border-top: 1px solid rgba(243,241,236,0.08);
}
.${cssScope}__grid {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;
}
.${cssScope}__brand {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
}
.${cssScope}__tagline {
  margin: 0.4rem 0 0;
  color: #9aa3ab;
}
.${cssScope}__label {
  margin: 0 0 0.35rem;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #9aa3ab;
}
.${cssScope}__email {
  color: #c8ebe8;
  text-decoration: none;
}
`.trim();
}
