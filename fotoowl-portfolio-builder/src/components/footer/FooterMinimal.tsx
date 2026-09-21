export interface FooterMinimalProps {
  brand?: string;
  tagline?: string;
  email?: string;
  copyright?: string;
}

export function FooterMinimal({
  brand = 'FotoOwl',
  tagline = 'Made for photographers',
  email = 'hello@studio.example',
  copyright = `© ${new Date().getFullYear()}`,
}: FooterMinimalProps) {
  return (
    <footer className="fo-footer" data-component="footer.minimal">
      <div className="fo-footer__brand">
        <p className="fo-footer__name">{brand}</p>
        <p className="fo-footer__tagline">{tagline}</p>
      </div>
      <div className="fo-footer__meta">
        <a className="fo-footer__email" href={`mailto:${email}`}>
          {email}
        </a>
        <p className="fo-footer__copy">{copyright}</p>
      </div>
    </footer>
  );
}
