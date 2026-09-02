import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SolicitudesService } from '../../services/solicitudes';


@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './gestion-usuarios.html',
  styleUrl: './gestion-usuarios.scss',
})
export class GestionUsuarios implements OnInit {
  solicitudes: any[] = [];
  usuariosActivos: any[] = [];

  terminoBusqueda: string = '';

  msgExito: string = '';
  msgError: string = '';
  cargando: boolean = false;

  urlUploads: string = 'http://localhost/sica/api/uploads/';

  constructor(
    private gestionService: SolicitudesService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.cargarInformacion();
  }

  cargarInformacion() {
    this.cargando = true;
    this.msgError = '';
    this.cdr.detectChanges();

    this.gestionService.obtenerDatosDashboard().subscribe({
      next: (res: any) => {
        if (res && res.status === 'success') {
          this.solicitudes = res.solicitudes || [];
          this.usuariosActivos = res.usuariosActivos || res.usuarios || [];
        } else {
          this.msgError = 'El servidor no devolvió una estructura válida.';
        }

        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.cargando = false;
        this.msgError = err.error?.message || 'No se pudo sincronizar la información con el servidor local.';
        this.cdr.detectChanges();
      }
    });
  }

  get usuariosFiltrados(): any[] {
    if (!this.terminoBusqueda.trim()) {
      return this.usuariosActivos;
    }
    return this.usuariosActivos.filter(usuario =>
      usuario.rpe?.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
      usuario.nombre?.toLowerCase().includes(this.terminoBusqueda.toLowerCase())
    );
  }

  calcularVigenciaResponsiva(fechaSubida: string): { texto: string, clase: string } {
    if (!fechaSubida) {
      return {
        texto: 'Pendiente',
        clase: 'bg-secondary-subtle text-secondary border border-secondary-subtle'
      };
    }

    const fechaAlta = new Date(fechaSubida + 'T00:00:00');
    const fechaHoy = new Date();

    const diferenciaTiempo = fechaHoy.getTime() - fechaAlta.getTime();
    const diasTranscurridos = Math.floor(diferenciaTiempo / (1000 * 60 * 60 * 24));

    if (diasTranscurridos >= 365) {
      return { texto: 'Caducada', clase: 'bg-danger text-white border border-danger fw-bold' };
    }
    else if (diasTranscurridos >= 335) {
      return { texto: 'Por Caducar', clase: 'bg-warning text-dark border border-warning fw-bold' };
    }
    // Estatus operativo óptimo
    else {
      return { texto: 'Vigente', clase: 'bg-success text-white border border-success fw-bold' };
    }
  }

cambiarEstatusActivacion(user: any) {
    this.msgExito = '';
    this.msgError = '';

    const nuevoEstatus = user.activo === 1 ? 0 : 1;
    const operacionVerbo = nuevoEstatus === 1 ? 'REHABILITAR y permitir acceso al' : 'DESHABILITAR y CONGELAR el ingreso del';

    const confirmar = confirm(`¿Está seguro de que desea ${operacionVerbo} usuario:\n"${user.nombre}"?`);

    if (confirmar) {
      this.gestionService.toggleEstatusUsuario(user.rpe, nuevoEstatus).subscribe({
        next: (res: any) => {
          this.msgExito = res.message;
          this.cargarInformacion(); 
        },
        error: (err: any) => {
          this.msgError = err.error?.message || 'Error al modificar el estado de activación en el sistema local.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  evaluarSolicitud(id: number, accion: 'aceptar' | 'rechazar') {
    this.msgExito = '';
    this.msgError = '';

    const verbo = accion === 'aceptar' ? 'AUTORIZAR y dar de ALTA' : 'RECHAZAR y ELIMINAR';
    const confirmar = confirm(`¿Está seguro de que desea ${verbo} esta solicitud de ingreso?`);

    if (confirmar) {
      this.gestionService.procesarSolicitud(id, accion).subscribe({
        next: (res: any) => {
          this.msgExito = res.message;
          this.cargarInformacion();
        },
        error: (err: any) => {
          this.msgError = err.error?.message || 'Error al procesar la solicitud en el servidor local.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  actualizarRol(id: number, nuevoRol: string) {
    this.msgExito = '';
    this.msgError = '';

    const confirmar = confirm(`¿Está seguro de que desea cambiar los privilegios de este usuario a: "${nuevoRol.toUpperCase()}"?`);

    if (confirmar) {
      this.gestionService.cambiarRolUsuario(id, nuevoRol).subscribe({
        next: (res: any) => {
          this.msgExito = res.message;
          this.cargarInformacion();
        },
        error: () => {
          this.msgError = 'No se pudo actualizar el rol en la base de datos.';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.cargarInformacion();
    }
  }

  darDeBajaUsuario(id: number, nombre: string) {
    this.msgExito = '';
    this.msgError = '';

    const confirmar = confirm(`ATENCIÓN INSTITUCIONAL\n\n¿Está seguro de que desea ELIMINAR DEFINITIVAMENTE al usuario:\n"${nombre}"?\n\nEsta acción revocará sus credenciales de forma irreversible.`);

    if (confirmar) {
      this.gestionService.eliminarUsuario(id).subscribe({
        next: (res: any) => {
          this.msgExito = res.message;
          this.cargarInformacion();
        },
        error: (err: any) => {
          this.msgError = err.error?.message || 'Error al intentar dar de baja la cuenta.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  verDocumento(nombreArchivo: string) {
    if (nombreArchivo) {
      window.open(`${this.urlUploads}${nombreArchivo}`, '_blank');
    }
  }

}
