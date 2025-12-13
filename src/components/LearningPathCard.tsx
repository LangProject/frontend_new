// src/components/LearningPathCard.tsx
import type { FC } from "react";
import { HorizontalProgressBar } from "./HorizontalProgressBar";

export interface LearningPath {
  id: string;
  title: string;
  level: string;
  current: number;
  total: number;
}

interface LearningPathCardProps {
  path: LearningPath;
  selected: boolean;
  onSelect: () => void;
}

export const LearningPathCard: FC<LearningPathCardProps> = ({
  path,
  selected,
  onSelect,
}) => {
  const percent = Math.round((path.current / path.total) * 100);

  return (
    <button
      type="button"
      className={"lp-card" + (selected ? " lp-card-selected" : "")}
      onClick={onSelect}
    >
      <div className="lp-title">{path.title}</div>
      <div className="lp-level">{path.level}</div>

      <div className="lp-bottom-row">
        <span className="lp-counter">
          {path.current}/{path.total}
        </span>
        <HorizontalProgressBar value={path.current} max={path.total} />
      </div>

      <div className="lp-percent">{percent}%</div>
    </button>
  );
};
