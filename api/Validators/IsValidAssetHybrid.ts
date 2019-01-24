import { default as isValidAssetCode } from './IsValidAssetCode';
import { default as isValidGuid } from './IsValidGuid';
export default async (code: string = ''): Promise<boolean> => {
    if (code && code.length > 0) {
        if (code.length <= 4) {
            return await isValidAssetCode(code);
        } else {
            return await isValidGuid(code);
        }
    } else {
        throw new Error(`"${code}" is not a valid asset code or indicator.`);
    }
}