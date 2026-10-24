import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const meetingSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().default(''),
  date: z.string().optional(),
  participants: z.array(z.string()).optional().default([]),
});

export const meetingUpdateSchema = meetingSchema.partial();

export const taskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().default(''),
  status: z.enum(['pending', 'in-progress', 'completed']).default('pending'),
  dueDate: z.string().optional(),
  meetingId: z.string().optional(),
});

export const taskUpdateSchema = taskSchema.partial();

export const noteSchema = z.object({
  content: z.string().min(1).max(10000),
  meetingId: z.string().min(1),
});
