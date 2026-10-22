import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';

export default function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div>
          <Link href={`/${locale}`} className="wordmark wordmark--footer">
            evim
          </Link>
          <p className="site-footer__tagline">{dict.footer.tagline}</p>
        </div>
        <div className="site-footer__contact">
          <h2>{dict.footer.contact}</h2>
          <a href="tel:+994120000000">+994 12 000 00 00</a>
          <a href="mailto:hello@evim.az">hello@evim.az</a>
        </div>
      </div>
      <div className="container site-footer__legal">
        © {new Date().getFullYear()} Evim. {dict.footer.rights}
      </div>
    </footer>
  );
}
