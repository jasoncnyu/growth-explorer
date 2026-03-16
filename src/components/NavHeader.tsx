import { Link, useLocation } from "react-router-dom";
import { t } from "@/lib/i18n";
import LanguageSelector from "@/components/LanguageSelector";
import { type Locale } from "@/lib/i18n";

interface NavHeaderProps {
  locale: Locale;
  onLocaleChange: (l: Locale) => void;
}

const NavHeader = ({ locale, onLocaleChange }: NavHeaderProps) => {
  const location = useLocation();
  const basePath = `/${locale}`;

  const links = [
    { to: `${basePath}/`, label: t("navSimulator") },
    { to: `${basePath}/theory`, label: t("navTheory") },
    { to: `${basePath}/guide`, label: t("navGuide") },
  ];

  const normalize = (p: string) => (p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p);
  const currentPath = normalize(location.pathname);

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
          <Link to={`${basePath}/`} className="text-lg font-bold text-foreground tracking-tight hover:text-primary transition-colors">
            {t("title")}
          </Link>
          <nav className="flex items-center gap-1">
            {links.map((link) => {
              const isActive = currentPath === normalize(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <LanguageSelector value={locale} onChange={onLocaleChange} />
      </div>
    </header>
  );
};

export default NavHeader;
