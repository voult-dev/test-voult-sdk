const client = require('../config/client');
const { getCurrentUser, signOut, deleteUser } = require('voult-sdk');
const { clearVoultAuth } = require('../utils/voultSession');
const catchAsync = require('../utils/catchAsync');

function wantsBrowserRedirect(req) {
  return req.body && String(req.body._redirect) === '1';
}

module.exports.profileJson = catchAsync(async (req, res) => {
  const profile = await getCurrentUser(client);
  res.json(profile);
});

module.exports.accountPage = catchAsync(async (req, res) => {
  const profile = await getCurrentUser(client);
  res.render('voult/account', {
    title: 'Account (SDK)',
    profile,
    storedUser: req.session.voult?.user || null,
  });
});

module.exports.logout = catchAsync(async (req, res) => {
  await signOut(client);
  clearVoultAuth(req);
  if (wantsBrowserRedirect(req)) {
    req.flash('success', 'Signed out.');
    return res.redirect('/voult');
  }
  res.json({
    message: 'Signed out successfully',
  });
});

module.exports.deleteAcct = catchAsync(async (req, res) => {
  await deleteUser(client);
  clearVoultAuth(req);
  if (wantsBrowserRedirect(req)) {
    req.flash('info', 'Account disabled via SDK deleteUser().');
    return res.redirect('/voult');
  }
  res.json({
    message: 'User deleted successfully',
  });
});
