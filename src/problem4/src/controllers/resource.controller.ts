import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createResource = async (req: Request, res: Response) => {
  const { name, type } = req.body;
  try {
    const resource = await prisma.resource.create({ data: { name, type } });
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create resource' });
  }
};

export const getResources = async (req: Request, res: Response) => {
  const { type } = req.query;
  try {
    const resources = await prisma.resource.findMany({
      where: type ? { type: String(type) } : undefined,
    });

    console.log('Resources fetched:', resources);
    res.json(resources);
  } catch (error) {
    console.log('Error fetching resources:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
};

export const getResourceById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const resource = await prisma.resource.findUnique({ where: { id: +id } });
    resource
      ? res.json(resource)
      : res.status(404).json({ error: 'Resource not found' });
  } catch {
    res.status(500).json({ error: 'Error retrieving resource' });
  }
};

export const updateResource = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, type } = req.body;
  try {
    const updated = await prisma.resource.update({
      where: { id: +id },
      data: { name, type },
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to update resource' });
  }
};

export const deleteResource = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.resource.delete({ where: { id: +id } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete resource' });
  }
};
