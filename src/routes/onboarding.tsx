import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Code, Palette, BarChart3, Rocket, CheckCircle2, ListChecks, Users, Calendar, TrendingUp } from "lucide-react";
import { FloatingShapes } from "@/components/nexus/floating-shapes";

export const Route = createFileRoute("/onboarding")({ component: Onboarding });

function Onboarding() {
  const [step, setStep] = useState(0);
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      <FloatingShapes />
      <div className="relative pt-10 flex justify-center gap-2">
        {[0,1,2].map(i => (
          <motion.div key={i} animate={{ width: i === step ? 28 : 8, backgroundColor: i <= step ? "#6C63FF" : "rgba(255,255,255,0.15)" }} className="h-2 rounded-full"/>
        ))}
      </div>
      <div className="relative flex-1 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {step === 0 && <Step1 key="s1" onNext={() => setStep(1)} />}
          {step === 1 && <Step2 key="s2" onNext={() => setStep(2)} />}
          {step === 2 && <Step3 key="s3" onTask={() => nav({ to: "/kanban" })} onDash={() => nav({ to: "/dashboard" })} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Wrap({ children }: { children: React.ReactNode }) {
  return <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} transition={{ duration: 0.35 }} className="w-full max-w-2xl">{children}</motion.div>;
}

function Step1({ onNext }: { onNext: () => void }) {
  const [role, setRole] = useState<string | null>(null);
  const roles = [{ icon: Code, label: "Developer" },{ icon: Palette, label: "Designer" },{ icon: BarChart3, label: "Manager" },{ icon: Rocket, label: "Other" }];
  return (
    <Wrap>
      <h2 className="font-display text-3xl font-bold text-center">Welcome to Nexus! 👋</h2>
      <p className="text-muted-foreground text-center mt-2">What's your name and role?</p>
      <div className="mt-8 space-y-3">
        <input placeholder="Full name" className="w-full h-12 px-4 rounded-md bg-card border border-border outline-none focus:border-primary" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {roles.map(r => (
            <button key={r.label} onClick={() => setRole(r.label)} className={`p-4 rounded-md border text-center transition-all ${role === r.label ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/50"}`}>
              <r.icon className="w-6 h-6 mx-auto mb-2 text-primary"/>
              <div className="text-sm">{r.label}</div>
            </button>
          ))}
        </div>
        <button onClick={onNext} className="w-full mt-4 py-3 rounded-md bg-primary text-primary-foreground font-medium">Continue →</button>
      </div>
    </Wrap>
  );
}

function Step2({ onNext }: { onNext: () => void }) {
  const opts = [{icon:ListChecks,label:"Personal task tracking"},{icon:Users,label:"Team collaboration"},{icon:Calendar,label:"Project management"},{icon:TrendingUp,label:"Productivity tracking"}];
  const [sel, setSel] = useState<string[]>([]);
  return (
    <Wrap>
      <h2 className="font-display text-3xl font-bold text-center">What's your goal?</h2>
      <p className="text-muted-foreground text-center mt-2">What will you use Nexus for?</p>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {opts.map(o => (
          <button key={o.label} onClick={() => setSel(s => s.includes(o.label) ? s.filter(x => x !== o.label) : [...s, o.label])} className={`flex items-center gap-3 p-4 rounded-md border transition-all ${sel.includes(o.label) ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/50"}`}>
            <o.icon className="w-5 h-5 text-primary"/>
            <span className="text-sm font-medium">{o.label}</span>
          </button>
        ))}
      </div>
      <button onClick={onNext} className="w-full mt-6 py-3 rounded-md bg-primary text-primary-foreground font-medium">Continue →</button>
    </Wrap>
  );
}

function Step3({ onTask, onDash }: { onTask: () => void; onDash: () => void }) {
  return (
    <Wrap>
      <div className="text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="mx-auto w-24 h-24 rounded-full bg-success/20 flex items-center justify-center">
          <motion.div initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8 }}>
            <CheckCircle2 className="w-14 h-14 text-success"/>
          </motion.div>
        </motion.div>
        <h2 className="mt-6 font-display text-3xl font-bold">Your workspace is ready 🎉</h2>
        <p className="text-muted-foreground mt-2">Start by creating your first task or invite a teammate.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={onTask} className="px-6 py-3 rounded-md bg-primary text-primary-foreground font-medium">Create First Task</button>
          <button onClick={onDash} className="px-6 py-3 rounded-md border border-border hover:bg-muted font-medium">Go to Dashboard</button>
        </div>
      </div>
    </Wrap>
  );
}
