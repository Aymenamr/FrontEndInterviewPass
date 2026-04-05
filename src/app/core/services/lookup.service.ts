import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Field } from '../models/field.model';
import { Skill } from '../models/skill.model';
import { environment } from '../../../environments/environments';

@Injectable({ providedIn: 'root' })
export class LookupService {
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl;


  getFields(): Observable<Field[]> {
    return this.http.get<Field[]>(`${this.baseUrl}/Field`)
  }

  getSkills(fieldId: string): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.baseUrl}/Skill`, {
      params: { fieldId }
    });
  }
}