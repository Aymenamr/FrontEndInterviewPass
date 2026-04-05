import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private API = 'https://localhost:7178/api/Auth';
  constructor(private http: HttpClient) { }
 
  login(data: { email: string; password: string ,userType:number}) {
    return this.http.post<any>(`${this.API}/login`, data);
  }

  saveToken(token: string, remember: boolean) {
    if (remember) {
      localStorage.setItem('token', token);
    } else {
      sessionStorage.setItem('token', token);
    }
  }

  // getToken(): string | null {
  //   return localStorage.getItem('token') || sessionStorage.getItem('token');
  // }

  // logout() {
  //   localStorage.clear();
  //   sessionStorage.clear();
  // }
}