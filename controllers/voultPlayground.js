const { PASSWORD_REQUIREMENTS_MESSAGE } = require('voult-sdk');

module.exports.hub = (req, res) => {
  res.render('voult/index', {
    title: 'Voult SDK playground',
    sessionUser: req.session.voult?.user || null,
  });
};

module.exports.signupEmailForm = (req, res) => {
  res.render('voult/signup-email', {
    title: 'Sign up (email)',
    passwordHint: PASSWORD_REQUIREMENTS_MESSAGE,
  });
};

module.exports.signupUsernameForm = (req, res) => {
  res.render('voult/signup-username', {
    title: 'Sign up (username)',
    passwordHint: PASSWORD_REQUIREMENTS_MESSAGE,
  });
};

module.exports.signinEmailForm = (req, res) => {
  res.render('voult/signin-email', { title: 'Sign in (email)' });
};

module.exports.signinUsernameForm = (req, res) => {
  res.render('voult/signin-username', { title: 'Sign in (username)' });
};

module.exports.signinMagicForm = (req, res) => {
  const base = require('../utils/appBaseUrl').getAppBaseUrl(req);
  res.render('voult/signin-magic', {
    title: 'Magic link sign-in',
    suggestedRedirectUri: `${base}/voult/magic-callback`,
  });
};
