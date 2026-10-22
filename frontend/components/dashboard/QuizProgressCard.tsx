import { Card } from "@/components/ui/card";

type ColorVariant = "pink" | "blue" | "green";

interface QuizProgressCardProps {
  current: number;
  total: number;
  topic: string;
  color?: ColorVariant;
  onClick?: () => void;
}

const colorClasses: Record<ColorVariant, string> = {
  pink: "bg-gradient-to-br from-destructive-soft to-destructive-soft",
  blue: "bg-gradient-to-br from-study-soft to-study-soft",
  green: "bg-gradient-to-br from-progress-soft to-progress-soft",
};

const iconBgClasses: Record<ColorVariant, string> = {
  pink: "bg-destructive-soft/50",
  blue: "bg-study-soft/50",
  green: "bg-progress-soft/50",
};

export function QuizProgressCard({
  current,
  total,
  topic,
  color = "pink",
  onClick,
}: QuizProgressCardProps) {
  return (
    <Card
      className={`${colorClasses[color]} border-0 rounded-3xl p-6 cursor-pointer hover:shadow-md transition-all shadow-sm`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-8">
        <div className={`w-14 h-14 ${iconBgClasses[color]} rounded-2xl`}></div>
      </div>
      <p className="text-sm text-gray-500 mb-1 font-medium">
        {current}/{total} quiz
      </p>
      <h3 className="font-semibold text-gray-900 text-base">{topic}</h3>
    </Card>
  );
}
