import { CommonModule } from '@angular/common'; // Mengimpor modul Angular yang menyediakan direktif umum seperti ngIf, ngFor, dll.
import { Component, OnInit, inject } from '@angular/core'; // Mengimpor decorator Component, interface OnInit untuk inisialisasi, dan inject untuk injeksi dependency.
import { HttpClient } from '@angular/common/http'; // Mengimpor HttpClient untuk melakukan HTTP request ke server.
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms'; // Mengimpor modul dan class untuk membuat formulir reaktif.
import * as bootstrap from 'bootstrap'; // Mengimpor Bootstrap untuk manipulasi modal dan elemen lainnya.

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
  apiUrl = 'https://bimbel-app.vercel.app/api/materi'; // URL API untuk mengambil dan menambahkan data mahasiswa.
  apijenisbimbelUrl = 'https://bimbel-app.vercel.app/api/jenisBimbel'; // URL API untuk mengambil data prodi.
  isLoading = true; // Indikator loading data dari API.
  materiForm: FormGroup; // Form group untuk formulir reaktif mahasiswa.
  isSubmitting = false; // Indikator proses pengiriman data.

  private http = inject(HttpClient); // Menggunakan Angular inject API untuk menyuntikkan HttpClient.
  private fb = inject(FormBuilder); // Menyuntikkan FormBuilder untuk membangun form reaktif.

  constructor() { // Konstruktor untuk inisialisasi komponen.
    this.materiForm = this.fb.group({ // Membuat grup form dengan FormBuilder.
      
      namamateri: [''], // Field nama mahasiswa.
      deskripsi: [''], // Field jenis kelamin mahasiswa.
      kelas: [''], // Field asal sekolah mahasiswa.
      jenisbimbel_id: [null], // Field prodi_id untuk relasi dengan program studi.
      filemateri: [''] // Field foto mahasiswa (untuk upload file).
    });
  }

  ngOnInit(): void { // Lifecycle method Angular, dipanggil saat komponen diinisialisasi.
    this.getMateri(); // Memanggil fungsi untuk mengambil data mahasiswa.
    this.getJenisbimbel(); // Memanggil fungsi untuk mengambil data program studi.
  }

  // Mengambil data mahasiswa
  getMateri(): void {
    this.http.get<any[]>(this.apiUrl).subscribe({
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
    this.http.get<any[]>(this.apijenisbimbelUrl).subscribe({
      next: (data) => {
        this.jenisbimbel = data; // Menyimpan data program studi ke variabel.
      },
      error: (err) => {
        console.error('Error fetching jenisbimbel data:', err);
      },
    });
  }

  // Method untuk menambahkan mahasiswa
  addMateri(): void {
    if (this.materiForm.valid) {
      this.isSubmitting = true; // Mengaktifkan indikator pengiriman data.
      const token = localStorage.getItem('authToken');
      const headers = {Authorization: `Bearer ${token}`};
      this.http.post(this.apiUrl, this.materiForm.value, {headers}).subscribe({
        next: (response) => {
          console.log('Materi berhasil ditambahkan:', response);
          this.getMateri(); // Refresh data mahasiswa setelah penambahan.
          this.materiForm.reset(); // Reset form setelah data dikirim.
          this.isSubmitting = false; // Menonaktifkan indikator pengiriman.

          // Tutup modal setelah data berhasil ditambahkan
          const modalElement = document.getElementById('tambahMateriModal') as HTMLElement; // Ambil elemen modal berdasarkan ID.
          if (modalElement) { // Periksa jika elemen modal ada.
            const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement); // Ambil atau buat instance modal.
            modalInstance.hide(); // Sembunyikan modal.

            // Pastikan untuk menghapus atribut dan gaya pada body setelah modal ditutup
            modalElement.addEventListener('hidden.bs.modal', () => { // Tambahkan event listener untuk modal yang ditutup.
              const backdrop = document.querySelector('.modal-backdrop'); // Cari elemen backdrop modal.
              if (backdrop) { 
                backdrop.remove(); // Hapus backdrop jika ada.
              }

              // Pulihkan scroll pada body
              document.body.classList.remove('modal-open'); // Hapus class 'modal-open' dari body.
              document.body.style.overflow = ''; // Pulihkan properti overflow pada body.
              document.body.style.paddingRight = ''; // Pulihkan padding body.
            }, { once: true }); // Event listener hanya dijalankan sekali.
          }
        
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
      const headers = {Authorization: `Bearer ${token}`};
      this.http.delete(`${this.apiUrl}/${_id}`, {headers}).subscribe({
        next: () => {
          console.log(`Materi dengan ID ${_id} berhasil dihapus`);
          this.getMateri(); // Refresh data mahasiswa setelah penghapusan.
        },
        error: (err) => {
          console.error('Error menghapus materi:', err);
        }
      });
    }
  }

  editMateriId: string | null = null;
  // isEditModalVisible = false;
  
  getMateriById(_id: string): void {
    // console.log('Fetching Materi with ID:', _id);
    this.editMateriId = _id;
    this.http.get(`${this.apiUrl}/${_id}`).subscribe({
      next: (data: any) => {
        console.log('Materi data fetched:', data);
        this.materiForm.patchValue({
          namamateri: data.namamateri, 
          deskripsi: data.deskripsi,
          kelas: data.kelas, 
          jenisbimbel_id: data.jenisbimbel_id,
        });
        // Buka modal edit
        const modalElement = document.getElementById('editMateriModal') as HTMLElement;
        if (modalElement) {
          console.log('Modal element found:', modalElement);
          const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
          modalInstance.show();
        } else {
          console.error('Modal element not found!');
        }
      },
        
      
      error: (err) => {
        console.error('Error fetching Materi by ID:', err);
      },
    });
  }
  
  updateMateri(): void {
    if (this.materiForm.valid) {
      this.isSubmitting = true; // Aktifkan indikator pengiriman data
      const token = localStorage.getItem('authToken');
      const headers = {Authorization: `Bearer ${token}`};
      this.http.put(`${this.apiUrl}/${this.editMateriId}`, this.materiForm.value, {headers}).subscribe({
        next: (response) => {
          console.log('Materi berhasil diperbarui:', response);
          this.getMateri(); // Refresh data mahasiswa
          this.isSubmitting = true;
  
          // Tutup modal edit
          const modalElement = document.getElementById('editMateriModal') as HTMLElement;
          if (modalElement) {
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance?.hide();
          }
        },
        error: (err) => {
          console.error('Error updating materi:', err);
          this.isSubmitting = true; // Nonaktifkan indikator pengiriman data
        },
      });
    }
  }
  
}