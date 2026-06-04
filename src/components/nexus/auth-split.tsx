import { ReactNode } from "react";
import { Check } from "lucide-react";
import { NexusLogo } from "./logo";
import { FloatingShapes } from "./floating-shapes";

export function AuthSplit({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex relative w-3/5 bg-mesh items-center justify-center p-12 overflow-hidden">
        <FloatingShapes />
        <div className="relative max-w-md text-center">
          <div className="flex justify-center mb-6"><NexusLogo size={36} /></div>
          <h2 className="font-display text-3xl font-bold leading-tight">Manage your flow,<br/><span className="text-gradient">own your time.</span></h2>
          <p className="mt-4 text-muted-foreground">Join thousands of teams who ship faster with Nexus.</p>
          <ul className="mt-8 space-y-3 text-left">
            {["Real-time collaboration", "Smart task prioritization", "Beautiful dark mode interface"].map(t => (
              <li key={t} className="flex items-center gap-3 text-sm">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center"><Check className="w-3.5 h-3.5"/></span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        {children}
      </div>
    </div>
  );
}
