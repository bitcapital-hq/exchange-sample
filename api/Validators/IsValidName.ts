const min_length = 3;
export default async (name: string = ''): Promise<boolean> => {
    if (name && name.length >= min_length) {
        return true;
    }

    throw new Error(`Name must be at least ${min_length} characters long.`);
}