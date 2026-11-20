# AGENTS.md

Guidance for AI coding agents and contributors working on the Trainify API.

## Project overview

Trainify API is the backend of the Trainify fitness app. It is a REST API built with Fastify, TypeScript, Prisma ORM and PostgreSQL. It manages exercises, workouts, workout scheduling, workout sessions, exercise logs, weight logs and goals, metrics and gamification (streaks and badges). Interactive docs are served by Scalar at `/docs`.

## Commands

- `npm run dev`: start the server in watch mode (`tsx watch src/server.ts`).
- `npm run build`: bundle with tsup into `build/`.
- `npm run test`: run the Vitest suite once.
- `npm run test:watch`: run Vitest in watch mode.
- `npm run check`: lint and format check with Ultracite/Biome.
- `npm run fix`: apply Ultracite/Biome fixes automatically.
- `npm run migrate`: create and apply a Prisma migration in development.
- `npm run migrate:deploy`: apply existing migrations (used in production).
- `npm run seed`: seed the database with sample data.
- `npm run studio`: open Prisma Studio.

The Prisma client is generated into `generated/prisma` (see `prisma/schema/base.prisma`). Import Prisma types and enums from `generated/prisma`, never from `@prisma/client`. If the client is missing or stale, run `npx prisma generate`.

Before finishing any task, run `npm run check` and `npm run test`.

## Architecture

Each feature lives in `src/modules/<module>/` and follows this layered structure:

```
routes/                Fastify route registration, Zod schemas for params, body, querystring and responses
controllers/           Reads request data, calls a factory, sends the reply. No business logic.
use-cases/             Business logic. One class per use case, with a single public `execute` method.
use-cases/factories/   Builds a use case with its concrete repositories (Prisma implementations).
repositories/          Repository interfaces (`*.repository.ts`)
repositories/prisma/   Prisma implementations of the interfaces
repositories/in-memory/  In-memory implementations used by unit tests
schemas/               Zod schemas for request validation and response shapes
errors/                Domain errors extending AppError
utils/                 Pure helper functions
```

Flow of a request: `route → controller → factory → use case → repository`.

Rules:

- Controllers must not contain business logic and must not instantiate repositories directly. Always go through a factory (`make<UseCaseName>`).
- Factories must instantiate concrete Prisma repositories and Unit of Work dependencies into named local variables before passing them to use cases. Do not instantiate these dependencies inline in a use case constructor call.
- Use cases depend on repository interfaces through their constructor, never on Prisma directly.
- Repositories return Prisma entities or plain objects. Business rules belong in use cases.
- Shared code goes in `src/shared/` (errors, middlewares) and `src/lib/` (Prisma client, Swagger). Do not duplicate it inside modules.
- Each route file registers exactly one route. Module `routes/index.ts` registers all of them.

## Naming conventions

- Files use kebab-case with a suffix that states their role: `create-workout.use-case.ts`, `create-workout.controller.ts`, `create-workout.route.ts`, `create-workout.schema.ts`, `make-create-workout-use-case.ts`, `workouts.repository.ts`, `prisma-workouts.repository.ts`.
- Classes are PascalCase and end with their role: `CreateWorkoutUseCase`, `PrismaWorkoutsRepository`, `InMemoryWorkoutsRepository`.
- Use case request and response types are declared as local interfaces named `<UseCaseName>Request` and `<UseCaseName>Response`, not exported.
- Factory functions are named `make<UseCaseName>` and live in `use-cases/factories/`.
- Controllers are named `<routeName>Controller` and exported as functions.
- Route functions are named `<routeName>Route` and exported as functions.

## Language

The codebase mixes English and Portuguese on purpose:

- Code identifiers, file names, comments, API descriptions and Swagger documentation: English.
- Seed data (`prisma/seeds/`) and some user-facing error messages and exercise names: Portuguese, matching the existing data. Do not translate existing seed content unless asked.

