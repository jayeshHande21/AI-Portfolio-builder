/**
 * Local Section AI planner — prompt → structured Blueprint patches.
 *
 * Architecture POC without LLM keys in the client.
 * `api.ts` prefers a remote endpoint when configured, else uses this planner.
 *
 * Supports multi-intent prompts (e.g. premium tone + image side + title)
 * by composing multiple section-scoped patches.
 */
import type { BlueprintNode, BlueprintPatch, PortfolioBlueprint } from '../../blueprint';
import {
  replaceNodePatch,
  updateNodePatch,
} from '../../blueprint';
import type { SectionAiResult } from '../types';

function asProps(node: BlueprintNode): Record<string, unknown> {
  return { ...(node.props ?? {}) };
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function includesAny(haystack: string, needles: string[]): boolean {
  return needles.some((n) => haystack.includes(n));
}

function isAbout(node: BlueprintNode): boolean {
  return (
    node.component === 'about.image_left' ||
    node.component === 'about.image_right'
  );
}

function isHero(node: BlueprintNode): boolean {
  return node.component === 'hero.editorial';
}

function isGallery(node: BlueprintNode): boolean {
  return node.component === 'gallery.masonry';
}

function isFooter(node: BlueprintNode): boolean {
  return node.component === 'footer.minimal';
}

function premiumAboutCopy(props: Record<string, unknown>) {
  return {
    ...props,
    title: text(props.title) || 'A quieter kind of portrait',
    body:
      'Crafted for photographers who care about atmosphere as much as likeness — soft light, deliberate pacing, and frames that feel collected rather than produced.',
    ctaLabel: text(props.ctaLabel) || 'Inquire about availability',
  };
}

function premiumHeroCopy(props: Record<string, unknown>) {
  return {
    ...props,
    eyebrow: text(props.eyebrow) || 'Fine art photography',
    title: 'Stories Worth Remembering',
    subtitle:
      'An editorial portfolio for couples and brands who want cinema in stillness — restrained, luminous, and deeply human.',
    ctaLabel: text(props.ctaLabel) || 'View the collection',
  };
}

function rebuildAboutSection(
  section: BlueprintNode,
  layout: 'image_left' | 'image_right',
): BlueprintNode {
  const props = asProps(section);
  return {
    id: section.id,
    type: 'section',
    component: layout === 'image_right' ? 'about.image_right' : 'about.image_left',
    props: {
      ...props,
      title: 'About the photographer',
      body:
        'A completely refreshed About — large portrait energy, a clear story, selected awards, and a direct CTA. Built from supported components, not new React code.',
      ctaLabel: 'Book a discovery call',
      imageUrl: props.imageUrl,
      imageAlt: text(props.imageAlt) || 'Photographer portrait',
    },
  };
}

function rebuildHeroSection(section: BlueprintNode): BlueprintNode {
  const props = asProps(section);
  return {
    id: section.id,
    type: 'section',
    component: 'hero.editorial',
    props: {
      ...props,
      eyebrow: 'Newly composed',
      title: 'A Fresh Editorial Opening',
      subtitle:
        'Rebuilt Hero structure with stronger hierarchy, quieter type, and a clearer invitation into the work.',
      ctaLabel: 'Explore the portfolio',
      imageUrl: props.imageUrl,
      imageAlt: text(props.imageAlt) || 'Featured photograph',
    },
  };
}

function extractQuotedOrAfter(
  promptRaw: string,
  keys: string[],
): string | null {
  for (const key of keys) {
    const pattern = new RegExp(
      `(?:${key})\\s*(?:to|as|:)?\\s*[“"']([^”"']+)[”"']`,
      'i',
    );
    const quoted = promptRaw.match(pattern);
    if (quoted?.[1]?.trim()) return quoted[1].trim();

    const plain = promptRaw.match(
      new RegExp(`(?:${key})\\s*(?:to|as|:)\\s*(.+)$`, 'i'),
    );
    if (plain?.[1]?.trim()) {
      return plain[1].trim().replace(/[.!]+$/, '');
    }
  }
  return null;
}

/**
 * Plan section-scoped patches from a natural-language prompt.
 * Multiple intents in one prompt compose into one patch list.
 */
export function planSectionPatches(
  blueprint: PortfolioBlueprint,
  sectionId: string,
  promptRaw: string,
): SectionAiResult {
  const section = blueprint.sections.find((s) => s.id === sectionId);
  if (!section) {
    return { ok: false, error: `Section "${sectionId}" not found`, source: 'local' };
  }

  const prompt = promptRaw.trim().toLowerCase();
  if (!prompt) {
    return { ok: false, error: 'Prompt is empty', source: 'local' };
  }

  let props = asProps(section);
  const patches: BlueprintPatch[] = [];
  const summaries: string[] = [];
  let workingComponent = section.component;

  const pushUpdate = (
    changes: Parameters<typeof updateNodePatch>[1],
    summary: string,
  ) => {
    patches.push(updateNodePatch(sectionId, changes));
    summaries.push(summary);
    if (changes.component) {
      workingComponent = changes.component;
    }
    if (changes.props) {
      props = { ...props, ...changes.props };
    }
  };

  // --- Replace / rebuild ---
  const wantsRebuild = includesAny(prompt, [
    'completely new',
    'rebuild',
    'recreate',
    'replace this',
    'replace the section',
    'new about section',
    'new hero',
  ]);

  if (wantsRebuild && isAbout(section)) {
    const layout = includesAny(prompt, ['right'])
      ? 'image_right'
      : includesAny(prompt, ['left'])
        ? 'image_left'
        : section.component === 'about.image_right'
          ? 'image_right'
          : 'image_left';
    const next = rebuildAboutSection(section, layout);
    patches.push(replaceNodePatch(sectionId, next));
    summaries.push('Replaced About with a new structured composition');
    props = asProps(next);
    workingComponent = next.component;
  } else if (wantsRebuild && isHero(section)) {
    const next = rebuildHeroSection(section);
    patches.push(replaceNodePatch(sectionId, next));
    summaries.push('Replaced Hero with a new structured composition');
    props = asProps(next);
    workingComponent = next.component;
  }

  // --- Layout: About image side ---
  if (isAbout({ ...section, component: workingComponent })) {
    if (
      includesAny(prompt, [
        'image on the right',
        'image right',
        'photo on the right',
        'picture on the right',
        'move image right',
        'image to the right',
        'put the image on the right',
      ])
    ) {
      if (workingComponent !== 'about.image_right') {
        pushUpdate(
          { component: 'about.image_right' },
          'Moved About image to the right',
        );
      }
    } else if (
      includesAny(prompt, [
        'image on the left',
        'image left',
        'photo on the left',
        'picture on the left',
        'move image left',
        'image to the left',
        'put the image on the left',
      ])
    ) {
      if (workingComponent !== 'about.image_left') {
        pushUpdate(
          { component: 'about.image_left' },
          'Moved About image to the left',
        );
      }
    } else if (
      includesAny(prompt, ['flip', 'swap image', 'switch image', 'other side'])
    ) {
      const next =
        workingComponent === 'about.image_left'
          ? 'about.image_right'
          : 'about.image_left';
      pushUpdate({ component: next }, `Flipped About layout to ${next}`);
    }
  }

  // --- Premium tone ---
  if (includesAny(prompt, ['premium', 'luxury', 'elegant', 'more refined'])) {
    if (isAbout({ ...section, component: workingComponent })) {
      pushUpdate(
        { props: premiumAboutCopy(props) },
        'Updated About copy toward a more premium tone',
      );
    } else if (isHero(section)) {
      pushUpdate(
        { props: premiumHeroCopy(props) },
        'Updated Hero copy toward a more premium tone',
      );
    } else if (isGallery(section)) {
      pushUpdate(
        { props: { ...props, title: 'Selected commissions' } },
        'Refined Gallery heading',
      );
    } else if (isFooter(section)) {
      pushUpdate(
        { props: { ...props, tagline: 'Fine art photography' } },
        'Refined Footer tagline',
      );
    }
  }

  // --- Explicit title ---
  if (includesAny(prompt, ['title', 'headline', 'heading'])) {
    const nextTitle = extractQuotedOrAfter(promptRaw, [
      'title',
      'headline',
      'heading',
    ]);
    if (nextTitle) {
      pushUpdate({ props: { ...props, title: nextTitle } }, `Set title to “${nextTitle}”`);
    }
  }

  // --- Explicit subtitle (hero) ---
  if (isHero(section) && includesAny(prompt, ['subtitle', 'tagline'])) {
    const next = extractQuotedOrAfter(promptRaw, ['subtitle', 'tagline']);
    if (next) {
      pushUpdate(
        { props: { ...props, subtitle: next } },
        `Set subtitle to “${next}”`,
      );
    }
  }

  // --- Body / shorter / longer ---
  if (includesAny(prompt, ['shorter', 'concise', 'brief'])) {
    const body = text(props.body) || text(props.subtitle);
    if (body) {
      const shortened =
        body.split(/[.!?]/).filter(Boolean)[0]?.trim() + '.' || body.slice(0, 80);
      if (isHero(section)) {
        pushUpdate(
          { props: { ...props, subtitle: shortened } },
          'Shortened section copy',
        );
      } else {
        pushUpdate(
          { props: { ...props, body: shortened } },
          'Shortened section copy',
        );
      }
    }
  } else if (includesAny(prompt, ['longer', 'expand', 'more detail'])) {
    if (isAbout({ ...section, component: workingComponent })) {
      pushUpdate(
        {
          props: {
            ...props,
            body: `${text(props.body)} Available for destination work and long-form collaborations.`,
          },
        },
        'Expanded About body copy',
      );
    } else if (isHero(section)) {
      pushUpdate(
        {
          props: {
            ...props,
            subtitle: `${text(props.subtitle)} Crafted with patience and a documentary eye.`,
          },
        },
        'Expanded Hero subtitle',
      );
    }
  }

  // --- CTA ---
  if (includesAny(prompt, ['cta', 'button', 'call to action'])) {
    const label =
      extractQuotedOrAfter(promptRaw, [
        'cta',
        'button',
        'call to action',
        'cta label',
      ]) || 'Get in touch';
    pushUpdate(
      { props: { ...props, ctaLabel: label } },
      `Updated CTA to “${label}”`,
    );
  }

  if (patches.length === 0) {
    return {
      ok: false,
      error:
        'Could not map that prompt to a section change. Try: “make this more premium”, “put the image on the right”, “create a completely new About section”, or “title: My New Title”.',
      source: 'local',
    };
  }

  return {
    ok: true,
    summary: summaries.join('. ') + '.',
    patches,
    source: 'local',
  };
}
