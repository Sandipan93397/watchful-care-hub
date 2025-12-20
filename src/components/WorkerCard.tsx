import React from "react";
import HealthStatusBadge from "./HealthStatusBadge";
import { Button } from "@/components/ui/button";
import { User, Heart, Thermometer, ToggleLeft, ToggleRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WorkerData {
  id: string;
  worker_id: string;
  name: string;
  age: number;
  health_issues: string | null;
  is_active: boolean;
  latestStatus: "safe" | "warning" | "emergency";
  latestHeartRate?: number;
  latestTemp?: number;
}

interface WorkerCardProps {
  worker: WorkerData;
  onClick: () => void;
  delay?: number;
  showControls?: boolean;
  onToggleActive?: () => void;
}

const WorkerCard: React.FC<WorkerCardProps> = ({ worker, onClick, delay = 0, showControls, onToggleActive }) => {
  const { toast } = useToast();

  const toggleActive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const { error } = await supabase.from("workers").update({ is_active: !worker.is_active }).eq("id", worker.id);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ title: worker.is_active ? "Worker Deactivated" : "Worker Activated" });
      onToggleActive?.();
    }
  };

  return (
    <div onClick={onClick} className={`industrial-card p-5 cursor-pointer transition-all hover:border-primary/50 animate-fade-in ${!worker.is_active ? "opacity-50" : ""}`} style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{worker.name}</h3>
            <p className="text-xs text-muted-foreground">ID: {worker.worker_id}</p>
          </div>
        </div>
        <HealthStatusBadge status={worker.latestStatus} size="sm" />
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Heart className="w-4 h-4 text-emergency" />
          <span>{worker.latestHeartRate || "--"} BPM</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Thermometer className="w-4 h-4 text-warning" />
          <span>{worker.latestTemp || "--"}°C</span>
        </div>
      </div>
      {showControls && (
        <Button variant="ghost" size="sm" onClick={toggleActive} className="mt-3 w-full">
          {worker.is_active ? <ToggleRight className="w-4 h-4 mr-2 text-safe" /> : <ToggleLeft className="w-4 h-4 mr-2" />}
          {worker.is_active ? "Active" : "Inactive"}
        </Button>
      )}
    </div>
  );
};

export default WorkerCard;
