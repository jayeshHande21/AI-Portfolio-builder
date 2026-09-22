import { Camera, Clock3, Images, ShieldCheck, type LucideIcon } from 'lucide-react';
import type { NodeStyles } from '../../blueprint/types';
import { stylesToCss } from '../../lib/stylesToCss';
import { FO_STYLES_PROP } from '../../canvas/puck/styleProp';

type IconName = 'camera' | 'clock' | 'gallery' | 'secure';

export interface ServiceItem {
  icon?: IconName;
  title?: string;
  body?: string;
}

export interface ServicesRowProps {
  items?: ServiceItem[];
  [FO_STYLES_PROP]?: NodeStyles;
}

const ICONS: Record<IconName, LucideIcon> = {
  camera: Camera,
  clock: Clock3,
  gallery: Images,
  secure: ShieldCheck,
};

const DEFAULT_ITEMS: ServiceItem[] = [
  {
    icon: 'camera',
    title: 'Full-day coverage',
    body: 'Ceremonies to last dance, shot with care',
  },
  {
    icon: 'clock',
    title: 'Fast turnaround',
    body: 'Preview gallery within two weeks',
  },
  {
    icon: 'gallery',
    title: 'Online gallery',
    body: 'High-res downloads for you and guests',
  },
  {
    icon: 'secure',
    title: 'Secure booking',
    body: 'Simple contracts and private client access',
  },
];

export function ServicesRow({
  items = DEFAULT_ITEMS,
  [FO_STYLES_PROP]: foStyles,
}: ServicesRowProps) {
  const list = items.length > 0 ? items : DEFAULT_ITEMS;

  return (
    <section
      className="fo-services"
      data-component="services.row"
      style={stylesToCss(foStyles)}
    >
      <div className="fo-services__grid">
        {list.map((item, index) => {
          const iconKey = item.icon ?? 'camera';
          const Icon = ICONS[iconKey] ?? Camera;
          return (
            <article key={`${item.title ?? 'svc'}-${index}`} className="fo-services__item">
              <Icon className="fo-services__icon" size={22} strokeWidth={1.6} aria-hidden />
              <div>
                <h3 className="fo-services__title">{item.title}</h3>
                {item.body ? <p className="fo-services__body">{item.body}</p> : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
