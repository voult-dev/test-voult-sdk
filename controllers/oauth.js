const client = require('../config/client');
const {
  signInWithGoogle,
  signUpWithGoogle,
  signInWithGitHub,
  signUpWithGitHub,
  signInWithFacebook,
  signUpWithFacebook,
  signInWithLinkedIn,
  signUpWithLinkedIn,
  signInWithMicrosoft,
  signUpWithMicrosoft,
  signInWithApple,
  signUpWithApple,
  verifyEmail,
  resetPassword,
} = require('voult-sdk');
const { persistVoultAuth } = require('../utils/voultSession');
const { getAppBaseUrl } = require('../utils/appBaseUrl');
const catchAsync = require('../utils/catchAsync');

function wantsBrowserRedirect(req) {
  return req.body && String(req.body._redirect) === '1';
}

module.exports.oauthPage = (req, res) => {
  res.render('voult/oauth', {
    title: 'OAuth Sign in / Sign up',
    passwordHint: 'Use your preferred OAuth provider to sign in or create an account.',
  });
};

const OAUTH_HANDLERS = {
  google: { login: signInWithGoogle, register: signUpWithGoogle },
  github: { login: signInWithGitHub, register: signUpWithGitHub },
  facebook: { login: signInWithFacebook, register: signUpWithFacebook },
  linkedin: { login: signInWithLinkedIn, register: signUpWithLinkedIn },
  microsoft: { login: signInWithMicrosoft, register: signUpWithMicrosoft },
  apple: { login: signInWithApple, register: signUpWithApple },
};

['google', 'github', 'facebook', 'linkedin', 'microsoft', 'apple'].forEach((provider) => {
  module.exports[`${provider}Login`] = catchAsync(async (req, res) => {
    const { idToken, accessToken, code, redirectUri, idToken: appleIdToken } = req.body;
    const credentials = { idToken, accessToken, code, redirectUri };
    if (provider === 'apple') {
      credentials.idToken = appleIdToken || idToken;
    }
    const result = await OAUTH_HANDLERS[provider].login(credentials, client);
    persistVoultAuth(req, result);
    if (wantsBrowserRedirect(req)) {
      req.flash('success', result.message || `Signed in with ${provider}.`);
      return res.redirect('/voult/account');
    }
    res.json({ ...result, provider });
  });

  module.exports[`${provider}Register`] = catchAsync(async (req, res) => {
    const { idToken, accessToken, code, redirectUri, idToken: appleIdToken, fullName, email } = req.body;
    const credentials = { idToken, accessToken, code, redirectUri };
    if (provider === 'apple') {
      credentials.idToken = appleIdToken || idToken;
      credentials.fullName = fullName;
      credentials.email = email;
    }
    const options = {};
    if (fullName) options.fullName = fullName;
    if (email) options.email = email;
    const result = await OAUTH_HANDLERS[provider].register(credentials, client);
    persistVoultAuth(req, result);
    if (wantsBrowserRedirect(req)) {
      req.flash('success', result.message || `Registered with ${provider}.`);
      return res.redirect('/voult/account');
    }
    res.json({ ...result, provider });
  });
});

module.exports.verifyEmailPage = (req, res) => {
  const { token, appId } = req.query;
  res.render('voult/verify-email', {
    title: 'Verify Email',
    token: token || '',
    appId: appId || '',
    appBaseUrl: getAppBaseUrl(req),
  });
};

module.exports.verifyEmail = catchAsync(async (req, res) => {
  const { token, appId } = req.body;
  const result = await verifyEmail(token, { appId }, client);
  if (wantsBrowserRedirect(req)) {
    req.flash('success', result.message || 'Email verified.');
    return res.redirect('/voult/account');
  }
  res.json(result);
});

module.exports.resetPasswordPage = (req, res) => {
  res.render('voult/reset-password', {
    title: 'Reset Password',
    appBaseUrl: getAppBaseUrl(req),
  });
};

module.exports.resetPassword = catchAsync(async (req, res) => {
  const { token, password, appId } = req.body;
  const result = await resetPassword(token, password, { appId }, client);
  if (wantsBrowserRedirect(req)) {
    req.flash('success', result.message || 'Password reset.');
    return res.redirect('/voult/signin/email');
  }
  res.json(result);
});
