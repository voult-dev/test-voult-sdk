import client from '../config/client.js';

export default function syncVoultClient(req, res, next) {
  const v = req.session?.voult;
  if (v?.accessToken) {
    client.setSession(v.user || null, v.accessToken, v.refreshToken || null);
  } else {
    client.clearSession();
  }

  res.on('finish', () => {
    if (!req.session) return;

    const isLogoutReq =
      req.path === '/logout' ||
      req.originalUrl?.includes('/auth/logout');

    if (isLogoutReq) return;

    if (client.isAuthenticated()) {
      const sessionToken = req.session.voult?.accessToken;
      if (client.accessToken !== sessionToken) {
        req.session.voult = {
          user: client.getCurrentUser(),
          accessToken: client.accessToken,
          refreshToken: client.refreshToken,
        };
        req.session.save((err) => {
          if (err) console.error('Session save error after token refresh:', err);
        });
      }
    }
  });

  next();
}
