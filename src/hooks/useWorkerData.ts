import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useWorkerData = () => {
  const { user } = useAuth();
  const [worker, setWorker] = useState<any>(null);
  const [sensorData, setSensorData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const { data: workerData } = await supabase.from("workers").select("*").eq("user_id", user.id).maybeSingle();
      setWorker(workerData);

      if (workerData) {
        const { data: sensors } = await supabase.from("sensor_data").select("*").eq("worker_id", workerData.id).order("recorded_at", { ascending: false }).limit(50);
        setSensorData(sensors || []);
      }
      setIsLoading(false);
    };

    fetchData();

    const channel = supabase.channel("worker-sensors").on("postgres_changes", { event: "INSERT", schema: "public", table: "sensor_data" }, (payload) => {
      if (worker && payload.new.worker_id === worker.id) {
        setSensorData((prev) => [payload.new, ...prev].slice(0, 50));
      }
    }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const latestReading = sensorData[0];
  return { worker, sensorData, latestReading, isLoading };
};
