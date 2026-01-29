import { supabaseAdmin } from "./supabaseAdmin";

type AuthContext = {
  userId: string | null;
  email: string | null;
  role: string | null;
};

export async function getAuthContext(request: Request): Promise<AuthContext> {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "").trim()
    : "";

  if (!token) {
    return { userId: null, email: null, role: null };
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) {
    return { userId: null, email: null, role: null };
  }

  const userId = data.user.id;
  const email = data.user.email ?? null;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  return {
    userId,
    email,
    role: profile?.role ?? null,
  };
}
