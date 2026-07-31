-- ============================================================
-- QUESTFIT - SCHEMA COMPLETO PARA SUPABASE
-- Cole este arquivo inteiro no SQL Editor do seu projeto Supabase
-- e clique em "RUN". Ele cria tabelas, políticas de segurança
-- (RLS), triggers e views necessárias para o site funcionar.
-- ============================================================

create extension if not exists "uuid-ossp";

-- ---------- PROFILES ----------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  nickname text not null,
  avatar_url text,
  title text default 'Sedentário',
  class text default 'Novato',
  city text,
  country text default 'BR',
  age int,
  sex text check (sex in ('M','F','Outro')),
  height_cm numeric,
  weight_kg numeric,
  role text default 'user' check (role in ('user','admin')),
  banned boolean default false,
  total_xp int default 0,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "profiles são públicos para leitura"
  on profiles for select using (true);

create policy "usuário edita o próprio perfil"
  on profiles for update using (auth.uid() = id);

-- cria o perfil automaticamente quando alguém se cadastra
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, nickname)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1) || substr(new.id::text,1,4)),
    coalesce(new.raw_user_meta_data->>'nickname', split_part(new.email,'@',1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ---------- INTERVIEW ANSWERS (entrevista inicial) ----------
create table if not exists interview_answers (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade unique,
  trains_since text check (trains_since in ('nunca','menos_6_meses','6_meses_mais')),
  pushups_max int default 0,
  pullups_max int default 0,
  run_time_1km numeric,
  run_time_3km numeric,
  weekly_frequency int default 0,
  sleep_hours numeric,
  diet_quality text check (diet_quality in ('ruim','media','boa')),
  goal text,
  injuries text,
  experience_level text check (experience_level in ('iniciante','intermediario','avancado')),
  created_at timestamptz default now()
);

alter table interview_answers enable row level security;
create policy "usuário vê a própria entrevista"
  on interview_answers for select using (auth.uid() = profile_id);
create policy "usuário insere a própria entrevista"
  on interview_answers for insert with check (auth.uid() = profile_id);
create policy "usuário atualiza a própria entrevista"
  on interview_answers for update using (auth.uid() = profile_id);

-- ---------- ATTRIBUTES (atributos calculados) ----------
create table if not exists attributes (
  profile_id uuid primary key references profiles(id) on delete cascade,
  strength int default 0,
  speed int default 0,
  potential int default 400,
  intelligence int default 0,
  endurance int default 0,
  muscle_scores jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table attributes enable row level security;
create policy "atributos são públicos para leitura"
  on attributes for select using (true);
create policy "usuário atualiza os próprios atributos"
  on attributes for update using (auth.uid() = profile_id);
create policy "usuário insere os próprios atributos"
  on attributes for insert with check (auth.uid() = profile_id);

-- ---------- MEASUREMENTS (histórico de testes físicos) ----------
create table if not exists measurements (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade,
  pushups_max int,
  pullups_max int,
  run_time_1km numeric,
  run_time_3km numeric,
  cooper_12min_m numeric,
  bench_1rm numeric,
  squat_1rm numeric,
  deadlift_1rm numeric,
  dips_max int,
  squat_reps_bodyweight int,
  plank_seconds numeric,
  continuous_run_min numeric,
  recorded_at timestamptz default now()
);

alter table measurements enable row level security;
create policy "usuário vê as próprias medidas"
  on measurements for select using (auth.uid() = profile_id);
create policy "usuário insere as próprias medidas"
  on measurements for insert with check (auth.uid() = profile_id);

-- ---------- WORKOUTS (treinos registrados) ----------
create table if not exists workouts (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade,
  type text not null,
  notes text,
  personal_record boolean default false,
  created_at timestamptz default now()
);

alter table workouts enable row level security;
create policy "usuário vê os próprios treinos"
  on workouts for select using (auth.uid() = profile_id);
create policy "usuário insere os próprios treinos"
  on workouts for insert with check (auth.uid() = profile_id);

-- ---------- XP LOG ----------
create table if not exists xp_log (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade,
  amount int not null,
  reason text not null,
  created_at timestamptz default now()
);

alter table xp_log enable row level security;
create policy "usuário vê o próprio histórico de xp"
  on xp_log for select using (auth.uid() = profile_id);
create policy "usuário insere o próprio xp"
  on xp_log for insert with check (auth.uid() = profile_id);

-- ---------- MISSIONS ----------
create table if not exists missions (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  type text check (type in ('diaria','semanal','mensal','especial')) not null,
  target_stat text check (target_stat in ('strength','speed','potential','intelligence','endurance')) not null,
  xp_reward int default 20,
  attribute_bonus int default 10,
  active boolean default true,
  created_at timestamptz default now()
);

alter table missions enable row level security;
create policy "missões são públicas para leitura"
  on missions for select using (true);
create policy "só admin cria/edita missões"
  on missions for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ---------- USER_MISSIONS (conclusões) ----------
create table if not exists user_missions (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade,
  mission_id uuid references missions(id) on delete cascade,
  period_key text not null, -- ex: '2026-07-30' (diária), '2026-W31' (semanal), '2026-07' (mensal), 'unica' (especial)
  completed_at timestamptz default now(),
  unique (profile_id, mission_id, period_key)
);

alter table user_missions enable row level security;
create policy "usuário vê as próprias missões concluídas"
  on user_missions for select using (auth.uid() = profile_id);
create policy "usuário conclui as próprias missões"
  on user_missions for insert with check (auth.uid() = profile_id);
create policy "usuário desfaz a própria missão"
  on user_missions for delete using (auth.uid() = profile_id);

-- ---------- ACHIEVEMENTS ----------
create table if not exists achievements (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  icon text default '🏆',
  requirement_type text not null, -- ex: 'workouts_count','pushups_total','km_run_total','pullups_total','bench_bodyweight'
  requirement_value numeric not null
);

alter table achievements enable row level security;
create policy "conquistas são públicas para leitura"
  on achievements for select using (true);
create policy "só admin edita conquistas"
  on achievements for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create table if not exists user_achievements (
  profile_id uuid references profiles(id) on delete cascade,
  achievement_id uuid references achievements(id) on delete cascade,
  unlocked_at timestamptz default now(),
  primary key (profile_id, achievement_id)
);

alter table user_achievements enable row level security;
create policy "conquistas desbloqueadas são públicas para leitura"
  on user_achievements for select using (true);
create policy "usuário desbloqueia a própria conquista"
  on user_achievements for insert with check (auth.uid() = profile_id);

-- ---------- SEED: missões padrão ----------
insert into missions (title, description, type, target_stat, xp_reward, attribute_bonus) values
('Fazer 50 flexões no dia', 'Pode ser em séries ao longo do dia', 'diaria', 'strength', 20, 8),
('Correr 3 km', 'Ritmo livre', 'diaria', 'endurance', 25, 10),
('Dormir 8 horas', 'Registre depois de acordar', 'diaria', 'endurance', 15, 3),
('Beber 3 litros de água', '', 'diaria', 'endurance', 10, 2),
('Alongar por 15 minutos', '', 'diaria', 'endurance', 10, 2),
('Estudar sobre treino ou nutrição por 20 min', 'Vídeo, artigo ou livro', 'diaria', 'intelligence', 20, 8),
('Completar todos os treinos da semana', '', 'semanal', 'potential', 80, 20),
('Bater recorde pessoal em qualquer exercício', 'Registre no diário de treinos', 'especial', 'strength', 80, 25),
('Treinar 7 dias seguidos', 'Combo de disciplina', 'semanal', 'potential', 100, 30)
on conflict do nothing;

-- ---------- SEED: conquistas padrão ----------
insert into achievements (title, description, icon, requirement_type, requirement_value) values
('Primeiro Treino', 'Registrou o primeiro treino no sistema', '🎖️', 'workouts_count', 1),
('Veterano', 'Completou 100 treinos', '🏅', 'workouts_count', 100),
('Mil Flexões', 'Somou 1000 flexões registradas', '💪', 'pushups_total', 1000),
('100 km Corridos', 'Somou 100km de corrida registrados', '🏃', 'km_run_total', 100),
('Primeira Barra', 'Fez sua primeira barra fixa', '🧗', 'pullups_total', 1),
('Centena de Barras', 'Somou 100 barras fixas', '🧗‍♂️', 'pullups_total', 100),
('Peso Corporal no Supino', 'Supino igual ou maior que o próprio peso', '🏋️', 'bench_bodyweight', 1)
on conflict do nothing;

-- ---------- VIEW: leaderboard (ranking público) ----------
create or replace view leaderboard as
select
  p.id as profile_id,
  p.username,
  p.nickname,
  p.avatar_url,
  p.title,
  p.class,
  p.city,
  p.country,
  p.total_xp,
  a.strength,
  a.speed,
  a.potential,
  a.intelligence,
  a.endurance,
  (a.strength + a.speed + a.potential + a.intelligence + a.endurance) as power_total
from profiles p
left join attributes a on a.profile_id = p.id
where p.banned = false;

-- ---------- FUNÇÃO: dar XP e atualizar total_xp do perfil ----------
create or replace function grant_xp(p_profile_id uuid, p_amount int, p_reason text)
returns void as $$
begin
  insert into xp_log (profile_id, amount, reason) values (p_profile_id, p_amount, p_reason);
  update profiles set total_xp = total_xp + p_amount where id = p_profile_id;
end;
$$ language plpgsql security definer;

-- FIM DO SCRIPT
