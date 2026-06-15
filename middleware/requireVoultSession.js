/**
 * Redirects to the sign-in test page if the session has no Voult tokens.
 */
module.exports = function requireVoultSession(req, res, next) {
  if (!req.session.voult || !req.session.voult.accessToken) {
    req.flash('error', 'Sign in first to perform that action.');
    return res.redirect('/voult/signin/email');
  }
  next();
};
