import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { AuthSplit } from "@/components/nexus/auth-split";
import { Field } from "./login";

export const Route = createFileRoute("/forgot-password")({ component: Forgot });

function Forgot() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <AuthSplit>
      <motion.form initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} onSubmit={e=>{e.preventDefault(); setSent(true);}} className="w-full max-w-sm bg-card border border-border rounded-xl p-8 shadow-card">
        {!sent ? <>
          <h1 className="font-display text-2xl font-bold">Forgot your password?</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter your email and we'll send you a reset link.</p>
          <div className="mt-6 space-y-4">
            <Field icon={<Mail className="w-4 h-4"/>}><input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="Email" className="bg-transparent outline-none w-full text-sm"/></Field>
            <button className="w-full py-2.5 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90">Send Reset Link</button>
            <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4"/> Back to Login</Link>
          </div>
        </> : (
          <div className="text-center py-4">
            <CheckCircle2 className="w-14 h-14 text-success mx-auto" />
            <h2 className="font-display text-xl font-bold mt-4">Check your inbox!</h2>
            <p className="text-sm text-muted-foreground mt-2">We sent a link to <span className="text-foreground">{email}</span></p>
            <Link to="/login" className="mt-6 inline-block text-primary text-sm hover:underline">← Back to Login</Link>
          </div>
        )}
      </motion.form>
    </AuthSplit>
  );
}
