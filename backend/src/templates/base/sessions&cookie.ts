// ════════════════════════════════════════════════════════════
// SESSIONS & COOKIES MODULE — TypeScript
// File: session.ts
// ════════════════════════════════════════════════════════════

// ─── 1. INSTALL ──────────────────────────────────────────────
// npm install express-session cookie-parser
// npm install -D @types/express-session @types/cookie-parser

// ─── 2. ENV VARIABLES (.env) ─────────────────────────────────
// SESSION_SECRET=your-session-secret

// ─── 3. IMPORTS ─────────────────────────────────────────────
import { Request, Response, NextFunction, Router } from "express";
import session from "express-session";
import cookieParser from "cookie-parser";

// ─── 4. CONFIGURATION ────────────────────────────────────────
const SESSION_SECRET = process.env.SESSION_SECRET || "your-secret-key";

// ─── 5. SESSION MIDDLEWARE SETUP ────────────────────────────
export const sessionMiddleware = session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set true in production (HTTPS)
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
});

// ─── 6. COOKIE PARSER ───────────────────────────────────────
export const cookieMiddleware = cookieParser();

// ─── 7. TYPES EXTENSION ─────────────────────────────────────
declare module "express-session" {
  interface SessionData {
    user?: {
      id: string;
      username: string;
    };
  }
}

// ─── 8. AUTH CONTROLLERS (SESSION BASED) ────────────────────
export const loginSession = (req: Request, res: Response) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username required" });
  }

  // Normally validate user from DB
  req.session.user = {
    id: "demo-id",
    username
  };

  res.json({ message: "Session created", user: req.session.user });
};

export const getSessionUser = (req: Request, res: Response) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  }

  res.json({ user: req.session.user });
};

export const logoutSession = (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out" });
  });
};

// ─── 9. ROUTER ───────────────────────────────────────────────
export const sessionRouter = Router();

sessionRouter.post("/login", loginSession);
sessionRouter.get("/me", getSessionUser);
sessionRouter.post("/logout", logoutSession);

// ─── 10. APP INTEGRATION (app.ts) ───────────────────────────
// import express from "express";
// import { sessionMiddleware, cookieMiddleware, sessionRouter } from "./session";
//
// const app = express();
//
// app.use(express.json());
// app.use(cookieMiddleware);
// app.use(sessionMiddleware);
//
// app.use("/api/session", sessionRouter);
//
// app.listen(3000);