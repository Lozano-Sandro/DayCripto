const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');
const { PUZZLES } = require('./puzzles');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const PUBLIC_DIR = path.join(__dirname, 'public');
const START_POINTS = 100;
const BETS = [10, 25, 50];
const COUNTDOWN_MS = 3000;
const MAX_WRONG = 3; // intentos fallidos permitidos; al intentar por cuarta vez se pierde

// ---------- Persistencia de usuarios y puntos ----------
let db = { users: {} };
try { db = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch (_) {}
function save() { fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2), () => {}); }

function getUser(userId, name) {
  if (!db.users[userId]) db.users[userId] = { name: 'Jugador', points: START_POINTS };
  if (name) db.users[userId].name = name;
  return db.users[userId];
}

// ---------- Estado en memoria ----------
const rooms = new Map();   // roomId -> room
const clients = new Map(); // ws -> { userId, roomId }

// Preguntas al azar sin repetir para los jugadores de la partida.
// Cada jugador recuerda las que ya vio; si ambos ya vieron todas, se reinicia.
const seen = new Map(); // userId -> Set de índices ya jugados
function randomPuzzle(userIds) {
  const sets = userIds.map(id => {
    if (!seen.has(id)) seen.set(id, new Set());
    return seen.get(id);
  });
  let pool = PUZZLES.map((_, i) => i).filter(i => !sets.some(s => s.has(i)));
  if (pool.length === 0) {
    sets.forEach(s => s.clear());
    pool = PUZZLES.map((_, i) => i);
  }
  const idx = pool[Math.floor(Math.random() * pool.length)];
  sets.forEach(s => s.add(idx));
  return PUZZLES[idx];
}
function newId() { return Math.random().toString(36).slice(2, 8).toUpperCase(); }
function sendTo(ws, obj) { if (ws.readyState === 1) ws.send(JSON.stringify(obj)); }
function roomOf(ws) { const c = clients.get(ws); return c && c.roomId ? rooms.get(c.roomId) : null; }
function inActiveGame(ws) {
  const r = roomOf(ws);
  return !!r && (r.status === 'countdown' || r.status === 'playing');
}

// Vista de la sala para un jugador concreto (la respuesta solo se ve al terminar)
function viewFor(room, userId) {
  const v = {
    id: room.id,
    bet: room.bet,
    pot: room.bet * 2,
    status: room.status,
    solo: !!room.solo,
    you: userId,
    hints: room.hints,
    players: room.players.map(p => ({
      userId: p.userId,
      name: db.users[p.userId].name,
      ready: p.ready,
      attemptsLeft: Math.max(0, MAX_WRONG - p.wrong)
    }))
  };
  if (room.puzzle && (room.status === 'playing' || room.status === 'done')) {
    v.clue = room.puzzle.clue;
    v.author = room.puzzle.author;
    v.length = room.puzzle.answer.length;
    v.context = room.puzzle.context || null;
  }
  if (room.status === 'done') {
    v.answer = room.puzzle.answer;
    v.winnerId = room.winnerId;
    v.reason = room.reason;
  }
  return v;
}

function broadcast(room) {
  for (const p of room.players) {
    if (p.ws) sendTo(p.ws, { type: 'room', room: viewFor(room, p.userId) });
  }
}

function addPlayer(room, ws, userId) {
  room.players.push({ userId, ws, ready: false, wrong: 0 });
  clients.get(ws).roomId = room.id;
}

// Salir solo es posible en el lobby. Durante una partida no se puede escapar.
function leaveRoom(ws) {
  const c = clients.get(ws);
  if (!c || !c.roomId) return;
  const room = rooms.get(c.roomId);
  if (room && room.status !== 'lobby') return;
  c.roomId = null;
  if (!room) return;
  room.players = room.players.filter(p => p.ws !== ws);
  if (room.players.length === 0) rooms.delete(room.id);
  else broadcast(room);
}

function startCountdown(room) {
  for (const p of room.players) db.users[p.userId].points -= room.bet;
  save();
  room.status = 'countdown';
  room.puzzle = randomPuzzle(room.players.map(p => p.userId));
  room.hints = [];
  for (const p of room.players) p.wrong = 0;
  broadcast(room);
  room.timer = setTimeout(() => {
    room.status = 'playing';
    room.startedAt = Date.now();
    broadcast(room);
  }, COUNTDOWN_MS);
}

