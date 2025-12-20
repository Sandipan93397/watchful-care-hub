import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import WorkerCard from "@/components/WorkerCard";
import WorkerDetailModal from "@/components/WorkerDetailModal";
import RegisterWorkerForm from "@/components/RegisterWorkerForm";
import { useAdminData } from "@/hooks/useAdminData";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  UserPlus,
  Shield,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Settings,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const AdminDashboard = () => {
  const { workers, supervisors, isLoading, refetch } = useAdminData();
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  if (isLoading) {
    return (
      <DashboardLayout title="Admin Dashboard">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
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
    supervisors: supervisors.length,
  };

  return (
    <DashboardLayout title="Admin Dashboard">
      {/* Decorative arch header */}
      <div className="relative mb-8">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-64 h-8 rounded-t-full border-2 border-primary/20 border-b-0" />
      </div>

      {/* Stats Overview with arch styling */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="arch-card p-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-t-lg rounded-b-md bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Workers</p>
            </div>
          </div>
        </div>
        <div className="arch-card p-4 animate-fade-in" style={{ animationDelay: "0.05s" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-t-lg rounded-b-md bg-accent/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-foreground">{stats.supervisors}</p>
              <p className="text-xs text-muted-foreground">Supervisors</p>
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
        <div className="arch-card p-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
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
        <div className="arch-card p-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
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

      {/* Main Content Tabs */}
      <Tabs defaultValue="workers" className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <TabsList className="bg-secondary/50 border border-border rounded-t-xl rounded-b-lg">
            <TabsTrigger value="workers" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-t-lg">
              <Users className="w-4 h-4 mr-2" />
              Workers
            </TabsTrigger>
            <TabsTrigger value="supervisors" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Shield className="w-4 h-4 mr-2" />
              Supervisors
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-t-lg">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <Button
            onClick={() => setShowRegisterForm(true)}
            className="bg-primary hover:bg-primary/90 rounded-t-xl rounded-b-lg"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Register Worker
          </Button>
        </div>

        <TabsContent value="workers" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workers.map((worker, index) => (
              <WorkerCard
                key={worker.id}
                worker={worker}
                onClick={() => setSelectedWorkerId(worker.id)}
                delay={index * 0.05}
                showControls
                onToggleActive={() => refetch()}
              />
            ))}
          </div>
          {workers.length === 0 && (
            <div className="arch-card p-12 text-center">
              <div className="w-20 h-20 rounded-t-full rounded-b-lg bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Workers Registered</h3>
              <p className="text-muted-foreground mb-4">Click "Register Worker" to get started.</p>
              <Button onClick={() => setShowRegisterForm(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Register Worker
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="supervisors" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supervisors.map((supervisor, index) => (
              <div
                key={supervisor.id}
                className="arch-card p-6 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-t-xl rounded-b-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{supervisor.name}</h3>
                    <p className="text-sm text-muted-foreground">ID: {supervisor.supervisor_id}</p>
                    {supervisor.department && (
                      <p className="text-xs text-muted-foreground">{supervisor.department}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {supervisors.length === 0 && (
            <div className="arch-card p-12 text-center">
              <div className="w-20 h-20 rounded-t-full rounded-b-lg bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Supervisors</h3>
              <p className="text-muted-foreground">Supervisors will appear here once registered.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <div className="arch-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">System Settings</h3>
            <p className="text-muted-foreground">
              System configuration options will be available here.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Worker Detail Modal */}
      {selectedWorkerId && (
        <WorkerDetailModal
          workerId={selectedWorkerId}
          onClose={() => setSelectedWorkerId(null)}
        />
      )}

      {/* Register Worker Form */}
      {showRegisterForm && (
        <RegisterWorkerForm
          supervisors={supervisors}
          onClose={() => setShowRegisterForm(false)}
          onSuccess={() => {
            setShowRegisterForm(false);
            refetch();
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
