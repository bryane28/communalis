import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('E2E: auth -> users -> students', () => {
  let app: INestApplication;
  jest.setTimeout(60000);

  beforeAll(async () => {
    // Configure dedicated E2E environment
    process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/communalis_e2e';
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'e2e_secret';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Align with main.ts
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers admin, logs in, then GET /api/users', async () => {
    const adminEmail = `admin.e2e+${Date.now()}@example.com`;

    // Register admin
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        nom: 'Admin',
        prenom: 'E2E',
        email: adminEmail,
        motDePasse: 'Password123',
        role: 'admin',
        telephone: '+2250700000099',
      })
      .expect(201);

    // Login admin
    const loginAdmin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: adminEmail, motDePasse: 'Password123' })
      .expect(201);

    const adminToken: string = loginAdmin.body.access_token;
    expect(adminToken).toBeDefined();

    // GET users (requires admin)
    const usersRes = await request(app.getHttpServer())
      .get('/api/users?page=1&limit=1')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(usersRes.body).toHaveProperty('data');
    expect(usersRes.body).toHaveProperty('meta');
  });

  it('registers formateur, logs in, then POST /api/students', async () => {
    const formateurEmail = `formateur.e2e+${Date.now()}@example.com`;

    // Register formateur
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        nom: 'Formateur',
        prenom: 'E2E',
        email: formateurEmail,
        motDePasse: 'Password123',
        role: 'formateur',
        telephone: '+2250700000098',
      })
      .expect(201);

    // Login formateur
    const loginFormateur = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: formateurEmail, motDePasse: 'Password123' })
      .expect(201);

    const formateurToken: string = loginFormateur.body.access_token;
    const formateurId: string = loginFormateur.body.user?._id;
    expect(formateurToken).toBeDefined();
    expect(formateurId).toBeDefined();

    // Create student (role formateur required)
    const payload = {
      nom: 'Alice',
      prenom: 'E2E',
      age: 10,
      matricule: `E2E-${Date.now()}`,
      formateurId: formateurId,
      remarques: 'Créé via e2e',
    };

    const createRes = await request(app.getHttpServer())
      .post('/api/students')
      .set('Authorization', `Bearer ${formateurToken}`)
      .send(payload)
      .expect(201);

    expect(createRes.body).toHaveProperty('_id');
    expect(createRes.body.nom).toBe('Alice');
  });

  it('formateur can GET /api/students and see own students', async () => {
    const formateurEmail = `formateur.list+${Date.now()}@example.com`;

    // Register & login formateur
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ nom: 'F', prenom: 'L', email: formateurEmail, motDePasse: 'Password123', role: 'formateur' })
      .expect(201);
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: formateurEmail, motDePasse: 'Password123' })
      .expect(201);
    const token = login.body.access_token as string;
    const formateurId = login.body.user?._id as string;

    // Create a student for this formateur
    await request(app.getHttpServer())
      .post('/api/students')
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: 'Stu', prenom: 'List', age: 9, matricule: `M-${Date.now()}`, formateurId })
      .expect(201);

    // List students
    const res = await request(app.getHttpServer())
      .get('/api/students?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('parent cannot GET /api/students (403)', async () => {
    const parentEmail = `parent.forbid+${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ nom: 'P', prenom: 'X', email: parentEmail, motDePasse: 'Password123', role: 'parent' })
      .expect(201);
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: parentEmail, motDePasse: 'Password123' })
      .expect(201);
    const token = login.body.access_token as string;

    await request(app.getHttpServer())
      .get('/api/students')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('upload avatar for user via POST /api/users/:id/avatar', async () => {
    const email = `avatar.user+${Date.now()}@example.com`;
    // Register & login as formateur (has access to upload own avatar)
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ nom: 'Ava', prenom: 'Tar', email, motDePasse: 'Password123', role: 'formateur' })
      .expect(201);
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, motDePasse: 'Password123' })
      .expect(201);
    const token = login.body.access_token as string;
    const userId = login.body.user?._id as string;

    // 1x1 PNG buffer (tiny)
    const tinyPng = Buffer.from(
      '89504E470D0A1A0A0000000D4948445200000001000000010802000000907724' +
        '0000000A49444154789C6360000002000100FFFF03000006000557BF0A0000000049454E44AE426082',
      'hex',
    );

    const res = await request(app.getHttpServer())
      .post(`/api/users/${userId}/avatar`)
      .set('Authorization', `Bearer ${token}`)
      .attach('file', tinyPng, { filename: 'tiny.png', contentType: 'image/png' })
      .expect(201);
    expect(res.body).toHaveProperty('avatarUrl');
  });
});
