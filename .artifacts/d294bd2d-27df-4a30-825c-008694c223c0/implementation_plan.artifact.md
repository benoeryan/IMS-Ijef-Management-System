# Tambahkan Opsi Upload Poster Lowongan

User ingin menambahkan fitur upload poster (PDF, JPG, PNG) pada data lowongan.

## User Review Required

> [!IMPORTANT]
> File poster akan diupload ke Firebase Storage. Nama file akan diawali dengan timestamp untuk menghindari duplikasi.

## Proposed Changes

### HR & Legal Module

#### [MODIFY] [modules-karyawan.js](file:///C:/Users/Lenovo/StudioProjects/hr-legal-app/modules-karyawan.js)

- Menambahkan variabel global `window._lwPosterFile` untuk menampung file sementara.
- Memperbarui `showLowForm` untuk:
    - Menambahkan input file dengan atribut `accept="image/png,image/jpeg,application/pdf"`.
    - Menampilkan link ke poster lama jika sedang mengedit.
- Memperbarui `simpanLowongan` untuk:
    - Melakukan upload file ke Storage menggunakan `uploadFileToStorage` jika ada file yang dipilih.
    - Menyimpan URL hasil upload ke field `posterUrl` di Firestore.
    - Menambahkan loading state saat proses simpan/upload.
- Memperbarui `viewLowongan` untuk menampilkan baris "Poster" jika datanya tersedia.

## Verification Plan

### Manual Verification
1. Buka menu Lowongan.
2. Klik "+ Tambah".
3. Pilih posisi, dept, dll.
4. Pilih file poster (coba JPG, lalu PNG, lalu PDF).
5. Klik Simpan. Tunggu proses upload selesai.
6. Cek detail lowongan (ikon mata) dan pastikan ada tombol "Lihat Poster" yang membuka file tersebut di tab baru.
7. Coba Edit lowongan tersebut, ganti posternya, dan simpan kembali.
8. Pastikan poster baru terupdate.
