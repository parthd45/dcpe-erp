import * as bcryptModule from 'bcryptjs';

const bcrypt = bcryptModule?.default || bcryptModule;

/**
 * Browser-safe password hashing and verification
 */
export async function hashPassword(plainText) {
  if (!plainText) return '';
  try {
    if (bcrypt && typeof bcrypt.hashSync === 'function') {
      return bcrypt.hashSync(plainText, 10);
    }
    if (bcrypt && typeof bcrypt.hash === 'function') {
      return await bcrypt.hash(plainText, 10);
    }
  } catch (err) {
    console.error('Error hashing password:', err);
  }
  return plainText;
}

export async function comparePassword(plainText, hashOrPlain) {
  if (!plainText || !hashOrPlain) return false;
  if (plainText === hashOrPlain) return true;

  try {
    if (typeof hashOrPlain === 'string' && (hashOrPlain.startsWith('$2a$') || hashOrPlain.startsWith('$2b$') || hashOrPlain.startsWith('$2y$'))) {
      if (bcrypt && typeof bcrypt.compareSync === 'function') {
        return bcrypt.compareSync(plainText, hashOrPlain);
      }
      if (bcrypt && typeof bcrypt.compare === 'function') {
        return await bcrypt.compare(plainText, hashOrPlain);
      }
    }
  } catch (err) {
    console.warn('Password comparison fallback error:', err);
  }
  
  return plainText === hashOrPlain;
}
