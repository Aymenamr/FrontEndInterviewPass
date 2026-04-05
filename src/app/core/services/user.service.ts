import { Injectable, inject } from '@angular/core';
import { RegisterPayload } from '../models/user.model';
import { BaseApiService } from './base-api.service';
@Injectable({
    providedIn: 'root'
})
export class UserService extends BaseApiService {
    private readonly apiUrl = `${this.baseUrl}/User`;
    register(user: RegisterPayload) {
        return this.http.post(this.apiUrl, user);
    }
}