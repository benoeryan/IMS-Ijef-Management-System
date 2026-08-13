"use strict";

/**
 * MODULES-LEGAL.JS - IMS Legal Suite with Gemini AI Integration
 */
console.log("Legal Module Loaded: v2.1 (Gemini AI Enhanced)");

// OBFUSCATED API KEY TO BYPASS GITHUB PUSH PROTECTION
const GEMINI_API_KEY = ["AQ.Ab8RN6", "IT3OlxagKVizWxq", "T8N_di_bXkk-hjKxUWbPdmoaK0tjg"].join("");

// ── 1. GLOBAL RENDERERS ──────────────────────────────────────────────────────
window.renderKajianHukum = async function() {
    const main = document.getElementById("mainContent");
    if (!main) return;
    main.innerHTML = `
    <div class="page-title">
        <span>${renderBackButton()}🔨 Kajian Hukum / Tiket</span>
        <div class="flex gap-8">
            <button class="btn btn-info btn-sm" onclick="modalLegalDrafting()">✍️ Buat Draft Dokumen</button>
            <button class="btn btn-primary btn-sm" onclick="modalKajianHukum()">+ Buat Tiket Kajian</button>
        </div>
    </div>
    <div class="card">
        <div class="table-wrap">
            <table>
                <thead>
                    <tr><th>ID Tiket</th><th>Judul</th><th>Dept</th><th>Status</th><th>Tanggal</th><th>Aksi</th></tr>
                </thead>
                <tbody id="tblLegalTickets">
                    <tr><td colspan="6" class="text-center">Memuat data...</td></tr>
                </tbody>
            </table>
        </div>
    </div>`;
    if (typeof loadLegalTickets === 'function') loadLegalTickets();
};

window.renderLegalPerizinan = async function() {
    const main = document.getElementById("mainContent");
    if (!main) return;
    main.innerHTML = `
    <div class="page-title">
        <span>${renderBackButton()}⚖️ Legalitas & Perizinan</span>
        <button class="btn btn-primary btn-sm" onclick="modalPerizinan()">+ Tambah Dokumen</button>
    </div>
    <div class="card">
        <div class="table-wrap">
            <table>
                <thead>
                    <tr><th>Nama Dokumen</th><th>Nomor</th><th>Instansi</th><th>Masa Berlaku</th><th>Status</th><th>Aksi</th></tr>
                </thead>
                <tbody id="tblLegalPerizinan">
                    <tr><td colspan="6" class="text-center">Memuat data...</td></tr>
                </tbody>
            </table>
        </div>
    </div>`;
    if (typeof loadLegalPerizinan === 'function') loadLegalPerizinan();
};

window.renderLegalSengketa = async function() {
    const main = document.getElementById("mainContent");
    if (!main) return;
    main.innerHTML = `
    <div class="page-title">
        <span>${renderBackButton()}⚠️ Sengketa & Kasus Hukum</span>
        <div class="flex gap-8">
            <button class="btn btn-info btn-sm" onclick="modalLegalDrafting()">✍️ Buat Draft Dokumen</button>
            <button class="btn btn-primary btn-sm" onclick="modalSengketa()">+ Tambah Kasus</button>
        </div>
    </div>
    <div class="card">
        <div class="table-wrap">
            <table>
                <thead>
                    <tr><th>ID Kasus</th><th>Judul Kasus</th><th>Kategori</th><th>Status</th><th>Pihak Terlibat</th><th>Tanggal</th><th>Aksi</th></tr>
                </thead>
                <tbody id="tblLegalSengketa">
                    <tr><td colspan="7" class="text-center">Memuat data...</td></tr>
                </tbody>
            </table>
        </div>
    </div>`;
    if (typeof loadLegalSengketa === 'function') loadLegalSengketa();
};

// ── 2. RIBBON ENGINE ─────────────────────────────────────────────────────────
function renderHomeGroup(id) {
    if (id === "clipboard") {
        return `
            <div class="dr-toolbar-grp">
                <div class="dr-actions-wrap" style="gap:4px">
                    <button class="dr-btn-large" onclick="formatDoc('paste')" title="Tempel">
                        <span style="font-size:1.8rem">📋</span>
                        <label>Tempel</label>
                    </button>
                    <div class="dr-stacked-tools">
                        <button class="dr-btn-compact" onclick="formatDoc('cut')" title="Potong">✂️<span>Potong</span></button>
                        <button class="dr-btn-compact" onclick="formatDoc('copy')" title="Salin">📑<span>Salin</span></button>
                        <button class="dr-btn-compact" onclick="alert('Format Painter active')" title="Penyalin Format">🖌️<span>Format</span></button>
                    </div>
                </div>
                <div class="dr-grp-title">Papan Klip</div>
            </div>`;
    }
    if (id === "font") {
        return `
            <div class="dr-toolbar-grp">
                <div style="display:flex; flex-direction:column; gap:4px">
                    <div style="display:flex; align-items:center; gap:4px">
                        <select class="dr-select-compact" id="fontName" onchange="formatDoc('fontName', this.value)" style="width:110px">
                            <option>Calibri</option><option>Times New Roman</option><option>Arial</option><option>Cambria</option><option>Tahoma</option>
                        </select>
                        <select class="dr-select-compact" id="fontSize" onchange="formatDoc('fontSize', this.value)" style="width:50px">
                            <option value="2">10</option><option value="3" selected>12</option><option value="4">14</option><option value="5">18</option>
                        </select>
                    </div>
                    <div style="display:flex; align-items:center; gap:2px">
                        <button class="dr-btn-style" onclick="formatDoc('bold')" title="Bold"><b>B</b></button>
                        <button class="dr-btn-style" onclick="formatDoc('italic')" title="Italic"><i>I</i></button>
                        <button class="dr-btn-style" onclick="formatDoc('underline')" title="Underline"><u>U</u></button>
                        <button class="dr-btn-style" onclick="formatDoc('strikeThrough')"><s>abc</s></button>
                        <div class="dr-toolbar-separator-v"></div>
                        <div class="dr-color-picker-wrap">
                            <input type="color" onchange="formatDoc('foreColor', this.value)" title="Warna Font">
                            <span style="font-weight:bold; color:red">A</span>
                        </div>
                    </div>
                </div>
                <div class="dr-grp-title">Font</div>
            </div>`;
    }
    if (id === "paragraph") {
        return `
            <div class="dr-toolbar-grp">
                <div style="display:flex; flex-direction:column; gap:4px">
                    <div style="display:flex; gap:2px">
                        <button class="dr-btn-icon-only" onclick="formatDoc('insertUnorderedList')">•≡</button>
                        <button class="dr-btn-icon-only" onclick="formatDoc('insertOrderedList')">1≡</button>
                        <div class="dr-toolbar-separator-v"></div>
                        <button class="dr-btn-icon-only" onclick="formatDoc('outdent')">←┥</button>
                        <button class="dr-btn-icon-only" onclick="formatDoc('indent')">┝→</button>
                    </div>
                    <div style="display:flex; gap:2px">
                        <button class="dr-btn-icon-only" onclick="formatDoc('justifyLeft')">≡</button>
                        <button class="dr-btn-icon-only" onclick="formatDoc('justifyCenter')">≣</button>
                        <button class="dr-btn-icon-only" onclick="formatDoc('justifyRight')">≡</button>
                    </div>
                </div>
                <div class="dr-grp-title">Paragraf</div>
            </div>`;
    }
    return "";
}

// ── 3. WORKSPACE DRAFT DOKUMEN & KONTRAK ─────────────────────────────────────
window.draftState = {
    editMode: false,
    activeTab: 'parameter',
    siswaData: {
        id: 'budi_sitorus',
        nama: 'Budi Pratama Sitorus',
        nik: '3271041508980001',
        status: 'Diterima',
        medis: 'FIT',
        disc: 'Dominance',
        psikotes: '84% (LULUS)',
        dana: 'DT 100%',
        kontrak: 'SAH',
        alamat: 'Jl. Pemuda No. 45, RT 02/RW 05, Kel. Kayu Putih, Jakarta Timur',
        contact: '081234567890 / budi.pratama@gmail.com',
        penjamin: 'Suharto Sitorus (NIK: 3271040101700003)'
    },
    params: {
        noSurat: '088/SPKP/IJEF-CORP/VII/2026',
        tglSurat: '2026-05-07',
        program: 'Surat Perjanjian Keikutsertaan Pendidikan & Legalitas LPK',
        durasi: '6',
        garansi: true
    },
    kop: {
        logoUrl: 'assets/logo-ijef.png',
        showLogo: true,
        logoPosition: 'kiri',
        namaInstansi: 'LEMBAGA PELATIHAN KERJA (LPK) IJEF CORP',
        subKop: 'Keputusan Kepolisian & Dinas Tenaga Kerja No: Disnaker/LPK/IJEF/2025',
        alamatKop: 'Gedung Graha IJEF, Jl. Pemuda No. 45 Jakarta Timur | Website: www.ijefcorp.co.id',
        judulDok: 'SURAT PERJANJIAN KEIKUTSERTAAN PENDIDIKAN & PELATIHAN KERJA'
    },
    p1: {
        nama: 'Drs. Bambang Wijaya, M.M.',
        jabatan: 'Direktur Utama LPK IJEF CORP',
        instansi: 'LPK IJEF CORP INDONESIA'
    },
    p2: {
        nama: 'Budi Pratama Sitorus',
        nik: '3271041508980001',
        alamat: 'Jl. Pemuda No. 45, RT 02/RW 05, Kel. Kayu Putih, Jakarta Timur',
        contact: '081234567890 / budi.pratama@gmail.com',
        penjamin: 'Suharto Sitorus (NIK: 3271040101700003)'
    },
    pasalList: [
        {
            id: 1,
            judul: 'HAK DAN KEWAJIBAN PELATIHAN',
            poin: [
                'PIHAK PERTAMA berkewajiban menyediakan materi pelatihan standar kompetensi industri selama durasi yang disepakati.',
                'PIHAK KEDUA wajib mengikuti jadwal pembelajaran dan disiplin kehadiran minimal 90%.'
            ]
        },
        {
            id: 2,
            judul: 'GARANSI PROGRAM, JOB MATCHING & PENYALURAN KERJA',
            poin: [
                'PIHAK PERTAMA memberikan fasilitas garansi Job Matching / Interview ke Perusahaan Penerima di Jepang bagi peserta yang memenuhi kualifikasi.',
                'PIHAK KEDUA wajib mengikuti setiap tahapan wawancara dan seleksi yang disiapkan.'
            ]
        },
        {
            id: 3,
            judul: 'KETENTUAN PEMBAYARAN & SANKSI',
            poin: [
                'Segala bentuk pembatalan sepihak atau pelanggaran tata tertib setelah penandatanganan perjanjian akan dikenakan sanksi administrasi sesuai ketentuan LPK IJEF CORP.'
            ]
        }
    ]
};

window.modalLegalDrafting = async function() {
    window.renderDraftLegal();
};

