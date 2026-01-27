import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments.prod';

@Injectable({
    providedIn: 'root'
})
export class UserService {
     private readonly apiUrl = `${environment.baseUrl}/User`;

    constructor(private http: HttpClient) { }

    register(payload: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, payload);
    }
}