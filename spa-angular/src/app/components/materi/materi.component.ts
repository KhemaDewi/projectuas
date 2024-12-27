import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-materi',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './materi.component.html',
  styleUrls: ['./materi.component.css']
})
export class MateriComponent implements OnInit {
  materi: any[] = [];
  jenisbimbel: any[] = [];
  murid: any[] = [];
  apiUrl = 'https://bimbel-app.vercel.app/api/materi';
  apimuridUrl = 'https://bimbel-app.vercel.app/api/murid';
  apijenisbimbelUrl = 'https://bimbel-app.vercel.app/api/jenisBimbel';
  isLoading = true;
  materiForm: FormGroup;
  isSubmitting = false;
  editMateriId: string | null = null;
  isEditModalVisible = false;

  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  constructor() {
    this.materiForm = this.fb.group({
      namamateri: ['', Validators.required],
      deskripsi: ['', Validators.required],
      kelas: ['', Validators.required],
      jenisbimbel_id: [null, Validators.required],
      filemateri: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.getMateri();
    this.getJenisbimbel();
    this.getMurid();
  }

  // Mengambil data materi
  getMateri(): void {
    const token = localStorage.getItem('authToken');
    const headers = { Authorization: `Bearer ${token}` };
    this.http.get<any[]>(this.apiUrl, { headers }).subscribe({
      next: (data) => {
        this.materi = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching materi data:', err);
        this.isLoading = false;
      },
    });
  }

  // Mengambil data jenis bimbel
  getJenisbimbel(): void {
    const token = localStorage.getItem('authToken');
    const headers = { Authorization: `Bearer ${token}` };
    this.http.get<any[]>(this.apijenisbimbelUrl, { headers }).subscribe({
      next: (data) => {
        this.jenisbimbel = data;
      },
      error: (err) => {
        console.error('Error fetching jenis bimbel data:', err);
      },
    });
  }

  // Mengambil data murid
  getMurid(): void {
    const token = localStorage.getItem('authToken');
    const headers = { Authorization: `Bearer ${token}` };
    this.http.get<any[]>(this.apimuridUrl, { headers }).subscribe({
      next: (data) => {
        this.murid = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching murid data:', err);
        this.isLoading = false;
      },
    });
  }

  // Method untuk menambahkan materi
  addMateri(): void {
    if (this.materiForm.valid) {
      this.isSubmitting = true;
      const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Bearer ${token}` };

      // Membuat FormData untuk mengirim file dan data lainnya
      const formData = new FormData();
      formData.append('namamateri', this.materiForm.value.namamateri);
      formData.append('deskripsi', this.materiForm.value.deskripsi);
      formData.append('kelas', this.materiForm.value.kelas);
      formData.append('jenisbimbel_id', this.materiForm.value.jenisbimbel_id);
      formData.append('filemateri', this.materiForm.value.filemateri);

      this.http.post(this.apiUrl, formData, { headers }).subscribe({
        next: (response) => {
          console.log('Materi berhasil ditambahkan:', response);
          this.getMateri(); // Refresh data materi setelah penambahan
          this.materiForm.reset(); // Reset form setelah data dikirim
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Error menambahkan materi:', err);
          this.isSubmitting = false;
        },
      });
    }
  }

  // Method untuk menghapus materi
  deleteMateri(_id: string): void {
    if (confirm('Apakah Anda yakin ingin menghapus materi ini?')) {
      const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Bearer ${token}` };

      this.http.delete(`${this.apiUrl}/${_id}`, { headers }).subscribe({
        next: () => {
          console.log(`Materi dengan ID ${_id} berhasil dihapus`);
          this.getMateri(); // Refresh data materi setelah penghapusan
        },
        error: (err) => {
          console.error('Error menghapus materi:', err);
        }
      });
    }
  }

  // Mengambil data materi berdasarkan ID untuk edit
  getMateriById(_id: string): void {
    console.log('Fetching Materi with ID:', _id);
    this.editMateriId = _id;
    const token = localStorage.getItem('authToken');
    const headers = { Authorization: `Bearer ${token}` };
    this.http.get(`${this.apiUrl}/${_id}`, { headers }).subscribe({
      next: (data: any) => {
        console.log('Materi data fetched:', data);
        this.materiForm.patchValue({
          namamateri: data.namamateri || '',
          deskripsi: data.deskripsi || '',
          kelas: data.kelas || '',
          jenisbimbel_id: data.jenisbimbel_id || null,
        });
        this.isEditModalVisible = true;
      },
      error: (err) => {
        console.error('Error fetching materi by ID:', err);
      },
    });
  }

  // Method untuk update materi
  updateMateri(): void {
    if (this.materiForm.valid && this.editMateriId) {
      this.isSubmitting = true;
      const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Bearer ${token}` };

      const formData = new FormData();
      formData.append('namamateri', this.materiForm.value.namamateri);
      formData.append('deskripsi', this.materiForm.value.deskripsi);
      formData.append('kelas', this.materiForm.value.kelas);
      formData.append('jenisbimbel_id', this.materiForm.value.jenisbimbel_id);
      if (this.materiForm.value.filemateri) {
        formData.append('filemateri', this.materiForm.value.filemateri);
      }

      this.http.put(`${this.apiUrl}/${this.editMateriId}`, formData, { headers }).subscribe({
        next: (response) => {
          console.log('Materi berhasil diperbarui:', response);
          this.getMateri(); // Refresh data materi
          this.isSubmitting = false;

          // Tutup modal edit jika menggunakan Bootstrap atau ngIf
          this.isEditModalVisible = false;
        },
        error: (err) => {
          console.error('Error updating materi:', err);
          this.isSubmitting = false;
        },
      });
    }
  }

  // Method untuk memilih file
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

      // Set file langsung ke form
      this.materiForm.patchValue({ filemateri: file });
    }
  }
}
