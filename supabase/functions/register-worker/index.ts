import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RegisterWorkerRequest {
  worker_id: string;
  name: string;
  age: number;
  health_issues: string;
  supervisor_id: string | null;
  device_id: string | null;
  password: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the requesting user
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

    // Check user role using service client
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: roleData, error: roleError } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError) {
      console.error("Role check failed:", roleError);
      return new Response(
        JSON.stringify({ error: "Failed to verify user role" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userRole = roleData?.role;
    const isAdmin = userRole === "admin";
    const isSupervisor = userRole === "supervisor";

    if (!isAdmin && !isSupervisor) {
      return new Response(
        JSON.stringify({ error: "Forbidden: Admin or Supervisor access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and validate the request body
    const body: RegisterWorkerRequest = await req.json();
    
    // Validate required fields
    if (!body.worker_id || body.worker_id.length < 1) {
      return new Response(
        JSON.stringify({ error: "Worker ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!body.name || body.name.length < 1) {
      return new Response(
        JSON.stringify({ error: "Name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!body.age || body.age < 18) {
      return new Response(
        JSON.stringify({ error: "Age must be 18 or older" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!body.password || body.password.length < 8) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 8 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If supervisor, get their supervisor record ID and force assignment to themselves
    let supervisorId = body.supervisor_id;
    if (isSupervisor) {
      const { data: supervisorData, error: supervisorError } = await adminClient
        .from("supervisors")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (supervisorError || !supervisorData) {
        console.error("Supervisor lookup failed:", supervisorError);
        return new Response(
          JSON.stringify({ error: "Could not find supervisor record" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      // Force workers registered by supervisors to be assigned to that supervisor
      supervisorId = supervisorData.id;
    }

    // Create the worker user with service role
    const email = `${body.worker_id.toLowerCase()}@safetysystem.local`;
    
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password: body.password,
      email_confirm: true,
    });

    if (authError) {
      console.error("User creation error:", authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: "Failed to create user" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Assign worker role
    const { error: roleInsertError } = await adminClient
      .from("user_roles")
      .insert({ user_id: authData.user.id, role: "worker" });

    if (roleInsertError) {
      console.error("Role insert error:", roleInsertError);
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return new Response(
        JSON.stringify({ error: "Failed to assign role" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create worker record
    const { error: workerError } = await adminClient.from("workers").insert({
      user_id: authData.user.id,
      worker_id: body.worker_id,
      name: body.name,
      age: body.age,
      health_issues: body.health_issues || "none",
      supervisor_id: supervisorId || null,
      device_id: body.device_id || null,
    });

    if (workerError) {
      console.error("Worker insert error:", workerError);
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return new Response(
        JSON.stringify({ error: "Failed to create worker record" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Worker ${body.worker_id} registered successfully by ${userRole} ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Worker ${body.name} registered successfully`,
        worker_id: body.worker_id 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Register worker error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
