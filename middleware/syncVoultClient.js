const client = require('../config/client');

module.exports = function syncVoultClient(req, res, next) {
  // Restore client state from session at the start of each request
  const v = req.session && req.session.voult;
  if (v && v.accessToken) {
    client.setSession(v.user || null, v.accessToken, v.refreshToken || null);
  } else {
    client.clearSession();
  }

  // After the response is sent, write any refreshed tokens back to session
  res.on('finish', () => {
    if (!req.session) return;

    // Skip writing session back during logout.
    // Otherwise, sync can re-populate req.session.voult right after clearVoultAuth(req).
    const isLogoutReq =
      req.path === '/logout' ||
      req.originalUrl?.includes('/logout') ||
      req.route?.path === '/logout';

    if (isLogoutReq) return;

    if (client.isAuthenticated()) {
      // Only update if the token actually changed (i.e. a refresh happened)
      const sessionToken = req.session.voult && req.session.voult.accessToken;
      if (client.accessToken !== sessionToken) {
        req.session.voult = {
          user: client.getCurrentUser(),
          accessToken: client.accessToken,
          refreshToken: client.refreshToken,
        };
        // Force session save since res is already finishing
        req.session.save((err) => {
          if (err) console.error('Session save error after token refresh:', err);
        });
      }
    }
  });

  next();
};