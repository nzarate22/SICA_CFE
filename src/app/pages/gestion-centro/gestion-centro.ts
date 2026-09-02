import { Component, OnInit } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Eventos } from '../../services/eventos';
import { Subscription } from 'rxjs';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';

@Component({
  selector: 'app-gestion-centro',
  standalone: true,
  imports: [Navbar, CommonModule, FormsModule],
  templateUrl: './gestion-centro.html',
  styleUrl: './gestion-centro.scss',
})
export class GestionCentro implements OnInit {
  centroBusqueda: string = '';
  fechaInicio: string = '';
  fechaFin: string = '';
  centroConfirmado: string = '';
  fechaMinimaPermitida: string = '';
  nombreUsuarioLogueado: string = '';

  listaEventos: any[] = [];
  cargando: boolean = false;
  listaCentros: string[] = [];

  ngOnInit() {
    this.eventoService.obtenerCentros().subscribe({
      next: (res: any) => {
        this.listaCentros = res;
        console.log('Lista cargada en el componente:', this.listaCentros);
      },
      error: (err: any) => {
        console.error('Error al cargar centros:', err);
      }
    });
    //this.cargarCentros();
  }

  private busquedaActiva?: Subscription;
  private idUltimaBusqueda: number = 0;

  constructor(private router: Router, private eventoService: Eventos) {
    this.calcularFechaMinima();
    this.nombreUsuarioLogueado = localStorage.getItem('nombreAdmin') || 'Administrador';
  }

  onCentroChange() { }

  cargarCentros() {
    this.eventoService.obtenerCentros().subscribe({
      next: (centros) => this.listaCentros = centros,
      error: (e) => console.error('Error al cargar centros', e)
    });
  }

  buscar() {
    if (!this.centroBusqueda || !this.fechaInicio || !this.fechaFin) {
      alert('Por favor, ingrese el Centro de Trabajo y el rango de fechas.');
      return;
    }

    const idEstaBusqueda = Date.now();
    this.idUltimaBusqueda = idEstaBusqueda;
    this.cargando = true;

    this.busquedaActiva = this.eventoService.obtenerAsistenciasPorCentro(this.centroBusqueda, this.fechaInicio, this.fechaFin)
      .subscribe({
        next: (datos: any) => {
          if (idEstaBusqueda !== this.idUltimaBusqueda) return;
          this.procesarDatos(datos);
          this.cargando = false;
        },
        error: (e: any) => {
          console.error(e);
          this.cargando = false;
        }
      });
  }

  limpiar() {
    this.centroBusqueda = '';
    this.fechaInicio = '';
    this.fechaFin = '';
    this.listaEventos = [];
    this.centroConfirmado = '';
    this.cargando = false;
  }

  private procesarDatos(datos: any[]) {
    this.centroConfirmado = this.centroBusqueda;
    this.listaEventos = datos.map(e => ({ ...e, estatus: this.obtenerEstatus(e) }));
  }

  obtenerEstatus(evento: any): string {
    const entrada = this.horaASegundos(evento.hora_entrada);
    const salida = this.horaASegundos(evento.hora_salida);
    const inicioRetardo = 8 * 3600 + 60;
    const horaSalida = 16 * 3600;
    const unaHora = 3600;

    if (!evento.hora_entrada && !evento.hora_salida) return 'Falta';
    if (!evento.hora_entrada) return 'S/E';
    if (!evento.hora_salida) return entrada >= inicioRetardo ? 'Retardo / S/S' : 'S/S';

    if (Math.abs(salida - entrada) < unaHora) return entrada < (12 * 3600) ? 'S/S' : 'S/E';
    if (entrada >= inicioRetardo && salida < horaSalida) return 'Retardo / S. Anticipada';
    if (entrada >= inicioRetardo) return 'Retardo';
    if (salida < horaSalida) return 'Salida Anticipada';
    return 'Completo';
  }

  horaASegundos(hora: string): number {
    if (!hora) return -1;
    const partes = hora.trim().substring(0, 8).split(':');
    return parseInt(partes[0]) * 3600 + parseInt(partes[1]) * 60 + parseInt(partes[2]);
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
      doc.line(14, 30, 196, 30);

      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.setFont('helvetica', 'italic');
      doc.text(`Generado por: ${this.nombreUsuarioLogueado}`, 14, 36);

      doc.setFontSize(11);
      doc.setTextColor(0);
      doc.setFont('helvetica', 'normal');
      doc.text(`Centro de Trabajo: ${this.centroConfirmado}`, 14, 44);
      doc.text(`Periodo: ${this.fechaInicio} al ${this.fechaFin}`, 14, 51);

      autoTable(doc, {
        startY: 58,
        head: [['Colaborador', 'Fecha', 'Entrada', 'Salida', 'Estatus']],
        body: this.listaEventos.map(e => [
          e.nombre,
          e.fecha,
          e.hora_entrada ? e.hora_entrada.substring(0, 8) : '-',
          e.hora_salida ? e.hora_salida.substring(0, 8) : '-',
          e.estatus
        ]),
        headStyles: { fillColor: [0, 130, 70] },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 4) {
            data.cell.styles.textColor = data.cell.raw === 'Completo' ? [0, 150, 50] : [200, 0, 0];
          }
        }
      });

      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.setFont('helvetica', 'normal');
      const fechaHoy = new Date().toLocaleDateString('es-MX');
      const horaHoy = new Date().toLocaleTimeString('es-MX');
      doc.text(`Generado el ${fechaHoy} a las ${horaHoy}`, 14, 290);

      doc.save(`Reporte_Centro_${this.centroConfirmado}.pdf`);
    };
  }

  calcularFechaMinima() {
    const hoy = new Date();
    hoy.setMonth(hoy.getMonth() - 3);
    this.fechaMinimaPermitida = hoy.toISOString().split('T')[0];
  }

  cerrarSesion() { if (confirm('¿Cerrar sesión?')) this.router.navigate(['/login']); }
  regresar() { this.router.navigate(['/menu-principal']); }

}
