import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Eventos {

  private readonly URL_API = environment.apiUrl;

  constructor(private http: HttpClient) { }

  obtenerAsistencias(rpe: string, fechaInicio: string, fechaFin: string): Observable<any> {

    const url = `${this.URL_API}/get_eventos.php?rpe=${rpe}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
    return this.http.get(url);
  }
}

