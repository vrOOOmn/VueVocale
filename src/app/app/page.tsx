import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import App from "../../App";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/app");
  }

  const meta = user.user_metadata ?? {};

  return (
    <App
      user={{
        id: user.id,
        email: user.email ?? null,
        name: (meta.full_name as string) || (meta.name as string) || null,
        avatarUrl: (meta.avatar_url as string) || (meta.picture as string) || null,
      }}
    />
  );
}
