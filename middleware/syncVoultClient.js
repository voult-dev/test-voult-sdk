const client = require('../config/client');

/**
 * Restores the shared VoultClient session from the current Express session
 * so each request uses the correct tokens (singleton client is per-process only).
 */
module.exports = function syncVoultClient(req, res, next) {
  const v = req.session && req.session.voult;
  if (v && v.accessToken) {
    client.setSession(v.user || null, v.accessToken, v.refreshToken || null);
  } else {
    client.clearSession();
  }
  next();
};
