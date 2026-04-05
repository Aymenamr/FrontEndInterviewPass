import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import parsePhoneNumberFromString, { CountryCode } from 'libphonenumber-js';

export function phoneValidator(getCountryCode: () => string | undefined): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;
        if (!value) return null;

        const countryCode = getCountryCode()?.toUpperCase() as CountryCode;
        try {
            const phoneNumber = parsePhoneNumberFromString(value, countryCode);
            return (phoneNumber && phoneNumber.isValid()) ? null : { invalidPhone: true };
        } catch {
            return { invalidPhone: true };
        }
    };
}