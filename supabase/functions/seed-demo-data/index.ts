import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const results: string[] = [];

    // 1. Create Admin User
    const adminEmail = "admin001@safetysystem.local";
    const adminPassword = "admin123";
    
    const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });

    if (adminError && !adminError.message.includes("already been registered")) {
      throw adminError;
    }

    const adminId = adminUser?.user?.id;
    if (adminId) {
      await supabase.from("user_roles").upsert({ user_id: adminId, role: "admin" }, { onConflict: "user_id" });
      await supabase.from("profiles").upsert({ user_id: adminId, name: "System Administrator" }, { onConflict: "user_id" });
      results.push(`Admin created: admin001 / ${adminPassword}`);
    }

    // 2. Create Supervisor Users
    const supervisors = [
      { id: "sup001", name: "Rajesh Kumar", department: "Assembly Line A", password: "super123" },
      { id: "sup002", name: "Priya Sharma", department: "Welding Section", password: "super123" },
    ];

    const supervisorRecords: { id: string; userId: string; name: string }[] = [];

    for (const sup of supervisors) {
      const supEmail = `${sup.id}@safetysystem.local`;
      const { data: supUser, error: supError } = await supabase.auth.admin.createUser({
        email: supEmail,
        password: sup.password,
        email_confirm: true,
      });

      if (supError && !supError.message.includes("already been registered")) {
        console.error(`Supervisor ${sup.id} error:`, supError);
        continue;
      }

      const supUserId = supUser?.user?.id;
      if (supUserId) {
        await supabase.from("user_roles").upsert({ user_id: supUserId, role: "supervisor" }, { onConflict: "user_id" });
        await supabase.from("profiles").upsert({ user_id: supUserId, name: sup.name }, { onConflict: "user_id" });
        
        const { data: supRecord } = await supabase.from("supervisors").upsert({
          user_id: supUserId,
          supervisor_id: sup.id,
          name: sup.name,
          department: sup.department,
        }, { onConflict: "user_id" }).select().single();

        if (supRecord) {
          supervisorRecords.push({ id: supRecord.id, userId: supUserId, name: sup.name });
        }
        results.push(`Supervisor created: ${sup.id} / ${sup.password}`);
      }
    }

    // 3. Create Worker Users
    const workers = [
      { id: "wrk001", name: "Amit Singh", age: 28, healthIssues: "none", deviceId: "ESP32-001", password: "worker123", supervisorIdx: 0 },
      { id: "wrk002", name: "Suresh Patel", age: 35, healthIssues: "mild asthma", deviceId: "ESP32-002", password: "worker123", supervisorIdx: 0 },
      { id: "wrk003", name: "Vikram Yadav", age: 42, healthIssues: "high BP", deviceId: "ESP32-003", password: "worker123", supervisorIdx: 1 },
      { id: "wrk004", name: "Deepak Verma", age: 25, healthIssues: "none", deviceId: "ESP32-004", password: "worker123", supervisorIdx: 1 },
    ];

    const workerRecords: { id: string; name: string }[] = [];

    for (const wrk of workers) {
      const wrkEmail = `${wrk.id}@safetysystem.local`;
      const { data: wrkUser, error: wrkError } = await supabase.auth.admin.createUser({
        email: wrkEmail,
        password: wrk.password,
        email_confirm: true,
      });

      if (wrkError && !wrkError.message.includes("already been registered")) {
        console.error(`Worker ${wrk.id} error:`, wrkError);
        continue;
      }

      const wrkUserId = wrkUser?.user?.id;
      if (wrkUserId) {
        await supabase.from("user_roles").upsert({ user_id: wrkUserId, role: "worker" }, { onConflict: "user_id" });
        await supabase.from("profiles").upsert({ user_id: wrkUserId, name: wrk.name }, { onConflict: "user_id" });
        
        const supervisorId = supervisorRecords[wrk.supervisorIdx]?.id || null;
        
        const { data: wrkRecord } = await supabase.from("workers").upsert({
          user_id: wrkUserId,
          worker_id: wrk.id,
          name: wrk.name,
          age: wrk.age,
          health_issues: wrk.healthIssues,
          device_id: wrk.deviceId,
          supervisor_id: supervisorId,
          is_active: true,
        }, { onConflict: "user_id" }).select().single();

        if (wrkRecord) {
          workerRecords.push({ id: wrkRecord.id, name: wrk.name });
        }
        results.push(`Worker created: ${wrk.id} / ${wrk.password}`);
      }
    }

    // 4. Add sample sensor data for each worker
    for (const wrk of workerRecords) {
      const sensorData = [];
      const now = new Date();
      
      for (let i = 0; i < 24; i++) {
        const recordedAt = new Date(now.getTime() - i * 60 * 60 * 1000);
        sensorData.push({
          worker_id: wrk.id,
          heart_rate: 70 + Math.floor(Math.random() * 30),
          body_temperature: 36.5 + Math.random() * 1.5,
          fall_detected: Math.random() < 0.02,
          gas_level: Math.random() * 50,
          gas_status: Math.random() < 0.9 ? "safe" : "warning",
          motion_status: Math.random() < 0.95 ? "normal" : "fall_detected",
          health_status: Math.random() < 0.8 ? "safe" : Math.random() < 0.9 ? "warning" : "emergency",
          recorded_at: recordedAt.toISOString(),
        });
      }
      
      await supabase.from("sensor_data").insert(sensorData);
    }
    results.push("Sample sensor data added for all workers");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Demo data seeded successfully!",
        credentials: {
          admin: { userId: "admin001", password: "admin123" },
          supervisors: [
            { userId: "sup001", password: "super123", name: "Rajesh Kumar" },
            { userId: "sup002", password: "super123", name: "Priya Sharma" },
          ],
          workers: [
            { userId: "wrk001", password: "worker123", name: "Amit Singh" },
            { userId: "wrk002", password: "worker123", name: "Suresh Patel" },
            { userId: "wrk003", password: "worker123", name: "Vikram Yadav" },
            { userId: "wrk004", password: "worker123", name: "Deepak Verma" },
          ],
        },
        details: results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Seed error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
