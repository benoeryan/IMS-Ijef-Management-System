'use strict';

// PSYCHOLOGY-TEST.JS — IJEF Psychological Test Assessment Module
const firebaseConfig = {
  apiKey: 'AIzaSyAWlNi_iBOWxZBD6E20aHOSrRpPsirDdOM',
  authDomain: 'test-kesehatan-ijef-corp-7c278.firebaseapp.com',
  projectId: 'test-kesehatan-ijef-corp-7c278',
  storageBucket: 'test-kesehatan-ijef-corp-7c278.firebasestorage.app',
  messagingSenderId: '48180557823',
  appId: '1:48180557823:web:47ea8db8126737dbc0d9ca',
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let testState = {
  nama: '',
  usia: '',
  jenisKelamin: '',
  posisi: '',
  kontak: '',
  pelamarId: '',
  healthTestId: '',
  currentQuestion: 0,
  answers: {},
};

function toast(msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'toast';
  div.style.background = type === 'success' ? '#2e7d32' : type === 'warning' ? '#f57f17' : type === 'danger' ? '#c62828' : '#1565c0';
  div.textContent = msg;
  container.appendChild(div);
  setTimeout(() => div.remove(), 4000);
}

function escHtml(str) { return (str || '').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

// 50 Questions directly from IJEF PSYCHOLOGICAL TEST.xlsx
const PSYCHOLOGY_QUESTIONS = [
  { n: 1, cat: "Verbal", q: "API : PANAS = ES : ...", opts: ["Air", "Dingin", "Kutub", "Beku", "Cair"], key: "B" },
  { n: 2, cat: "Verbal", q: "LUMPUH : BERJALAN = ... : MELIHAT", opts: ["Mata", "Buta", "Kacamata", "Terang", "Gelap"], key: "B" },
  { n: 3, cat: "Verbal", q: "ABRASI : HEMPASAN = ... : ...", opts: ["Serpihan : Potongan", "Reruntuhan : Penghancuran", "Rayuan : Pujian", "Memasak : Panas", "Erosi : Angin"], key: "B" },
  { n: 4, cat: "Verbal", q: "PANGGUNG : AKTOR = ... : ...", opts: ["Perpustakaan : Dosen", "Keamanan : Polisi", "Ring : Petinju", "Musik : Konduktor", "Rumah : Ayah"], key: "C" },
  { n: 5, cat: "Verbal", q: "TELESKOP : BINTANG = MIKROSKOP : ...", opts: ["Bakteri", "Laboratorium", "Kaca", "Lensa", "Penyakit"], key: "A" },
  { n: 6, cat: "Verbal", q: "GENERALISASI : KHUSUS = ... : ...", opts: ["Umum : Spesifik", "Teori : Praktek", "Besar : Kecil", "Analisa : Sintesa", "Kapita : Selekta"], key: "A" },
  { n: 7, cat: "Verbal", q: "Lawan kata dari SPORADIS adalah...", opts: ["Jarang", "Sering", "Kadang-kadang", "Berhenti", "Terus-menerus"], key: "E" },
  { n: 8, cat: "Verbal", q: "Lawan kata dari ABSURD adalah...", opts: ["Omong kosong", "Masuk akal", "Mustahil", "Lucu", "Aneh"], key: "B" },
  { n: 9, cat: "Verbal", q: "Sinonim dari TENDENSI adalah...", opts: ["Urat", "Niat", "Kecenderungan", "Tensi", "Ancaman"], key: "C" },
  { n: 10, cat: "Verbal", q: "Sinonim dari EVOKASI adalah...", opts: ["Pengungsian", "Penilaian", "Perubahan", "Penggugah rasa", "Penyelamatan"], key: "D" },

  { n: 11, cat: "Deret Angka", q: "2, 4, 8, 14, 22, ...", opts: ["30", "32", "34", "44", "28"], key: "B" },
  { n: 12, cat: "Deret Angka", q: "1, 3, 9, 27, ...", opts: ["36", "45", "63", "81", "72"], key: "D" },
  { n: 13, cat: "Deret Angka", q: "100, 92, ..., 76, 68, 60", opts: ["80", "82", "84", "86", "88"], key: "C" },
  { n: 14, cat: "Deret Angka", q: "4, 5, 8, 15, 16, 45, 32, ...", opts: ["19", "60", "90", "135", "40"], key: "D" },
  { n: 15, cat: "Deret Angka", q: "2, 3, 5, 8, 13, 21, ...", opts: ["29", "32", "34", "35", "44"], key: "C" },
  { n: 16, cat: "Deret Angka", q: "1, 2, 4, 8, 16, 32, ...", opts: ["36", "46", "48", "64", "54"], key: "D" },
  { n: 17, cat: "Deret Angka", q: "18, 10, 20, ..., ..., 16, 32, 24", opts: ["8 dan 16", "9 dan 3", "12 dan 24", "32 dan 24", "12 dan 34"], key: "C" },
  { n: 18, cat: "Deret Angka", q: "60, 30, 90, 45, 135, ..., ...", opts: ["67.5 dan 202.5", "60 dan 120", "75 dan 150", "50 dan 100", "67.5 dan 135"], key: "A" },
  { n: 19, cat: "Deret Angka", q: "A, C, E, G, ...", opts: ["H", "I", "J", "K", "L"], key: "B" },
  { n: 20, cat: "Deret Angka", q: "A, Z, C, X, E, ...", opts: ["U", "V", "T", "W", "Y"], key: "B" },

  { n: 21, cat: "Matematika", q: "0,25 x 440 = ...", opts: ["100", "110", "88", "120", "105"], key: "B" },
  { n: 22, cat: "Matematika", q: "Berapakah 15% dari 600?", opts: ["80", "85", "90", "95", "100"], key: "C" },
  { n: 23, cat: "Matematika", q: "Jika x = 1/16 dan y = 0,16. Maka...", opts: ["x > y", "x < y", "x = y", "x = 2y", "Hubungan tidak dapat ditentukan"], key: "B" },
  { n: 24, cat: "Matematika", q: "Sebuah mobil menempuh 180 km dalam 3 jam. Berapa kecepatannya?", opts: ["40 km/jam", "50 km/jam", "60 km/jam", "70 km/jam", "80 km/jam"], key: "C" },
  { n: 25, cat: "Matematika", q: "Harga baju Rp 200.000 diskon 25%. Berapa yang harus dibayar?", opts: ["Rp 150.000", "Rp 160.000", "Rp 175.000", "Rp 125.000", "Rp 140.000"], key: "A" },
  { n: 26, cat: "Matematika", q: "3 pekerja membangun tembok dalam 12 hari. Berapa hari jika 6 pekerja?", opts: ["24 hari", "18 hari", "8 hari", "6 hari", "4 hari"], key: "D" },
  { n: 27, cat: "Matematika", q: "Umur Budi 4 tahun lebih tua dari Andi. Jumlah umur mereka 24 tahun. Umur Andi adalah...", opts: ["8 tahun", "10 tahun", "12 tahun", "14 tahun", "16 tahun"], key: "B" },
  { n: 28, cat: "Matematika", q: "1 gross - 10 lusin = ... buah", opts: ["12 buah", "24 buah", "36 buah", "48 buah", "144 buah"], key: "B" },
  { n: 29, cat: "Matematika", q: "Mana yang nilainya terbesar?", opts: ["1/2 dari 100", "2/3 dari 60", "10% dari 600", "0,6 x 90", "4/5 dari 50"], key: "C" },
  { n: 30, cat: "Matematika", q: "Kubus memiliki volume 64 cm3. Berapa panjang sisinya?", opts: ["2 cm", "3 cm", "4 cm", "6 cm", "8 cm"], key: "C" },

  { n: 31, cat: "Logika", q: "Semua ikan bernapas dengan insang. Paus bernapas dengan paru-paru.", opts: ["Paus adalah ikan", "Semua ikan adalah paus", "Paus bukan ikan", "Sebagian ikan bernapas paru-paru", "Tidak ada kesimpulan"], key: "C" },
  { n: 32, cat: "Logika", q: "Jika hujan, tanah basah. Tanah kering. Maka...", opts: ["Hujan rintik-rintik", "Tidak hujan", "Mungkin hujan", "Tanah tidak subur", "Hujan lebat"], key: "B" },
  { n: 33, cat: "Logika", q: "Semua A adalah B. Sebagian B adalah C. Maka...", opts: ["Semua A adalah C", "Sebagian A adalah C", "Semua C adalah A", "Sebagian A mungkin bukan C", "Semua B adalah A"], key: "D" },
  { n: 34, cat: "Logika", q: "Karyawan teladan selalu datang pagi. Budi datang pagi.", opts: ["Budi karyawan teladan", "Budi pasti bukan karyawan teladan", "Budi mungkin karyawan teladan", "Budi karyawan malas", "Budi ingin dipuji"], key: "C" },
  { n: 35, cat: "Logika", q: "Tidak ada manusia yang abadi. Plato adalah manusia.", opts: ["Plato akan mati", "Plato sudah mati", "Plato dewa", "Plato abadi", "Plato filsuf"], key: "A" },
  { n: 36, cat: "Logika", q: "Burung : Terbang = Ular : ...", opts: ["Patuk", "Melata", "Berbisa", "Panjang", "Reptil"], key: "B" },
  { n: 37, cat: "Logika", q: "Mana yang tidak masuk kelompoknya?", opts: ["Sapi", "Kambing", "Kerbau", "Singa", "Rusa"], key: "D" },
  { n: 38, cat: "Logika", q: "Mana yang tidak masuk kelompoknya?", opts: ["Gitar", "Biola", "Harpa", "Piano", "Cello"], key: "D" },
  { n: 39, cat: "Logika", q: "Jika KITA = 4, SAYA = 4, DIA = 3, maka MEREKA = ...", opts: ["4", "5", "6", "7", "8"], key: "C" },
  { n: 40, cat: "Logika", q: "Anda menghadap Utara, belok kanan 2 kali, belok kiri 1 kali. Menghadap mana?", opts: ["Utara", "Selatan", "Barat", "Timur", "Tenggara"], key: "D" },

  { n: 41, cat: "Ketelitian", q: "Bandingkan: 8890-Jhg-11 vs 8890-Jhg-11. Sama atau Beda?", opts: ["Sama", "Beda", "Mirip", "Salah", "Ragu"], key: "A" },
  { n: 42, cat: "Ketelitian", q: "Bandingkan: Rp 1.500.200 vs Rp 1.500.020. Sama atau Beda?", opts: ["Sama", "Beda", "Mirip", "Salah", "Ragu"], key: "B" },
  { n: 43, cat: "Ketelitian", q: "Bandingkan: Tokyo-Osaka-Kyoto vs Tokyo-Osaka-Kyoto.", opts: ["Sama", "Beda", "Mirip", "Salah", "Ragu"], key: "A" },
  { n: 44, cat: "Ketelitian", q: "Jumlah huruf \"i\" dalam kata \"INDIVIDUALISASI\" adalah...", opts: ["3", "4", "5", "6", "7"], key: "C" },
  { n: 45, cat: "Ketelitian", q: "Jika A=1, B=2, C=3. Berapa jumlah B+C+E?", opts: ["9", "10", "11", "12", "8"], key: "B" },

  { n: 46, cat: "Spasial", q: "Sebuah kertas dilipat dua, lalu dilipat dua lagi. Saat dibuka ada berapa kotak lipatan?", opts: ["2", "4", "6", "8", "10"], key: "B" },
  { n: 47, cat: "Spasial", q: "Jaring-jaring kubus terdiri dari berapa persegi?", opts: ["4", "5", "6", "7", "8"], key: "C" },
  { n: 48, cat: "Spasial", q: "Sudut terkecil jam pada pukul 03.00 adalah...", opts: ["45 derajat", "60 derajat", "90 derajat", "120 derajat", "180 derajat"], key: "C" },
  { n: 49, cat: "Spasial", q: "Jika roda A berputar searah jarum jam, dan bersinggungan dengan roda B. Roda B berputar...", opts: ["Searah jarum jam", "Berlawanan jarum jam", "Diam", "Ke atas", "Ke bawah"], key: "B" },
  { n: 50, cat: "Spasial", q: "Ibukota Jepang sebelum Tokyo adalah...", opts: ["Osaka", "Kyoto", "Nara", "Hiroshima", "Hokkaido"], key: "B" }
];

document.addEventListener('DOMContentLoaded', () => {
  readQueryParams();
  renderCandidateForm();
  fetchPelamarOptions().then(html => {
    const cont = document.getElementById('dlContainer');
    if(cont) cont.innerHTML = html;
    const sel = document.getElementById('fNama');
    if (sel) {
      sel.addEventListener('change', async (e) => {
        const selectedName = e.target.value;
        if (!selectedName) return;
        try {
          const snap = await db.collection('hrd_pelamar').where('nama', '==', selectedName).limit(1).get();
          if (!snap.empty) {
            const p = snap.docs[0].data();
            document.getElementById('fPosisi').value = p.posisi || '';
            document.getElementById('fUsia').value = p.usia || '';
            document.getElementById('fGender').value = p.jenisKelamin || '';
            document.getElementById('fKontak').value = p.email || p.telepon || '';
            testState.pelamarId = snap.docs[0].id;
          }
        } catch(err) {}
      });
    }
  });
});

async function fetchPelamarOptions() {
  let opts = '<datalist id="pelamarList">';
  try {
    const pSnap = await db.collection('hrd_pelamar').get();
    pSnap.forEach(d => {
       if (d.data().nama) {
          opts += '<option value="' + d.data().nama + '"></option>';
       }
    });
  } catch(e) { console.warn(e); }
  opts += '</datalist>';
  return opts;
}

function readQueryParams() {
  const params = new URLSearchParams(window.location.search);
  testState.nama = params.get('nama') || sessionStorage.getItem('pelamar_nama') || '';
  testState.posisi = params.get('posisi') || sessionStorage.getItem('pelamar_posisi') || '';
  testState.kontak = params.get('kontak') || sessionStorage.getItem('pelamar_kontak') || '';
  testState.jenisKelamin = params.get('gender') || sessionStorage.getItem('pelamar_gender') || '';
  testState.usia = params.get('usia') || sessionStorage.getItem('pelamar_usia') || '';
  testState.pelamarId = params.get('pelamarId') || sessionStorage.getItem('pelamar_id') || '';
}

function renderCandidateForm() {
  document.getElementById('app').innerHTML = `
    <div class="card" style="max-width:620px;margin:30px auto;padding:28px;border-radius:14px;box-shadow:0 4px 20px rgba(0,0,0,.08)">
      <div style="font-size:1.15rem;font-weight:700;color:var(--primary);margin-bottom:6px">🧩 Langkah 3 dari 4: IJEF Psychological Test</div>
      <div style="font-size:.82rem;color:var(--text-light);margin-bottom:18px">Tes Kemampuan Berpikir & Logika Psikotes (50 Soal Pilihan Ganda)</div>

      <div style="background:#e3f2fd;padding:14px 16px;border-radius:10px;border-left:4px solid var(--info);margin-bottom:20px;font-size:.85rem;line-height:1.6;color:#0d47a1">
        <strong>Konfirmasi Data Diri:</strong> Silakan periksa atau lengkapi data Anda di bawah ini sebelum memulai pengerjaan tes.
      </div>

      <div class="form-group">
        <label>Nama Lengkap <span style="color:var(--danger)">*</span></label>
        <input class="form-control" id="fNama" list="pelamarList" value="${escHtml(testState.nama)}" required placeholder="Ketik manual atau pilih dari daftar...">
        <div id="dlContainer"></div>
      </div>

      <div class="grid-2">
        <div class="form-group">
          <label>Usia (Tahun)</label>
          <input class="form-control" type="number" id="fUsia" value="${escHtml(testState.usia)}" placeholder="Contoh: 23">
        </div>
        <div class="form-group">
          <label>Jenis Kelamin</label>
          <select class="form-control" id="fGender">
            <option value="">-- Pilih Jenis Kelamin --</option>
            <option ${testState.jenisKelamin==='Laki-laki'?'selected':''}>Laki-laki</option>
            <option ${testState.jenisKelamin==='Perempuan'?'selected':''}>Perempuan</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>Posisi yang Dilamar <span style="color:var(--danger)">*</span></label>
        <input class="form-control" id="fPosisi" value="${escHtml(testState.posisi)}" required placeholder="Contoh: Staff Admin / Marketing / Sensei">
      </div>

      <div class="form-group">
        <label>Email / No. HP (WhatsApp)</label>
        <input class="form-control" id="fKontak" value="${escHtml(testState.kontak)}" placeholder="Contoh: 08123456789 / email@domain.com">
      </div>

      <button class="btn btn-primary" style="width:100%;padding:14px;font-size:1rem;border-radius:30px;margin-top:10px;box-shadow:0 4px 12px rgba(26,35,126,.3)" onclick="startPsychologyTest()">
        🧩 Mulai Tes Psikologi Sekarang ➔
      </button>
    </div>
  `;
}

function startPsychologyTest() {
  const nama = document.getElementById('fNama').value.trim();
  const posisi = document.getElementById('fPosisi').value.trim();
  if (!nama || !posisi) return toast('Nama dan Posisi wajib diisi', 'warning');

  testState.nama = nama;
  testState.posisi = posisi;
  testState.usia = document.getElementById('fUsia').value;
  testState.jenisKelamin = document.getElementById('fGender').value;
  testState.kontak = document.getElementById('fKontak').value;
  testState.currentQuestion = 0;
  testState.answers = {};

  renderQuestion();
}

function renderQuestion() {
  const qIdx = testState.currentQuestion;
  const item = PSYCHOLOGY_QUESTIONS[qIdx];
  const total = PSYCHOLOGY_QUESTIONS.length;
  const answeredCount = Object.keys(testState.answers).length;

  let gridBtns = '';
  PSYCHOLOGY_QUESTIONS.forEach((q, i) => {
    const isAnswered = testState.answers[i] !== undefined;
    const isCurrent = i === qIdx;
    gridBtns += `<div class="q-num-btn ${isCurrent ? 'current' : isAnswered ? 'answered' : ''}" onclick="jumpQuestion(${i})">${i+1}</div>`;
  });

  const letterMap = ['A', 'B', 'C', 'D', 'E'];
  let optionsHtml = '';
  item.opts.forEach((optText, oIdx) => {
    const letter = letterMap[oIdx];
    const isSelected = testState.answers[qIdx] === letter;
    optionsHtml += `
      <div class="option-box ${isSelected ? 'selected' : ''}" onclick="selectAnswer('${letter}')">
        <div style="width:28px;height:28px;border-radius:50%;background:${isSelected ? 'var(--primary)' : '#eee'};color:${isSelected ? '#fff' : '#333'};display:flex;align-items:center;justify-content:center;font-weight:700">${letter}</div>
        <div style="flex:1;font-size:.9rem">${escHtml(optText)}</div>
      </div>
    `;
  });

  document.getElementById('app').innerHTML = `
    <div class="card mb-12" style="border-left:4px solid var(--primary)">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
        <div>
          <div class="fw-700" style="color:var(--primary);font-size:1rem">${escHtml(testState.nama)} — ${escHtml(testState.posisi)}</div>
          <div class="text-xs color-gray">Kategori: <b>${item.cat}</b> | Soal ${qIdx + 1} dari ${total} (Terjawab: ${answeredCount}/${total})</div>
        </div>
        <button class="btn btn-accent btn-sm" onclick="confirmSubmitPsychologyTest()">📤 Selesaikan Tes</button>
      </div>
    </div>

    <!-- Question Number Nav Grid -->
    <div class="q-num-grid">${gridBtns}</div>

    <!-- Question Card -->
    <div class="card mb-16">
      <div class="fw-700 mb-16" style="font-size:1.05rem;line-height:1.6;color:#111">
        ${qIdx + 1}. ${escHtml(item.q)}
      </div>
      <div>${optionsHtml}</div>

      <div style="display:flex;justify-content:space-between;margin-top:20px">
        <button class="btn btn-outline" ${qIdx === 0 ? 'disabled style="opacity:.4"' : ''} onclick="prevQuestion()">⬅️ Sebelumnya</button>
        ${qIdx < total - 1 ? `<button class="btn btn-primary" onclick="nextQuestion()">Selanjutnya ➔</button>` : `<button class="btn btn-accent" onclick="confirmSubmitPsychologyTest()">Selesai & Kirim ➔</button>`}
      </div>
    </div>
  `;
}

function selectAnswer(letter) {
  testState.answers[testState.currentQuestion] = letter;
  renderQuestion();
}

function nextQuestion() {
  if (testState.currentQuestion < PSYCHOLOGY_QUESTIONS.length - 1) {
    testState.currentQuestion++;
    renderQuestion();
  }
}

function prevQuestion() {
  if (testState.currentQuestion > 0) {
    testState.currentQuestion--;
    renderQuestion();
  }
}

function jumpQuestion(i) {
  testState.currentQuestion = i;
  renderQuestion();
}

function confirmSubmitPsychologyTest() {
  const answeredCount = Object.keys(testState.answers).length;
  const total = PSYCHOLOGY_QUESTIONS.length;
  if (answeredCount < total) {
    if (!confirm(`Anda baru menjawab ${answeredCount} dari ${total} soal. Yakin ingin menyelesaikan tes sekarang?`)) return;
  } else {
    if (!confirm('Kirim seluruh jawaban Tes Psikologi?')) return;
  }
  submitPsychologyTest();
}

async function submitPsychologyTest() {
  document.getElementById('app').innerHTML = `
    <div class="card text-center" style="padding:40px;margin-top:40px">
      <div style="font-size:3rem;margin-bottom:16px">⏳</div>
      <h3 style="color:var(--primary)">Mengevaluasi Hasil Tes Psikologi & Menghubungkan ke Test Kesehatan...</h3>
      <p class="text-sm color-gray mt-8">Mohon tunggu sebentar...</p>
    </div>
  `;

  // Calculate Category Scores
  let verbalScore = 0;     // Q1 - Q10 (10 questions * 2 = 20 max)
  let hitunganScore = 0;   // Q11 - Q30 (20 questions * 2 = 40 max)
  let logikaScore = 0;     // Q31 - Q40 (10 questions * 2 = 20 max)
  let ketelitianScore = 0; // Q41 - Q45 (5 questions * 2 = 10 max)
  let spasialScore = 0;    // Q46 - Q50 (5 questions * 2 = 10 max)

  PSYCHOLOGY_QUESTIONS.forEach((q, idx) => {
    const userAns = testState.answers[idx];
    if (userAns === q.key) {
      if (idx < 10) verbalScore += 2;
      else if (idx < 30) hitunganScore += 2;
      else if (idx < 40) logikaScore += 2;
      else if (idx < 45) ketelitianScore += 2;
      else spasialScore += 2;
    }
  });

  const totalScore = verbalScore + hitunganScore + logikaScore + ketelitianScore + spasialScore;

  // Recommendation Qualifier
  let recommendation = "";
  if (totalScore >= 80) recommendation = "HIGH POTENTIAL (Sangat Disarankan)";
  else if (totalScore >= 60) recommendation = "STANDARD QUALIFIED (Disarankan)";
  else if (totalScore >= 45) recommendation = "CONDITIONAL (Dipertimbangkan dengan Catatan)";
  else recommendation = "NOT RECOMMENDED (Tidak Disarankan)";

  // Save to hrd_psychology_results
  try {
    const resultRef = await db.collection('hrd_psychology_results').add({
      nama: testState.nama,
      posisi: testState.posisi,
      kontak: testState.kontak || '',
      pelamarId: testState.pelamarId || '',
      verbalScore,
      hitunganScore,
      logikaScore,
      ketelitianScore,
      spasialScore,
      totalScore,
      recommendation,
      createdAt: new Date().toISOString()
    });

    // Update hrd_pelamar
    if (testState.pelamarId) {
      try {
        await db.collection('hrd_pelamar').doc(testState.pelamarId).update({
          psychologyStatus: 'Selesai',
          psychologyScore: totalScore,
          psychologyResult: recommendation,
          psychologyDoneAt: new Date().toISOString()
        });
      } catch (e1) { console.warn(e1); }
    }

    // Auto Check / Create Health Test Invitation for Step 4
    let healthTestId = '';
    try {
      let hSnap;
      if (testState.pelamarId) {
        hSnap = await db.collection('hrd_test_kesehatan')
          .where('pelamarId', '==', testState.pelamarId)
          .get();
      } else {
        hSnap = await db.collection('hrd_test_kesehatan')
          .where('nama', '==', testState.nama)
          .get();
      }

      let pendingDoc = hSnap.docs.find(d => d.data().status === 'pending' || d.data().tipe === 'calon');
      if (pendingDoc) {
        healthTestId = pendingDoc.id;
      } else {
        const newH = await db.collection('hrd_test_kesehatan').add({
          nama: testState.nama,
          posisi: testState.posisi || '',
          tipe: 'calon',
          status: 'pending',
          pelamarId: testState.pelamarId || '',
          kontak: testState.kontak || '',
          tanggal: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
          createdAt: new Date().toISOString()
        });
        healthTestId = newH.id;
      }
      testState.healthTestId = healthTestId;
    } catch (e2) { console.warn('Health test creation warning:', e2); }

    // Update hrd_kandidat pipeline to 'psychology'
    try {
      const kSnap = await db.collection('hrd_kandidat')
        .where('nama', '==', testState.nama)
        .get();
      if (!kSnap.empty) {
        kSnap.docs[0].ref.update({
          stage: 'psychology',
          psychologyScore: totalScore,
          psychologyResult: recommendation,
          healthTestId: healthTestId,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (e3) { console.warn(e3); }

    renderCompletionScreen(totalScore, recommendation);

  } catch (err) {
    console.error(err);
    toast('Gagal menyimpan hasil: ' + err.message, 'danger');
  }
}

function renderCompletionScreen(totalScore, recommendation) {
  const healthUrl = `test-kesehatan.html?id=${testState.healthTestId || ''}&pelamarId=${testState.pelamarId || ''}`;
  document.getElementById('app').innerHTML = `
    <div style="max-width:650px;margin:40px auto;text-align:center">
      <div style="background:#fff;border-radius:16px;padding:40px 30px;box-shadow:0 4px 20px rgba(0,0,0,.1);border-top:6px solid var(--primary)">
        <div style="font-size:3.5rem;margin-bottom:16px">✅</div>
        <h2 style="color:var(--primary);margin-bottom:12px">TES PSIKOLOGI SELESAI</h2>
        <p style="font-size:1rem;color:var(--text);line-height:1.8;margin-bottom:20px">
          Terima kasih, <strong>${escHtml(testState.nama)}</strong>.<br>
          Jawaban Tes Psikologi IJEF Anda telah tersimpan dengan sukses.<br><br>
          <strong style="color:var(--primary);font-size:1.05rem">Langkah Terakhir (Langkah 4 dari 4): Mengisi Test Kesehatan Calon Karyawan</strong>
        </p>
        <p style="font-size:.85rem;color:var(--text-light);margin-bottom:24px">
          Silakan klik tombol di bawah untuk mengisi form <strong>Test Kesehatan</strong> guna melengkapi seluruh 4 rangkaian proses seleksi rekrutmen.
        </p>
        <a href="${healthUrl}" class="btn" style="padding:14px 32px;background:var(--primary);color:#fff;border-radius:30px;font-size:1rem;font-weight:700;text-decoration:none;display:inline-block;box-shadow:0 4px 12px rgba(26,35,126,.3)">
          🏥 Lanjutkan ke Test Kesehatan (Langkah Terakhir) ➔
        </a>
      </div>
      <p style="margin-top:20px;font-size:.72rem;color:#999">© 2026 LPK IJEF Corp — HR Assessment System</p>
    </div>
  `;

  // Auto redirect after 3 seconds
  if (testState.healthTestId) {
    setTimeout(() => {
      window.location.href = healthUrl;
    }, 3000);
  }
}
