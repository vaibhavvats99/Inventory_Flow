// Simplified middleware: allow all requests, no auth needed

export function verifyJWT(_req, _res, next) {
  next();
}

export function requireAdmin(_req, _res, next) {
  next();
}


