const correct_length = 11;
function validateCPF(cpf) {
    //Stripping the string of all periods, dashes and everything that isn't a number
    cpf = cpf.replace(/[^0-9]+/g, '');

    const validator = /(.)\1{10,}/;
    if (cpf && cpf.length == correct_length && !validator.test(cpf)) {
        //Separating verifying digits from identification numbers
        const verifyingDigits = cpf.slice(9, 11).split('');
        const identificationNumbers = cpf.slice(0, 9).split('');
        
        for(let i = 0; i <= 1; i++) {
            //Calculating first verification digit
            let sum = 0;
            for (let y = 0; y <= identificationNumbers.length - 1; y++) { 
                sum += parseInt(identificationNumbers[i]) * (10 - y);
            }

            let quot = ~~(sum / 11);
            let remainder = sum % 11;

            let digitBeingVerified = parseInt(verifyingDigits[i]);
            let calculatedVerificationDigit: number;
            if (remainder < 2) {
                calculatedVerificationDigit = 0;
            } else {
                calculatedVerificationDigit = 11 - remainder;
            }

            if (calculatedVerificationDigit != parseInt(verifyingDigits[i])) {
                throw new Error('Invalid CPF (tax_id).');
            }

            /*
            If it's the first verification digit, then we add the new verification number to the end of the numbers we're
            summing together, if it's the second, then we just return true, as it has passed the test above
            */
            if (identificationNumbers.length == 9) {
                identificationNumbers.push(calculatedVerificationDigit.toString());
            } else {
                return true;
            }

        }
    } else {
        throw new Error('Invalid CPF (tax_id).');
    }
}

console.log(validateCPF('47010036896'));