// Termina la partida: el ganador se lleva el bote (las apuestas ya están descontadas)
function finish(room, winnerId, reason) {
  if (room.status !== 'countdown' && room.status !== 'playing') return;
  clearTimeout(room.timer);
  room.status = 'done';
  room.winnerId = winnerId;
  room.reason = reason;
  db.users[winnerId].points += room.bet * 2;
  save();
  broadcast(room);
}

// Partida individual: sin apuestas ni puntos
function soloEnd(room, won, reason) {
  room.status = 'done';
  room.winnerId = won ? room.players[0].userId : null;
  room.reason = reason;
  broadcast(room);
}

// ---------- Mensajes del cliente ----------
function handle(ws, m) {
  const c = clients.get(ws);

  switch (m.type) {
    case 'hello': {
      if (!m.userId) return;
      const u = getUser(m.userId, String(m.name || 'Jugador').slice(0, 20));
      save();
      const prev = clients.get(ws) || {};
      clients.set(ws, { userId: m.userId, roomId: prev.roomId || null });
      sendTo(ws, { type: 'me', user: { userId: m.userId, name: u.name, points: u.points } });
      break;
    }

    case 'solo': {
      if (!c) return;
      if (inActiveGame(ws)) return sendTo(ws, { type: 'error', message: 'Termina tu partida primero' });
      leaveRoom(ws);
      const room = { id: newId(), bet: 0, solo: true, status: 'playing', players: [], hints: [], puzzle: randomPuzzle([c.userId]), winnerId: null, reason: '', timer: null };
      rooms.set(room.id, room);
      addPlayer(room, ws, c.userId);
      broadcast(room);
      break;
    }

    case 'create': {
      if (!c) return;
      if (inActiveGame(ws)) return sendTo(ws, { type: 'error', message: 'Termina tu partida primero' });
      const bet = Number(m.bet);
      if (!BETS.includes(bet)) return sendTo(ws, { type: 'error', message: 'Apuesta no válida' });
      if (db.users[c.userId].points < bet) return sendTo(ws, { type: 'error', message: 'No tienes puntos suficientes' });
      leaveRoom(ws);
      const room = { id: newId(), bet, status: 'lobby', players: [], hints: [], puzzle: null, winnerId: null, reason: '', timer: null };
      rooms.set(room.id, room);
      addPlayer(room, ws, c.userId);
      broadcast(room);
      break;
    }

    case 'join': {
      if (!c) return;
      if (inActiveGame(ws)) return sendTo(ws, { type: 'error', message: 'Termina tu partida primero' });
      const room = rooms.get(String(m.roomId || '').toUpperCase());
      if (!room) return sendTo(ws, { type: 'error', code: 'NO_ROOM', message: 'La sala ya no existe' });
      const existing = room.players.find(p => p.userId === c.userId);
      if (existing) {
        existing.ws = ws;
        c.roomId = room.id;
        broadcast(room);
        break;
      }
      if (room.status !== 'lobby' || room.players.length >= 2) {
        return sendTo(ws, { type: 'error', message: 'La sala está llena o ya empezó' });
      }
      leaveRoom(ws);
      addPlayer(room, ws, c.userId);
      broadcast(room);
      break;
    }

    case 'leave': {
      const r = roomOf(ws);
      if (r && r.solo && r.status !== 'playing') {
        rooms.delete(r.id);
        c.roomId = null;
        sendTo(ws, { type: 'room', room: null });
        break;
      }
      if (inActiveGame(ws)) return;
      leaveRoom(ws);
      sendTo(ws, { type: 'room', room: null });
      break;
    }

    case 'ready': {
      const room = roomOf(ws);
      if (!room || room.status !== 'lobby') return;
      if (room.players.length < 2) return sendTo(ws, { type: 'error', message: 'Espera a que tu rival entre' });
      const me = room.players.find(p => p.ws === ws);
      if (!me) return;
      if (room.players.some(p => db.users[p.userId].points < room.bet)) {
        return sendTo(ws, { type: 'error', message: 'Alguno de los dos no tiene puntos suficientes' });
      }
      me.ready = true;
      if (room.players.every(p => p.ready)) startCountdown(room);
      else broadcast(room);
      break;
    }

    case 'hint': {
      const room = roomOf(ws);
      if (!room || room.status !== 'playing' || room.hints.length >= 3) return;
      const pz = room.puzzle;
      const level = room.hints.length;
      const text = level === 0 ? pz.hint1 : level === 1 ? pz.hint2 : 'Primera letra: ' + pz.answer[0];
      room.hints.push(text);
      broadcast(room); // la pista se abre para los dos
      break;
    }

    case 'guess': {
      const room = roomOf(ws);
      if (!room || room.status !== 'playing' || !c) return;
      const me = room.players.find(p => p.userId === c.userId);
      const other = room.players.find(p => p.userId !== c.userId);
      if (!me) return;
      if (!other && !room.solo) return;
      const g = String(m.letters || '').toUpperCase().replace(/[^A-ZÑ]/g, '');

      // Ya usó los 3 fallos: este es el 4.º intento, pierde aunque acierte
      if (me.wrong >= MAX_WRONG) {
        if (room.solo) return soloEnd(room, false, 'Te quedaste sin intentos');
        return finish(room, other.userId, 'Intentó más de 3 veces');
      }
      if (g === room.puzzle.answer) {
        if (room.solo) return soloEnd(room, true, 'Resuelto');
        return finish(room, c.userId, 'Resolvió primero');
      }

      me.wrong++;
      const left = MAX_WRONG - me.wrong;
      broadcast(room); // el rival ve que restan menos intentos
      sendTo(ws, {
        type: 'error',
        message: left > 0
          ? `No es correcto. Te quedan ${left} intento${left === 1 ? '' : 's'}`
          : 'No es correcto. Ya no te quedan intentos: el siguiente intento te hace perder'
      });
      break;
    }

    case 'left':    // la app se minimizó o cambió de ventana
    case 'forfeit': // se rindió
    {
      const room = roomOf(ws);
      if (!room || !c || !inActiveGame(ws)) return;
      if (room.solo) {
        return soloEnd(room, false, m.type === 'left' ? 'Salió de la aplicación' : 'Te rendiste');
      }
      const other = room.players.find(p => p.userId !== c.userId);
      if (!other) return;
      const reason = m.type === 'left' ? 'Salió de la aplicación' : 'Se rindió';
      finish(room, other.userId, reason);
      break;
    }
  }
}

