import { Component } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Eventos } from '../../services/eventos';

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

  constructor(
    private router: Router,
    private eventoService: Eventos
  ) { }

  buscar() {
    if (!this.rpeBusqueda || !this.fechaInicio || !this.fechaFin) {
      alert('Por favor, ingrese el RPE y el rango de fechas completo.');
      return;
    }

    this.cargando = true;
    this.totalRetardos = 0; 

    this.eventoService.obtenerAsistencias(this.rpeBusqueda, this.fechaInicio, this.fechaFin).subscribe({
      next: (datos) => {
        this.listaEventos = datos;
        this.cargando = false;

        if (this.listaEventos.length > 0) {
          this.nombreColaborador = this.listaEventos[0].nombre;
          this.totalRetardos = this.listaEventos.filter(evento =>
            evento.hora_entrada >= '08:01:00'
          ).length;

        } else {
          this.nombreColaborador = 'No se encontraron registros';
          this.totalRetardos = 0;
        }
      },
      error: (e) => {
        console.error('Error al conectar con el servidor de CFE:', e);
        this.cargando = false;
        this.totalRetardos = 0;
      }
    });
  }

  cerrarSesion() {
    this.router.navigate(['/login']);
  }
}
