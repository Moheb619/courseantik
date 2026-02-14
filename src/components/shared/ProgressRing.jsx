import { cn } from "@/utils/cn";

/**
 * ProgressRing — SVG circular progress indicator
 * @param {number} percentage - 0-100
 * @param {number} size - Pixel size of the ring
 * @param {number} strokeWidth - Width of the ring stroke
 */
const ProgressRing = ({
  percentage = 0,
  size = 60,
  strokeWidth = 6,
  className,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className,
      )}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={
            percentage >= 100 ? "hsl(var(--success))" : "hsl(var(--primary))"
          }
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-xs font-bold">
        {Math.round(percentage)}%
      </span>
    </div>
  );
};

export default ProgressRing;
