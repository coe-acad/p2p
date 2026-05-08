import { useState } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
];

const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const [selectedLang, setSelectedLang] = useState(i18n.language || "en");

  const handleLanguageChange = (langCode: string) => {
    setSelectedLang(langCode);
    i18n.changeLanguage(langCode);
    localStorage.setItem("preferredLanguage", langCode);
  };

  const currentLang = LANGUAGES.find(l => l.code === selectedLang) || LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-card/60 border border-border/30 hover:bg-secondary transition-all">
          <Globe size={12} className="text-primary" />
          <span className="text-[10px] text-muted-foreground">{currentLang.name}</span>
          <ChevronDown size={10} className="text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 max-h-64 overflow-y-auto bg-card border border-border shadow-lg z-[10000]">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="flex items-center justify-between cursor-pointer hover:bg-secondary py-1.5 px-2"
          >
            <span className="flex items-center gap-1.5">
              <span className="text-xs">{lang.nativeName}</span>
              <span className="text-[10px] text-muted-foreground">({lang.name})</span>
            </span>
            {selectedLang === lang.code && (
              <Check size={12} className="text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageToggle;
