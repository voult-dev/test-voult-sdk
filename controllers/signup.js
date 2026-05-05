const client = require('../config/client');
const { signUpWithEmailAndPassword, signUpWithUsernameAndPassword } = require('voult-sdk');
const { persistVoultAuth } = require('../utils/voultSession');
const catchAsync = require('../utils/catchAsync');

function wantsBrowserRedirect(req) {
  return req.body && String(req.body._redirect) === '1';
}

module.exports.signupWithEmailAndPassword = catchAsync(async (req, res) => {
  const { email, password, fullName, username } = req.body;
  const options = {};
  if (fullName) options.fullName = fullName;
  if (username) options.username = username;

  const result = await signUpWithEmailAndPassword(email, password, options, client);
  persistVoultAuth(req, result);
  if (wantsBrowserRedirect(req)) {
    req.flash(
      'success',
      result.message || 'Registered. Check email for verification if required.',
    );
    return res.redirect('/voult/account');
  }
  res.json({
    message: result.message,
    user: result.user,
    token: result.token,
  });
});

module.exports.signupWithUsernameAndPassword = catchAsync(async (req, res) => {
  const { username, password, fullName, email } = req.body;
  const options = {};
  if (fullName) options.fullName = fullName;
  if (email) options.email = email;

  const result = await signUpWithUsernameAndPassword(
    username,
    password,
    options,
    client,
  );
  persistVoultAuth(req, result);
  if (wantsBrowserRedirect(req)) {
    req.flash(
      'success',
      result.message || 'Registered with username. You can sign in or open your account below.',
    );
    return res.redirect('/voult/account');
  }
  res.json({
    message: result.message,
    user: result.user,
    token: result.token,
  });
});
