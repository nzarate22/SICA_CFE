import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly URL_API = environment.apiUrl;

  constructor(private http: HttpClient) { }

  login(rpe: string, password: string): Observable<any> {
    return this.http.post(`${this.URL_API}/login.php`, { rpe, password });
  }
}
