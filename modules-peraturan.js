'use strict';
// == PERATURAN PERUSAHAAN v16.1.5 ==============================
const PERATURAN_PERUSAHAAN={
  nama:'LPK IJEF CORP',
  versi:'2026',
  tempatTerbit:'Bandung Barat',
  tanggalBerlaku:'01 Januari 2026',
  bab:[
    {nomor:'I',judul:'KETENTUAN UMUM',pasal:[
      {nomor:1,judul:'Pengertian Istilah',isi:['Perusahaan adalah LPK IJEF CORP yang berkedudukan di Bandung Barat, didirikan berdasarkan hukum Republik Indonesia.','Pimpinan Perusahaan adalah Direktur atau pejabat lain yang ditunjuk untuk memimpin dan mengelola perusahaan.','Karyawan adalah setiap orang yang terikat hubungan kerja dengan perusahaan dan menerima upah/gaji.','Karyawan Tetap adalah karyawan yang terikat hubungan kerja tanpa batas waktu (PKWTT).','Karyawan Kontrak adalah karyawan yang terikat Perjanjian Kerja Waktu Tertentu (PKWT).','Karyawan Masa Percobaan adalah karyawan tetap yang masih dalam masa percobaan selama 3 bulan.','Atasan Langsung adalah pejabat struktural satu tingkat di atas karyawan yang bersangkutan.','Upah adalah hak karyawan yang diterima dan dinyatakan dalam bentuk uang sebagai imbalan atas pekerjaan.','Hari Kerja adalah hari-hari yang ditetapkan perusahaan untuk melaksanakan kegiatan operasional.','Keluarga Karyawan adalah suami/istri yang sah dan anak kandung/angkat yang terdaftar di perusahaan (maksimal 3 anak, usia di bawah 21 tahun, belum menikah, belum bekerja).']},
      {nomor:2,judul:'Ruang Lingkup',isi:['Peraturan Perusahaan ini berlaku untuk seluruh karyawan LPK IJEF CORP tanpa kecuali.','Peraturan ini mengatur hak dan kewajiban antara perusahaan dan karyawan.','Hal-hal yang belum diatur dalam Peraturan Perusahaan ini akan diatur kemudian dengan Surat Keputusan Direksi atau perjanjian tersendiri.','Peraturan Perusahaan ini berlaku selama 2 (dua) tahun sejak tanggal disahkan yaitu 01 Januari 2026.']}
    ]},
    {nomor:'II',judul:'HUBUNGAN KERJA',pasal:[
      {nomor:3,judul:'Penerimaan Karyawan Baru',isi:['Penerimaan karyawan baru merupakan wewenang perusahaan dengan mempertimbangkan kebutuhan organisasi.','Setiap calon karyawan wajib memenuhi syarat: Warga Negara Indonesia, usia minimal 18 tahun, sehat jasmani dan rohani dibuktikan surat keterangan dokter, tidak terlibat organisasi terlarang, dan memenuhi kualifikasi jabatan.','Perusahaan tidak membedakan suku, agama, ras, gender, dan golongan dalam penerimaan karyawan.','Calon karyawan yang diterima wajib menandatangani perjanjian kerja dan menyerahkan dokumen yang diperlukan.']},
      {nomor:4,judul:'Masa Percobaan',isi:['Karyawan baru dengan status PKWTT menjalani masa percobaan paling lama 3 (tiga) bulan.','Selama masa percobaan, masing-masing pihak dapat memutuskan hubungan kerja tanpa syarat apapun dengan pemberitahuan.','Karyawan yang lulus masa percobaan diangkat sebagai karyawan tetap terhitung sejak tanggal mulai bekerja.','Masa percobaan tidak berlaku bagi karyawan dengan status PKWT (kontrak).']},
      {nomor:5,judul:'Perjanjian Kerja Waktu Tertentu (PKWT)',isi:['PKWT dibuat secara tertulis dan didaftarkan pada instansi ketenagakerjaan yang berwenang.','Jangka waktu PKWT paling lama 5 (lima) tahun termasuk perpanjangan sesuai UU Cipta Kerja.','PKWT yang berakhir demi hukum tidak memerlukan pemberitahuan pengakhiran.','Karyawan PKWT berhak atas uang kompensasi sesuai ketentuan perundang-undangan yang berlaku.']},
      {nomor:6,judul:'Perjanjian Kerja Waktu Tidak Tertentu (PKWTT)',isi:['PKWTT dapat dibuat secara tertulis maupun lisan sesuai ketentuan perundang-undangan.','PKWTT yang dibuat secara lisan, perusahaan wajib membuat surat pengangkatan.','Karyawan PKWTT yang telah melewati masa percobaan berstatus karyawan tetap.']},
      {nomor:7,judul:'Penempatan dan Mutasi',isi:['Perusahaan berhak menempatkan karyawan sesuai kebutuhan operasional.','Mutasi dapat berupa perpindahan jabatan, departemen, atau lokasi kerja.','Mutasi dilakukan dengan mempertimbangkan kompetensi, pengalaman, dan kebutuhan perusahaan.','Karyawan yang menolak mutasi tanpa alasan yang sah dapat dikenakan sanksi.']},
      {nomor:8,judul:'Promosi dan Demosi',isi:['Promosi diberikan berdasarkan prestasi kerja, kompetensi, loyalitas, dan kebutuhan perusahaan.','Karyawan yang dipromosikan menjalani masa evaluasi selama 3 bulan di posisi baru.','Demosi dilakukan apabila karyawan tidak mampu memenuhi target atau melakukan pelanggaran.','Promosi dan demosi ditetapkan melalui Surat Keputusan Direksi.']},
      {nomor:9,judul:'Pendataan Karyawan',isi:['Setiap karyawan wajib memberikan data pribadi yang benar dan lengkap kepada perusahaan.','Perubahan data pribadi (alamat, status pernikahan, jumlah tanggungan, dll) wajib dilaporkan kepada HRD selambat-lambatnya 7 hari kerja.','Kelalaian melaporkan perubahan data menjadi tanggung jawab karyawan dan perusahaan tidak bertanggung jawab atas akibatnya.']},
      {nomor:10,judul:'Evaluasi Kinerja',isi:['Perusahaan melakukan evaluasi kinerja secara berkala minimal 1 (satu) kali dalam setahun.','Hasil evaluasi menjadi dasar pertimbangan untuk promosi, kenaikan gaji, bonus, dan pembinaan.','Karyawan yang tidak mencapai standar kinerja diberikan pembinaan dan kesempatan perbaikan.','Evaluasi dilakukan secara objektif dan transparan oleh atasan langsung bersama HRD.']}
    ]},
    {nomor:'III',judul:'WAKTU KERJA, ISTIRAHAT, DAN LEMBUR',pasal:[
      {nomor:11,judul:'Waktu Kerja',isi:['Waktu kerja yang berlaku di perusahaan adalah 5 (lima) hari kerja dalam seminggu, Senin sampai Jumat.','Jam kerja efektif adalah 8 (delapan) jam sehari dan 40 (empat puluh) jam seminggu.','Jam kerja: Senin-Jumat pukul 08.00 - 17.00 WIB dengan istirahat pukul 12.00 - 13.00 WIB.','Perusahaan dapat mengatur jam kerja berbeda untuk bagian tertentu sesuai kebutuhan operasional dengan tetap memenuhi ketentuan jam kerja maksimal.','Kerja lembur dilakukan atas perintah tertulis atasan dan persetujuan karyawan, kecuali dalam kondisi darurat.','Perhitungan upah lembur sesuai ketentuan perundang-undangan yang berlaku.','Jam lembur maksimal 4 (empat) jam per hari dan 18 (delapan belas) jam per minggu.','Karyawan wajib hadir tepat waktu sesuai jadwal yang ditetapkan. Toleransi keterlambatan 10 menit.']}
    ]},
    {nomor:'IV',judul:'CUTI DAN IZIN',pasal:[
      {nomor:12,judul:'Cuti Tahunan',isi:['Setiap karyawan yang telah bekerja selama 12 (dua belas) bulan berturut-turut berhak atas cuti tahunan selama 12 (dua belas) hari kerja.','Permohonan cuti diajukan minimal 3 (tiga) hari kerja sebelumnya melalui sistem HRD kepada atasan langsung.','Cuti tahunan yang tidak diambil sampai akhir periode tidak dapat diuangkan dan hangus, kecuali karena kepentingan perusahaan.','Perusahaan dapat menunda pemberian cuti paling lama 6 bulan apabila kepentingan operasional mendesak.']},
      {nomor:13,judul:'Cuti Sakit',isi:['Karyawan yang sakit berhak atas cuti sakit dengan melampirkan surat keterangan dokter.','Sakit 1 hari dapat menggunakan surat keterangan sakit dari klinik/dokter.','Sakit lebih dari 2 hari berturut-turut wajib melampirkan surat keterangan dokter/rumah sakit.','Upah selama sakit berkepanjangan dibayar: 4 bulan pertama 100%, 4 bulan kedua 75%, 4 bulan ketiga 50%, selanjutnya 25% sebelum dilakukan PHK.','Karyawan yang sakit karena kecelakaan kerja mendapat pengobatan dan upah penuh selama masa penyembuhan.']},
      {nomor:14,judul:'Cuti Melahirkan dan Keguguran',isi:['Karyawan perempuan berhak atas cuti melahirkan selama 3 (tiga) bulan: 1,5 bulan sebelum dan 1,5 bulan sesudah melahirkan.','Karyawan perempuan yang mengalami keguguran berhak atas istirahat 1,5 bulan dengan surat keterangan dokter.','Selama cuti melahirkan/keguguran, karyawan tetap mendapatkan upah penuh.','Karyawan laki-laki mendapat cuti pendampingan istri melahirkan selama 2 (dua) hari kerja.']},
      {nomor:15,judul:'Cuti Khusus (Izin Berbayar)',isi:['Karyawan berhak atas cuti khusus berbayar: Pernikahan karyawan sendiri 3 hari; Pernikahan anak karyawan 2 hari; Khitanan/baptis anak 2 hari; Istri melahirkan/keguguran 2 hari; Suami/istri/anak/orang tua/mertua meninggal 2 hari; Anggota keluarga serumah meninggal 1 hari.','Cuti khusus diambil pada saat peristiwa terjadi dan tidak dapat ditunda.','Karyawan wajib memberikan bukti atas peristiwa tersebut kepada HRD.']},
      {nomor:16,judul:'Cuti Bersama',isi:['Perusahaan mengikuti ketentuan cuti bersama yang ditetapkan pemerintah.','Cuti bersama diperhitungkan sebagai bagian dari cuti tahunan.','Karyawan yang tetap bekerja pada hari cuti bersama tidak mendapat penggantian cuti.']},
      {nomor:17,judul:'Izin Tidak Masuk Kerja',isi:['Karyawan yang tidak dapat masuk kerja wajib memberitahukan kepada atasan langsung sebelum jam kerja dimulai.','Izin tidak masuk kerja tanpa keterangan yang sah dianggap mangkir.','Mangkir 5 (lima) hari kerja berturut-turut tanpa keterangan tertulis dianggap mengundurkan diri.']},
      {nomor:18,judul:'Izin Meninggalkan Pekerjaan',isi:['Karyawan yang perlu meninggalkan pekerjaan saat jam kerja wajib mendapat izin dari atasan langsung.','Izin meninggalkan pekerjaan untuk keperluan pribadi dipotong dari jam kerja atau cuti tahunan.','Meninggalkan pekerjaan tanpa izin dianggap sebagai pelanggaran tata tertib.']}
    ]},
    {nomor:'V',judul:'PENGUPAHAN',pasal:[
      {nomor:19,judul:'Sistem Pengupahan',isi:['Upah ditetapkan berdasarkan jabatan, kompetensi, pengalaman, dan tanggung jawab pekerjaan.','Upah tidak boleh lebih rendah dari Upah Minimum Kabupaten/Kota (UMK) yang berlaku.','Peninjauan upah dilakukan secara berkala minimal 1 (satu) kali dalam setahun.','Struktur dan skala upah disusun dengan memperhatikan golongan, jabatan, masa kerja, dan kemampuan perusahaan.']},
      {nomor:20,judul:'Waktu Pembayaran Upah',isi:['Upah dibayarkan setiap tanggal 28 (dua puluh delapan) setiap bulan.','Apabila tanggal pembayaran jatuh pada hari libur, upah dibayarkan pada hari kerja sebelumnya.','Pembayaran upah dilakukan melalui transfer bank ke rekening karyawan.','Slip gaji diberikan secara digital melalui sistem HRD.']},
      {nomor:21,judul:'Komponen Upah',isi:['Komponen upah terdiri dari: Gaji Pokok, Tunjangan Tetap (jabatan, keluarga), Tunjangan Tidak Tetap (kehadiran, transport, makan).','Gaji pokok minimal 75% dari total upah yang diterima.','Tunjangan tidak tetap dibayarkan berdasarkan kehadiran aktual karyawan.','Potongan upah meliputi: pajak penghasilan (PPh 21), iuran BPJS, pinjaman/kasbon, dan potongan lain yang disepakati.']},
      {nomor:22,judul:'Upah Lembur',isi:['Upah lembur dibayarkan kepada karyawan yang bekerja melebihi waktu kerja normal atas perintah atasan.','Perhitungan upah lembur: Hari biasa jam pertama 1,5x upah sejam, jam berikutnya 2x upah sejam.','Hari istirahat/libur resmi: 7 jam pertama 2x upah sejam, jam ke-8 3x upah sejam, jam ke-9 dst 4x upah sejam.','Upah sejam = 1/173 x upah sebulan.']},
      {nomor:23,judul:'Tunjangan Hari Raya (THR)',isi:['THR Keagamaan dibayarkan 1 (satu) kali dalam setahun selambat-lambatnya 7 hari sebelum hari raya.','Karyawan yang telah bekerja 12 bulan atau lebih mendapat THR sebesar 1 bulan upah.','Karyawan yang telah bekerja 1 bukti tetapi kurang dari 12 bulan mendapat THR secara proporsional.','THR dihitung berdasarkan upah pokok ditambah tunjangan tetap.']},
      {nomor:24,judul:'Bonus dan Insentif',isi:['Perusahaan dapat memberikan bonus tahunan berdasarkan kinerja perusahaan dan karyawan.','Besaran bonus ditetapkan melalui Surat Keputusan Direksi.','Insentif khusus dapat diberikan untuk pencapaian target tertentu.','Karyawan yang sedang menjalani sanksi SP dapat dikurangi bonusnya sesuai kebijakan perusahaan.']},
      {nomor:25,judul:'Upah Selama Sakit dan Tidak Bekerja',isi:['Karyawan yang sakit berkepanjangan tetap mendapat upah sesuai ketentuan Pasal 13 ayat 4.','Karyawan yang ditahan pihak berwajib: tidak berhak atas upah, namun perusahaan wajib memberi bantuan kepada keluarga yang menjadi tanggungannya.','Bantuan keluarga: 1 tanggungan 25%, 2 tanggungan 35%, 3 tanggungan 45%, 4+ tanggungan 50% dari upah.','Pemberian bantuan diberikan paling lama 6 bulan.']}
    ]},
    {nomor:'VI',judul:'FASILITAS KERJA',pasal:[
      {nomor:26,judul:'Fasilitas Kesehatan',isi:['Perusahaan mendaftarkan seluruh karyawan dalam program BPJS Kesehatan.','Karyawan dan keluarga (maks. istri/suami + 3 anak) ditanggung dalam program BPJS Kesehatan.','Perusahaan dapat menyediakan fasilitas klinik atau dokter perusahaan.','Karyawan berhak mendapat pemeriksaan kesehatan berkala sesuai kebijakan perusahaan.','Biaya pengobatan akibat kecelakaan kerja ditanggung sepenuhnya oleh perusahaan/BPJS Ketenagakerjaan.']},
      {nomor:27,judul:'Fasilitas Kerja dan Perlengkapan',isi:['Perusahaan menyediakan peralatan dan perlengkapan kerja yang diperlukan.','Karyawan wajib memelihara dan menjaga fasilitas kerja yang diberikan.','Kerusakan atau kehilangan karena kelalaian karyawan menjadi tanggung jawab karyawan.','Fasilitas kerja wajib dikembalikan saat karyawan mengakhiri hubungan kerja.']},
      {nomor:28,judul:'Fasilitas Perjalanan Dinas',isi:['Karyawan yang melakukan perjalanan dinas mendapat biaya transport, akomodasi, dan uang harian sesuai grade jabatan.','Perjalanan dinas dilakukan berdasarkan Surat Perintah Perjalanan Dinas (SPPD) dari atasan yang berwenang.','Biaya perjalanan dinas dipertanggungjawabkan dengan bukti pengeluaran yang sah.','Ketentuan detail perjalanan dinas diatur dalam kebijakan terpisah (SOP Perjalanan Dinas).']}
    ]},
    {nomor:'VII',judul:'JAMINAN SOSIAL DAN KESEJAHTERAAN',pasal:[
      {nomor:29,judul:'BPJS Ketenagakerjaan',isi:['Perusahaan mendaftarkan seluruh karyawan dalam program BPJS Ketenagakerjaan yang meliputi: Jaminan Kecelakaan Kerja (JKK), Jaminan Kematian (JKM), Jaminan Hari Tua (JHT), dan Jaminan Pensiun (JP).','Iuran JKK dan JKM ditanggung sepenuhnya oleh perusahaan.','Iuran JHT: 3,7% ditanggung perusahaan, 2% ditanggung karyawan.','Iuran JP: 2% ditanggung perusahaan, 1% ditanggung karyawan.']},
      {nomor:30,judul:'Jaminan Kecelakaan Kerja',isi:['Kecelakaan kerja meliputi kecelakaan yang terjadi di tempat kerja, dalam perjalanan dari/ke tempat kerja, serta penyakit akibat kerja.','Karyawan yang mengalami kecelakaan kerja berhak mendapat pengobatan dan perawatan sesuai ketentuan BPJS Ketenagakerjaan.','Perusahaan wajib melaporkan kecelakaan kerja kepada BPJS Ketenagakerjaan dalam waktu 2x24 jam.','Selama masa penyembuhan akibat kecelakaan kerja, karyawan tetap mendapat upah penuh.']},
      {nomor:31,judul:'Jaminan Kematian',isi:['Ahli waris karyawan yang meninggal dunia berhak menerima santunan kematian dari BPJS Ketenagakerjaan.','Perusahaan memberikan uang duka tambahan sebesar 1 (satu) bulan upah terakhir.','Perusahaan membantu proses administrasi klaim BPJS Ketenagakerjaan bagi ahli waris.']},
      {nomor:32,judul:'Bantuan dan Sumbangan',isi:['Perusahaan memberikan bantuan pernikahan karyawan pertama kali sebesar kebijakan yang berlaku.','Perusahaan memberikan sumbangan duka untuk: karyawan meninggal, keluarga inti karyawan meninggal.','Perusahaan memberikan bantuan bencana alam bagi karyawan yang terdampak.','Besaran bantuan ditetapkan melalui Surat Keputusan Direksi.']},
      {nomor:33,judul:'Ibadah dan Keagamaan',isi:['Perusahaan menyediakan waktu dan tempat untuk melaksanakan ibadah.','Karyawan diberikan kesempatan menjalankan ibadah sesuai agamanya pada jam-jam yang ditentukan.','Perusahaan menghormati seluruh hari besar keagamaan sesuai ketentuan pemerintah.']}
    ]},
    {nomor:'VIII',judul:'PENINGKATAN KETERAMPILAN KARYAWAN',pasal:[
      {nomor:34,judul:'Pelatihan dan Pendidikan Karyawan',isi:['Untuk meningkatkan kemampuan karyawan serta memenuhi kebutuhan perusahaan akan tenaga terampil, perusahaan sewaktu-waktu dapat mengadakan pelatihan yang dibiayai perusahaan.','Penentuan sifat/jenis pelatihan, tempat serta jangka waktunya diatur berdasarkan kebijakan perusahaan.','Karyawan yang ditunjuk untuk mengikuti pelatihan wajib mengikuti seluruh program dengan baik.','Karyawan yang telah mengikuti pelatihan dengan biaya perusahaan wajib menerapkan ilmu yang didapat dan terikat ikatan dinas sesuai perjanjian.','Apabila karyawan mengundurkan diri sebelum masa ikatan dinas berakhir, wajib mengganti biaya pelatihan secara proporsional.']}
    ]},
    {nomor:'IX',judul:'TATA TERTIB KERJA',pasal:[
      {nomor:35,judul:'Pencatatan Kehadiran Kerja',isi:['Setiap karyawan wajib hadir pada waktu kerja dan mendata kehadiran dengan alat pencatat waktu pada saat masuk dan pulang kerja. Toleransi keterlambatan maksimal 10 menit.','Pengisian data kehadiran harus dilakukan sendiri oleh karyawan yang bersangkutan.','Pengisian kehadiran oleh orang lain merupakan pelanggaran dan dikenakan sanksi bagi kedua pihak.','Karyawan yang terlambat hadir merupakan pelanggaran disiplin kerja dan akan dicatat dalam sistem.','Karyawan yang tidak hadir tanpa keterangan selama 5 hari berturut-turut dianggap mengundurkan diri.']},
      {nomor:36,judul:'Tanda Pengenal (ID Card)',isi:['Setiap karyawan diberikan tanda pengenal/ID Card sebagai inventaris perusahaan.','ID Card wajib dipakai selama berada di lingkungan perusahaan.','Kehilangan ID Card wajib dilaporkan ke HRD dan karyawan dikenakan biaya penggantian.','ID Card wajib dikembalikan saat karyawan mengakhiri hubungan kerja.']},
      {nomor:37,judul:'Kewajiban Karyawan',isi:['Memberikan keterangan yang sebenarnya mengenai pekerjaan kepada perusahaan.','Melaksanakan pekerjaan sebaik-baiknya, penuh tanggung jawab, dan dengan dedikasi tinggi.','Melaksanakan perintah/instruksi atasan yang berkaitan dengan pekerjaan.','Menjaga dan memelihara kultur kerja yang kondusif dan profesional.','Menyimpan dan menjaga dokumen serta informasi rahasia perusahaan.','Menjaga kesopanan, etika, dan norma pergaulan yang berlaku.','Memelihara kebersihan dan kerapian lingkungan kerja.','Menjaga keamanan barang milik perusahaan yang dipercayakan.','Menghormati sesama karyawan, atasan, dan pimpinan perusahaan.','Melaporkan setiap perubahan data pribadi kepada HRD dalam waktu 7 hari kerja.','Tidak melakukan pekerjaan untuk pihak lain yang merugikan atau bertentangan dengan kepentingan perusahaan tanpa izin tertulis.','Mematuhi seluruh peraturan keselamatan dan kesehatan kerja (K3).']},
      {nomor:38,judul:'Tindakan Disiplin',isi:['Pelanggaran terhadap peraturan perusahaan dikenakan sanksi sesuai bobot pelanggaran.','Jenis sanksi: Peringatan lisan; Surat Peringatan I (SP I); Surat Peringatan II (SP II); Surat Peringatan III (SP III). Masing-masing berlaku selama 6 (enam) bulan.','Pemberian SP tidak harus berurutan, disesuaikan dengan bobot pelanggaran.','Skorsing dapat diberikan sebagai tindakan hukuman atau sebagai langkah menuju PHK, maksimal 6 bulan.','Karyawan dalam masa skorsing: tidak berhak atas kenaikan gaji, bonus dikurangi 50%, dan tidak berhak mendapatkan promosi selama 1 tahun.','Setiap pemberian sanksi akan didokumentasikan dan menjadi bagian dari catatan kepegawaian karyawan.']},
      {nomor:39,judul:'Pelanggaran Tata Tertib',sub:[{label:'A. Pelanggaran Ringan (SP I):',items:['Terlambat masuk kerja 3 kali atau lebih dalam sebulan.','Mangkir tanpa keterangan selama 2 hari dalam sebulan.','Menyuruh orang lain mengisi data kehadiran.','Meninggalkan tempat kerja tanpa izin atasan langsung.','Tidur pada saat jam kerja.','Tidak memakai pakaian kerja atau seragam yang ditentukan.','Melakukan perbuatan yang bertentangan dengan norma sosial di lingkungan kerja.','Menggunakan fasilitas perusahaan untuk kepentingan pribadi tanpa izin.']},{label:'B. Pelanggaran Sedang (SP II):',items:['Melakukan pelanggaran dalam masa berlaku SP I.','Terlambat masuk kerja 5 kali berturut-turut atau 10 kali dalam sebulan.','Mangkir 3 hari berturut-turut atau 5 hari dalam sebulan tanpa keterangan sah.','Tidak melaksanakan petunjuk/instruksi atasan yang berkaitan dengan pekerjaan.','Bekerja tidak sesuai dengan SOP (Standard Operating Procedure) yang berlaku.','Mengambil keputusan di luar batas wewenang tanpa persetujuan atasan.','Menyebarkan informasi internal perusahaan kepada pihak tidak berwenang.']},{label:'C. Pelanggaran Berat (SP III):',items:['Melakukan pelanggaran dalam masa berlaku SP II.','Terlambat masuk kerja 10 kali berturut-turut atau 15 kali dalam sebulan.','Mangkir 4 hari berturut-turut atau 7 hari dalam sebulan tanpa keterangan sah.','Menyalahgunakan barang/aset milik perusahaan untuk kepentingan pribadi.','Menolak perintah atasan/mutasi tanpa alasan yang sah.','Secara konsisten tidak mencapai target kinerja yang telah ditetapkan.','Mengganggu ketertiban dan keharmonisan lingkungan kerja.','Membawa senjata tajam/api ke lingkungan perusahaan.']}],catatan:'Konsekuensi tambahan: penurunan penilaian kinerja, penundaan kenaikan upah, demosi jabatan, denda materil, dan/atau pencabutan fasilitas perusahaan.'}
    ]},
    {nomor:'X',judul:'PEMUTUSAN HUBUNGAN KERJA (PHK)',pasal:[
      {nomor:40,judul:'Ketentuan Umum PHK',isi:['Perusahaan, karyawan, dan serikat pekerja berusaha dengan segala upaya agar PHK tidak terjadi.','Penyelesaian PHK mengikuti ketentuan peraturan perundang-undangan ketenagakerjaan yang berlaku.','PHK dapat terjadi karena: pelanggaran berat, sakit berkepanjangan, tidak mencapai standar prestasi kerja, alasan mendesak perusahaan, pensiun, mengundurkan diri, meninggal dunia, atau berakhirnya PKWT.','Karyawan yang di-PHK wajib melunasi seluruh hutang/kewajiban finansial kepada perusahaan.','Karyawan yang di-PHK wajib mengembalikan seluruh inventaris dan aset perusahaan yang dipercayakan.']},
      {nomor:41,judul:'PHK karena Efisiensi dan Restrukturisasi',isi:['Perusahaan dapat melakukan PHK karena efisiensi akibat kerugian/force majeure sesuai ketentuan undang-undang.','PHK karena merger, konsolidasi, atau perubahan status perusahaan dilakukan dengan memperhatikan hak karyawan.','Karyawan yang di-PHK karena efisiensi berhak atas pesangon, uang penghargaan masa kerja, dan uang penggantian hak sesuai ketentuan.','Perusahaan mengupayakan solusi alternatif sebelum PHK: pengurangan upah dan fasilitas, pembatasan lembur, pengurangan jam/hari kerja, merumahkan sementara.']},
      {nomor:42,judul:'PHK karena Pelanggaran Berat',isi:['Karyawan dapat di-PHK tanpa pesangon apabila melakukan pelanggaran berat:','Melakukan pelanggaran dalam masa berlaku SP III.','Melakukan penipuan, pencurian, atau penggelapan barang/uang milik perusahaan.','Menyebarkan fitnah, hoax, atau konten negatif tentang perusahaan melalui media sosial atau media lainnya.','Mabuk, menggunakan/mengedarkan narkotika dan obat terlarang di lingkungan perusahaan.','Memalsukan dokumen perusahaan atau dokumen pribadi untuk kepentingan tertentu.','Melakukan pelecehan seksual, intimidasi, atau kekerasan fisik di lingkungan kerja.','Dengan sengaja merusak barang/aset milik perusahaan.','Membocorkan rahasia perusahaan yang seharusnya dirahasiakan kepada pihak luar.','Menyalahgunakan jabatan untuk kepentingan pribadi atau melakukan pungutan liar (pungli).','Melakukan tindak pidana yang diancam hukuman penjara 5 tahun atau lebih.']},
      {nomor:43,judul:'PHK karena Mangkir',isi:['Karyawan yang mangkir selama 5 (lima) hari kerja berturut-turut tanpa keterangan tertulis yang sah dipanggil 2 kali secara patut.','Apabila setelah 2 kali pemanggilan karyawan tidak dapat memberikan keterangan yang sah, dianggap mengundurkan diri.','Karyawan yang di-PHK karena mangkir berhak atas uang penggantian hak dan uang pisah sesuai ketentuan.']},
      {nomor:44,judul:'PHK karena Sakit Berkepanjangan',isi:['Karyawan yang sakit berkepanjangan selama 12 (dua belas) bulan berturut-turut dan setelah itu dinyatakan tidak mampu bekerja oleh dokter dapat di-PHK.','Karyawan berhak atas uang pesangon 2x ketentuan, uang penghargaan masa kerja 1x, and uang penggantian hak sesuai peraturan.','Perusahaan membantu proses klaim asuransi dan BPJS Ketenagakerjaan bagi karyawan tersebut.']},
      {nomor:45,judul:'PHK karena Alasan Mendesak',isi:['PHK karena alasan mendesak meliputi: perusahaan tutup karena force majeure, perusahaan pailit, atau keadaan darurat lainnya.','Karyawan berhak atas hak-haknya sesuai ketentuan perundang-undangan yang berlaku.','Perusahaan wajib memberitahukan rencana PHK kepada karyawan dan/atau serikat pekerja minimal 14 hari sebelumnya.']},
      {nomor:46,judul:'PHK karena Pensiun',isi:['Usia pensiun normal ditetapkan 55 (lima puluh lima) tahun.','Pensiun dipercepat dapat dilakukan pada usia 45 tahun berdasarkan Surat Keputusan Direksi atas permohonan karyawan.','Karyawan yang pensiun berhak atas uang pesangon 2x ketentuan, uang penghargaan masa kerja 1x, and uang penggantian hak.','Karyawan yang telah pensiun dapat dipekerjakan kembali berdasarkan kontrak khusus (PKWT) apabila diperlukan perusahaan.']},
      {nomor:47,judul:'PHK karena Pengunduran Diri, Meninggal, and Berakhirnya Kontrak',isi:['Mengundurkan diri: karyawan wajib mengajukan surat pengunduran diri minimal 30 hari sebelum tanggal efektif and melakukan serah terima pekerjaan.','Karyawan yang mengundurkan diri berhak atas uang penggantian hak and uang pisah (bila memenuhi syarat).','Meninggal dunia: hubungan kerja berakhir otomatis. Ahli waris berhak atas uang pesangon 2x ketentuan, uang penghargaan masa kerja 1x, and uang penggantian hak.','Berakhirnya PKWT: hubungan kerja putus demi hukum saat jangka waktu kontrak berakhir. Karyawan berhak atas uang kompensasi sesuai ketentuan.']},
      {nomor:48,judul:'Uang Pisah',isi:['Uang pisah diberikan kepada karyawan tetap yang di-PHK karena pelanggaran berat, mangkir 5 hari, atau mengundurkan diri sendiri.','Karyawan yang telah bekerja kurang dari 3 tahun tidak mendapat uang pisah.','Karyawan yang mengundurkan diri (masa kerja 3 tahun atau lebih) mendapat uang pisah sebesar 1x upah terakhir.','Karyawan yang di-PHK karena mangkir (masa kerja 3 tahun atau lebih) mendapat uang pisah Rp 1.000.000.','Karyawan yang di-PHK karena pelanggaran berat tidak mendapat uang pisah.'],tabel:{headers:['Masa Kerja','Resign','Mangkir','Pelanggaran Berat'],rows:[['< 3 tahun','0','0','0'],['3-5 tahun','1x upah','Rp 1.000.000','0'],['5-10 tahun','1,5x upah','Rp 1.500.000','0'],['> 10 tahun','2x upah','Rp 2.000.000','0']]}}
    ]},
    {nomor:'XI',judul:'KEBIJAKAN PINJAMAN KARYAWAN',pasal:[
      {nomor:49,judul:'Ketentuan Umum & Kategori Pinjaman',isi:['Fasilitas pinjaman ini bersifat bantuan kesejahteraan (employee benefit) non-komersial tanpa bunga (0%) yang bertujuan membantu keuangan karyawan.','Pinjaman Reguler: Pinjaman dana tunai skala menengah untuk kebutuhan terencana karyawan.','Kasbon Darurat: Pinjaman dana tunai kilat skala kecil khusus untuk situasi kedaruratan yang tidak terencana.']},
      {nomor:50,judul:'Persyaratan Pengajuan',sub:[
        {label:'Kriteria Pinjaman Reguler:',items:['Berstatus sebagai Karyawan Tetap (PKWTT), ATAU Karyawan Kontrak (PKWT/Probation/Freelance) dengan masa kerja minimal 12 bulan (1 tahun).','Memiliki masa kerja minimal 12 bulan (1 tahun).','Tidak sedang dalam proses sanksi Surat Peringatan (SP).','Tidak memiliki sisa pinjaman aktif sebelumnya (one active loan at a time).']},
        {label:'Kriteria Kasbon Darurat:',items:['Berstatus sebagai Karyawan Tetap (PKWTT) ATAU Karyawan Kontrak (PKWT/Probation/Freelance) dengan masa kerja >= 6 bulan.','Hanya diperuntukkan bagi kondisi mendesak: Musibah keluarga inti, biaya medis darurat, atau kebutuhan krusial yang bersifat mendadak.']}
      ]},
      {nomor:51,judul:'Rumus Hitungan Plafon Pinjaman',isi:['Besaran maksimal plafon pinjaman ditentukan berdasarkan kategori and masa kerja:'],tabel:{headers:['Kategori Pinjaman','Masa Kerja','Maksimal Plafon Pinjaman'],rows:[['Kasbon Darurat','>= 6 Bulan','Rp 1.000.000 (Atau maksimal 20% dari Gaji Pokok)'],['Pinjaman Reguler (PKWT/Probation/Freelance)','> 1 Tahun','0,5 x Gaji Pokok'],['Pinjaman Reguler (PKWTT)','1 s.d 3 Tahun','1,5 x Gaji Pokok'],['Pinjaman Reguler (PKWTT)','3 s.d 5 Tahun','2,5 x Gaji Pokok'],['Pinjaman Reguler (PKWTT)','> 5 Tahun','3,4 x Gaji Pokok']]}},
      {nomor:52,judul:'Rasio Cicilan Bulanan & Durasi (Tenor)',sub:[
        {label:'Ketentuan Pinjaman Reguler:',items:['Rasio Cicilan: Maksimal 30% dari Gaji Bersih (Take Home Pay / THP).','Durasi Pinjaman <= Rp 5.000.000: Maksimal 6 bulan.','Durasi Pinjaman > Rp 5.000.000: Maksimal 12 bulan.']},
        {label:'Ketentuan Kasbon Darurat:',items:['Rasio Cicilan: Potong penuh 100% dari total pinjaman pada bulan berjalan.','Durasi: Maksimal 1 bulan (langsung lunas pada tanggal gajian terdekat).']}
      ]},
      {nomor:53,judul:'Alur Birokrasi & Otorisasi Persetujuan',isi:[
        'Alur Kasbon Darurat (Proses Kilat 1 Hari Kerja): [Karyawan] -> [Manajer HRD] -> [Manajer Keuangan] -> [Pencairan Kas Kecil / Petty Cash]. Kasbon Darurat tidak memerlukan persetujuan Direktur Keuangan.',
        'Alur Pinjaman Reguler (Proses Standar 5-7 Hari Kerja): [Karyawan] -> [Atasan Langsung] -> [HR Operation] -> [Direktur Keuangan / CFO] -> [Transfer Payroll].'
      ]},
      {nomor:54,judul:'Ketentuan Pelunasan Khusus (Resign / PHK)',isi:[
        'Apabila karyawan berhenti bekerja sebelum komitmen pinjaman selesai, sisa pinjaman akan dihitung sebagai Hutang Jatuh Tempo Seketika.',
        'Perusahaan berhak melakukan pemotongan langsung secara penuh dari hak akhir kerja (Final Settlement) karyawan (gaji terakhir, pesangon, atau sisa cuti).',
        'Jika hak akhir tidak mencukupi, karyawan wajib melunasi sisa kekurangan tunai maksimal 7 hari kerja setelah hari terakhir kerja.'
      ]}
    ]},
    {nomor:'XII',judul:'PENUTUP',pasal:[
      {nomor:55,judul:'Ketentuan Penutup',isi:['Hal-hal yang belum diatur dalam Peraturan Perusahaan ini akan diatur kemudian melalui Surat Keputusan Direksi atau Perjanjian Kerja Bersama.','Peraturan Perusahaan ini berlaku selama 2 (dua) tahun sejak tanggal disahkan, yaitu mulai 01 Januari 2026 sampai dengan 31 Desember 2027.','Selama belum ada Peraturan Perusahaan yang baru, maka Peraturan Perusahaan ini tetap berlaku.','Peraturan Perusahaan ini diumumkan and disosialisasikan kepada seluruh karyawan.','Perubahan atas Peraturan Perusahaan ini dilakukan melalui Surat Keputusan tersendiri dengan memperhatikan masukan dari karyawan.','Peraturan Perusahaan ini dibuat dengan itikad baik and mengikat kedua belah pihak.','Ditetapkan di Bandung Barat pada tanggal 01 Januari 2026. Direktur LPK IJEF CORP.']}
    ]}
  ]
};

