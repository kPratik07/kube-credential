import request from 'supertest';
import { createServer } from '../server';
import * as fs from 'fs';

const app = createServer();

// Clean up test database before tests
beforeAll(() => {
  if (fs.existsSync('./data/verification.db')) {
    fs.unlinkSync('./data/verification.db');
  }
});

describe('POST /api/verify', () => {
  it('should return error when no credential data provided', async () => {
    const response = await request(app)
      .post('/api/verify')
      .send({})
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Credential data is required');
  });

  it('should return not found for non-existent credential', async () => {
    const credential = {
      name: 'Non Existent',
      email: 'nonexistent@example.com',
      course: 'Test'
    };

    const response = await request(app)
      .post('/api/verify')
      .send(credential)
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.valid).toBe(false);
    expect(response.body.verifiedBy).toBeDefined();
    expect(response.body.verifiedAt).toBeDefined();
  });
});

describe('GET /api/health', () => {
  it('should return health status', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body.status).toBe('healthy');
    expect(response.body.service).toBe('verification');
  });
});

describe('GET /api/history', () => {
  it('should return verification history', async () => {
    const response = await request(app)
      .get('/api/history')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.history)).toBe(true);
  });
});
