import { Routes } from '@angular/router';
import { MuridComponent } from './components/murid/murid.component';
import { JadwalComponent } from './components/jadwal/jadwal.component';
import { JenisbimbelComponent } from './components/jenisbimbel/jenisbimbel.component';
import { GuruComponent } from './components/guru/guru.component';
import { MateriComponent } from './components/materi/materi.component';

export const routes: Routes = [
    { path: 'jadwal', component: JadwalComponent },
    { path: 'materi', component: MateriComponent },
    { path: 'murid', component: MuridComponent },
    { path: 'jenisbimbel', component: JenisbimbelComponent },
    { path: 'guru', component: GuruComponent }

];
