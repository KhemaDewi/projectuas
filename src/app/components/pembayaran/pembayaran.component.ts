import { CommonModule } from '@angular/common';  // Mengimpor CommonModule agar dapat menggunakan fitur-fitur dasar Angular seperti *ngIf dan *ngFor
import { Component, OnInit, inject } from '@angular/core';  // Mengimpor dekorator Component, lifecycle hook OnInit, dan inject untuk injeksi HttpClient pada komponen standalone
import { HttpClient } from '@angular/common/http';  // Mengimpor HttpClient untuk melakukan HTTP request
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';  // Tambahkan untuk menangani formulir
import * as bootstrap from 'bootstrap';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pembayaran',  // Nama selector untuk komponen ini. Komponen akan digunakan di template dengan tag <app-fakultas></app-fakultas>
  standalone: true,  // Menyatakan bahwa komponen ini adalah komponen standalone dan tidak membutuhkan module tambahan
  imports: [CommonModule, ReactiveFormsModule, FormsModule],  // Mengimpor CommonModule untuk memungkinkan penggunaan direktif Angular standar seperti *ngIf dan *ngFor di template
  templateUrl: './pembayaran.component.html',  // Path ke file template HTML untuk komponen ini
  styleUrl: './pembayaran.component.css'  // Path ke file CSS untuk komponen ini
})
export class PembayaranComponent implements OnInit {
  pembayaran: any[] = [];
  errorMessage: string = '';
  filteredPembayaran: any[] = [];
  searchTerm: string = '';
  apiUrl = 'https://bimbel-app.vercel.app/api/pembayaran'
  isLoading = true;

  pembayaranForm: FormGroup;
  isSubmitting = false;
  userRole: string | null = null; // Peran pengguna (admin/user)

  editPembayaranId: string | null = null;
  isEditModalVisible = false;

  private fb = inject(FormBuilder);

  currentDate: string = new Date().toISOString().split('T')[0];

  constructor(private http: HttpClient) {
    this.pembayaranForm = this.fb.group({
      namaMurid: [''],
      tgl_pembayaran: [''],
      pembayaran_bln: [''],
      jml_transaksi: [''],
      no_rek: [''],
      validasi: ['BELUM'], // Set default validasi kosong
    });
  }

  ngOnInit(): void {
    this.getUserRole();
    this.getPembayaran();

  }

  getUserRole(): void {
    this.userRole = localStorage.getItem('userRole');
    console.log('User Role:', this.userRole);
  }

  getPembayaran(): void {
    const token = localStorage.getItem('authToken');
    if (!token) {
      this.errorMessage = 'Token tidak ditemukan';
      this.isLoading = false;
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    this.isLoading = true;

    this.http.get<any[]>(this.apiUrl, { headers }).subscribe({
      next: (data) => {
        console.log('Data yang diterima:', data); // Periksa struktur data

        // Pastikan setiap item memiliki properti 'nama'
        if (data && data.length > 0) {
          this.pembayaran = data.map((item) => ({
            ...item,
            validasi: item.validasi || 'BELUM',
          }));

          // Pastikan properti 'nama' ada sebelum melakukan pengurutan
          this.filteredPembayaran = [...this.pembayaran].sort((a, b) => {
            if (a.pembayaran_bln && b.pembayaran_bln) {
              return a.pembayaran_bln.localeCompare(b.pembayaran_bln);
            }
            return 0; // Jika salah satu tidak memiliki 'nama', urutkan tanpa perubahan
          });

          console.log('Data setelah pengurutan:', this.filteredPembayaran);
        } else {
          console.error('Data kosong atau tidak sesuai');
        }
      },
      error: (err) => {
        console.error('Error fetching pembayaran:', err);
        this.errorMessage = 'Gagal mengambil data pembayaran';
      },
      complete: () => {
        this.isLoading = false;
      }
    });

  }

  filterPembayaran(): void {
    const searchTermLower = this.searchTerm.toLowerCase().trim();
    this.filteredPembayaran = this.pembayaran.filter((item) => {
      if (!item.pembayaran_bln) return false;
      return item.pembayaran_bln.toLowerCase().includes(searchTermLower);
    });
  }

  getPembayaranById(_id: string): void {
    this.editPembayaranId = _id;
    const token = localStorage.getItem('authToken');
    const headers = { Authorization: `Bearer ${token}` };
    this.http.get(`${this.apiUrl}/${_id}`, { headers }).subscribe({
      next: (data: any) => {
        // Format tanggal ke YYYY-MM-DD untuk input type date
        const formattedDate = data.tgl_pembayaran ? new Date(data.tgl_pembayaran).toISOString().split('T')[0] : '';

        this.pembayaranForm.patchValue({
          namaMurid: data.namaMurid || '',
          tgl_pembayaran: formattedDate,
          pembayaran_bln: data.pembayaran_bln || '',
          jml_transaksi: data.jml_transaksi || '',
          no_rek: data.no_rek || '',
          validasi: data.validasi || '',
        });
        this.isEditModalVisible = true;
      },
      error: (err) => {
        console.error('Error fetching pembayaran by ID:', err);
      },
    });
  }

  addPembayaran(): void {
    if (this.pembayaranForm.valid) {
      this.isSubmitting = true;

      const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Bearer ${token}` };
      const formData = this.pembayaranForm.value;

      // Debugging tambahan
      console.log('Form data yang akan dikirim:', formData);

      this.http.post(this.apiUrl, formData, { headers }).subscribe({
        next: () => {
          console.log('Pembayaran berhasil ditambahkan');
          this.pembayaranForm.reset();
          this.isSubmitting = false;
          this.closeModal('tambahPembayaranModal');
          this.getPembayaran();
        },
        error: (err) => {
          console.error('Error adding pembayaran:', err);
          alert(`Gagal menambahkan pembayaran: ${err.error?.message || 'Kesalahan tidak diketahui'}`);
          this.isSubmitting = false;
        },
      });
    } else {
      alert('Form tidak valid. Pastikan semua data terisi.');
    }
  }

  updatePembayaran(): void {
    if (this.pembayaranForm.valid && this.editPembayaranId) {
      this.isSubmitting = true;
      const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Bearer ${token}` };

      const updateData = this.pembayaranForm.value;

      this.http.put(`${this.apiUrl}/${this.editPembayaranId}`, updateData, { headers }).subscribe({
        next: () => {
          this.getPembayaran();
          this.closeModal('editPembayaranModal');
          this.pembayaranForm.reset();
          this.editPembayaranId = null;
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Error updating pembayaran:', err);
          this.isSubmitting = false;
        },
      });
    }
  }

  closeModal(modalId: string): void {
    const modalElement = document.getElementById(modalId) as HTMLElement;
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
    // Tambahkan untuk membersihkan modal backdrop
    document.body.classList.remove('modal-open');
    const modalBackdrop = document.querySelector('.modal-backdrop');
    if (modalBackdrop) {
      modalBackdrop.remove();
    }
  }

  formatDate(date: string): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}