let _peraturanCache = null;

async function loadPeraturanData() {
    if (_peraturanCache) return _peraturanCache;
    try {
        const doc = await db.collection('hrd_settings').doc('peraturan').get();
        if (doc.exists) {
            const fsData = doc.data();
            // Handle new stringified format or old raw format
            if (fsData.dataJson) {
                _peraturanCache = JSON.parse(fsData.dataJson);
            } else {
                _peraturanCache = fsData;
            }
            return _peraturanCache;
        }
    } catch (e) {
        console.warn("Failed to load peraturan from Firestore, using fallback:", e);
    }
    return PERATURAN_PERUSAHAAN;
}

async function seedPeraturanIfEmpty() {
    try {
        const docRef = db.collection('hrd_settings').doc('peraturan');
        const doc = await docRef.get();

        // Always update to ensure Bab XI latest criteria is present
        console.log("[SEED] Syncing regulations to Firestore for Bab XI update...");
        await docRef.set({
            dataJson: JSON.stringify(PERATURAN_PERUSAHAAN),
            updatedAt: new Date().toISOString(),
            updatedBy: 'System Sync (v16.1.2)'
        }, { merge: true });

        // Normalization Migration: Standardize contract nomenclature and sync employee status
        const [kSnap, ctSnap] = await Promise.all([
            db.collection('hrd_karyawan').get(),
            db.collection('hrd_kontrak').get()
        ]);

        const allContracts = [];
        ctSnap.forEach(d => allContracts.push({ id: d.id, ...d.data() }));

        const batch = db.batch();
        let migrationCount = 0;
        let statusSyncCount = 0;

        kSnap.forEach(d => {
            const k = d.data();
            const currentTipe = (k.tipeKaryawan || "").toUpperCase().trim();

            // 1. Find latest contract for this employee
            const userContracts = allContracts.filter(c =>
                c.karyawanId === d.id || isSameName(c.namaKaryawan || c.pihak, k.nama)
            );

            let latestTipe = "";
            if (userContracts.length > 0) {
                // Sort by sequence or date (assuming higher sequence is newer)
                userContracts.sort((a, b) => {
                    const seqA = parseInt(a.kontrakKe) || 0;
                    const seqB = parseInt(b.kontrakKe) || 0;
                    if (seqA !== seqB) return seqB - seqA;
                    return (b.mulai || "").localeCompare(a.mulai || "");
                });

                const lc = userContracts[0];
                const cJenis = (lc.jenis || "").toLowerCase();

                if (cJenis === "tetap" || cJenis.includes("pkwtt")) latestTipe = "PKWTT";
                else if (cJenis === "kerja" || cJenis.includes("pkwt")) latestTipe = "PKWT";
                else if (cJenis === "magang") latestTipe = "PROBATION";
                else if (cJenis === "freelance") latestTipe = "FREELANCE";
            }

            // 2. Determine final type (latest contract takes priority over manual status if found)
            let newTipe = latestTipe;
            if (!newTipe) {
                if (currentTipe === "KONTRAK" || currentTipe === "PKWT") newTipe = "PKWT";
                else if (currentTipe === "TETAP" || currentTipe === "PKWTT") newTipe = "PKWTT";
                else if (currentTipe === "MAGANG") newTipe = "PROBATION";
            }

            if (newTipe && k.tipeKaryawan !== newTipe) {
                batch.update(d.ref, { tipeKaryawan: newTipe });
                if (latestTipe) statusSyncCount++;
                else migrationCount++;
            }
        });

        if (migrationCount > 0 || statusSyncCount > 0) {
            await batch.commit();
            console.log(`[MIGRATION] Standardized ${migrationCount} labels and Synced ${statusSyncCount} statuses from latest contracts.`);
        }

        // Update Global App Version to trigger client updates
        await db.collection('hrd_settings').doc('app').set({
            version: '16.6.10',
            updatedAt: new Date().toISOString(),
            note: 'Replace Nanda Yoga name references with Muhammad Rizky across Kaizen and reports'
        }, { merge: true });

    } catch (e) {
        console.error("[SEED] Failed to seed peraturan:", e);
    }
}

