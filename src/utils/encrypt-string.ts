import { createCipheriv, randomBytes } from 'crypto';

export const encryptString = (inputString: string, encryptionKey: string) => {
  const ivLength = 16;

  const iv = randomBytes(ivLength);
  const cipher = createCipheriv('aes-256-cbc', Buffer.from(encryptionKey), iv);

  let encrypted = cipher.update(inputString);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString('hex') + ':' + encrypted.toString('hex');
};
