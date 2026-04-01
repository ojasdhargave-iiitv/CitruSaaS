# CitruSaaS White-Box Testing

## Goal
Validate internal logic, branches, and error paths in backend and selected frontend flows.

## Target Coverage
- Statement coverage: at least 80%
- Branch coverage: at least 70%
- Critical controllers/routes: at least 90% statement coverage

## Suggested Tooling
- Backend: Jest or Vitest + Supertest + mocked Prisma client
- Frontend: React Testing Library + Vitest
- Coverage command example:
  - backend: `npm test -- --coverage`
  - frontend: `npm test -- --coverage`

## White-Box Unit Targets (Backend)

### 1) Project Controller (`backend/src/controllers/projectController.ts`)
- `createProject`:
  - Branch: missing name -> `400`
  - Branch: with optional fields absent -> defaults applied
  - Branch: userId empty string -> stored as null
  - Error path: prisma create throws -> `500`
- `getProject`:
  - Branch: missing id -> `400`
  - Branch: project not found -> `404`
  - Branch: success -> `200`
- `listProjects`:
  - Branch: success -> sorted descending by createdAt
  - Error path: prisma failure -> `500`
- `deleteProject`:
  - Branch: missing id -> `400`
  - Branch: success -> confirmation message
  - Error path: delete failure -> `500`

### 2) User Controller (`backend/src/controllers/userController.ts`)
- `userSignupPost`:
  - Branch: missing required fields -> `400`
  - Branch: duplicate user/email -> `400`
  - Branch: successful hash and create -> `201`
  - Verify: jwt payload includes userId, username, email
  - Error path: bcrypt/prisma/jwt error -> `500`
- `userLoginPost`:
  - Branch: missing email/password -> `400`
  - Branch: unknown email -> `400`
  - Branch: password mismatch -> `401`
  - Branch: success -> `200` with token
  - Error path: runtime failure -> `500`

### 3) File Controller (`backend/src/controllers/fileController.ts`)
- `createFile`:
  - Branch: missing filePath/projectId -> `400`
  - Branch: file already exists -> `400`
  - Branch: success path uses `FileType.FILE`
- `createFolder`:
  - Branch: missing inputs -> `400`
  - Branch: duplicate folder -> `400`
  - Branch: success path uses `FileType.FOLDER`
- `deleteItem`:
  - Branch: missing input -> `400`
  - Branch: delete path + nested path delete by `startsWith`
- `saveFile`:
  - Branch: missing input -> `400`
  - Branch: success content fallback to empty string
- `loadProject`:
  - Branch: missing projectId -> `400`
  - Branch: project not found -> `404`
  - Branch: success -> confirmation message
- `getFile`:
  - Branch: missing query params -> `400`
  - Branch: not found -> `404`
  - Branch: success returns content
- `listFiles`:
  - Branch: missing projectId -> `400`
  - Branch: root path handling (`dirPath` undefined or `.`)
  - Branch: directory detection for nested files
  - Branch: sorting directories before files
- `createTemplateFile`:
  - Branch: missing inputs -> `400`
  - Branch: module map hit (`jwt`, `zod`, etc.)
  - Branch: fallback name from unknown moduleId
  - Branch: template fetch fail -> `404`
  - Branch: upsert success -> `200`
- `initWorkspace`:
  - Branch: missing projectId -> `400`
  - Branch: deletes old entries then inserts template files
- `downloadProjectZip`:
  - Branch: missing projectId -> `400`
  - Branch: project not found -> `404`
  - Branch: archive success with appended files
  - Error path: archive error before headers sent -> `500`

### 4) Generator Controller (`backend/src/controllers/generate_controller.ts`)
- `generateBoilerplate`:
  - Branch: schema parse success then service call -> `200`
  - Branch: schema parse failure -> `400`
  - Branch: service failure -> `400` with error payload

## White-Box Integration Targets

| ID | Flow | Internal Focus | Expected Assertion |
|---|---|---|---|
| WB-INT-01 | Signup -> Login | bcrypt hash + compare + jwt sign | Stored hash not plain text, valid login returns token |
| WB-INT-02 | Create project -> Load project | Prisma project create/find | load route succeeds only for existing project |
| WB-INT-03 | Create file -> Save -> Get content | Prisma file create/update/find | retrieved content equals saved content |
| WB-INT-04 | Create folder -> Create nested file -> List root | listFiles path parsing + directory detection | root list contains folder as directory |
| WB-INT-05 | Init workspace -> List files | template service + DB insertion loop | initial structure files are present |
| WB-INT-06 | Download zip | archiver stream pipeline | response headers include zip content-disposition |

## Frontend White-Box Focus
- Home page effects:
  - `fetchProjects` success and failure branches
  - login state derived from localStorage token
- Dashboard page:
  - loading branch, empty branch, populated branch
  - click project card triggers `/files/load` call and navigation to `/builder`
- Auth modal integration:
  - successful login sets token and updates UI state

## Example Test Skeleton (Backend, Jest + Supertest)
```ts
import request from 'supertest';
import app from '../src/app';

describe('Project API white-box checks', () => {
  it('returns 400 when project name is missing', async () => {
    const res = await request(app)
      .post('/api/projects')
      .send({ description: 'x' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Name is required/i);
  });
});
```

## Defect Logging Format
For each failed white-box test, capture:
- Function under test
- Branch/path expected
- Actual path observed
- Input payload
- Mock setup details
- Stack trace or assertion diff

## Exit Criteria
- Coverage goals met.
- All critical branch tests pass for auth, project, file, and generator controllers.
- Known failures documented with root-cause notes and impact level.
