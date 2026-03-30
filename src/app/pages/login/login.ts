import { Component } from '@angular/core';
import { Route, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {

  rpe: string = '';
  password: string = '';
  mostrarPassword: boolean = false;
  errorMensaje: string | null = null;
  cargando: boolean = false;
  currentYear: number = new Date().getFullYear();

  constructor(
    private router: Router,
    private authService: Auth
  ) { }

  togglePassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  ingresar() {
    if (!this.rpe || !this.password) return;

    this.cargando = true;
    this.errorMensaje = null;

    this.authService.login(this.rpe, this.password).subscribe({
      next: (res) => {
        if (res.success) {
          this.router.navigate(['/gestion-incidencias']);
        } else {
          this.errorMensaje = res.message || 'RPE o contraseña incorrectos.';
        }
        this.cargando = false;
      },
      error: () => {
        this.errorMensaje = 'Error al conectar con el servidor.';
        this.cargando = false;
      }
    });
  }

}
