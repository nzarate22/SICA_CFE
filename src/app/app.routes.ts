import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { GestionIncidencias } from './pages/gestion-incidencias/gestion-incidencias';
import { MenuPrincipal } from './pages/menu-principal/menu-principal';
import { GestionCentro } from './pages/gestion-centro/gestion-centro';
import { RecuperarPassword } from './pages/recuperar-password/recuperar-password';
import { SolicitarIngreso } from './pages/solicitar-ingreso/solicitar-ingreso';
import { GestionUsuarios } from './pages/gestion-usuarios/gestion-usuarios';
import { SubirConstancia } from './pages/subir-constancia/subir-constancia';
import { UsuariosFirmas } from './pages/usuarios-firmas/usuarios-firmas';

export const routes: Routes = [
    {path: 'login', component:Login},
    {path: 'menu-principal', component: MenuPrincipal },
    {path: 'gestion-incidencias',component: GestionIncidencias},
    {path: 'gestion-centro', component: GestionCentro },
    {path: 'recuperar-password', component: RecuperarPassword },
    {path: 'solicitar-ingreso', component: SolicitarIngreso},
    {path: 'gestion-usuarios', component: GestionUsuarios},
    {path: 'subir-constancia', component: SubirConstancia},
    {path: 'usuarios-firmas', component: UsuariosFirmas},
    {path: '', redirectTo: 'login', pathMatch: 'full'}, //LA URL VACÍA MANDA AL LOGIN
    {path:'**', redirectTo: 'login'} //PARA INGRESAR A CUALQUIER OTRA PAGINA MANDA AL LOGIN
];
