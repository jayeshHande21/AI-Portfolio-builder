/**
 * Local Section AI planner — prompt → structured Blueprint patches.
 *
 * This proves the architecture without putting LLM keys in the client.
 * When a backend is available, `api.ts` prefers the remote endpoint and
 * falls back here.
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
      ...premiumAboutCopy(props),
      title: 'About the photographer',
      body:
        'A completely refreshed About — large portrait energy, a clear story, and a direct CTA. Built from supported components, not new React code.',
      ctaLabel: 'Book a discovery call',
      imageUrl: props.imageUrl,
      imageAlt: text(props.imageAlt) || 'Photographer portrait',
    },
  };
}

/**
 * Plan section-scoped patches from a natural-language prompt.
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

  const props = asProps(section);
  const patches: BlueprintPatch[] = [];
  let summary = '';

  // --- Layout: About image side ---
  if (
    isAbout(section) &&
    includesAny(prompt, [
      'image on the right',
      'image right',
      'photo on the right',
      'picture on the right',
      'move image right',
      'image to the right',
    ])
  ) {
    patches.push(
      updateNodePatch(sectionId, { component: 'about.image_right' }),
    );
    summary = 'Moved About image to the right.';
  } else if (
    isAbout(section) &&
    includesAny(prompt, [
      'image on the left',
      'image left',
      'photo on the left',
      'picture on the left',
      'move image left',
      'image to the left',
    ])
  ) {
    patches.push(
      updateNodePatch(sectionId, { component: 'about.image_left' }),
    );
    summary = 'Moved About image to the left.';
  } else if (
    isAbout(section) &&
    includesAny(prompt, ['flip', 'swap image', 'switch image', 'other side'])
  ) {
    const next =
      section.component === 'about.image_left'
        ? 'about.image_right'
        : 'about.image_left';
    patches.push(updateNodePatch(sectionId, { component: next }));
    summary = `Flipped About layout to ${next}.`;
  }

  // --- Replace / rebuild About ---
  else if (
    isAbout(section) &&
    includesAny(prompt, [
      'completely new about',
      'new about section',
      'rebuild about',
      'replace about',
      'recreate about',
    ])
  ) {
    const layout = includesAny(prompt, ['right'])
      ? 'image_right'
      : 'image_left';
    patches.push(
      replaceNodePatch(sectionId, rebuildAboutSection(section, layout)),
    );
    summary = 'Replaced About with a new structured composition.';
  }

  // --- Premium tone ---
  else if (includesAny(prompt, ['premium', 'luxury', 'elegant', 'more refined'])) {
    if (isAbout(section)) {
      patches.push(
        updateNodePatch(sectionId, { props: premiumAboutCopy(props) }),
      );
      if (
        includesAny(prompt, ['left']) &&
        section.component !== 'about.image_left'
      ) {
        patches.push(
          updateNodePatch(sectionId, { component: 'about.image_left' }),
        );
      }
      if (
        includesAny(prompt, ['right']) &&
        section.component !== 'about.image_right'
      ) {
        patches.push(
          updateNodePatch(sectionId, { component: 'about.image_right' }),
        );
      }
      summary = 'Updated About copy toward a more premium tone.';
    } else if (isHero(section)) {
      patches.push(
        updateNodePatch(sectionId, { props: premiumHeroCopy(props) }),
      );
      summary = 'Updated Hero copy toward a more premium tone.';
    } else if (isGallery(section)) {
      patches.push(
        updateNodePatch(sectionId, {
          props: {
            ...props,
            title: 'Selected commissions',
          },
        }),
      );
      summary = 'Refined Gallery heading.';
    } else if (isFooter(section)) {
      patches.push(
        updateNodePatch(sectionId, {
          props: {
            ...props,
            tagline: 'Fine art photography',
          },
        }),
      );
      summary = 'Refined Footer tagline.';
    }
  }

  // --- Title / headline updates ---
  else if (
    includesAny(prompt, ['title', 'headline', 'heading']) &&
    includesAny(prompt, ['to ', 'as ', ':', 'rename', 'change', 'set '])
  ) {
    const match =
      promptRaw.match(
        /(?:title|headline|heading)\s*(?:to|as|:)\s*[“"']?([^”"']+)[”"']?/i,
      ) ??
      promptRaw.match(/rename\s+(?:the\s+)?(?:title|headline)\s+to\s+(.+)/i);
    const nextTitle = match?.[1]?.trim();
    if (nextTitle) {
      const key = isHero(section) ? 'title' : 'title';
      patches.push(
        updateNodePatch(sectionId, {
          props: { ...props, [key]: nextTitle },
        }),
      );
      summary = `Set title to “${nextTitle}”.`;
    }
  }

  // --- Shorter / longer body ---
  else if (includesAny(prompt, ['shorter', 'concise', 'brief'])) {
    const body = text(props.body) || text(props.subtitle);
    if (body) {
      const shortened =
        body.split(/[.!?]/).filter(Boolean)[0]?.trim() + '.' || body.slice(0, 80);
      if (isHero(section)) {
        patches.push(
          updateNodePatch(sectionId, {
            props: { ...props, subtitle: shortened },
          }),
        );
      } else {
        patches.push(
          updateNodePatch(sectionId, {
            props: { ...props, body: shortened },
          }),
        );
      }
      summary = 'Shortened section copy.';
    }
  } else if (includesAny(prompt, ['longer', 'expand', 'more detail'])) {
    if (isAbout(section)) {
      patches.push(
        updateNodePatch(sectionId, {
          props: {
            ...props,
            body: `${text(props.body)} Available for destination work and long-form collaborations.`,
          },
        }),
      );
      summary = 'Expanded About body copy.';
    } else if (isHero(section)) {
      patches.push(
        updateNodePatch(sectionId, {
          props: {
            ...props,
            subtitle: `${text(props.subtitle)} Crafted with patience and a documentary eye.`,
          },
        }),
      );
      summary = 'Expanded Hero subtitle.';
    }
  }

  // --- CTA ---
  else if (includesAny(prompt, ['cta', 'button', 'call to action'])) {
    const match = promptRaw.match(
      /(?:cta|button|call to action)\s*(?:to|as|:)\s*[“"']?([^”"']+)[”"']?/i,
    );
    const label = match?.[1]?.trim() || 'Get in touch';
    patches.push(
      updateNodePatch(sectionId, {
        props: {
          ...props,
          ctaLabel: label,
        },
      }),
    );
    summary = `Updated CTA to “${label}”.`;
  }

  if (patches.length === 0) {
    return {
      ok: false,
      error:
        'Could not map that prompt to a section change. Try: “make this more premium”, “image on the right”, “completely new About section”, or “title: My New Title”.',
      source: 'local',
    };
  }

  return {
    ok: true,
    summary,
    patches,
    source: 'local',
  };
}
