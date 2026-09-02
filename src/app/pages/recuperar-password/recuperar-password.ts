import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-recuperar-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './recuperar-password.html',
  styleUrl: './recuperar-password.scss',
})
export class RecuperarPassword {
  datos = {
    rpe: '',
    claveActual: '',
    nuevaClave: '',
    confirmarClave: ''
  };

  verActual: boolean = false;
  verNueva: boolean = false;
  verConfirmar: boolean = false;

  mensajeError: string | null = null;
  mensajeExito: string | null = null;
  cargando: boolean = false;

  constructor(private http: HttpClient, private router: Router) { }

  get contrasenasCoinciden(): boolean {
    if (!this.datos.confirmarClave) return true;
    return this.datos.nuevaClave === this.datos.confirmarClave;
  }

  actualizarPassword() {
    this.mensajeError = null;
    this.mensajeExito = null;

    if (!this.contrasenasCoinciden) {
      this.mensajeError = "Las nuevas contraseñas no coinciden.";
      return;
    }

    this.cargando = true;
    this.http.post(`${environment.apiUrl}/update_password.php`, this.datos)
      .subscribe({
        next: (res: any) => {
          this.cargando = false;
          this.mensajeExito = "¡Contraseña actualizada correctamente!";
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: (err) => {
          this.cargando = false;
          this.mensajeError = err.error?.message || "Error en el servidor";
        }
      });
  }
}