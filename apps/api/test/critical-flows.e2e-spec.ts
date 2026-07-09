import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Critical API flows (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('register/login/me', async () => {
    const email = `e2e-${Date.now()}@mentormind.ai`;
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'Password123!', fullName: 'E2E Student' })
      .expect(201);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'Password123!' })
      .expect(201);

    accessToken = login.body.data.accessToken;

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });

  it('creates roadmap request and generates mock AI draft', async () => {
    const created = await request(app.getHttpServer())
      .post('/roadmap-requests')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        goal: 'Become backend developer with portfolio and interview readiness',
        targetRole: 'Backend Developer',
        currentLevel: 'FOUNDATION',
        currentSkills: ['JavaScript'],
        weakAreas: ['Databases'],
        weeklyHours: 8,
        preferredSchedule: 'Evenings',
        budgetRange: '$500-$800',
        learningStyle: 'Project-based',
        wantsInterviewPrep: true,
        wantsCodePractice: true,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/roadmap-requests/${created.body.data.id}/generate-ai-draft`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);
  });
});
