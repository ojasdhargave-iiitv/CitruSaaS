// ════════════════════════════════════════════════════════════
// GOOGLE OAUTH 2.0 MODULE — JavaScript
// File: google-oauth.js
// ════════════════════════════════════════════════════════════

// ─── 1. INSTALL ──────────────────────────────────────────────
// npm install passport passport-google-oauth20 express-session

// ─── 2. ENV VARIABLES (.env) ─────────────────────────────────
// GOOGLE_CLIENT_ID=your-client-id
// GOOGLE_CLIENT_SECRET=your-client-secret
// GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

// ─── 3. IMPORTS ─────────────────────────────────────────────
const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// ─── 4. DB HELPER ───────────────────────────────────────────
async function findOrCreateUser(profile) {
  return {
    id: profile.id,
    email: profile.emails[0].value,
    name: profile.displayName
  };
}

// ─── 5. PASSPORT CONFIG ─────────────────────────────────────
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const user = await findOrCreateUser(profile);
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

// ─── 6. SESSION SERIALIZATION ───────────────────────────────
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// ─── 7. ROUTER ───────────────────────────────────────────────
const googleAuthRouter = express.Router();

googleAuthRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

googleAuthRouter.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.json({
      message: "Google login successful",
      user: req.user
    });
  }
);

// ─── 8. APP INTEGRATION ─────────────────────────────────────
// const express = require("express");
// const session = require("express-session");
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

// ─── EXPORTS ────────────────────────────────────────────────
module.exports = { googleAuthRouter };