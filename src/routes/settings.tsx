import { createFileRoute } from "@tanstack/react-router";
import { Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/nexus/app-shell";
import { ThemeToggle } from "@/components/nexus/theme-toggle";
import { PasswordStrength } from "@/components/nexus/password-strength";
import { useProfile, saveProfile, getInitials } from "@/lib/profile-store";
import { usersApi } from "@/lib/api";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function Card({ title, children, danger }: { title: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <div className={`bg-card border rounded-xl p-6 shadow-card ${danger ? "border-danger/50" : "border-border"}`}>
      <h2 className={`font-display text-lg font-bold mb-4 ${danger ? "text-danger" : ""}`}>{title}</h2>
      {children}
    </div>
  );
}

function Toggle({ label, defaultOn = false }: { label: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm">{label}</span>
      <button onClick={() => setOn((o) => !o)} className={`relative w-11 h-6 rounded-full transition-colors ${on ? "bg-primary" : "bg-muted"}`}>
        <span className={`absolute top-0.5 ${on ? "left-[1.4rem]" : "left-0.5"} w-5 h-5 rounded-full bg-white transition-all`} />
      </button>
    </div>
  );
}

function SettingsPage() {
  const profile = useProfile();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [currentPw, setCurrentPw] = useState("");
  const [pw, setPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(profile.name);
    setEmail(profile.email);
  }, [profile.name, profile.email]);

  const onPickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = async () => {
      await saveProfile({ avatar: r.result as string });
      toast.success("Profile picture updated");
    };
    r.readAsDataURL(file);
  };

  const saveBasics = async () => {
    if (!name.trim() || !email.trim()) { toast.error("Name and email are required"); return; }
    try {
      await usersApi.updateProfile({ fullName: name.trim() });
      saveProfile({ name: name.trim(), email: email.trim() });
      toast.success("Profile saved");
    } catch {
      toast.error("Failed to save profile");
    }
  };

  const updatePw = async () => {
    if (!currentPw) { toast.error("Please enter your current password"); return; }
    if (pw.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (pw !== confirmPw) { toast.error("Passwords don't match"); return; }
    try {
      await usersApi.changePassword({ currentPassword: currentPw, newPassword: pw });
      setCurrentPw(""); setPw(""); setConfirmPw("");
      toast.success("Password updated successfully");
    } catch {
      toast.error("Current password is incorrect");
    }
  };

  const deleteAccount = () => {
    localStorage.clear();
    toast.success("Account deleted");
    setTimeout(() => { window.location.href = "/login"; }, 600);
  };

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold mb-6">Settings</h1>
      <div className="space-y-5 max-w-3xl">
        <Card title="Profile Settings">
          <div className="flex items-center gap-4 mb-4">
            <button type="button" onClick={() => fileRef.current?.click()} className="relative group rounded-full" aria-label="Change profile picture">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center font-display text-2xl font-bold">
                  {getInitials(profile.name)}
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickAvatar} />
            </button>
            <div className="text-sm text-muted-foreground">Click your avatar to upload a new picture.</div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="h-10 px-3 rounded-md bg-muted/50 border border-border text-sm outline-none focus:border-primary" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="h-10 px-3 rounded-md bg-muted/50 border border-border text-sm outline-none focus:border-primary" />
          </div>
          <button onClick={saveBasics} className="mt-4 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Save Changes
          </button>
        </Card>

        <Card title="Security">
          <div className="space-y-3">
            <input type="password" placeholder="Current password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className="w-full h-10 px-3 rounded-md bg-muted/50 border border-border text-sm outline-none focus:border-primary" />
            <input type="password" placeholder="New password" value={pw} onChange={(e) => setPw(e.target.value)} className="w-full h-10 px-3 rounded-md bg-muted/50 border border-border text-sm outline-none focus:border-primary" />
            <PasswordStrength value={pw} />
            <input type="password" placeholder="Confirm new password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className="w-full h-10 px-3 rounded-md bg-muted/50 border border-border text-sm outline-none focus:border-primary" />
          </div>
          <button onClick={updatePw} className="mt-4 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Update Password
          </button>
        </Card>

        <Card title="Notification Preferences">
          <Toggle label="Email notifications" defaultOn />
          <Toggle label="Push notifications" defaultOn />
          <Toggle label="Deadline reminders" defaultOn />
          <Toggle label="Mention alerts" />
          <Toggle label="Weekly digest" defaultOn />
        </Card>

        <Card title="Appearance">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Theme</div>
              <div className="text-xs text-muted-foreground">Choose between dark and light mode.</div>
            </div>
            <ThemeToggle />
          </div>
        </Card>

        <Card title="Danger Zone" danger>
          <p className="text-sm text-muted-foreground mb-4">Once you delete your account, there is no going back.</p>
          <button onClick={() => { setConfirmText(""); setConfirm(true); }} className="px-4 py-2 rounded-md border border-danger text-danger hover:bg-danger/10 text-sm font-medium transition-colors">
            Delete Account
          </button>
        </Card>
      </div>

      {confirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setConfirm(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-surface-elevated border border-danger/50 rounded-xl p-6 shadow-modal">
            <h3 className="font-display text-xl font-bold text-danger">Delete account?</h3>
            <p className="text-sm text-muted-foreground mt-2">Type <span className="font-mono text-foreground">DELETE</span> to confirm.</p>
            <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className="mt-3 w-full h-10 px-3 rounded-md bg-muted/50 border border-border text-sm outline-none focus:border-danger" />
            <div className="mt-4 flex gap-2">
              <button onClick={() => setConfirm(false)} className="flex-1 py-2 rounded-md border border-border hover:bg-muted transition-colors">Cancel</button>
              <button disabled={confirmText !== "DELETE"} onClick={deleteAccount} className="flex-1 py-2 rounded-md bg-danger text-white disabled:opacity-50 hover:bg-danger/90 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}