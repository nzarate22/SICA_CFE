import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-menu-principal',
  standalone: true,
  imports: [CommonModule, Navbar, RouterModule],
  templateUrl: './menu-principal.html',
  styleUrl: './menu-principal.scss',
})
export class MenuPrincipal implements OnInit {
  nombreUsuarioLogueado: string = '';
  rolUsuario: string = '';

  constructor(private router: Router) { }

  ngOnInit() {
    this.nombreUsuarioLogueado = localStorage.getItem('nombreAdmin') || 'Administrador';

    this.rolUsuario = localStorage.getItem('rolUsuario') || 'usuario';
  }

  irAModo(modo: string) {
    if (modo === 'individual') {
      this.router.navigate(['/gestion-incidencias']);
    } else {
      this.router.navigate(['/gestion-centro']);
    }

  }

  irAGestion() {
    this.router.navigate(['/gestion-usuarios']);
  }

  irAFrimas() {
    this.router.navigate(['/usuarios-firmas']);
  }

  cerrarSesion() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      localStorage.removeItem('nombreAdmin');
      localStorage.removeItem('rolUsuario');
      this.router.navigate(['/login']);
    }
  }

}
