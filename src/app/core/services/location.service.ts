import { Injectable } from '@angular/core';
import CountryList from 'country-list-with-dial-code-and-flag';
import { CountryCode } from 'libphonenumber-js';
import { Country } from '../models/country.model';

@Injectable({ providedIn: 'root' })
export class LocationService {
    getCountries(): Country[] {
        return CountryList.getAll().map(c => ({
            name: c.name,
            code: c.code as CountryCode,
            dialCode: c.dial_code,
            flagClass: `fi fi-${c.code.toLowerCase()}`
        }));
    }

    getDefaultCountry(countries: Country[]): Country {
        return countries.find(c => c.code === 'PS') || countries[0];
    }
}