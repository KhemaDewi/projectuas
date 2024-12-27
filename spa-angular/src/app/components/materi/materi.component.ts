import { CommonModule } from '@angular/common'; // Mengimpor modul Angular yang menyediakan direktif umum seperti ngIf, ngFor, dll.
import { Component, OnInit, inject } from '@angular/core'; // Mengimpor decorator Component, interface OnInit untuk inisialisasi, dan inject untuk injeksi dependency.
import { HttpClient } from '@angular/common/http'; // Mengimpor HttpClient untuk melakukan HTTP request ke server.
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'; // Mengimpor modul dan class untuk membuat formulir reaktif.

@Component({
  selector: 'app-materi', // Selector untuk komponen ini digunakan dalam template HTML.
  standalone: true, // Menjadikan komponen ini sebagai standalone, tanpa bagian dari modul Angular lainnya.
  imports: [CommonModule, ReactiveFormsModule], // Mengimpor modul Angular yang dibutuhkan untuk komponen ini.
  templateUrl: './materi.component.html', // Lokasi file template HTML untuk komponen ini.
  styleUrls: ['./materi.component.css'] // Lokasi file CSS untuk komponen ini.
})
export class MateriComponent implements OnInit { // Mendeklarasikan class komponen dengan implementasi OnInit untuk inisialisasi.
  materi: any[] = []; // Menyimpan data mahasiswa.
  jenisbimbel: any[] = []; // Menyimpan data program studi untuk dropdown.
  murid: any[] =[];
  apiUrl = 'https://bimbel-app.vercel.app/api/materi'; // URL API untuk mengambil dan menambahkan data mahasiswa.
  apimuridUrl = 'https://bimbel-app.vercel.app/api/murid';
  apijenisbimbelUrl = 'https://bimbel-app.vercel.app/api/jenisBimbel'; // URL API untuk mengambil data prodi.
  isLoading = true; // Indikator loading data dari API.
  materiForm: FormGroup; // Form group untuk formulir reaktif mahasiswa.
  isSubmitting = false; // Indikator proses pengiriman data.

  private http = inject(HttpClient); // Menggunakan Angular inject API untuk menyuntikkan HttpClient.
  private fb = inject(FormBuilder); // Menyuntikkan FormBuilder untuk membangun form reaktif.

  constructor() { // Konstruktor untuk inisialisasi komponen.
    this.materiForm = this.fb.group({ // Membuat grup form dengan FormBuilder.
      namamateri:[''],
      deskripsi:[''],
      kelas: [''], // Field NPM mahasiswa.
      jenisbimbel_id: [null], // Field nama mahasiswa.
      filemateri: [''],
    });
  }

  ngOnInit(): void { // Lifecycle method Angular, dipanggil saat komponen diinisialisasi.
    this.getMateri(); // Memanggil fungsi untuk mengambil data mahasiswa.
    this.getJenisbimbel(); // Memanggil fungsi untuk mengambil data program studi.
    this.getMurid();
  }

  // Mengambil data mahasiswa
  getMateri(): void {
    const token = localStorage.getItem('authToken');
    const headers = { Authorization: `Bearer ${token}` };
    this.http.get<any[]>(this.apiUrl,{headers}).subscribe({
      next: (data) => {
        this.materi = data; // Menyimpan data mahasiswa ke variabel.
        this.isLoading = false; // Menonaktifkan indikator loading.
      },
      error: (err) => {
        console.error('Error fetching materi data:', err);
        this.isLoading = false; // Menonaktifkan indikator loading.
      },
    });
  }

  // Mengambil data program studi untuk dropdown
  getJenisbimbel(): void {
    const token = localStorage.getItem('authToken');
    const headers = { Authorization: `Bearer ${token}` };
    this.http.get<any[]>(this.apijenisbimbelUrl,{headers}).subscribe({
      next: (data) => {
        this.jenisbimbel = data; // Menyimpan data program studi ke variabel.
      },
      error: (err) => {
        console.error('Error fetching jenis bimbel data:', err);
      },
    });
  }

