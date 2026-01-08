"use client";

import { Languages } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { LANGUAGES } from "@/src/lib/i18n";
import type { Language } from "@/src/lib/i18n";

interface LanguageSelectorProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
}

const languageOptions: Language[] = ["en", "ar", "hi"];

export const LanguageSelector = ({
  language,
  onLanguageChange,
}: LanguageSelectorProps) => {
  const currentLanguageData = LANGUAGES[language];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 xs:h-7 sm:h-8 px-1.5 xs:px-2 sm:px-3 text-[9px] xs:text-[10px] sm:text-xs font-normal text-[#FEFEFE]/90 hover:text-[#FEFEFE] hover:bg-[#FEFEFE]/10 whitespace-nowrap"
          style={{ fontFamily: "var(--font-sans)" }}
          aria-label="Select language"
        >
          <Languages className="mr-0.5 xs:mr-1 h-2.5 xs:h-3 w-2.5 xs:w-3 flex-shrink-0" />
          <span className="hidden sm:inline text-[10px] xs:text-xs">{language.toUpperCase()}</span>
          <span className="sm:hidden text-[8px] xs:text-[9px] truncate">{currentLanguageData.nativeName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 sm:w-52 z-50">
        {languageOptions.map((lang) => {
          const langData = LANGUAGES[lang];
          return (
            <DropdownMenuItem
              key={lang}
              onClick={() => onLanguageChange(lang)}
              className={`cursor-pointer py-2 px-3 text-sm ${language === lang ? "bg-accent font-semibold" : ""}`}
            >
              <span className="mr-2">{langData.nativeName}</span>
              <span className="text-muted-foreground text-xs">({langData.name})</span>
              {language === lang && (
                <span className="ml-auto text-xs">✓</span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
