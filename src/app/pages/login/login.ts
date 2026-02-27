import { Component } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [Navbar],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  constructor(private router: Router) { }

  ingresar() {
    this.router.navigate(['/gestion-incidencias']);
  }

}
