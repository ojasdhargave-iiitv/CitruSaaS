# CitruSaaS Documentation Context

Here is the detailed context for each subtopic to provide to ChatGPT so it can generate the full documentation based on the outline provided in the image.

*Note: For Section 4 (Implementation Details), the names from the image were tailored to a completely different project (e.g. Skill Management, Scores, etc.). I have adapted Section 4 to match the actual modules in this specific software project (CitruSaaS), while keeping the required numbering format identical.*

---

## 1 Introduction

### 1.1 Project Overview
**Context to provide**: CitruSaaS is a cloud-based Integrated Development Environment (IDE) and project scaffolding platform tailored for modern web development. It allows users to manage multiple software workspaces completely from the browser, offering a dynamic file explorer, built-in code editor, and the ability to inject full-featured backend boilerplates dynamically (like JWT Authentication, PostgreSQL setups, Dodo Payment Checkouts) straight into an active workspace using a manifest-driven module generator.

### 1.2 Purpose of the Project
**Context to provide**: The purpose of CitruSaaS is to streamline the initial stages of web development by drastically reducing repetitive setup and boilerplate configurations. It provides developers a sandboxed, centralized location to not just write code, but automatically plug deeply integrated architecture patterns into a project in seconds.

### 1.3 Scope of the Project
**Context to provide**: Includes secure User Registration and Authentication, intuitive Workspace/Project creation, a fully functional File Manager handling directories/files, real-time code editing with browser sync, premium user tier management via Dodo Payments integration, and backend orchestration utilizing PostgreSQL for persistent file & folder mapping alongside Supabase storage.

### 1.4 Problem Statement and Issues
**Context to provide**: Developers often spend hours setting up authentication flows, payment gateway connections, and initial boilerplate folder structures when starting a new project. Conventional IDEs exist locally and lack the ability to instantly generate complete, working modular frameworks (e.g., merging stripe handlers with auth logic automatically in real-time). The project solves this by abstracting the file system and module generation onto a web platform.

---

## 2 Requirements Analysis

### 2.1 Functional Requirements
**Context to provide**:
- User registration and login utilizing Bcrypt and JWT authentication.
- Premium access restriction on specific developer frameworks, forcing a Dodo Payments checkout overlay.
- CRUD functionality for workspaces, files, and folders across projects.
- Module generator that pulls from a central "Template Storage" (e.g., Supabase Postgres templates) and injects files, routes, and dependencies based on a `manifest.json`.
- A synced browser-based code workspace.

### 2.2 Non-Functional Requirements
**Context to provide**:
- **Framework and Speed:** The front-end leverages React 19 + TypeScript with Vite for ultra-fast Hot Module Replacements. 
- **Security:** Strict separation of user UUIDs ensuring projects are siloed.
- **Scalability:** Built on Node.js / Express 5 with Prisma ORM mapping to a Postgres DB, allowing highly concurrent request handling.
- **UI/UX:** Must rely on TailwindCSS + Shadcn UI for premium, professional aesthetic mapping.

---

## 3 Design and Architecture

### 3.1 System Overview
**Context to provide**: Client-server architecture communicating via Axios/REST APIs. The React frontend interacts with an Express TSX backend, which in turn orchestrates data persistence across a PostgreSQL Database (via Prisma) and interacts with a module generation engine utilizing `fs-extra` and templates stored in Supabase.

### 3.2 Use Case Diagram
**Context to provide**: 
**Actors**: User, Admin, Payment Gateway (Dodo Payments)
**Use Cases**:
- User logs in -> Creates a project -> Selects a framework.
- User tries to select Premium framework -> Trigger Subscription Overlay -> Dodo Checkout redirect.
- User opens Project -> Uses File Explorer to add "routes.ts" -> System syncs to PostgreSQL.
- User invokes "Add Module" -> Backend parses `manifest.json` -> Merges template code into User's active Workspace folder.

### 3.3 Entity Relationship (ER) Diagram
**Context to provide**: (Based on the Prisma Schema)
- **User**: (`id` UUID, `email`, `username`, `password`, `isPremium` boolean).
- **Project**: (`id` UUID, `name`, `framework`, `userId` FK). A User has many Projects.
- **File**: (`id` UUID, `name`, `path`, `type` enum(FILE/FOLDER), `content`, `projectId` FK, `parentId` self-referential FK). A Project has many Files.
- **Template**: (`id` UUID, `name`, `type`, `path` in storage).

### 3.4 Activity Diagram
**Context to provide**: The flow of injecting a module: 
1. Request received from frontend.
2. Backend queries Template table.
3. Node server accesses Supabase Storage to retrieve module payload.
4. Backend merges folders, modifies paths for target project, and updates corresponding entries in the Postgres `File` schema.
5. Returns success to Frontend.

