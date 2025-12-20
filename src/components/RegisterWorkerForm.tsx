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

const schema = z.object({
  worker_id: z.string().min(1, "Worker ID required"),
  name: z.string().min(1, "Name required"),
  age: z.number().min(19, "Must be 19 or older"),
  health_issues: z.string(),
  device_id: z.string(),
  password: z.string().min(6, "Min 6 characters"),
});

interface RegisterWorkerFormProps {
  supervisors: { id: string; name: string }[];
  onClose: () => void;
  onSuccess: () => void;
}

const RegisterWorkerForm: React.FC<RegisterWorkerFormProps> = ({ supervisors, onClose, onSuccess }) => {
  const [form, setForm] = useState({ worker_id: "", name: "", age: "", health_issues: "none", supervisor_id: "", device_id: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const email = `${form.worker_id.toLowerCase()}@safetysystem.local`;
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: form.password,
        options: { emailRedirectTo: window.location.origin },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create user");

      const { error: roleError } = await supabase.from("user_roles").insert({ user_id: authData.user.id, role: "worker" });
      if (roleError) throw roleError;

      const { error: workerError } = await supabase.from("workers").insert({
        user_id: authData.user.id,
        worker_id: form.worker_id,
        name: form.name,
        age: parseInt(form.age),
        health_issues: form.health_issues,
        supervisor_id: form.supervisor_id || null,
        device_id: form.device_id || null,
      });
      if (workerError) throw workerError;

      toast({ title: "Worker Registered", description: `${form.name} can now login` });
      onSuccess();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="industrial-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle>Register New Worker</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Worker ID</Label><Input value={form.worker_id} onChange={(e) => setForm({ ...form, worker_id: e.target.value })} required /></div>
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Age (19+)</Label><Input type="number" min={19} value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} required /></div>
            <div><Label>Device ID</Label><Input value={form.device_id} onChange={(e) => setForm({ ...form, device_id: e.target.value })} /></div>
          </div>
          <div><Label>Health Issues</Label><Textarea value={form.health_issues} onChange={(e) => setForm({ ...form, health_issues: e.target.value })} /></div>
          <div><Label>Supervisor</Label>
            <Select value={form.supervisor_id} onValueChange={(v) => setForm({ ...form, supervisor_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select supervisor" /></SelectTrigger>
              <SelectContent>{supervisors.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
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
