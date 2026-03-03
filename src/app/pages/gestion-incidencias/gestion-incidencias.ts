import { Component } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gestion-incidencias',
  standalone: true,
  imports: [Navbar],
  templateUrl: './gestion-incidencias.html',
  styleUrl: './gestion-incidencias.scss',
})
export class GestionIncidencias {
  constructor(private router: Router) { }

  cerrarSesion() {
    this.router.navigate(['/login']);
  }
}
