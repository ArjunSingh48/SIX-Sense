CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT 'You',
  author_color TEXT NOT NULL DEFAULT 'bg-emerald-500',
  body TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'channel',
  confidence NUMERIC,
  sources TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.chat_messages TO anon;
GRANT SELECT, INSERT ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat messages readable by all"
  ON public.chat_messages FOR SELECT
  USING (true);

CREATE POLICY "chat messages insertable by all"
  ON public.chat_messages FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_chat_messages_channel_created ON public.chat_messages(channel_id, created_at);