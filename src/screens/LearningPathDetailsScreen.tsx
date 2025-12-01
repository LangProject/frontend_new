// src/screens/LearningPathDetailsScreen.tsx
import React, { useState } from "react";
import { LevelCard } from "../components/LevelCard";

interface Level {
  id: string;
  title: string;
  description: string;
  xp: number;
  isCompleted: boolean;
}

const MOCK_LEVELS: Level[] = [
  {
    id: "lvl-1",
    title: "Present Simple",
    description: "Собери правильное предложение из слов. 5 примеров.",
    xp: 10,
    isCompleted: false,
  },
  {
    id: "lvl-2",
    title: "to be / there is / there are",
    description: "Выбери правильный вариант из 4. 8 вопросов.",
    xp: 12,
    isCompleted: false,
  },
  {
    id: "lvl-3",
    title: "Basic vocabulary: home & family",
    description: "Матчинг карточек: слово — перевод. 10 карточек.",
    xp: 15,
    isCompleted: false,
  },
];

interface LearningPathDetailsScreenProps {
  pathTitle: string;
  onBack: () => void;
}

export const LearningPathDetailsScreen: React.FC<
  LearningPathDetailsScreenProps
> = ({ pathTitle, onBack }) => {
  const [levels, setLevels] = useState<Level[]>(MOCK_LEVELS);

  const completedCount = levels.filter((l) => l.isCompleted).length;
  const progress = (completedCount / levels.length) * 100 || 0;

  const handleCompleteLevel = (id: string) => {
    setLevels((prev) =>
      prev.map((lvl) => (lvl.id === id ? { ...lvl, isCompleted: true } : lvl))
    );
  };

  return (
    <div className="screen">
      <button className="back-btn" onClick={onBack}>
        <span>←</span>
        <span>Назад к списку путей</span>
      </button>

      <h1 className="screen-title">{pathTitle}</h1>
      <p className="screen-description">
        Заглушка с уровнями. Нажимай «Пройти уровень», чтобы показать прогресс и
        анимацию.
      </p>

      <div className="path-progress">
        <div className="path-progress-info">
          <span>
            Progress · {completedCount}/{levels.length} levels
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="path-progress-bar-wrapper">
          <div
            className="path-progress-bar-big"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {levels.map((level) => (
        <LevelCard
          key={level.id}
          title={level.title}
          description={level.description}
          xp={level.xp}
          isCompleted={level.isCompleted}
          onComplete={() => handleCompleteLevel(level.id)}
        />
      ))}
    </div>
  );
};
