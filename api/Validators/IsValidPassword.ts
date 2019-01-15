const min_length = 8;
export default async (password: string = ''): Promise<boolean> => {
    if (password && password.length >= min_length) {
        return true;
    }

    throw new Error(`Password must be at least ${min_length} characters long.`);
}