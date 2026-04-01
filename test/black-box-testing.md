# CitruSaaS Black-Box Testing

## Goal
Validate user-visible behavior of CitruSaaS without depending on internal implementation details.

## Scope
- Backend API contracts and responses
- End-to-end user flows from frontend perspective
- Input/output validation and error handling

## Assumptions
- Backend runs at `http://localhost:5000`
- Frontend runs at `http://localhost:5173`
- Test database is isolated from production

## Test Data
- Valid user:
  - username: `bb_user_01`
  - email: `bb_user_01@example.com`
  - password: `Pass@1234`
- Invalid email: `bb_user_01example.com`
- Invalid project id: `not-a-real-project-id`

## API Black-Box Test Cases

| ID | Endpoint | Input | Expected Output |
|---|---|---|---|
| BB-API-01 | `POST /api/users/signup` | valid username/email/password | `201`, token returned, user object returned |
| BB-API-02 | `POST /api/users/signup` | missing username | `400`, error for required fields |
| BB-API-03 | `POST /api/users/signup` | duplicate email/username | `400`, duplicate error message |
| BB-API-04 | `POST /api/users/login` | valid email/password | `200`, token + user object |
| BB-API-05 | `POST /api/users/login` | unknown email | `400`, account not found |
| BB-API-06 | `POST /api/users/login` | wrong password | `401`, incorrect password |
| BB-API-07 | `GET /api/users/auth/verify` | valid bearer token | `200`, `authorized: true` |
| BB-API-08 | `GET /api/users/auth/verify` | missing/invalid token | `401` or `403` unauthorized response |
| BB-API-09 | `POST /api/projects` | valid project payload | `200`, created project with id |
| BB-API-10 | `POST /api/projects` | missing name | `400`, name required |
| BB-API-11 | `GET /api/projects` | no input | `200`, array sorted latest-first |
| BB-API-12 | `GET /api/projects/:id` | valid id | `200`, matching project |
| BB-API-13 | `GET /api/projects/:id` | invalid/non-existent id | `404`, not found |
| BB-API-14 | `DELETE /api/projects/:id` | valid id | `200`, deletion success |
| BB-API-15 | `POST /api/files/create` | valid `projectId`, new `filePath` | `200`, file created |
| BB-API-16 | `POST /api/files/create` | duplicate `filePath` in project | `400`, file already exists |
| BB-API-17 | `POST /api/files/create-folder` | valid folder path | `200`, folder created |
| BB-API-18 | `POST /api/files/save` | valid file + content | `200`, save success |
| BB-API-19 | `GET /api/files/content` | valid `projectId` + `filePath` | `200`, content returned |
| BB-API-20 | `GET /api/files/content` | missing file | `404`, file not found |
| BB-API-21 | `GET /api/files/list` | root list request | `200`, files/directories array |
| BB-API-22 | `POST /api/files/delete` | folder path containing nested files | `200`, item deleted (recursive effect) |
| BB-API-23 | `POST /api/files/template` | valid module + file type + project | `200`, template created |
| BB-API-24 | `POST /api/files/template` | invalid module id | `404`, template not found |
| BB-API-25 | `POST /api/files/init` | valid project id | `200`, workspace initialized |
| BB-API-26 | `GET /api/files/download` | valid project id | `200`, zip attachment |
| BB-API-27 | `GET /api/files/download` | missing project id | `400`, project id required |
| BB-API-28 | `POST /api/generate` | valid boilerplate config | `200`, generation started |
| BB-API-29 | `POST /api/generate` | invalid config shape | `400`, schema validation error |

## UI Black-Box Test Cases

| ID | Screen | Steps | Expected Output |
|---|---|---|---|
| BB-UI-01 | Home (`/`) | Open app with backend running | Framework cards and project section load |
| BB-UI-02 | Auth modal | Click Sign In | Login modal opens |
| BB-UI-03 | Signup flow | Register with valid details | Success response and user considered logged-in |
| BB-UI-04 | Login flow | Login with valid credentials | Token stored, auth buttons change to logout/profile area |
| BB-UI-05 | Logout flow | Click Logout | Token removed and page refreshes |
| BB-UI-06 | Create project | Pick framework and submit project modal | Project appears in Recent Projects |
| BB-UI-07 | Open project from Home | Click a recent project card | App navigates to `/builder` |
| BB-UI-08 | Dashboard list | Open `/dashboard` | Existing projects displayed |
| BB-UI-09 | Open project from Dashboard | Click Open Project button/card | App navigates to `/builder` |
| BB-UI-10 | Empty dashboard state | Use account with zero projects | Empty-state message and create button visible |

## Non-Functional Black-Box Checks
- API response time for common operations (`/api/projects`, `/api/files/list`) should remain below 500ms in local environment.
- Download endpoint should return a valid zip file that can be extracted on Windows.
- Unauthorized endpoints should not leak stack traces in response bodies.

## Exit Criteria
- All high-priority black-box tests pass.
- No blocker defect in auth, project creation/loading, file operations, or generation flow.
- Regressions are logged with reproduction steps and expected vs actual behavior.
