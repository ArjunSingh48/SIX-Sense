
-- Extensions
create extension if not exists vector;

-- Enums
create type public.app_role as enum ('employee','manager','compliance_officer','sme','admin');
create type public.access_level as enum ('public','department','restricted','executive');
create type public.doc_status as enum ('processing','ready','failed');
create type public.validation_status as enum ('draft','validated','needs_review','archived');
create type public.facet_kind as enum ('topic','decision','risk','action','stakeholder','business_context');
create type public.question_status as enum ('answered','clarify','escalated','insufficient');
create type public.escalation_status as enum ('open','acknowledged','resolved');
create type public.activity_kind as enum ('ticket','meeting','doc','decision');
create type public.risk_signal_kind as enum ('leaving','spof','concentration','missing_docs');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  department text not null default 'General',
  job_title text not null default '',
  avatar_url text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles readable by authenticated" on public.profiles for select to authenticated using (true);
create policy "users update own profile" on public.profiles for update to authenticated using (id = auth.uid());
create policy "users insert own profile" on public.profiles for insert to authenticated with check (id = auth.uid());

-- Roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique(user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "users see own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.user_roles where user_id = _user_id and role = _role);
$$;

create or replace function public.same_department(_user_id uuid, _dept text)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = _user_id and department = _dept);
$$;

-- Signup trigger -> profile + employee role
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, department, job_title)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'department','General'),
    coalesce(new.raw_user_meta_data->>'job_title','Employee')
  );
  insert into public.user_roles (user_id, role) values (new.id, 'employee');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- Documents
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  department text not null default 'General',
  file_path text,
  mime text,
  original_name text not null,
  status public.doc_status not null default 'processing',
  access_level public.access_level not null default 'department',
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.documents to authenticated;
grant all on public.documents to service_role;
alter table public.documents enable row level security;
create policy "docs visible per access level" on public.documents for select to authenticated using (
  access_level = 'public'
  or (access_level = 'department' and public.same_department(auth.uid(), department))
  or owner_id = auth.uid()
  or public.has_role(auth.uid(),'compliance_officer')
  or public.has_role(auth.uid(),'admin')
);
create policy "users insert own docs" on public.documents for insert to authenticated with check (owner_id = auth.uid());
create policy "owners or admins update docs" on public.documents for update to authenticated using (owner_id = auth.uid() or public.has_role(auth.uid(),'admin'));

-- Knowledge cards
create table public.knowledge_cards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null default '',
  reasoning text not null default '',
  owner_id uuid references auth.users(id) on delete set null,
  department text not null default 'General',
  access_level public.access_level not null default 'department',
  confidence numeric(4,2) not null default 0.0,
  validation_status public.validation_status not null default 'draft',
  last_reviewed_at timestamptz,
  embedding vector(1536),
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.knowledge_cards to authenticated;
grant all on public.knowledge_cards to service_role;
alter table public.knowledge_cards enable row level security;
create policy "cards visible per access level" on public.knowledge_cards for select to authenticated using (
  access_level = 'public'
  or (access_level = 'department' and public.same_department(auth.uid(), department))
  or (access_level = 'restricted' and (owner_id = auth.uid() or public.has_role(auth.uid(),'compliance_officer') or public.has_role(auth.uid(),'admin')))
  or (access_level = 'executive' and (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'manager')))
);
create policy "users insert cards" on public.knowledge_cards for insert to authenticated with check (owner_id = auth.uid());
create policy "owners or compliance update cards" on public.knowledge_cards for update to authenticated using (
  owner_id = auth.uid() or public.has_role(auth.uid(),'compliance_officer') or public.has_role(auth.uid(),'admin')
);

create table public.knowledge_card_sources (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.knowledge_cards(id) on delete cascade,
  document_id uuid references public.documents(id) on delete set null,
  snippet text not null default '',
  page int
);
grant select, insert, update, delete on public.knowledge_card_sources to authenticated;
grant all on public.knowledge_card_sources to service_role;
alter table public.knowledge_card_sources enable row level security;
create policy "sources follow card" on public.knowledge_card_sources for select to authenticated using (
  exists(select 1 from public.knowledge_cards c where c.id = card_id)
);
create policy "sources insert by authenticated" on public.knowledge_card_sources for insert to authenticated with check (true);

create table public.knowledge_card_facets (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.knowledge_cards(id) on delete cascade,
  kind public.facet_kind not null,
  value text not null
);
grant select, insert, update, delete on public.knowledge_card_facets to authenticated;
grant all on public.knowledge_card_facets to service_role;
alter table public.knowledge_card_facets enable row level security;
create policy "facets follow card" on public.knowledge_card_facets for select to authenticated using (
  exists(select 1 from public.knowledge_cards c where c.id = card_id)
);
create policy "facets insert by authenticated" on public.knowledge_card_facets for insert to authenticated with check (true);