function renderPeraturanHTML(data, compact){
  let h='';
  const isAdm = hasAccess(3) && !window._portalMode;

  if(!data||!data.bab)return'<p>Data peraturan tidak tersedia.</p>';

  data.bab.forEach((bab, bIdx)=>{
    const editBtn = isAdm ? `<button class="btn btn-xs btn-info ml-8" onclick="modalEditBab(${bIdx})">✏️ Edit</button>` : '';

    h+=`<details id="bab-detail-${bab.nomor}" style="margin-bottom:${compact?'12px':'18px'};border:1px solid #e0e0e0;border-radius:10px;overflow:hidden">
        <summary style="background:#1a237e;color:white;padding:${compact?'10px 14px':'12px 18px'};font-weight:700;font-size:${compact?'0.88rem':'0.95rem'};cursor:pointer;user-select:none;display:flex;align-items:center;justify-content:space-between">
            <span>BAB ${bab.nomor}: ${bab.judul}</span>
            <div>${editBtn}</div>
        </summary>
        <div style="padding:${compact?'12px':'16px 20px'}">`;

    if(bab.pasal){
      bab.pasal.forEach(pasal=>{
        h+=`<div style="margin-bottom:14px;padding:12px 16px;background:#f8f9ff;border-radius:8px;border-left:3px solid #1a237e"><div style="font-weight:700;color:#1a237e;margin-bottom:8px;font-size:.9rem">Pasal ${pasal.nomor}: ${pasal.judul}</div>`;
        if(pasal.isi&&Array.isArray(pasal.isi)){
          h+=`<ol style="padding-left:20px;font-size:0.83rem;line-height:1.9">`;
          pasal.isi.forEach(i=>{h+=`<li style="margin-bottom:4px">${escHtml(i)}</li>`;});
          h+=`</ol>`;
        }
        if(pasal.sub&&Array.isArray(pasal.sub)){
          pasal.sub.forEach(sub=>{
            h+=`<div style="margin-top:10px"><div style="font-weight:600;font-size:.84rem;margin-bottom:6px;color:#283593">${escHtml(sub.label)}</div><ul style="padding-left:20px;font-size:.82rem;line-height:1.9">`;
            if(sub.items&&Array.isArray(sub.items)){
              sub.items.forEach(i=>{h+=`<li style="margin-bottom:2px">${escHtml(i)}</li>`;});
            }
            h+=`</ul></div>`;
          });
        }
        if(pasal.catatan){
          h+=`<div style="margin-top:10px;padding:8px 12px;background:#fff8e1;border-radius:6px;font-size:.8rem;color:#e65100;border:1px solid #ffe0b2"><b>Catatan:</b> ${escHtml(pasal.catatan)}</div>`;
        }
        if(pasal.tabel&&pasal.tabel.headers){
          h+=`<div class="table-wrap" style="margin-top:12px;overflow-x:auto"><table style="width:100%;border-collapse:collapse"><thead><tr>`;
          pasal.tabel.headers.forEach(x=>{h+=`<th style="font-size:.78rem;padding:8px 10px;background:#e8eaf6;border:1px solid #c5cae9;text-align:left">${escHtml(x)}</th>`;});
          h+=`</tr></thead><tbody>`;
          if(pasal.tabel.rows){
            pasal.tabel.rows.forEach(r=>{
              h+=`<tr>`;
              r.forEach(c=>{h+=`<td style="font-size:.8rem;padding:6px 10px;border:1px solid #e0e0e0">${escHtml(c)}</td>`;});
              h+=`</tr>`;
            });
          }
          h+=`</tbody></table></div>`;
        }
        h+=`</div>`;
      });
    }
    h+=`</div></details>`;
  });
  return h;
}

