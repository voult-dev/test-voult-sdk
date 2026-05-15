/**
 * @param {import('express').Request} req
 * @param {object} result - SDK sign-in or sign-up result
 * @param {object} [result.user]
 * @param {string} [result.accessToken]
 * @param {string} [result.token] - some flows return `token` instead of accessToken
 * @param {string} [result.refreshToken]
 */
function persistVoultAuth(req, result) {
  if (!result) return;
  const accessToken = result.accessToken || result.token;
  if (!accessToken) return;
  if (!req.session) return;
  req.session.voult = {
    user: result.user || null,
    accessToken,
    refreshToken: result.refreshToken || null,
  };
}

function clearVoultAuth(req) {
  if (!req.session) return;

  // Remove the auth object entirely.
  // Some code checks req.session.voult.accessToken, so removing the parent
  // ensures middleware redirects immediately.
  delete req.session.voult;

  // Ensure the session is saved before redirect so subsequent GET /account
  // sees the cleared state on the first click.
  if (typeof req.session.save === 'function') {
    req.session.save(() => {});
  }
}


module.exports = { persistVoultAuth, clearVoultAuth };
