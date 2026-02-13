import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environments';

@Injectable({
    providedIn: 'root'
})
export abstract class BaseApiService {

    protected readonly baseUrl = environment.baseUrl;

    constructor(protected http: HttpClient) { }
}
