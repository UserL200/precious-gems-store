import bcrypt from 'bcryptjs';

const SALT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 10);

export async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(plain, salt);
}

export async function comparePassword(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}
