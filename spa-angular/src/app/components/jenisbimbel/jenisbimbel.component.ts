import { CommonModule } from '@angular/common';  // Mengimpor CommonModule agar dapat menggunakan fitur-fitur dasar Angular seperti *ngIf dan *ngFor
import { Component, OnInit, inject } from '@angular/core';  // Mengimpor dekorator Component, lifecycle hook OnInit, dan inject untuk injeksi HttpClient pada komponen standalone
import { HttpClient } from '@angular/common/http';  // Mengimpor HttpClient untuk melakukan HTTP request
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';  // Tambahkan untuk menangani formulir
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-jenisbimbel',  // Nama selector untuk komponen ini. Komponen akan digunakan di template dengan tag <app-fakultas></app-fakultas>
  standalone: true,  // Menyatakan bahwa komponen ini adalah komponen standalone dan tidak membutuhkan module tambahan
  imports: [CommonModule, ReactiveFormsModule],  // Mengimpor CommonModule untuk memungkinkan penggunaan direktif Angular standar seperti *ngIf dan *ngFor di template
  templateUrl: './jenisbimbel.component.html',  // Path ke file template HTML untuk komponen ini
  styleUrl: './jenisbimbel.component.css'  // Path ke file CSS untuk komponen ini
})
export class JenisbimbelComponent implements OnInit {  // Deklarasi komponen dengan mengimplementasikan lifecycle hook OnInit
  jenisbimbel: any[] = [];  // Mendeklarasikan properti fakultas yang akan menyimpan data yang diterima dari API
  apiUrl = 'https://bimbel-app.vercel.app/api/jenisBimbel';  // URL API yang digunakan untuk mendapatkan data fakultas
  isLoading = true;  // Properti untuk status loading, digunakan untuk menunjukkan loader saat data sedang diambil

  jenisbimbelForm: FormGroup;  // Tambahkan untuk mengelola data formulir
  isSubmitting = false;  // Status untuk mencegah double submit

  private http = inject(HttpClient);  // Menggunakan inject untuk mendapatkan instance HttpClient di dalam komponen standalone (untuk Angular versi terbaru yang mendukung pendekatan ini)

  private fb = inject(FormBuilder);  // Inject FormBuilder untuk membuat FormGroup

  constructor() {
    // Inisialisasi form dengan kontrol nama dan singkatan
    this.jenisbimbelForm = this.fb.group({
      nama: [''],
      singkatan: [''],
      harga: ['']
    });
  }

  ngOnInit(): void {  // Lifecycle hook ngOnInit dipanggil saat komponen diinisialisasi
    this.getJenisbimbel();  // Memanggil method getFakultas saat komponen diinisialisasi
  }

  getJenisbimbel(): void {  // Method untuk mengambil data fakultas dari API
    // Mengambil data dari API menggunakan HttpClient
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {  // Callback untuk menangani data yang diterima dari API
        this.jenisbimbel = data;  // Menyimpan data yang diterima ke dalam properti fakultas
        console.log('Data Jenis Bimbel:', this.jenisbimbel);  // Mencetak data fakultas di console untuk debugging
        this.isLoading = false;  // Mengubah status loading menjadi false, yang akan menghentikan tampilan loader
      },
      error: (err) => {  // Callback untuk menangani jika terjadi error saat mengambil data
        console.error('Error fetching fakultas data:', err);  // Mencetak error di console untuk debugging
        this.isLoading = false;  // Tetap mengubah status loading menjadi false meskipun terjadi error, untuk menghentikan loader
      },
    });
  }

  // Method untuk menambahkan fakultas
  addJenisbimbel(): void {
    if (this.jenisbimbelForm.valid) {
      this.isSubmitting = true;  // Set status submitting
      this.http.post(this.apiUrl, this.jenisbimbelForm.value).subscribe({
        next: (response) => {
          console.log('Data berhasil ditambahkan:', response);
          this.getJenisbimbel();  // Refresh data fakultas
          this.jenisbimbelForm.reset();  // Reset formulir
          this.isSubmitting = false;  // Reset status submitting

          // Tutup modal setelah data berhasil ditambahkan
          const modalElement = document.getElementById('tambahJenisbimbelModal') as HTMLElement;
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
          console.error('Error menambahkan jenis bimbel:', err);
          this.isSubmitting = false;
        },
      });
    }
  }

  editJenisbimbelId: string | null = null;
  isEditModalVisible = false;
  getJenisbimbelById(_id: string): void {
    this.editJenisbimbelId = _id;
    this.http.get(`${this.apiUrl}/${_id}`).subscribe({
      next: (data: any) => {
        this.jenisbimbelForm.patchValue({
          nama: data.nama || '',
          singkatan: data.singkatan || '',
          harga: data.harga || '',
        });
        this.isEditModalVisible = true; // Tampilkan modal edit
      },
      error: (err) => {
        console.error('Error fetching jenisbimbel by ID:', err);
      },
    });
  }

  // Method untuk memperbarui data Fakultas
updateJenisbimbel(): void {
    if (this.jenisbimbelForm.valid && this.editJenisbimbelId ) {
      this.isSubmitting = true;
      this.http.put(`${this.apiUrl}/${this.editJenisbimbelId}`, this.jenisbimbelForm.value).subscribe({
        next: (response) => {
          console.log('Jenisbimbel berhasil diperbarui:', response);
          this.getJenisbimbel(); // Refresh data prodi
          this.isSubmitting = false;
          this.isEditModalVisible = false;

          // Tutup modal edit setelah data berhasil diupdate
          const modalElement = document.getElementById('editJenisbimbelModal') as HTMLElement;
          if (modalElement) {
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance?.hide();
          }
        },
        error: (err) => {
          console.error('Error updating jenisbimbel:', err);
          this.isSubmitting = false;
        },
      });
    }
  }
}
