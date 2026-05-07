# CitruSaaS Extended Documentation Blueprint

This document contains the expanded material for the CitruSaaS project, formatted so you can easily translate it into LaTeX for a formal 40-page report.

---

## 1. Literature Review & Feasibility Study

### 1.1 Literature Review
Modern web development relies heavily on cloud-based IDEs to circumvent local environment setup bottlenecks. Existing platforms, while powerful, have specific limitations that CitruSaaS addresses:
- **CodeSandbox & StackBlitz**: These platforms excel at rapid frontend prototyping (React, Vue) via WebContainers but restrict complex backend orchestration (like full PostgreSQL setups coupled with arbitrary Node/Express execution) and lack built-in full-architectural boilerplate injection (e.g., dynamically merging Stripe handler pipelines into a live backend folder).
- **GitHub Codespaces**: Emulates a complete VS Code environment inside a Docker container. While highly robust, it requires an existing GitHub repository, a lengthy prebuild phase, and targets advanced users. Furthermore, it operates as a raw environment without a "Manifest-Driven Module Generator" to rapidly bootstrap boilerplate architecture.
- **CitruSaaS Advantage**: CitruSaaS bridges the gap by offering a streamlined UI (Shadcn + Tailwind) where users can instantly spin up a project, backed by persistent PostgreSQL storage. The primary innovation is the **Dynamic Module Generator**, which pulls curated backend templates (JWT, OAuth, WebSockets, Prisma) from Supabase and orchestrates their injection directly into the user's active simulated file system, eliminating hours of manual `npm install` and file routing.

### 1.2 Feasibility Study
**Technical Feasibility**:
The project leverages the Node.js ecosystem, React 19, and Prisma ORM. Developing a virtual file system relying on database relations (saving files as rows in PostgreSQL) rather than disk I/O ensures scalability and circumvents the classic problem of ephemeral container wiping on PaaS providers like Render or Heroku. The backend `fs-extra` and Zod integrations validate and merge file contents accurately.

**Economic Feasibility**:
The decision to utilize Supabase for both the PostgreSQL database and persistent Template Storage ensures zero initial hosting costs. Because computations and file operations happen concurrently in memory and database writes, the application operates well within free-tier server limits (e.g., Render or Vercel). The integration of Dodo Payments introduces a direct monetization channel via premium framework gatekeeping.

**Operational Feasibility**:
The user interface replicates the familiar 3-pane structure of VS Code (Sidebar, Editor, Action Panel). This drastically reduces the learning curve. Operationally, the debounce-save mechanic ensures server limits are not exceeded while maintaining a seamless user experience.

---

## 2. Comprehensive API Documentation

CitruSaaS utilizes a RESTful JSON API structure. All secure endpoints require the `Authorization: Bearer <token>` header.

### 2.1 User Management Endpoints

**POST `/api/users/signup`**
- **Description**: Registers a new user and returns a JWT.
- **Request Body**:
  ```json
  {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Response** `201 Created`:
  ```json
  {
    "message": "User signup successful",
    "token": "eyJhbGci...<jwt>",
    "user": { "id": "uuid", "username": "john_doe", "email": "...", "isPremium": false }
  }
  ```

**POST `/api/users/login`**
- **Description**: Authenticates an existing user.
- **Request Body**: `{ "email": "john@example.com", "password": "securepassword123" }`
- **Response** `200 OK`: Similar to signup response.

**POST `/api/users/upgrade`**
- **Description**: Upgrades a user to premium status (Usually triggered via Dodo webhook).
- **Request Body**: `{ "userId": "uuid" }`

### 2.2 File System Endpoints

**POST `/api/files/create`**
- **Description**: Creates a new file node in the database.
- **Request Body**: `{ "filePath": "src/index.ts", "projectId": "uuid" }`
- **Response** `200 OK`: `{ "message": "File created successfully", "path": "src/index.ts" }`

**POST `/api/files/save`**
- **Description**: Updates the `content` string of a target file.
- **Request Body**: `{ "filePath": "src/index.ts", "content": "console.log('Hello');", "projectId": "uuid" }`
- **Response** `200 OK`: `{ "message": "File saved successfully" }`

**GET `/api/files/list?dirPath=src&projectId=uuid`**
- **Description**: Returns all files/folders belonging to a specific directory level for the sidebar tree UI.

**POST `/api/files/template`**
- **Description**: Core module injector. Fetches a script from Supabase Base Templates and injects it into the project.
- **Request Body**: `{ "moduleId": "jwt", "fileType": "ts", "projectId": "uuid" }`

---

## 3. Database Schema & Data Dictionary

The database is built on PostgreSQL operated via Prisma ORM.

### 3.1 User Table (`users`)
| Field Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, Default: gen_random_uuid() | Unique identifier for the user. |
| `email` | VARCHAR | UNIQUE, NOT NULL | User's email address for login. |
| `username` | VARCHAR | UNIQUE, NOT NULL | Display name. |
| `password` | VARCHAR | NOT NULL | Bcrypt hashed password. |
| `isPremium` | BOOLEAN | Default: false | Governs access to premium frameworks. |
| `created_at` | DATETIME | Default: now() | Timestamp of account creation. |

### 3.2 Project Table (`projects`)
| Field Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, Default: gen_random_uuid() | Unique identifier. |
| `name` | VARCHAR | NOT NULL | Custom name for the workspace. |
| `description` | VARCHAR | NULLABLE | Optional details about the project. |
| `framework` | VARCHAR | NULLABLE | e.g., 'express-ts', 'react'. |
| `userId` | UUID | FOREIGN KEY (users.id) | Links project to the owner. |

### 3.3 File Table (`File`)
*Note: Evaluates a flat database into a recursive file tree.*
| Field Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR | PRIMARY KEY | Composed of `${projectId}-${filePath}`. |
| `name` | VARCHAR | NOT NULL | Localized filename (e.g., `index.ts`). |
| `path` | VARCHAR | NOT NULL | Full path structure (`src/controllers/index.ts`). |
| `type` | ENUM | NOT NULL ('FILE' or 'FOLDER') | File designation attribute. |
| `content` | TEXT | Default: "" | The actual raw code content. |
| `projectId`| UUID | FOREIGN KEY (projects.id) | Project this file belongs to. |

### 3.4 Template Table (`templates`)
| Field Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Identifies the Supabase storage entity. |
| `name` | VARCHAR | NOT NULL | Template visual name. |
| `type` | VARCHAR | NOT NULL | 'base' or 'initial' template. |
| `path` | VARCHAR | NOT NULL | The path locator in the Supabase bucket. |

---

## 4. Deep-Dive Implementation & Code Snippets

### 4.1 Authentication Middleware (JWT & Bcrypt)
Authentication is stateless. When a user submits credentials, the server hashes the input using `bcrypt` and compares it. If successful, `jsonwebtoken` signs the UUID.
```typescript
const isMatched = await bcrypt.compare(password, user.password);
if (!isMatched) return res.status(401).json({ error: 'Incorrect password.' });

