import { sql } from 'drizzle-orm';
import supertest from 'supertest';
import app from '../src/app';
import db, { pool } from '../src/db';

const request = supertest(app);

describe('Testing Authentication Routes', () => {
  let departmentId: string;

  beforeAll(async () => {
    await db.execute(sql`BEGIN;`);
    const response = await request.post('/api/v1/department').send({
      code: 'CS',
      name: 'Computer Science',
    });
    departmentId = response.body.departmentId;
  });
  afterAll(async () => {
    await db.execute(sql`ROLLBACK;`);
    await pool.end();
  });

  describe('Testing Register Route', () => {
    it('Should return an error if email is not provided', async () => {
      const response = await request.post('/api/v1/auth/register').send({
        password: 'password',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
        role: 'student',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
        },
        rollNumber: '123456',
        departmentId,
        admissionDate: new Date().toISOString(),
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('All fields are required');
    });

    it('Should register a new student', async () => {
      const response = await request.post('/api/v1/auth/register').send({
        email: 'student@test.com',
        password: 'password',
        firstName: 'John',
        lastName: 'Student',
        phoneNumber: '1234567890',
        role: 'student',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
        },
        rollNumber: '123456',
        departmentId,
        admissionDate: new Date().toISOString(),
      });

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registration successful');
    });

    it('Should register a new admin', async () => {
      const response = await request.post('/api/v1/auth/register').send({
        email: 'admin@test.com',
        password: 'password',
        firstName: 'John',
        lastName: 'Admin',
        phoneNumber: '1234567890',
        role: 'admin',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
        },
        employeeId: '123456',
      });

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registration successful');
    });
  });

  describe('Testing Login Route', () => {
    it('Should return an error if email is not provided', async () => {
      const response = await request.post('/api/v1/auth/login').send({
        password: 'password',
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('All fields are required');
    });

    it('Should return an error if password is not provided', async () => {
      const response = await request.post('/api/v1/auth/login').send({
        email: 'T8dD2@example.com',
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('All fields are required');
    });

    it('Should login a user', async () => {
      const response = await request.post('/api/v1/auth/login').send({
        email: 'admin@test.com',
        password: 'password',
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User login successful');

      expect(response.headers['set-cookie']).toBeDefined();
      const cookies = response.headers['set-cookie'];
      expect(cookies[0]).toMatch(/token=.*;/);
    });
  });
});
