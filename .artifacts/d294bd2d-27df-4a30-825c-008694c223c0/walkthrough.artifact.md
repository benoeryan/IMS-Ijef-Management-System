# Walkthrough - Tambahkan Opsi Manual untuk Posisi Lowongan

Saya telah menambahkan fitur untuk memasukkan posisi secara manual pada form Lowongan. Fitur ini memungkinkan pengguna untuk mengetikkan nama posisi jika posisi yang diinginkan tidak tersedia di daftar pilihan standar.

## Perubahan yang Dilakukan

### HR & Legal Module
- **[modules-karyawan.js](file:///C:/Users/Lenovo/StudioProjects/hr-legal-app/modules-karyawan.js)**
    - Menambahkan logika pengecekan di `showLowForm` untuk mendeteksi apakah posisi saat ini adalah input manual atau pilihan standar.
    - Menambahkan opsi **"-- LAINNYA (Input Manual) --"** pada dropdown Posisi.
    - Menambahkan input teks `lwPosManual` yang hanya muncul jika opsi "LAINNYA" dipilih.
    - Menambahkan fungsi `toggleLwPosManual()` untuk mengatur tampilan input manual secara real-time.
    - Memperbarui `simpanLowongan()` untuk memprioritaskan nilai dari input manual jika opsi "LAINNYA" aktif.

## Cara Menggunakan
1. Buka menu **Lowongan**.
2. Klik tombol **+ Tambah**.
3. Pada dropdown **Posisi**, scroll ke paling bawah dan pilih **-- LAINNYA (Input Manual) --**.
4. Ketik posisi yang Anda inginkan pada kotak teks yang muncul di bawahnya.
5. Klik **Simpan**.

## Verifikasi yang Dilakukan
- Memastikan input manual muncul hanya saat "LAINNYA" dipilih.
- Memastikan data tersimpan dengan benar menggunakan nilai dari input manual.
- Memastikan saat mengedit lowongan yang memiliki posisi manual, form otomatis menampilkan input teks dengan nilai yang sesuai.
