import type { NodeStyles } from '../../blueprint/types';
import { stylesToCss } from '../../lib/stylesToCss';
import { FO_STYLES_PROP } from '../../canvas/puck/styleProp';

export interface WorkCategoryItem {
  title?: string;
  body?: string;
  linkLabel?: string;
  imageUrl?: string;
  imageAlt?: string;
}

export interface WorkCategoriesProps {
  items?: WorkCategoryItem[];
  [FO_STYLES_PROP]?: NodeStyles;
}

const DEFAULT_ITEMS: WorkCategoryItem[] = [
  {
    title: 'Weddings',
    body: 'Quiet ceremonies and receptions told with an editorial eye.',
    linkLabel: 'View weddings',
  },
  {
    title: 'Portraits',
    body: 'Studio and location portraits shaped by soft, honest light.',
    linkLabel: 'View portraits',
  },
  {
    title: 'Editorial',
    body: 'Campaign and fashion frames for brands that value craft.',
    linkLabel: 'View editorial',
  },
];

export function WorkCategories({
  items = DEFAULT_ITEMS,
  [FO_STYLES_PROP]: foStyles,
}: WorkCategoriesProps) {
  const list = items.length > 0 ? items : DEFAULT_ITEMS;

  return (
    <section
      className="fo-work-cats"
      data-component="work.categories"
      style={stylesToCss(foStyles)}
    >
      <div className="fo-work-cats__grid">
        {list.map((item, index) => (
          <article key={`${item.title ?? 'cat'}-${index}`} className="fo-work-cats__card">
            {item.imageUrl ? (
              <img
                className="fo-work-cats__image"
                src={item.imageUrl}
                alt={item.imageAlt ?? ''}
                loading="lazy"
              />
            ) : (
              <div className="fo-work-cats__placeholder" aria-hidden />
            )}
            <div className="fo-work-cats__copy">
              <h2 className="fo-work-cats__title">{item.title}</h2>
              {item.body ? <p className="fo-work-cats__body">{item.body}</p> : null}
              {item.linkLabel ? (
                <button type="button" className="fo-work-cats__link">
                  {item.linkLabel} →
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
