import { Injectable } from '@angular/core';
import {
    AsYouType,
    getExampleNumber,
    parsePhoneNumberFromString,
    CountryCode
} from 'libphonenumber-js';
import examples from 'libphonenumber-js/examples.mobile.json';

@Injectable({ providedIn: 'root' })
export class PhoneService {

    formatAsYouType(value: string, countryCode: CountryCode): string {
        if (!countryCode) return value;
        return new AsYouType(countryCode).input(value);
    }

    getPlaceholder(countryCode: CountryCode): string {

        let message = "Enter phone number"
        if (!countryCode) return message;
        try {
            const example = getExampleNumber(countryCode, examples);
            return example ? example.formatNational() : message;
        } catch {
            return message;
        }
    }

    normalizeNumber(raw: string, countryCode: CountryCode): string {
        const parsed = parsePhoneNumberFromString(raw, countryCode);
        return parsed ? parsed.number : raw;
    }
}