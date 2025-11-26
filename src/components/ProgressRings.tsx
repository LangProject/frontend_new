import type { FC } from "react";

interface Stat {
  id: string;
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  radius: number;
  strokeWidth: number;
}

const STATS: Stat[] = [
  {
    id: "words",
    label: "Words Learned",
    current: 151,
    target: 500,
    unit: "W",
    color: "#22c55e", // зелёное внешнее кольцо
    radius: 58,
    strokeWidth: 10,
  },
  {
    id: "minutes",
    label: "Study Minutes",
    current: 11,
    target: 90,
    unit: "MIN",
    color: "#3b82f6", // синее среднее кольцо
    radius: 44,
    strokeWidth: 10,
  },
  {
    id: "streak",
    label: "Streak Days",
    current: 4,
    target: 7,
    unit: "D",
    color: "#f97316", // оранжевое внутреннее кольцо
    radius: 30,
    strokeWidth: 10,
  },
];

export const ProgressRings: FC = () => {
  const size = 150;
  const center = size / 2;

  return (
    <div className="rings-card">
      <div className="rings-svg-wrapper">
        <svg width={size} height={size}>
          {STATS.map((stat) => {
            const circumference = 2 * Math.PI * stat.radius;
            const progress = Math.max(
              0,
              Math.min(stat.current / stat.target, 1)
            );
            const offset = circumference * (1 - progress);

            return (
              <circle
                key={stat.id}
                cx={center}
                cy={center}
                r={stat.radius}
                fill="transparent"
                stroke={stat.color}
                strokeWidth={stat.strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
      </div>

      <div className="rings-stats">
        {STATS.map((stat) => (
          <div key={stat.id} className="rings-stat-row">
            <span
              className="rings-dot"
              style={{ backgroundColor: stat.color }}
            />
            <div className="rings-stat-text">
              <span className="rings-stat-label">{stat.label}</span>
              <span className="rings-stat-value">
                {stat.current}/{stat.target} {stat.unit}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
