import { CountryCode } from 'libphonenumber-js';

export interface Country {
    name: string;
    code: CountryCode;
    dialCode: string;
    flagClass: string;
}



