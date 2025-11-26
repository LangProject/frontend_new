import type { FC } from "react";
import { LanguageCard, type LanguageOption } from "../components/LanguageCard";
import { PrimaryButton } from "../components/PrimaryButton";

// Импортируем флаги (пути под твой проект)
import flagDE from "../assets/flags_png/flag-de.png";
import flagEN from "../assets/flags_png/flag-us.png";
import flagES from "../assets/flags_png/flag-es.png";
import flagFR from "../assets/flags_png/flag-fr.png";
import flagPL from "../assets/flags_png/flag-pl.png";

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "de", label: "Deutsch", flagSrc: flagDE },
  { code: "en", label: "English", flagSrc: flagEN },
  { code: "es", label: "Español", flagSrc: flagES },
  { code: "fr", label: "Français", flagSrc: flagFR },
  { code: "pl", label: "Polski", flagSrc: flagPL },
];

interface ChooseLanguageScreenProps {
  selectedCode: string | null;
  onChangeSelected: (code: string) => void;
  onContinue: () => void;
}

export const ChooseLanguageScreen: FC<ChooseLanguageScreenProps> = ({
  selectedCode,
  onChangeSelected,
  onContinue,
}) => {
  const hasSelection = Boolean(selectedCode);

  return (
    <>
      <div className="page-title">Choose your language</div>

      <div className="language-list">
        {LANGUAGE_OPTIONS.map((option) => (
          <LanguageCard
            key={option.code}
            option={option}
            selected={option.code === selectedCode}
            hasSelection={hasSelection}
            onSelect={() => onChangeSelected(option.code)}
          />
        ))}
      </div>

      <PrimaryButton
        disabled={!selectedCode}
        onClick={onContinue}
        aria-disabled={!selectedCode}
      >
        Continue
      </PrimaryButton>
    </>
  );
};
