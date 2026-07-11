# MentorMind AI

MentorMind AI is a production-minded full-stack foundation for an AI-powered 1-on-1 tutoring platform. In this product, a "course" is a mentor-led tutoring package or a custom learning journey, not a passive video course.

## Architecture

- `apps/web`: Next.js App Router, TypeScript, Tailwind, Framer Motion-ready UI, React Three Fiber hero, Monaco coding screen.
- `apps/api`: NestJS, Prisma, PostgreSQL, Redis/BullMQ-ready, JWT auth, RBAC, Swagger, AI provider abstraction, safe code judge abstraction.
- `packages/shared`: shared enums, DTO helpers, seed-like catalog data, formatting utilities.
- `docker-compose.yml`: local PostgreSQL with pgvector image and Redis.

## Implemented Foundation

- Auth: register, login, logout, refresh, `/auth/me`, Argon2, JWT access token, httpOnly refresh cookie rotation.
- RBAC: `STUDENT`, `MENTOR`, `ADMIN`, `SUPER_ADMIN`.
- Tutoring packages: browse/detail, consultation requests, admin CRUD.
- Roadmaps: custom request, AI draft generation, admin review/approve/assign/schedule, student activation.
- AI module: OpenAI-compatible provider, mock provider, prompt templates, schema validation, retry/fallback, usage/cost logs, admin settings.
- Coding practice: problem bank, Monaco UI, public/hidden test model, Judge0-compatible adapter, mock judge, AI hints and code review.
- Interview practice: sessions, AI answer evaluation, JD question generation, question bank CRUD.
- Resources: curated internal search first, external search adapter structure, AI recommendation reasons.
- CV review: CV/JD/portfolio/GitHub analysis with stored AI result.
- Booking/session/homework, notifications, support tickets, audit logs, admin analytics.
- Provider abstractions for storage and email with local/mock fallbacks, plus PayOS payment link and webhook support.

## Setup

```bash
pnpm install
docker-compose up -d postgres redis
pnpm db:migrate
pnpm db:seed
pnpm dev
```

The web app runs on [http://localhost:3000](http://localhost:3000). The API runs on [http://localhost:4000](http://localhost:4000), with Swagger at [http://localhost:4000/docs](http://localhost:4000/docs).

## Useful Commands

```bash
pnpm dev
pnpm build
pnpm lint
pnpm test
pnpm --filter @mentormind/api test:e2e
pnpm db:migrate
pnpm db:seed
pnpm prisma:generate
```

## Test Accounts

- `admin@mentormind.ai` / `Password123!` / `ADMIN`
- `mentor.frontend@mentormind.ai` / `Password123!` / `MENTOR`
- `mentor.ai@mentormind.ai` / `Password123!` / `MENTOR`
- `student@mentormind.ai` / `Password123!` / `STUDENT`

## Environment Variables

API variables live in `apps/api/.env`:

- `DATABASE_URL`, `REDIS_URL`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `ACCESS_TOKEN_TTL`, `REFRESH_TOKEN_TTL`
- `AI_PROVIDER=openai`, `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL`
- `JUDGE_PROVIDER=judge0`, `JUDGE0_BASE_URL`
- `SEARCH_PROVIDER=tavily`, `TAVILY_API_KEY`
- `STORAGE_PROVIDER=local`, `LOCAL_UPLOAD_DIR`
- `PAYMENT_PROVIDER=payos`
- `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`
- `PAYOS_BASE_URL`, `PAYOS_RETURN_URL`, `PAYOS_CANCEL_URL`
- `EMAIL_PROVIDER`, `SMTP_*`

Web variables live in `apps/web/.env`:

- `NEXT_PUBLIC_API_URL=http://localhost:4000`
- `NEXT_PUBLIC_APP_NAME=MentorMind AI`
- `API_INTERNAL_URL=http://localhost:4000`, `PACKAGE_API_TIMEOUT_MS=2500`
- `NEXT_PUBLIC_SITE_URL=https://mentormind.center`
- `NEXT_PUBLIC_SITE_INDEXING=true` (phải bật rõ ràng khi build production)
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` (nếu xác minh Search Console bằng meta tag)

## Production Notes

- Configure real provider keys before running production flows: OpenAI-compatible AI and Tavily.
- Local file uploads are stored under `uploads/{user_id}/...` and metadata is saved in `FileAsset`.
- Judge0 CE can be self-hosted locally instead of using RapidAPI:

```bash
pnpm judge0:preflight
docker compose --profile judge0 up -d judge0-server judge0-worker judge0-db judge0-redis
pnpm judge0:smoke
```

The pinned Judge0 1.13.1 image requires a Linux amd64 Docker host with cgroup v1.
See [`infra/judge0/README.md`](infra/judge0/README.md) before deploying or repairing
the worker. Then keep `JUDGE0_BASE_URL=http://localhost:2358`.

- Use an OpenAI-compatible chat completions endpoint for production AI, then tune prompt templates in `/admin/ai/prompts`.
- Use Judge0 or another sandboxed executor for production. Do not execute user code inside the API process.
- Use pgvector-backed embeddings through `ResourceEmbedding` and `ContentEmbedding`; the schema is ready for vector columns.
- PayOS payment links use `PAYOS_CLIENT_ID`, `PAYOS_API_KEY` and `PAYOS_CHECKSUM_KEY`. The webhook endpoint is `POST /payments/payos/webhook` and verifies the PayOS signature before updating payment status.
- Replace adapter placeholders with concrete SDK calls for S3-compatible storage and SMTP once credentials are available.

## Verification

Current local verification performed:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mentormind pnpm --filter @mentormind/api exec prisma validate
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mentormind pnpm --filter @mentormind/api prisma:generate
pnpm --filter @mentormind/api lint
pnpm --filter @mentormind/web test
pnpm --filter @mentormind/api test
```

## Known Limitations

- Some admin/dashboard pages are polished operational screens with mock-presented data; the API contracts exist for wiring richer live tables next.
- Storage, email and external search adapters have safe fallback implementations and production-compatible interfaces. PayOS is wired as the payment provider, but real checkout requires replacing the placeholder PayOS values in `apps/api/.env`.
- E2E tests require PostgreSQL/Redis and seeded env; run them after `docker-compose up -d postgres redis` and migrations.

## Next Production Steps

1. Add live data tables and form editors for every admin CRUD page.
2. Add file upload endpoints using the storage provider abstraction.
3. Add BullMQ jobs for async AI reports, email notifications and long-running judge submissions.
4. Add Playwright visual checks for the 3D hero and responsive dashboard.
5. Harden CSRF strategy for cookie-based auth in production deployment.
