// ════════════════════════════════════════════════════════════
// SESSIONS & COOKIES MODULE — JavaScript
// File: session.js
// ════════════════════════════════════════════════════════════

// ─── 1. INSTALL ──────────────────────────────────────────────
// npm install express-session cookie-parser

// ─── 2. ENV VARIABLES (.env) ─────────────────────────────────
// SESSION_SECRET=your-session-secret

// ─── 3. IMPORTS ─────────────────────────────────────────────
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");

// ─── 4. CONFIGURATION ────────────────────────────────────────
const SESSION_SECRET = process.env.SESSION_SECRET || "your-secret-key";

// ─── 5. SESSION MIDDLEWARE ──────────────────────────────────
const sessionMiddleware = session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24
  }
});

// ─── 6. COOKIE PARSER ───────────────────────────────────────
const cookieMiddleware = cookieParser();

// ─── 7. CONTROLLERS ─────────────────────────────────────────
const loginSession = (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username required" });
  }

  req.session.user = {
    id: "demo-id",
    username
  };

  res.json({ message: "Session created", user: req.session.user });
};

const getSessionUser = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  }

  res.json({ user: req.session.user });
};

const logoutSession = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out" });
  });
};

// ─── 8. ROUTER ───────────────────────────────────────────────
const sessionRouter = express.Router();

sessionRouter.post("/login", loginSession);
sessionRouter.get("/me", getSessionUser);
sessionRouter.post("/logout", logoutSession);

// ─── 9. APP INTEGRATION ─────────────────────────────────────
// const express = require("express");
// const { sessionMiddleware, cookieMiddleware, sessionRouter } = require("./session");
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

// ─── EXPORTS ────────────────────────────────────────────────
module.exports = {
  sessionMiddleware,
  cookieMiddleware,
  sessionRouter
};