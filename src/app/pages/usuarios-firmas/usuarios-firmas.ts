import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Eventos, Eventos as EventosService } from '../../services/eventos';

@Component({
  selector: 'app-usuarios-firmas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './usuarios-firmas.html',
  styleUrl: './usuarios-firmas.scss',
})
export class UsuariosFirmas implements OnInit {
  listaFirmantes: any[] = [];

  nuevoRpe: string = '';
  nuevoNombre: string = '';
  nuevoCargo: string = '';
  nuevoTipo: '1' | '2' | '3' | '' = '';

  msgExito: string = '';
  msgError: string = '';
  cargando: boolean = false;

  constructor(
    private eventosService: Eventos,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.cargarCatalogoFirmas();
  }

  cargarCatalogoFirmas() {
    this.cargando = true;
    this.cdr.detectChanges();

    this.eventosService.obtenerCatalogoFirmas().subscribe({
      next: (res: any) => {
        if (res && res.status === 'success') {
          this.listaFirmantes = res.firmas || [];
        } else {
          this.msgError = 'El servidor de firmas no devolvió un formato válido.';
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.cargando = false;
        this.msgError = err.error?.message || 'No se pudo conectar con la base de datos de firmas local.';
        this.cdr.detectChanges();
      }
    });
  }

  registrarNuevoFirmante() {
    if (!this.nuevoRpe || !this.nuevoNombre || !this.nuevoCargo || !this.nuevoTipo) {
      this.msgError = 'Por favor, complete todos los campos obligatorios.';
      return;
    }

    this.cargando = true;
    this.msgExito = '';
    this.msgError = '';
    this.cdr.detectChanges();


    const payload = {
      accion: 'agregar',
      rpe: this.nuevoRpe.trim().toUpperCase(),
      nombre: this.nuevoNombre.trim(),
      cargo: this.nuevoCargo.trim(),
      puesto_tipo: this.nuevoTipo.toString()
    };

    this.eventosService.agregarFirmanteCompleto(payload).subscribe({
      next: (res: any) => {
        this.cargando = false;
        this.msgExito = res.message || 'Autorizador registrado con éxito en el catálogo independiente.';

        this.limpiarFormulario();
        this.cargarCatalogoFirmas();
      },
      error: (err: any) => {
        this.cargando = false;
        console.error('Error capturado en el registro:', err);
        this.msgError = err.error?.message || 'No se pudo guardar el registro. Verifique la estructura de firmas.db';
        this.cdr.detectChanges();
      }
    });
  }

  limpiarFormulario() {
    this.nuevoRpe = '';
    this.nuevoNombre = '';
    this.nuevoCargo = '';
    this.nuevoTipo = '';
  }

  darDeBajaFirmante(id: number, nombre: string) {
    this.msgExito = '';
    this.msgError = '';

    const confirmar = confirm(`¿Está seguro de que desea eliminar a "${nombre}" del catálogo oficial de firmas?\n\nEsto provocará que ya no aparezca elegible en los formatos responsivos.`);

    if (confirmar) {
      this.eventosService.eliminarFirmante(id).subscribe({
        next: (res: any) => {
          this.msgExito = res.message || 'Registro eliminado correctamente.';
          this.cargarCatalogoFirmas();
        },
        error: (err: any) => {
          this.msgError = err.error?.message || 'Error al intentar dar de baja el firmante.';
          this.cdr.detectChanges();
        }
      });
    }
  }
}
