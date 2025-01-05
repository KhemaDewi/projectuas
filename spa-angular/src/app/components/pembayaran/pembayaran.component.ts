import { CommonModule } from '@angular/common';  // Mengimpor CommonModule agar dapat menggunakan fitur-fitur dasar Angular seperti *ngIf dan *ngFor
import { Component, OnInit, inject } from '@angular/core';  // Mengimpor dekorator Component, lifecycle hook OnInit, dan inject untuk injeksi HttpClient pada komponen standalone
import { HttpClient } from '@angular/common/http';  // Mengimpor HttpClient untuk melakukan HTTP request
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';  // Tambahkan untuk menangani formulir
import * as bootstrap from 'bootstrap';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pembayaran',  // Nama selector untuk komponen ini. Komponen akan digunakan di template dengan tag <app-fakultas></app-fakultas>
  standalone: true,  // Menyatakan bahwa komponen ini adalah komponen standalone dan tidak membutuhkan module tambahan
  imports: [CommonModule, ReactiveFormsModule,FormsModule],  // Mengimpor CommonModule untuk memungkinkan penggunaan direktif Angular standar seperti *ngIf dan *ngFor di template
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

  constructor(private http: HttpClient) {
    this.pembayaranForm = this.fb.group({
      namaMurid:[''],
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
    const headers = { Authorization: `Bearer ${token}` };
      this.http.get<any[]>(this.apiUrl, { headers }).subscribe({
        next: (data) => {
          this.pembayaran = data.map((item) => ({
            ...item,

            validasi: item.validasi || null, // Set nilai validasi default

          }));
          this.filteredPembayaran = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching pembayaran data (admin):', err);
          this.isLoading = false;
        },
      });
    }

  filterPembayaran(): void {
    this.filteredPembayaran = this.pembayaran.filter((item) => {
      const namaMurid = item.namaMurid || ''; // Pastikan nilai default adalah string kosong
      return namaMurid.toLowerCase().includes(this.searchTerm.toLowerCase());
    });
  }


  getPembayaranById(_id: string): void {
    this.editPembayaranId = _id;
    const token = localStorage.getItem('authToken');
    const headers = { Authorization: `Bearer ${token}` };
    this.http.get(`${this.apiUrl}/${_id}`,{headers}).subscribe({
      next: (data: any) => {
        this.pembayaranForm.patchValue({
          namaMurid: data.namaMurid || '',
          tgl_pembayaran: data.tgl_pembayaran || '',
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
      if (!formData.validasi) {
        formData.validasi = 'BELUM'; // Set default jika kosong
      }

      this.http.post(this.apiUrl, formData, { headers }).subscribe({
        next: () => {
          this.getPembayaran();
          this.pembayaranForm.reset();
          this.closeModal('tambahPembayaranModal');
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Error adding pembayaran:', err);
          this.isSubmitting = false;
        },
      });
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
      const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
      modalInstance.hide();
      if (modalInstance) {
        modalInstance.hide(); // Menutup modal
      }
    }
  }
}
