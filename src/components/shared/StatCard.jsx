import { cn } from "@/utils/cn";

/**
 * StatCard — A cartoon-themed statistics card for dashboards
 * @param {string} label - The stat label
 * @param {string|number} value - The stat value
 * @param {React.ComponentType} icon - Lucide icon component
 * @param {string} color - Tailwind color classes for icon background
 * @param {string} trend - Optional trend text (e.g., "+12%")
 * @param {boolean} trendUp - Whether the trend is positive
 */
const StatCard = ({
  label,
  value,
  icon: Icon,
  color = "bg-primary/10 text-primary",
  trend,
  trendUp = true,
}) => {
  return (
    <div className="bg-white rounded-2xl border-[3px] border-foreground/10 p-5 cartoon-shadow-sm hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_hsl(var(--foreground)/0.15)] transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-black tracking-tight">{value}</p>
          {trend && (
            <p
              className={cn(
                "text-xs font-semibold",
                trendUp ? "text-green-600" : "text-red-500",
              )}
            >
              {trendUp ? "↑" : "↓"} {trend}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center",
              color,
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
