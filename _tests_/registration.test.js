const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const app = require('../server');

const prisma = new PrismaClient();
let server;

// Increase Jest timeout to 10 seconds for all tests
jest.setTimeout(10000);

beforeAll(async () => {
  const PORT = 5101;
  server = app.listen(PORT);
});

afterAll(async () => {
  // Close server first
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  // Then disconnect Prisma
  await prisma.$disconnect();
});

describe('End-to-End Registration API Tests', () => {
  afterEach(async () => {
    // Clean up test data after each test
    await prisma.registration.deleteMany({
      where: {
        OR: [
          { aadhaar: '123456789012' },
          { aadhaar: '123' }
        ]
      }
    });
  });

  test('Health check works', async () => {
    const res = await request(server).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('Invalid Aadhaar returns 400', async () => {
    const res = await request(server)
      .post('/api/v1/registration')
      .send({
        aadhaar: '123', // invalid
        applicantName: 'Test User'
      });
    expect(res.status).toBe(400);
  });

  test('Valid Aadhaar returns 201', async () => {
    const res = await request(server)
      .post('/api/v1/registration')
      .send({
        aadhaar: '123456789012',
        pan: 'ABCDE1234F',
        applicantName: 'Valid User'
      });
    expect(res.status).toBe(201);
  });
});