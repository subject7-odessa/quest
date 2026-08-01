-- ============================================================
-- QUESTFIT — MIGRAÇÃO 02
-- Adiciona suporte a calistenia + mapa muscular.
-- Cole isso no SQL Editor do Supabase e clique em RUN.
-- (Não precisa rodar o schema.sql de novo, só isso aqui.)
-- ============================================================

alter table measurements add column if not exists dips_max int;
alter table measurements add column if not exists squat_reps_bodyweight int;
alter table measurements add column if not exists plank_seconds numeric;
alter table measurements add column if not exists continuous_run_min numeric;

alter table attributes add column if not exists muscle_scores jsonb default '{}'::jsonb;

-- FIM DA MIGRAÇÃO
