import { Github } from "lucide-react";
import { t } from "@/lib/i18n";

const SiteFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card mt-12">
      <div className="container mx-auto px-6 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/jasoncnyu/growth-explorer"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-foreground hover:text-primary transition-colors"
              aria-label={t("footerGitHubLabel")}
              title={t("footerGitHubLabel")}
            >
              <Github className="h-4 w-4" aria-hidden="true" />
            </a>
            <span>{t("footerOpenSourceNote")}</span>
          </div>
          <div>(c) {year} Growth Explorer. {t("footerAllRights")}</div>
        </div>
        <div className="flex items-center gap-3">
          <img
            src="https://leanvibe.io/favicon-32x32.png"
            alt="LeanVibe"
            className="h-6 w-6"
            loading="lazy"
          />
          <a
            href="https://leanvibe.io/pt/vibe/notipus-mm1nkaz5"
            title={t("footerLeanVibeTitle")}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:text-primary transition-colors"
          >
            {t("footerLeanVibeLabel")}
          </a>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
