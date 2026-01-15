import { useEffect, useState } from "react";
import { type UiLangCode } from "../utils/detectUiLanguage";
import { t } from "../i18n";
import { LessonService } from "../api/services/lessonService";
import "./learningPath.css";

import readingIcon from "../assets/icons/reading/reading_256px.png";
import vocabIcon from "../assets/icons/vocabulary/vocabulary_256px.png";
import writingIcon from "../assets/icons/writing/writing_1/writing_1_256px.png";

// Пороги уровней, соответствующие бэкенду
const ELO_THRESHOLDS: Record<string, number> = {
  A1: 100,
  A2: 300,
  B1: 600,
  B2: 1000,
  C1: 1400,
  C2: 1900,
};

// Максимальное значение для расчета общего прогресса
const MAX_SYSTEM_ELO = 1900;

interface Props {
  uiLanguage: UiLangCode;
  learningLevel: string | null;
  onOpenPath: (topicId: string) => void;
}

interface DashboardStats {
  elo: number;
  level: string;
  reading_elo: number;
  vocabulary_elo: number;
  writing_elo: number;
}

export const DashboardScreen = ({
  uiLanguage,
  learningLevel,
  onOpenPath,
}: Props) => {
  const [stats, setStats] = useState<DashboardStats>({ 
    elo: 0, 
    level: "A1",
    reading_elo: 0,
    vocabulary_elo: 0,
    writing_elo: 0
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const s: any = await LessonService.getStats();
        
        // Логирование ответа сервера для отладки
        console.log("Server stats response:", s);
        
        setStats({
            elo: s.elo || 0,
            level: s.level || "A1",
            // Проверяем ключи 'reading_elo' (стандарт) и 'reading' (как в Python dict)
            // Если данных нет, используем 0
            reading_elo: s.reading_elo ?? s.reading ?? 0,
            vocabulary_elo: s.vocabulary_elo ?? s.vocabulary ?? 0,
            writing_elo: s.writing_elo ?? s.writing ?? 0,
        });
      } catch (e) {
        console.error("Failed to load dashboard stats", e);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  // Расчет прогресса для конкретного навыка
  const calculateProgressForElo = (elo: number) => {
    const sortedLevels = Object.entries(ELO_THRESHOLDS).sort((a, b) => a[1] - b[1]);
    
    let start = 0;
    let end = sortedLevels[0][1];
    let currentLevelLabel = "A1"; 

    // Определяем диапазон уровня для текущего ELO
    let found = false;
    for (let i = 0; i < sortedLevels.length; i++) {
      const threshold = sortedLevels[i][1];
      if (elo < threshold) {
        end = threshold;
        if (i > 0) {
            start = sortedLevels[i-1][1];
            currentLevelLabel = sortedLevels[i-1][0];
        } else {
            start = 0;
            currentLevelLabel = "Pre-A1";
        }
        found = true;
        break;
      }
    }

    if (!found) {
        start = sortedLevels[sortedLevels.length - 1][1];
        end = start + 500;
        currentLevelLabel = "C2";
    }

    const range = end - start;
    const gained = Math.max(0, elo - start);
    // Минимум 5% для визуального отображения
    const percent = Math.min((gained / range) * 100, 100); 

    return { 
        percent, 
        label: `${Math.round(elo)} / ${end}`,
        levelLabel: currentLevelLabel
    };
  };

  // Расчет общего прогресса
  const getTotalProgressInfo = () => {
     const percent = Math.min((stats.elo / MAX_SYSTEM_ELO) * 100, 100);
     return { percent, label: `Total ELO: ${Math.round(stats.elo)}` };
  };

  const totalInfo = getTotalProgressInfo();

  // Компонент отрисовки карандаша
  const renderPencil = (percent: number, label: string, color: string, size: "small" | "large") => {
    return (
      <div className={`lp-pencil-widget ${size === "large" ? "lp-pencil-large" : "lp-pencil-small"}`}>
        <div className="lp-pw-eraser"></div>
        <div className="lp-pw-metal"></div>
        <div className="lp-pw-body">
          <div 
            className="lp-pw-fill" 
            style={{ width: `${Math.max(percent, 5)}%`, backgroundColor: color }} 
          />
          <div className="lp-pw-text">{label}</div>
        </div>
        <div className="lp-pw-wood"></div>
        <div className="lp-pw-lead"></div>
      </div>
    );
  };

  const TOPICS = [
    {
      id: "reading",
      title: t(uiLanguage, "dashboard.reading"),
      icon: readingIcon,
      color: "#3b82f6",
      currentElo: stats.reading_elo,
    },
    {
      id: "vocabulary",
      title: t(uiLanguage, "dashboard.vocabulary"),
      icon: vocabIcon,
      color: "#8b5cf6",
      currentElo: stats.vocabulary_elo,
    },
    {
      id: "writing",
      title: t(uiLanguage, "dashboard.writing"),
      icon: writingIcon,
      color: "#f59e0b",
      currentElo: stats.writing_elo,
    },
  ];

  return (
    <div className="lp-container">
      <div className="lp-header">
        <h1 className="lp-main-title">
          {t(uiLanguage, "dashboard.title")} {learningLevel}
        </h1>
        <p className="lp-subtitle">{t(uiLanguage, "dashboard.subtitle")}</p>
      </div>

      <div className="lp-grid">
        {TOPICS.map((topic) => {
          const progressInfo = calculateProgressForElo(topic.currentElo);
          
          return (
            <div
                key={topic.id}
                className="lp-card"
                onClick={() => onOpenPath(topic.id)}
            >
                <div className="lp-card-top">
                    <div className="lp-icon-wrapper">
                        <img src={topic.icon} alt={topic.title} className="lp-icon" />
                    </div>
                    <div className="lp-info">
                        <div className="lp-title">{topic.title}</div>
                        <div className="lp-level">
                            {t(uiLanguage, "dashboard.level")} {progressInfo.levelLabel}
                        </div>
                    </div>
                    <div className="lp-arrow-btn">›</div>
                </div>

                <div className="lp-progress-section">
                    {renderPencil(
                        progressInfo.percent, 
                        progressInfo.label,
                        topic.color, 
                        "small"
                    )}
                </div>
            </div>
          );
        })}
      </div>

      <div className="lp-footer-action">
         {renderPencil(
            totalInfo.percent, 
            totalInfo.label, 
            "#22c55e",
            "large"
         )}
      </div>
    </div>
  );
};