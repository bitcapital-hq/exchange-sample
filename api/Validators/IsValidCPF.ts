import { BaseError, Logger } from "ts-framework-common";

const correct_length = 11;
export default async (cpf: string = ''): Promise<boolean> => {
    //Stripping the string of all periods, dashes and everything that isn't a number
    cpf = cpf.replace(/[^0-9]+/g, '');

    const validator = /(.)\1{10,}/;
    if (cpf && cpf.length == correct_length && !validator.test(cpf)) {
        //Separating verifying digits from identification numbers
        const verificationDigits = cpf.slice(9, 11).split('');
        const identificationNumbers = cpf.slice(0, 9).split('');

        //Calculating one, or both verification digits
        for (let i = 0; i <= 1; i++) {
            let sum = 0;
            for(let y = 0; y <= identificationNumbers.length - 1; y++) {       
                sum += parseInt(identificationNumbers[y]) * ((10 + i) - y);
            }
    
            //Calculating quotient and remainder
            let quotient = ~~(sum / 11);
            let remainder = sum % 11;
    
            //Calculating verification digit
            let verificationDigit = 0;
            if (remainder >= 2) {
                verificationDigit = 11 - remainder;
            }
    
            if (verificationDigit != parseInt(verificationDigits[i])) {
                throw new BaseError('Invalid CPF (tax_id).');
            }

            /*
            If it's the first verification digit, then we add the new verification number to the end of the numbers we're
            summing together, if it's the second, then we just return true, as it has passed the test above
            */
            if (identificationNumbers.length == 9) {
                identificationNumbers.push(verificationDigit.toString());
            } else {
               return true;
            }
        }
    } else {
        throw new BaseError('Invalid CPF (tax_id).');
    }
}