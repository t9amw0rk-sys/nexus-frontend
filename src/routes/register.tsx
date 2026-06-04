import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Mail, Lock, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AuthSplit } from "@/components/nexus/auth-split";
import { Field } from "./login";
import { PasswordStrength } from "@/components/nexus/password-strength";
import { GoogleButton, OrDivider } from "@/components/nexus/google-button";
import { login as doLogin } from "@/lib/session-store";
import { authApi } from "@/lib/api";

export const Route = createFileRoute("/register")({ component: Register });

function Register() {
  const nav = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");

    if (!fullName.trim()) { setErr("Full name is required"); return; }
    if (!email.trim()) { setErr("Email is required"); return; }
    if (pw.length < 8) { setErr("Password must be at least 8 characters"); return; }
    if (pw !== confirmPw) { setErr("Passwords don't match"); return; }

    setLoading(true);
    try {
      // Step 1: سجّل الـ account
      await authApi.register({ fullName, email, password: pw });
    } catch (e: any) {
      // ✅ FIX: لو الـ register فشل (مثلاً email موجود) نوقف هنا ونعرض السبب
      setErr(e?.response?.data?.message ?? "Registration failed. Please try again.");
      setLoading(false);
      return;
    }

    // Step 2: سجّل دخول تلقائياً بعد الـ register
    // ✅ FIX: استخدام الـ result object الجديد بدل null check
    const result = await doLogin(email, pw);
    setLoading(false);

    if ("error" in result) {
      // Register نجح بس login فشل — خليه يدخل يدوي
      toast.success("Account created! Please sign in.");
      nav({ to: "/login" });
      return;
    }

    toast.success("Account created successfully!");
    nav({ to: "/dashboard" });
  };

  return (
    <AuthSplit>
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onSubmit={submit}
        className="w-full max-w-sm bg-card border border-border rounded-xl p-8 shadow-card"
      >
        <h1 className="font-display text-2xl font-bold">Create your account</h1>
        <p className="text-sm text-muted-foreground mt-1">Get started in minutes</p>
        <div className="mt-6 space-y-4">
          <GoogleButton label="Continue with Google" />
          <OrDivider />
          <Field icon={<User className="w-4 h-4" />}>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              className="bg-transparent outline-none w-full text-sm"
            />
          </Field>
          <Field icon={<Mail className="w-4 h-4" />}>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email"
              className="bg-transparent outline-none w-full text-sm"
            />
          </Field>
          <Field icon={<Lock className="w-4 h-4" />}>
            <input
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              type="password"
              placeholder="Password"
              className="bg-transparent outline-none w-full text-sm"
            />
          </Field>
          <PasswordStrength value={pw} />
          <Field icon={<Lock className="w-4 h-4" />}>
            <input
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              type="password"
              placeholder="Confirm password"
              className="bg-transparent outline-none w-full text-sm"
            />
          </Field>
          {err && <p className="text-xs text-danger">{err}</p>}
          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <input type="checkbox" required className="accent-primary mt-0.5" />
            I agree to the{" "}
            <a className="text-primary hover:underline">Terms of Service</a> and{" "}
            <a className="text-primary hover:underline">Privacy Policy</a>
          </label>
          <button
            disabled={loading}
            className="w-full py-2.5 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </motion.form>
    </AuthSplit>
  );
}
