import type { FC } from "react";
import { LanguageCard, type LanguageOption } from "../components/LanguageCard";
import { PrimaryButton } from "../components/PrimaryButton";

import flagDE from "../assets/flags_png/flag-de.png";
import flagEN from "../assets/flags_png/flag-us.png";
import flagES from "../assets/flags_png/flag-es.png";
import flagFR from "../assets/flags_png/flag-fr.png";
import flagPL from "../assets/flags_png/flag-pl.png";

const LANGUAGES: LanguageOption[] = [
  { code: "de", label: "German", flagSrc: flagDE },
  { code: "en", label: "English", flagSrc: flagEN },
  { code: "es", label: "Spanish", flagSrc: flagES },
  { code: "fr", label: "French", flagSrc: flagFR },
  { code: "pl", label: "Polish", flagSrc: flagPL },
];

interface ChooseLearningLanguageScreenProps {
  selectedCode: string | null;
  onChangeSelected: (code: string) => void;
  onContinue: () => void;
}

export const ChooseLearningLanguageScreen: FC<
  ChooseLearningLanguageScreenProps
> = ({ selectedCode, onChangeSelected, onContinue }) => {
  const hasSelection = Boolean(selectedCode);

  return (
    <>
      <div className="page-title">Choose a learning language</div>
      <p className="page-subtitle">Select the language you want to study.</p>

      <div className="language-list">
        {LANGUAGES.map((option) => (
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
