/**
 * Sample theme 01 — starting Portfolio Blueprint for the Canvas POC.
 * Themes are starting points; user portfolios must not mutate theme source data.
 *
 * Initial POC sections: Hero · About · Gallery · Footer
 */
import type { PortfolioBlueprint } from '../blueprint';

export const theme01: PortfolioBlueprint = {
  id: 'theme-01',
  name: 'Sample Theme 01',
  sections: [
    { id: 'hero_01', type: 'section', component: 'hero.editorial', props: {} },
    { id: 'about_01', type: 'section', component: 'about.image_left', props: {} },
    { id: 'gallery_01', type: 'section', component: 'gallery.masonry', props: {} },
    { id: 'footer_01', type: 'section', component: 'footer.minimal', props: {} },
  ],
};
