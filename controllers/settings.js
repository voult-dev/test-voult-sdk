const client = require('../config/client');
const {
  updateProfile,
  reenableAccount,
  sendPasswordResetEmail,
  resetPassword,
  getLinkedOAuthProviders,
  linkOAuthProvider,
  unlinkOAuthProvider,
  setPassword,
  listSessions,
  revokeSession,
} = require('voult-sdk');
const { persistVoultAuth } = require('../utils/voultSession');
const { getAppBaseUrl } = require('../utils/appBaseUrl');
const catchAsync = require('../utils/catchAsync');

function wantsBrowserRedirect(req) {
  return req.body && String(req.body._redirect) === '1';
}

const SUPPORTED_PROVIDERS = ['google', 'github', 'facebook', 'linkedin', 'apple', 'microsoft'];

module.exports.settingsPage = catchAsync(async (req, res) => {
  let linkedProviders = [];
  try {
    const result = await getLinkedOAuthProviders(client);
    linkedProviders = result.providers || [];
  } catch (err) {
    linkedProviders = [];
  }

  let sessions = [];
  try {
    const result = await listSessions(client);
    sessions = result.sessions || [];
  } catch (err) {
    sessions = [];
  }

  const profile = client.getCurrentUser();
  res.render('voult/settings', {
    title: 'Account Settings',
    profile,
    providers: SUPPORTED_PROVIDERS,
    linkedProviders,
    sessions,
    appBaseUrl: getAppBaseUrl(req),
  });
});

module.exports.updateProfile = catchAsync(async (req, res) => {
  const { fullName } = req.body;
  const result = await updateProfile({ fullName }, client);
  if (wantsBrowserRedirect(req)) {
    req.flash('success', result.message || 'Profile updated.');
    return res.redirect('/voult/settings');
  }
  res.json(result);
});

module.exports.forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await sendPasswordResetEmail(email, client);
  if (wantsBrowserRedirect(req)) {
    req.flash('info', result.message);
    return res.redirect('/voult/settings');
  }
  res.json(result);
});

module.exports.resetPassword = catchAsync(async (req, res) => {
  const { token, password, appId } = req.body;
  const options = { appId };
  const result = await resetPassword(token, password, options, client);
  if (wantsBrowserRedirect(req)) {
    req.flash('success', result.message);
    return res.redirect('/voult/settings');
  }
  res.json(result);
});

module.exports.setPassword = catchAsync(async (req, res) => {
  const { password } = req.body;
  const result = await setPassword(password, client);
  if (wantsBrowserRedirect(req)) {
    req.flash('success', result.message || 'Password set successfully.');
    return res.redirect('/voult/settings');
  }
  res.json(result);
});

module.exports.revokeSession = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  const result = await revokeSession(sessionId, client);
  if (wantsBrowserRedirect(req)) {
    req.flash('success', result.message || 'Session revoked.');
    return res.redirect('/voult/settings');
  }
  res.json(result);
});

module.exports.linkOAuth = catchAsync(async (req, res) => {
  const { provider } = req.params;
  const result = await linkOAuthProvider(provider, client);
  if (wantsBrowserRedirect(req)) {
    if (result.redirectUrl) {
      return res.redirect(result.redirectUrl);
    }
    req.flash('success', 'OAuth provider approval initiated.');
    return res.redirect('/voult/settings');
  }
  res.json(result);
});

module.exports.unlinkOAuth = catchAsync(async (req, res) => {
  const { provider } = req.params;
  const result = await unlinkOAuthProvider(provider, client);
  if (wantsBrowserRedirect(req)) {
    req.flash('success', 'OAuth provider unlinked.');
    return res.redirect('/voult/settings');
  }
  res.json(result);
});

module.exports.reenableAccount = catchAsync(async (req, res) => {
  const result = await reenableAccount(client);
  if (wantsBrowserRedirect(req)) {
    req.flash('success', result.message);
    return res.redirect('/');
  }
  res.json(result);
});
