import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { GestionIncidencias } from './pages/gestion-incidencias/gestion-incidencias';

export const routes: Routes = [
    {path: 'login', component:Login},
    {path: 'gestion-incidencias',component: GestionIncidencias},
    {path: '', redirectTo: 'login', pathMatch: 'full'}, //LA URL VACÍA MANDA AL LOGIN
    {path:'**', redirectTo: 'login'} //PARA INGRESAR A CUALQUIER OTRA PAGINA MANDA AL LOGIN(SEGURIDAD)
];