const token = jwt.sign(
    { userId: user.id, username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: '30d' }
);
```

### 4.2 Relational File System Navigation
Instead of generating physical files on a hard drive (which violates stateless server execution), CitruSaaS processes files dynamically using Prisma. When the user requests a directory list, the backend parses the flat database structure to determine virtual directories:
```typescript
allItems.forEach(item => {
    if (item.path.startsWith(normalizedDirPath) && item.path !== parentPath) {
        const subPath = item.path.slice(normalizedDirPath.length);
        const pathParts = subPath.split('/');
        const name = pathParts[0]!;
        
        // Detect if child nodes exist indicating 'name' is a directory
        const isDirectory = pathParts.length > 1 || item.type === FileType.FOLDER;
        files.push({ name, type: isDirectory ? 'directory' : 'file', path: normalizedDirPath + name });
    }
});
```

### 4.3 Template Fetch & Upsert (Module Generator)
When importing a template (like JWT Config), the server queries the Supabase Bucket. It relies on Prisma's `upsert` mechanism to either create a new file or forcefully overwrite a user's file.
```typescript
let templateContent = await templateService.getBaseTemplateContent(sourceName);

await prisma.file.upsert({
    where: { id: `${projectId}-${targetPath}` },
    create: {
        id: `${projectId}-${targetPath}`,
        name: sourceName,
        path: targetPath,
        type: FileType.FILE,
        content: templateContent,
        projectId: projectId,
    },
    update: { content: templateContent } // Injects payload into active workspace
});
```

---

## 5. Extensive Testing Logs

### 5.1 Black Box Testing (Functional Testing)
| Test ID | Description | Prerequisites | Test Steps | Expected Output | Status |
|---|---|---|---|---|---|
| BB-01 | Invalid User Login | DB Contains user 'X' | Post logic to `/api/users/login` with wrong password. | 401 Unauthorized, "Incorrect password." | PASS |
| BB-02 | File Path Collision | Project ID created | Send `POST /api/files/create` passing existing `path`. | 400 Bad Request, "File already exists." | PASS |
| BB-03 | Premium Gate | User.isPremium = false | Trigger Dodo payment checkout endpoint. | Subscription Overlay is returned/displayed. | PASS |
| BB-04 | Project Download | Non-empty workspace | Trigger `/api/files/downloadZip`. | Browser downloads an `.zip` file of proper byte size. | PASS |

### 5.2 White Box Testing (Structural/Component Testing)
| Test ID | Description | Component | Input Scenario | Expected Internal Flow | Status |
|---|---|---|---|---|---|
| WB-01 | JWT Secret Parsing | Auth Middleware | Request header contains valid `Bearer <token>`. | `jwt.verify()` successful; `req.user` populated; pass to `next()`. | PASS |
| WB-02 | DB Recursive Search | FileController | Execute `deleteItem` with folder path. | Prisma executes wildcard `OR {path: startsWith}` removing all children. | PASS |
| WB-03 | Template Fetch | TemplateService | Request unavailable `mongodb_initial` template. | Catches 404 block, throws console Error safely without crashing server. | PASS |

---

## 6. User Manual & Screenshots (Draft Outline)

*(In LaTeX, you will wrap these sections in `\begin{figure}` blocks with your application screenshots)*

### 6.1 Securing an Account
1. **Navigate to the Platform**: Go to `localhost:5173`.
2. **Action**: Click "Get Started". Enter username, proper email syntax, and a secure password.
3. *[Insert Screenshot: authentication_modal.png]*

### 6.2 Managing the Workspace Dashboard
1. **Dashboard Interface**: Displays grid cards containing all created active projects.
2. **Accessing Premium Features**: If "Upgrade to Premium" is clicked, the app invokes the `Dodo Payments` checkout overlay.
3. *[Insert Screenshot: dodo_payment_overlay.png]*

### 6.3 Using the Developer IDE
1. **File Tree**: Use the left-side navigation to create `src/routes/api.ts`.
2. **Code Implementation**: The central view hosts CodeMirror. Type code and wait 500ms; observe the subtle green "Saved" toast notification at the bottom right.
3. **Module Injection**: In the right properties pane, select "Boilerplates". Click `JWT Auth Module`. The system immediately copies `JwtAuth_TS.ts` to your file tree. 
4. *[Insert Screenshot: ide_workspace_full.png]*
5. *[Insert Screenshot: boilerplate_success_toast.png]*
