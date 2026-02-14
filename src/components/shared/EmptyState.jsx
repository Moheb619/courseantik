import { cn } from "@/utils/cn";
import { Inbox } from "lucide-react";

/**
 * EmptyState — Shown when a list/page has no data
 */
const EmptyState = ({
  icon: Icon = Inbox,
  title = "Nothing here yet",
  description = "Check back later!",
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className,
      )}
    >
      <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 animate-bounce-in">
        <Icon className="w-10 h-10 text-primary" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-sm mb-6">
        {description}
      </p>
      {action && action}
    </div>
  );
};

export default EmptyState;
