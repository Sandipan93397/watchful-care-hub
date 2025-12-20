-- Fix 1: Remove unrestricted sensor data INSERT policy
DROP POLICY IF EXISTS "Allow insert sensor data" ON sensor_data;

-- Sensor data should only be inserted via Edge Functions with service role
-- No direct client-side inserts allowed