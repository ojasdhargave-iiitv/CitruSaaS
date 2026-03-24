# CitruSaaS

Welcome to **CitruSaaS**, a dynamic web application designed to help developers create, manage, and explore project workspaces effortlessly. CitruSaaS provides a user-friendly interface to manage multiple software projects, execute code, navigate through a built-in file explorer, and quickly inject full-featured modules (like JWT authentication) straight into your source code.

## 🚀 Features

- **Project Management**: Create, load, edit, and delete projects seamlessly. Projects are persisted in an online database, allowing you to access them anytime.
- **Dynamic File Explorer**: Navigate your project's directory structure intuitively. Create and manage files and folders with ease.
- **Code Editor Integration**: Write and manage your code directly in the browser.
- **Module Generator**: Instantly add boilerplate frameworks and modules (like JWT authentication) into your standard `src` directory to kickstart your development.
- **Automated Templates**: Ensure templates are cleanly copied with their respective names and complete code blocks.
- **Database Persistence**: Your project state, files, and folders are safely stored and synced with a PostgreSQL-backed database.

## 🛠️ Tech Stack

### Frontend
- **React 19** with **Vite** for lightning-fast module replacement and building.
- **TypeScript** for robust typing.
- **TailwindCSS** + **Shadcn UI** for beautiful, responsive, and dynamic user interfaces.
- **Axios** for API requests.

### Backend
- **Node.js** with **Express** as the primary web framework.
- **TypeScript** + **tsx** for modern backend execution.
- **Prisma ORM** for elegant database interactions.
- **PostgreSQL** database (integrated with **Supabase**).
- **Zod** for schema validation.
- **Bcrypt** and **JsonWebToken** for security and authentication.
- **Archiver** and **fs-extra** for robust file and compression handling.

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A running instance of PostgreSQL (or a Supabase project)

### Installation

1. **Clone the repository** (if applicable):
   ```bash
   git clone https://github.com/ojasdhargave-iiitv/CitruSaaS.git
   cd CitruSaaS
   ```

2. **Install Backend Dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Variables**:
   Set up your `.env` files in both `backend` and `frontend` directories based on the required keys for Prisma, Supabase, and JWT tokens.

5. **Run Database Migrations**:
   ```bash
   cd backend
   npx prisma migrate dev
   ```

### Running the Application Local Delivery

1. **Start the Backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. Navigate to `http://localhost:5173` in your browser.

## 🤝 Contributing

Contributions are welcome! Please read our [Code of Conduct](./CODE_OF_CONDUCT.md) first, and refer to our [Security Policy](./SECURITY.md) if you are reporting vulnerabilities.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
