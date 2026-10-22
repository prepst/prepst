"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Zap, Target } from "lucide-react";
import { LineChart } from "@/components/charts/LineChart";
import type { LearningVelocityAnalytics } from "@/lib/types";

interface LearningVelocityCardProps {
  data: LearningVelocityAnalytics;
}

export function LearningVelocityCard({ data }: LearningVelocityCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getVelocityColor = (velocity: number) => {
    if (velocity >= 5) return "text-progress";
    if (velocity >= 2) return "text-study";
    if (velocity >= 0) return "text-schedule";
    return "text-destructive";
  };

  const getAccelerationIcon = () => {
    if (data.acceleration > 1.1)
      return <TrendingUp className="w-4 h-4 text-progress" />;
    if (data.acceleration < 0.9)
      return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <Target className="w-4 h-4 text-gray-600" />;
  };

  const getAccelerationText = () => {
    if (data.acceleration > 1.1)
      return `+${Math.round((data.acceleration - 1) * 100)}% faster`;
    if (data.acceleration < 0.9)
      return `${Math.round((1 - data.acceleration) * 100)}% slower`;
    return "Steady pace";
  };

  const getMomentumColor = (score: number) => {
    if (score >= 75) return "text-progress bg-progress-soft";
    if (score >= 50) return "text-study bg-study-soft";
    if (score >= 25) return "text-schedule bg-schedule-soft";
    return "text-destructive bg-destructive-soft";
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-study/25">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-study-soft rounded-full flex items-center justify-center">
            <Zap className="w-6 h-6 text-study" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Learning Velocity</p>
            <p
              className={`text-2xl font-bold ${getVelocityColor(
                data.overall_velocity
              )}`}
            >
              {data.overall_velocity > 0 ? "+" : ""}
              {data.overall_velocity} pts/week
            </p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-study hover:underline"
        >
          {expanded ? "Hide Details" : "View Details"}
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">Momentum Score</p>
          <p
            className={`text-lg font-bold ${
              getMomentumColor(data.momentum_score).split(" ")[0]
            }`}
          >
            {data.momentum_score}/100
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">Acceleration</p>
          <div className="flex items-center gap-1">
            {getAccelerationIcon()}
            <p className="text-sm font-medium text-gray-800">
              {getAccelerationText()}
            </p>
          </div>
        </div>
      </div>

      {/* Velocity Status */}
      <div className="mb-4">
        {data.is_improving ? (
          <div className="flex items-center gap-2 text-progress">
            <TrendingUp className="w-4 h-4" />
            <p className="text-sm font-medium">
              You&apos;re in the {data.velocity_percentile}th percentile for
              learning speed!
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-schedule">
            <Target className="w-4 h-4" />
            <p className="text-sm font-medium">
              Steady progress - keep up the momentum!
            </p>
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="space-y-6">
          {/* Velocity Trend Chart */}
          {data.velocity_trend.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">
                Velocity Trend (Last 4 Weeks)
              </h4>
              <LineChart
                data={data.velocity_trend.map((point) => ({
                  ...point,
                  week: point.week.split("-W")[1], // Show just week number
                }))}
                lines={[
                  {
                    dataKey: "velocity",
                    color: "#1d9bf0",
                    name: "Weekly Improvement",
                  },
                ]}
                xKey="week"
                height={200}
                yLabel="Points"
                formatXAxis={(val) => `W${val}`}
              />
            </div>
          )}

          {/* Top Performing Skills */}
          {data.velocity_by_skill.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">
                Fastest Improving Skills
              </h4>
              <div className="space-y-2">
                {data.velocity_by_skill.slice(0, 5).map((skill, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {skill.skill_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {skill.total_attempts} attempts • {skill.mastery}%
                        mastery
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${getVelocityColor(
                          skill.velocity
                        )}`}
                      >
                        {skill.velocity > 0 ? "+" : ""}
                        {skill.velocity.toFixed(3)}
                      </p>
                      <p className="text-xs text-gray-600 capitalize">
                        {skill.category}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Learning Insights */}
          <div className="bg-study-soft border border-study/25 rounded-lg p-4">
            <h4 className="font-semibold text-study mb-2">
              Learning Insights
            </h4>
            <div className="space-y-2 text-sm text-study">
              {data.overall_velocity > 5 && (
                <p>
                  🚀 <strong>Excellent pace!</strong> You&apos;re learning
                  faster than most students.
                </p>
              )}
              {data.momentum_score > 75 && (
                <p>
                  ⚡ <strong>High momentum!</strong> Your consistent practice is
                  paying off.
                </p>
              )}
              {data.acceleration > 1.2 && (
                <p>
                  📈 <strong>Accelerating!</strong> You&apos;re getting better
                  at learning.
                </p>
              )}
              {data.velocity_by_skill.filter((s) => s.category === "Fast")
                .length > 0 && (
                <p>
                  🎯 <strong>Skill mastery:</strong>{" "}
                  {
                    data.velocity_by_skill.filter((s) => s.category === "Fast")
                      .length
                  }{" "}
                  skills showing rapid improvement.
                </p>
              )}
              {data.overall_velocity < 2 && (
                <p>
                  💡 <strong>Tip:</strong> Try shorter, more frequent study
                  sessions to boost your learning velocity.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
