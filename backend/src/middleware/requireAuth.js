export default function requireAuth(req, res, next) {
  if (!req.session?.voult?.accessToken) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Sign in first to perform that action.',
        status: 401,
      },
    });
  }
  next();
}
