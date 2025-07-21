import { PrismaClient } from '@prisma/client';
import * as scoreController from './score.controller';

describe('Score Controller', () => {
  const prisma = new PrismaClient();
  let userId: number;

  beforeAll(async () => {
    await prisma.user.deleteMany();
    const user = await prisma.user.create({ data: { username: 'controlleruser', password: 'testpassword', score: 0 } });
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should increment user score', async () => {
    // Mock req/res
    const req: any = { user: { id: userId, username: 'controlleruser' }, body: {} };
    let jsonResult: any;
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn((result) => { jsonResult = result; })
    };
    await scoreController.increaseScore(req, res);
    expect(res.json).toHaveBeenCalled();
    expect(jsonResult).toHaveProperty('message', 'Score updated');
    expect(jsonResult).toHaveProperty('newScore');
    expect(jsonResult.newScore).toBeGreaterThan(0);
  });

  it('should not allow a user to increment another user\'s score', async () => {
    // Create another user
    const otherUser = await prisma.user.create({ data: { username: 'otheruser', password: 'otherpass', score: 0 } });
    // Try to increment score with a different user id in req.user
    const req: any = { user: { id: otherUser.id + 100, username: 'fakeuser' }, body: {} };
    let jsonResult: any;
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn((result) => { jsonResult = result; })
    };
    await scoreController.increaseScore(req, res);
    expect(res.status).toHaveBeenCalledWith(404); // User not found for mismatched id
    expect(jsonResult).toHaveProperty('error');
  });

  it('should get top 10 scores', async () => {
    const req: any = {};
    let jsonResult: any;
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn((result) => { jsonResult = result; })
    };
    await scoreController.getTopScores(req, res);
    expect(res.json).toHaveBeenCalled();
    expect(Array.isArray(jsonResult)).toBe(true);
    expect(jsonResult.length).toBeGreaterThan(0);
    expect(jsonResult[0]).toHaveProperty('username');
    expect(jsonResult[0]).toHaveProperty('score');
  });

  it('should register a new user', async () => {
    const req: any = { body: { username: 'newuser', password: 'testpass' } };
    let jsonResult: any;
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn((result) => { jsonResult = result; })
    };
    await scoreController.register(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(jsonResult).toHaveProperty('message', 'User registered');
    expect(jsonResult.user).toHaveProperty('username', 'newuser');
  });

  it('should login with correct credentials', async () => {
    const req: any = { body: { username: 'newuser', password: 'testpass' } };
    let jsonResult: any;
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn((result) => { jsonResult = result; })
    };
    await scoreController.login(req, res);
    expect(res.json).toHaveBeenCalled();
    expect(jsonResult).toHaveProperty('token');
  });
});
