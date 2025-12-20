import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Activity, Shield, Users, User, ArrowRight, Heart, Thermometer, Wind, AlertTriangle } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Background Pattern */}
      <div className="fixed inset-0 grid-pattern opacity-20" />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-6xl mx-auto text-center">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-primary/10 border border-primary/30 mb-8 glow-primary animate-fade-in">
            <Activity className="w-12 h-12 text-primary" />
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Safety<span className="text-primary">Guard</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            IoT-Based Industrial Worker Fatigue & Safety Detection System.
            Real-time health monitoring for a safer workplace.
          </p>

          {/* CTA Button */}
          <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Link to="/login">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-lg gap-2 group">
                Access System
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {/* Feature Cards */}
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
                className="industrial-card p-6 text-left transition-all hover:border-primary/50"
              >
                <feature.icon className={`w-10 h-10 ${feature.color} mb-4`} />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Role Cards */}
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
                  className="industrial-card p-6 transition-all hover:border-primary/50"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-4 mx-auto">
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

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
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
