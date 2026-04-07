// ════════════════════════════════════════════════════════════
// GOOGLE OAUTH 2.0 MODULE — TypeScript
// File: google-oauth.ts
// ════════════════════════════════════════════════════════════

// ─── 1. INSTALL ──────────────────────────────────────────────
// npm install passport passport-google-oauth20 express-session
// npm install -D @types/passport @types/express-session

// ─── 2. ENV VARIABLES (.env) ─────────────────────────────────
// GOOGLE_CLIENT_ID=your-client-id
// GOOGLE_CLIENT_SECRET=your-client-secret
// GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

// ─── 3. IMPORTS ─────────────────────────────────────────────
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Request, Response, Router } from "express";

// ─── 4. USER TYPE ────────────────────────────────────────────
export interface GoogleUser {
  id: string;
  email: string;
  name: string;
}

// ─── 5. DB HELPERS (REPLACE WITH YOUR DB) ────────────────────
async function findOrCreateUser(profile: any): Promise<GoogleUser> {
  // TODO: replace with DB logic
  return {
    id: profile.id,
    email: profile.emails[0].value,
    name: profile.displayName
  };
}

// ─── 6. PASSPORT CONFIG ─────────────────────────────────────
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const user = await findOrCreateUser(profile);
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// ─── 7. SESSION SERIALIZATION ───────────────────────────────
passport.serializeUser((user: any, done) => done(null, user));
passport.deserializeUser((user: any, done) => done(null, user));

// ─── 8. ROUTES ──────────────────────────────────────────────
export const googleAuthRouter = Router();

// Step 1: Redirect to Google
googleAuthRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Step 2: Callback
googleAuthRouter.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req: Request, res: Response) => {
    // You can issue JWT here OR rely on session
    res.json({
      message: "Google login successful",
      user: req.user
    });
  }
);

// ─── 9. APP INTEGRATION (app.ts) ─────────────────────────────
// import express from "express";
// import session from "express-session";
// import passport from "passport";
// import { googleAuthRouter } from "./google-oauth";
//
// const app = express();
//
// app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));
// app.use(passport.initialize());
// app.use(passport.session());
//
// app.use("/api/auth", googleAuthRouter);
//
// app.listen(3000);