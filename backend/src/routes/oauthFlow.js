import { Router } from 'express';
import crypto from 'crypto';
import client from '../config/client.js';
import catchAsync from '../utils/catchAsync.js';
import { persistVoultAuth, persistMfaPending } from '../utils/voultSession.js';
import {
  signInWithGoogle,
  signUpWithGoogle,
  signInWithGitHub,
  signUpWithGitHub,
} from 'voult-sdk';

const router = Router();

function getFrontendUrl() {
  return (process.env.APP_BASE_URL || 'http://localhost:5173').replace(/\/$/, '');
}

function getBackendUrl(req) {
  if (process.env.OAUTH_REDIRECT_BASE_URL) {
    return process.env.OAUTH_REDIRECT_BASE_URL.replace(/\/$/, '');
  }
  return `${req.protocol}://${req.get('host')}`;
}

function getRedirectUri(req, provider) {
  if (process.env.OAUTH_REDIRECT_URI) {
    return process.env.OAUTH_REDIRECT_URI;
  }
  return `${getBackendUrl(req)}/oauth/callback/${provider}`;
}

function oauthConfig(provider) {
  const upper = provider.toUpperCase();
  return {
    clientId: process.env[`${upper}_CLIENT_ID`],
    clientSecret: process.env[`${upper}_CLIENT_SECRET`],
  };
}

function isConfigured(provider) {
  const { clientId, clientSecret } = oauthConfig(provider);
  return Boolean(clientId && clientSecret);
}

function buildGoogleAuthUrl(req, state) {
  const { clientId } = oauthConfig('google');
  const redirectUri = getRedirectUri(req, 'google');
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    prompt: 'select_account',
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

function buildGitHubAuthUrl(req, state) {
  const { clientId } = oauthConfig('github');
  const redirectUri = getRedirectUri(req, 'github');
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'read:user user:email',
    state,
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

async function exchangeGoogleCode(req, code) {
  const { clientId, clientSecret } = oauthConfig('google');
  const redirectUri = getRedirectUri(req, 'google');

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error_description || data.error || 'Google token exchange failed');
  }

  if (!data.id_token) {
    throw new Error('Google did not return an id_token. Ensure openid scope is enabled.');
  }

  return { idToken: data.id_token, accessToken: data.access_token };
}

function redirectWithError(res, message) {
  const url = new URL('/oauth', getFrontendUrl());
  url.searchParams.set('error', message);
  return res.redirect(url.toString());
}

function redirectWithMfa(res) {
  return res.redirect(`${getFrontendUrl()}/mfa`);
}

function redirectSuccess(res) {
  return res.redirect(`${getFrontendUrl()}/account`);
}

router.get(
  '/google/start',
  catchAsync(async (req, res) => {
    if (!isConfigured('google')) {
      return res.status(400).json({
        error: {
          code: 'OAUTH_NOT_CONFIGURED',
          message: 'Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env',
          status: 400,
        },
      });
    }

    const intent = req.query.intent === 'register' ? 'register' : 'login';
    const state = crypto.randomBytes(24).toString('hex');

    req.session.oauth = {
      provider: 'google',
      intent,
      state,
      redirectUri: getRedirectUri(req, 'google'),
    };

    req.session.save((err) => {
      if (err) {
        return res.status(500).json({
          error: { code: 'SESSION_ERROR', message: 'Could not start OAuth flow', status: 500 },
        });
      }
      return res.redirect(buildGoogleAuthUrl(req, state));
    });
  }),
);

router.get(
  '/github/start',
  catchAsync(async (req, res) => {
    if (!isConfigured('github')) {
      return res.status(400).json({
        error: {
          code: 'OAUTH_NOT_CONFIGURED',
          message: 'Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in backend/.env',
          status: 400,
        },
      });
    }

    const intent = req.query.intent === 'register' ? 'register' : 'login';
    const state = crypto.randomBytes(24).toString('hex');

    req.session.oauth = {
      provider: 'github',
      intent,
      state,
      redirectUri: getRedirectUri(req, 'github'),
    };

    req.session.save((err) => {
      if (err) {
        return res.status(500).json({
          error: { code: 'SESSION_ERROR', message: 'Could not start OAuth flow', status: 500 },
        });
      }
      return res.redirect(buildGitHubAuthUrl(req, state));
    });
  }),
);

router.get(
  '/callback/:provider',
  catchAsync(async (req, res) => {
    const { provider } = req.params;
    const { code, state, error, error_description: errorDescription } = req.query;
    const oauthSession = req.session.oauth;

    if (error) {
      return redirectWithError(res, errorDescription || error);
    }

    if (!oauthSession || oauthSession.provider !== provider) {
      return redirectWithError(res, 'OAuth session expired. Please try again.');
    }

    if (!state || state !== oauthSession.state) {
      return redirectWithError(res, 'Invalid OAuth state.');
    }

    if (!code) {
      return redirectWithError(res, 'Missing authorization code.');
    }

    let result;

    if (provider === 'google') {
      const credentials = await exchangeGoogleCode(req, code);
      result =
        oauthSession.intent === 'register'
          ? await signUpWithGoogle(credentials, client)
          : await signInWithGoogle(credentials, client);
    } else if (provider === 'github') {
      const credentials = {
        code,
        redirectUri: oauthSession.redirectUri,
      };
      result =
        oauthSession.intent === 'register'
          ? await signUpWithGitHub(credentials, client)
          : await signInWithGitHub(credentials, client);
    } else {
      return redirectWithError(res, `Unsupported provider: ${provider}`);
    }

    delete req.session.oauth;

    if (result?.mfaRequired) {
      persistMfaPending(req, result.mfaPendingToken);
      return redirectWithMfa(res);
    }

    persistVoultAuth(req, result);
    return redirectSuccess(res);
  }),
);

export default router;
