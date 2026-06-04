import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Zap, Target, BarChart3, Lock, BellRing, Moon, Github, Linkedin, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NexusLogo } from "@/components/nexus/logo";
import { FloatingShapes } from "@/components/nexus/floating-shapes";
import { CountUp } from "@/components/nexus/count-up";
import { getSession } from "@/lib/session-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nexus — Manage your flow, own your time." },
      { name: "description", content: "A modern task management workspace for teams that ship." },
    ],
  }),
  component: Landing,
});

type ModalKey = "changelog" | "roadmap" | "privacy" | "terms" | null;

function Landing() {
  const nav = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [modal, setModal] = useState<ModalKey>(null);

  useEffect(() => {
    if (getSession()) nav({ to: "/dashboard" });
  }, [nav]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const smoothScroll = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const features = [
    { icon: Zap, title: "Lightning Fast", desc: "Real-time updates across your team." },
    { icon: Target, title: "Smart Priorities", desc: "AI-powered task prioritization." },
    { icon: BarChart3, title: "Deep Analytics", desc: "Understand your team's performance." },
    { icon: Lock, title: "Secure by Default", desc: "Enterprise-grade security." },
    { icon: BellRing, title: "Smart Notifications", desc: "Never miss a deadline." },
    { icon: Moon, title: "Dark Mode First", desc: "Designed for focused work." },
  ];

  const plans = [
    {
      name: "Free", price: "$0", desc: "For personal use", cta: "Get started", highlight: false,
      features: ["Up to 3 projects", "Up to 10 tasks per project", "Basic analytics", "Community support", "1 user only"],
    },
    {
      name: "Pro", price: "$12", desc: "For growing teams", cta: "Get started", highlight: true,
      features: ["Unlimited projects", "Unlimited tasks", "Advanced analytics", "Priority support", "AI prioritization", "Up to 10 team members", "Custom due date reminders"],
    },
    {
      name: "Enterprise", price: "Custom", desc: "Custom pricing based on your team size and needs", cta: "Contact Sales", highlight: false,
      features: ["Everything in Pro", "SSO & SAML", "Audit logs", "Dedicated CSM", "SLA guarantee", "Unlimited team members"],
    },
  ];

  const socials: { Icon: React.ComponentType<{ className?: string }>; url: string; label: string }[] = [
    { Icon: Github, url: "https://github.com", label: "GitHub" },
    { Icon: Linkedin, url: "https://linkedin.com", label: "LinkedIn" },
    { Icon: XLogo, url: "https://x.com", label: "X" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all ${scrolled ? "bg-background/70 backdrop-blur-xl border-b border-border" : ""}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
            <NexusLogo />
          </a>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" onClick={smoothScroll("features")} className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" onClick={smoothScroll("pricing")} className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#about" onClick={smoothScroll("about")} className="hover:text-foreground transition-colors">About</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm px-4 py-2 hover:text-primary">Login</Link>
            <Link to="/register" className="text-sm px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">Get Started</Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-24 overflow-hidden">
        <FloatingShapes />
        <div className="bg-mesh absolute inset-0 opacity-40" />
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="font-display font-bold text-5xl md:text-7xl leading-[1.05] tracking-tight">
            Manage your flow,<br />
            <span className="text-gradient">own your time.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Nexus brings your tasks, team, and deadlines into one powerful workspace.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="px-6 py-3 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 shadow-glow transition-all">Get Started Free</Link>
            <a href="#features" onClick={smoothScroll("features")} className="px-6 py-3 rounded-md border border-border hover:bg-muted font-medium">See how it works</a>
          </motion.div>
          <p className="mt-4 text-xs text-muted-foreground">No credit card required • Free forever plan</p>

          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} className="mt-16 mx-auto max-w-4xl">
            <DashboardMockup />
          </motion.div>
        </div>
      </section>

      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-display font-bold text-center">Everything you need to ship faster</h2>
          <p className="text-center text-muted-foreground mt-3">Built for the way modern teams actually work.</p>
          <div className="mt-14 grid md:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors shadow-card">
                <div className="w-11 h-11 rounded-md bg-primary/15 text-primary flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 px-6 bg-surface/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-display font-bold text-center">Simple, transparent pricing</h2>
          <p className="text-center text-muted-foreground mt-3">Choose the plan that fits your team.</p>
          <div className="mt-14 grid md:grid-cols-3 gap-5 items-stretch">
            {plans.map((p) => (
              <div key={p.name} className={`relative rounded-xl border p-7 bg-card flex flex-col ${p.highlight ? "border-primary shadow-glow md:scale-[1.03]" : "border-border"}`}>
                {p.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wider px-3 py-1 rounded-full bg-primary text-primary-foreground font-semibold shadow-md">
                    Most Popular
                  </span>
                )}
                <h3 className="font-display text-2xl font-bold">{p.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 min-h-[40px]">{p.desc}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{p.price}</span>
                  {p.price.startsWith("$") && p.price !== "$0" ? <span className="text-muted-foreground">/mo</span> : p.price === "$0" ? <span className="text-muted-foreground">/mo</span> : null}
                </div>
                <ul className="mt-6 space-y-2 text-sm flex-1">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2"><Check className="w-4 h-4 text-success mt-0.5 shrink-0" /> <span>{f}</span></li>
                  ))}
                </ul>
                {p.name === "Enterprise" ? (
                  <a href="mailto:contact@nexus.app" className="mt-6 block text-center py-2.5 rounded-md font-medium border border-border hover:bg-muted transition-colors">
                    {p.cta}
                  </a>
                ) : (
                  <Link to="/register" className={`mt-6 block text-center py-2.5 rounded-md font-medium transition-colors ${p.highlight ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-border hover:bg-muted"}`}>
                    {p.cta}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-display font-bold">About Nexus</h2>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
            Nexus is built for modern teams who want to move fast, stay organized, and own their time.
            We believe great tools should disappear into your workflow — not get in the way of it.
          </p>
          <div className="mt-10 grid sm:grid-cols-3 gap-4">
            {[
              { to: 10, suffix: "k+", decimals: 0, v: "Teams shipping" },
              { to: 1.2, suffix: "M", decimals: 1, v: "Tasks completed" },
              { to: 99.9, suffix: "%", decimals: 1, v: "Uptime" },
            ].map(s => (
              <div key={s.v} className="rounded-xl border border-border bg-card p-6">
                <div className="text-3xl font-display font-bold text-gradient">
                  <CountUp to={s.to} suffix={s.suffix} decimals={s.decimals} duration={2} triggerOnView />
                </div>
                <div className="text-xs text-muted-foreground mt-1">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-surface border-t-2" style={{ borderTopColor: "rgba(108,99,255,0.3)" }}>
        <div className="max-w-6xl mx-auto px-6 py-14 grid md:grid-cols-3 gap-10">
          <div>
            <NexusLogo />
            <p className="mt-3 text-sm text-muted-foreground">Manage your flow, own your time.</p>
            <div className="mt-5 flex gap-3">
              {socials.map(({ Icon, url, label }, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-[#A0AEC0] hover:text-primary hover:border-primary transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" onClick={smoothScroll("features")} className="hover:text-foreground">Features</a></li>
              <li><a href="#pricing" onClick={smoothScroll("pricing")} className="hover:text-foreground">Pricing</a></li>
              <li><button onClick={() => setModal("changelog")} className="hover:text-foreground text-left">Changelog</button></li>
              <li><button onClick={() => setModal("roadmap")} className="hover:text-foreground text-left">Roadmap</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#about" onClick={smoothScroll("about")} className="hover:text-foreground">About</a></li>
              <li><a href="mailto:contact@nexus.app" className="hover:text-foreground">Contact</a></li>
              <li><button onClick={() => setModal("privacy")} className="hover:text-foreground text-left">Privacy Policy</button></li>
              <li><button onClick={() => setModal("terms")} className="hover:text-foreground text-left">Terms of Service</button></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border py-5 px-6 grid grid-cols-3 items-center text-xs text-muted-foreground max-w-6xl mx-auto">
          <span />
          <span className="text-center">© 2025 Nexus. All rights reserved.</span>
          <span className="text-right">Made with ❤️</span>
        </div>
      </footer>

      <InfoModal open={modal !== null} onClose={() => setModal(null)} kind={modal} />
    </div>
  );
}

function XLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M18.244 2H21l-6.49 7.41L22 22h-6.78l-4.78-6.27L4.8 22H2l6.96-7.95L2 2h6.93l4.34 5.78L18.244 2Zm-1.19 18h1.86L7.04 4H5.1l11.954 16Z"/>
    </svg>
  );
}

function DashboardMockup() {
  const stats = [
    { label: "Total Tasks", value: 124, color: "#6C63FF" },
    { label: "In Progress", value: 38, color: "#00BCD4" },
    { label: "Completed", value: 76, color: "#22C55E" },
    { label: "Overdue", value: 5, color: "#EF4444" },
  ];
  const cols = [
    { title: "To Do", color: "#94A3B8", tasks: [{ t: "Design login flow", p: 40 }, { t: "Update API docs", p: 10 }] },
    { title: "In Progress", color: "#00BCD4", tasks: [{ t: "Build Kanban board", p: 65 }, { t: "Refactor auth", p: 50 }] },
    { title: "Done", color: "#22C55E", tasks: [{ t: "Setup CI/CD", p: 100 }] },
  ];
  return (
    <div className="rounded-2xl border border-border overflow-hidden shadow-modal" style={{ background: "#0F0F1A" }}>
      <div className="h-8 bg-muted flex items-center gap-1.5 px-4 border-b border-border">
        <span className="w-3 h-3 rounded-full bg-danger/70" />
        <span className="w-3 h-3 rounded-full bg-warning/70" />
        <span className="w-3 h-3 rounded-full bg-success/70" />
        <span className="ml-3 text-[10px] text-muted-foreground">app.nexus.io / dashboard</span>
      </div>
      <div className="p-5 space-y-5">
        <div className="grid grid-cols-4 gap-3">
          {stats.map(s => (
            <div key={s.label} className="rounded-lg p-3 border border-border" style={{ background: "#1A1A2E" }}>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
              <div className="mt-1 text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {cols.map(col => (
            <div key={col.title} className="rounded-lg p-3 border border-border" style={{ background: "#16162A" }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                <span className="text-xs font-semibold">{col.title}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">{col.tasks.length}</span>
              </div>
              <div className="space-y-2">
                {col.tasks.map((t, i) => (
                  <div key={i} className="rounded-md p-2.5 border border-border" style={{ background: "#1A1A2E" }}>
                    <div className="text-[11px] font-medium text-foreground/90 truncate">{t.t}</div>
                    <div className="mt-2 h-1 rounded-full bg-foreground/10 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${t.p}%`, background: "linear-gradient(90deg,#6C63FF,#00BCD4)" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoModal({ open, onClose, kind }: { open: boolean; onClose: () => void; kind: ModalKey }) {
  if (!open || !kind) return null;
  const content: Record<Exclude<ModalKey, null>, { title: string; body: React.ReactNode }> = {
    changelog: { title: "Changelog", body: <p className="text-center text-2xl py-10">Changelog coming soon 🚀</p> },
    roadmap: { title: "Roadmap", body: <p className="text-center text-2xl py-10">Roadmap coming soon 📍</p> },
    privacy: {
      title: "Privacy Policy",
      body: (
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>Nexus respects your privacy. We collect only the data necessary to provide the service: account info, task content you create, and basic usage analytics to improve the product.</p>
          <p>We never sell your data to third parties. Your task data is encrypted at rest and in transit, and we limit internal access strictly to engineers maintaining the platform.</p>
          <p>You may request a full export or permanent deletion of your account at any time from Settings → Danger Zone. Deletion is irreversible and removes all associated data within 30 days.</p>
          <p>For questions about this policy, email privacy@nexus.app. This is a placeholder document for demonstration purposes.</p>
        </div>
      ),
    },
    terms: {
      title: "Terms of Service",
      body: (
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>By using Nexus, you agree to use the service lawfully and to not abuse, reverse-engineer, or attempt to disrupt our infrastructure.</p>
          <p>Your account is yours alone — sharing credentials is prohibited. You are responsible for the content you create and share within your workspace.</p>
          <p>We provide Nexus "as is" without warranty. While we aim for 99.9% uptime, we are not liable for indirect damages arising from outages or data loss.</p>
          <p>These terms may be updated from time to time; continued use after changes constitutes acceptance. This is a placeholder document for demonstration purposes.</p>
        </div>
      ),
    },
  };
  const { title, body } = content[kind];
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-lg rounded-xl border border-border bg-card shadow-modal max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h3 className="font-display font-bold text-lg">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-md hover:bg-muted flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">{body}</div>
      </div>
    </div>
  );
}