When writing new code, use English for all identifiers and descriptions. Keep Portuguese only where the existing data or messages already use it.

## Validation and schemas

- Use Zod (v4) for all request validation. Schemas live in the module's `schemas/` folder and are passed to the route's `params`, `body`, `querystring` or `response` options.
- Export inferred types next to the schema, e.g. `export type CreateWorkoutBody = z.infer<typeof createWorkoutBodySchema>`.
- Describe response fields with `.describe('...')` so they show up in Swagger.
- Reuse shared schemas (e.g. `workoutSchema`, `exerciseSchema`, `weightLogSchema`) in responses instead of redefining shapes.
- Dates in responses are `z.date()` or `z.iso.datetime()` depending on what the module already uses. Follow the nearby code.

## Errors

- All domain errors extend `AppError` from `src/shared/errors/app.error.ts` and receive an HTTP status code in their constructor.
- Reuse the shared errors where they fit: `ResourceNotFoundError` (404), `ResourceAlreadyExistsError` (409), `NotAllowedError` (403), `UnauthorizedError` (401).
- Module-specific errors go in the module's `errors/` folder, e.g. `WeightGoalNotAchievedError`.
- Do not throw plain `Error` from use cases for expected conditions. The global `errorHandler` maps `AppError` to the response body `{ message }`.
- Ownership checks belong in use cases: if a resource does not exist or does not belong to the user, throw `ResourceNotFoundError` with the same message, so that existence is not leaked.
- Prisma unique constraint violations (`code === 'P2002'`) must be mapped to `ResourceAlreadyExistsError` inside the use case when a race is possible.

## Authentication and security

- Protected routes use `onRequest: [verifyJwt]`. The authenticated user id is `request.user.sub`.
- Two authentication modes exist. Browser clients send the access token in an HTTP-only cookie named `token`; API clients send `Authorization: Bearer <token>`. `verifyJwt` enforces CSRF origin checks for cookie-authenticated mutations. Do not weaken or bypass this for new routes.
- Refresh tokens live in the cookie `refreshToken`, scoped to `/token/refresh`. Access tokens must have `type: 'access'` and refresh tokens `type: 'refresh'`.
- Logout and password changes increment `tokenVersion` on the user, which invalidates existing refresh tokens. Keep this behavior when touching auth code.
- Never return `password` or `tokenVersion` in responses. Use the sanitized shapes (`PublicUserDTO`).
- Route-level rate limits are configured with `config.rateLimit` on sensitive routes (auth, register). Follow the same pattern for new sensitive endpoints.
- Do not log secrets. The logger already redacts authorization, cookies and password fields; keep it that way.

## Testing

Unit tests exist only for use cases. Do not create test files for anything else.

Rules:

- One test file per use case, placed next to it: `create-workout.use-case.ts` → `create-workout.use-case.spec.ts`.
- Do not create unit tests for schemas, utils, controllers, routes, repositories, factories, errors, middlewares or providers. Those are not tested in this project, even if they look simple or pure. If a helper contains important logic, test it indirectly through the use case that uses it.
- Exceptions that already exist (such as `src/shared/middlewares/verify-jwt.spec.ts` and `src/modules/user/providers/google-auth.provider.spec.ts`) are legacy. Do not copy that pattern into new work.
- Use the in-memory repositories from `repositories/in-memory/` to build use cases in tests. Use the test factories in `tests/factories/` (e.g. `makeUser`, `makeExercise`, `makeWorkoutExercise`) to create fixtures.
- Use `beforeEach` to create fresh repositories and the system under test (`sut`).
- Test names describe behavior in English, starting with "should" or with the business rule, e.g. `it('should not be able to authenticate with a wrong password')`.
- Cover the success path and each business rule or error branch of the use case. Do not write tests for trivial pass-through code.
- Use `vi.spyOn` or `vi.fn` only when needed to simulate failures such as Prisma errors.
- Do not hit the database in unit tests.

## Task and PR workflow

