import WebSocket from 'ws';
import http from 'http';
import { setupWebSocket, emitTopScores } from './scoreboard.ws';

// Mock user data
const mockUserData = [
  { id: 1, username: 'wsuser1', password: 'a', score: 10 },
  { id: 2, username: 'wsuser2', password: 'b', score: 20 }
];

// Mock PrismaClient
const prisma = {
  user: {
    deleteMany: jest.fn().mockImplementation(() => {
      mockUserData.length = 0;
      return Promise.resolve();
    }),
    createMany: jest.fn().mockImplementation(({ data }) => {
      data.forEach((user: any, idx: number) => {
        mockUserData.push({ id: mockUserData.length + 1, ...user });
      });
      return Promise.resolve();
    }),
    findMany: jest.fn().mockResolvedValue(mockUserData),
  },
  $disconnect: jest.fn().mockResolvedValue(undefined),
} as any;

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
    setupWebSocket(server); // Pass mock prisma here
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

    // Connect to the correct WebSocket path
    const ws = new WebSocket(`ws://localhost:${port}/ws/scoreboard`);
    await new Promise((resolve) => ws.on('open', resolve));

    // Trigger broadcast
    await emitTopScores(prisma);
    const message = await waitForMessage(ws);
    expect(message.type).toBe('top');
    expect(Array.isArray(message.data)).toBe(true);
    expect(message.data.length).toBeGreaterThan(0);
    expect(message.data[0]).toHaveProperty('username');
    expect(message.data[0]).toHaveProperty('score');
    ws.close();
  });
});
