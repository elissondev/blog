import {
  isSupabaseConfigured,
  createClientServer,
} from "@/lib/supabase/server";
import { ProfileManager } from "@/components/admin/profile-manager";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  if (!isSupabaseConfigured()) {
    return (
      <section className="max-w-2xl space-y-2">
        <h1 className="font-serif text-2xl font-bold">Meu perfil</h1>
        <p className="text-sm text-muted-foreground">
          Configure o Supabase para editar as informações públicas do perfil.
        </p>
      </section>
    );
  }

  const supabase = await createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, description, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <section className="max-w-2xl space-y-5">
      <div>
        <h1 className="font-serif text-2xl font-bold">Meu perfil</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Nome, descrição e foto exibidos na página pública do autor.
        </p>
      </div>
      <ProfileManager
        fullName={profile?.full_name ?? user.user_metadata.full_name ?? ""}
        description={profile?.description ?? ""}
        avatarUrl={profile?.avatar_url ?? null}
      />
    </section>
  );
}
