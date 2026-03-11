import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUPPORTED_LOCALES, type Locale } from "@/lib/i18n";
import { Globe } from "lucide-react";

interface LanguageSelectorProps {
  value: Locale;
  onChange: (locale: Locale) => void;
}

const LanguageSelector = ({ value, onChange }: LanguageSelectorProps) => (
  <div className="flex items-center gap-2">
    <Globe className="h-4 w-4 text-muted-foreground" />
    <Select value={value} onValueChange={(v) => onChange(v as Locale)}>
      <SelectTrigger className="w-[140px] h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_LOCALES.map((l) => (
          <SelectItem key={l.code} value={l.code} className="text-xs">
            {l.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default LanguageSelector;
