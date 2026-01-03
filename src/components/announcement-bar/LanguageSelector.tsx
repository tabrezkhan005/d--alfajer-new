"use client";

import { Languages } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

interface LanguageSelectorProps {
  language: string;
  onLanguageChange: (language: string) => void;
}

const languages = [
  { code: "EN", name: "English", native: "English" },
  { code: "AR", name: "Arabic", native: "العربية" },
  { code: "HI", name: "Hindi", native: "हिन्दी" },
];

export const LanguageSelector = ({
  language,
  onLanguageChange,
}: LanguageSelectorProps) => {
  const currentLanguage =
    languages.find((l) => l.code === language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs font-normal text-[#FEFEFE]/90 hover:text-[#FEFEFE] hover:bg-[#FEFEFE]/10"
          style={{ fontFamily: "var(--font-sans)" }}
          aria-label="Select language"
        >
          <Languages className="mr-1.5 h-3 w-3" />
          <span className="hidden sm:inline">{currentLanguage.code}</span>
          <span className="sm:hidden">{currentLanguage.native}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className={language === lang.code ? "bg-accent" : ""}
          >
            <span className="mr-2">{lang.native}</span>
            <span className="text-muted-foreground">({lang.name})</span>
            {language === lang.code && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
