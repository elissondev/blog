"use server";

import { redirect } from "next/navigation";
import { createClientServer, isSupabaseConfigured } from "@/lib/supabase/server";

export type LoginState = { error?: "invalid" | "config" };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!isSupabaseConfigured()) return { error: "config" };

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextParam = String(formData.get("next") ?? "/admin");
  // evita open-redirect: só permite caminhos internos
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/admin";

  const supabase = await createClientServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "invalid" as const };
  }

  // checagem de role: apenas admin/author autenticados chegam aqui; middleware já protege
  redirect(next);
}

export async function logoutAction() {
  if (!isSupabaseConfigured()) redirect("/");
  const supabase = await createClientServer();
  await supabase.auth.signOut();
  redirect("/");
}