  getMurid(): void {
    const token = localStorage.getItem('authToken');
    const headers = { Authorization: `Bearer ${token}` };
    this.http.get<any[]>(this.apimuridUrl,{headers}).subscribe({
      next: (data) => {
        this.murid = data; // Menyimpan data mahasiswa ke variabel.
        this.isLoading = false; // Menonaktifkan indikator loading.
      },
      error: (err) => {
        console.error('Error fetching murid data:', err);
        this.isLoading = false; // Menonaktifkan indikator loading.
      },
    });
  }

  // Method untuk menambahkan mahasiswa
  addMateri(): void {
    if (this.materiForm.valid) {
      this.isSubmitting = true; // Mengaktifkan indikator pengiriman data.
      const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Bearer ${token}` };

      this.http.post(this.apiUrl, this.materiForm.value,{headers}).subscribe({
        next: (response) => {
          console.log('Mahasiswa berhasil ditambahkan:', response);
          this.getMateri(); // Refresh data mahasiswa setelah penambahan.
          this.materiForm.reset(); // Reset form setelah data dikirim.
          this.isSubmitting = false; // Menonaktifkan indikator pengiriman.
        },
        error: (err) => {
          console.error('Error menambahkan materi:', err);
          this.isSubmitting = false; // Menonaktifkan indikator pengiriman.
        },
      });
    }
  }

  // Method untuk menghapus mahasiswa
  deleteMateri(_id: string): void {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Bearer ${token}` };

      this.http.delete(`${this.apiUrl}/${_id}`,{headers}).subscribe({
        next: () => {
          console.log(`Mahasiswa dengan ID ${_id} berhasil dihapus`);
          this.getMateri(); // Refresh data mahasiswa setelah penghapusan.
        },
        error: (err) => {
          console.error('Error menghapus materi:', err);
        }
      });
    }
  }

  editMateriId: string | null = null;
  isEditModalVisible = false;

  getMateriById(_id: string): void {
    console.log('Fetching Materi with ID:', _id);
    this.editMateriId = _id;
    const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Bearer ${token}` };
    this.http.get(`${this.apiUrl}/${_id}`,{headers}).subscribe({
      next: (data: any) => {
        console.log('Materi data fetched:', data);
        this.materiForm.patchValue({
          namamateri: data.namamateri || '',
          deskripsi: data.deskripsi || '',
          kelas: data.kelas || '',
          jenisbimbel_id: data.jenisbimbel_id ||null,
          linkurl: data.linkurl || '',
        });
        this.isEditModalVisible = true;
      },
      error: (err) => {
        console.error('Error fetching Materi by ID:', err);
      },
    });
  }

  updateMateri(): void {
    if (this.materiForm.valid && this.editMateriId) {
      this.isSubmitting = true; // Aktifkan indikator pengiriman data
      const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Bearer ${token}` };

      this.http.put(`${this.apiUrl}/${this.editMateriId}`, this.materiForm.value,{headers}).subscribe({
        next: (response) => {
          console.log('Materi berhasil diperbarui:', response);
          this.getMateri(); // Refresh data mahasiswa
          this.isSubmitting = false;

          // Tutup modal edit
          const modalElement = document.getElementById('editMateriModal') as HTMLElement;
          if (modalElement) {
            // const modalInstance = bootstrap.Modal.getInstance(modalElement);
            // modalInstance?.hide();
          }
        },
        error: (err) => {
          console.error('Error updating materi:', err);
          this.isSubmitting = false; // Nonaktifkan indikator pengiriman data
        },
      });
    }
  }
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const maxSizeInMB = 100; // Match server limit
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

      if (file.size > maxSizeInBytes) {
        alert(`Ukuran file terlalu besar. Maksimal ${maxSizeInMB} MB.`);
        input.value = '';
        return;
      }

      // Set file directly instead of data URL
      this.materiForm.patchValue({ filemateri: file });
    }
}};
