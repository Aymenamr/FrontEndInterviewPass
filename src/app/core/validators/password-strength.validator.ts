import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const passwordStrengthValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value || '';
  if (!value) return null;

  const hasUpperCase = /[A-Z]+/.test(value);
  const hasLowerCase = /[a-z]+/.test(value);
  const hasNumeric = /[0-9]+/.test(value);
  const isLongEnough = value.length >= 8;

  const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && isLongEnough;

  return !passwordValid ? {
    passwordStrength: {
      hasUpperCase,
      hasLowerCase,
      hasNumeric,
      isLongEnough
    }
  } : null;
};