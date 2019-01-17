const max_length = 3;
export default async (code: string = ''): Promise<boolean> => {
    const validator = /^[a-zA-Z0-9]+$/;
    if (code && code.length <= max_length && validator.test(code)) {
        return true;
    }

    throw new Error(`"${code}" is not a valid asset code.`);
}