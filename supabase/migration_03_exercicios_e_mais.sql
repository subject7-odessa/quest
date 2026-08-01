-- ============================================================
-- QUESTFIT — MIGRAÇÃO 03
-- Sistema de exercícios por músculo, esportes/artes marciais,
-- teste de inteligência, e mais missões diárias pro sorteio.
-- Cole no SQL Editor do Supabase e clique RUN.
-- ============================================================

-- ---------- EXERCISE_LOGS (cada exercício ranking músculos específicos) ----------
create table if not exists exercise_logs (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade,
  exercise_key text not null,
  value numeric not null,
  recorded_at timestamptz default now()
);
alter table exercise_logs enable row level security;
create policy "usuário vê os próprios exercícios" on exercise_logs for select using (auth.uid() = profile_id);
create policy "usuário insere os próprios exercícios" on exercise_logs for insert with check (auth.uid() = profile_id);
create policy "usuário deleta os próprios exercícios" on exercise_logs for delete using (auth.uid() = profile_id);

-- ---------- PRACTICES (esportes e artes marciais) ----------
create table if not exists practices (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade,
  name text not null,
  kind text check (kind in ('esporte','arte_marcial')) not null,
  level text,
  years numeric,
  created_at timestamptz default now()
);
alter table practices enable row level security;
create policy "práticas são públicas para leitura" on practices for select using (true);
create policy "usuário insere as próprias práticas" on practices for insert with check (auth.uid() = profile_id);
create policy "usuário deleta as próprias práticas" on practices for delete using (auth.uid() = profile_id);

-- ---------- QUIZ_RESULTS (teste de inteligência real) ----------
create table if not exists quiz_results (
  profile_id uuid primary key references profiles(id) on delete cascade,
  correct_count int not null,
  score_points int not null,
  taken_at timestamptz default now()
);
alter table quiz_results enable row level security;
create policy "resultado do quiz é público para leitura" on quiz_results for select using (true);
create policy "usuário insere o próprio resultado" on quiz_results for insert with check (auth.uid() = profile_id);
create policy "usuário atualiza o próprio resultado" on quiz_results for update using (auth.uid() = profile_id);

-- ---------- Mais missões diárias (pro sorteio ficar variado) ----------
insert into missions (title, description, type, target_stat, xp_reward, attribute_bonus) values
('Fazer 30 agachamentos', '', 'diaria', 'strength', 15, 6),
('Fazer 10 barras (ou o máximo que conseguir)', '', 'diaria', 'strength', 20, 8),
('Fazer 3 séries de prancha até a falha', '', 'diaria', 'endurance', 15, 6),
('Andar 8 mil passos', '', 'diaria', 'endurance', 12, 5),
('Tomar sol / caminhar ao ar livre por 20 min', '', 'diaria', 'endurance', 8, 3),
('Assistir uma aula/vídeo sobre técnica de algum exercício', '', 'diaria', 'intelligence', 15, 6),
('Planejar a semana de treinos', '', 'diaria', 'intelligence', 10, 5),
('Fazer mobilidade de ombro e quadril (10 min)', '', 'diaria', 'endurance', 8, 3),
('Comer uma refeição rica em proteína extra', '', 'diaria', 'endurance', 10, 3),
('Evitar açúcar/ultraprocessado no dia', '', 'diaria', 'endurance', 12, 4),
('Fazer 15 minutos de cardio leve (bike, elíptico, corrida leve)', '', 'diaria', 'speed', 12, 5),
('Treinar sprints curtos (6x 20m)', '', 'diaria', 'speed', 18, 8),
('Fazer 5 minutos de pular corda', '', 'diaria', 'speed', 10, 5),
('Registrar um novo teste físico ou exercício hoje', '', 'diaria', 'potential', 20, 8),
('Anotar como você se sentiu no treino de hoje', '', 'diaria', 'intelligence', 8, 3),
('Fazer 20 minutos de alongamento completo', '', 'diaria', 'endurance', 10, 4),
('Beber água ao acordar e antes de cada refeição', '', 'diaria', 'endurance', 8, 3),
('Dormir sem tela pelo menos 30 min antes de deitar', '', 'diaria', 'potential', 10, 4)
on conflict do nothing;

-- FIM DA MIGRAÇÃO

-- ---------- FUNÇÃO: reset total (só admin pode chamar) ----------
create or replace function admin_reset_game_data()
returns void as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Apenas administradores podem resetar o banco.';
  end if;

  delete from exercise_logs;
  delete from measurements;
  delete from practices;
  delete from quiz_results;
  delete from user_missions;
  delete from user_achievements;
  delete from xp_log;
  delete from workouts;
  delete from interview_answers;

  update attributes set strength=0, speed=0, potential=400, intelligence=0, endurance=0, muscle_scores='{}'::jsonb;
  update profiles set total_xp=0;
end;
$$ language plpgsql security definer;

-- FIM DA MIGRAÇÃO 03
