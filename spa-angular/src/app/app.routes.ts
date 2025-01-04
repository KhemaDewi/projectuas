import { Routes } from '@angular/router';
import { MuridComponent } from './components/murid/murid.component';
import { JadwalComponent } from './components/jadwal/jadwal.component';
import { JenisbimbelComponent } from './components/jenisbimbel/jenisbimbel.component';
import { GuruComponent } from './components/guru/guru.component';
import { AuthComponent } from './components/auth/auth.component';
import { AuthGuard } from './auth.guard'; // Import AuthGuard
import { PembayaranComponent } from './components/pembayaran/pembayaran.component';

export const routes: Routes = [
    { path: 'jadwal', component: JadwalComponent, canActivate: [AuthGuard], data: {roles: ['admin','user']}},
    { path: 'pembayaran', component: PembayaranComponent, canActivate: [AuthGuard], data: {roles: ['admin','user']}},
    { path: 'murid', component: MuridComponent, canActivate: [AuthGuard], data: {roles: ['admin']}},
    { path: 'jenisbimbel', component: JenisbimbelComponent, canActivate: [AuthGuard],data: {roles: ['admin']} },
    { path: 'guru', component: GuruComponent, canActivate: [AuthGuard],data: {roles: ['admin']} },
    { path: 'auth', component: AuthComponent },
    { path: '**', redirectTo: 'auth' }, // Redirect jika route tidak ditemukan
];
