import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-device-id",
};

interface SensorDataRequest {
  device_id: string;
  heart_rate?: number;
  body_temperature?: number;
  fall_detected?: boolean;
  gas_level?: number;
  gas_status?: string;
  motion_status?: string;
  health_status?: "safe" | "warning" | "emergency";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Parse and validate the request body
    const body: SensorDataRequest = await req.json();
    
    // Validate device_id is provided
    if (!body.device_id) {
      console.error("Missing device_id in request");
      return new Response(
        JSON.stringify({ error: "device_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Look up the worker by device_id to validate
    const { data: worker, error: workerError } = await adminClient
      .from("workers")
      .select("id, name, is_active")
      .eq("device_id", body.device_id)
      .single();

    if (workerError || !worker) {
      console.error("Invalid device_id:", body.device_id, workerError);
      return new Response(
        JSON.stringify({ error: "Invalid or unregistered device" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!worker.is_active) {
      console.error("Inactive worker device:", body.device_id);
      return new Response(
        JSON.stringify({ error: "Worker device is inactive" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate sensor data ranges
    if (body.heart_rate !== undefined && (body.heart_rate < 20 || body.heart_rate > 250)) {
      return new Response(
        JSON.stringify({ error: "Invalid heart rate value" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (body.body_temperature !== undefined && (body.body_temperature < 30 || body.body_temperature > 45)) {
      return new Response(
        JSON.stringify({ error: "Invalid body temperature value" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (body.gas_level !== undefined && (body.gas_level < 0 || body.gas_level > 1000)) {
      return new Response(
        JSON.stringify({ error: "Invalid gas level value" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert sensor data
    const { error: insertError } = await adminClient.from("sensor_data").insert({
      worker_id: worker.id,
      heart_rate: body.heart_rate,
      body_temperature: body.body_temperature,
      fall_detected: body.fall_detected ?? false,
      gas_level: body.gas_level,
      gas_status: body.gas_status ?? "safe",
      motion_status: body.motion_status ?? "normal",
      health_status: body.health_status ?? "safe",
    });

    if (insertError) {
      console.error("Sensor data insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to record sensor data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sensor data recorded for worker ${worker.name} (device: ${body.device_id})`);

    return new Response(
      JSON.stringify({ success: true, message: "Sensor data recorded" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Submit sensor data error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
