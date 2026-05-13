const client = require('../config/client');

module.exports = function syncVoultClient(req, res, next) {
  const v = req.session && req.session.voult;
  if (v && v.accessToken) {
    client.setSession(v.user || null, v.accessToken, v.refreshToken || null);
  } else {
    client.clearSession();
  }

  res.on('finish', () => {
    if (req.session && client.isAuthenticated()) {
      req.session.voult = {
        user: client.getCurrentUser(),
        accessToken: client.accessToken,
        refreshToken: client.refreshToken,
      };
    }
  });

  next();
};