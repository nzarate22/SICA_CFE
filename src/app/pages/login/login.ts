import { Component } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { Route, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {

  rpe: string = '';
  password: string = '';

  mostrarPassword: boolean = false;
  errorMensaje: string | null = null;

  constructor(private router: Router) { }

  togglePassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  ingresar() {
    const USUARIO_VALIDO = '9XXXX';
    const PASSWORD_VALIDO = 'cfe2026';

    if (this.rpe === USUARIO_VALIDO && this.password === PASSWORD_VALIDO) {
      this.errorMensaje = null;
      this.router.navigate(['/gestion-incidencias']);
    } else {
      this.errorMensaje = 'RPE o contraseña incorrectos. Por favor, inténtalo de nuevo.';
    }

  }

}
