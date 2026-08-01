-- ============================================================
-- QUESTFIT — RESET DE DADOS DO JOGO
-- Apaga TODO o progresso (fichas, testes, exercícios, missões,
-- conquistas, XP) de TODOS os usuários, mas MANTÉM as contas
-- (login/senha) intactas — ninguém precisa se cadastrar de novo.
-- Cole no SQL Editor e rode só quando tiver certeza.
-- ============================================================

truncate table
  exercise_logs,
  measurements,
  practices,
  quiz_results,
  user_missions,
  user_achievements,
  xp_log,
  workouts,
  interview_answers
restart identity cascade;

update attributes set strength=0, speed=0, potential=400, intelligence=0, endurance=0, muscle_scores='{}'::jsonb;
update profiles set total_xp=0, title='Sedentário', class='Novato';

-- FIM DO RESET