window.renderPeraturan = async function(){
  window._portalMode = false;
  const data = await loadPeraturanData();
  const isAdm = hasAccess(3);
  const addBtn = isAdm ? `<button class="btn btn-primary btn-sm" onclick="modalTambahBab()">+ Tambah Bab</button>` : '';

  document.getElementById('mainContent').innerHTML=
    `<div class="page-title">
        <span>📜 Peraturan Perusahaan</span>
        <div class="flex gap-8">
            ${addBtn}
            <button class="btn btn-outline btn-sm" onclick="window.print()">🖨️ Cetak</button>
        </div>
    </div>
    <div class="card">
        <div style="text-align:center;padding:20px 16px;border-bottom:2px solid #e8eaf6;margin-bottom:24px">
            <div style="font-size:1.4rem;font-weight:700;color:#1a237e">${data.nama}</div>
            <div style="color:#555;font-size:.9rem;margin-top:4px">Peraturan Perusahaan &mdash; Versi ${data.versi}</div>
            <div style="color:#888;font-size:.8rem;margin-top:4px">Ditetapkan di ${data.tempatTerbit}, ${data.tanggalBerlaku}</div>
        </div>
        ${renderPeraturanHTML(data, false)}
    </div>`;

    // Background seed check
    seedPeraturanIfEmpty();
}

