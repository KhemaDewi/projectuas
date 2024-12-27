import { Routes } from '@angular/router';
import { MuridComponent } from './components/murid/murid.component';
import { JadwalComponent } from './components/jadwal/jadwal.component';
import { JenisbimbelComponent } from './components/jenisbimbel/jenisbimbel.component';
import { GuruComponent } from './components/guru/guru.component';
import { MateriComponent } from './components/materi/materi.component';
import { AuthComponent } from './components/auth/auth.component';
import { AuthGuard } from './auth.guard'; // Import AuthGuard

export const routes: Routes = [
    { path: 'jadwal', component: JadwalComponent, canActivate: [AuthGuard] },
    { path: 'materi', component: MateriComponent, canActivate: [AuthGuard] },
    { path: 'murid', component: MuridComponent, canActivate: [AuthGuard] },
    { path: 'jenisbimbel', component: JenisbimbelComponent, canActivate: [AuthGuard] },
    { path: 'guru', component: GuruComponent, canActivate: [AuthGuard] },
    { path: 'auth', component: AuthComponent },
    { path: '**', redirectTo: 'auth' }, // Redirect jika route tidak ditemukan
];
