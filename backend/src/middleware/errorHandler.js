function extractMessage(err) {
  if (typeof err.message === 'string' && err.message !== '[object Object]') {
    return err.message;
  }

  const details = err.details;
  if (details?.error?.message && typeof details.error.message === 'string') {
    return details.error.message;
  }
  if (details?.message && typeof details.message === 'string') {
    return details.message;
  }

  return 'Something went wrong';
}

function extractStatus(err) {
  return (
    err.status ||
    err.statusCode ||
    err.details?.error?.status ||
    err.details?.status ||
    500
  );
}

function extractCode(err) {
  return err.code || err.details?.error?.code || 'INTERNAL_ERROR';
}

export default function errorHandler(err, req, res, _next) {
  console.error(err);

  const status = extractStatus(err);
  const code = extractCode(err);
  const message = extractMessage(err);

  res.status(status).json({
    error: {
      code,
      message,
      status,
      field: err.field,
      details: err.details,
    },
  });
}