// == ADMIN EDITOR LOGIC ========================================

window.modalTambahBab = function() {
    openModal(`
        <div class="modal-title">Tambah Bab Peraturan Baru</div>
        <div class="form-group"><label>Nomor Bab (Romawi)</label><input class="form-control" id="ebNo" placeholder="Contoh: XIII"></div>
        <div class="form-group"><label>Judul Bab</label><input class="form-control" id="ebJudul" placeholder="Contoh: KESEHATAN KARYAWAN"></div>
        <div class="form-group"><label>Isi Pasal Pertama (Opsional)</label><textarea class="form-control" id="ebPasal1" placeholder="Masukkan konten pasal 1..."></textarea></div>
        <button class="btn btn-primary w-100" onclick="simpanBabBaru()">💾 Simpan Bab</button>
    `);
}

async function simpanBabBaru() {
    const no = document.getElementById('ebNo').value;
    const jdl = document.getElementById('ebJudul').value;
    const isi = document.getElementById('ebPasal1').value;
    if(!no || !jdl) return toast("Nomor dan Judul wajib diisi", "warning");

    const data = await loadPeraturanData();
    const newBab = {
        nomor: no,
        judul: jdl.toUpperCase(),
        pasal: isi ? [{ nomor: (data.bab[data.bab.length-1]?.pasal?.[data.bab[data.bab.length-1].pasal.length-1]?.nomor || 0) + 1, judul: 'Ketentuan Umum', isi: [isi] }] : []
    };

    data.bab.push(newBab);
    await updatePeraturanFirestore(data);
    closeModalDirect();
    renderPeraturan();
}

window.modalEditBab = async function(idx) {
    const data = await loadPeraturanData();
    const b = data.bab[idx];
    if(!b) return;

    openModal(`
        <div class="modal-title">Edit BAB ${b.nomor}</div>
        <div class="form-group"><label>Judul Bab</label><input class="form-control" id="ebJudul" value="${escHtml(b.judul)}"></div>
        <div class="form-group">
            <label>Struktur Data (JSON Pasal)</label>
            <p class="text-xs color-danger mb-8">⚠️ Berhati-hatilah saat mengubah bagian ini. Pastikan format JSON tetap valid.</p>
            <textarea class="form-control" id="ebPasalData" style="min-height:300px; font-family:monospace; font-size:.75rem">${JSON.stringify(b.pasal, null, 2)}</textarea>
        </div>
        <div class="flex gap-8">
            <button class="btn btn-primary" style="flex:1" onclick="simpanEditBab(${idx})">💾 Simpan Perubahan</button>
            <button class="btn btn-danger" onclick="hapusBab(${idx})">🗑️ Hapus Bab</button>
        </div>
    `, true);
}

