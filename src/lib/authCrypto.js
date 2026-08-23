import bcrypt from 'bcryptjs';

/**
 * Browser-safe password hashing and verification
 */
export async function hashPassword(plainText) {
  if (!plainText) return '';
  try {
    return await bcrypt.hash(plainText, 10);
  } catch (err) {
    console.error('Error hashing password:', err);
    return plainText;
  }
}

export async function comparePassword(plainText, hashOrPlain) {
  if (!plainText || !hashOrPlain) return false;
  
  // If plain text matches directly (fallback)
  if (plainText === hashOrPlain) return true;

  try {
    // If it looks like a bcrypt hash ($2a$, $2b$, $2y$)
    if (typeof hashOrPlain === 'string' && hashOrPlain.startsWith('$2')) {
      return await bcrypt.compare(plainText, hashOrPlain);
    }
  } catch (err) {
    console.warn('bcrypt compare error, falling back to direct compare:', err);
  }
  
  return plainText === hashOrPlain;
}
