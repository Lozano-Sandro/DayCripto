// Pistas originales. Solo las conoce el servidor; el cliente nunca recibe la respuesta.
// Tipos: caso especial (con historia), anagrama, palabra escondida, letra eliminada,
// palabra al revés y doble definición.
const AUTHOR = "Equipo del Críptico";

const PUZZLES = [
  // ---- Casos especiales (con historia) ----
  { context: "Agente, interceptamos esta nota en el buzón del grupo sospechoso. Descifre el nombre clave del infiltrado.",
    clue: "Sol y dado juntos: quien cumple órdenes en el cuartel (7)", answer: "SOLDADO", author: AUTHOR,
    hint1: "Es una suma: una palabra y otra, una tras otra.", hint2: "Es un militar de tropa." },
  { context: "Un informante menciona un convoy que zarpa de noche. La clave aparece en el manifiesto del puerto.",
    clue: "Arma y da: flota de barcos de guerra (6)", answer: "ARMADA", author: AUTHOR,
    hint1: "Es una suma: una palabra y otra, una tras otra.", hint2: "Grupo numeroso de barcos que avanzan juntos." },
  { context: "El diario local publicó una noticia extraña. La palabra clave está en el titular del día.",
    clue: "Día y río: publicación que sale cada jornada (6)", answer: "DIARIO", author: AUTHOR,
    hint1: "Es una suma: una palabra y otra, una tras otra.", hint2: "Periódico que se lee cada mañana." },
  { context: "Revisamos el escondite del sospechoso. Dentro hay una pista escrita en desorden.",
    clue: "Lobos revueltos: donde el agente guarda sus cosas (5)", answer: "BOLSO", author: AUTHOR,
    hint1: "Anagrama de 'lobos', indicado por 'revueltos'.", hint2: "Se lleva colgado del hombro." },
  { context: "En el mapa de la zona aparece un nombre oculto en el nombre de un capitán. Búsquelo con calma.",
    clue: "Oculta en 'capitán': planta de hojas puntiagudas (4)", answer: "PITA", author: AUTHOR,
    hint1: "La respuesta está escondida dentro de una sola palabra.", hint2: "Planta cuyas fibras sirven para hacer cuerdas." },
  { context: "La operación comenzará en el lugar que los militares llaman el punto de partida. Confirme el lugar exacto.",
    clue: "Fundamento o sitio desde donde opera el ejército (4)", answer: "BASE", author: AUTHOR,
    hint1: "Dos definiciones distintas, una después de la otra.", hint2: "Lo que sostiene algo, o un campamento militar." },

  // ---- Letra eliminada ----
  { clue: "Tronco sin la primera letra: sonido áspero al dormir (5)", answer: "RONCO", author: AUTHOR,
    hint1: "Quita la primera letra de 'tronco'.", hint2: "Se escucha al respirar fuerte mientras duermes." },
  { clue: "Pasta sin la primera letra: palo que sostiene una bandera (4)", answer: "ASTA", author: AUTHOR,
    hint1: "Quita la primera letra de 'pasta'.", hint2: "Mástil que sostiene una bandera." },
  { clue: "Pajar sin su última letra: tallo seco de los cereales (4)", answer: "PAJA", author: AUTHOR,
    hint1: "Quita la última letra de 'pajar'.", hint2: "Lo que queda del trigo después de la cosecha." },

  // ---- Palabra al revés ----
  { clue: "Roma al revés: sentimiento que une a dos personas (4)", answer: "AMOR", author: AUTHOR,
    hint1: "Lee 'Roma' de derecha a izquierda.", hint2: "Sentimiento intenso que une a dos personas." },

  // ---- Anagramas ----
  { clue: "Odias revueltos: deidad femenina de la mitología (5)", answer: "DIOSA", author: AUTHOR,
    hint1: "Anagrama de 'odias'.", hint2: "Divinidad femenina, como Afrodita o Atenea." },
  { clue: "Buen revuelto: masa de vapor que flota en el cielo (4)", answer: "NUBE", author: AUTHOR,
    hint1: "Anagrama de 'buen'.", hint2: "Masa de vapor que flota en el cielo." },
  { clue: "Raspa revuelta: transcurrir, o cruzar de un lado a otro (5)", answer: "PASAR", author: AUTHOR,
    hint1: "Anagrama de 'raspa'.", hint2: "Verbo que describe el paso del tiempo." },
  { clue: "Osar revuelto: flor con espinas (4)", answer: "ROSA", author: AUTHOR,
    hint1: "Anagrama de 'osar'.", hint2: "Flor muy popular, de colores variados." },

  // ---- Palabras escondidas ----
  { clue: "Oculta en 'contienda': lugar donde se vende al público (6)", answer: "TIENDA", author: AUTHOR,
    hint1: "La respuesta está escondida dentro de una sola palabra.", hint2: "Local comercial donde compras cosas." },
  { clue: "Oculta en 'esperanza': aguardar (6)", answer: "ESPERA", author: AUTHOR,
    hint1: "La respuesta está escondida dentro de una sola palabra.", hint2: "Quedarse quieto hasta que llegue algo." },
  { clue: "Oculta en 'sandalia': camina o funciona un reloj (4)", answer: "ANDA", author: AUTHOR,
    hint1: "La respuesta está escondida dentro de una sola palabra.", hint2: "Moverse a pie de un lugar a otro." },
  { clue: "Oculta en 'bocacalle': vía de una ciudad (5)", answer: "CALLE", author: AUTHOR,
    hint1: "La respuesta está escondida dentro de una sola palabra.", hint2: "Camino urbano con casas a los lados." },
  { clue: "Oculta en 'mariposa': coloca con cuidado (4)", answer: "POSA", author: AUTHOR,
    hint1: "La respuesta está escondida dentro de una sola palabra.", hint2: "Dejar algo sobre una superficie con suavidad." },
  { clue: "Oculta en 'telescopio': reproduce algo fielmente (5)", answer: "COPIO", author: AUTHOR,
    hint1: "La respuesta está escondida dentro de una sola palabra.", hint2: "Hacer una réplica igual a la original." },
  { clue: "Oculta en 'desvelado': candela o lona de un barco (4)", answer: "VELA", author: AUTHOR,
    hint1: "La respuesta está escondida dentro de una sola palabra.", hint2: "Puede ser de cera para iluminar, o de tela para navegar." },

  // ---- Doble definición ----
  { clue: "Parte de un libro o de una planta (4)", answer: "HOJA", author: AUTHOR,
    hint1: "Dos definiciones distintas, una después de la otra.", hint2: "Se encuentra en los árboles, o entre las páginas." },
  { clue: "Ave o instrumento para escribir (5)", answer: "PLUMA", author: AUTHOR,
    hint1: "Dos definiciones distintas, una después de la otra.", hint2: "Lo que cubre a un ave, o lo que usas para escribir." },
  { clue: "Rabo de un animal o fila de personas (4)", answer: "COLA", author: AUTHOR,
    hint1: "Dos definiciones distintas, una después de la otra.", hint2: "Lo que mueve un perro al alegrarse, o fila de gente." },
  { clue: "Punta de una montaña o de un ave (4)", answer: "PICO", author: AUTHOR,
    hint1: "Dos definiciones distintas, una después de la otra.", hint2: "Cima de un cerro, o parte de la boca de un ave." },

  // ---- Casos especiales de dos pasos ----
  { context: "Interceptamos el manifiesto de una embarcación de carga. Los agentes creen que la clave está en su nombre, pero no coincide con lo que aparece en el registro.",
    clue: "Barco sin la primera letra, revuelto: cetáceo temido en el mar (4)", answer: "ORCA", author: AUTHOR,
    hint1: "Dos pasos: quitar la primera letra y luego reordenar.", hint2: "Mamífero marino de dientes grandes." },
  { context: "En la carretera del sur aparece un tramo marcado con tinta roja. Revise qué palabra queda al quitarle el inicio.",
    clue: "Tramo sin la primera letra, revuelto: fruto de la zarzamora (4)", answer: "MORA", author: AUTHOR,
    hint1: "Dos pasos: quitar la primera letra y luego reordenar.", hint2: "Fruto oscuro que crece en arbustos con espinas." },
  { context: "Una carta rota fue encontrada en la escena. Solo quedó una palabra legible, con las letras desordenadas.",
    clue: "Corto sin la primera letra, revuelto: partido en trozos (4)", answer: "ROTO", author: AUTHOR,
    hint1: "Dos pasos: quitar la primera letra y luego reordenar.", hint2: "Lo que le pasa a un plato si se cae al suelo." },
  { context: "En la reunión, el líder dijo que había preparado un plan para el rescate. La palabra clave está en su frase inicial.",
    clue: "Planeta revuelto: propone o expone una idea (7)", answer: "PLANTEA", author: AUTHOR,
    hint1: "Anagrama de 'planeta'.", hint2: "Presentar un tema para discutirlo." },
  { context: "Los sospechosos mencionaron una mansión con una decoración inusual. Revise la palabra escrita en la ficha de la propiedad.",
    clue: "Ordena revuelto: decora o embellece (6)", answer: "ADORNE", author: AUTHOR,
    hint1: "Anagrama de 'ordena'.", hint2: "Poner elementos bonitos sobre algo." },
  { context: "En el registro de la cocina hay una lista de compras. Una palabra aparece dos veces, y solo una tiene el significado que buscamos.",
    clue: "Papas sin la última letra: tubérculo o sumo pontífice (4)", answer: "PAPA", author: AUTHOR,
    hint1: "Quita la última letra de 'papas'.", hint2: "Tiene dos significados: un alimento y una autoridad religiosa." }
];

module.exports = { PUZZLES };
