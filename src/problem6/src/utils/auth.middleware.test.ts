import { createToken, validateCredentials, authenticate } from './auth.middleware';
import jwt from 'jsonwebtoken';

describe('auth.middleware', () => {
  it('should create a valid JWT token', () => {
    process.env.JWT_SECRET = 'testsecret';
    const payload = { id: 1, username: 'testuser' };
    const token = createToken(payload);
    const decoded: any = jwt.verify(token, 'testsecret');
    expect(decoded.id).toBe(1);
    expect(decoded.username).toBe('testuser');
  });

  it('should validate credentials', () => {
    expect(validateCredentials('user', 'pass')).toEqual({ valid: true });
    expect(validateCredentials('', 'pass')).toEqual({ valid: false, error: 'Username and password are required' });
    expect(validateCredentials('user', '')).toEqual({ valid: false, error: 'Username and password are required' });
    expect(validateCredentials()).toEqual({ valid: false, error: 'Username and password are required' });
  });

  it('should authenticate valid JWT in middleware', () => {
    process.env.JWT_SECRET = 'testsecret';
    const token = createToken({ id: 2, username: 'jwtuser' });
    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const res: any = { sendStatus: jest.fn() };
    const next = jest.fn();
    authenticate(req, res, next);
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe(2);
    expect(next).toHaveBeenCalled();
  });

  it('should reject missing or invalid JWT in middleware', () => {
    process.env.JWT_SECRET = 'testsecret';
    const req: any = { headers: {} };
    const res: any = { sendStatus: jest.fn() };
    const next = jest.fn();
    authenticate(req, res, next);
    expect(res.sendStatus).toHaveBeenCalledWith(401);

    // Invalid token
    const req2: any = { headers: { authorization: 'Bearer invalidtoken' } };
    const res2: any = { sendStatus: jest.fn() };
    authenticate(req2, res2, next);
    expect(res2.sendStatus).toHaveBeenCalledWith(403);
  });
});
