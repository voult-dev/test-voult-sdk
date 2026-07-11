export function persistVoultAuth(req, result) {
  if (!result || !req.session) return;

  const accessToken = result.accessToken || result.token;
  if (!accessToken) return;

  req.session.voult = {
    user: result.user || null,
    accessToken,
    refreshToken: result.refreshToken || null,
  };
}

export function clearVoultAuth(req) {
  if (!req.session) return;
  delete req.session.voult;
  delete req.session.mfaPendingToken;
  if (typeof req.session.save === 'function') {
    req.session.save(() => {});
  }
}

export function persistMfaPending(req, mfaPendingToken) {
  if (!req.session || !mfaPendingToken) return;
  req.session.mfaPendingToken = mfaPendingToken;
}
