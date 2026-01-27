import {
  Component,
  inject,
  signal,
  computed,
  effect,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';

// PrimeNG
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { SelectModule } from 'primeng/select';

// Utils
import CountryList from 'country-list-with-dial-code-and-flag';
import {
  AsYouType,
  getExampleNumber,
  parsePhoneNumberFromString
} from 'libphonenumber-js';
import examples from 'libphonenumber-js/examples.mobile.json';

// Internals
import { LookupService } from '../services/lookup.service';
import { UserService } from '../services/user.service';
import { Skill } from '../modles/skill.model';
import { Field } from '../modles/field.model';
import { UserRole } from '../enums/user-role.enum';
import { passwordMatchValidator } from '../validators/password-match.validator';
import { passwordStrengthValidator } from '../validators/password-strength.validator';
import { phoneValidator } from '../validators/phone-number.validation';
import { of } from 'rxjs';

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
    DropdownModule,
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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private lookupService = inject(LookupService);
  private userService = inject(UserService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  readonly UserRole = UserRole;

  /* ================= SIGNALS ================= */
  activeRole = signal<UserRole>(UserRole.JOBSeeker);
  isJobSeeker = computed(() => this.activeRole() === UserRole.JOBSeeker);
  loading = signal(false);

  countries = signal<any[]>([]);
  selectedCountry = signal<any>(null);

  filedClicked = signal<boolean | undefined>(undefined);

  /* ================= FORM ================= */
  form: FormGroup = this.fb.group(
    {
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_-]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, phoneValidator(() => this.selectedCountry()?.code)]],
      password: ['', [Validators.required, passwordStrengthValidator]],
      confirmPassword: ['', Validators.required],
      experience: [null],
      fieldId: [null],
      skillIds: [[]],
      company: ['']
    },
    { validators: passwordMatchValidator }
  );

  get f() {
    return this.form.controls;
  }

  /* ================= LOOKUPS ================= */
  readonly fields = rxResource<Field[], boolean | undefined>({
    request: () => this.filedClicked(),
    loader: () => this.lookupService.getFields()
  });

  readonly fieldIdSignal = toSignal(
    this.form.get('fieldId')!.valueChanges,
    { initialValue: this.form.get('fieldId')!.value }
  );

  readonly skills = rxResource<Skill[], string | undefined>({
    request: () => this.fieldIdSignal(),
    loader: ({ request }) =>
      request ? this.lookupService.getSkills(request) : of([])
  });

  readonly filteredSkills = signal<Skill[]>([]);

  /* ================= CONSTRUCTOR ================= */
  constructor() {
    this.prepareCountries();
    this.setRole(this.activeRole());

    effect(() => {
      if (this.fieldIdSignal()) {
        this.form.get('skillIds')!.reset();
      }

      if (this.selectedCountry()) {
        this.form.get('phone')?.updateValueAndValidity();
      }
    });
  }

  /* ================= ROLE HANDLING ================= */
  setRole(role: UserRole) {
    this.activeRole.set(role);
    this.updateFormByRole(role);
  }

  private updateFormByRole(role: UserRole) {
    const jobSeeker = ['experience', 'fieldId', 'skillIds'];
    const hr = ['company'];

    jobSeeker.forEach(key => {
      const control = this.form.get(key);
      if (role === UserRole.JOBSeeker) {
        control?.setValidators(Validators.required);
        control?.enable({ emitEvent: false });
      } else {
        control?.reset();
        control?.clearValidators();
        control?.disable({ emitEvent: false });
      }
      control?.updateValueAndValidity({ emitEvent: false });
    });

    hr.forEach(key => {
      const control = this.form.get(key);
      if (role === UserRole.HR) {
        control?.setValidators(Validators.required);
        control?.enable({ emitEvent: false });
      } else {
        control?.reset();
        control?.clearValidators();
        control?.disable({ emitEvent: false });
      }
      control?.updateValueAndValidity({ emitEvent: false });
    });
  }

  /* ================= SKILLS ================= */
  filterSkills(event: AutoCompleteCompleteEvent) {
    const query = event.query?.trim().toLowerCase();
    if (!query) {
      this.filteredSkills.set([]);
      return;
    }

    const skills = this.skills.value() ?? [];
    this.filteredSkills.set(
      skills.filter(s => s.name.toLowerCase().includes(query)).slice(0, 20)
    );
  }

  /* ================= PHONE ================= */
  phonePlaceholder = computed(() => {
    const code = this.selectedCountry()?.code?.toUpperCase();
    if (!code) return 'Enter phone number';
    try {
      const example = getExampleNumber(code as any, examples);
      return example?.formatNational() ?? 'Enter phone number';
    } catch {
      return 'Enter phone number';
    }
  });

  onPhoneInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const code = this.selectedCountry()?.code?.toUpperCase();
    if (!code) return;

    const formatter = new AsYouType(code as any);
    const formatted = formatter.input(input.value);

    if (formatted !== this.form.get('phone')?.value) {
      this.form.get('phone')?.setValue(formatted, { emitEvent: false });
    }
  }

  get fullPhone(): string {
    const iso = this.selectedCountry()?.code?.toUpperCase();
    const raw = this.form.get('phone')?.value || '';
    return parsePhoneNumberFromString(raw, iso as any)?.number ?? raw;
  }

  /* ================= SUBMIT ================= */
  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const raw = this.form.getRawValue();

    const payload = {
      UserType: this.isJobSeeker() ? 0 : 1,
      Name: raw.name,
      Email: raw.email,
      Password: raw.password,
      Phone: this.fullPhone,
      LevelOfExperience: this.isJobSeeker() ? raw.experience : 0,
      Skills: this.isJobSeeker()
        ? (raw.skillIds ?? []).map((s: any) => ({ id: s.id }))
        : [],
      Company: this.isJobSeeker() ? null : raw.company
    };

    this.userService.register(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Account created successfully'
        });
        this.router.navigate(['/login']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const message =
          err.status === 409
            ? 'Email already registered'
            : err.status === 400
              ? 'Invalid input data'
              : 'Registration failed';

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: message
        });
      }
    });
  }

  /* ================= COUNTRIES ================= */
  private prepareCountries() {
    const data = CountryList.getAll().map(c => ({
      name: c.name,
      code: c.code,
      dialCode: c.dial_code,
      flagClass: `fi fi-${c.code.toLowerCase()}`
    }));

    this.countries.set(data);
    this.selectedCountry.set(data.find(c => c.dialCode === '+966') || data[0]);
  }
}
