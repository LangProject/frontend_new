import type { FC } from "react";

export interface LanguageOption {
  code: string;
  label: string;
  flagSrc: string;
}

interface LanguageCardProps {
  option: LanguageOption;
  selected: boolean;
  hasSelection: boolean;
  onSelect: () => void;
}

export const LanguageCard: FC<LanguageCardProps> = ({
  option,
  selected,
  hasSelection,
  onSelect,
}) => {
  let className = "language-card";

  if (selected) {
    className += " language-card-selected";
  } else if (hasSelection) {
    // если уже есть выбранный язык — остальные "тухнут"
    className += " language-card-dim";
  }

  return (
    <button type="button" className={className} onClick={onSelect}>
      <div className="language-card-left">
        <div className="language-card-flag">
          <img src={option.flagSrc} alt={option.label} />
        </div>
        <span className="language-card-label">{option.label}</span>
      </div>

      <div className="language-card-indicator" />
    </button>
  );
};
