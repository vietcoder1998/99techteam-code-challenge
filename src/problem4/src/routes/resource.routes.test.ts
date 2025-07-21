import request from 'supertest';
import express from 'express';
import resourceRoutes from './resource.routes';
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

describe('Resource Routes', () => {
  let resourceId: number;

  it('POST /api/resources - should create a resource', async () => {
    const res = await request(app)
      .post('/api/resources')
      .send({ name: 'RouteTest', type: 'route' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('RouteTest');
    expect(res.body.type).toBe('route');
    resourceId = res.body.id;
  });

  it('GET /api/resources - should get all resources', async () => {
    const res = await request(app).get('/api/resources');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /api/resources/:id - should get a resource by id', async () => {
    const res = await request(app).get(`/api/resources/${resourceId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', resourceId);
  });

  it('PUT /api/resources/:id - should update a resource', async () => {
    const res = await request(app)
      .put(`/api/resources/${resourceId}`)
      .send({ name: 'RouteTestUpdated', type: 'route-updated' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('RouteTestUpdated');
    expect(res.body.type).toBe('route-updated');
  });

  it('DELETE /api/resources/:id - should delete a resource', async () => {
    const res = await request(app).delete(`/api/resources/${resourceId}`);
    expect(res.status).toBe(204);
  });

  it('GET /api/resources/:id - should return 404 for deleted resource', async () => {
    const res = await request(app).get(`/api/resources/${resourceId}`);
    expect(res.status).toBe(404);
  });
});