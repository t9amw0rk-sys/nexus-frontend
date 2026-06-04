import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AuthSplit } from "@/components/nexus/auth-split";
import { Field } from "./login";
import { PasswordStrength } from "@/components/nexus/password-strength";

export const Route = createFileRoute("/reset-password")({ component: Reset });

function Reset() {
  const nav = useNavigate();
  const [pw, setPw] = useState("");
  return (
    <AuthSplit>
      <motion.form initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} onSubmit={e=>{e.preventDefault(); toast.success("Password updated successfully ✅"); nav({to:"/login"});}} className="w-full max-w-sm bg-card border border-border rounded-xl p-8 shadow-card">
        <h1 className="font-display text-2xl font-bold">Set new password</h1>
        <p className="text-sm text-muted-foreground mt-1">Choose a strong password.</p>
        <div className="mt-6 space-y-4">
          <Field icon={<Lock className="w-4 h-4"/>}><input value={pw} onChange={e=>setPw(e.target.value)} type="password" placeholder="New password" className="bg-transparent outline-none w-full text-sm"/></Field>
          <PasswordStrength value={pw}/>
          <Field icon={<Lock className="w-4 h-4"/>}><input type="password" placeholder="Confirm new password" className="bg-transparent outline-none w-full text-sm"/></Field>
          <button className="w-full py-2.5 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90">Reset Password</button>
        </div>
      </motion.form>
    </AuthSplit>
  );
}
