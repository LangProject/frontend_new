// src/screens/DashboardScreen.tsx
import type { FC } from "react";
import { useState } from "react";
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
  onOpenPath?: (pathId: string) => void; // делаем опциональным на всякий случай
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

const languageNameFromCode = (code: string | null): string => {
  if (!code) return "Language not set yet";
  switch (code) {
    case "es":
      return "Spanish";
    case "en":
      return "English";
    case "de":
      return "German";
    case "fr":
      return "French";
    default:
      return code.toUpperCase();
  }
};

export const DashboardScreen: FC<DashboardScreenProps> = ({
  uiLanguage,
  learningLanguageCode,
  learningLevel,
  onOpenPath,
}) => {
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);

  const selectedPath = PATHS.find((path) => path.id === selectedPathId) ?? null;

  const languageName = languageNameFromCode(learningLanguageCode);

  const handleStart = () => {
    if (!selectedPathId || !onOpenPath) return;
    onOpenPath(selectedPathId);
  };

  return (
    <div className="dashboard-container">
      {/* блок Learning Paths */}
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
          disabled={!selectedPath || !onOpenPath}
          onClick={handleStart}
          aria-disabled={!selectedPath || !onOpenPath}
        >
          {t(uiLanguage, "dashboard.startTestButton")}
        </PrimaryButton>
      </section>

      {/* блок Summary */}
      <section className="dashboard-section">
        <h2 className="dashboard-section-title">
          {t(uiLanguage, "dashboard.summaryTitle")}
        </h2>

        <ProgressRings />

        <div className="dashboard-summary-caption">
          {languageName} · {learningLevel ?? "Level not set yet"}
        </div>
      </section>
    </div>
  );
};
