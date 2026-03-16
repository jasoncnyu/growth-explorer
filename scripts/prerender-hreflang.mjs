import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";

const baseUrl = "https://gdp.simlab.me";
const locales = ["en", "es", "ko", "zh", "ja", "fr", "de", "ar", "id", "pt", "hi"];
const paths = ["/", "/theory", "/guide"];

const distDir = resolve("dist");
const baseHtmlPath = resolve(distDir, "index.html");
const baseHtml = readFileSync(baseHtmlPath, "utf-8");

const buildLinks = (locale, pagePath) => {
  const normalized = pagePath === "/" ? "/" : pagePath;
  const links = [];
  for (const code of locales) {
    const href = `${baseUrl}/${code}${normalized === "/" ? "/" : normalized}`;
    links.push(
      `<link rel="alternate" hreflang="${code}" href="${href}" data-hreflang="1">`,
    );
  }
  links.push(
    `<link rel="alternate" hreflang="x-default" href="${baseUrl}/en${normalized === "/" ? "/" : normalized}" data-hreflang="1">`,
  );
  links.push(
    `<link rel="canonical" href="${baseUrl}/${locale}${normalized === "/" ? "/" : normalized}" data-canonical="1">`,
  );
  return links.join("\n    ");
};

const replaceLang = (html, locale) =>
  html.replace(/<html\b([^>]*)\blang="[^"]*"/, `<html$1 lang="${locale}"`);

for (const locale of locales) {
  for (const pagePath of paths) {
    const relDir = pagePath === "/" ? locale : `${locale}${pagePath}`;
    const outPath = resolve(distDir, relDir, "index.html");
    const links = buildLinks(locale, pagePath);
    const withLang = replaceLang(baseHtml, locale);
    const withLinks = withLang.replace("</head>", `    ${links}\n  </head>`);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, withLinks, "utf-8");
  }
}

console.log("Prerendered hreflang/canonical HTML files.");
