import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAdminData = () => {
  const [workers, setWorkers] = useState<any[]>([]);
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const { data: workersData } = await supabase.from("workers").select("*");
    const { data: supervisorsData } = await supabase.from("supervisors").select("*");

    const workersWithStatus = await Promise.all((workersData || []).map(async (w) => {
      const { data: latest } = await supabase.from("sensor_data").select("*").eq("worker_id", w.id).order("recorded_at", { ascending: false }).limit(1).maybeSingle();
      return { ...w, latestStatus: latest?.health_status || "safe", latestHeartRate: latest?.heart_rate, latestTemp: latest?.body_temperature };
    }));

    setWorkers(workersWithStatus);
    setSupervisors(supervisorsData || []);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { workers, supervisors, isLoading, refetch: fetchData };
};
