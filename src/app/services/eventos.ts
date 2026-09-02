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

  obtenerCentros(): Observable<string[]> {
    return this.http.get<string[]>(`${this.URL_API}/get_centros.php`);
  }

  obtenerAsistenciasPorCentro(centro: string, fechaInicio: string, fechaFin: string): Observable<any> {
    const params = new HttpParams()
      .set('centro', centro)
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);

    return this.http.get(`${this.URL_API}/get_eventos_centro.php`, { params });
  }

  obtenerCatalogoFirmas(): Observable<any> {
    return this.http.get<any>(`${this.URL_API}/gestion_firmas.php`);
  }

  agregarFirmanteCompleto(datos: any): Observable<any> {
    return this.http.post<any>(`${this.URL_API}/gestion_firmas.php`, datos);
  }

  eliminarFirmante(id: number): Observable<any> {
    return this.http.post<any>(`${this.URL_API}/gestion_firmas.php`, {
      accion: 'eliminar',
      id: id
    });
  }

  obtenerUsuarios(): Observable<any> {
    return this.http.get<any>(`${this.URL_API}/gestion_usuarios.php`);
  }

  toggleEstatusUsuario(rpe: string, activo: number): Observable<any> {
    return this.http.post<any>(`${this.URL_API}/gestion_usuarios.php`, {
      accion: 'toggle_estatus',
      rpe: rpe,
      activo: activo
    });
  }

  eliminarUsuarioDefinitivo(rpe: string): Observable<any> {
    return this.http.post<any>(`${this.URL_API}/gestion_usuarios.php`, {
      accion: 'eliminar',
      rpe
    });
  }
}


