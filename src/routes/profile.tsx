import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CheckCircle2, FolderKanban, TrendingUp, Trash2, Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/nexus/app-shell";
import { CountUp } from "@/components/nexus/count-up";
import { useTasks } from "@/lib/task-store";
import { useSession } from "@/lib/session-store";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useProfile, saveProfile, useBanner, saveBanner } from "@/lib/profile-store";

export const Route = createFileRoute("/profile")({ component: Profile });

function Profile() {
  const fileRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  const profile = useProfile();
  const banner = useBanner();
  const tasks = useTasks();
  const session = useSession();
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState(profile);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setDraft(profile); }, [profile]);

  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const productivity = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;
  const displayName = mounted ? (profile.name || session?.name || "") : "";
  const displayEmail = mounted ? (profile.email || session?.email || "") : "";
  const memberSince = mounted && session?.id
    ? new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "";

  const onPickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => { await saveProfile({ avatar: reader.result as string }); toast.success("Profile picture updated"); };
    reader.readAsDataURL(file);
  };

  const onPickBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(jpeg|jpg|png|webp)$/.test(file.type)) { toast.error("Please choose a JPG, PNG, or WEBP image"); return; }
    const reader = new FileReader();
    reader.onload = () => { saveBanner(reader.result as string); toast.success("Banner updated"); };
    reader.readAsDataURL(file);
  };

  const saveEdit = async () => {
    await saveProfile({ name: draft.name, bio: draft.bio });
    setEditOpen(false);
    toast.success("Profile saved");
  };

  return (
    <AppShell>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        {/* Hero Card */}
        <div className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-card mb-6">

          {/* Banner */}
          <div
            className="group h-52 relative bg-cover bg-center overflow-hidden"
            style={banner
              ? { backgroundImage: `url(${banner})` }
              : { background: "linear-gradient(135deg, #6C63FF 0%, #00BCD4 50%, #22C55E 100%)" }
            }
          >
            {/* animated shimmer on banner */}
            {!banner && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_3s_infinite]" />
            )}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <button type="button" onClick={() => bannerRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 text-white text-xs backdrop-blur-md hover:bg-black/70 transition-colors">
                <Camera className="w-3.5 h-3.5" /> Change banner
              </button>
              {banner && (
                <button type="button" onClick={() => { saveBanner(null); toast.success("Banner removed"); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/70 text-white text-xs backdrop-blur-md hover:bg-red-600 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              )}
            </div>
            <input ref={bannerRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={onPickBanner} />
          </div>

          {/* Avatar + info row */}
          <div className="px-8 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-14 mb-6">

              {/* Avatar */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="relative group flex-shrink-0 w-fit"
              >
                <div className="p-1 rounded-full bg-card ring-4 ring-card">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="Profile" className="w-28 h-28 rounded-full object-cover" />
                  ) : (
                    <div
                      className="w-28 h-28 rounded-full flex items-center justify-center font-display text-4xl font-bold text-white"
                      style={{ background: "linear-gradient(135deg, #6C63FF, #00BCD4)" }}
                      suppressHydrationWarning
                    >
                      {mounted ? (profile.name || session?.name || "U").charAt(0).toUpperCase() : ""}
                    </div>
                  )}
                </div>
                {/* hover overlay */}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute inset-1 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200"
                >
                  <Camera className="w-7 h-7 text-white" />
                </button>
                {/* remove avatar btn */}
                <AnimatePresence>
                  {profile.avatar && (
                    <motion.button
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      type="button"
                      onClick={() => { saveProfile({ avatar: null }); toast.success("Photo removed"); }}
                      className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg z-10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </motion.button>
                  )}
                </AnimatePresence>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickAvatar} />
              </motion.div>

              {/* Name + email */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex-1 min-w-0 sm:pb-2"
              >
                <h1 className="font-display text-3xl font-bold truncate" suppressHydrationWarning>
                  {displayName}
                </h1>
                <p className="text-sm text-muted-foreground mt-1 truncate" suppressHydrationWarning>
                  {displayEmail}{memberSince && <span className="text-muted-foreground/60"> · Member since {memberSince}</span>}
                </p>
                {profile.bio && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{profile.bio}</p>
                )}
              </motion.div>

              {/* Edit button */}
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
                onClick={() => { setDraft(profile); setEditOpen(true); }}
                className="sm:self-end flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border hover:bg-muted text-sm font-medium transition-colors whitespace-nowrap"
              >
                <Pencil className="w-4 h-4" /> Edit Profile
              </motion.button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard icon={CheckCircle2} label="Tasks Completed" value={doneTasks} color="#22C55E" delay={0.4} />
              <StatCard icon={FolderKanban} label="Total Tasks" value={tasks.length} color="#6C63FF" delay={0.5} />
              <ProductivityCard value={productivity} delay={0.6} />
            </div>
          </div>
        </div>

        {/* Recent Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-2xl p-6 shadow-card"
        >
          <h2 className="font-semibold text-lg mb-4">Recent Tasks</h2>
          <div className="space-y-2">
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-muted-foreground gap-2">
                <FolderKanban className="w-10 h-10 opacity-20" />
                <p className="text-sm">No tasks yet.</p>
              </div>
            ) : tasks.slice(0, 5).map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{t.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{t.project}</div>
                </div>
                <span className={`text-[10px] uppercase px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${
                  t.status === "done" ? "bg-success/15 text-success" :
                  t.status === "in-progress" ? "bg-accent/15 text-accent" :
                  "bg-warning/15 text-warning"}`}>
                  {t.status}
                </span>
                <div className="text-xs text-muted-foreground flex-shrink-0">
                  {new Date(t.dueDate).toLocaleDateString()}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your personal information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" rows={3} value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={saveEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function StatCard({ icon: Icon, label, value, color, delay }: { icon: any; label: string; value: number; color: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 150 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="bg-background border border-border rounded-xl p-5 flex items-center gap-4 cursor-default"
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}22`, color }}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="font-display text-2xl font-bold"><CountUp to={value} /></div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </motion.div>
  );
}

function ProductivityCard({ value, delay }: { value: number; delay: number }) {
  const r = 26, c = 2 * Math.PI * r;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 150 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="bg-background border border-border rounded-xl p-5 flex items-center gap-4 cursor-default"
    >
      <div className="relative w-16 h-16 flex-shrink-0">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={r} stroke="currentColor" strokeWidth="6" fill="none" className="text-muted" />
          <motion.circle cx="32" cy="32" r={r} stroke="url(#prodGrad)" strokeWidth="6" fill="none" strokeLinecap="round"
            strokeDasharray={c} initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c - (c * value) / 100 }}
            transition={{ duration: 1.5, ease: "easeOut", delay }} />
          <defs>
            <linearGradient id="prodGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6C63FF" />
              <stop offset="100%" stopColor="#00BCD4" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
          <CountUp to={value} />%
        </div>
      </div>
      <div>
        <div className="font-display text-base font-semibold flex items-center gap-1">
          <TrendingUp className="w-4 h-4 text-accent" /> Productivity
        </div>
        <div className="text-xs text-muted-foreground">Score this month</div>
      </div>
    </motion.div>
  );
}
