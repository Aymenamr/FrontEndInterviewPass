import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirm = control.get('confirmPassword');

    if (password && confirm && password.value !== confirm.value) {
        // This line ensures the UI turns red by setting the error on the specific field
        confirm.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
    }
    return null;
};