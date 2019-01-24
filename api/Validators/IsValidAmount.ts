export default async (amount: string = ''): Promise<boolean> => {
    if (amount && parseInt(amount) > 0) {
        return true;
    }

    throw new Error(`"${amount}" is not a valid amount.`);
}