import React, { useEffect, useState } from "react";

interface LevelCardProps {
  title: string;
  description: string;
  xp: number;
  isCompleted: boolean;
  onComplete: () => void;
}

export const LevelCard: React.FC<LevelCardProps> = ({
  title,
  description,
  xp,
  isCompleted,
  onComplete,
}) => {
  const [justCompleted, setJustCompleted] = useState(false);

  useEffect(() => {
    if (isCompleted) {
      setJustCompleted(true);
      const t = setTimeout(() => setJustCompleted(false), 1200);
      return () => clearTimeout(t);
    }
  }, [isCompleted]);

  return (
    <div className="level-card">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <p className="level-title">{title}</p>
          <p className="level-description">{description}</p>
          <p className="level-xp">{xp} XP</p>
        </div>

        <button
          className="level-btn"
          disabled={isCompleted}
          onClick={onComplete}
        >
          {isCompleted ? "Completed" : "Пройти уровень"}
        </button>
      </div>

      <div className="level-progress">
        <div
          className="level-progress-bar"
          style={{ width: isCompleted ? "100%" : "0%" }}
        />
      </div>

      {justCompleted && <div className="level-xp-popup">+{xp} XP</div>}
    </div>
  );
};
