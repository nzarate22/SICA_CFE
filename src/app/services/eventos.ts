import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Eventos {
  private readonly URL_API = environment.apiUrl;

  constructor(private http: HttpClient) { }

  obtenerAsistencias(rpe: string, fechaInicio: string, fechaFin: string): Observable<any> {

    const params = new HttpParams()
      .set('rpe', rpe)
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);

    return this.http.get(`${this.URL_API}/get_eventos.php`, { params });
  }
}

