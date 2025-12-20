import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import WorkerCard from "@/components/WorkerCard";
import WorkerDetailModal from "@/components/WorkerDetailModal";
import { useSupervisorData } from "@/hooks/useSupervisorData";
import { Users, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const SupervisorDashboard = () => {
  const { workers, isLoading } = useSupervisorData();
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <DashboardLayout title="Supervisor Dashboard">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  const stats = {
    total: workers.length,
    safe: workers.filter((w) => w.latestStatus === "safe").length,
    warning: workers.filter((w) => w.latestStatus === "warning").length,
    emergency: workers.filter((w) => w.latestStatus === "emergency").length,
  };

  return (
    <DashboardLayout title="Supervisor Dashboard">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="industrial-card p-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Workers</p>
            </div>
          </div>
        </div>
        <div className="industrial-card p-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-safe/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-safe" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-safe">{stats.safe}</p>
              <p className="text-xs text-muted-foreground">Safe</p>
            </div>
          </div>
        </div>
        <div className="industrial-card p-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-warning">{stats.warning}</p>
              <p className="text-xs text-muted-foreground">Warning</p>
            </div>
          </div>
        </div>
        <div className="industrial-card p-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emergency/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-emergency" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-emergency">{stats.emergency}</p>
              <p className="text-xs text-muted-foreground">Emergency</p>
            </div>
          </div>
        </div>
      </div>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workers.map((worker, index) => (
          <WorkerCard
            key={worker.id}
            worker={worker}
            onClick={() => setSelectedWorkerId(worker.id)}
            delay={index * 0.1}
          />
        ))}
      </div>

      {workers.length === 0 && (
        <div className="industrial-card p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Workers Assigned</h3>
          <p className="text-muted-foreground">Workers will appear here once assigned by an admin.</p>
        </div>
      )}

      {/* Worker Detail Modal */}
      {selectedWorkerId && (
        <WorkerDetailModal
          workerId={selectedWorkerId}
          onClose={() => setSelectedWorkerId(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default SupervisorDashboard;
