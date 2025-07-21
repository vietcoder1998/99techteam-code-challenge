import * as scoreController from './score.controller';

// Mock user data
const mockUserData = [
  { id: 1, username: 'controlleruser', password: 'testpassword', score: 0 },
];

// Mock PrismaClient
const prisma = {
  user: {
    deleteMany: jest.fn().mockImplementation(() => {
      mockUserData.length = 0;
      return Promise.resolve();
    }),
    create: jest.fn().mockImplementation(({ data }) => {
      const user = { id: mockUserData.length + 1, ...data };
      mockUserData.push(user);
      return Promise.resolve(user);
    }),
    findUnique: jest.fn().mockImplementation(({ where }) => {
      return Promise.resolve(mockUserData.find(u => u.id === where.id || u.username === where.username) || null);
    }),
    update: jest.fn().mockImplementation(({ where, data }) => {
      const user = mockUserData.find(u => u.id === where.id);
      if (user) {
        Object.assign(user, data);
        return Promise.resolve(user);
      }
      return Promise.reject(new Error('User not found'));
    }),
    findMany: jest.fn().mockResolvedValue(mockUserData),
  },
  $disconnect: jest.fn().mockResolvedValue(undefined),
} as any;

// Inject mock prisma into controller if needed (depends on your implementation)
// If your controller imports prisma directly, consider refactoring to accept it as a parameter for easier testing.

describe('Score Controller', () => {
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
    const req: any = { user: { id: userId, username: 'controlleruser' }, body: {} };
    let jsonResult: any;
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn((result) => { jsonResult = result; })
    };
    // @ts-ignore
    await scoreController.increaseScore(req, res, prisma);
    expect(res.json).toHaveBeenCalled();
    expect(jsonResult).toHaveProperty('message', 'Score updated');
    expect(jsonResult).toHaveProperty('newScore');
    expect(jsonResult.newScore).toBeGreaterThan(0);
  });

  it('should not allow a user to increment another user\'s score', async () => {
    const otherUser = await prisma.user.create({ data: { username: 'otheruser', password: 'otherpass', score: 0 } });
    const req: any = { user: { id: otherUser.id + 100, username: 'fakeuser' }, body: {} };
    let jsonResult: any;
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn((result) => { jsonResult = result; })
    };
    // @ts-ignore
    await scoreController.increaseScore(req, res, prisma);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(jsonResult).toHaveProperty('error');
  });

  it('should get top 10 scores', async () => {
    const req: any = {};
    let jsonResult: any;
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn((result) => { jsonResult = result; })
    };
    // @ts-ignore
    await scoreController.getTopScores(req, res, prisma);
    expect(res.json).toHaveBeenCalled();
    expect(Array.isArray(jsonResult)).toBe(true);
    expect(jsonResult.length).toBeGreaterThan(0);
    expect(jsonResult[0]).toHaveProperty('username');
    expect(jsonResult[0]).toHaveProperty('score');
  });

  it('should login with correct credentials', async () => {
    const req: any = { body: { username: 'newuser', password: 'testpass' } };
    let jsonResult: any;
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn((result) => { jsonResult = result; })
    };
    // @ts-ignore
    await scoreController.login(req, res, prisma);
    expect(res.json).toHaveBeenCalled();
    expect(jsonResult).toHaveProperty('token');
  });
});
