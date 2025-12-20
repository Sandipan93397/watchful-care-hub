import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import WorkerCard from "@/components/WorkerCard";
import WorkerDetailModal from "@/components/WorkerDetailModal";
import RegisterWorkerForm from "@/components/RegisterWorkerForm";
import { useSupervisorData } from "@/hooks/useSupervisorData";
import { Users, AlertTriangle, CheckCircle, AlertCircle, UserPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const SupervisorDashboard = () => {
  const { workers, isLoading, refetch } = useSupervisorData();
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

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
      {/* Decorative arch header */}
      <div className="relative mb-8">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-64 h-8 rounded-t-full border-2 border-primary/20 border-b-0" />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="arch-card p-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-t-lg rounded-b-md bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Workers</p>
            </div>
          </div>
        </div>
        <div className="arch-card p-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-t-lg rounded-b-md bg-safe/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-safe" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-safe">{stats.safe}</p>
              <p className="text-xs text-muted-foreground">Safe</p>
            </div>
          </div>
        </div>
        <div className="arch-card p-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-t-lg rounded-b-md bg-warning/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-warning">{stats.warning}</p>
              <p className="text-xs text-muted-foreground">Warning</p>
            </div>
          </div>
        </div>
        <div className="arch-card p-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-t-lg rounded-b-md bg-emergency/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-emergency" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-emergency">{stats.emergency}</p>
              <p className="text-xs text-muted-foreground">Emergency</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-end mb-6">
        <Button
          onClick={() => setShowRegisterForm(true)}
          className="bg-primary hover:bg-primary/90 rounded-t-xl rounded-b-lg"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Register Worker
        </Button>
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
        <div className="arch-card p-12 text-center">
          <div className="w-20 h-20 rounded-t-full rounded-b-lg bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Workers Assigned</h3>
          <p className="text-muted-foreground mb-4">Register a new worker to get started.</p>
          <Button onClick={() => setShowRegisterForm(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Register Worker
          </Button>
        </div>
      )}

      {/* Worker Detail Modal */}
      {selectedWorkerId && (
        <WorkerDetailModal
          workerId={selectedWorkerId}
          onClose={() => setSelectedWorkerId(null)}
        />
      )}

      {/* Register Worker Form - Supervisor Mode */}
      {showRegisterForm && (
        <RegisterWorkerForm
          onClose={() => setShowRegisterForm(false)}
          onSuccess={() => {
            setShowRegisterForm(false);
            refetch();
          }}
          isSupervisorMode={true}
        />
      )}
    </DashboardLayout>
  );
};

export default SupervisorDashboard;
