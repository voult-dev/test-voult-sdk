/**
 * Public base URL for magic-link redirectUri and links in emails.
 * Set BASE_URL (or base_url) in .env, or it falls back to the request host.
 */
function getAppBaseUrl(req) {
  const fromEnv = process.env.BASE_URL || process.env.base_url;
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }
  return `${req.protocol}://${req.get('host')}`;
}

module.exports = { getAppBaseUrl };