// Desconexión: durante una partida cuenta como abandono
function onClose(ws) {
  const c = clients.get(ws);
  clients.delete(ws);
  if (!c || !c.roomId) return;
  const room = rooms.get(c.roomId);
  if (!room) return;
  const p = room.players.find(x => x.ws === ws);
  if (!p) return; // ya se reconectó con otro socket

  // Partida individual: al cerrar la app se descarta (no queda abierta para la próxima vez)
  if (room.solo) {
    clearTimeout(room.timer);
    rooms.delete(room.id);
    return;
  }

  if (room.status === 'lobby') {
    room.players = room.players.filter(x => x.ws !== ws);
    if (room.players.length === 0) rooms.delete(room.id);
    else broadcast(room);
  } else if (room.status === 'countdown' || room.status === 'playing') {
    const other = room.players.find(x => x.userId !== p.userId);
    if (other) finish(room, other.userId, 'Se desconectó de la partida');
  }
}

// ---------- Servidor HTTP (sirve la app) + WebSocket ----------
const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  const rel = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
  // Verificación de la versión desplegada: abre https://tu-app.onrender.com/version
  if (urlPath === '/version') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ pistas: PUZZLES.length, seleccion: 'aleatoria-sin-repetir', version: 3 }));
  }
  const full = path.join(PUBLIC_DIR, rel);
  if (!full.startsWith(PUBLIC_DIR)) { res.writeHead(403); return res.end(); }
  fs.readFile(full, (err, data) => {
    if (err) { res.writeHead(404); return res.end('No encontrado'); }
    const types = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
      '.json': 'application/json; charset=utf-8',
      '.webmanifest': 'application/manifest+json'
    };
    res.writeHead(200, { 'Content-Type': types[path.extname(full)] || 'application/octet-stream' });
    res.end(data);
  });
});

const wss = new WebSocketServer({ server, path: '/ws' });
wss.on('connection', ws => {
  ws.on('message', raw => {
    let m;
    try { m = JSON.parse(raw); } catch (_) { return; }
    handle(ws, m);
  });
  ws.on('close', () => onClose(ws));
});

server.listen(PORT, () => console.log('Críptico escuchando en el puerto ' + PORT));
