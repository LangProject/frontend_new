// src/screens/DashboardScreen.tsx
import { useState, type FC } from "react";
import { PrimaryButton } from "../components/PrimaryButton";
import {
  LearningPathCard,
  type LearningPath,
} from "../components/LearningPathCard";
import { ProgressRings } from "../components/ProgressRings";
import { t } from "../i18n";
import type { UiLangCode } from "../utils/detectUiLanguage";

interface DashboardScreenProps {
  uiLanguage: UiLangCode;
  learningLanguageCode: string | null;
  learningLevel: string | null;
  onStartLesson: (lessonId: string) => void;
}

const PATHS: LearningPath[] = [
  {
    id: "reading",
    title: "Reading",
    level: "Level C1",
    current: 2,
    total: 5,
  },
  {
    id: "vocabulary",
    title: "Vocabulary",
    level: "Level B2",
    current: 4,
    total: 5,
  },
  {
    id: "writing",
    title: "Writing",
    level: "Level A1",
    current: 3,
    total: 5,
  },
];

export const DashboardScreen: FC<DashboardScreenProps> = ({
  uiLanguage,
  learningLanguageCode,
  learningLevel,
  onStartLesson,
}) => {
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);

  const selectedPath = PATHS.find((p) => p.id === selectedPathId) ?? null;
  const canStartTest = Boolean(selectedPath);

  const languageName =
    {
      en: "English",
      de: "German",
      es: "Spanish",
      fr: "French",
      pl: "Polish",
    }[learningLanguageCode ?? "en"] || "English";

  const handleStartTest = () => {
    if (!selectedPath) return;

    // пока что любая выбранная ветка запускает один и тот же урок
    onStartLesson("spanish_basic_1");
  };

  return (
    <>
      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <h2 className="dashboard-section-title">
            {t(uiLanguage, "dashboard.learningPathsTitle")}
          </h2>
          <span className="dashboard-section-info">i</span>
        </div>

        <div className="lp-row">
          {PATHS.map((path) => (
            <LearningPathCard
              key={path.id}
              path={path}
              selected={path.id === selectedPathId}
              onSelect={() => setSelectedPathId(path.id)}
            />
          ))}
        </div>

        <PrimaryButton
          disabled={!canStartTest}
          onClick={handleStartTest}
          aria-disabled={!canStartTest}
        >
          Start Test
        </PrimaryButton>
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">
          {t(uiLanguage, "dashboard.summaryTitle")}
        </h2>

        <ProgressRings />

        <div className="dashboard-summary-caption">
          {languageName} · {learningLevel ?? "Level not set yet"}
        </div>
      </section>
    </>
  );
};
