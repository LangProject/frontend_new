import type { FC } from "react";

interface HorizontalProgressBarProps {
  value: number; // сколько выполнено
  max: number; // из скольки
}

export const HorizontalProgressBar: FC<HorizontalProgressBarProps> = ({
  value,
  max,
}) => {
  const clamped = Math.max(0, Math.min(value, max));
  const percent = (clamped / max) * 100;

  return (
    <div className="hp-track">
      <div className="hp-fill" style={{ width: `${percent}%` }} />
    </div>
  );
};
