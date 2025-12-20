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
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the requesting user is authenticated and is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user has admin role
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: roleData, error: roleError } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || roleData?.role !== "admin") {
      console.error("Role check failed:", roleError || "Not admin");
      return new Response(
        JSON.stringify({ error: "Forbidden: Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Admin ${user.id} initiated demo data seeding`);
    const results: string[] = [];

    // Generate secure random passwords
    const generatePassword = () => {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
      let password = "";
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };

    const passwords: Record<string, string> = {};

    // 1. Create Supervisor Users
    const supervisors = [
      { id: "sup001", name: "Rajesh Kumar", department: "Assembly Line A" },
      { id: "sup002", name: "Priya Sharma", department: "Welding Section" },
    ];

    const supervisorRecords: { id: string; userId: string; name: string }[] = [];

    for (const sup of supervisors) {
      const supEmail = `${sup.id}@safetysystem.local`;
      const supPassword = generatePassword();
      passwords[sup.id] = supPassword;

      const { data: supUser, error: supError } = await adminClient.auth.admin.createUser({
        email: supEmail,
        password: supPassword,
        email_confirm: true,
      });

      if (supError && !supError.message.includes("already been registered")) {
        console.error(`Supervisor ${sup.id} error:`, supError);
        continue;
      }

      const supUserId = supUser?.user?.id;
      if (supUserId) {
        await adminClient.from("user_roles").upsert({ user_id: supUserId, role: "supervisor" }, { onConflict: "user_id" });
        await adminClient.from("profiles").upsert({ user_id: supUserId, name: sup.name }, { onConflict: "user_id" });
        
        const { data: supRecord } = await adminClient.from("supervisors").upsert({
          user_id: supUserId,
          supervisor_id: sup.id,
          name: sup.name,
          department: sup.department,
        }, { onConflict: "user_id" }).select().single();

        if (supRecord) {
          supervisorRecords.push({ id: supRecord.id, userId: supUserId, name: sup.name });
        }
        results.push(`Supervisor ${sup.id} created`);
      }
    }

    // 2. Create Worker Users
    const workers = [
      { id: "wrk001", name: "Amit Singh", age: 28, healthIssues: "none", deviceId: "ESP32-001", supervisorIdx: 0 },
      { id: "wrk002", name: "Suresh Patel", age: 35, healthIssues: "mild asthma", deviceId: "ESP32-002", supervisorIdx: 0 },
      { id: "wrk003", name: "Vikram Yadav", age: 42, healthIssues: "high BP", deviceId: "ESP32-003", supervisorIdx: 1 },
      { id: "wrk004", name: "Deepak Verma", age: 25, healthIssues: "none", deviceId: "ESP32-004", supervisorIdx: 1 },
    ];

    const workerRecords: { id: string; name: string }[] = [];

    for (const wrk of workers) {
      const wrkEmail = `${wrk.id}@safetysystem.local`;
      const wrkPassword = generatePassword();
      passwords[wrk.id] = wrkPassword;

      const { data: wrkUser, error: wrkError } = await adminClient.auth.admin.createUser({
        email: wrkEmail,
        password: wrkPassword,
        email_confirm: true,
      });

      if (wrkError && !wrkError.message.includes("already been registered")) {
        console.error(`Worker ${wrk.id} error:`, wrkError);
        continue;
      }

      const wrkUserId = wrkUser?.user?.id;
      if (wrkUserId) {
        await adminClient.from("user_roles").upsert({ user_id: wrkUserId, role: "worker" }, { onConflict: "user_id" });
        await adminClient.from("profiles").upsert({ user_id: wrkUserId, name: wrk.name }, { onConflict: "user_id" });
        
        const supervisorId = supervisorRecords[wrk.supervisorIdx]?.id || null;
        
        const { data: wrkRecord } = await adminClient.from("workers").upsert({
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
        results.push(`Worker ${wrk.id} created`);
      }
    }

    // 3. Add sample sensor data for each worker
    for (const wrk of workerRecords) {
      const sensorData = [];
      const now = new Date();
      
      for (let i = 0; i < 24; i++) {
        const recordedAt = new Date(now.getTime() - i * 60 * 60 * 1000);
        const isSafe = Math.random() < 0.7;
        const isWarning = !isSafe && Math.random() < 0.7;
        
        sensorData.push({
          worker_id: wrk.id,
          heart_rate: 70 + Math.floor(Math.random() * 30),
          body_temperature: 36.5 + Math.random() * 1.5,
          fall_detected: Math.random() < 0.02,
          gas_level: Math.random() * 50,
          gas_status: Math.random() < 0.9 ? "safe" : "warning",
          motion_status: Math.random() < 0.95 ? "normal" : "fall_detected",
          health_status: isSafe ? "safe" : isWarning ? "warning" : "emergency",
          recorded_at: recordedAt.toISOString(),
        });
      }
      
      await adminClient.from("sensor_data").insert(sensorData);
    }
    results.push("Sample sensor data added for all workers");

    console.log(`Demo data seeding completed by admin ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Demo data seeded successfully!",
        credentials: {
          supervisors: supervisors.map(s => ({
            userId: s.id,
            password: passwords[s.id],
            name: s.name,
          })),
          workers: workers.map(w => ({
            userId: w.id,
            password: passwords[w.id],
            name: w.name,
          })),
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
