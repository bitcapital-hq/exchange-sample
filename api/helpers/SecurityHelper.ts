import * as crypto from 'crypto';

export function generateHash(password: string, salt: string): Promise<string> {
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(password, salt, 100000, 512, 'sha512', (error, key) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(key.toString('hex'));
        })
    });
}

export async function generatePassword(password: string): Promise<{ salt: string; hash: string }> {
    const salt = crypto.randomBytes(128).toString('hex');
    return {
        salt: salt,
        hash: await generateHash(password, salt)
    }
}