- Commit messages and PR titles follow Conventional Commits (`feat`, `fix`, `refactor`, `chore`, `docs`, `test`), enforced by commitlint and the PR validation workflow.
- Create implementation branches from `develop` unless the work is intentionally stacked on an unmerged predecessor branch. Name branches `<type>/<scope>-<short-description>` in lowercase kebab-case, e.g. `fix/session-calendar-and-time` or `refactor/metrics-read-model`.
- For stacked PRs, target the predecessor branch. After it merges, retarget the next PR to `develop`.
- Use Conventional Commit subjects in the form `<type>(<scope>): <summary>`. Keep commits focused and use a concise, imperative summary.
- Always get the user's explicit approval before creating a commit. Do not infer approval from a request to implement, push, or open a PR.
- Push a branch or open a PR only when the user explicitly asks for it.
- PRs target `develop` unless they are intentionally stacked. Use the exact commit subject as the PR title when the PR contains one commit. When it contains multiple commits, create one Conventional Commit title that summarizes them.
- Create PRs with a title only; do not add a description unless the user asks for one.
- Keep `docs/` and `AGENTS.md` out of commits unless the user explicitly asks to include them. Both are ignored by Git in this workflow.
- Keep changes focused. A task should not reformat unrelated files.
- Do not change `prisma/migrations/` manually. Create migrations with `npm run migrate` and keep the generated SQL.
- Do not edit `generated/` or `build/`.
- Do not commit `.env`. Use `.env.example` to document new environment variables.
- When adding a new endpoint, register the route in the module's `routes/index.ts`, and add its tag to `src/lib/swagger.ts` only if the module is new.
- When changing a Prisma schema, make sure the related repositories and in-memory implementations keep matching the interface.

## Code style

- Formatting and linting are handled by Biome through Ultracite. Run `npm run fix` rather than formatting by hand. The source of truth is `biome.jsonc`.
- No semicolons, single quotes, trailing commas where valid.
- Import order: external packages first, then `@/` aliases, then relative imports.
- Use `import type` for type-only imports.
- Use dayjs for date manipulation. Do not add `date-fns` or `moment`.
- Prefer small, pure helper functions in `utils/` when logic is reused across use cases.
- TypeScript runs in strict mode with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`. Handle `undefined` from array access explicitly and do not pass `undefined` to optional properties; spread conditionally instead, as the existing code does.

## Known pitfalls

- Session status is partly derived. `getExerciseSessionState` returns `SKIPPED` for uncompleted exercises once the workout session has ended (by `endedAt` or by a terminal status), not because a field stores it. Do not store derived states.
- A workout session can be completed in one call (`CompleteWorkoutSessionUseCase`), which creates at most one `ExerciseLog` per `ExerciseSession`. Preserve this idempotency when changing that flow.
- `UserStreak` and `UserStreakLog` are updated only when at least one exercise is completed. Refresh endpoints must not add log entries.
- Weight goal progress depends on the goal type: `LOSE` and `GAIN` use the start and target weights, `MAINTAIN` also uses the log history and a consistency score. Changes to `calculateWeightGoalProgress` affect several use cases.
- Creating a weight goal deactivates all other active goals of the user. Preserve this when touching goal creation.
- Exercise names are unique per user among non-archived custom exercises, case-insensitively, and catalog exercises have their own uniqueness. Check the partial unique indexes before changing name logic.
- The `exercises` table has a check constraint that custom exercises must have an owner and catalog exercises must not.
- Dates from the database are `Date` objects; `workouts` responses use `createdAt` and `WorkoutSession` uses `date`. Do not mix them up when mapping.
- The `tsup` build outputs `build/server.cjs`, which is what the Docker image runs. Keep the entry point `src/server.ts`.
- Google sign-in verifies the access token audience against `GOOGLE_CLIENT_ID`. Do not skip that check.
- Migrations are not run on container start. Production deployments must run `migrate:deploy` explicitly.
