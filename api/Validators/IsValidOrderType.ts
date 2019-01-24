export default async (type: string = ''): Promise<boolean> => {
     if (type && type.length > 0 && (type == 'buy' || type == 'sell')) {
        return true;
    }

    throw new Error(`"${type}" is not a valid order type.`);
}