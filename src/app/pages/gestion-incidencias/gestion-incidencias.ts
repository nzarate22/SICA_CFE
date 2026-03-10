import { Component } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Eventos } from '../../services/eventos';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-gestion-incidencias',
  standalone: true,
  imports: [Navbar, CommonModule, FormsModule],
  templateUrl: './gestion-incidencias.html',
  styleUrl: './gestion-incidencias.scss',
})
export class GestionIncidencias {
  rpeBusqueda: string = '';
  fechaInicio: string = '';
  fechaFin: string = '';
  nombreColaborador: string = 'Nombre del Trabajador Seleccionado';

  listaEventos: any[] = [];
  cargando: boolean = false;
  totalRetardos: number = 0;
  totalSalidasAnticipadas: number = 0;

  private busquedaActiva?: Subscription;
  private precargado: boolean = false;
  private idUltimaBusqueda: number = 0;

  constructor(
    private router: Router,
    private eventoService: Eventos
  ) { }

  onRpeChange() {
    this.precargado = false;
    this.intentarPrecargar();
  }

  onFechaChange() {
    this.precargado = false;
    this.intentarPrecargar();
  }

  private intentarPrecargar() {
    if (this.rpeBusqueda.length >= 3 && this.fechaInicio && this.fechaFin && !this.precargado) {
      this.precargado = true;
      this.eventoService.obtenerAsistencias(
        this.rpeBusqueda,
        this.fechaInicio,
        this.fechaFin
      ).subscribe({ next: () => { }, error: () => { } });
    }
  }

  buscar() {
    if (!this.rpeBusqueda || !this.fechaInicio || !this.fechaFin) {
      alert('Por favor, ingrese el RPE y el rango de fechas completo.');
      return;
    }

    if (this.busquedaActiva) {
      this.busquedaActiva.unsubscribe();
      this.busquedaActiva = undefined;
    }

    const idEstaBusqueda = Date.now();
    this.idUltimaBusqueda = idEstaBusqueda;
    this.cargando = true;

    this.busquedaActiva = this.eventoService.obtenerAsistencias(this.rpeBusqueda, this.fechaInicio, this.fechaFin)
      .subscribe({
        next: (datos) => {
          if (idEstaBusqueda !== this.idUltimaBusqueda) {
            this.cargando = false;
            return;
          }
          this.procesarDatos(datos);
          this.busquedaActiva = undefined;
          this.cargando = false;
        },
        error: (e) => {
          if (idEstaBusqueda !== this.idUltimaBusqueda) {
            this.cargando = false;
            return;
          }
          console.error('Error al conectar con CFE:', e);
          this.busquedaActiva = undefined;
          this.cargando = false;
        }
      });
  }

  private procesarDatos(datos: any[]) {
    this.totalRetardos = 0;
    this.totalSalidasAnticipadas = 0;

    this.listaEventos = datos.map((e: any) => {
      const estatus = this.obtenerEstatus(e);

      if (estatus === 'Retardo' || estatus === 'Retardo / S. Anticipada') {
        this.totalRetardos++;
      }
      if (estatus === 'Salida Anticipada' || estatus === 'Retardo / S. Anticipada') {
        this.totalSalidasAnticipadas++;
      }

      return { ...e, estatus };
    });

    if (this.listaEventos.length > 0) {
      this.nombreColaborador = this.listaEventos[0].nombre;
    } else {
      this.nombreColaborador = 'No se encontraron registros';
    }
  }

  horaASegundos(hora: string): number {
    if (!hora) return -1;
    const limpia = hora.trim().substring(0, 8);
    const partes = limpia.split(':');
    const h = parseInt(partes[0]);
    const m = parseInt(partes[1]);
    const s = parseInt(partes[2]);
    return h * 3600 + m * 60 + s;
  }

  obtenerEstatus(evento: any): string {
    const entrada = this.horaASegundos(evento.hora_entrada);
    const salida = this.horaASegundos(evento.hora_salida);
    const inicioRetardo = 8 * 3600 + 60;
    const horaSalida = 16 * 3600;
    const medioDia = 12 * 3600;

    if (entrada === -1 && salida === -1) return 'Falta';
    if (entrada === -1) return 'S/E';
    if (salida === -1) return 'S/S';

    if (entrada < medioDia && salida < medioDia) return 'S/S'; 
    if (entrada >= medioDia && salida >= medioDia) return 'S/E'; 

    if (entrada >= inicioRetardo && salida < horaSalida) return 'Retardo / S. Anticipada';
    if (entrada >= inicioRetardo) return 'Retardo';
    if (salida < horaSalida) return 'Salida Anticipada';
    return 'Completo';
  }

  cerrarSesion() {
    this.router.navigate(['/login']);
  }
}
