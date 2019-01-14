import * as crypto from 'crypto';
export function generateSalt() {
    return crypto.randomBytes(128).toString('base64');
}

export function hashPassword(password:string, salt:string) {
    const hmac = crypto.createHmac('sha256', salt);
    return hmac.update(password).digest('hex');
}