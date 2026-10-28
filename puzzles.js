// Pistas originales. Solo las conoce el servidor; el cliente nunca recibe la respuesta.
const PUZZLES = [
  {
    clue: "Desordenado, 'clamar' se vuelve tranquilizar (6)",
    answer: "CALMAR",
    author: "Equipo del Críptico",
    hint1: "Indicador de anagrama: 'desordenado'.",
    hint2: "Es la palabra 'clamar' con las letras reorganizadas."
  },
  {
    clue: "Arena con ele: lugar de dunas (6)",
    answer: "ARENAL",
    author: "Equipo del Críptico",
    hint1: "Juego de palabras por adición: 'arena' + una letra.",
    hint2: "La letra es la 'ele'. Sumada a 'arena' da un terreno de dunas."
  },
  {
    clue: "Solar, desordenado: arbusto de rosas (5)",
    answer: "ROSAL",
    author: "Equipo del Críptico",
    hint1: "Anagrama de 'solar', indicado por 'desordenado'.",
    hint2: "Es el arbusto que da rosas."
  },
  {
    clue: "Amor reorganizado: ciudad eterna (4)",
    answer: "ROMA",
    author: "Equipo del Críptico",
    hint1: "Anagrama de 'amor'.",
    hint2: "Capital italiana, la ciudad eterna."
  },
  {
    clue: "Saco revuelto: objeto o hecho (4)",
    answer: "COSA",
    author: "Equipo del Críptico",
    hint1: "Anagrama de 'saco', indicado por 'revuelto'.",
    hint2: "Palabra muy genérica para referirse a algo."
  }
];

module.exports = { PUZZLES };
