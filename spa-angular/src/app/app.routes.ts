import { Routes } from '@angular/router';
import { MuridComponent } from './components/murid/murid.component';
import { JadwalComponent } from './components/jadwal/jadwal.component';
import { JenisbimbelComponent } from './components/jenisbimbel/jenisbimbel.component';
import { GuruComponent } from './components/guru/guru.component';

export const routes: Routes = [
    { path: '', component: JadwalComponent },
    { path: 'murid', component: MuridComponent },
    { path: 'jenisbimbel', component: JenisbimbelComponent },
    { path: 'guru', component: GuruComponent }
];
