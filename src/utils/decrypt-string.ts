import { createDecipheriv } from 'crypto';

export const decryptString = (
  encryptedString: string,
  encryptionKey: string,
) => {
  try {
    const [ivHex, encryptedHex] = encryptedString.split(':');

    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(encryptedHex, 'hex');

    const decipher = createDecipheriv(
      'aes-256-cbc',
      Buffer.from(encryptionKey),
      iv,
    );

    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  } catch (error) {
    console.log(error);
    throw new Error('Error while decrypting the string');
  }
};
