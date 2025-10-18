import jwt from 'jsonwebtoken';

export function signAccessToken(user) {
  const payload = { sub: user.id, email: user.email, name: user.name };
  const expiresIn = Number(process.env.JWT_EXPIRES_IN || 24 * 60 * 60); // seconds
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', { expiresIn });
  return { token, expiresIn };
}

export function signRefreshToken(user) {
  const payload = { sub: user.id, typ: 'refresh' };
  const expiresIn = Number(process.env.REFRESH_EXPIRES_IN || 7 * 24 * 60 * 60); // seconds
  const token = jwt.sign(payload, process.env.REFRESH_SECRET || process.env.JWT_SECRET || 'dev_secret', { expiresIn });
  return token;
}
