// src/screens/LearningPathScreen.tsx
import React, { useState } from "react";

type Difficulty = "beginner" | "intermediate" | "advanced";

interface LearningPath {
  id: string;
  title: string;
  language: string;
  difficulty: Difficulty;
  levelsCount: number;
  completedLevels: number;
}

const MOCK_PATHS: LearningPath[] = [
  {
    id: "path-1",
    title: "Basic Grammar & Core Vocabulary",
    language: "English",
    difficulty: "beginner",
    levelsCount: 10,
    completedLevels: 3,
  },
  {
    id: "path-2",
    title: "Listening & Everyday Phrases",
    language: "German",
    difficulty: "intermediate",
    levelsCount: 8,
    completedLevels: 1,
  },
];

interface LearningPathsScreenProps {
  onOpenPath: (pathId: string) => void;
  onBack?: () => void; // 👈 появился onBack
}

export const LearningPathsScreen: React.FC<LearningPathsScreenProps> = ({
  onOpenPath,
  onBack,
}) => {
  const [paths] = useState<LearningPath[]>(MOCK_PATHS);

  return (
    <div className="screen">
      {onBack && (
        <button className="back-btn" onClick={onBack}>
          <span>←</span>
          <span>Назад к регистрации</span>
        </button>
      )}

      <h1 className="screen-title">Learning paths</h1>
      <p className="screen-description">
        Моковые маршруты обучения, чтобы показать прогресс и переход к уровням.
      </p>

      <div className="path-list">
        {paths.map((path) => {
          const progress = (path.completedLevels / path.levelsCount) * 100 || 0;

          return (
            <button
              key={path.id}
              onClick={() => onOpenPath(path.id)}
              className="path-card"
            >
              <div className="path-card-header">
                <div>
                  <p className="path-title">{path.title}</p>
                  <p className="path-meta">
                    {path.language} · {path.difficulty} · {path.completedLevels}
                    /{path.levelsCount} levels
                  </p>
                </div>
              </div>

              <div className="path-progress-wrapper">
                <div
                  className="path-progress-bar"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
