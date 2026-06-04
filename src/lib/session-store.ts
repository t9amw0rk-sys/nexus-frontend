import { useEffect, useState } from "react";
import { authApi } from "./api";

export type Session = {
  id: string;
  email: string;
  name: string;
  role: "Admin" | "User";
  avatarUrl: string | null;
};

const KEY = "nexus.session";
const EVT = "nexus:session-changed";

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ✅ FIX: login بترجع { session } أو { error } بدل null عشان الـ UI يعرف ليه فشل
export async function login(
  email: string,
  password: string
): Promise<{ session: Session } | { error: string }> {
  try {
    const res = await authApi.login({ email, password });
    const { accessToken, refreshToken, user } = res.data.data;

    const session: Session = {
      id: user.id,
      email: user.email,
      name: user.fullName,
      role: user.role,
      avatarUrl: user.avatarUrl,
    };

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem(KEY, JSON.stringify(session));
    window.dispatchEvent(new CustomEvent(EVT));

    // حدّث الـ profile cache مباشرةً بعد اللوجين
    const { fetchProfile } = await import("./profile-store");
    fetchProfile();

    return { session };
  } catch (e: any) {
    // ✅ FIX: استخرج الرسالة الحقيقية من الـ response
    const message =
      e?.response?.data?.message ??
      e?.message ??
      "Login failed. Please try again.";
    return { error: message };
  }
}

export async function logout() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (refreshToken) {
    try {
      await authApi.logout(refreshToken);
    } catch {}
  }
  localStorage.clear();
  window.dispatchEvent(new CustomEvent(EVT));
}

export function useSession(): Session | null {
  // lazy init — بيقرأ الـ session من أول render مش بعده
  const [s, setS] = useState<Session | null>(() => getSession());

  useEffect(() => {
    const on = () => setS(getSession());
    window.addEventListener(EVT, on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener(EVT, on);
      window.removeEventListener("storage", on);
    };
  }, []);

  return s;
}
