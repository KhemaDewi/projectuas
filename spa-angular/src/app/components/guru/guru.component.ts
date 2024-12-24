import { CommonModule } from '@angular/common';  // Mengimpor CommonModule agar dapat menggunakan fitur-fitur dasar Angular seperti *ngIf dan *ngFor
import { Component, OnInit, inject } from '@angular/core';  // Mengimpor dekorator Component, lifecycle hook OnInit, dan inject untuk injeksi HttpClient pada komponen standalone
import { HttpClient } from '@angular/common/http';  // Mengimpor HttpClient untuk melakukan HTTP request
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';  // Tambahkan untuk menangani formulir
import * as bootstrap from 'bootstrap';
import { NgxPaginationModule } from 'ngx-pagination'; // Impor modul ngx-pagination

@Component({
  selector: 'app-guru',  // Nama selector untuk komponen ini. Komponen akan digunakan di template dengan tag <app-fakultas></app-fakultas>
  standalone: true,  // Menyatakan bahwa komponen ini adalah komponen standalone dan tidak membutuhkan module tambahan
  imports: [CommonModule, ReactiveFormsModule, NgxPaginationModule],  // Mengimpor CommonModule untuk memungkinkan penggunaan direktif Angular standar seperti *ngIf dan *ngFor di template
  templateUrl: './guru.component.html',  // Path ke file template HTML untuk komponen ini
  styleUrl: './guru.component.css'  // Path ke file CSS untuk komponen ini
})
export class GuruComponent implements OnInit {  // Deklarasi komponen dengan mengimplementasikan lifecycle hook OnInit
  guru: any[] = [];  // Mendeklarasikan properti fakultas yang akan menyimpan data yang diterima dari API
  jenisbimbel: any[] = []; // Menyimpan data fakultas untuk dropdown.
  currentPage = 1;
  itemsPerPage = 7;

  apiUrl = 'https://bimbel-app.vercel.app/api/guru';  // URL API yang digunakan untuk mendapatkan data fakultas
  apijenisbimbelUrl = 'https://bimbel-app.vercel.app/api/jenisBimbel'; // URL API untuk mengambil data fakultas.
  isLoading = true;  // Properti untuk status loading, digunakan untuk menunjukkan loader saat data sedang diambil

  guruForm: FormGroup;  // Tambahkan untuk mengelola data formulir
  isSubmitting = false;  // Status untuk mencegah double submit

  private http = inject(HttpClient);  // Menggunakan inject untuk mendapatkan instance HttpClient di dalam komponen standalone (untuk Angular versi terbaru yang mendukung pendekatan ini)

  private fb = inject(FormBuilder);  // Inject FormBuilder untuk membuat FormGroup

  constructor() {
    // Inisialisasi form dengan kontrol nama dan singkatan
    this.guruForm = this.fb.group({
      nama: [''],
      alamat: [''],
      no_hp: [''],
      jenisbimbel_id: [null]
    });
  }

  ngOnInit(): void {  // Lifecycle hook ngOnInit dipanggil saat komponen diinisialisasi
    this.getGuru();  // Memanggil method getFakultas saat komponen diinisialisasi
    this.getJenisbimbel();
  }

  getGuru(): void {  // Method untuk mengambil data fakultas dari API
    // Mengambil data dari API menggunakan HttpClient
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {  // Callback untuk menangani data yang diterima dari API
        this.guru = data;  // Menyimpan data yang diterima ke dalam properti fakultas
        console.log('Data Guru:', this.guru);  // Mencetak data fakultas di console untuk debugging
        this.isLoading = false;  // Mengubah status loading menjadi false, yang akan menghentikan tampilan loader
      },
      error: (err) => {  // Callback untuk menangani jika terjadi error saat mengambil data
        console.error('Error fetching guru data:', err);  // Mencetak error di console untuk debugging
        this.isLoading = false;  // Tetap mengubah status loading menjadi false meskipun terjadi error, untuk menghentikan loader
      },
    });
  }

  // Mengambil data fakultas untuk dropdown
  getJenisbimbel(): void {
    this.http.get<any[]>(this.apijenisbimbelUrl).subscribe({ // Melakukan HTTP GET ke API fakultas.
      next: (data) => { // Callback jika request berhasil.
        this.jenisbimbel = data; // Menyimpan data fakultas ke variabel.
      },
      error: (err) => { // Callback jika request gagal.
        console.error('Error fetching jenis bimbel data:', err); // Log error ke konsol.
      },
    });
  }

  // Method untuk menambahkan fakultas
  addGuru(): void {
    if (this.guruForm.valid) {
      this.isSubmitting = true;  // Set status submitting
      this.http.post(this.apiUrl, this.guruForm.value).subscribe({
        next: (response) => {
          console.log('Data berhasil ditambahkan:', response);
          this.getGuru();  // Refresh data fakultas
          this.guruForm.reset();  // Reset formulir
          this.isSubmitting = false;  // Reset status submitting

          // Tutup modal setelah data berhasil ditambahkan
          const modalElement = document.getElementById('tambahGuruModal') as HTMLElement;
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
          console.error('Error menambahkan Guru:', err);
          this.isSubmitting = false;
        },
      });
    }
  }

  editGuruId: string | null = null;
  isEditModalVisible = false;
  getGuruById(_id: string): void {
    this.editGuruId = _id;
    this.http.get(`${this.apiUrl}/${_id}`).subscribe({
      next: (data: any) => {
        this.guruForm.patchValue({
          nama: data.nama || '',
          alamat: data.alamat || '',
          kelas: data.kelas || '',
          no_hp: data.no_hp || '',
          jenibimbel_id: data.jenibimbel_id || '',
        });
        this.isEditModalVisible = true; // Tampilkan modal edit
      },
      error: (err) => {
        console.error('Error fetching guru by ID:', err);
      },
    });
  }

  // Method untuk memperbarui data Fakultas
  updateguru(): void {
    if (this.guruForm.valid && this.editGuruId) {
      this.isSubmitting = true;
      this.http.put(`${this.apiUrl}/${this.editGuruId}`, this.guruForm.value).subscribe({
        next: (response) => {
          console.log('Guru berhasil diperbarui:', response);
          this.getGuru();
          this.isSubmitting = false;
          this.isEditModalVisible = false; // Tutup modal
        },
        error: (err) => {
          console.error('Error updating guru:', err);
          this.isSubmitting = false;
        },
      });
    }
  }

  // Method untuk menghapus data Fakultas
  deleteGuru(_id: string): void {
    if (confirm('Apakah Anda yakin ingin menghapus Guru ini?')) {
      this.http.delete(`${this.apiUrl}/${_id}`).subscribe({
        next: () => {
          console.log(`Guru dengan ID ${_id} berhasil dihapus`);
          this.getGuru(); // Refresh data Fakultas setelah penghapusan
        },
        error: (err) => {
          console.error('Error menghapus guru:', err);
        },
      });
    }
  }
}