async function simpanEditBab(idx) {
    const jdl = document.getElementById('ebJudul').value;
    const pDataRaw = document.getElementById('ebPasalData').value;
    if(!jdl) return toast("Judul wajib diisi", "warning");

    try {
        const pData = JSON.parse(pDataRaw);
        const data = await loadPeraturanData();
        data.bab[idx].judul = jdl.toUpperCase();
        data.bab[idx].pasal = pData;

        await updatePeraturanFirestore(data);
        closeModalDirect();
        renderPeraturan();
    } catch (e) {
        alert("JSON Tidak Valid: " + e.message);
    }
}

async function hapusBab(idx) {
    if(!confirm("Yakin ingin menghapus Bab ini secara permanen?")) return;
    const data = await loadPeraturanData();
    data.bab.splice(idx, 1);
    await updatePeraturanFirestore(data);
    closeModalDirect();
    renderPeraturan();
}

async function updatePeraturanFirestore(data) {
    toast("⏳ Menyimpan perubahan...", "info");
    try {
        await db.collection('hrd_settings').doc('peraturan').set({
            dataJson: JSON.stringify(data),
            updatedAt: new Date().toISOString(),
            updatedBy: currentUser.nama
        });
        _peraturanCache = data;
        toast("✅ Peraturan berhasil diperbarui", "success");
    } catch (e) {
        toast("Gagal simpan: " + e.message, "error");
        throw e;
    }
}

// == GENERATOR & REGISTER NOMOR SURAT ==========================================-

const DEFAULT_SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/1si__qa9-nKmNzpx7JQIRosUf9tKn5jM2eiS2_V9UMPQ/edit";

window._allSuratData = [];
window._parsedImportSurat = [];

window.openGoogleSheet = function() {
  const url = localStorage.getItem('surat_spreadsheet_url') || DEFAULT_SPREADSHEET_URL;
  window.open(url, '_blank');
};

