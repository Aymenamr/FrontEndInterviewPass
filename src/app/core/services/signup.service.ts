import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { LocationService } from './location.service';
import { UserService } from './user.service';
import { UserRole } from '../enums/user-role.enum';
import { passwordMatchValidator } from '../validators/password-match.validator';
import { passwordStrengthValidator } from '../validators/password-strength.validator';
import { CountryCode } from 'libphonenumber-js';
import { FormValue, RegisterPayload } from '../models/user.model';
import { Country } from '../models/country.model';
type FormControls = { [K in keyof FormValue]: FormControl<FormValue[K]> };

@Injectable({
    providedIn: 'root'
})
export class SignupService {
    private fb = inject(FormBuilder);
    private locationService = inject(LocationService);
    private userService = inject(UserService);

    buildForm(): FormGroup<FormControls> {
        const controls: FormControls = {
            name: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^[a-zA-Z0-9 _-]+$/)] }),
            email: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
            phone: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
            password: this.fb.control('', { nonNullable: true, validators: [Validators.required, passwordStrengthValidator] }),
            confirmPassword: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
            experience: this.fb.control(null),
            fieldId: this.fb.control(null),
            skillIds: this.fb.control([], { nonNullable: true }),
            company: this.fb.control('', { nonNullable: true })
        };

        return this.fb.group(controls, { validators: passwordMatchValidator });
    }

    initializeCountries(): { countries: Country[]; defaultCountry: Country | null } {
        const countries = this.locationService.getCountries();
        const defaultCountry = this.locationService.getDefaultCountry(countries);
        return { countries, defaultCountry };
    }

    updateFormByRole(form: FormGroup<FormControls>, role: UserRole): void {
        const toggle = (keys: (keyof FormValue)[], enable: boolean) => keys.forEach(key => {
            const control = form.get(key);
            if (enable) {
                control?.setValidators(Validators.required);
                control?.enable({ emitEvent: false });
            } else {
                control?.reset();
                control?.clearValidators();
                control?.disable({ emitEvent: false });
            }
            control?.updateValueAndValidity({ emitEvent: false });
        });

        toggle(['experience', 'fieldId', 'skillIds'], role === UserRole.JOBSeeker);
        toggle(['company'], role === UserRole.HR);
    }

    register(value: FormValue, isJobSeeker: boolean, code: CountryCode): Observable<any> {
        const payload = this.createRegisterPayload(value, isJobSeeker, code);
        return this.userService.register(payload);
    }

    private createRegisterPayload(value: FormValue, isJobSeeker: boolean, code: CountryCode): RegisterPayload {
        const basePayload: Partial<RegisterPayload> = {
            Name: value.name,
            login: value.email,
            Phone: `${code}${value.phone.replace(/\D/g, '')}`,
            Password: value.password,
            UserType: isJobSeeker ? 0 : 1
        };

        if (isJobSeeker) {
            return {
                ...basePayload,
                LevelOfExperience: value.experience!,
                Skills: value.skillIds.map(skill => ({ id: skill.id }))
            } as RegisterPayload;
        } else {
            return {
                ...basePayload,
                Company: value.company,
                LevelOfExperience: null,
                Skills: []
            } as RegisterPayload;
        }
    }
}

