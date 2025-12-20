import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SensorDataCard from "@/components/SensorDataCard";
import HealthStatusBadge from "@/components/HealthStatusBadge";
import HealthChart from "@/components/HealthChart";
import { useWorkerData } from "@/hooks/useWorkerData";
import { Heart, Thermometer, Activity, Wind, User, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const WorkerDashboard = () => {
  const { worker, sensorData, latestReading, isLoading } = useWorkerData();

  if (isLoading) {
    return (
      <DashboardLayout title="Worker Dashboard">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Worker Dashboard">
      {/* Worker Info Header */}
      <div className="industrial-card p-6 mb-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {worker?.name || "Worker"}
              </h2>
              <p className="text-muted-foreground text-sm">
                ID: {worker?.worker_id || "N/A"} • Device: {worker?.device_id || "Not Assigned"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <HealthStatusBadge status={latestReading?.health_status || "safe"} size="lg" />
          </div>
        </div>
      </div>

      {/* Health Issues Banner */}
      {worker?.health_issues && worker.health_issues !== "none" && (
        <div className="industrial-card p-4 mb-6 border-warning/50 bg-warning/5 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-warning" />
            <div>
              <p className="text-sm font-medium text-foreground">Declared Health Issues</p>
              <p className="text-sm text-muted-foreground">{worker.health_issues}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sensor Data Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SensorDataCard
          title="Heart Rate"
          value={latestReading?.heart_rate || 0}
          unit="BPM"
          icon={Heart}
          status={getHeartRateStatus(latestReading?.heart_rate)}
          delay={0.1}
        />
        <SensorDataCard
          title="Body Temperature"
          value={latestReading?.body_temperature || 0}
          unit="°C"
          icon={Thermometer}
          status={getTempStatus(latestReading?.body_temperature)}
          delay={0.2}
        />
        <SensorDataCard
          title="Motion Status"
          value={latestReading?.fall_detected ? "FALL DETECTED" : latestReading?.motion_status || "Normal"}
          icon={Activity}
          status={latestReading?.fall_detected ? "emergency" : "safe"}
          delay={0.3}
        />
        <SensorDataCard
          title="Gas Level"
          value={latestReading?.gas_level || 0}
          unit="PPM"
          icon={Wind}
          status={getGasStatus(latestReading?.gas_level)}
          delay={0.4}
        />
      </div>

      {/* Health Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HealthChart
          title="Heart Rate Trend"
          data={sensorData.map((d) => ({
            time: new Date(d.recorded_at).toLocaleTimeString(),
            value: d.heart_rate || 0,
          }))}
          dataKey="value"
          color="hsl(0, 84%, 60%)"
          unit="BPM"
        />
        <HealthChart
          title="Temperature Trend"
          data={sensorData.map((d) => ({
            time: new Date(d.recorded_at).toLocaleTimeString(),
            value: Number(d.body_temperature) || 0,
          }))}
          dataKey="value"
          color="hsl(45, 93%, 47%)"
          unit="°C"
        />
      </div>
    </DashboardLayout>
  );
};

const getHeartRateStatus = (hr?: number | null): "safe" | "warning" | "emergency" => {
  if (!hr) return "safe";
  if (hr < 60 || hr > 100) return "warning";
  if (hr < 50 || hr > 120) return "emergency";
  return "safe";
};

const getTempStatus = (temp?: number | null): "safe" | "warning" | "emergency" => {
  if (!temp) return "safe";
  const t = Number(temp);
  if (t < 36 || t > 37.5) return "warning";
  if (t < 35 || t > 38.5) return "emergency";
  return "safe";
};

const getGasStatus = (level?: number | null): "safe" | "warning" | "emergency" => {
  if (!level) return "safe";
  const l = Number(level);
  if (l > 50) return "emergency";
  if (l > 25) return "warning";
  return "safe";
};

export default WorkerDashboard;
