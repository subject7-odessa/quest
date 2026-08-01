# QuestFit — Sistema de Status de Evolução Física Real

Site estilo RPG (Questism/Solo Leveling) onde os atributos (Força,
Velocidade, Resistência, Potencial, Inteligência) são calculados a partir
de testes físicos reais, não inventados. Nível e Título são separados
dos atributos e sobem com XP ganho em treinos e missões.

## Stack
Next.js 14 (App Router) · TypeScript · Tailwind · Framer Motion · Supabase

---

## 1. Configurar o Supabase (5 minutos)

1. Acesse [supabase.com](https://supabase.com) → **New Project**.
2. Espere o projeto ficar pronto (barra de loading verde).
3. Vá em **SQL Editor** (menu lateral) → **New query**.
4. Abra o arquivo `supabase/schema.sql` deste projeto, copie **tudo** e cole no editor.
5. Clique em **RUN**. Isso cria todas as tabelas, políticas de segurança, a view de ranking e as missões/conquistas padrão.
6. Vá em **Project Settings → API**. Copie:
   - `Project URL`
   - `anon public key`

## 2. Configurar as variáveis de ambiente

Na raiz do projeto, copie `.env.local.example` para `.env.local` e preencha:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

## 3. Rodar localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## 4. Virar admin

Depois de criar sua conta pelo site normalmente, vá no **SQL Editor** do Supabase e rode:

```sql
update profiles set role = 'admin' where username = 'seu_username';
```

Agora você acessa `/admin`.

## 5. Publicar no Vercel

1. Suba este projeto pro GitHub (`git init`, `git add .`, `git commit -m "primeira versão"`, crie um repo no GitHub e dê push).
2. No [vercel.com](https://vercel.com) → **Add New Project** → importe o repositório.
3. Em **Environment Variables**, adicione as duas mesmas variáveis do `.env.local`.
4. Clique em **Deploy**. Em ~1 minuto o site está no ar.

---

## Como os atributos são calculados

- **Força**: se você tem 1RM de supino/agachamento/terra cadastrados, usa a razão total ÷ peso corporal. Sem isso, usa flexões máximas como aproximação.
- **Velocidade**: tempo no 1km corrido (quanto menor, mais pontos).
- **Resistência**: teste de Cooper (distância em 12min) ou tempo no 3km.
- **Potencial**: automático — compara sua medida mais antiga com a mais recente. Quem evolui rápido sobe; quem estagna cai. Não é editável manualmente.
- **Inteligência**: parte do nível de experiência declarado na entrevista e sobe com missões de estudo.
- **Nível/XP**: separado dos atributos — só sobe com treinos registrados e missões concluídas. É por isso que dá pra ser Nível 40 com Velocidade D (nunca treinou corrida).

Todas as fórmulas ficam em `src/lib/attributes.ts` e `src/lib/ranks.ts` — são o único lugar que precisa mexer pra rebalancear o sistema.

## O que já está pronto
- Cadastro/login (Supabase Auth)
- Entrevista inicial → gera atributos automaticamente
- Ficha de status com barras animadas e ranks (F até Infinite, sem teto)
- Registro de novos testes físicos → recalcula atributos
- Registro rápido de treino → gera XP
- Missões diárias/semanais/mensais/especiais com conclusão e XP
- Ranking público (geral, força, velocidade, resistência, disciplina/XP)
- Perfil público por username
- Painel admin (criar/ativar missões, banir usuários, resetar ranking)

## Se você já tinha rodado o schema.sql antes (banco já existe)

Rode, NESSA ORDEM, no SQL Editor do Supabase:
1. `supabase/migration_02_calistenia_musculos.sql` (se ainda não rodou antes)
2. `supabase/migration_03_exercicios_e_mais.sql` (NOVO — cria exercícios, esportes/artes marciais, teste de inteligência, e a função de reset do admin)

Nenhum dos dois apaga nada que já existe.

## Se quiser resetar todo o progresso e testar do zero

Duas formas:
- **Pelo site**: painel `/admin` → botão vermelho "RESETAR BANCO DE DADOS INTEIRO" (precisa rodar a migration_03 primeiro, é ela que cria essa função)
- **Direto no SQL**: `supabase/reset_game_data.sql`

As duas mantêm as contas de login intactas — só o progresso (fichas, testes, XP, missões, conquistas) é apagado.

## Novidades desta versão (a grande)

**Cálculo de Força totalmente refeito** — esse era o bug do "ou é F ou é Infinite". Agora Força é a **média de 9 grupos musculares** (peito, costas, ombros, bíceps, tríceps, abdômen, pernas, posterior, panturrilhas), cada um alimentado por exercícios específicos:
- Supino → peito + tríceps + ombro
- Rosca francesa → só tríceps
- Terra → posterior + costas + pernas
- Barra fixa → costas + bíceps
- (17 exercícios ao todo, calistenia e academia, cada um com seu próprio peso por músculo)

Um exercício isolado muito forte não estoura mais o atributo inteiro — é uma média, não um pico. Veja a aba **TESTES** no dashboard.

**Limites contra valores absurdos**: cada exercício tem um teto (ex: 400kg pra levantamentos, 150 reps, 1800s de prancha) — validado no servidor, não só no formulário, então não dá pra "hackear" digitando 200000.

**Quem já treina não entra mais como Sedentário**: o Título agora é calculado pela média real de Força/Velocidade/Resistência, não pelo nível de XP. As flexões/barras que você informa na entrevista já viram seu primeiro registro de exercício — você começa com Força de verdade desde o dia 1.

**Teste de Inteligência real**: 10 perguntas de raciocínio lógico em `/quiz`, com gabarito só no servidor. Substitui o "autodeclarado" de antes.

**Registrador de Esportes & Artes Marciais**: aba "PERFIL & ESPORTES" no dashboard, aparece também no perfil público.

**Aba "Sobre você"**: mostra idade, sexo, tempo de treino, frequência, sono, alimentação e objetivo — informações que você já preenchia na entrevista e não apareciam em lugar nenhum.

**Ficha não pode mais ser refeita**: se você já tem atributos, `/onboarding` te manda direto pro dashboard.

**Treino registrado 1x por dia**: o botão "+ REGISTRAR TREINO" some depois do primeiro uso do dia e volta à meia-noite.

**Missões diárias sorteadas**: o banco tem ~20 missões diárias; cada pessoa recebe um conjunto de 5 diferente, todo dia, sorteado de forma determinística (sem custo, sem servidor externo — ver observação sobre Ollama abaixo).

**Dashboard com 6 abas**: Ficha, Testes, Missões, Histórico, Conquistas, Perfil & Esportes.

**Mapa muscular com corpo de verdade**: frente e costas lado a lado, 9 grupos coloridos pelo rank individual.

### Sobre a IA do Ollama
Ollama roda localmente na sua máquina — o Vercel (onde o site está hospedado) não consegue acessar seu PC pra chamar ele, então essa integração específica não é possível do jeito que está hoje. O sorteio de missões diárias resolve o "toda dia diferente" sem custo nenhum. Se no futuro você quiser IA de verdade gerando missões, o caminho seria usar uma API paga na nuvem (OpenAI, Anthropic, etc) com uma chave de API guardada nas variáveis de ambiente do Vercel — é uma mudança de arquitetura pequena quando você quiser, mas envolve custo por uso.

## Próximos passos sugeridos (ainda não incluídos)
- Upload de avatar (Supabase Storage)
- Som de level-up e mais animações
- Filtro de ranking por cidade/país na query
- Potencial hoje é calculado só a partir da evolução de Velocidade/Resistência (corrida, prancha) — ainda não cruza com a evolução dos exercícios de força
