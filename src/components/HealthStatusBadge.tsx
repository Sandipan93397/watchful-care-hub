import React from "react";

interface HealthStatusBadgeProps {
  status: "safe" | "warning" | "emergency";
  size?: "sm" | "md" | "lg";
}

const HealthStatusBadge: React.FC<HealthStatusBadgeProps> = ({ status, size = "md" }) => {
  const labels = { safe: "Safe", warning: "Warning", emergency: "Emergency" };
  const sizes = { sm: "px-2 py-0.5 text-xs", md: "px-3 py-1 text-sm", lg: "px-4 py-1.5 text-base" };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium status-${status} ${sizes[size]}`}>
      <span className={`w-2 h-2 rounded-full bg-current status-pulse`} />
      {labels[status]}
    </span>
  );
};

export default HealthStatusBadge;
