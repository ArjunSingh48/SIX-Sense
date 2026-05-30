
-- pgvector already enabled in this project

-- 1) documents: add RAG fields, open access for demo
alter table public.documents add column if not exists content text;
alter table public.documents add column if not exists summary text;
alter table public.documents add column if not exists embedding vector(1536);

drop policy if exists "docs visible per access level" on public.documents;
drop policy if exists "owners or admins update docs" on public.documents;
drop policy if exists "users insert own docs" on public.documents;

create policy "docs public read" on public.documents for select using (true);
create policy "docs public insert" on public.documents for insert with check (true);
create policy "docs public update" on public.documents for update using (true);

grant select, insert, update on public.documents to anon, authenticated;
grant all on public.documents to service_role;

create index if not exists documents_embedding_idx
  on public.documents using hnsw (embedding vector_cosine_ops);

-- 2) chat_messages: thread_id for grouping twin conversations
alter table public.chat_messages add column if not exists thread_id text;
create index if not exists chat_messages_thread_idx on public.chat_messages(thread_id);

-- 3) project_tasks (Jira-style)
create table if not exists public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  external_key text,
  source text not null default 'manual',
  title text not null,
  description text default '',
  status text not null default 'todo',
  progress int not null default 0,
  priority text default 'medium',
  assignee_name text default 'You',
  project text default 'SIX',
  due_at timestamptz,
  url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.project_tasks to anon, authenticated;
grant all on public.project_tasks to service_role;
alter table public.project_tasks enable row level security;
create policy "tasks public all" on public.project_tasks for all using (true) with check (true);

-- 4) performance_reports
create table if not exists public.performance_reports (
  id uuid primary key default gen_random_uuid(),
  kind text not null,                -- 'handover' | 'onboarding' | 'performance' | 'dashboard'
  title text not null,
  summary text default '',
  content jsonb not null default '{}'::jsonb,
  author_name text default 'You',
  recipients text[] default array[]::text[],
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.performance_reports to anon, authenticated;
grant all on public.performance_reports to service_role;
alter table public.performance_reports enable row level security;
create policy "reports public all" on public.performance_reports for all using (true) with check (true);

-- 5) match_documents RAG function
create or replace function public.match_documents(
  query_embedding vector(1536),
  match_count int default 5
)
returns table (id uuid, original_name text, content text, summary text, similarity float)
language sql stable
as $$
  select d.id, d.original_name, d.content, d.summary,
         1 - (d.embedding <=> query_embedding) as similarity
  from public.documents d
  where d.embedding is not null
  order by d.embedding <=> query_embedding
  limit match_count;
$$;

-- 6) Storage bucket for uploaded files
insert into storage.buckets (id, name, public)
values ('kb-docs', 'kb-docs', true)
on conflict (id) do nothing;

create policy "kb-docs public read"
  on storage.objects for select using (bucket_id = 'kb-docs');
create policy "kb-docs public upload"
  on storage.objects for insert with check (bucket_id = 'kb-docs');
