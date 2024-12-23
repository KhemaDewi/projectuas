import { CommonModule } from '@angular/common';  // Mengimpor CommonModule agar dapat menggunakan fitur-fitur dasar Angular seperti *ngIf dan *ngFor
import { Component, OnInit, inject } from '@angular/core';  // Mengimpor dekorator Component, lifecycle hook OnInit, dan inject untuk injeksi HttpClient pada komponen standalone
import { HttpClient } from '@angular/common/http';  // Mengimpor HttpClient untuk melakukan HTTP request
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';  // Tambahkan untuk menangani formulir
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-jadwal',  // Nama selector untuk komponen ini. Komponen akan digunakan di template dengan tag <app-fakultas></app-fakultas>
  standalone: true,  // Menyatakan bahwa komponen ini adalah komponen standalone dan tidak membutuhkan module tambahan
  imports: [CommonModule, ReactiveFormsModule],  // Mengimpor CommonModule untuk memungkinkan penggunaan direktif Angular standar seperti *ngIf dan *ngFor di template
  templateUrl: './jadwal.component.html',  // Path ke file template HTML untuk komponen ini
  styleUrl: './jadwal.component.css'  // Path ke file CSS untuk komponen ini
})
export class JadwalComponent implements OnInit {  // Deklarasi komponen dengan mengimplementasikan lifecycle hook OnInit
  jadwal: any[] = [];  // Mendeklarasikan properti fakultas yang akan menyimpan data yang diterima dari API
  apiUrl = 'https://bimbel-app.vercel.app/api/jadwal';  // URL API yang digunakan untuk mendapatkan data fakultas
  isLoading = true;  // Properti untuk status loading, digunakan untuk menunjukkan loader saat data sedang diambil

  jadwalForm: FormGroup;  // Tambahkan untuk mengelola data formulir
  isSubmitting = false;  // Status untuk mencegah double submit

  private http = inject(HttpClient);  // Menggunakan inject untuk mendapatkan instance HttpClient di dalam komponen standalone (untuk Angular versi terbaru yang mendukung pendekatan ini)

  private fb = inject(FormBuilder);  // Inject FormBuilder untuk membuat FormGroup

  constructor() {
    // Inisialisasi form dengan kontrol nama dan singkatan
    this.jadwalForm = this.fb.group({
      hari: [''],
      jam: [''],
      jenisbimbel_id:[''],
      ruangkelas:[''],
      guru_id:['']
    });
  }

  ngOnInit(): void {  // Lifecycle hook ngOnInit dipanggil saat komponen diinisialisasi
    this.getJadwal();  // Memanggil method getFakultas saat komponen diinisialisasi
  }

  getJadwal(): void {  // Method untuk mengambil data fakultas dari API
    // Mengambil data dari API menggunakan HttpClient
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {  // Callback untuk menangani data yang diterima dari API
        this.jadwal = data;  // Menyimpan data yang diterima ke dalam properti fakultas
        console.log('Data Jadwal:', this.jadwal);  // Mencetak data fakultas di console untuk debugging
        this.isLoading = false;  // Mengubah status loading menjadi false, yang akan menghentikan tampilan loader
      },
      error: (err) => {  // Callback untuk menangani jika terjadi error saat mengambil data
        console.error('Error fetching jadwal data:', err);  // Mencetak error di console untuk debugging
        this.isLoading = false;  // Tetap mengubah status loading menjadi false meskipun terjadi error, untuk menghentikan loader
      },
    });
  }

  // Method untuk menambahkan fakultas
  addJadwal(): void {
    if (this.jadwalForm.valid) {
      this.isSubmitting = true;  // Set status submitting
      this.http.post(this.apiUrl, this.jadwalForm.value).subscribe({
        next: (response) => {
          console.log('Data berhasil ditambahkan:', response);
          this.getJadwal();  // Refresh data fakultas
          this.jadwalForm.reset();  // Reset formulir
          this.isSubmitting = false;  // Reset status submitting

          // Tutup modal setelah data berhasil ditambahkan
          const modalElement = document.getElementById('tambahJadwalModal') as HTMLElement;
          if (modalElement) {
            const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
            modalInstance.hide();

            // Pastikan untuk menghapus atribut dan gaya pada body setelah modal ditutup
            modalElement.addEventListener('hidden.bs.modal', () => {
              const backdrop = document.querySelector('.modal-backdrop');
              if (backdrop) {
                backdrop.remove();
              }

              // Pulihkan scroll pada body
              document.body.classList.remove('modal-open');
              document.body.style.overflow = '';
              document.body.style.paddingRight = '';
            }, { once: true }); // Hanya jalankan sekali untuk setiap instance modal
          }
        },
        error: (err) => {
          console.error('Error menambahkan Jadwal:', err);
          this.isSubmitting = false;
        },
      });
    }
  }
}
