-- Durable "did the user actually chat today" flag, decoupled from the
-- current message count. message_count/grammar_correction_count (set at
-- archive time) reflect whatever's in `messages` right now, so clearing a
-- conversation's messages would otherwise make a genuinely active day look
-- inactive for streak purposes. has_activity is set once by trigger on the
-- first message insert and is never cleared by deleting messages.

alter table public.conversations
  add column if not exists has_activity boolean not null default false;

create or replace function public.mark_conversation_active()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set has_activity = true
  where id = new.conversation_id and has_activity = false;
  return new;
end;
$$;

drop trigger if exists on_message_insert_mark_active on public.messages;
create trigger on_message_insert_mark_active
  after insert on public.messages
  for each row execute function public.mark_conversation_active();
