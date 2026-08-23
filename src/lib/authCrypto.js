import bcrypt from 'bcryptjs';

function getBcrypt() {
  try {
    if (typeof bcrypt !== 'undefined' && bcrypt) {
      return bcrypt.default || bcrypt;
    }
  } catch (e) {
    console.warn('bcrypt loading:', e);
  }
  return null;
}

/**
 * Browser-safe password hashing and verification
 */
export function hashPassword(plainText) {
  if (!plainText) return '';
  try {
    const b = getBcrypt();
    if (b && typeof b.hashSync === 'function') {
      return b.hashSync(plainText, 10);
    }
  } catch (err) {
    console.error('Error hashing password:', err);
  }
  return plainText;
}

export function comparePassword(plainText, hashOrPlain) {
  if (!plainText || !hashOrPlain) return false;
  if (plainText === hashOrPlain) return true;

  try {
    if (typeof hashOrPlain === 'string' && (hashOrPlain.startsWith('$2a$') || hashOrPlain.startsWith('$2b$') || hashOrPlain.startsWith('$2y$'))) {
      const b = getBcrypt();
      if (b && typeof b.compareSync === 'function') {
        return b.compareSync(plainText, hashOrPlain);
      }
    }
  } catch (err) {
    console.warn('Password comparison fallback error:', err);
  }
  
  return plainText === hashOrPlain;
}
