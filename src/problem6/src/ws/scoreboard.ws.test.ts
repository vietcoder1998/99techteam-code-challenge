import WebSocket from 'ws';
import http from 'http';
import { setupWebSocket, emitTopScores } from './scoreboard.ws';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to wait for a message from a WebSocket
function waitForMessage(ws: WebSocket): Promise<any> {
  return new Promise((resolve) => {
    ws.on('message', (data) => {
      resolve(JSON.parse(data.toString()));
    });
  });
}

describe('scoreboard.ws', () => {
  let server: http.Server;
  let port: number;

  beforeAll((done) => {
    server = http.createServer();
    setupWebSocket(server);
    server.listen(0, () => {
      // @ts-ignore
      port = server.address().port;
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should broadcast top scores to connected clients', async () => {
    // Add test users
    await prisma.user.deleteMany();
    await prisma.user.createMany({
      data: [
        { username: 'wsuser1', password: 'a', score: 10 },
        { username: 'wsuser2', password: 'b', score: 20 }
      ]
    });

    const ws = new WebSocket(`ws://localhost:${port}`);
    await new Promise((resolve) => ws.on('open', resolve));

    // Trigger broadcast
    await emitTopScores();
    const message = await waitForMessage(ws);
    expect(message.type).toBe('top');
    expect(Array.isArray(message.data)).toBe(true);
    expect(message.data.length).toBeGreaterThan(0);
    expect(message.data[0]).toHaveProperty('username');
    expect(message.data[0]).toHaveProperty('score');
    ws.close();
  });
});
