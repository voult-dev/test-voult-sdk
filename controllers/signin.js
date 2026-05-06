const client = require('../config/client');
const {
  signInWithEmailAndPassword,
  signInWithUsernameAndPassword,
  signInWithEmailLink,
} = require('voult-sdk');

const { persistVoultAuth } = require('../utils/voultSession');
const { getAppBaseUrl } = require('../utils/appBaseUrl');
const catchAsync = require('../utils/catchAsync');

function wantsBrowserRedirect(req) {
  return req.body && String(req.body._redirect) === '1';
}

module.exports.signinUsernameForm = (req, res) => {
  res.render('signin/username', { title: 'Username SignIn' });
};

module.exports.signinWithEmailAndPassword = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await signInWithEmailAndPassword(email, password, client);
  console.log(result);
  persistVoultAuth(req, result);
  if (wantsBrowserRedirect(req)) {
    req.flash('success', result.message || 'Signed in with email and password.');
    return res.redirect('/voult/account');
  }

  req.user = result.user;

  res.json({
    message: result.message,
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
});

module.exports.signinWithUsernameAndPassword = catchAsync(async (req, res) => {
  const { username, password } = req.body;
  const result = await signInWithUsernameAndPassword(username, password, client);
  persistVoultAuth(req, result);
  if (wantsBrowserRedirect(req)) {
    req.flash('success', result.message || 'Signed in with username and password.');
    return res.redirect('/voult/account');
  }
  console.log({
    message: result.message || 'Sign in successful',
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
  req.user = result.user;
  res.redirect('/');
});

module.exports.signInWithEmailLink = catchAsync(async (req, res) => {
  const { email, redirectUri } = req.body;
  const uri =
    redirectUri && String(redirectUri).trim()
      ? redirectUri.trim()
      : `${getAppBaseUrl(req)}/voult/magic-callback`;

  await signInWithEmailLink(
    email,
    { redirectUri: uri },
    client,
  );

  if (wantsBrowserRedirect(req)) {
    req.flash(
      'info',
      'If the account exists, a magic link was sent. Open it to finish sign-in.',
    );
    return res.redirect('/voult/signin/magic');
  }

  res.json({
    message: 'Magic link sent successfully to your email',
    redirectUriUsed: uri,
  });
});
