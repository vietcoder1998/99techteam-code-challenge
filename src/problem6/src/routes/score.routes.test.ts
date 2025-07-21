import request from 'supertest';
import express from 'express';
import scoreRoutes from './score.routes';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// Mock authentication middleware for testing
authenticateTestUser(app);
app.use('/api/score', scoreRoutes);

function authenticateTestUser(appInstance: express.Express) {
  appInstance.use((req, res, next) => {
    // Simulate an authenticated user with id 1
    req.user = { id: 1, username: 'testuser' };
    next();
  });
}

describe('Scoreboard API', () => {
  beforeAll(async () => {
    await prisma.user.deleteMany();
    await prisma.user.create({ data: { username: 'testuser', password: 'testpassword', score: 0 } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should return top 10 users', async () => {
    const res = await request(app).get('/api/score/top10');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('username');
    expect(res.body[0]).toHaveProperty('score');
  });

  it('should increment the score for authenticated user', async () => {
    const res = await request(app)
      .post('/api/score/increment')
      .send();
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('score');
    // Score should be incremented
    expect(res.body.score).toBeGreaterThan(0);
  });
});
