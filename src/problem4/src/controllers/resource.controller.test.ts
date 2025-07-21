import request from 'supertest';
import express from 'express';
import resourceRoutes from '../routes/resource.routes';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use('/api/resources', resourceRoutes);

beforeAll(async () => {
  await prisma.resource.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Resource API', () => {
  let resourceId: number;

  it('should create a resource', async () => {
    const res = await request(app)
      .post('/api/resources')
      .send({ name: 'Test Resource', type: 'test' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Test Resource');
    expect(res.body.type).toBe('test');
    resourceId = res.body.id;
  });

  it('should get all resources', async () => {
    const res = await request(app).get('/api/resources');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should get a resource by id', async () => {
    const res = await request(app).get(`/api/resources/${resourceId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', resourceId);
  });

  it('should update a resource', async () => {
    const res = await request(app)
      .put(`/api/resources/${resourceId}`)
      .send({ name: 'Updated Resource', type: 'updated' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Resource');
    expect(res.body.type).toBe('updated');
  });

  it('should delete a resource', async () => {
    const res = await request(app).delete(`/api/resources/${resourceId}`);
    expect(res.status).toBe(204);
  });

  it('should return 404 for deleted resource', async () => {
    const res = await request(app).get(`/api/resources/${resourceId}`);
    expect(res.status).toBe(404);
  });
});