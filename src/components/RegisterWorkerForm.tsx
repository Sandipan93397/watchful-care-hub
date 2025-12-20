import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[0-9]/, "Must contain at least one number");

const schema = z.object({
  worker_id: z.string().min(1, "Worker ID required").max(50, "Worker ID too long"),
  name: z.string().min(1, "Name required").max(100, "Name too long"),
  age: z.number().min(18, "Must be 18 or older").max(100, "Invalid age"),
  health_issues: z.string().max(500, "Health issues description too long"),
  device_id: z.string().max(50, "Device ID too long"),
  password: passwordSchema,
});

interface RegisterWorkerFormProps {
  supervisors?: { id: string; name: string }[];
  onClose: () => void;
  onSuccess: () => void;
  isSupervisorMode?: boolean;
}

const RegisterWorkerForm: React.FC<RegisterWorkerFormProps> = ({ 
  supervisors = [], 
  onClose, 
  onSuccess,
  isSupervisorMode = false 
}) => {
  const [form, setForm] = useState({ worker_id: "", name: "", age: "", health_issues: "none", supervisor_id: "", device_id: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    const result = schema.safeParse({
      ...form,
      age: parseInt(form.age) || 0,
    });

    if (!result.success) {
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Call secure edge function instead of client-side auth
      const { data, error } = await supabase.functions.invoke("register-worker", {
        body: {
          worker_id: form.worker_id.trim(),
          name: form.name.trim(),
          age: parseInt(form.age),
          health_issues: form.health_issues.trim() || "none",
          supervisor_id: isSupervisorMode ? null : (form.supervisor_id || null),
          device_id: form.device_id.trim() || null,
          password: form.password,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: "Worker Registered", description: `${form.name} can now login` });
      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      toast({ variant: "destructive", title: "Error", description: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="arch-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle>Register New Worker</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Worker ID</Label>
              <Input 
                value={form.worker_id} 
                onChange={(e) => setForm({ ...form, worker_id: e.target.value })} 
                maxLength={50}
                required 
              />
              {errors.worker_id && <p className="text-xs text-emergency mt-1">{errors.worker_id}</p>}
            </div>
            <div>
              <Label>Name</Label>
              <Input 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                maxLength={100}
                required 
              />
              {errors.name && <p className="text-xs text-emergency mt-1">{errors.name}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Age (18+)</Label>
              <Input 
                type="number" 
                min={18} 
                max={100}
                value={form.age} 
                onChange={(e) => setForm({ ...form, age: e.target.value })} 
                required 
              />
              {errors.age && <p className="text-xs text-emergency mt-1">{errors.age}</p>}
            </div>
            <div>
              <Label>Device ID</Label>
              <Input 
                value={form.device_id} 
                onChange={(e) => setForm({ ...form, device_id: e.target.value })}
                maxLength={50}
              />
              {errors.device_id && <p className="text-xs text-emergency mt-1">{errors.device_id}</p>}
            </div>
          </div>
          <div>
            <Label>Health Issues</Label>
            <Textarea 
              value={form.health_issues} 
              onChange={(e) => setForm({ ...form, health_issues: e.target.value })}
              maxLength={500}
            />
            {errors.health_issues && <p className="text-xs text-emergency mt-1">{errors.health_issues}</p>}
          </div>
          {!isSupervisorMode && supervisors.length > 0 && (
            <div>
              <Label>Supervisor</Label>
              <Select value={form.supervisor_id} onValueChange={(v) => setForm({ ...form, supervisor_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select supervisor" /></SelectTrigger>
                <SelectContent className="bg-card border-border">{supervisors.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          {isSupervisorMode && (
            <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">
              This worker will be automatically assigned to you.
            </p>
          )}
          <div>
            <Label>Password</Label>
            <Input 
              type="password" 
              value={form.password} 
              onChange={(e) => setForm({ ...form, password: e.target.value })} 
              required 
            />
            {errors.password && <p className="text-xs text-emergency mt-1">{errors.password}</p>}
            <p className="text-xs text-muted-foreground mt-1">
              Min 8 chars, 1 uppercase, 1 lowercase, 1 number
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={isLoading} className="flex-1">{isLoading ? "Registering..." : "Register"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterWorkerForm;
