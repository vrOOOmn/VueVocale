import { createClient } from "../../../../lib/supabase/server";
import { archiveConversation } from "../../../../lib/conversations/archiveConversation";

export const runtime = "nodejs";

const UNIQUE_VIOLATION = "23505";

export async function POST(request: Request) {
  const { localDate } = await request.json().catch(() => ({}));
  if (typeof localDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(localDate)) {
    return new Response("Invalid localDate", { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data: active, error: activeError } = await supabase
    .from("conversations")
    .select("id, conversation_date")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (activeError) {
    console.error(activeError);
    return new Response("Failed to look up active conversation", { status: 500 });
  }

  if (active && active.conversation_date === localDate) {
    return Response.json({ id: active.id, conversationDate: active.conversation_date });
  }

  if (active) {
    try {
      await archiveConversation(supabase, active.id);
    } catch (err) {
      console.error("Failed to archive stale conversation", err);
      return new Response("Failed to archive stale conversation", { status: 500 });
    }
  }

  const { data: created, error: insertError } = await supabase
    .from("conversations")
    .insert({ user_id: user.id, conversation_date: localDate, status: "active" })
    .select("id, conversation_date")
    .single();

  if (!insertError && created) {
    return Response.json({ id: created.id, conversationDate: created.conversation_date });
  }

  if (insertError?.code === UNIQUE_VIOLATION) {
    const { data: existing, error: existingError } = await supabase
      .from("conversations")
      .select("id, conversation_date")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (!existingError && existing) {
      return Response.json({ id: existing.id, conversationDate: existing.conversation_date });
    }
  }

  console.error(insertError);
  return new Response("Failed to start today's conversation", { status: 500 });
}
