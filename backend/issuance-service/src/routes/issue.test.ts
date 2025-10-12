import request from 'supertest';
import { createServer } from '../server';
import * as fs from 'fs';

const app = createServer();

// Clean up test database before tests
beforeAll(() => {
  if (fs.existsSync('./data/issuance.db')) {
    fs.unlinkSync('./data/issuance.db');
  }
});

describe('POST /api/issue', () => {
  it('should issue a new credential successfully', async () => {
    const credential = {
      name: 'John Doe',
      email: 'john@example.com',
      course: 'Kubernetes'
    };

    const response = await request(app)
      .post('/api/issue')
      .send(credential)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('credential issued by');
    expect(response.body.credential).toEqual(credential);
    expect(response.body.issuedBy).toBeDefined();
    expect(response.body.timestamp).toBeDefined();
  });

  it('should return error when credential already issued', async () => {
    const credential = {
      name: 'Jane Smith',
      email: 'jane@example.com',
      course: 'Docker'
    };

    // First issuance
    await request(app)
      .post('/api/issue')
      .send(credential)
      .expect(201);

    // Second issuance attempt
    const response = await request(app)
      .post('/api/issue')
      .send(credential)
      .expect(409);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Credential already issued');
    expect(response.body.issuedBy).toBeDefined();
  });

  it('should return error when no credential data provided', async () => {
    const response = await request(app)
      .post('/api/issue')
      .send({})
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Credential data is required');
  });
});

describe('GET /api/health', () => {
  it('should return health status', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body.status).toBe('healthy');
    expect(response.body.service).toBe('issuance');
  });
});
