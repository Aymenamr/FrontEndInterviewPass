import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { Field } from '../modles/field.model';
import { Skill } from '../modles/skill.model';
import { environment } from '../../../environments/environments.prod';

@Injectable({ providedIn: 'root' })
export class LookupService {
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl; // Use your base URL logic

 
  getFields(): Observable<Field[]> {
    return this.http.get<Field[]>(`${this.baseUrl}/Field`)
  }

  getSkills(fieldId: string): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.baseUrl}/Skill`, {
      params: { fieldId }
    });
  }
}