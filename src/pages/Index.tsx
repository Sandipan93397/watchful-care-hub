import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Activity, Shield, Users, User, ArrowRight, Heart, Thermometer, Wind, AlertTriangle } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Pattern */}
      <div className="fixed inset-0 grid-pattern opacity-20" />
      
      {/* Decorative Arch Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Large background arch */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
          <div className="arch-frame absolute inset-0" />
        </div>
        
        {/* Smaller inner arch */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]">
          <div className="arch-frame-inner absolute inset-0 opacity-50" />
        </div>
        
        {/* Bottom decorative arches */}
        <div className="absolute bottom-0 left-0 right-0 h-64 flex justify-center gap-8">
          <div className="arch-small w-48 h-64" />
          <div className="arch-small w-48 h-64" />
          <div className="arch-small w-48 h-64" />
        </div>
      </div>
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Logo with arch frame */}
          <div className="relative inline-block mb-8 animate-fade-in">
            <div className="absolute -inset-4 rounded-t-full border-2 border-primary/20 rounded-b-lg" />
            <div className="relative w-24 h-24 rounded-t-full rounded-b-lg bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary">
              <Activity className="w-12 h-12 text-primary" />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Safety<span className="text-primary">Guard</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            IoT-Based Industrial Worker Fatigue & Safety Detection System.
            Real-time health monitoring for a safer workplace.
          </p>

          {/* CTA Button with arch container */}
          <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Link to="/login">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-lg gap-2 group rounded-t-2xl rounded-b-lg">
                Access System
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {/* Feature Cards with arch styling */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            {[
              {
                icon: Heart,
                title: "Health Monitoring",
                description: "Real-time heart rate and temperature tracking",
                color: "text-emergency",
              },
              {
                icon: Wind,
                title: "Gas Detection",
                description: "Continuous air quality and hazard monitoring",
                color: "text-warning",
              },
              {
                icon: AlertTriangle,
                title: "Fall Detection",
                description: "Instant alerts for motion anomalies",
                color: "text-safe",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="arch-card p-6 text-left transition-all hover:border-primary/50"
              >
                <div className="arch-card-header mb-4">
                  <feature.icon className={`w-10 h-10 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Role Cards with arch styling */}
          <div className="mt-16 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <h2 className="text-2xl font-bold text-foreground mb-8">Role-Based Access</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: User,
                  role: "Worker",
                  description: "View personal health data and status",
                },
                {
                  icon: Users,
                  role: "Supervisor",
                  description: "Monitor team health and safety metrics",
                },
                {
                  icon: Shield,
                  role: "Admin",
                  description: "Full system control and management",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="arch-card p-6 transition-all hover:border-primary/50"
                >
                  <div className="w-14 h-14 rounded-t-xl rounded-b-lg bg-primary/10 border border-primary/30 flex items-center justify-center mb-4 mx-auto">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {item.role}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer with arch decoration */}
      <footer className="relative border-t border-border py-8 px-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-12 rounded-t-full bg-background border border-border border-b-0" />
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">SafetyGuard</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Industrial Safety Monitoring System • SIH 2024
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
