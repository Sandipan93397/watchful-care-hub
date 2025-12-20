import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Shield, User, Users, Lock, AlertTriangle, Activity } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["worker", "supervisor", "admin"]),
});

type AppRole = "admin" | "supervisor" | "worker";

const Login = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AppRole>("worker");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = loginSchema.safeParse({ userId, password, role });
    
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signIn(userId, password, role);

      if (error) {
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: error.message || "Invalid credentials. Please try again.",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Welcome Back",
        description: `Logged in successfully as ${role}`,
      });

      const dashboardRoutes: Record<AppRole, string> = {
        admin: "/admin",
        supervisor: "/supervisor",
        worker: "/worker",
      };

      navigate(dashboardRoutes[role]);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const roleIcons = {
    worker: User,
    supervisor: Users,
    admin: Shield,
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="fixed inset-0 grid-pattern opacity-30" />
      
      {/* Animated Scan Line */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-scan-line" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo/Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/30 mb-4 glow-primary">
            <Activity className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Safety<span className="text-primary">Guard</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            IoT-Based Industrial Worker Safety System
          </p>
        </div>

        {/* Login Card */}
        <div className="industrial-card p-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User ID Field */}
            <div className="space-y-2">
              <Label htmlFor="userId" className="text-foreground">
                User ID
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="userId"
                  type="text"
                  placeholder="Enter your User ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="pl-10 bg-secondary/50 border-border focus:border-primary"
                />
              </div>
              {errors.userId && (
                <p className="text-sm text-emergency flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.userId}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-secondary/50 border-border focus:border-primary"
                />
              </div>
              {errors.password && (
                <p className="text-sm text-emergency flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-foreground">Select Role</Label>
              <RadioGroup
                value={role}
                onValueChange={(value) => setRole(value as AppRole)}
                className="grid grid-cols-3 gap-3"
              >
                {(["worker", "supervisor", "admin"] as const).map((r) => {
                  const Icon = roleIcons[r];
                  return (
                    <div key={r}>
                      <RadioGroupItem
                        value={r}
                        id={r}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={r}
                        className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-border bg-secondary/30 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 hover:border-primary/50"
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-medium capitalize">{r}</span>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Authenticating...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-muted-foreground text-xs mt-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          Contact your administrator if you need access credentials
        </p>
      </div>
    </div>
  );
};

export default Login;
