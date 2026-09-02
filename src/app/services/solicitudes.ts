import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SolicitudRegistro } from '../models/Solicitud';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SolicitudesService {
  private baseApi = environment.apiUrl;

  constructor(private http: HttpClient) { }

  enviarSolicitud(datos: any): Observable<any> {
    return this.http.post<any>(`${this.baseApi}/solicitar_ingreso.php`, datos);
  }

  obtenerDatosDashboard(): Observable<any> {
    return this.http.get<any>(`${this.baseApi}/gestion_usuarios.php`);
  }

  procesarSolicitud(id: number, accion: 'aceptar' | 'rechazar'): Observable<any> {
    return this.http.post<any>(`${this.baseApi}/gestion_usuarios.php`, {
      accion: accion,
      id: id
    });
  }

  cambiarRolUsuario(id: number, nuevo_rol: string): Observable<any> {
    return this.http.post<any>(`${this.baseApi}/cambiar_rol.php`, { id, nuevo_rol });
  }

  eliminarUsuario(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseApi}/gestion_usuarios.php`, {
      accion: 'eliminar',
      id: id
    });
  }

  toggleEstatusUsuario(rpe: string, activo: number): Observable<any> {
    return this.http.post<any>(`${this.baseApi}/gestion_usuarios.php`, {
      accion: 'toggle_estatus',
      rpe: rpe,
      activo: activo
    });
  }

  obtenerCatalogoInscripcion(): Observable<any> {
    return this.http.get<any>(`${this.baseApi}/solicitar_ingreso.php`);
  }

  agregarFirmanteCompleto(datos: any): Observable<any> {
    return this.http.post<any>(`${this.baseApi}/gestion_firmas.php`, datos);
  }

  obtenerFirmantes(): Observable<any> {
    return this.http.get<any>(`${this.baseApi}/gestion_firmas.php`);
  }
}
