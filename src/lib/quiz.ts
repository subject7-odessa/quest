// Perguntas do teste de inteligência (públicas — só o gabarito fica no
// servidor, dentro da server action, pra não vazar no código do navegador).
export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  { id: "q1", text: "Complete a sequência: 2, 4, 8, 16, ...", options: ["24", "32", "20", "18"] },
  { id: "q2", text: "Se todos os Zorgs são Blips, e todos os Blips são Fups, então:", options: ["Todo Zorg é Fup", "Nenhum Zorg é Fup", "Todo Fup é Zorg", "Não dá pra saber"] },
  { id: "q3", text: "Qual número não pertence ao grupo: 3, 5, 7, 9, 11, 15?", options: ["9", "15", "7", "todos pertencem"] },
  { id: "q4", text: "Um trem viaja 60km em 45 minutos. Qual sua velocidade média em km/h?", options: ["60", "80", "75", "90"] },
  { id: "q5", text: "Complete: maçã está para fruta assim como cadeira está para...", options: ["madeira", "móvel", "mesa", "sentar"] },
  { id: "q6", text: "Se hoje é quarta-feira, que dia será daqui a 100 dias?", options: ["Quinta", "Sexta", "Sábado", "Domingo"] },
  { id: "q7", text: "Qual figura completa o padrão: ▲▲△△▲▲△△▲▲...", options: ["△△", "▲▲", "△▲", "▲△"] },
  { id: "q8", text: "João é mais velho que Pedro. Pedro é mais velho que Ana. Quem é o mais novo?", options: ["João", "Pedro", "Ana", "Empate"] },
  { id: "q9", text: "Quantos quadrados de qualquer tamanho existem em um tabuleiro 3x3?", options: ["9", "14", "12", "10"] },
  { id: "q10", text: "Se 3 máquinas fazem 3 peças em 3 minutos, quanto tempo 100 máquinas levam pra fazer 100 peças?", options: ["100 minutos", "3 minutos", "33 minutos", "1 minuto"] },
];
