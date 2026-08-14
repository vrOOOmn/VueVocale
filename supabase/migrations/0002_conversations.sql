-- Conversations: one "live" (active) conversation per user, representing today's
-- practice. On day rollover, the active conversation is archived with an
-- LLM-generated summary and a fresh one is started for the new day.

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'archived')),
  conversation_date date not null,
  summary text,
  topics text[],
  grammar_correction_count int not null default 0,
  message_count int not null default 0,
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

alter table public.conversations enable row level security;

drop policy if exists "Users can view own conversations" on public.conversations;
create policy "Users can view own conversations"
  on public.conversations for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own conversations" on public.conversations;
create policy "Users can insert own conversations"
  on public.conversations for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own conversations" on public.conversations;
create policy "Users can update own conversations"
  on public.conversations for update
  using (auth.uid() = user_id);

-- Enforce "exactly one active conversation per user" at the DB level.
drop index if exists conversations_one_active_per_user;
create unique index conversations_one_active_per_user
  on public.conversations (user_id)
  where status = 'active';

-- List a user's archived days, most recent first.
drop index if exists conversations_user_archived_idx;
create index conversations_user_archived_idx
  on public.conversations (user_id, conversation_date desc)
  where status = 'archived';


create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  seq bigserial,
  sender text not null check (sender in ('user', 'bot')),
  text text,
  image_path text,
  audio_path text,
  object_label text,
  grammar_status text not null default 'idle'
    check (grammar_status in ('idle', 'ok', 'fixed', 'error')),
  grammar_fix text,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

drop policy if exists "Users can view own messages" on public.messages;
create policy "Users can view own messages"
  on public.messages for select
  using (auth.uid() = user_id);

-- Insert requires the user to own both the message and the target conversation,
-- closing the gap where user_id matches but conversation_id belongs to someone else.
drop policy if exists "Users can insert own messages" on public.messages;
create policy "Users can insert own messages"
  on public.messages for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  );

drop policy if exists "Users can update own messages" on public.messages;
create policy "Users can update own messages"
  on public.messages for update
  using (auth.uid() = user_id);

drop index if exists messages_conversation_seq_idx;
create index messages_conversation_seq_idx
  on public.messages (conversation_id, seq);
