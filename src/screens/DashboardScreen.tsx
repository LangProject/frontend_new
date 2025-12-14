import { useEffect, useState } from "react";
import { getStats, type UserStats } from "../store/progressStore";
import { t } from "../i18n";
import type { UiLangCode } from "../utils/detectUiLanguage";
import "./learningPath.css";

interface DashboardScreenProps {
  uiLanguage: UiLangCode;
  learningLanguageCode: string | null;
  learningLevel: string | null;
  onOpenPath?: (pathId: string) => void;
}

export const DashboardScreen = ({
  uiLanguage,
  learningLanguageCode,
  learningLevel, // Получаем уровень (например, "A1")
  onOpenPath,
}: DashboardScreenProps) => {
  const [stats, setStats] = useState<UserStats>(getStats());

  useEffect(() => {
    const handleUpdate = () => setStats(getStats());
    window.addEventListener("storage-update", handleUpdate);
    return () => window.removeEventListener("storage-update", handleUpdate);
  }, []);

  // Формируем красивое название уровня, например "Level A1"
  // Если уровень не выбран, пишем "A1" по умолчанию
  const displayLevel = learningLevel ? `Level ${learningLevel}` : "Level A1";

  const paths = [
    {
      id: "reading",
      title: "Reading",
      level: displayLevel, // 👇 Теперь здесь будет то, что выбрал юзер
      total: 3, // У нас в lessonsData по 3 урока
      current: stats.completedLessons.filter((id) => id.startsWith("reading"))
        .length,
    },
    {
      id: "vocabulary",
      title: "Vocabulary",
      level: displayLevel, // 👇 И здесь
      total: 3,
      current: stats.completedLessons.filter((id) => id.startsWith("vocab"))
        .length,
    },
    {
      id: "writing",
      title: "Writing",
      level: displayLevel, // 👇 И здесь
      total: 3,
      current: stats.completedLessons.filter((id) => id.startsWith("writing"))
        .length,
    },
  ];

  const GOAL_WORDS = 500;
  const GOAL_MINS = 90;
  const GOAL_STREAK = 7;

  return (
    <div className="dashboard-container">
      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <h2 className="dashboard-section-title">Learning Paths</h2>
          <div className="info-icon">i</div>
        </div>

        <div className="lp-list">
          {paths.map((path) => {
            const rawPercent = (path.current / path.total) * 100;
            const percent = Math.min(Math.round(rawPercent), 100);

            return (
              <div
                key={path.id}
                className="lp-card"
                onClick={() => onOpenPath?.(path.id)}
              >
                <div className="lp-card-header">
                  <div className="lp-title">{path.title}</div>
                  <div className="lp-level">{path.level}</div>
                </div>
                <div className="lp-progress-row">
                  <div className="lp-counter">
                    {path.current}/{path.total}
                  </div>
                  <div className="lp-track">
                    <div
                      className="lp-fill"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
                <div className="lp-percent-text">{percent}%</div>
              </div>
            );
          })}
        </div>

        <div className="start-btn-container">
          <button
            className="big-start-btn"
            onClick={() => onOpenPath?.("reading")}
          >
            Start Test
          </button>
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">Summary</h2>
        <div className="summary-card">
          <div className="rings-wrapper">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <StatsArc r={50} color="#e5e7eb" pct={1} width={8} />
              <StatsArc r={35} color="#e5e7eb" pct={1} width={8} />
              <StatsArc r={20} color="#e5e7eb" pct={1} width={8} />

              <StatsArc
                r={50}
                color="#58cc02"
                pct={stats.totalWords / GOAL_WORDS}
                width={8}
              />
              <StatsArc
                r={35}
                color="#3b82f6"
                pct={stats.totalMinutes / GOAL_MINS}
                width={8}
              />
              <StatsArc
                r={20}
                color="#f97316"
                pct={stats.streakDays / GOAL_STREAK}
                width={8}
              />
            </svg>
          </div>
          <div className="stats-legend">
            <StatRow
              color="#58cc02"
              label="Words Learned"
              val={`${stats.totalWords}/${GOAL_WORDS} W`}
            />
            <StatRow
              color="#3b82f6"
              label="Study Minutes"
              val={`${stats.totalMinutes}/${GOAL_MINS} MIN`}
            />
            <StatRow
              color="#f97316"
              label="Streak Days"
              val={`${stats.streakDays}/${GOAL_STREAK} D`}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const StatsArc = ({ r, color, pct, width }: any) => {
  const c = 60;
  const safePct = Math.min(Math.max(pct, 0), 1);
  const dashArray = 2 * Math.PI * r * 0.75;
  const dashOffset = dashArray * (1 - safePct);
  return (
    <circle
      cx={c}
      cy={c}
      r={r}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeDasharray={`${dashArray} 1000`}
      strokeDashoffset={dashOffset}
      transform={`rotate(135 ${c} ${c})`}
    />
  );
};

const StatRow = ({ color, label, val }: any) => (
  <div className="stat-row">
    <div className="stat-dot" style={{ background: color }} />
    <div>
      <div className="stat-label">{label}</div>
      <div className="stat-val">{val}</div>
    </div>
  </div>
);