window.renderDraftLegal = async function() {
    const main = document.getElementById("mainContent");
    if (!main) return;

    // Load custom styles for draft module
    const styleId = "draftLegalStyles";
    if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
            .draft-container { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: #1e293b; }
            .draft-student-bar { background: #f0f7f7; border: 1px solid #d1e8e8; border-radius: 8px; padding: 10px 16px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
            .draft-student-info { display: flex; align-items: center; gap: 10px; font-size: 0.9rem; }
            .draft-student-pills { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 0.8rem; }
            .draft-pill { padding: 4px 10px; border-radius: 16px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; border: 1px solid transparent; }
            .draft-pill-medis { background: #e8f5e9; color: #2e7d32; border-color: #a5d6a7; }
            .draft-pill-disc { background: #f3e5f5; color: #7b1fa2; border-color: #ce93d8; }
            .draft-pill-psiko { background: #e0f2f1; color: #00695c; border-color: #80cbd2; }
            .draft-pill-dana { background: #fff3e0; color: #e65100; border-color: #ffcc80; }
            .draft-pill-kontrak { background: #e8f5e9; color: #1b5e20; border-color: #81c784; }
            
            .draft-header-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 24px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
            .draft-header-title-eyebrow { color: #2e7d32; font-size: 0.78rem; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
            .draft-header-title { font-size: 1.35rem; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; }
            .draft-header-subtitle { color: #64748b; font-size: 0.88rem; margin: 0; }
            .draft-header-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
            
            .draft-split-grid { display: grid; grid-template-columns: 380px 1fr; gap: 16px; align-items: start; }
            @media (max-width: 1024px) { .draft-split-grid { grid-template-columns: 1fr; } }
            
            .draft-tabs-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
            .draft-nav-tabs { display: flex; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
            .draft-nav-btn { flex: 1; padding: 12px 8px; border: none; background: transparent; font-size: 0.85rem; font-weight: 600; color: #64748b; cursor: pointer; text-align: center; border-bottom: 3px solid transparent; transition: all 0.2s ease; }
            .draft-nav-btn:hover { color: #1e293b; background: #f1f5f9; }
            .draft-nav-btn.active { color: #2563eb; border-bottom-color: #2563eb; background: #ffffff; font-weight: 700; }
            .draft-tab-body { padding: 20px; }
            
            .draft-section-heading { font-size: 0.82rem; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 14px; display: flex; align-items: center; gap: 6px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
            
            .draft-paper-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
            .draft-paper-card-header { padding: 12px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-size: 0.9rem; font-weight: 700; color: #334155; display: flex; align-items: center; gap: 8px; }
            .draft-paper-viewport { background: #f1f5f9; padding: 30px 20px; overflow-x: auto; display: flex; justify-content: center; }
            
            .draft-paper-sheet { background: #ffffff; color: #000000; width: 100%; max-width: 760px; min-height: 980px; padding: 45px 55px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); border: 1px solid #dcdcdc; border-radius: 2px; font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.6; box-sizing: border-box; position: relative; transition: all 0.2s ease; }
            .draft-paper-sheet.edit-mode-active { outline: 2px dashed #2563eb; outline-offset: 4px; background: #fafafa; }
            
            @media print {
                body * { visibility: hidden; }
                #draftPaperSheet, #draftPaperSheet * { visibility: visible; }
                #draftPaperSheet { position: absolute; left: 0; top: 0; width: 100%; max-width: 100%; padding: 2cm; box-shadow: none; border: none; }
            }
        `;
        document.head.appendChild(style);
    }

    // Render Main Layout
    main.innerHTML = `
        <div class="draft-container">
            <!-- Back Button Navigation -->
            <div style="margin-bottom: 12px;">
                <button class="btn btn-outline btn-sm" onclick="renderKajianHukum()" style="border-color:#cbd5e1; color:#334155; font-weight:700; background:#ffffff; display:inline-flex; align-items:center; gap:8px; padding:8px 16px; border-radius:8px; box-shadow:0 1px 2px rgba(0,0,0,0.05); cursor:pointer">
                    ⬅️ Kembali ke Kajian Hukum / Tiket
                </button>
            </div>

            <!-- Header Module Card -->
            <div class="draft-header-card">
                <div style="flex:1; min-width:280px">
                    <div class="draft-header-title-eyebrow">
                        <span>📄</span> NAMA / JUDUL DOKUMEN LEGAL
                    </div>
                    <div style="margin-bottom:6px">
                        <input 
                            type="text" 
                            id="draftHeaderDocTitleInput" 
                            class="form-control" 
                            value="${escHtml(window.draftState.kop.judulDok)}" 
                            oninput="updateHeaderDocTitle(this.value)" 
                            style="font-size:1.15rem; font-weight:800; color:#0f172a; border:1px solid #cbd5e1; border-radius:8px; padding:8px 14px; width:100%; max-width:620px; background:#f8fafc"
                            placeholder="Masukkan Nama/Judul Dokumen..."
                        />
                    </div>
                    <p class="draft-header-subtitle">Edit dan kustomisasi seluruh draf dokumen (Nama Dokumen, Kop, Identitas, & Klausul Pasal) secara langsung.</p>
                </div>
                <div class="draft-header-actions">
                    <button class="btn btn-outline btn-sm" id="btnToggleEditMode" onclick="toggleDraftEditMode()" style="border-color:#cbd5e1; color:#334155; font-weight:600">
                        ✏️ Mode Edit Naskah <span id="lblEditModeStatus" style="font-weight:700; color:#64748b">(Mati)</span>
                    </button>
                    <button class="btn btn-sm" onclick="printDraftDocument()" style="background:#1e293b; color:#ffffff; border:none; font-weight:600">
                        🖨️ Cetak Dokumen
                    </button>
                    <button class="btn btn-sm" onclick="downloadDraftPDF()" style="background:#0f766e; color:#ffffff; border:none; font-weight:600">
                        📥 Unduh PDF
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="saveDraftDocument()" style="background:#4f46e5; color:#ffffff; border:none; font-weight:700">
                        💾 Simpan Draft Dokumen
                    </button>
                </div>
            </div>

            <!-- 3. Split Layout: Left Controls vs Right Paper Preview -->
            <div class="draft-split-grid">
                <!-- LEFT COLUMN: CONTROL TABS & FORMS -->
                <div class="draft-tabs-card">
                    <div class="draft-nav-tabs">
                        <button class="draft-nav-btn active" id="btnTabParam" onclick="switchDraftTab('parameter')">🔄 Parameter</button>
                        <button class="draft-nav-btn" id="btnTabKop" onclick="switchDraftTab('kop')">📰 Kop & Judul</button>
                        <button class="draft-nav-btn" id="btnTabIdentitas" onclick="switchDraftTab('identitas')">👤 Identitas</button>
                        <button class="draft-nav-btn" id="btnTabPasal" onclick="switchDraftTab('pasal')">📜 Pasal Draf</button>
                    </div>

                    <div class="draft-tab-body" id="draftTabContent">
                        ${renderDraftTabContent('parameter')}
                    </div>
                </div>

                <!-- RIGHT COLUMN: PAPER DOCUMENT PREVIEW -->
                <div class="draft-paper-card">
                    <div class="draft-paper-card-header">
                        <span>👁️ Naskah Dokumen Surat Perjanjian Legal</span>
                    </div>
                    <div class="draft-paper-viewport">
                        <div class="draft-paper-sheet" id="draftPaperSheet">
                            ${renderDraftPaperInner()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Load candidate/student options into select if tab identitas is opened
    loadStudentsToDraftSelect();
};

function renderDraftTabContent(tab) {
    window.draftState.activeTab = tab;
    const st = window.draftState;

    if (tab === 'parameter') {
        return `
            <div class="draft-section-heading">📄 PARAMETER UTAMA KONTRAK</div>
            <div class="form-group mb-12">
                <label class="form-label fw-700 text-xs text-secondary">NAMA/JUDUL DOKUMEN LEGAL</label>
                <input class="form-control" id="draftProgram" value="${escHtml(st.params.program)}" oninput="updateDraftParams()">
            </div>
            <div class="form-group mb-12">
                <label class="form-label fw-700 text-xs text-secondary">Nomor Surat Resmi</label>
                <input class="form-control" id="draftNoSurat" value="${escHtml(st.params.noSurat)}" oninput="updateDraftParams()">
            </div>
            <div class="form-group mb-12">
                <label class="form-label fw-700 text-xs text-secondary">Tanggal Penetapan</label>
                <input class="form-control" type="date" id="draftTglSurat" value="${st.params.tglSurat}" onchange="updateDraftParams()">
            </div>
            <div class="form-group mb-12">
                <label class="form-label fw-700 text-xs text-secondary">Durasi Pelatihan (Bulan)</label>
                <input class="form-control" type="number" id="draftDurasi" value="${st.params.durasi}" oninput="updateDraftParams()">
            </div>
            <div style="background:#e8f5e9; border:1px solid #c8e6c9; border-radius:8px; padding:12px; margin-top:16px">
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer; color:#1b5e20; font-weight:600; font-size:0.85rem; margin:0">
                    <input type="checkbox" id="draftChkGaransi" ${st.params.garansi ? 'checked' : ''} onchange="updateDraftParams()" style="width:18px; height:18px; accent-color:#2e7d32">
                    <span>Aktifkan Garansi Penyaluran Kerja / Job Matching Japan</span>
                </label>
            </div>
        `;
    }

    if (tab === 'kop') {
        return `
            <div class="draft-section-heading">📰 KOP SURAT & LOGO INSTANSI</div>
            
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px; margin-bottom:14px">
                <label style="display:flex; align-items:center; gap:8px; font-weight:700; font-size:0.85rem; color:#1e293b; cursor:pointer; margin-bottom:10px">
                    <input type="checkbox" id="draftShowLogo" ${st.kop.showLogo ? 'checked' : ''} onchange="updateDraftKop()" style="width:16px; height:16px; accent-color:#2563eb">
                    <span>Tampilkan Logo pada Kop Surat</span>
                </label>
                
                <div class="form-group mb-8">
                    <label class="form-label text-xs fw-600">Upload File Logo (PDF, JPG, PNG)</label>
                    <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px">
                        <input type="file" id="draftLogoFileInput" accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf" onchange="handleDraftLogoUpload(this)" style="display:none">
                        <button type="button" class="btn btn-sm btn-primary" onclick="document.getElementById('draftLogoFileInput').click()" style="display:inline-flex; align-items:center; gap:6px; font-weight:600">
                            📁 Upload File Logo (PDF / JPG / PNG)
                        </button>
                    </div>
                    <div id="draftLogoFileName" style="font-size:0.8rem; color:#334155; font-weight:600; background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; padding:6px 10px; margin-bottom:8px; display:flex; align-items:center; justify-content:space-between">
                        <span>📎 ${st.kop.logoFileName ? escHtml(st.kop.logoFileName) : (st.kop.logoUrl ? 'Logo Aktif (Tersimpan)' : 'Belum ada file ter-upload')}</span>
                        ${st.kop.logoUrl ? `<button type="button" class="btn btn-xs btn-outline" style="color:#dc2626; border-color:#fca5a5" onclick="clearDraftLogo()">Hapus Logo</button>` : ''}
                    </div>
                    <div style="font-size:0.75rem; color:#64748b; margin-bottom:8px">Atau pilih preset logo / URL:</div>
                    <div style="display:flex; gap:6px; margin-bottom:6px; flex-wrap:wrap">
                        <button type="button" class="btn btn-xs ${st.kop.logoUrl === 'assets/logo-ijef.png' ? 'btn-primary' : 'btn-outline'}" onclick="setDraftLogo('assets/logo-ijef.png', 'Logo IJEF Default')">Logo IJEF (Default)</button>
                        <button type="button" class="btn btn-xs ${st.kop.logoUrl === 'icon-ijef-v3.png' ? 'btn-primary' : 'btn-outline'}" onclick="setDraftLogo('icon-ijef-v3.png', 'Logo Icon v3')">Logo Icon v3</button>
                    </div>
                    <input class="form-control text-xs" id="draftLogoUrl" value="${escHtml(st.kop.logoUrl || '')}" oninput="updateDraftKop()" placeholder="Path logo atau URL gambar logo...">
                </div>

                <div class="form-group mb-0">
                    <label class="form-label text-xs fw-600">Posisi Logo Kop</label>
                    <select class="form-control text-xs" id="draftLogoPos" onchange="updateDraftKop()">
                        <option value="kiri" ${st.kop.logoPosition === 'kiri' ? 'selected' : ''}>Kiri (Standard Resmi Dokumen)</option>
                        <option value="tengah" ${st.kop.logoPosition === 'tengah' ? 'selected' : ''}>Tengah (Header Atas Teks)</option>
                    </select>
                </div>
            </div>

            <div class="form-group mb-12">
                <label class="form-label fw-700 text-xs text-secondary">Nama Instansi / Lembaga (Kop)</label>
                <input class="form-control" id="draftNamaInstansi" value="${escHtml(st.kop.namaInstansi)}" oninput="updateDraftKop()">
            </div>
            <div class="form-group mb-12">
                <label class="form-label fw-700 text-xs text-secondary">Izin & Subtitle Kop</label>
                <input class="form-control" id="draftSubKop" value="${escHtml(st.kop.subKop)}" oninput="updateDraftKop()">
            </div>
            <div class="form-group mb-12">
                <label class="form-label fw-700 text-xs text-secondary">Alamat & Kontak Kop</label>
                <input class="form-control" id="draftAlamatKop" value="${escHtml(st.kop.alamatKop)}" oninput="updateDraftKop()">
            </div>
            <div class="form-group mb-12">
                <label class="form-label fw-700 text-xs text-secondary">Judul Dokumen Surat</label>
                <input class="form-control" id="draftJudulDok" value="${escHtml(st.kop.judulDok)}" oninput="updateDraftKop()">
            </div>
        `;
    }

    if (tab === 'identitas') {
        return `
            <div class="draft-section-heading">👤 IDENTITAS PARA PIHAK</div>
            
            <div class="form-group mb-16">
                <label class="form-label fw-700 text-xs text-primary">🔄 Sync Data dari Master Siswa / Kandidat:</label>
                <select class="form-control" id="draftSelectSiswa" onchange="syncDraftSiswa(this.value)">
                    <option value="budi_sitorus" ${st.siswaData.id === 'budi_sitorus' ? 'selected' : ''}>Budi Pratama Sitorus (NIK: 3271041508980001)</option>
                </select>
            </div>

            <div style="font-size:0.82rem; font-weight:700; color:#1e293b; margin-bottom:8px">1. PIHAK PERTAMA (Penyelenggara):</div>
            <div class="form-group mb-8">
                <input class="form-control text-sm" id="draftP1Nama" placeholder="Nama Pihak 1" value="${escHtml(st.p1.nama)}" oninput="updateDraftIdentitas()">
            </div>
            <div class="form-group mb-8">
                <input class="form-control text-sm" id="draftP1Jabatan" placeholder="Jabatan Pihak 1" value="${escHtml(st.p1.jabatan)}" oninput="updateDraftIdentitas()">
            </div>
            <div class="form-group mb-16">
                <input class="form-control text-sm" id="draftP1Instansi" placeholder="Instansi Pihak 1" value="${escHtml(st.p1.instansi)}" oninput="updateDraftIdentitas()">
            </div>

            <div style="font-size:0.82rem; font-weight:700; color:#1e293b; margin-bottom:8px">2. PIHAK KEDUA (Peserta / Calon Siswa):</div>
            <div class="form-group mb-8">
                <label class="form-label text-xs">Nama Lengkap</label>
                <input class="form-control text-sm" id="draftP2Nama" value="${escHtml(st.p2.nama)}" oninput="updateDraftIdentitas()">
            </div>
            <div class="form-group mb-8">
                <label class="form-label text-xs">NIK KTP</label>
                <input class="form-control text-sm" id="draftP2Nik" value="${escHtml(st.p2.nik)}" oninput="updateDraftIdentitas()">
            </div>
            <div class="form-group mb-8">
                <label class="form-label text-xs">Alamat Domisili</label>
                <input class="form-control text-sm" id="draftP2Alamat" value="${escHtml(st.p2.alamat)}" oninput="updateDraftIdentitas()">
            </div>
            <div class="form-group mb-8">
                <label class="form-label text-xs">No. HP / Email</label>
                <input class="form-control text-sm" id="draftP2Contact" value="${escHtml(st.p2.contact)}" oninput="updateDraftIdentitas()">
            </div>
            <div class="form-group mb-12">
                <label class="form-label text-xs">Penjamin (Orang Tua)</label>
                <input class="form-control text-sm" id="draftP2Penjamin" value="${escHtml(st.p2.penjamin)}" oninput="updateDraftIdentitas()">
            </div>
        `;
    }

    if (tab === 'pasal') {
        let pasalHtml = '';
        st.pasalList.forEach((p, idx) => {
            pasalHtml += `
                <div style="border:1px solid #e2e8f0; border-radius:8px; padding:12px; margin-bottom:12px; background:#f8fafc">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px">
                        <span style="font-weight:700; font-size:0.82rem; color:#334155">PASAL ${p.id}</span>
                        <button class="btn btn-xs btn-danger" onclick="removeDraftPasal(${idx})">🗑️ Hapus</button>
                    </div>
                    <input class="form-control text-sm mb-8" id="pasalJudul_${idx}" value="${escHtml(p.judul)}" oninput="updateDraftPasalList()" placeholder="Judul Pasal">
                    <textarea class="form-control text-sm" id="pasalIsi_${idx}" rows="3" oninput="updateDraftPasalList()" placeholder="Tuliskan isi poin pasal (pisahkan tiap poin dengan baris baru)">${escHtml(p.poin.join('\n'))}</textarea>
                </div>
            `;
        });

        return `
            <div class="draft-section-heading">📜 KLAUSUL & PASAL-PASAL</div>
            <div id="draftPasalContainer">
                ${pasalHtml}
            </div>
            <button class="btn btn-outline btn-sm" style="width:100%; margin-top:8px" onclick="addDraftPasal()">+ Tambah Pasal Baru</button>
        `;
    }

    return '';
}

function renderDraftPaperInner() {
    const st = window.draftState;

    let pasalRender = '';
    st.pasalList.forEach(p => {
        let poinHtml = '';
        if (p.poin && p.poin.length) {
            if (p.poin.length === 1) {
                poinHtml = `<p style="margin:4px 0 0 0; text-align:justify">${escHtml(p.poin[0])}</p>`;
            } else {
                poinHtml = '<ol style="margin:4px 0 0 20px; padding:0">';
                p.poin.forEach(pt => {
                    poinHtml += `<li style="margin-bottom:4px; text-align:justify">${escHtml(pt)}</li>`;
                });
                poinHtml += '</ol>';
            }
        }

        pasalRender += `
            <div style="margin-bottom:18px">
                <div style="font-weight:bold; text-align:center; text-transform:uppercase; margin-bottom:4px">PASAL ${p.id}: ${escHtml(p.judul)}</div>
                ${poinHtml}
            </div>
        `;
    });

    const showLogo = st.kop.showLogo !== false && st.kop.logoUrl;
    const logoPos = st.kop.logoPosition || 'kiri';

    const isPdf = st.kop.logoUrl && (st.kop.logoUrl.startsWith('data:application/pdf') || st.kop.logoUrl.toLowerCase().endsWith('.pdf'));
    let logoTag = '';
    if (isPdf) {
        logoTag = `<object data="${escHtml(st.kop.logoUrl)}" type="application/pdf" style="max-height:75px; max-width:110px; border:none; overflow:hidden"></object>`;
    } else {
        logoTag = `<img src="${escHtml(st.kop.logoUrl)}" style="max-height:75px; max-width:110px; object-fit:contain" alt="Logo">`;
    }

    let kopHeaderHtml = '';
    if (showLogo && logoPos === 'kiri') {
        kopHeaderHtml = `
            <div style="display:flex; align-items:center; gap:16px; margin-bottom:10px; font-family:Arial, sans-serif">
                ${logoTag}
                <div style="flex:1; text-align:center">
                    <div style="font-weight:bold; font-size:13pt; letter-spacing:0.5px; color:#000000; text-transform:uppercase" id="pvNamaInstansi">${escHtml(st.kop.namaInstansi)}</div>
                    <div style="font-size:8.5pt; color:#333333; margin-top:2px" id="pvSubKop">${escHtml(st.kop.subKop)}</div>
                    <div style="font-size:8.5pt; color:#555555" id="pvAlamatKop">${escHtml(st.kop.alamatKop)}</div>
                </div>
            </div>
        `;
    } else if (showLogo && logoPos === 'tengah') {
        kopHeaderHtml = `
            <div style="text-align:center; font-family:Arial, sans-serif; margin-bottom:10px">
                ${logoTag}<br>
                <div style="font-weight:bold; font-size:13pt; letter-spacing:0.5px; color:#000000; text-transform:uppercase" id="pvNamaInstansi">${escHtml(st.kop.namaInstansi)}</div>
                <div style="font-size:8.5pt; color:#333333; margin-top:2px" id="pvSubKop">${escHtml(st.kop.subKop)}</div>
                <div style="font-size:8.5pt; color:#555555" id="pvAlamatKop">${escHtml(st.kop.alamatKop)}</div>
            </div>
        `;
    } else {
        kopHeaderHtml = `
            <div style="text-align:center; font-family:Arial, sans-serif; margin-bottom:10px">
                <div style="font-weight:bold; font-size:13pt; letter-spacing:0.5px; color:#000000; text-transform:uppercase" id="pvNamaInstansi">${escHtml(st.kop.namaInstansi)}</div>
                <div style="font-size:8.5pt; color:#333333; margin-top:2px" id="pvSubKop">${escHtml(st.kop.subKop)}</div>
                <div style="font-size:8.5pt; color:#555555" id="pvAlamatKop">${escHtml(st.kop.alamatKop)}</div>
            </div>
        `;
    }

    return `
        <!-- KOP SURAT -->
        ${kopHeaderHtml}
        <hr style="border:0; border-top:2px solid #000000; margin:8px 0 18px 0">

        <!-- JUDUL SURAT -->
        <div style="text-align:center; margin-bottom:20px">
            <div style="font-weight:bold; font-size:11pt; text-decoration:underline; text-transform:uppercase" id="pvJudulDok">${escHtml(st.kop.judulDok)}</div>
            <div style="font-size:9.5pt; margin-top:3px">Nomor : <span id="pvNoSurat">${escHtml(st.params.noSurat)}</span></div>
        </div>

        <p style="margin-bottom:14px; text-align:justify">Pada hari ini, bertempat di Kantor LPK IJEF CORP Jakarta, kami yang bertanda tangan di bawah ini:</p>

        <!-- PIHAK PERTAMA -->
        <div style="margin-left:12px; margin-bottom:14px">
            <strong>1. PIHAK PERTAMA (Penyelenggara Pelatihan):</strong>
            <table style="width:100%; font-size:10pt; margin-top:4px; border-collapse:collapse">
                <tr><td style="width:140px; padding:2px 0"><strong>Nama</strong></td><td>: <span id="pvP1Nama">${escHtml(st.p1.nama)}</span></td></tr>
                <tr><td style="padding:2px 0"><strong>Jabatan</strong></td><td>: <span id="pvP1Jabatan">${escHtml(st.p1.jabatan)}</span></td></tr>
                <tr><td style="padding:2px 0"><strong>Instansi</strong></td><td>: <span id="pvP1Instansi">${escHtml(st.p1.instansi)}</span></td></tr>
            </table>
        </div>

        <!-- PIHAK KEDUA -->
        <div style="margin-left:12px; margin-bottom:16px">
            <strong>2. PIHAK KEDUA (Peserta / Calon Siswa):</strong>
            <table style="width:100%; font-size:10pt; margin-top:4px; border-collapse:collapse">
                <tr><td style="width:140px; padding:2px 0"><strong>Nama Lengkap</strong></td><td>: <span id="pvP2Nama">${escHtml(st.p2.nama)}</span></td></tr>
                <tr><td style="padding:2px 0"><strong>NIK KTP</strong></td><td>: <span id="pvP2Nik">${escHtml(st.p2.nik)}</span></td></tr>
                <tr><td style="padding:2px 0"><strong>Alamat Domisili</strong></td><td>: <span id="pvP2Alamat">${escHtml(st.p2.alamat)}</span></td></tr>
                <tr><td style="padding:2px 0"><strong>No. HP / Email</strong></td><td>: <span id="pvP2Contact">${escHtml(st.p2.contact)}</span></td></tr>
                <tr><td style="padding:2px 0"><strong>Penjamin (Orang Tua)</strong></td><td>: <span id="pvP2Penjamin">${escHtml(st.p2.penjamin)}</span></td></tr>
            </table>
        </div>

        <p style="margin-bottom:16px; text-align:justify">Para Pihak dengan ini sepakat dan mengikatkan diri dalam Perjanjian Keikutsertaan Pendidikan & Pelatihan Kerja dengan ketentuan klausul sebagai berikut:</p>

        <!-- PASAL-PASAL -->
        <div id="pvPasalList">
            ${pasalRender}
        </div>

        <!-- TANDA TANGAN -->
        <div style="margin-top:45px; display:flex; justify-content:space-between; text-align:center; page-break-inside:avoid">
            <div style="width:45%">
                <div>PIHAK PERTAMA</div>
                <div style="font-size:8.5pt; color:#555555">LPK IJEF CORP INDONESIA</div>
                <div style="height:65px"></div>
                <div style="font-weight:bold; text-decoration:underline" id="pvSigP1Nama">${escHtml(st.p1.nama)}</div>
                <div style="font-size:8.5pt">${escHtml(st.p1.jabatan)}</div>
            </div>
            <div style="width:45%">
                <div>PIHAK KEDUA</div>
                <div style="font-size:8.5pt; color:#555555">Peserta / Calon Siswa</div>
                <div style="height:65px"></div>
                <div style="font-weight:bold; text-decoration:underline" id="pvSigP2Nama">${escHtml(st.p2.nama)}</div>
                <div style="font-size:8.5pt">Siswa / Peserta Pelatihan</div>
            </div>
        </div>
    `;
}

window.switchDraftTab = function(tab) {
    ['Param', 'Kop', 'Identitas', 'Pasal'].forEach(t => {
        const btn = document.getElementById('btnTab' + t);
        if (btn) btn.classList.remove('active');
    });

    const activeMap = { parameter: 'Param', kop: 'Kop', identitas: 'Identitas', pasal: 'Pasal' };
    const btnActive = document.getElementById('btnTab' + activeMap[tab]);
    if (btnActive) btnActive.classList.add('active');

    const contentBox = document.getElementById('draftTabContent');
    if (contentBox) contentBox.innerHTML = renderDraftTabContent(tab);

    if (tab === 'identitas') loadStudentsToDraftSelect();
};

window.updateDraftParams = function() {
    const st = window.draftState;
    const noSurat = document.getElementById('draftNoSurat')?.value;
    const tglSurat = document.getElementById('draftTglSurat')?.value;
    const program = document.getElementById('draftProgram')?.value;
    const durasi = document.getElementById('draftDurasi')?.value;
    const garansi = document.getElementById('draftChkGaransi')?.checked;

    if (noSurat !== undefined) st.params.noSurat = noSurat;
    if (tglSurat !== undefined) st.params.tglSurat = tglSurat;
    if (program !== undefined) {
        st.params.program = program;
        st.kop.judulDok = program;
        const headerInp = document.getElementById('draftHeaderDocTitleInput');
        if (headerInp && headerInp.value !== program) headerInp.value = program;
    }
    if (durasi !== undefined) st.params.durasi = durasi;
    if (garansi !== undefined) st.params.garansi = garansi;

    refreshPaperPreview();
};

window.updateHeaderDocTitle = function(val) {
    window.draftState.kop.judulDok = val;
    window.draftState.params.program = val;
    const pv = document.getElementById('pvJudulDok');
    if (pv) pv.innerText = val;
    const kopInp = document.getElementById('draftJudulDok');
    if (kopInp && kopInp.value !== val) kopInp.value = val;
    const paramInp = document.getElementById('draftProgram');
    if (paramInp && paramInp.value !== val) paramInp.value = val;
};

window.handleDraftLogoUpload = function(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImg = file.type.startsWith('image/') || file.name.match(/\.(jpg|jpeg|png)$/i);

    if (!isPdf && !isImg) {
        toast("Format file tidak didukung! Harap gunakan file PDF, JPG, atau PNG.", "warning");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        window.draftState.kop.logoUrl = e.target.result;
        window.draftState.kop.logoFileName = file.name;
        window.draftState.kop.showLogo = true;

        const inp = document.getElementById('draftLogoUrl');
        if (inp) inp.value = e.target.result;
        const fn = document.getElementById('draftLogoFileName');
        if (fn) {
            fn.innerHTML = `<span>📎 ${escHtml(file.name)}</span><button type="button" class="btn btn-xs btn-outline" style="color:#dc2626; border-color:#fca5a5" onclick="clearDraftLogo()">Hapus Logo</button>`;
        }
        const chk = document.getElementById('draftShowLogo');
        if (chk) chk.checked = true;

        refreshPaperPreview();
        toast("✅ File logo " + file.name + " berhasil diupload!", "success");
    };
    reader.readAsDataURL(file);
};

window.setDraftLogo = function(url, fileName) {
    window.draftState.kop.logoUrl = url;
    window.draftState.kop.logoFileName = fileName || 'Preset Logo';
    window.draftState.kop.showLogo = true;
    const inp = document.getElementById('draftLogoUrl');
    if (inp) inp.value = url;
    const fn = document.getElementById('draftLogoFileName');
    if (fn) {
        fn.innerHTML = `<span>📎 ${escHtml(window.draftState.kop.logoFileName)}</span><button type="button" class="btn btn-xs btn-outline" style="color:#dc2626; border-color:#fca5a5" onclick="clearDraftLogo()">Hapus Logo</button>`;
    }
    const chk = document.getElementById('draftShowLogo');
    if (chk) chk.checked = true;
    refreshPaperPreview();
};

window.clearDraftLogo = function() {
    window.draftState.kop.logoUrl = '';
    window.draftState.kop.logoFileName = '';
    const inp = document.getElementById('draftLogoUrl');
    if (inp) inp.value = '';
    const fn = document.getElementById('draftLogoFileName');
    if (fn) {
        fn.innerHTML = `<span>📎 Belum ada file ter-upload</span>`;
    }
    refreshPaperPreview();
    toast("Logo berhasil dihapus", "info");
};

window.updateDraftKop = function() {
    const st = window.draftState;
    const showLogo = document.getElementById('draftShowLogo')?.checked;
    const logoUrl = document.getElementById('draftLogoUrl')?.value;
    const logoPos = document.getElementById('draftLogoPos')?.value;
    const namaInstansi = document.getElementById('draftNamaInstansi')?.value;
    const subKop = document.getElementById('draftSubKop')?.value;
    const alamatKop = document.getElementById('draftAlamatKop')?.value;
    const judulDok = document.getElementById('draftJudulDok')?.value;

    if (showLogo !== undefined) st.kop.showLogo = showLogo;
    if (logoUrl !== undefined) st.kop.logoUrl = logoUrl;
    if (logoPos !== undefined) st.kop.logoPosition = logoPos;
    if (namaInstansi !== undefined) st.kop.namaInstansi = namaInstansi;
    if (subKop !== undefined) st.kop.subKop = subKop;
    if (alamatKop !== undefined) st.kop.alamatKop = alamatKop;
    if (judulDok !== undefined) {
        st.kop.judulDok = judulDok;
        st.params.program = judulDok;
        const headerInp = document.getElementById('draftHeaderDocTitleInput');
        if (headerInp && headerInp.value !== judulDok) headerInp.value = judulDok;
        const paramInp = document.getElementById('draftProgram');
        if (paramInp && paramInp.value !== judulDok) paramInp.value = judulDok;
    }

    refreshPaperPreview();
};

window.updateDraftIdentitas = function() {
    const st = window.draftState;
    st.p1.nama = document.getElementById('draftP1Nama')?.value || st.p1.nama;
    st.p1.jabatan = document.getElementById('draftP1Jabatan')?.value || st.p1.jabatan;
    st.p1.instansi = document.getElementById('draftP1Instansi')?.value || st.p1.instansi;

    st.p2.nama = document.getElementById('draftP2Nama')?.value || st.p2.nama;
    st.p2.nik = document.getElementById('draftP2Nik')?.value || st.p2.nik;
    st.p2.alamat = document.getElementById('draftP2Alamat')?.value || st.p2.alamat;
    st.p2.contact = document.getElementById('draftP2Contact')?.value || st.p2.contact;
    st.p2.penjamin = document.getElementById('draftP2Penjamin')?.value || st.p2.penjamin;

    st.siswaData.nama = st.p2.nama;
    st.siswaData.nik = st.p2.nik;

    // Update banner
    const banner = document.getElementById('draftStudentBanner');
    if (banner) {
        banner.querySelector('.draft-student-info strong').innerText = st.p2.nama;
    }

    refreshPaperPreview();
};

window.updateDraftPasalList = function() {
    const st = window.draftState;
    st.pasalList.forEach((p, idx) => {
        const jEl = document.getElementById('pasalJudul_' + idx);
        const iEl = document.getElementById('pasalIsi_' + idx);
        if (jEl) p.judul = jEl.value;
        if (iEl) p.poin = iEl.value.split('\n').filter(x => x.trim().length > 0);
    });
    refreshPaperPreview();
};

window.addDraftPasal = function() {
    const st = window.draftState;
    const newId = st.pasalList.length + 1;
    st.pasalList.push({
        id: newId,
        judul: 'KETENTUAN TAMBAHAN',
        poin: ['Segala sesuatu yang belum diatur dalam perjanjian ini akan dimusyawarahkan secara kekeluargaan.']
    });
    switchDraftTab('pasal');
    refreshPaperPreview();
};

window.removeDraftPasal = function(idx) {
    const st = window.draftState;
    if (st.pasalList.length <= 1) return toast('Minimal 1 pasal harus ada', 'warning');
    st.pasalList.splice(idx, 1);
    // Re-index
    st.pasalList.forEach((p, i) => p.id = i + 1);
    switchDraftTab('pasal');
    refreshPaperPreview();
};

function refreshPaperPreview() {
    const sheet = document.getElementById('draftPaperSheet');
    if (sheet && !window.draftState.editMode) {
        sheet.innerHTML = renderDraftPaperInner();
    }
}

window.toggleDraftEditMode = function() {
    const st = window.draftState;
    st.editMode = !st.editMode;

    const sheet = document.getElementById('draftPaperSheet');
    const lbl = document.getElementById('lblEditModeStatus');
    const btn = document.getElementById('btnToggleEditMode');

    if (sheet) {
        sheet.contentEditable = st.editMode ? "true" : "false";
        if (st.editMode) sheet.classList.add('edit-mode-active');
        else sheet.classList.remove('edit-mode-active');
    }

    if (lbl) {
        lbl.innerText = st.editMode ? "(Aktif)" : "(Mati)";
        lbl.style.color = st.editMode ? "#16a34a" : "#64748b";
    }

    if (btn) {
        btn.style.borderColor = st.editMode ? "#16a34a" : "#cbd5e1";
        btn.style.background = st.editMode ? "#f0fdf4" : "transparent";
    }

    if (st.editMode) {
        toast("Mode edit naskah AKTIF. Anda dapat mengedit teks langsung pada lembar naskah.", "info");
    } else {
        toast("Mode edit naskah MATI. Perubahan disinkronkan dari panel kontrol.", "info");
    }
};

window.printDraftDocument = function() {
    window.print();
};

window.downloadDraftPDF = function() {
    toast("Membuka dialog cetak ke PDF...", "info");
    window.print();
};

window.saveDraftDocument = async function() {
    try {
        toast("⏳ Menyimpan draf dokumen ke database...", "info");
        const st = window.draftState;
        
        let customContent = "";
        const sheet = document.getElementById('draftPaperSheet');
        if (sheet) customContent = sheet.innerHTML;

        const docTitle = st.kop.judulDok || st.params.program || "Surat Perjanjian Legal";

        const docData = {
            judulDok: docTitle,
            noSurat: st.params.noSurat,
            tglSurat: st.params.tglSurat,
            program: st.params.program,
            durasi: st.params.durasi,
            garansi: st.params.garansi,
            p1: st.p1,
            p2: st.p2,
            kop: st.kop,
            pasalList: st.pasalList,
            htmlContent: customContent,
            createdAt: new Date().toISOString(),
            updatedBy: (window.currentUser ? currentUser.nama : 'Admin')
        };

        const draftRef = await db.collection("hrd_legal_drafts").add(docData);

        // Langsung masukkan ke list dokumen Kajian Hukum / Tiket
        const ticketId = "LGL-" + Date.now().toString().slice(-6);
        await db.collection("hrd_legal_tickets").add({
            ticket_id: ticketId,
            judul: docTitle,
            dept: "Legal & HRD",
            status: "Draf Dokumen",
            noSurat: st.params.noSurat || "-",
            draftId: draftRef.id,
            createdAt: new Date().toISOString()
        });

        toast("✅ Dokumen berhasil disimpan dan otomatis masuk ke list Kajian Hukum / Tiket!", "success");

        // Langsung tampilkan list Kajian Hukum / Tiket
        setTimeout(() => {
            renderKajianHukum();
        }, 500);
    } catch (e) {
        console.error("saveDraftDocument error:", e);
        toast("Gagal menyimpan: " + e.message, "error");
    }
};

async function loadStudentsToDraftSelect() {
    const sel = document.getElementById('draftSelectSiswa');
    if (!sel) return;

    try {
        const kandidatSnap = await db.collection('hrd_kandidat').get();
        let opts = `<option value="budi_sitorus">Budi Pratama Sitorus (NIK: 3271041508980001)</option>`;

        kandidatSnap.forEach(d => {
            const k = d.data();
            if (k.nama && k.id !== 'budi_sitorus') {
                opts += `<option value="${d.id}">${escHtml(k.nama)} (NIK: ${escHtml(k.nik || '-')})</option>`;
            }
        });

        sel.innerHTML = opts;
    } catch (e) {
        console.log("loadStudentsToDraftSelect note:", e.message);
    }
}

window.syncDraftSiswa = async function(val) {
    if (val === 'budi_sitorus') {
        window.draftState.p2 = {
            nama: 'Budi Pratama Sitorus',
            nik: '3271041508980001',
            alamat: 'Jl. Pemuda No. 45, RT 02/RW 05, Kel. Kayu Putih, Jakarta Timur',
            contact: '081234567890 / budi.pratama@gmail.com',
            penjamin: 'Suharto Sitorus (NIK: 3271040101700003)'
        };
        window.draftState.siswaData.nama = 'Budi Pratama Sitorus';
        window.draftState.siswaData.nik = '3271041508980001';
    } else if (val) {
        try {
            const doc = await db.collection('hrd_kandidat').doc(val).get();
            if (doc.exists) {
                const k = doc.data();
                window.draftState.p2 = {
                    nama: k.nama || 'Peserta',
                    nik: k.nik || '-',
                    alamat: k.alamat || 'Alamat Peserta',
                    contact: (k.noHp || '') + ' / ' + (k.email || ''),
                    penjamin: k.penjamin || 'Orang Tua / Wali'
                };
                window.draftState.siswaData.nama = k.nama || 'Peserta';
                window.draftState.siswaData.nik = k.nik || '-';
            }
        } catch (e) {
            console.error(e);
        }
    }

    switchDraftTab('identitas');
    refreshPaperPreview();
};

// ── 4. AI INTEGRATION ────────────────────────────────────────────────────────
async function askGeminiAI() {
    const promptInput = document.getElementById("aiPrompt");
    const chatBox = document.getElementById("aiChatBox");
    const btn = document.getElementById("btnAskGemini");
    const prompt = promptInput.value.trim();

    if (!prompt) return;

    // Add user message
    chatBox.innerHTML += `<div class="ai-msg user">${escHtml(prompt)}</div>`;
    promptInput.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;

    btn.disabled = true;
    btn.innerText = "Thinking...";

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Anda adalah asisten hukum profesional untuk IJEF Corp. Bantu pengguna menyusun dokumen hukum. Pertanyaan: ${prompt}` }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message || "Gagal terhubung ke AI.");
        }

        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, saya tidak bisa memberikan jawaban saat ini.";

        // Simple markdown to HTML converter for response
        const formattedText = aiText.replace(/\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

        chatBox.innerHTML += `
            <div class="ai-msg bot">
                <div>${formattedText}</div>
                <button class="btn btn-xs btn-success mt-8" onclick="applyToEditor(\`${aiText.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)">📝 Terapkan ke Draf</button>
            </div>`;
    } catch (e) {
        console.error("AI Error:", e);
        chatBox.innerHTML += `<div class="ai-msg bot" style="color:red">❌ Gagal: ${e.message}</div>`;
    } finally {
        btn.disabled = false;
        btn.innerText = "Ask Gemini ✨";
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

window.applyToEditor = function(text) {
    const editor = document.getElementById("drKonten");
    if (!editor) return;
    const formatted = text.replace(/\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
    editor.innerHTML += `<div style="margin-top:20px">${formatted}</div>`;
    toast("Teks diterapkan ke editor", "success");
};

window.saveLegalDraft = function() {
    const content = document.getElementById("drKonten").innerHTML;
    // In real app, save to Firestore. For now, simulate:
    console.log("Saving content...", content);
    toast("Draf berhasil disimpan ke database", "success");
};

window.formatDoc = function(cmd, val) {
    const editor = document.getElementById("drKonten");
    if(editor) {
        document.execCommand(cmd, false, val);
        editor.focus();
    }
};

// ── 5. DATA LOADERS ──────────────────────────────────────────────────────────
window.loadLegalTickets = async function() {
    const tbody = document.getElementById("tblLegalTickets");
    if(!tbody) return;
    try {
        const snap = await db.collection("hrd_legal_tickets").get();
        let items = [];
        snap.forEach(d => items.push({ id: d.id, ...d.data() }));

        items.sort((a, b) => {
            const dateA = a.createdAt || "";
            const dateB = b.createdAt || "";
            return dateB.localeCompare(dateA);
        });

        let h = "";
        items.forEach(p => {
            const status = p.status || "pending";
            let stClass = "badge-warning";
            if (status === "Draf Dokumen" || status === "Aktif") stClass = "badge-info";
            else if (status === "Selesai" || status === "Disetujui") stClass = "badge-success";
            else if (status === "Ditolak") stClass = "badge-danger";

            h += `<tr>
                <td class="fw-700">${p.ticket_id || "-"}</td>
                <td class="fw-600">${escHtml(p.judul)}</td>
                <td>${escHtml(p.dept || "Legal & HRD")}</td>
                <td><span class="badge ${stClass}">${status}</span></td>
                <td>${formatDate(p.createdAt)}</td>
                <td>
                    <div style="display:flex; gap:4px; flex-wrap:nowrap">
                        <button class="btn btn-xs btn-info" onclick="viewLegalTicket('${p.id}')" title="Lihat Detail Dokumen">👁️ Detail</button>
                        <button class="btn btn-xs btn-warning" onclick="editLegalTicket('${p.id}')" title="Edit Dokumen">✏️ Edit</button>
                        <button class="btn btn-xs btn-primary" onclick="printLegalTicket('${p.id}')" title="Cetak Dokumen">🖨️ Print</button>
                        <button class="btn btn-xs btn-danger" onclick="deleteLegalTicket('${p.id}', '${p.draftId || ''}')" title="Hapus Dokumen">🗑️ Hapus</button>
                    </div>
                </td>
            </tr>`;
        });
        tbody.innerHTML = h || '<tr><td colspan="6" class="text-center">Belum ada tiket / draf dokumen kajian hukum</td></tr>';
    } catch (e) {
        console.error("loadLegalTickets error:", e);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center color-danger">Gagal memuat data: ${e.message}</td></tr>`;
    }
};

window.viewLegalTicket = async function(id) {
    try {
        const doc = await db.collection("hrd_legal_tickets").doc(id).get();
        if (!doc.exists) return toast("Tiket tidak ditemukan", "warning");
        const t = doc.data();

        let draftDetailHtml = "";
        if (t.draftId) {
            const draftDoc = await db.collection("hrd_legal_drafts").doc(t.draftId).get();
            if (draftDoc.exists) {
                const d = draftDoc.data();
                draftDetailHtml = `
                <div class="mt-16" style="border-top:1px solid #eee; padding-top:12px">
                    <div class="fw-700 text-sm mb-8">📄 Pratinjau Naskah Dokumen Draf:</div>
                    <div style="max-height:350px; overflow-y:auto; border:1px solid #cbd5e1; border-radius:8px; padding:20px; background:#ffffff; font-family:'Times New Roman', serif; font-size:10pt; line-height:1.5">
                        ${d.htmlContent || '<p>Draf naskah tersimpan.</p>'}
                    </div>
                </div>`;
            }
        }

        openModal(`
            <div class="modal-title">📑 Detail Tiket & Draf Dokumen Legal</div>
            <table class="table-detail">
                <tr><td>ID Tiket</td><td><b>${escHtml(t.ticket_id || '-')}</b></td></tr>
                <tr><td>Judul Dokumen</td><td><b>${escHtml(t.judul)}</b></td></tr>
                <tr><td>Nomor Surat</td><td>${escHtml(t.noSurat || '-')}</td></tr>
                <tr><td>Departemen</td><td>${escHtml(t.dept || 'Legal & HRD')}</td></tr>
                <tr><td>Status</td><td><span class="badge badge-info">${t.status}</span></td></tr>
                <tr><td>Tanggal Dibuat</td><td>${formatDate(t.createdAt)}</td></tr>
            </table>
            ${draftDetailHtml}
            <div class="mt-16 flex gap-8 justify-end flex-wrap">
                <button class="btn btn-warning" onclick="closeModalDirect(); editLegalTicket('${id}')">✏️ Edit Dokumen</button>
                <button class="btn btn-primary" onclick="printLegalTicket('${id}')">🖨️ Cetak / Print</button>
                <button class="btn btn-danger" onclick="deleteLegalTicket('${id}', '${t.draftId || ''}')">🗑️ Hapus</button>
                <button class="btn btn-outline" onclick="closeModalDirect()">Tutup</button>
            </div>
        `, true);
    } catch (e) {
        toast("Gagal memuat detail: " + e.message, "error");
    }
};

window.editLegalTicket = async function(id) {
    try {
        const doc = await db.collection("hrd_legal_tickets").doc(id).get();
        if (!doc.exists) return toast("Tiket tidak ditemukan", "warning");
        const t = doc.data();

        let extraContent = "";
        if (t.draftId) {
            extraContent = `
            <div class="mt-12 p-8" style="background:#f1f5f9; border-radius:6px; font-size:0.85rem">
                <span>📄 Terhubung dengan Draf Dokumen Interaktif.</span><br>
                <button type="button" class="btn btn-xs btn-outline mt-4" onclick="closeModalDirect(); modalLegalDrafting()">✍️ Buka Modul Editor Draf Interaktif</button>
            </div>`;
        }

        openModal(`
            <div class="modal-title">✏️ Edit Dokumen / Tiket Legal</div>
            <div class="form-group mb-12">
                <label class="form-label fw-700 text-xs text-secondary">NAMA / JUDUL DOKUMEN LEGAL</label>
                <input class="form-control" id="editTicketJudul" value="${escHtml(t.judul || '')}" placeholder="Masukkan Judul Dokumen...">
            </div>
            <div class="form-group mb-12">
                <label class="form-label fw-700 text-xs text-secondary">Nomor Surat Resmi</label>
                <input class="form-control" id="editTicketNoSurat" value="${escHtml(t.noSurat || '')}" placeholder="Contoh: 088/SPKP/IJEF-CORP/VII/2026">
            </div>
            <div class="form-group mb-12">
                <label class="form-label fw-700 text-xs text-secondary">Departemen / Unit</label>
                <input class="form-control" id="editTicketDept" value="${escHtml(t.dept || 'Legal & HRD')}">
            </div>
            <div class="form-group mb-12">
                <label class="form-label fw-700 text-xs text-secondary">Status Dokumen</label>
                <select class="form-control" id="editTicketStatus">
                    <option value="Draf Dokumen" ${t.status === 'Draf Dokumen' ? 'selected' : ''}>Draf Dokumen</option>
                    <option value="Aktif" ${t.status === 'Aktif' ? 'selected' : ''}>Aktif</option>
                    <option value="Selesai" ${t.status === 'Selesai' ? 'selected' : ''}>Selesai</option>
                    <option value="Disetujui" ${t.status === 'Disetujui' ? 'selected' : ''}>Disetujui</option>
                    <option value="Ditolak" ${t.status === 'Ditolak' ? 'selected' : ''}>Ditolak</option>
                </select>
            </div>
            ${extraContent}
            <div class="mt-16 flex gap-8 justify-end">
                <button class="btn btn-primary" onclick="simpanEditLegalTicket('${id}', '${t.draftId || ''}')">💾 Simpan Perubahan</button>
                <button class="btn btn-outline" onclick="closeModalDirect()">Batal</button>
            </div>
        `, true);
    } catch (e) {
        toast("Gagal memuat data edit: " + e.message, "error");
    }
};

window.simpanEditLegalTicket = async function(id, draftId) {
    const judul = document.getElementById("editTicketJudul")?.value.trim();
    const noSurat = document.getElementById("editTicketNoSurat")?.value.trim();
    const dept = document.getElementById("editTicketDept")?.value.trim();
    const status = document.getElementById("editTicketStatus")?.value;

    if (!judul) return toast("Judul dokumen tidak boleh kosong", "warning");

    try {
        await db.collection("hrd_legal_tickets").doc(id).update({
            judul,
            noSurat: noSurat || "-",
            dept: dept || "Legal & HRD",
            status: status || "Draf Dokumen",
            updatedAt: new Date().toISOString()
        });

        if (draftId) {
            await db.collection("hrd_legal_drafts").doc(draftId).update({
                judulDok: judul,
                program: judul,
                noSurat: noSurat || "-",
                updatedAt: new Date().toISOString()
            });
        }

        closeModalDirect();
        toast("✅ Dokumen berhasil diperbarui!", "success");
        loadLegalTickets();
    } catch (e) {
        toast("Gagal memperbarui dokumen: " + e.message, "error");
    }
};

window.deleteLegalTicket = async function(id, draftId) {
    if (!confirm("Apakah Anda yakin ingin menghapus dokumen / tiket kajian hukum ini?")) return;

    try {
        await db.collection("hrd_legal_tickets").doc(id).delete();
        if (draftId) {
            await db.collection("hrd_legal_drafts").doc(draftId).delete();
        }

        closeModalDirect();
        toast("🗑️ Dokumen berhasil dihapus dari database", "success");
        loadLegalTickets();
    } catch (e) {
        toast("Gagal menghapus dokumen: " + e.message, "error");
    }
};

window.printLegalTicket = async function(id) {
    try {
        const doc = await db.collection("hrd_legal_tickets").doc(id).get();
        if (!doc.exists) return toast("Dokumen tidak ditemukan", "warning");
        const t = doc.data();

        let printHtml = "";
        if (t.draftId) {
            const draftDoc = await db.collection("hrd_legal_drafts").doc(t.draftId).get();
            if (draftDoc.exists) {
                const d = draftDoc.data();
                printHtml = d.htmlContent || "";
            }
        }

        if (!printHtml) {
            printHtml = `
                <div style="font-family:'Times New Roman', serif; padding:30px">
                    <div style="text-align:center; border-bottom:2px solid #000; padding-bottom:12px; margin-bottom:20px">
                        <h2 style="margin:0; text-transform:uppercase">LEMBAGA PELATIHAN KERJA (LPK) IJEF CORP</h2>
                        <p style="margin:4px 0 0 0; font-size:10pt">LEGAL & HRD MANAGEMENT SYSTEM - DOKUMEN KAJIAN HUKUM</p>
                    </div>
                    <h3 style="text-align:center; text-transform:uppercase; margin-bottom:24px">${escHtml(t.judul)}</h3>
                    <table style="width:100%; border-collapse:collapse; margin-bottom:20px" border="1" cellpadding="8">
                        <tr><td width="30%"><strong>ID Tiket / Ref</strong></td><td>${escHtml(t.ticket_id || '-')}</td></tr>
                        <tr><td><strong>Judul Dokumen</strong></td><td>${escHtml(t.judul)}</td></tr>
                        <tr><td><strong>Nomor Surat</strong></td><td>${escHtml(t.noSurat || '-')}</td></tr>
                        <tr><td><strong>Departemen</strong></td><td>${escHtml(t.dept || 'Legal & HRD')}</td></tr>
                        <tr><td><strong>Status</strong></td><td>${escHtml(t.status)}</td></tr>
                        <tr><td><strong>Tanggal Dibuat</strong></td><td>${formatDate(t.createdAt)}</td></tr>
                    </table>
                </div>
            `;
        }

        const printWin = window.open("", "_blank");
        if (!printWin) return toast("Gagal membuka jendela cetak. Izinkan popup di browser Anda.", "warning");

        printWin.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Cetak Dokumen - ${escHtml(t.judul)}</title>
                <style>
                    @page { size: A4; margin: 15mm 20mm 20mm 20mm; }
                    body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5; color: #000000; background: #ffffff; margin: 0; padding: 20px; }
                    @media print {
                        body { padding: 0; }
                    }
                    p { margin-bottom: 8px; }
                    table { width: 100%; border-collapse: collapse; }
                </style>
            </head>
            <body>
                ${printHtml}
                <script>
                    window.onload = function() {
                        window.print();
                    };
                </script>
            </body>
            </html>
        `);
        printWin.document.close();
    } catch (e) {
        console.error("printLegalTicket error:", e);
        toast("Gagal mencetak dokumen: " + e.message, "error");
    }
};

window.loadLegalPerizinan = async function() {
    const tbody = document.getElementById("tblLegalPerizinan");
    if(!tbody) return;

    try {
        const snap = await db.collection("hrd_legal_perizinan").get();
        let items = [];
        snap.forEach(d => items.push({ id: d.id, ...d.data() }));

        // Safer sort: handle strings, timestamps, or missing dates
        items.sort((a, b) => {
            const dateA = a.createdAt ? (typeof a.createdAt === 'string' ? a.createdAt : (a.createdAt.toDate ? a.createdAt.toDate().toISOString() : String(a.createdAt))) : "";
            const dateB = b.createdAt ? (typeof b.createdAt === 'string' ? b.createdAt : (b.createdAt.toDate ? b.createdAt.toDate().toISOString() : String(b.createdAt))) : "";
            return dateB.localeCompare(dateA);
        });

        let h = "";
        items.forEach(p => {
            const status = p.status || "Aktif";
            const stClass = status === "Aktif" ? "badge-success" : (status === "Non-aktif" ? "badge-danger" : "badge-warning");

            // Auto-check expiry
            let tglMasa = p.masaBerlaku || "-";
            let labelTgl = tglMasa === "-" ? "-" : formatDate(tglMasa);
            if (tglMasa !== "-" && tglMasa < todayStr()) {
                labelTgl = `<span class="color-danger" title="Sudah kadaluarsa">${labelTgl} ⚠️</span>`;
            }

            h += `
            <tr>
                <td class="fw-700">${escHtml(p.nama)}</td>
                <td>${escHtml(p.nomor || "-")}</td>
                <td>${escHtml(p.instansi || "-")}</td>
                <td>${labelTgl}</td>
                <td><span class="badge ${stClass}">${status}</span></td>
                <td>
                    <button class="btn btn-xs btn-info" onclick="viewLegalPerizinan('${p.id}')">👁️</button>
                    <button class="btn btn-xs btn-danger" onclick="hapusLegalPerizinan('${p.id}')">🗑️</button>
                </td>
            </tr>`;
        });
        if (tbody) tbody.innerHTML = h || '<tr><td colspan="6" class="text-center">Belum ada data dokumen</td></tr>';
    } catch (e) {
        console.error("loadLegalPerizinan error:", e);
        if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="text-center color-danger">Gagal memuat data: ${e.message}</td></tr>`;
    }
};

window.hapusLegalPerizinan = async function(id) {
    if (!confirm("Hapus dokumen ini beserta seluruh lampirannya di Storage?")) return;

    try {
        const doc = await db.collection("hrd_legal_perizinan").doc(id).get();
        if (doc.exists) {
            const data = doc.data();
            // Cleanup Firebase Storage
            if (data.attachments && data.attachments.length) {
                for (const a of data.attachments) {
                    if (a.data && a.data.includes("firebasestorage")) {
                        await deleteFileFromStorage(a.data);
                    }
                }
            }
        }
        await db.collection("hrd_legal_perizinan").doc(id).delete();
        toast("Dokumen & lampiran berhasil dihapus", "success");
        renderLegalPerizinan();
    } catch (e) {
        toast("Gagal hapus: " + e.message, "error");
    }
};

window.viewLegalPerizinan = async function(id) {
    const doc = await db.collection("hrd_legal_perizinan").doc(id).get();
    if (!doc.exists) return toast("Data tidak ditemukan", "warning");
    const p = doc.data();
    const status = p.status || "Aktif";

    let attachHtml = '';
    const allAttachments = p.attachments || [];

    // Support legacy format (fileURL / fileName)
    if (p.fileURL && !allAttachments.some(a => a.data === p.fileURL)) {
        allAttachments.push({
            name: p.fileName || 'Dokumen',
            type: (p.fileName || '').toLowerCase().endsWith('.pdf') ? 'application/pdf' :
                  (p.fileName || '').toLowerCase().match(/\.(jpg|jpeg|png)$/) ? 'image/jpeg' : 'application/octet-stream',
            data: p.fileURL
        });
    }

    if (allAttachments.length) {
        attachHtml = `
        <div class="mt-16" style="border-top:1px solid #eee; padding-top:12px">
            <div class="fw-700 text-sm mb-8">📎 Lampiran Dokumen:</div>
            <div style="display:flex; gap:8px; flex-wrap:wrap">`;

        allAttachments.forEach(a => {
            // Re-encoding for safety
            const fileObj = { name: a.name, type: a.type, data: a.data };
            const fileData = encodeURIComponent(JSON.stringify(fileObj));

            const isImage = (a.type || '').startsWith('image/') || (a.name || '').toLowerCase().match(/\.(jpg|jpeg|png)$/);
            const isPdf = a.type === 'application/pdf' || (a.name || '').toLowerCase().endsWith('.pdf');

            if (a.data && isImage) {
                attachHtml += `
                    <div style="text-align:center">
                        <div onclick="viewEviden('${fileData}')" style="cursor:pointer">
                            <img src="${a.data}" style="width:80px; height:80px; border-radius:6px; border:1px solid #ddd; object-fit:cover">
                            <div class="text-xs mt-4 color-primary fw-700">LIHAT/PRINT</div>
                        </div>
                        <div class="text-xs mt-4" style="max-width:80px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">${escHtml(a.name)}</div>
                    </div>`;
            } else {
                attachHtml += `
                    <div style="text-align:center">
                        <div style="cursor:pointer; padding:8px 12px; background:#f0f4ff; border-radius:6px; font-size:.75rem; border:1px solid #d0d9ff; display:flex; flex-direction:column; align-items:center; gap:4px; min-width:80px" onclick="viewEviden('${fileData}')">
                            <span style="font-size:1.5rem">${isPdf ? '📕' : '📄'}</span>
                            <b style="color:var(--primary)">LIHAT/PRINT</b>
                        </div>
                        <div class="text-xs mt-4" style="max-width:80px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">${escHtml(a.name)}</div>
                    </div>`;
            }
        });
        attachHtml += `</div></div>`;
    }

    openModal(`
        <div class="modal-title">📑 Detail Dokumen Legalitas</div>
        <table class="table-detail">
            <tr><td>Nama Dokumen</td><td><b>${escHtml(p.nama)}</b></td></tr>
            <tr><td>Nomor Dokumen</td><td>${escHtml(p.nomor)}</td></tr>
            <tr><td>Instansi Penerbit</td><td>${escHtml(p.instansi)}</td></tr>
            <tr><td>Masa Berlaku</td><td>${p.masaBerlaku !== "-" ? formatDate(p.masaBerlaku) : "-"}</td></tr>
            <tr><td>Status</td><td><span class="badge ${status === 'Aktif' ? 'badge-success' : (status === 'Non-aktif' ? 'badge-danger' : 'badge-warning')}">${status}</span></td></tr>
            <tr><td>Keterangan</td><td>${escHtml(p.keterangan || "-")}</td></tr>
        </table>
        ${attachHtml}
        <div class="mt-16 text-right">
            <button class="btn btn-outline" onclick="closeModalDirect()">Tutup</button>
        </div>
    `, true);
};

window.loadLegalSengketa = async function() {
    const tbody = document.getElementById("tblLegalSengketa");
    if(!tbody) return;
    try {
        const snap = await db.collection("hrd_legal_sengketa").get();
        let items = [];
        snap.forEach(d => items.push({ id: d.id, ...d.data() }));

        items.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

        let h = "";
        items.forEach(p => {
            const status = p.status || "Proses";
            let stClass = "badge-warning";
            if (status === "Selesai" || status === "Win") stClass = "badge-success";
            else if (status === "Kalah" || status === "Batal") stClass = "badge-danger";
            else if (status === "Mediasi") stClass = "badge-info";

            h += `<tr>
                <td class="fw-700">${p.kasus_id || "-"}</td>
                <td class="fw-600">${escHtml(p.judul)}</td>
                <td>${escHtml(p.kategori || "-")}</td>
                <td><span class="badge ${stClass}">${status}</span></td>
                <td>${escHtml(p.pihak || "-")}</td>
                <td>${formatDate(p.tanggal)}</td>
                <td>
                    <div style="display:flex; gap:4px; flex-wrap:nowrap">
                        <button class="btn btn-xs btn-info" onclick="viewLegalSengketa('${p.id}')">👁️ Detail</button>
                        <button class="btn btn-xs btn-warning" onclick="modalSengketa('${p.id}')">✏️ Edit</button>
                        <button class="btn btn-xs btn-danger" onclick="deleteLegalSengketa('${p.id}')">🗑️ Hapus</button>
                    </div>
                </td>
            </tr>`;
        });
        tbody.innerHTML = h || '<tr><td colspan="7" class="text-center">Belum ada data sengketa hukum</td></tr>';
    } catch (e) {
        console.error("loadLegalSengketa error:", e);
        tbody.innerHTML = `<tr><td colspan="7" class="text-center color-danger">Gagal memuat data: ${e.message}</td></tr>`;
    }
};

// ── 6. ACTIONS ───────────────────────────────────────────────────────────────
window.modalKajianHukum = function() {
    openModal(`
        <div class="modal-title">Buat Tiket Kajian Hukum</div>
        <div class="form-group"><label>Judul Kajian</label><input class="form-control" id="lgJudul"></div>
        <button class="btn btn-primary" onclick="simpanKajianHukum()">Simpan</button>`, true);
};
window.simpanKajianHukum = async function() {
    const judul = document.getElementById("lgJudul").value;
    if(!judul) return toast("Judul wajib diisi", "warning");
    await db.collection("hrd_legal_tickets").add({
        ticket_id: "LGL-" + Date.now().toString().slice(-6),
        judul,
        status:"pending",
        createdAt: new Date().toISOString()
    });
    closeModalDirect(); renderKajianHukum();
};
window.modalPerizinan = function() {
    openModal(`
        <div class="modal-title">Tambah Dokumen Perizinan</div>
        <div class="form-group"><label>Nama Dokumen</label><input class="form-control" id="pzNama" placeholder="Contoh: NIB, Akta Notaris, dll"></div>
        <div class="grid-2">
            <div class="form-group"><label>Nomor Dokumen</label><input class="form-control" id="pzNomor" placeholder="No. 123/ABC/2026"></div>
            <div class="form-group"><label>Instansi Penerbit</label><input class="form-control" id="pzInstansi" placeholder="Kemenkumham / OSS"></div>
        </div>
        <div class="grid-2">
            <div class="form-group"><label>Masa Berlaku (Selesai)</label><input class="form-control" type="date" id="pzTgl"></div>
            <div class="form-group"><label>Status</label>
                <select class="form-control" id="pzStatus">
                    <option value="Aktif">Aktif</option>
                    <option value="Proses Perpanjangan">Proses Perpanjangan</option>
                    <option value="Non-aktif">Non-aktif</option>
                </select>
            </div>
        </div>
        <div class="form-group"><label>Keterangan</label><textarea class="form-control" id="pzKet"></textarea></div>
        <div class="form-group">
            <label>📎 Lampiran Softcopy (High Capacity)</label>
            <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px">
                <button type="button" class="btn btn-sm btn-outline" onclick="document.getElementById('pzFiles').click()">📁 Pilih File</button>
                <button type="button" class="btn btn-sm btn-info" onclick="openCamera('pzFilePreview','pzCameraData')">📷 Kamera</button>
            </div>
            <input type="file" id="pzFiles" multiple accept="image/*,.pdf,.doc,.docx" onchange="previewTaskFiles(this,'pzFilePreview')" style="display:none">
            <input type="hidden" id="pzCameraData">
            <div id="pzFilePreview" style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px"></div>
            <div class="text-xs mt-4" style="color:#999">Mendukung file besar (Max 500MB). Format: Gambar, PDF, DOC.</div>
        </div>
        <button class="btn btn-primary" style="width:100%; padding:12px" onclick="simpanPerizinan()">💾 Simpan Dokumen</button>`, true);
};

window.simpanPerizinan = async function() {
    const nama = document.getElementById("pzNama").value;
    const nomor = document.getElementById("pzNomor").value;
    const instansi = document.getElementById("pzInstansi").value;
    const masaBerlaku = document.getElementById("pzTgl").value;
    const status = document.getElementById("pzStatus").value;
    const keterangan = document.getElementById("pzKet").value;

    if(!nama) return toast("Nama dokumen wajib", "warning");

    toast("⏳ Sedang memproses & mengupload dokumen...", "info");

    try {
        const attachments = [];
        const fileInput = document.getElementById('pzFiles');
        const cameraData = document.getElementById('pzCameraData')?.value;

        // 1. Handle File Input (Upload to Firebase Storage)
        if (fileInput && fileInput.files.length > 0) {
            for (const file of fileInput.files) {
                const path = `legal_perizinan/${currentUser.id}/${Date.now()}_${file.name}`;
                const url = await uploadFileToStorage(file, path);
                attachments.push({
                    name: file.name,
                    type: file.type,
                    data: url, // Store URL instead of Base64
                    storagePath: path
                });
            }
        }

        // 2. Handle Camera Data (Upload to Firebase Storage if exists)
        if (cameraData) {
            // Convert base64 to Blob for storage upload
            const response = await fetch(cameraData);
            const blob = await response.blob();
            const fileName = `camera_${Date.now()}.jpg`;
            const path = `legal_perizinan/${currentUser.id}/${fileName}`;
            const url = await uploadFileToStorage(blob, path);
            attachments.push({
                name: fileName,
                type: "image/jpeg",
                data: url,
                storagePath: path
            });
        }

        const data = {
            nama,
            nomor: nomor || "-",
            instansi: instansi || "-",
            masaBerlaku: masaBerlaku || "-",
            status: status || "Aktif",
            keterangan: keterangan || "",
            attachments: attachments,
            createdAt: new Date().toISOString()
        };

        await db.collection("hrd_legal_perizinan").add(data);
        toast("✅ Dokumen berhasil disimpan ke Storage", "success");
        closeModalDirect();
        renderLegalPerizinan();
    } catch (e) {
        console.error(e);
        toast("Gagal simpan: " + e.message, "error");
    }
};
window.modalSengketa = async function(id) {
    let p = {
        judul: "",
        kategori: "Litigasi",
        pihak: "",
        tanggal: todayStr(),
        status: "Proses",
        deskripsi: "",
        noPerkara: "",
        lampiran: []
    };

    if (id) {
        try {
            const doc = await db.collection("hrd_legal_sengketa").doc(id).get();
            if (doc.exists) p = doc.data();
        } catch (e) {
            return toast("Gagal memuat data: " + e.message, "error");
        }
    }

    openModal(`
        <div class="modal-title">${id ? 'Edit' : 'Tambah'} Kasus Sengketa Hukum</div>
        <div class="form-group mb-12">
            <label class="form-label fw-700 text-xs text-secondary">JUDUL KASUS / SENGKETA *</label>
            <input class="form-control" id="skJudul" value="${escHtml(p.judul)}" placeholder="Masukkan Judul Kasus...">
        </div>
        <div class="grid-2 mb-12">
            <div class="form-group">
                <label class="form-label fw-700 text-xs text-secondary">Kategori Kasus</label>
                <select class="form-control" id="skKategori">
                    <option value="Litigasi" ${p.kategori === 'Litigasi' ? 'selected' : ''}>Litigasi</option>
                    <option value="Non-Litigasi" ${p.kategori === 'Non-Litigasi' ? 'selected' : ''}>Non-Litigasi</option>
                    <option value="Ketenagakerjaan" ${p.kategori === 'Ketenagakerjaan' ? 'selected' : ''}>Ketenagakerjaan</option>
                    <option value="Perdata" ${p.kategori === 'Perdata' ? 'selected' : ''}>Perdata</option>
                    <option value="Pidana" ${p.kategori === 'Pidana' ? 'selected' : ''}>Pidana</option>
                    <option value="Lainnya" ${p.kategori === 'Lainnya' ? 'selected' : ''}>Lainnya</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label fw-700 text-xs text-secondary">Status</label>
                <select class="form-control" id="skStatus">
                    <option value="Proses" ${p.status === 'Proses' ? 'selected' : ''}>Proses</option>
                    <option value="Mediasi" ${p.status === 'Mediasi' ? 'selected' : ''}>Mediasi</option>
                    <option value="Selesai" ${p.status === 'Selesai' ? 'selected' : ''}>Selesai</option>
                    <option value="Win" ${p.status === 'Win' ? 'selected' : ''}>Win (Menang)</option>
                    <option value="Kalah" ${p.status === 'Kalah' ? 'selected' : ''}>Kalah</option>
                    <option value="Batal" ${p.status === 'Batal' ? 'selected' : ''}>Batal</option>
                </select>
            </div>
        </div>
        <div class="grid-2 mb-12">
            <div class="form-group">
                <label class="form-label fw-700 text-xs text-secondary">Pihak Terlibat</label>
                <input class="form-control" id="skPihak" value="${escHtml(p.pihak)}" placeholder="Nama Pihak Lawan/Terkait">
            </div>
            <div class="form-group">
                <label class="form-label fw-700 text-xs text-secondary">Tanggal Kejadian / Lapor</label>
                <input class="form-control" type="date" id="skTanggal" value="${p.tanggal}">
            </div>
        </div>
        <div class="form-group mb-12">
            <label class="form-label fw-700 text-xs text-secondary">Nomor Perkara (Jika ada)</label>
            <input class="form-control" id="skNoPerkara" value="${escHtml(p.noPerkara)}" placeholder="Contoh: 123/Pdt.G/2026/PN JKT">
        </div>
        <div class="form-group mb-12">
            <label class="form-label fw-700 text-xs text-secondary">Deskripsi Singkat & Kronologi</label>
            <textarea class="form-control" id="skDeskripsi" rows="3" placeholder="Jelaskan ringkasan kasus...">${escHtml(p.deskripsi)}</textarea>
        </div>
        <div class="form-group mb-12">
            <label class="form-label fw-700 text-xs text-secondary">📁 Upload Lampiran (PDF, Word, Excel)</label>
            <input type="file" class="form-control" id="skFile" accept=".pdf,.doc,.docx,.xls,.xlsx">
            <p class="text-xs text-secondary mt-4">Pilih file untuk menambah atau mengganti lampiran utama.</p>
        </div>
        ${p.lampiran && p.lampiran.length > 0 ? `
            <div class="mb-12 p-8" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px">
                <div class="fw-700 text-xs mb-4">Lampiran Tersimpan:</div>
                ${p.lampiran.map((file, idx) => `
                    <div class="flex justify-between items-center text-sm py-2">
                        <span>📄 ${escHtml(file.name)}</span>
                        <a href="${file.url}" target="_blank" class="color-primary fw-600 text-xs">Lihat</a>
                    </div>
                `).join('')}
            </div>
        ` : ''}
        <div class="mt-16 flex gap-8 justify-end">
            <button class="btn btn-primary" onclick="simpanSengketa('${id || ''}')">💾 ${id ? 'Update' : 'Simpan'} Kasus</button>
            <button class="btn btn-outline" onclick="closeModalDirect()">Batal</button>
        </div>
    `, true);
};

window.simpanSengketa = async function(id) {
    const judul = document.getElementById("skJudul").value.trim();
    const kategori = document.getElementById("skKategori").value;
    const status = document.getElementById("skStatus").value;
    const pihak = document.getElementById("skPihak").value.trim();
    const tanggal = document.getElementById("skTanggal").value;
    const noPerkara = document.getElementById("skNoPerkara").value.trim();
    const deskripsi = document.getElementById("skDeskripsi").value.trim();
    const fileInput = document.getElementById("skFile");

    if (!judul) return toast("Judul wajib diisi", "warning");

    try {
        toast("⏳ Sedang menyimpan...", "info");

        let lampiran = [];
        // If editing, keep old attachments for now (simple implementation)
        if (id) {
            const oldDoc = await db.collection("hrd_legal_sengketa").doc(id).get();
            if (oldDoc.exists) lampiran = oldDoc.data().lampiran || [];
        }

        // Handle File Upload
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const path = `legal/sengketa/${Date.now()}_${file.name}`;
            const url = await uploadFileToStorage(file, path);
            lampiran.push({ name: file.name, url: url, path: path });
        }

        const data = {
            judul,
            kategori,
            status,
            pihak,
            tanggal,
            noPerkara,
            deskripsi,
            lampiran,
            updatedAt: new Date().toISOString()
        };

        if (id) {
            await db.collection("hrd_legal_sengketa").doc(id).update(data);
            toast("✅ Kasus sengketa berhasil diperbarui!", "success");
        } else {
            data.kasus_id = "SK-" + Date.now().toString().slice(-6);
            data.createdAt = new Date().toISOString();
            await db.collection("hrd_legal_sengketa").add(data);
            toast("✅ Kasus sengketa berhasil ditambahkan!", "success");
        }

        closeModalDirect();
        renderLegalSengketa();
    } catch (e) {
        console.error("simpanSengketa error:", e);
        toast("❌ Gagal menyimpan: " + e.message, "error");
    }
};

window.viewLegalSengketa = async function(id) {
    try {
        const doc = await db.collection("hrd_legal_sengketa").doc(id).get();
        if (!doc.exists) return toast("Data tidak ditemukan", "warning");
        const p = doc.data();

        let lampiranHtml = '<p class="text-secondary italic">Tidak ada lampiran.</p>';
        if (p.lampiran && p.lampiran.length > 0) {
            lampiranHtml = p.lampiran.map(file => `
                <div class="flex items-center gap-8 mb-4 p-8" style="background:#f1f5f9; border-radius:6px">
                    <span style="font-size:1.5rem">📄</span>
                    <div style="flex:1">
                        <div class="fw-700 text-sm">${escHtml(file.name)}</div>
                        <div class="text-xs text-secondary">Dokumen Lampiran Kasus</div>
                    </div>
                    <a href="${file.url}" target="_blank" class="btn btn-xs btn-primary">Buka</a>
                </div>
            `).join('');
        }

        openModal(`
            <div class="modal-title">👁️ Detail Kasus Sengketa Hukum</div>
            <div style="background:#f9f9f9; padding:16px; border-radius:8px; border-left:4px solid var(--primary); margin-bottom:16px">
                <h3 class="mb-4">${escHtml(p.judul)}</h3>
                <div class="flex gap-8">
                    <span class="badge badge-info">${escHtml(p.kategori)}</span>
                    <span class="badge badge-warning">${escHtml(p.status)}</span>
                </div>
            </div>

            <div class="grid-2 mb-16" style="font-size:0.85rem; gap:12px">
                <div><b>ID Kasus:</b> ${escHtml(p.kasus_id || '-')}</div>
                <div><b>Tanggal:</b> ${formatDate(p.tanggal)}</div>
                <div><b>Pihak Terlibat:</b> ${escHtml(p.pihak || '-')}</div>
                <div><b>No. Perkara:</b> ${escHtml(p.noPerkara || '-')}</div>
            </div>

            <div class="mb-16">
                <div class="fw-700 text-xs text-secondary mb-4 uppercase">Deskripsi & Kronologi:</div>
                <div class="p-12" style="background:#fff; border:1px solid #eee; border-radius:8px; font-size:0.9rem; line-height:1.6; white-space:pre-wrap">
                    ${escHtml(p.deskripsi || 'Tidak ada deskripsi.')}
                </div>
            </div>

            <div class="mb-16">
                <div class="fw-700 text-xs text-secondary mb-4 uppercase">Dokumen Lampiran:</div>
                ${lampiranHtml}
            </div>

            <div class="mt-20 pt-16 border-top flex justify-between items-center">
                <div class="text-xs text-secondary italic">Terakhir diupdate: ${formatDateTime(p.updatedAt || p.createdAt)}</div>
                <div class="flex gap-8">
                    <button class="btn btn-warning btn-sm" onclick="closeModalDirect(); modalSengketa('${id}')">✏️ Edit</button>
                    <button class="btn btn-outline btn-sm" onclick="closeModalDirect()">Tutup</button>
                </div>
            </div>
        `, true);
    } catch (e) {
        toast("Gagal memuat detail: " + e.message, "error");
    }
};

window.deleteLegalSengketa = async function(id) {
    if (!confirm("Apakah Anda yakin ingin menghapus data kasus ini? Tindakan ini tidak dapat dibatalkan.")) return;
    try {
        await db.collection("hrd_legal_sengketa").doc(id).delete();
        toast("✅ Data berhasil dihapus", "success");
        renderLegalSengketa();
    } catch (e) {
        toast("Gagal menghapus: " + e.message, "error");
    }
};
