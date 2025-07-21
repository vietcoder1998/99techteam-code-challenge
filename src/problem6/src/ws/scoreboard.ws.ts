import WebSocket from 'ws';
import { PrismaClient } from '@prisma/client';

const clients: WebSocket[] = [];
const prisma = new PrismaClient();
let initialized = false;

export function setupWebSocket(server: any) {
  if (initialized) return;
  initialized = true;
  const wss = new WebSocket.Server({ server, path: '/ws/scoreboard' });

  wss.on('connection', ws => {
    console.log('WebSocket client connected');
    clients.push(ws);
    emitTopScores(); // Send top scores to all clients on new connection
    ws.on('close', () => {
      const i = clients.indexOf(ws);
      if (i !== -1) clients.splice(i, 1);
    });
  });
}

export async function emitTopScores() {
  const top = await prisma.user.findMany({
    orderBy: { score: 'desc' },
    take: 10,
    select: { username: true, score: true }
  });

  const message = JSON.stringify({ type: 'top', data: top });

  clients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
}
