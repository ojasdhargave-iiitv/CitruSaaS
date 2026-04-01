const express = require('express');
const axios = require('axios');

// ─── CONFIGURATION ──────────────────────────────────────────
// Set provider values via environment variables.
// Defaults are for GitHub OAuth.
const OAUTH_AUTHORIZE_URL =
  process.env.OAUTH_AUTHORIZE_URL || 'https://github.com/login/oauth/authorize';
const OAUTH_TOKEN_URL =
  process.env.OAUTH_TOKEN_URL || 'https://github.com/login/oauth/access_token';
const OAUTH_USER_URL =
  process.env.OAUTH_USER_URL || 'https://api.github.com/user';

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const OAUTH_SCOPE = process.env.OAUTH_SCOPE || 'user';

const router = express.Router();

// ─── OAUTH LOGIN REDIRECT ───────────────────────────────────
router.get('/login', (req, res) => {
  if (!CLIENT_ID || !REDIRECT_URI) {
    return res.status(500).json({
      error: 'Missing CLIENT_ID or REDIRECT_URI environment variables.'
    });
  }

  const authUrl =
    `${OAUTH_AUTHORIZE_URL}?` +
    new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: OAUTH_SCOPE
    }).toString();

  res.redirect(authUrl);
});

// ─── OAUTH CALLBACK ──────────────────────────────────────────
router.get('/callback', async (req, res) => {
  try {
    if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
      return res.status(500).json({
        error: 'Missing CLIENT_ID, CLIENT_SECRET, or REDIRECT_URI environment variables.'
      });
    }

    const code = req.query.code;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Missing OAuth code in callback.' });
    }

    const tokenResponse = await axios.post(
      OAUTH_TOKEN_URL,
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI
      },
      {
        headers: { Accept: 'application/json' }
      }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      return res.status(400).json({ error: 'Failed to retrieve access token.' });
    }

    const userResponse = await axios.get(OAUTH_USER_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    });

    // TODO: link or create local user, then issue your own JWT/session.
    res.status(200).json({
      message: 'OAuth login successful',
      providerUser: userResponse.data,
      accessToken
    });
  } catch (err) {
    console.error('[OAuth Callback Error]', err);
    res.status(500).json({ error: 'OAuth callback failed. Please try again.' });
  }
});

module.exports = router;