window.renderSurat = async function() {
  const main = document.getElementById('mainContent');
  if (!main) return;

  main.innerHTML = `
    <div class="page-title">
      <span>${renderBackButton()}✉️ Generator & Register Nomor Surat</span>
      <div class="flex gap-8" style="flex-wrap:wrap">
        <button class="btn btn-success btn-sm" onclick="window.modalSyncGoogleSheet()">⚡ Sync Google Spreadsheet</button>
        <button class="btn btn-outline btn-sm" onclick="window.openGoogleSheet()">🔗 Buka Spreadsheet</button>
        <button class="btn btn-outline btn-sm" onclick="window.exportSuratExcel()">📤 Export Excel</button>
        <button class="btn btn-primary btn-sm" onclick="window.modalSurat()">+ Generate / Input Surat</button>
      </div>
    </div>

    <div class="card mb-16">
      <div class="card-header mb-12" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
        <div class="card-title">📋 Data Register Nomor Surat</div>
        <div class="flex gap-8" style="flex-wrap:wrap">
          <input class="form-control text-xs" id="srSearch" placeholder="🔍 Cari nomor, perihal, dept..." oninput="window.filterSuratTable()" style="max-width:200px">
          <select class="form-control text-xs" id="srFltKategori" onchange="window.filterSuratTable()" style="max-width:140px">
            <option value="">Semua Kategori</option>
            <option value="OFFICE">OFFICE</option>
            <option value="ACADEMIC">ACADEMIC</option>
          </select>
          <select class="form-control text-xs" id="srFltDept" onchange="window.filterSuratTable()" style="max-width:140px">
            <option value="">Semua Departemen</option>
            <option value="HR">HR</option>
            <option value="FINANCE">FINANCE</option>
            <option value="LEGAL">LEGAL</option>
            <option value="STUDENTS">STUDENTS</option>
            <option value="GENERAL AFFAIRS">GENERAL AFFAIRS</option>
            <option value="IT">IT</option>
          </select>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th style="width:40px">No</th>
              <th>Kategori</th>
              <th>Departemen</th>
              <th>Jenis / Keterangan</th>
              <th>Nomor Surat</th>
              <th>Perihal / Ringkasan</th>
              <th>Tanggal</th>
              <th>Dokumen</th>
              <th style="width:110px">Aksi</th>
            </tr>
          </thead>
          <tbody id="tblSurat">
            <tr><td colspan="9" class="text-center color-gray">Memuat data nomor surat...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  try {
    const snap = await db.collection('hrd_surat').get();
    window._allSuratData = [];
    snap.forEach((d) => {
      window._allSuratData.push({ id: d.id, ...d.data() });
    });
    window._allSuratData.sort((a, b) => (b.tanggal || b.createdAt || '').localeCompare(a.tanggal || a.createdAt || ''));
    window.filterSuratTable();
  } catch (e) {
    console.error('Error load hrd_surat:', e);
    const tbody = document.getElementById('tblSurat');
    if (tbody) tbody.innerHTML = `<tr><td colspan="9" class="text-center color-danger">Gagal memuat data: ${escHtml(e.message)}</td></tr>`;
  }
};

window.filterSuratTable = function() {
  const q = (document.getElementById('srSearch')?.value || '').toLowerCase().trim();
  const kat = document.getElementById('srFltKategori')?.value || '';
  const dept = document.getElementById('srFltDept')?.value || '';

  const filtered = (window._allSuratData || []).filter((item) => {
    if (kat && (item.kategori || '').toUpperCase() !== kat.toUpperCase()) return false;
    if (dept && (item.departemen || '').toUpperCase() !== dept.toUpperCase()) return false;
    if (q) {
      const matchText = [
        item.nomor || '',
        item.perihal || '',
        item.departemen || '',
        item.kategori || '',
        item.keterangan || item.jenis || ''
      ].join(' ').toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  const tbody = document.getElementById('tblSurat');
  if (!tbody) return;

  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center color-gray">Belum ada data nomor surat. Klik "+ Generate / Input Surat" atau "Import Excel".</td></tr>';
    return;
  }

  let h = '';
  filtered.forEach((p, idx) => {
    const katBadge = p.kategori === 'ACADEMIC' ? 'badge-primary' : (p.kategori === 'OFFICE' ? 'badge-info' : 'badge-secondary');
    const docBtn = p.dokumenUrl
      ? `<a href="${p.dokumenUrl}" target="_blank" class="btn btn-xs btn-outline" style="padding:2px 6px;font-size:.72rem">📄 Lihat File</a>`
      : `<span class="text-xs color-gray">-</span>`;

    h += `<tr>
      <td class="text-xs color-gray text-center">${idx + 1}</td>
      <td><span class="badge ${katBadge}">${escHtml(p.kategori || 'OFFICE')}</span></td>
      <td class="fw-700 text-xs">${escHtml(p.departemen || '-')}</td>
      <td class="text-xs">${escHtml(p.keterangan || p.jenis || '-')}</td>
      <td class="fw-700 color-primary" style="font-size:.85rem;word-break:break-all">${escHtml(p.nomor || '-')}</td>
      <td class="text-xs" style="max-width:250px">${escHtml(p.perihal || '-')}</td>
      <td class="text-xs color-gray" style="white-space:nowrap">${formatDate(p.tanggal)}</td>
      <td>${docBtn}</td>
      <td>
        <div class="flex gap-4">
          <button class="btn btn-xs btn-info" onclick="window.modalSurat('${p.id}')">✏️</button>
          <button class="btn btn-xs btn-danger" onclick="window.hapusSurat('${p.id}')">🗑️</button>
        </div>
      </td>
    </tr>`;
  });

  tbody.innerHTML = h;
};

window.modalSurat = async function(id) {
  let p = {};
  if (id) {
    const doc = await db.collection('hrd_surat').doc(id).get();
    if (doc.exists) p = doc.data() || {};
  } else {
    const seqNum = String((window._allSuratData || []).length + 1).padStart(3, '0');
    const now = new Date();
    const mo = String(now.getMonth() + 1).padStart(2, '0');
    const yr = String(now.getFullYear()).slice(-2);
    p = {
      kategori: 'OFFICE',
      departemen: 'HR',
      jenis: 'PROBATION',
      keterangan: 'PROBATION',
      nomor: `${seqNum}/Probation/HR-IJEF/${mo}/${yr}`,
      tanggal: todayStr()
    };
  }

  openModal(`
    <div class="modal-title">${id ? 'Edit' : '+ Generate / Input'} Nomor Surat</div>
    <div style="max-height:75vh;overflow-y:auto;padding-right:6px">
      <div class="grid-2 mb-8">
        <div class="form-group">
          <label>Kategori / Divisi</label>
          <select class="form-control" id="srKategori" onchange="window.updateNomorSuratPreview()">
            <option value="OFFICE" ${p.kategori === 'OFFICE' ? 'selected' : ''}>OFFICE</option>
            <option value="ACADEMIC" ${p.kategori === 'ACADEMIC' ? 'selected' : ''}>ACADEMIC</option>
            <option value="LAINNYA" ${p.kategori === 'LAINNYA' ? 'selected' : ''}>LAINNYA</option>
          </select>
        </div>
        <div class="form-group">
          <label>Departemen</label>
          <select class="form-control" id="srDept" onchange="window.updateNomorSuratPreview()">
            <option value="HR" ${(p.departemen || '') === 'HR' ? 'selected' : ''}>HR (Human Resources)</option>
            <option value="FINANCE" ${(p.departemen || '') === 'FINANCE' ? 'selected' : ''}>FINANCE</option>
            <option value="LEGAL" ${(p.departemen || '') === 'LEGAL' ? 'selected' : ''}>LEGAL</option>
            <option value="STUDENTS" ${(p.departemen || '') === 'STUDENTS' ? 'selected' : ''}>STUDENTS</option>
            <option value="GENERAL AFFAIRS" ${(p.departemen || '') === 'GENERAL AFFAIRS' ? 'selected' : ''}>GENERAL AFFAIRS</option>
            <option value="ACADEMIC" ${(p.departemen || '') === 'ACADEMIC' ? 'selected' : ''}>ACADEMIC</option>
            <option value="IT" ${(p.departemen || '') === 'IT' ? 'selected' : ''}>IT</option>
            <option value="MARKETING" ${(p.departemen || '') === 'MARKETING' ? 'selected' : ''}>MARKETING</option>
          </select>
        </div>
      </div>

      <div class="grid-2 mb-8">
        <div class="form-group">
          <label>Jenis / Keterangan Dokumen</label>
          <input class="form-control" id="srKeterangan" value="${escHtml(p.keterangan || p.jenis || '')}" placeholder="Cth: PROBATION, MOU/PKS, SURAT EDARAN, SK, SKet..." oninput="window.updateNomorSuratPreview()">
        </div>
        <div class="form-group">
          <label>Tanggal Surat</label>
          <input type="date" class="form-control" id="srTanggal" value="${p.tanggal || todayStr()}">
        </div>
      </div>

      <div class="form-group mb-8">
        <label>Nomor Surat (Dapat disesuaikan / diedit manual) *</label>
        <input class="form-control fw-700 color-primary" id="srNomor" value="${escHtml(p.nomor || '')}">
      </div>

      <div class="form-group mb-8">
        <label>Perihal / Ringkasan / Penerima Surat *</label>
        <textarea class="form-control" id="srPerihal" rows="3" placeholder="Deskripsi ringkas perihal atau judul surat...">${escHtml(p.perihal || '')}</textarea>
      </div>

      <div class="form-group mb-12">
        <label>Upload Dokumen Surat (PDF / Docx / Gambar) ${p.dokumenUrl ? '<b>(Sudah Ada Dokumen)</b>' : ''}</label>
        <input type="file" class="form-control" id="srFile" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip">
        ${p.dokumenUrl ? `<div class="mt-4 text-xs"><a href="${p.dokumenUrl}" target="_blank" class="color-primary fw-700">📄 Lihat Dokumen Saat Ini (${escHtml(p.dokumenNama || 'File')})</a></div>` : ''}
      </div>
    </div>

    <div class="flex gap-8 justify-end mt-16">
      <button class="btn btn-primary" id="btnSimpanSurat" onclick="window.simpanSurat('${id || ''}')">💾 Simpan Nomor Surat</button>
      <button class="btn btn-outline" onclick="closeModalDirect()">Batal</button>
    </div>
  `, true);
};

window.updateNomorSuratPreview = function() {
  const srNomorInput = document.getElementById('srNomor');
  if (!srNomorInput || srNomorInput.dataset.manualEdited === 'true') return;

  const seq = String((window._allSuratData || []).length + 1).padStart(3, '0');
  const ket = (document.getElementById('srKeterangan')?.value.trim() || 'PROBATION').replace(/\s+/g, '-');
  const dept = (document.getElementById('srDept')?.value || 'HR');
  const now = new Date();
  const mo = String(now.getMonth() + 1).padStart(2, '0');
  const yr = String(now.getFullYear()).slice(-2);

  srNomorInput.value = `${seq}/${ket}/${dept}-IJEF/${mo}/${yr}`;
};

window.simpanSurat = async function(id) {
  const nomor = document.getElementById('srNomor').value.trim();
  const perihal = document.getElementById('srPerihal').value.trim();
  if (!nomor) return toast('Nomor surat wajib diisi', 'warning');
  if (!perihal) return toast('Perihal surat wajib diisi', 'warning');

  const btn = document.getElementById('btnSimpanSurat');
  if (btn) {
    btn.disabled = true;
    btn.innerText = '⏳ Menyimpan...';
  }

  try {
    let dokumenUrl = '';
    let dokumenNama = '';
    const fileInput = document.getElementById('srFile');
    if (fileInput && fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      if (btn) btn.innerText = '⏳ Mengunggah dokumen...';
      const path = `dokumen_surat/${Date.now()}_${file.name}`;
      dokumenUrl = await uploadFileToStorage(file, path);
      dokumenNama = file.name;
    }

    const payload = {
      kategori: document.getElementById('srKategori').value,
      departemen: document.getElementById('srDept').value,
      keterangan: document.getElementById('srKeterangan').value.trim(),
      jenis: document.getElementById('srKeterangan').value.trim(),
      nomor: nomor,
      perihal: perihal,
      tanggal: document.getElementById('srTanggal').value || todayStr(),
      dibuatOleh: currentUser?.nama || 'Admin',
      updatedAt: new Date().toISOString()
    };

    if (dokumenUrl) {
      payload.dokumenUrl = dokumenUrl;
      payload.dokumenNama = dokumenNama;
    }

    if (id) {
      await db.collection('hrd_surat').doc(id).update(payload);
      toast('Nomor surat berhasil diperbarui', 'success');
    } else {
      payload.createdAt = new Date().toISOString();
      await db.collection('hrd_surat').add(payload);
      toast('Nomor surat berhasil digenerate', 'success');
    }

    closeModalDirect();
    window.renderSurat();
  } catch (e) {
    console.error('simpanSurat error:', e);
    toast('Gagal menyimpan: ' + e.message, 'error');
    if (btn) {
      btn.disabled = false;
      btn.innerText = '💾 Simpan Nomor Surat';
    }
  }
};

window.hapusSurat = async function(id) {
  if (!confirm('Yakin ingin menghapus data nomor surat ini?')) return;
  try {
    const doc = await db.collection('hrd_surat').doc(id).get();
    if (doc.exists) {
      const p = doc.data();
      if (p.dokumenUrl) {
        deleteFileFromStorage(p.dokumenUrl).catch(e => console.warn('Delete file err:', e));
      }
    }
    await db.collection('hrd_surat').doc(id).delete();
    toast('Data nomor surat dihapus', 'success');
    window.renderSurat();
  } catch (e) {
    console.error('hapusSurat error:', e);
    toast('Gagal menghapus: ' + e.message, 'error');
  }
};

window.exportSuratExcel = function() {
  const list = window._allSuratData || [];
  if (!list.length) return toast('Belum ada data nomor surat untuk diexport', 'warning');

  const exportData = list.map((p, idx) => ({
    'No': idx + 1,
    'Kategori': p.kategori || 'OFFICE',
    'Departemen': p.departemen || '-',
    'Keterangan': p.keterangan || p.jenis || '-',
    'Nomor Surat': p.nomor || '-',
    'Perihal / Ringkasan': p.perihal || '-',
    'Tanggal': p.tanggal || '-',
    'Link Dokumen': p.dokumenUrl || '-'
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'NOMOR SURAT CODE');
  XLSX.writeFile(wb, `Register_Nomor_Surat_IJEF_${todayStr()}.xlsx`);
  toast('File Excel Register Nomor Surat disalin/diunduh', 'success');
};

window.modalImportSurat = function() {
  window._parsedImportSurat = [];
  openModal(`
    <div class="modal-title">📥 Import Data Register Nomor Surat</div>
    <div class="card mb-12 text-xs" style="background:#f8f9ff;border-left:4px solid var(--primary)">
      <b>Panduan Format Excel / CSV:</b><br>
      • Header kolom yang dikenali: <b>Kategori, Departemen, Keterangan, Nomor, Perihal, Tanggal</b><br>
      • Contoh Kategori: <code>OFFICE</code>, <code>ACADEMIC</code><br>
      • Contoh Departemen: <code>HR</code>, <code>FINANCE</code>, <code>LEGAL</code>, <code>STUDENTS</code><br>
      • Format nomor contoh: <code>NOMOR : 001/Probation/HR-IJEF/IX/25</code>
    </div>

    <div class="form-group mb-12">
      <label>Pilih File Excel / CSV (.xlsx, .xls, .csv)</label>
      <input type="file" class="form-control" id="importSuratInput" accept=".xlsx, .xls, .csv" onchange="window.previewImportSurat(event)">
    </div>

    <div id="importSuratPreviewWrap" style="display:none">
      <div class="fw-700 text-xs mb-4" id="importSuratCountText">Preview Data:</div>
      <div class="table-wrap mb-12" style="max-height:220px;overflow-y:auto">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Kategori</th>
              <th>Dept</th>
              <th>Keterangan</th>
              <th>Nomor</th>
              <th>Perihal</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody id="importSuratTbody"></tbody>
        </table>
      </div>
    </div>

    <div class="flex gap-8 justify-end mt-16">
      <button class="btn btn-primary" id="btnEksekusiImportSurat" onclick="window.eksekusiImportSurat()" disabled>🚀 Impor Data ke System</button>
      <button class="btn btn-outline" onclick="closeModalDirect()">Batal</button>
    </div>
  `, true);
};

window.previewImportSurat = function(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (!rawRows || !rawRows.length) return toast('File Excel kosong', 'warning');

      let headerIdx = 0;
      for (let i = 0; i < Math.min(rawRows.length, 5); i++) {
        const rowStr = (rawRows[i] || []).join(' ').toLowerCase();
        if (rowStr.includes('nomor') || rowStr.includes('keterangan') || rowStr.includes('departemen')) {
          headerIdx = i;
          break;
        }
      }

      const headers = (rawRows[headerIdx] || []).map(h => String(h || '').trim().toLowerCase());

      const findCol = (keywords) => {
        for (let idx = 0; idx < headers.length; idx++) {
          if (keywords.some(k => headers[idx].includes(k))) return idx;
        }
        return -1;
      };

      const katCol = findCol(['kategori', 'category', 'divisi']) !== -1 ? findCol(['kategori', 'category', 'divisi']) : 1;
      const deptCol = findCol(['departemen', 'dept', 'department']) !== -1 ? findCol(['departemen', 'dept', 'department']) : 2;
      const ketCol = findCol(['keterangan', 'jenis', 'tipe']) !== -1 ? findCol(['keterangan', 'jenis', 'tipe']) : 3;
      const nomorCol = findCol(['nomor', 'no.']) !== -1 ? findCol(['nomor', 'no.']) : 4;
      const perihalCol = findCol(['perihal', 'probation', 'subject', 'ringkasan', 'judul']) !== -1 ? findCol(['perihal', 'probation', 'subject', 'ringkasan', 'judul']) : 5;
      const tglCol = findCol(['tanggal', 'tgl', 'date']) !== -1 ? findCol(['tanggal', 'tgl', 'date']) : 6;

      const parsed = [];
      for (let i = headerIdx + 1; i < rawRows.length; i++) {
        const row = rawRows[i];
        if (!row || !row.length) continue;
        const nomorVal = String(row[nomorCol] || '').trim();
        const perihalVal = String(row[perihalCol] || '').trim();
        const ketVal = String(row[ketCol] || '').trim();

        if (!nomorVal && !perihalVal && !ketVal) continue;

        parsed.push({
          kategori: String(row[katCol] || 'OFFICE').trim().toUpperCase(),
          departemen: String(row[deptCol] || 'HR').trim().toUpperCase(),
          keterangan: ketVal || 'SURAT',
          jenis: ketVal || 'SURAT',
          nomor: nomorVal || 'No/IJEF/2026',
          perihal: perihalVal || '-',
          tanggal: String(row[tglCol] || todayStr()).trim()
        });
      }

      window._parsedImportSurat = parsed;

      const previewWrap = document.getElementById('importSuratPreviewWrap');
      const countText = document.getElementById('importSuratCountText');
      const tbody = document.getElementById('importSuratTbody');
      const btn = document.getElementById('btnEksekusiImportSurat');

      if (previewWrap) previewWrap.style.display = 'block';
      if (countText) countText.innerText = `Preview Data (${parsed.length} baris siap diimpor):`;

      let h = '';
      parsed.slice(0, 10).forEach((p, idx) => {
        h += `<tr>
          <td class="text-xs">${idx + 1}</td>
          <td class="text-xs">${escHtml(p.kategori)}</td>
          <td class="text-xs">${escHtml(p.departemen)}</td>
          <td class="text-xs">${escHtml(p.keterangan)}</td>
          <td class="text-xs fw-700">${escHtml(p.nomor)}</td>
          <td class="text-xs">${escHtml(p.perihal)}</td>
          <td class="text-xs">${escHtml(p.tanggal)}</td>
        </tr>`;
      });
      if (tbody) tbody.innerHTML = h;
      if (btn) btn.disabled = parsed.length === 0;

      toast(`Berhasil membaca ${parsed.length} data dari file Excel`, 'success');
    } catch (err) {
      console.error('Error parse Excel:', err);
      toast('Gagal membaca file Excel: ' + err.message, 'error');
    }
  };
  reader.readAsArrayBuffer(file);
};

window.eksekusiImportSurat = async function() {
  const data = window._parsedImportSurat || [];
  if (!data.length) return toast('Tidak ada data untuk diimpor', 'warning');

  const btn = document.getElementById('btnEksekusiImportSurat');
  if (btn) {
    btn.disabled = true;
    btn.innerText = '⏳ Mengimpor data ke Firestore...';
  }

  try {
    let successCount = 0;
    const nowIso = new Date().toISOString();
    const batchSize = 400;

    for (let i = 0; i < data.length; i += batchSize) {
      const chunk = data.slice(i, i + batchSize);
      const batch = db.batch();
      chunk.forEach(item => {
        const docRef = db.collection('hrd_surat').doc();
        batch.set(docRef, {
          ...item,
          dibuatOleh: currentUser?.nama || 'Import System',
          createdAt: nowIso,
          updatedAt: nowIso
        });
        successCount++;
      });
      await batch.commit();
    }

    closeModalDirect();
    toast(`🎉 Berhasil mengimpor ${successCount} data nomor surat!`, 'success');
    window.renderSurat();
  } catch (err) {
    console.error('Gagal impor:', err);
    toast('Gagal mengimpor data: ' + err.message, 'error');
    if (btn) {
      btn.disabled = false;
      btn.innerText = '🚀 Impor Data ke System';
    }
  }
};

window.modalSyncGoogleSheet = function() {
  const currentUrl = localStorage.getItem('surat_spreadsheet_url') || DEFAULT_SPREADSHEET_URL;

  openModal(`
    <div class="modal-title">📊 Sinkronisasi Google Spreadsheet</div>
    <div class="card mb-12 text-xs" style="background:#f8f9ff;border-left:4px solid var(--primary)">
      <b>Google Spreadsheet Terhubung:</b><br>
      • Sheet ID: <code>1si__qa9-nKmNzpx7JQIRosUf9tKn5jM2eiS2_V9UMPQ</code><br>
      • Tab Sheet: <code>NOMOR SURAT CODE</code><br>
      • Klik <b>"⚡ Sync Sekarang"</b> untuk menarik & menyelaraskan seluruh data nomor surat dari Google Spreadsheet ke dalam sistem secara otomatis.
    </div>

    <div class="form-group mb-12">
      <label>URL Google Spreadsheet (Publik / Anyone with link can view)</label>
      <input class="form-control text-xs" id="suratSpreadsheetUrlInput" value="${escHtml(currentUrl)}">
    </div>

    <div class="flex gap-8 justify-end mt-16">
      <button class="btn btn-success" id="btnSyncGSheet" onclick="window.eksekusiSyncGoogleSheet()">⚡ Sync Sekarang</button>
      <button class="btn btn-outline" onclick="window.openGoogleSheet()">🔗 Buka Spreadsheet</button>
      <button class="btn btn-outline" onclick="closeModalDirect()">Tutup</button>
    </div>
  `, true);
};

window.eksekusiSyncGoogleSheet = async function() {
  const inputEl = document.getElementById('suratSpreadsheetUrlInput');
  const url = inputEl?.value.trim() || DEFAULT_SPREADSHEET_URL;

  const btn = document.getElementById('btnSyncGSheet');
  if (btn) {
    btn.disabled = true;
    btn.innerText = '⏳ Menghubungkan ke Google Spreadsheet...';
  }

  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!match || !match[1]) {
    if (btn) { btn.disabled = false; btn.innerText = '⚡ Sync Sekarang'; }
    return toast('URL Google Spreadsheet tidak valid', 'warning');
  }

  const spreadsheetId = match[1];
  const exportCsvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;

  try {
    const res = await fetch(exportCsvUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Gagal mengunduh spreadsheet. Pastikan spreadsheet memiliki akses "Anyone with the link can view".`);
    const csvText = await res.text();

    const workbook = XLSX.read(csvText, { type: 'string' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (!rawRows || rawRows.length <= 1) {
      if (btn) { btn.disabled = false; btn.innerText = '⚡ Sync Sekarang'; }
      return toast('Spreadsheet kosong atau tidak dapat dibaca', 'warning');
    }

    let headerIdx = 0;
    for (let i = 0; i < Math.min(rawRows.length, 5); i++) {
      const rowStr = (rawRows[i] || []).join(' ').toLowerCase();
      if (rowStr.includes('nomor') || rowStr.includes('keterangan') || rowStr.includes('departemen')) {
        headerIdx = i;
        break;
      }
    }

    const headers = (rawRows[headerIdx] || []).map(h => String(h || '').trim().toLowerCase());

    const findCol = (keywords) => {
      for (let idx = 0; idx < headers.length; idx++) {
        if (keywords.some(k => headers[idx].includes(k))) return idx;
      }
      return -1;
    };

    const katCol = findCol(['kategori', 'category', 'divisi']) !== -1 ? findCol(['kategori', 'category', 'divisi']) : 0;
    const deptCol = findCol(['departemen', 'dept', 'department']) !== -1 ? findCol(['departemen', 'dept', 'department']) : 1;
    const ketCol = findCol(['keterangan', 'jenis', 'tipe']) !== -1 ? findCol(['keterangan', 'jenis', 'tipe']) : 2;
    const nomorCol = findCol(['nomor', 'no.']) !== -1 ? findCol(['nomor', 'no.']) : 3;
    const perihalCol = findCol(['probation', 'perihal', 'subject', 'ringkasan', 'judul']) !== -1 ? findCol(['probation', 'perihal', 'subject', 'ringkasan', 'judul']) : 4;
    const tglCol = findCol(['tanggal', 'tgl', 'date']) !== -1 ? findCol(['tanggal', 'tgl', 'date']) : 5;

    const parsed = [];
    for (let i = headerIdx + 1; i < rawRows.length; i++) {
      const row = rawRows[i];
      if (!row || !row.length) continue;
      const nomorVal = String(row[nomorCol] || '').trim();
      const perihalVal = String(row[perihalCol] || '').trim();
      const ketVal = String(row[ketCol] || '').trim();

      if (!nomorVal && !perihalVal && !ketVal) continue;

      parsed.push({
        kategori: String(row[katCol] || 'OFFICE').trim().toUpperCase(),
        departemen: String(row[deptCol] || 'HR').trim().toUpperCase(),
        keterangan: ketVal || 'SURAT',
        jenis: ketVal || 'SURAT',
        nomor: nomorVal || '-',
        perihal: perihalVal || '-',
        tanggal: String(row[tglCol] || todayStr()).trim()
      });
    }

    if (!parsed.length) {
      if (btn) { btn.disabled = false; btn.innerText = '⚡ Sync Sekarang'; }
      return toast('Tidak ada baris data valid di spreadsheet', 'warning');
    }

    if (btn) btn.innerText = `⏳ Menyimpan ${parsed.length} data ke Firestore...`;

    const nowIso = new Date().toISOString();
    const batchSize = 400;
    let count = 0;

    for (let i = 0; i < parsed.length; i += batchSize) {
      const chunk = parsed.slice(i, i + batchSize);
      const batch = db.batch();
      chunk.forEach(item => {
        const docRef = db.collection('hrd_surat').doc();
        batch.set(docRef, {
          ...item,
          dibuatOleh: 'Google Spreadsheet Sync',
          createdAt: nowIso,
          updatedAt: nowIso
        });
        count++;
      });
      await batch.commit();
    }

    localStorage.setItem('surat_spreadsheet_url', url);
    closeModalDirect();
    toast(`🎉 Berhasil menyinkronkan ${count} data nomor surat dari Google Spreadsheet!`, 'success');
    window.renderSurat();
  } catch (err) {
    console.error('Sync err:', err);
    toast('Gagal Sync Google Spreadsheet: ' + err.message, 'error');
    if (btn) {
      btn.disabled = false;
      btn.innerText = '⚡ Sync Sekarang';
    }
  }
};
