import { Routes } from '@angular/router';
import { AboutComponent } from './features/about/about.component';
import { SignupComponent } from './core/sign-up/signup.component';

export const routes: Routes = [
  { path: '', redirectTo: 'signup', pathMatch: 'full' },
  { path: 'signup', component: SignupComponent },
  { path: 'about', component: AboutComponent },
  { path: '**', redirectTo: '' }
];