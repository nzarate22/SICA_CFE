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
  mostrarPassword: boolean = false;

  constructor(private router: Router) { }

  togglePassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  ingresar() {
    this.router.navigate(['/gestion-incidencias']);
  }

}
