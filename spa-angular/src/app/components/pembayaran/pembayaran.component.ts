import { CommonModule } from '@angular/common';  // Mengimpor CommonModule agar dapat menggunakan fitur-fitur dasar Angular seperti *ngIf dan *ngFor
import { Component, OnInit, inject } from '@angular/core';  // Mengimpor dekorator Component, lifecycle hook OnInit, dan inject untuk injeksi HttpClient pada komponen standalone
import { HttpClient } from '@angular/common/http';  // Mengimpor HttpClient untuk melakukan HTTP request
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';  // Tambahkan untuk menangani formulir
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-pembayaran',  // Nama selector untuk komponen ini. Komponen akan digunakan di template dengan tag <app-fakultas></app-fakultas>
  standalone: true,  // Menyatakan bahwa komponen ini adalah komponen standalone dan tidak membutuhkan module tambahan
  imports: [CommonModule, ReactiveFormsModule],  // Mengimpor CommonModule untuk memungkinkan penggunaan direktif Angular standar seperti *ngIf dan *ngFor di template
  templateUrl: './pembayaran.component.html',  // Path ke file template HTML untuk komponen ini
  styleUrl: './pembayaran.component.css'  // Path ke file CSS untuk komponen ini
})
export class PembayaranComponent implements OnInit {  // Deklarasi komponen dengan mengimplementasikan lifecycle hook OnInit
  pembayaran: any[] = [];  // Mendeklarasikan properti fakultas yang akan menyimpan data yang diterima dari API
  errorMessage: string='';
  apiUrl = 'https://bimbel-app.vercel.app/api/pembayaran';  // URL API yang digunakan untuk mendapatkan data fakultas
  isLoading = true;  // Properti untuk status loading, digunakan untuk menunjukkan loader saat data sedang diambil

  pembayaranForm: FormGroup;  // Tambahkan untuk mengelola data formulir
  isSubmitting = false;  // Status untuk mencegah double submit

  // private http = inject(HttpClient);  // Menggunakan inject untuk mendapatkan instance HttpClient di dalam komponen standalone (untuk Angular versi terbaru yang mendukung pendekatan ini)
  private fb = inject(FormBuilder);  // Inject FormBuilder untuk membuat FormGroup

  constructor(private http: HttpClient) {
    // Inisialisasi form dengan kontrol nama dan singkatan
    this.pembayaranForm = this.fb.group({
      tgl_pembayaran: [''],
      pembayaran_bln: [''],
      jml_transaksi: [''],
      no_rek: [''],
      validasi: ['Y']
    });
  }

  ngOnInit(): void {  // Lifecycle hook ngOnInit dipanggil saat komponen diinisialisasi
    this.getPembayaran();  // Memanggil method getFakultas saat komponen diinisialisasi
  }

  getPembayaran(): void {  // Method untuk mengambil data fakultas dari API
    // Mengambil data dari API menggunakan HttpClient

    const token = localStorage.getItem('authToken');
    const headers = { Authorization: `Bearer ${token}` };
    this.http.get<any[]>(this.apiUrl, { headers }).subscribe({
      next: (data) => {  // Callback untuk menangani data yang diterima dari API
        this.pembayaran = data;  // Menyimpan data yang diterima ke dalam properti fakultas
        console.log('Data Pembayaran:', this.pembayaran);  // Mencetak data fakultas di console untuk debugging
        this.isLoading = false;  // Mengubah status loading menjadi false, yang akan menghentikan tampilan loader
      },
      error: (err) => {  // Callback untuk menangani jika terjadi error saat mengambil data
        console.error('Error fetching pembayaran data:', err);  // Mencetak error di console untuk debugging
        this.isLoading = false;  // Tetap mengubah status loading menjadi false meskipun terjadi error, untuk menghentikan loader
      },
    });
  }

  // Method untuk menambahkan fakultas
  addPembayaran(): void {
    if (this.pembayaranForm.valid) {
      this.isSubmitting = true;  // Set status submitting
      const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Bearer ${token}` };

      this.http.post(this.apiUrl, this.pembayaranForm.value, { headers }).subscribe({
        next: (response) => {
          console.log('Data berhasil ditambahkan:', response);
          this.getPembayaran();  // Refresh data fakultas
          this.pembayaranForm.reset();  // Reset formulir
          this.isSubmitting = false;  // Reset status submitting

          // Tutup modal setelah data berhasil ditambahkan
          const modalElement = document.getElementById('tambahPembayaranModal') as HTMLElement;
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
          console.error('Error menambahkan pembayaran:', err);
          this.isSubmitting = false;
        },
      });
    }
  }

  editPembayaranId: string | null = null;
  isEditModalVisible = false;
  getPembayaranById(_id: string): void {
    this.editPembayaranId = _id;
    const token = localStorage.getItem('authToken');
    const headers = { Authorization: `Bearer ${token}` };

    this.http.get(`${this.apiUrl}/${_id}`, { headers }).subscribe({
      next: (data: any) => {
        this.pembayaranForm.patchValue({
          tgl_pembayaran: data.tgl_pembayaran || '',
          pembayaran_bln: data.pembayaran_bln || '',
          jml_transaksi: data.jml_transaksi || '',
          no_rek: data.no_rek || '',
          validasi: data.validasi || 'L',
        });
        this.isEditModalVisible = true; // Tampilkan modal edit
      },
      error: (err) => {
        console.error('Error fetching pembayaran by ID:', err);
      },
    });
  }

  // Method untuk memperbarui data Fakultas
  updatePembayaran(): void {
    if (this.pembayaranForm.valid && this.editPembayaranId) {
      this.isSubmitting = true;
      // Tutup modal edit setelah data berhasil diupdate
      // const modalElement = document.getElementById('editJenisbimbelModal') as HTMLElement;
      //if (modalElement) {
      // const modalInstance = bootstrap.Modal.getInstance(modalElement);
      // modalInstance?.hide();
      // }

      const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Bearer ${token}` };

      const updateData = {
        tgl_pembayaran: this.pembayaranForm.value.tgl_pembayaran,
        pembayaran_bln: this.pembayaranForm.value.pembayaran_bln,
        jml_transaksi: this.pembayaranForm.value.jml_transaksi,
        no_rek: this.pembayaranForm.value.no_rek,
        validasi: this.pembayaranForm.value.validasi
      };

      this.http.put(`${this.apiUrl}/${this.editPembayaranId}`, updateData, { headers }).subscribe({
        next: (response) => {
          console.log('Pembayaran updated successfully:', response);
          this.getPembayaran(); // Refresh data
          this.isSubmitting = false;

          // Tutup modal
          const modalElement = document.getElementById('editPembayaranModal');
          if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
              modal.hide();

              // Cleanup modal
              modalElement.addEventListener('hidden.bs.modal', () => {
                document.body.classList.remove('modal-open');
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) backdrop.remove();
                document.body.style.removeProperty('padding-right');
                document.body.style.removeProperty('overflow');
              }, { once: true });
            }
          }

          // Reset form dan ID
          this.pembayaranForm.reset();
          this.editPembayaranId = null;
        },
        error: (err) => {
          console.error('Error updating pembayaran:', err);
          this.isSubmitting = false;
        }
      });
    }
  }
}
