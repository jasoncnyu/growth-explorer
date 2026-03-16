import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const outIndex = args.indexOf("--out");
const outDir = outIndex >= 0 && args[outIndex + 1] ? args[outIndex + 1] : "public";

const baseUrl = "https://gdp.simlab.me";
const locales = ["en", "es", "ko", "zh", "ja", "fr", "de", "ar", "id", "pt", "hi"];
const paths = ["/", "/theory", "/guide"];
const today = new Date().toISOString().slice(0, 10);

const outPath = resolve(outDir);
mkdirSync(outPath, { recursive: true });

const sitemapIndex = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
];

for (const loc of locales) {
  sitemapIndex.push("  <sitemap>");
  sitemapIndex.push(`    <loc>${baseUrl}/sitemap-${loc}.xml</loc>`);
  sitemapIndex.push(`    <lastmod>${today}</lastmod>`);
  sitemapIndex.push("  </sitemap>");
}
sitemapIndex.push("</sitemapindex>");

writeFileSync(resolve(outPath, "sitemap-index.xml"), sitemapIndex.join("\n"), "utf-8");

for (const loc of locales) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  for (const p of paths) {
    const url = p === "/" ? `${baseUrl}/${loc}/` : `${baseUrl}/${loc}${p}`;
    lines.push("  <url>");
    lines.push(`    <loc>${url}</loc>`);
    lines.push(`    <lastmod>${today}</lastmod>`);
    lines.push("    <changefreq>weekly</changefreq>");
    lines.push("    <priority>0.8</priority>");
    lines.push("  </url>");
  }

  lines.push("</urlset>");
  writeFileSync(resolve(outPath, `sitemap-${loc}.xml`), lines.join("\n"), "utf-8");
}

const robots = [
  "User-agent: *",
  "Allow: /",
  `Sitemap: ${baseUrl}/sitemap-index.xml`,
];
writeFileSync(resolve(outPath, "robots.txt"), robots.join("\n"), "utf-8");

console.log(`Wrote sitemaps and robots.txt to ${outPath}`);
