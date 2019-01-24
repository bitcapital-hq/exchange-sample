const correct_length = 36;
export default async (guid: string = ''): Promise<boolean> => {
    const validator = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i ;
    if (guid && guid.length == correct_length && validator.test(guid)) {
        return true;
    }

    throw new Error(`"${guid}" is not a valid guid.`);
}