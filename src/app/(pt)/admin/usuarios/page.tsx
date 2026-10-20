import {
  isSupabaseConfigured,
  createClientServer,
} from "@/lib/supabase/server";
import { ProfileManager } from "@/components/admin/profile-manager";

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
    .select(
      "full_name, description, description_en, description_es, article_description, article_description_en, article_description_es, avatar_url",
    )
    .eq("id", user.id)
    .maybeSingle();

  return (
    <section className="max-w-2xl space-y-5">
      <div>
        <h1 className="font-serif text-2xl font-bold">Meu perfil</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure nome, foto e descrições independentes para a página do autor
          e para o final dos artigos.
        </p>
      </div>
      <ProfileManager
        fullName={profile?.full_name ?? user.user_metadata.full_name ?? ""}
        description={profile?.description ?? ""}
        descriptionEn={profile?.description_en ?? ""}
        descriptionEs={profile?.description_es ?? ""}
        articleDescription={profile?.article_description ?? ""}
        articleDescriptionEn={profile?.article_description_en ?? ""}
        articleDescriptionEs={profile?.article_description_es ?? ""}
        avatarUrl={profile?.avatar_url ?? null}
      />
    </section>
  );
}
