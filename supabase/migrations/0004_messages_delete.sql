-- Allow a user to delete their own messages (needed for the "clear chat" feature).

drop policy if exists "Users can delete own messages" on public.messages;
create policy "Users can delete own messages"
  on public.messages for delete
  using (auth.uid() = user_id);
