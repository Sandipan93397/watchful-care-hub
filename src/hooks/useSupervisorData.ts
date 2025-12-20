import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useSupervisorData = () => {
  const { user } = useAuth();
  const [workers, setWorkers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    const { data: supervisor } = await supabase.from("supervisors").select("id").eq("user_id", user.id).maybeSingle();
    
    if (supervisor) {
      const { data: workersData } = await supabase.from("workers").select("*").eq("supervisor_id", supervisor.id);
      
      const workersWithStatus = await Promise.all((workersData || []).map(async (w) => {
        const { data: latest } = await supabase.from("sensor_data").select("*").eq("worker_id", w.id).order("recorded_at", { ascending: false }).limit(1).maybeSingle();
        return { ...w, latestStatus: latest?.health_status || "safe", latestHeartRate: latest?.heart_rate, latestTemp: latest?.body_temperature };
      }));
      
      setWorkers(workersWithStatus);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user, fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { workers, isLoading, refetch };
};
