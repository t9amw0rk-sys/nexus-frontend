import { useEffect, useState } from "react";
import { getSession } from "./session-store";
import { usersApi } from "./api";
import { toast } from "sonner";

export type ProfileData = {
  name: string;
  email: string;
  bio: string;
  avatar: string | null;
};

const BANNER_KEY = "nexus.profile.banner";
const AVATAR_KEY = "nexus.profile.avatar";  // ✅ FIX: نحفظ الصورة لوكالي
const BANNER_EVT = "nexus:banner-changed";
const EVT = "nexus:profile-changed";

let _cache: ProfileData | null = null;

function getDefault(): ProfileData {
  const s = getSession();
  // ✅ FIX: نقرأ الصورة من localStorage أول
  const savedAvatar = typeof window !== "undefined"
    ? localStorage.getItem(AVATAR_KEY)
    : null;
  return {
    name: s?.name ?? "",
    email: s?.email ?? "",
    bio: "",
    avatar: savedAvatar ?? s?.avatarUrl ?? null,
  };
}

export async function fetchProfile(): Promise<ProfileData> {
  try {
    const res = await usersApi.getMe();
    const u = res.data.data;
    // ✅ FIX: لو الـ API عنده avatarUrl نستخدمه، لو لأ نرجع للـ localStorage
    const savedAvatar = typeof window !== "undefined"
      ? localStorage.getItem(AVATAR_KEY)
      : null;
    _cache = {
      name: u.fullName ?? "",
      email: u.email ?? "",
      bio: u.bio ?? "",
      avatar: u.avatarUrl ?? savedAvatar ?? null,
    };
    window.dispatchEvent(new CustomEvent(EVT));
    return _cache;
  } catch {
    return _cache ?? getDefault();
  }
}

export function getCachedProfile(): ProfileData {
  return _cache ?? getDefault();
}

export async function saveProfile(next: Partial<ProfileData>): Promise<void> {
  // ✅ FIX: لو فيه avatar جديد، احفظه في localStorage عشان يفضل بعد الـ refresh
  if (next.avatar !== undefined) {
    try {
      if (next.avatar) {
        localStorage.setItem(AVATAR_KEY, next.avatar);
      } else {
        localStorage.removeItem(AVATAR_KEY);
      }
    } catch {
      toast.error("Image is too large to save locally.");
      return;
    }
  }

  // بعت للـ API اللي مش صور base64
  try {
    const apiPayload: { fullName?: string; avatarUrl?: string } = {};
    if (next.name) apiPayload.fullName = next.name;
    // مش بنبعت base64 للـ API — بس لو كان URL حقيقي
    if (next.avatar && !next.avatar.startsWith("data:")) {
      apiPayload.avatarUrl = next.avatar;
    }
    if (Object.keys(apiPayload).length > 0) {
      await usersApi.updateProfile(apiPayload);
    }
  } catch {}

  _cache = { ...getCachedProfile(), ...next };
  window.dispatchEvent(new CustomEvent(EVT));
}

export function useProfile(): ProfileData {
  const [data, setData] = useState<ProfileData>(getCachedProfile());

  useEffect(() => {
    fetchProfile().then(setData);
    const onChange = () => setData(getCachedProfile());
    window.addEventListener(EVT, onChange);
    return () => window.removeEventListener(EVT, onChange);
  }, []);

  return data;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase() || "U";
}

export function saveBanner(dataUrl: string | null) {
  try {
    if (dataUrl) {
      localStorage.setItem(BANNER_KEY, dataUrl);
    } else {
      localStorage.removeItem(BANNER_KEY);
    }
    window.dispatchEvent(new CustomEvent(BANNER_EVT));
  } catch {
    toast.error("Image is too large to save. Please choose a smaller image (under 1MB).");
  }
}

export function useBanner(): string | null {
  const [b, setB] = useState<string | null>(null);
  useEffect(() => {
    const read = () => setB(localStorage.getItem(BANNER_KEY));
    read();
    window.addEventListener(BANNER_EVT, read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(BANNER_EVT, read);
      window.removeEventListener("storage", read);
    };
  }, []);
  return b;
}