import React from "react";
import { LucideIcon } from "lucide-react";

interface SensorDataCardProps {
  title: string;
  value: number | string;
  unit?: string;
  icon: LucideIcon;
  status: "safe" | "warning" | "emergency";
  delay?: number;
}

const SensorDataCard: React.FC<SensorDataCardProps> = ({ title, value, unit, icon: Icon, status, delay = 0 }) => {
  const statusColors = {
    safe: "border-safe/50 bg-safe/5",
    warning: "border-warning/50 bg-warning/5",
    emergency: "border-emergency/50 bg-emergency/5",
  };

  const iconColors = {
    safe: "text-safe",
    warning: "text-warning",
    emergency: "text-emergency",
  };

  return (
    <div className={`industrial-card p-5 ${statusColors[status]} animate-fade-in`} style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-start justify-between mb-3">
        <Icon className={`w-6 h-6 ${iconColors[status]}`} />
        <div className={`w-2 h-2 rounded-full status-${status} status-pulse`} />
      </div>
      <p className="data-label mb-1">{title}</p>
      <p className="data-value text-foreground">
        {value}
        {unit && <span className="text-sm text-muted-foreground ml-1">{unit}</span>}
      </p>
    </div>
  );
};

export default SensorDataCard;
