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

// module.exports.logout = catchAsync(async (req, res) => {
//   await signOut(client);
//   clearVoultAuth(req);
//   if (wantsBrowserRedirect(req)) {
//     req.flash('success', 'Signed out.');
//     return res.redirect('/voult');
//   }
//   res.json({
//     message: 'Signed out successfully',
//   });
// });

module.exports.logout = catchAsync(async (req, res) => {
  // Don't fail the logout route if the remote logout endpoint rejects the
  // current (possibly already-expired/invalid) token.
  try {
    await signOut(client);
  } catch (err) {
    // Still clear local session so UI becomes consistent.
    clearVoultAuth(req);

    if (wantsBrowserRedirect(req)) {
      req.flash('success', 'Signed out.');
      return res.redirect('/voult');
    }

    // Preserve existing behavior for clients expecting JSON.
    return res.status(200).json({
      message: 'Signed out successfully',
      warning: err?.code === 'AUTHENTICATION_ERROR' ? 'Remote token invalid/expired; local session cleared.' : undefined,
    });
  }
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