create table public.knowledge_relations (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.knowledge_cards(id) on delete cascade,
  related_card_id uuid not null references public.knowledge_cards(id) on delete cascade,
  relation_type text not null default 'related'
);
grant select, insert, update, delete on public.knowledge_relations to authenticated;
grant all on public.knowledge_relations to service_role;
alter table public.knowledge_relations enable row level security;
create policy "relations readable" on public.knowledge_relations for select to authenticated using (true);

-- Questions
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  asker_id uuid references auth.users(id) on delete set null,
  body text not null,
  confidence numeric(4,2) not null default 0.0,
  answer text not null default '',
  reasoning text not null default '',
  missing_info text not null default '',
  status public.question_status not null default 'answered',
  created_at timestamptz not null default now()
);
grant select, insert, update on public.questions to authenticated;
grant all on public.questions to service_role;
alter table public.questions enable row level security;
create policy "users see own questions" on public.questions for select to authenticated using (
  asker_id = auth.uid() or public.has_role(auth.uid(),'compliance_officer') or public.has_role(auth.uid(),'admin')
);
create policy "users insert questions" on public.questions for insert to authenticated with check (asker_id = auth.uid());

create table public.question_sources (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  card_id uuid references public.knowledge_cards(id) on delete set null,
  weight numeric(4,2) not null default 1.0
);
grant select, insert on public.question_sources to authenticated;
grant all on public.question_sources to service_role;
alter table public.question_sources enable row level security;
create policy "question sources readable" on public.question_sources for select to authenticated using (true);
create policy "question sources insert" on public.question_sources for insert to authenticated with check (true);

-- Escalations
create table public.escalations (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references public.questions(id) on delete set null,
  sme_id uuid references auth.users(id) on delete set null,
  sme_name text not null default '',
  sme_department text not null default '',
  sme_role text not null default '',
  status public.escalation_status not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
grant select, insert, update on public.escalations to authenticated;
grant all on public.escalations to service_role;
alter table public.escalations enable row level security;
create policy "escalations readable" on public.escalations for select to authenticated using (true);
create policy "escalations insert" on public.escalations for insert to authenticated with check (true);

-- Audit log
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  actor_name text not null default '',
  action text not null,
  entity_type text not null,
  entity_id uuid,
  diff jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
grant select, insert on public.audit_log to authenticated;
grant all on public.audit_log to service_role;
alter table public.audit_log enable row level security;
create policy "audit visible to compliance" on public.audit_log for select to authenticated using (
  public.has_role(auth.uid(),'compliance_officer') or public.has_role(auth.uid(),'admin')
);
create policy "audit insert by authenticated" on public.audit_log for insert to authenticated with check (true);

-- Employee activity (digital twin)
create table public.employee_activity (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references auth.users(id) on delete cascade,
  employee_name text not null default '',
  department text not null default 'General',
  kind public.activity_kind not null,
  title text not null,
  occurred_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb
);
grant select, insert on public.employee_activity to authenticated;
grant all on public.employee_activity to service_role;
alter table public.employee_activity enable row level security;
create policy "activity readable" on public.employee_activity for select to authenticated using (true);
create policy "activity insert" on public.employee_activity for insert to authenticated with check (true);

-- Onboarding packs
create table public.onboarding_packs (
  id uuid primary key default gen_random_uuid(),
  target_role text not null,
  department text not null,
  generated_at timestamptz not null default now(),
  content jsonb not null default '{}'::jsonb
);
grant select, insert on public.onboarding_packs to authenticated;
grant all on public.onboarding_packs to service_role;
alter table public.onboarding_packs enable row level security;
create policy "packs readable" on public.onboarding_packs for select to authenticated using (true);
create policy "packs insert" on public.onboarding_packs for insert to authenticated with check (true);

-- Risk signals
create table public.risk_signals (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references auth.users(id) on delete cascade,
  employee_name text not null default '',
  department text not null default 'General',
  signal public.risk_signal_kind not null,
  severity int not null default 1,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
grant select, insert on public.risk_signals to authenticated;
grant all on public.risk_signals to service_role;
alter table public.risk_signals enable row level security;
create policy "risk readable" on public.risk_signals for select to authenticated using (
  public.has_role(auth.uid(),'manager') or public.has_role(auth.uid(),'compliance_officer') or public.has_role(auth.uid(),'admin')
);
create policy "risk insert" on public.risk_signals for insert to authenticated with check (true);
