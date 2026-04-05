import {
  Component,
  inject,
  signal,
  computed,
  effect,
  OnInit,
  DestroyRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { rxResource, toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { SelectModule } from 'primeng/select';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';

import { LookupService } from '../services/lookup.service';
import { PhoneService } from '../services/phone.service';
import { SignupService } from '../services/signup.service';
import { UserRole } from '../enums/user-role.enum';
import { phoneValidator } from '../validators/phone-number.validation';
import { HttpErrorResponse } from '@angular/common/http';
import { CountryCode } from 'libphonenumber-js';

import { Validators } from '@angular/forms';
import { Field } from '../models/field.model';
import { Country } from '../models/country.model';
import { Skill } from '../models/skill.model';
import { FormValue } from '../models/user.model';

interface RegistrationError {
  message?: string;
  detail?: string;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    DividerModule,
    InputTextModule,
    PasswordModule,
    IconFieldModule,
    InputIconModule,
    AutoCompleteModule,
    ToastModule,
    SelectModule
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignupComponent implements OnInit {
  private router = inject(Router);
  private messageService = inject(MessageService);
  private destroyRef = inject(DestroyRef);

  private lookupService = inject(LookupService);
  private phoneService = inject(PhoneService);
  private signupService = inject(SignupService);

  readonly UserRole = UserRole;

  readonly activeRole = signal<UserRole>(UserRole.JOBSeeker);
  readonly isJobSeeker = computed(() => this.activeRole() === UserRole.JOBSeeker);
  readonly loading = signal(false);

  readonly countries = signal<Country[]>([]);
  readonly selectedCountry = signal<Country | null>(null);
  readonly fieldLoadTrigger = signal(false);

  readonly form = this.signupService.buildForm();

  readonly fields = rxResource<Field[], boolean>({
    request: () => this.fieldLoadTrigger(),
    loader: ({ request }) => request ? this.lookupService.getFields() : of([])
  });

  private fieldIdValue = toSignal(this.form.controls.fieldId.valueChanges, { initialValue: null });

  readonly skills = rxResource<Skill[], string | null>({
    request: () => this.fieldIdValue(),
    loader: ({ request }) => request ? this.lookupService.getSkills(request) : of([]),
  });

  readonly filteredSkills = signal<Skill[]>([]);

  readonly phonePlaceholder = computed(() => this.phoneService.getPlaceholder(this.selectedCountry()?.code as CountryCode) ?? '');

  constructor() {
    effect(() => this.fieldIdValue() && this.form.controls.skillIds.reset());
    effect(() => {
      const code = this.selectedCountry()?.code;
      if (code) {
        this.form.controls.phone.setValidators([Validators.required, phoneValidator(() => code)]);
        this.form.controls.phone.updateValueAndValidity();
      }
    });

    effect(() => {
      const error = this.skills.error();

      if (error) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load skills'
        });
      }
    });

    effect(() => {
      const error = this.fields.error();

      if (error) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load fields'
        });
      }
    });
  }

  ngOnInit(): void {
    const { countries, defaultCountry } = this.signupService.initializeCountries();
    this.countries.set(countries);
    this.selectedCountry.set(defaultCountry);
    this.signupService.updateFormByRole(this.form, this.activeRole());
  }

  setRole(role: UserRole): void {
    this.activeRole.set(role);
    this.signupService.updateFormByRole(this.form, role);
  }

  onFieldDropdownOpen(): void {
    this.fieldLoadTrigger.update(v => this.fieldIdValue() ? v : !v); // Trigger load if fieldId has value, otherwise reset to allow re-trigger on selection
  }

  filterSkills(event: AutoCompleteCompleteEvent): void {
    const query = event.query?.trim().toLowerCase() ?? '';
    const available = this.skills.value() ?? [];
    this.filteredSkills.set(query ? available.filter(s => s.name.toLowerCase().includes(query)) : available);
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const code = this.selectedCountry()?.code;
    if (code) {
      const formatted = this.phoneService.formatAsYouType(input.value, code);
      if (formatted !== this.form.controls.phone.value) this.form.controls.phone.setValue(formatted, { emitEvent: false });
    }
  }

  submit(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();

    this.loading.set(true);
    const value = this.form.getRawValue() as FormValue;
    const code = this.selectedCountry()?.code;
    if (!code) {
      this.loading.set(false);
      return this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select a country' });
    }

    this.signupService.register(value, this.isJobSeeker(), code).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Account created successfully' });
        this.router.navigate(['/login']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const error = err.error as RegistrationError;
        let msg = error?.message || error?.detail || 'Registration failed';
        switch (err.status) {
          case 409: msg = msg.includes('email') ? msg : 'Email already registered'; break;
          case 400: msg ||= 'Please check your input data'; break;
          case 500: msg ||= 'Server error. Try again later.'; break;
        }
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
      }
    });
  }
}