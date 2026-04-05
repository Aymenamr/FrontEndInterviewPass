import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CheckboxModule,
    InputIconModule,
    IconFieldModule
  ],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css'
})
export class SigninComponent {

 loginForm;
 errorMessage: string = '';
 selectedUserType:number =0;

  constructor(private fb: FormBuilder, private authService: AuthService,private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  get email() {
    return this.loginForm.controls['email'];
  }

  get password() {
    return this.loginForm.controls['password'];
  }

  setUserType(type:number){
    this.selectedUserType =type;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    const { email, password, rememberMe } = this.loginForm.value;

   this.authService.login({ email: email!, password: password! ,userType :this.selectedUserType}).subscribe({
      next: (res: any) => {
        this.authService.saveToken(res.token, rememberMe!);
        this.router.navigate(['']);
      },
      error: (err: any) => {
        if (err.status === 401) {
          this.errorMessage = 'Invalid Email or Password, Try Again!';
        } else {
          this.errorMessage = 'An unexpected error occurred';
        }
        console.error(err);
      }
    });
  }
  }