### 3.5 Data Flow Diagram (DFD)
**Context to provide**: 
- Level 0: User input -> UI -> API Controller -> Prisma -> PostgreSQL Database.
- Level 1 (Code Editing): User types in Code Editor -> 500ms debounce save -> `POST /api/files/update` -> `fileController.ts` processes update -> Updates `content` column in `files` table.

### 3.6 Class Diagram
**Context to provide**: The architecture utilizes a Controller-Service-Route structure in Express, rather than strict OOP classes. 
- Controllers: `userController`, `fileController`, `dodoPaymentController`.
- Middleware: JWT authentication filters, Zod Validation middlewares (`userSchema`, `projectSchema`).

### 3.7 Soft Goal Interdependency Graph
**Context to provide**: 
- **Security** impacts **Performance** (Bcrypt processing and JWT handshakes add overhead but are necessary).
- **Usability** (browser IDE responsiveness) requires **Complex Backend Syncing** (efficient debounce and file tree recursive retrieval algorithms).

### 3.8 User Interface Design
**Context to provide**: The UI is split into two massive components:
- The **Dashboard/Home**: A sleek Shadcn UI grid showing projects, subscription status, and a premium framework gateway overlay.
- The **Workspace Environment**: A 3-pane layout featuring a Sidebar (File Explorer tree, similar to VS Code), Center Pane (Code Mirror / Text Editor), and Right Pane (Module selection & deployment buttons).

---

## 4 Implementation Details

*(Note: The provided TOC image had specific sections unrelated to CitruSaaS. I have mapped the numbering to the core pillars of CitruSaaS).*

### 4.1 User Authentication
**Context to provide**: Implemented in `backend/src/controllers/userController.ts` using Express. The registration route leverages Bcrypt to hash user passwords before storing in PostgreSQL. Logins generate a signed JsonWebToken (JWT) which is returned to the React frontend and validated on all subsequent requests using an Express middleware guard.

### 4.2 Project & Workspace Management 
**Context to provide**: Implemented using Prisma relations. When a user requests to create a framework project, the Node server extracts a "base" template from Supabase Storage, unpacks it into memory, and inserts corresponding rows recursively into the `File` table (simulating a nested directory structure via `parentId`).

### 4.3 Dynamic File Explorer and Code Editor 
**Context to provide**: The File Explorer is a recursive React component that parses the flat relational `File` array returned by the API and forms a visual tree. The Code Editor is integrated, likely utilizing Monaco or CodeMirror, allowing users to make edits. Saving triggers the Axios client to PUT the payload back to the Node backend where the specific file content string is updated.

### 4.4 Manifest-Driven Module Generator 
**Context to provide**: The hallmark feature. The backend uses `fs-extra` to take pre-written architectures (like a fully configured Stripe integration). Every module has a `manifest.json` describing dependencies, required routes, and files to copy. A recursive function reads this manifest and forcefully merges the new files into the active project’s simulated codebase in Postgres.

### 4.5 Payments and Access Restrictions (Dodo Payments) 
**Context to provide**: Uses the `@dodopayments/express` SDK. If a `User.isPremium` is false, selecting certain high-tier scaffolding templates is blocked. A Modal pops up invoking an API call to `/api/dodo/checkout`. On success, a webhook or redirect updates the `isPremium` Postgres database field, enabling full access.

---

## 5 Testing and Deployment

### 5.1 Black Box Testing
**Context to provide**: Functional testing of endpoints via tools like Postman. Ensuring that invalid JWT tokens reject file access, preventing users from traversing another person's directory, and validating that invalid Dodo Payment payloads are thrown back as 400 Bad Request.

### 5.2 White Box Testing
**Context to provide**: Unit testing of the core File tree recursive algorithms (testing how accurately flat database rows assemble into a `parentId` tree graph in memory). Type-safety enforcement via extensive TypeScript compilation and Zod object-schema validation loops.

### 5.3 Deployment Summary
**Context to provide**: 
- **Database/Storage**: Handled via Supabase (PostgreSQL hosting and remote Template Storage).
- **Frontend/Backend Build**: The Backend Express APIs and Frontend React bundle are optimized using `Vite` & `tsx` for production execution. Execution scripts inside `package.json` bypass PRISMA generation bottlenecks by ensuring `npx prisma generate` runs sequentially before webserver bootup.

---

## 6 Conclusion and Future Work

### 6.1 Conclusion
**Context to provide**: The CitruSaaS platform successfully bridges the gap between manual local development and sophisticated, cloud-automated scaffolding. By providing a secure, robust browser-IDE backed by a powerful Prisma/Postgres database and dynamic module generator, it modernizes the developer kickoff phase.

### 6.2 Future Work
**Context to provide**: 
- Implementing a real-time web socket terminal (Web Terminal) to execute commands securely inside a Docker container.
- Expanding the templating engine to support additional frameworks like Next.js, Nuxt, and Python Django.
- Introducing collaborative editing (like Google Docs) where multiple users can code in the same workspace concurrently.
