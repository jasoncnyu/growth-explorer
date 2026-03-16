import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useParams, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import TheoryPage from "./pages/TheoryPage";
import GuidePage from "./pages/GuidePage";
import NotFound from "./pages/NotFound";
import { SUPPORTED_LOCALES, setLocale, getDefaultLocale, type Locale } from "@/lib/i18n";

const queryClient = new QueryClient();

const baseUrl = "https://gdp.simlab.me";
const localeCodes = SUPPORTED_LOCALES.map((l) => l.code);
const localePattern = new RegExp(`^/(${localeCodes.join("|")})(?=/|$)`);

const HreflangManager = ({ locale }: { locale: Locale }) => {
  const location = useLocation();

  useEffect(() => {
    const normalized = location.pathname.replace(localePattern, "") || "/";
    const pagePath = normalized.startsWith("/") ? normalized : `/${normalized}`;

    document.documentElement.lang = locale;

    const head = document.head;
    head.querySelectorAll('link[rel="alternate"][data-hreflang="1"]').forEach((n) => n.remove());
    head.querySelectorAll('link[rel="canonical"][data-canonical="1"]').forEach((n) => n.remove());

    const addAlt = (hreflang: string, href: string) => {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = hreflang;
      link.href = href;
      link.setAttribute("data-hreflang", "1");
      head.appendChild(link);
    };

    const addCanonical = (href: string) => {
      const link = document.createElement("link");
      link.rel = "canonical";
      link.href = href;
      link.setAttribute("data-canonical", "1");
      head.appendChild(link);
    };

    for (const code of localeCodes) {
      const href = `${baseUrl}/${code}${pagePath === "/" ? "/" : pagePath}`;
      addAlt(code, href);
    }

    addAlt("x-default", `${baseUrl}/en${pagePath === "/" ? "/" : pagePath}`);
    addCanonical(`${baseUrl}/${locale}${pagePath === "/" ? "/" : pagePath}`);
  }, [location.pathname, locale]);

  return null;
};

const RootRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const target = getDefaultLocale();
    navigate(`/${target}/`, { replace: true });
  }, [navigate]);

  return null;
};

const LocaleRoutes = () => {
  const { lang } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const locale = (lang && localeCodes.includes(lang)) ? (lang as Locale) : "en";

  useEffect(() => {
    if (!lang || !localeCodes.includes(lang)) {
      navigate(`/en${location.pathname.replace(localePattern, "") || "/"}`, { replace: true });
      return;
    }
    setLocale(locale);
  }, [lang, locale, navigate, location.pathname]);

  return (
    <>
      <HreflangManager locale={locale} />
      <Routes>
        <Route index element={<Index />} />
        <Route path="theory" element={<TheoryPage />} />
        <Route path="guide" element={<GuidePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/:lang/*" element={<LocaleRoutes />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
