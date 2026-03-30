import { Component } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Eventos } from '../../services/eventos';
import { Subscription } from 'rxjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  nombreColaborador: string = '';

  listaEventos: any[] = [];
  cargando: boolean = false;
  totalRetardos: number = 0;
  totalSalidasAnticipadas: number = 0;

  private busquedaActiva?: Subscription;
  private idUltimaBusqueda: number = 0;

  constructor(
    private router: Router,
    private eventoService: Eventos
  ) { }

  onRpeChange() { }
  onFechaChange() { }

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

  limpiar() {
    this.rpeBusqueda = '';
    this.fechaInicio = '';
    this.fechaFin = '';
    this.listaEventos = [];
    this.nombreColaborador = '';
    this.totalRetardos = 0;
    this.totalSalidasAnticipadas = 0;

    if (this.busquedaActiva) {
      this.busquedaActiva.unsubscribe();
      this.busquedaActiva = undefined;
    }

    this.cargando = false;
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

  generarReporte() {
    const doc = new jsPDF();
    const img = new Image();
    img.src = 'images/logo-cfe.png';

    img.onload = () => {
      doc.addImage(img, 'PNG', 155, 10, 40, 18);

      doc.setFontSize(18);
      doc.setTextColor(0, 130, 70);
      doc.text('SICA-CFE', 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Sistema de Control de Asistencias CFE', 14, 27);

      doc.setDrawColor(0, 130, 70);
      doc.setLineWidth(0.5);
      doc.line(14, 30, 196, 30);

      doc.setFontSize(11);
      doc.setTextColor(0);
      doc.text(`Colaborador: ${this.nombreColaborador}`, 14, 40);
      doc.text(`RPE: ${this.rpeBusqueda}`, 14, 47);
      doc.text(`Periodo: ${this.fechaInicio} al ${this.fechaFin}`, 14, 54);

      autoTable(doc, {
        startY: 62,
        head: [['Fecha', 'Entrada', 'Salida', 'Dispositivo', 'Estatus']],
        body: this.listaEventos.map(e => [
          e.fecha,
          e.estatus === 'S/E' ? '-' : e.hora_entrada ? e.hora_entrada.substring(0, 8) : '-',
          e.estatus === 'S/S' ? '-' : e.hora_salida ? e.hora_salida.substring(0, 8) : '-',
          e.disp ?? '-',
          e.estatus
        ]),
        headStyles: {
          fillColor: [0, 130, 70],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [240, 248, 240]
        },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 4) {
            const estatus = data.cell.raw as string;
            if (estatus === 'Completo') {
              data.cell.styles.textColor = [0, 150, 50];
            } else {
              data.cell.styles.textColor = [200, 0, 0];
            }
          }
        }
      });

      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(11);
      doc.setTextColor(0);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total de Retardos en el Periodo: ${this.totalRetardos}`, 14, finalY);
      doc.text(`Salidas Anticipadas en el Periodo: ${this.totalSalidasAnticipadas}`, 14, finalY + 8);

      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generado el ${new Date().toLocaleDateString('es-MX')} a las ${new Date().toLocaleTimeString('es-MX')}`, 14, 290);

      doc.save(`Reporte_${this.rpeBusqueda}_${this.fechaInicio}_${this.fechaFin}.pdf`);
    };
  }

  cerrarSesion() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      this.router.navigate(['/login']);
    }
  }
}
