const client = require('../config/client');
const { verifyEmailLink } = require('voult-sdk');
const { persistVoultAuth } = require('../utils/voultSession');
const catchAsync = require('../utils/catchAsync');

module.exports.verifyMagicLink = catchAsync(async (req, res) => {
  const token = req.query.token;
  if (!token) {
    req.flash('error', 'Missing token query parameter.');
    return res.redirect('/voult/signin/magic');
  }

  const result = await verifyEmailLink(token, client);
  persistVoultAuth(req, result);
  req.flash('success', result.message || 'Signed in with magic link.');
  res.redirect('/voult/account');
});
