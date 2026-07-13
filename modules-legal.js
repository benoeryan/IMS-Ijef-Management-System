"use strict";

/**
 * MODULES-LEGAL.JS
 * Modul untuk fitur Legal Internal & Eksternal
 * Full-screen Drafting Workspace & AI Assistant
 */

// ── KAJIAN HUKUM / TIKET ───────────────────────────────────────

async function renderKajianHukum() {
    const main = document.getElementById("mainContent");
    main.innerHTML = `
    <div class="page-title">
        <span>🔨 Kajian Hukum / Tiket</span>
        <div class="flex gap-8">
            <button class="btn btn-info btn-sm" onclick="modalLegalDrafting()">✍️ Buat Draft Dokumen</button>
            <button class="btn btn-primary btn-sm" onclick="modalKajianHukum()">+ Buat Tiket Kajian</button>
        </div>
    </div>
    <div class="card">
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>ID Tiket</th>
                        <th>Judul Kajian</th>
                        <th>Departemen</th>
                        <th>Status Approval</th>
                        <th>Tanggal</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody id="tblLegalTickets">
                    <tr><td colspan="6" class="text-center">Memuat data...</td></tr>
                </tbody>
            </table>
        </div>
    </div>`;

    loadLegalTickets();
}

// ── LEGAL DRAFTING & TEMPLATES ────────────────────────────────

async function modalLegalDrafting() {
    // ── INTEGRASI GENERATOR SURAT ──
    let nextSeq = "001";
    try {
        const suratSnap = await db.collection("hrd_surat").get();
        nextSeq = String(suratSnap.size + 1).padStart(3, '0');
    } catch (e) {
        nextSeq = Math.floor(100 + Math.random() * 899).toString();
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const autoNumber = `${nextSeq}/LGL-IJEF/${month}/${year}`;

    // Inject styles for Word-like Full Screen Workspace
    const styleId = "legalDraftingStyles";
    if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
            .modal-fullscreen {
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                max-width: none !important; max-height: none !important;
                border-radius: 0 !important; margin: 0 !important;
                display: flex; flex-direction: column; padding: 0 !important;
                background: #f0f2f5; font-family: 'Segoe UI', sans-serif;
            }
            /* WORD RIBBON UI */
            .word-top-bar {
                background: #2b579a; color: #fff; padding: 4px 15px;
                display: flex; justify-content: space-between; align-items: center;
                font-size: 0.85rem; height: 32px;
            }
            .word-ribbon {
                background: #f3f4f6; border-bottom: 1px solid #ccc;
                display: flex; flex-direction: column;
            }
            .ribbon-tabs {
                display: flex; padding-left: 10px; background: #fff;
                border-bottom: 1px solid #ddd;
            }
            .ribbon-tab {
                padding: 8px 15px; cursor: pointer; font-size: 0.88rem;
                color: #333; border-bottom: 3px solid transparent;
                transition: 0.2s;
            }
            .ribbon-tab:hover { background: #f0f2f5; }
            .ribbon-tab.active {
                border-bottom-color: #2b579a; color: #2b579a; font-weight: 600;
            }
            .ribbon-content {
                padding: 5px 15px; height: 95px; display: flex; align-items: center;
                gap: 20px; overflow-x: auto; background: #f3f4f6;
            }
            .ribbon-panel { display: none; align-items: center; gap: 15px; height: 100%; }
            .ribbon-panel.active { display: flex; }

            .ribbon-group {
                display: flex; flex-direction: column; align-items: center;
                justify-content: center; height: 100%; padding: 0 10px;
                border-right: 1px solid #ddd; gap: 5px;
            }
            .ribbon-group-label {
                font-size: 0.65rem; color: #888; text-transform: uppercase;
                margin-top: auto;
            }
            .ribbon-row { display: flex; align-items: center; gap: 4px; width: 100%; }

            .ribbon-tool-btn {
                background: transparent; border: 1px solid transparent;
                padding: 6px; border-radius: 4px; cursor: pointer;
                display: flex; flex-direction: column; align-items: center;
                gap: 2px; transition: 0.15s; min-width: 45px;
            }
            .ribbon-tool-btn:hover { background: #e2e8f0; border-color: #cbd5e0; }
            .ribbon-tool-btn i { font-size: 1.2rem; }
            .ribbon-tool-btn span { font-size: 0.72rem; color: #444; }

            .word-main-layout {
                display: flex; flex: 1; overflow: hidden; height: calc(100vh - 127px);
            }
            .word-sidebar {
                width: 320px; background: #fff; border-left: 1px solid #ddd;
                display: flex; flex-direction: column; overflow-y: auto;
            }
            .word-content-area {
                flex: 1; background: #525659; overflow-y: auto;
                display: flex; justify-content: center; padding: 40px 0;
            }
            .word-page {
                background: white; width: 210mm; min-height: 297mm;
                padding: 2.5cm 2.5cm 2cm 2.5cm; box-shadow: 0 0 15px rgba(0,0,0,0.3);
                display: flex; flex-direction: column; position: relative; color: #000;
            }
            .word-editor {
                border: 1px solid transparent; width: 100%; min-height: 100%;
                flex: 1; font-family: 'Times New Roman', serif; font-size: 11pt;
                line-height: 1.5; outline: none; padding: 0; margin-top: 10px;
                background: #fff; text-align: justify;
            }
            .word-editor:focus { border: 1px dashed #eee; }
            .toolbar-grp {
                display: flex; align-items: center; gap: 2px;
                padding: 2px 8px; border-right: 1px solid #ddd;
            }
            .toolbar-btn {
                background: transparent; border: 1px solid transparent;
                padding: 4px 6px; border-radius: 4px; cursor: pointer;
                font-size: 0.9rem; min-width: 32px; color: #444; transition: 0.2s;
            }
            .toolbar-btn:hover { background: #e2e8f0; border-color: #cbd5e0; }
            .toolbar-btn.active { background: #3182ce; color: #fff; }
            .toolbar-select {
                padding: 4px 6px; border-radius: 4px; border: 1px solid #ccc;
                font-size: 0.8rem; background: #fff; outline: none;
            }
            .word-kop-preview {
                display: none; border-bottom: 2px solid #000;
                padding-bottom: 10px; margin-bottom: 20px; align-items: center;
            }
            .word-kop-preview.active { display: flex; }
        `;
        document.head.appendChild(style);
    }

    // Load Data Perusahaan
    let cp = { nama: "LPK IJEF CORP", alamat: "Bandung Barat", telp: "-", email: "-", logo: "" };
    try {
        const doc = await db.collection("hrd_settings").doc("perusahaan").get();
        if (doc.exists) cp = { ...cp, ...doc.data() };
    } catch (e) {}

    openModal(`
        <div class="modal-fullscreen" id="modalWorkspace">
            <!-- TOP BLUE BAR -->
            <div class="word-top-bar">
                <div style="display:flex; align-items:center; gap:15px">
                    <span style="font-weight:bold; letter-spacing:1px">WORD</span>
                    <div style="display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.2); padding:2px 10px; border-radius:4px">
                        <span class="text-xs">AutoSave</span>
                        <div style="width:30px; height:16px; background:#fff; border-radius:10px; position:relative">
                            <div style="width:12px; height:12px; background:#2b579a; border-radius:50%; position:absolute; top:2px; right:2px"></div>
                        </div>
                    </div>
                    <span class="text-xs" style="opacity:0.9">Draft Dokumen Legal - IJEF Corp</span>
                </div>
                <div style="flex:1; display:flex; justify-content:center">
                    <div style="background:rgba(255,255,255,0.15); width:400px; padding:4px 15px; border-radius:4px; display:flex; align-items:center; gap:10px">
                        <span>🔍</span>
                        <input type="text" placeholder="Search" style="background:transparent; border:none; color:#fff; width:100%; outline:none; font-size:0.75rem">
                    </div>
                </div>
                <div class="flex gap-12">
                    <button class="btn btn-xs" style="background:#fff; color:#2b579a; font-weight:bold" onclick="simpanDraftLegal()">💾 SIMPAN</button>
                    <button class="btn btn-xs" style="background:rgba(255,255,255,0.2); color:#fff" onclick="closeModalDirect()">✕</button>
                </div>
            </div>

            <!-- WORD RIBBON -->
            <div class="word-ribbon">
                <div class="ribbon-tabs">
                    <div class="ribbon-tab" onclick="switchRibbonTab('file')">File</div>
                    <div class="ribbon-tab active" onclick="switchRibbonTab('home')">Home</div>
                    <div class="ribbon-tab" onclick="switchRibbonTab('insert')">Insert</div>
                    <div class="ribbon-tab" onclick="switchRibbonTab('design')">Design</div>
                    <div class="ribbon-tab" onclick="switchRibbonTab('layout')">Layout</div>
                    <div class="ribbon-tab" onclick="switchRibbonTab('references')">References</div>
                    <div class="ribbon-tab" onclick="switchRibbonTab('mailings')">Mailings</div>
                    <div class="ribbon-tab" onclick="switchRibbonTab('review')">Review</div>
                    <div class="ribbon-tab" onclick="switchRibbonTab('view')">View</div>
                    <div class="ribbon-tab" onclick="switchRibbonTab('help')">Help</div>
                </div>
                <div class="ribbon-content" id="ribbonContent">
                    <!-- HOME PANEL -->
                    <div class="ribbon-panel active" id="ribbon-home">
                        <div class="ribbon-group">
                            <div class="ribbon-row">
                                <button class="toolbar-btn" onclick="formatDoc('undo')" title="Undo">⟲</button>
                                <button class="toolbar-btn" onclick="formatDoc('redo')" title="Redo">⟳</button>
                            </div>
                            <div class="ribbon-group-label">Undo</div>
                        </div>
                        <div class="ribbon-group">
                            <div class="ribbon-row">
                                <select class="toolbar-select" id="drFontFamily" onchange="formatDoc('fontName', this.value)" style="width:160px">
                                    <optgroup label="Font Profesional & Akademis (Serif)">
                                        <option value="Times New Roman" selected>Times New Roman</option>
                                        <option value="Georgia">Georgia</option>
                                        <option value="Garamond">Garamond</option>
                                        <option value="Palatino Linotype">Palatino Linotype</option>
                                        <option value="Book Antiqua">Book Antiqua</option>
                                    </optgroup>
                                    <optgroup label="Font Modern & Bersih (Sans Serif)">
                                        <option value="Calibri">Calibri</option>
                                        <option value="Arial">Arial</option>
                                        <option value="Aptos, Segoe UI, sans-serif">Aptos</option>
                                        <option value="Segoe UI">Segoe UI</option>
                                        <option value="Trebuchet MS">Trebuchet MS</option>
                                        <option value="Verdana">Verdana</option>
                                    </optgroup>
                                    <optgroup label="Font Judul & Dekoratif (Display)">
                                        <option value="Arial Black">Arial Black</option>
                                        <option value="Impact">Impact</option>
                                        <option value="Copperplate">Copperplate Gothic</option>
                                        <option value="Franklin Gothic Medium">Franklin Gothic Medium</option>
                                    </optgroup>
                                    <optgroup label="Font Tulisan Tangan (Script)">
                                        <option value="Monotype Corsiva">Monotype Corsiva</option>
                                        <option value="Brush Script MT">Brush Script MT</option>
                                        <option value="Lucida Handwriting">Lucida Handwriting</option>
                                        <option value="Edwardian Script ITC">Edwardian Script ITC</option>
                                    </optgroup>
                                    <optgroup label="Font Mesin Ketik (Monospace)">
                                        <option value="Courier New">Courier New</option>
                                        <option value="Consolas">Consolas</option>
                                    </optgroup>
                                </select>
                                <select class="toolbar-select" onchange="formatDoc('fontSize', this.value)" style="width:60px">
                                    <option value="3">12pt</option>
                                    <option value="1">8pt</option>
                                    <option value="2">10pt</option>
                                    <option value="4">14pt</option>
                                    <option value="5">18pt</option>
                                    <option value="6">24pt</option>
                                    <option value="7">36pt</option>
                                </select>
                            </div>
                            <div class="ribbon-row">
                                <button class="toolbar-btn" onclick="formatDoc('bold')" title="Bold"><b>B</b></button>
                                <button class="toolbar-btn" onclick="formatDoc('italic')" title="Italic"><i>I</i></button>
                                <button class="toolbar-btn" onclick="formatDoc('underline')" title="Underline"><u>U</u></button>
                                <button class="toolbar-btn" onclick="formatDoc('strikeThrough')" title="Strikethrough"><strike>S</strike></button>
                                <input type="color" onchange="formatDoc('foreColor', this.value)" title="Text Color" style="width:24px;height:24px;padding:0;border:none;cursor:pointer">
                                <input type="color" value="#ffff00" onchange="formatDoc('backColor', this.value)" title="Highlight" style="width:24px;height:24px;padding:0;border:none;cursor:pointer;margin-left:4px">
                            </div>
                            <div class="ribbon-group-label">Font</div>
                        </div>
                        <div class="ribbon-group">
                            <div class="ribbon-row">
                                <button class="toolbar-btn" onclick="formatDoc('justifyLeft')" title="Align Left">≡</button>
                                <button class="toolbar-btn" onclick="formatDoc('justifyCenter')" title="Align Center">≣</button>
                                <button class="toolbar-btn" onclick="formatDoc('justifyRight')" title="Align Right">≡</button>
                                <button class="toolbar-btn" onclick="formatDoc('justifyFull')" title="Justify">≡</button>
                            </div>
                            <div class="ribbon-row">
                                <button class="toolbar-btn" onclick="formatDoc('insertUnorderedList')" title="Bullets">• List</button>
                                <button class="toolbar-btn" onclick="formatDoc('insertOrderedList')" title="Numbering">1. List</button>
                                <button class="toolbar-btn" onclick="formatDoc('outdent')" title="Decrease Indent">⇤</button>
                                <button class="toolbar-btn" onclick="formatDoc('indent')" title="Increase Indent">⇥</button>
                            </div>
                            <div class="ribbon-group-label">Paragraph</div>
                        </div>
                        <div class="ribbon-group">
                            <div class="ribbon-row" style="gap:8px">
                                <button class="toolbar-btn" onclick="formatDoc('formatBlock', 'P')" style="flex-direction:row; gap:4px; font-size:0.7rem; width:70px">Aa Normal</button>
                                <button class="toolbar-btn" onclick="formatDoc('formatBlock', 'H1')" style="flex-direction:row; gap:4px; font-size:0.7rem; width:70px"><b>Aa Head 1</b></button>
                                <button class="toolbar-btn" onclick="formatDoc('formatBlock', 'H2')" style="flex-direction:row; gap:4px; font-size:0.7rem; width:70px"><b>Aa Head 2</b></button>
                            </div>
                            <div class="ribbon-group-label">Styles</div>
                        </div>
                    </div>

                    <!-- FILE PANEL -->
                    <div class="ribbon-panel" id="ribbon-file">
                        <button class="ribbon-tool-btn" onclick="simpanDraftLegal()"><i>💾</i><span>Simpan</span></button>
                        <button class="ribbon-tool-btn" onclick="printDraftLegalDirect()"><i>🖨️</i><span>Cetak A4</span></button>
                        <button class="ribbon-tool-btn" onclick="document.getElementById('drFileImport').click()"><i>📁</i><span>Impor File</span></button>
                        <input type="file" id="drFileImport" style="display:none" accept=".txt,.html,.md" onchange="importDocumentToWorkspace(this)">
                        <div class="ribbon-group-label">File Actions</div>
                    </div>

                    <!-- INSERT PANEL -->
                    <div class="ribbon-panel" id="ribbon-insert">
                        <div class="ribbon-group">
                            <select class="form-control" id="drTemplate" onchange="applyLegalTemplate()" style="width:180px; font-size:0.8rem">
                                <option value="">-- Pilih Template --</option>
                                <option value="mou">MOU Kerjasama</option>
                                <option value="nda">NDA Agreement</option>
                                <option value="spk">Surat Perintah Kerja (SPK)</option>
                                <option value="pks">Perjanjian Kerjasama (PKS)</option>
                            </select>
                            <div class="ribbon-group-label">Legal Templates</div>
                        </div>
                    </div>

                    <!-- LAYOUT PANEL -->
                    <div class="ribbon-panel" id="ribbon-layout">
                         <div class="ribbon-group">
                            <label style="display:flex; align-items:center; gap:8px; font-size:0.8rem; cursor:pointer">
                                <input type="checkbox" id="drPakeKop" checked onchange="document.getElementById('kopPreview').classList.toggle('active', this.checked)"> Tampilkan KOP Surat
                            </label>
                            <div class="ribbon-group-label">Page Setup</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- MAIN WORKSPACE -->
            <div class="word-main-layout">
                <!-- CENTER: A4 PAGE -->
                <div class="word-content-area">
                    <div class="word-page" id="wordPage">
                        <!-- KOP PREVIEW -->
                        <div class="word-kop-preview active" id="kopPreview">
                            <img src="${cp.logo || 'icon-ijef-v3.png'}" style="width:70px; height:70px; object-fit:contain; margin-right:20px">
                            <div style="flex:1; text-align:center">
                                <div style="font-size:14pt; font-weight:bold; text-transform:uppercase; color:#000">${cp.nama}</div>
                                <div style="font-size:9pt; color:#444">${cp.alamat} ${cp.kota || ''}</div>
                                <div style="font-size:9pt; color:#444">Telp: ${cp.telepon || cp.telp || '-'} | Email: ${cp.email}</div>
                                ${cp.nib ? `<div style="font-size:8pt; color:#666">NIB: ${cp.nib}</div>` : ''}
                            </div>
                        </div>
                        <!-- TITLE AREA -->
                        <div style="text-align:center; margin-bottom: 20px">
                            <div id="drJudul" contenteditable="true" style="width:100%; text-align:center; font-weight:bold; font-size:13pt; border:none; outline:none; text-decoration:underline" data-placeholder="JUDUL DOKUMEN / PERIHAL">JUDUL DOKUMEN / PERIHAL</div>
                            <div style="font-size:11pt; margin-top:8px">Nomor: <input type="text" id="drNomor" value="${autoNumber}" style="border:none; background:transparent; font-family:monospace; font-size:11pt; width:220px; text-align:left; outline:none"></div>
                        </div>
                        <!-- CONTENT AREA (WYSIWYG) -->
                        <div class="word-editor" id="drKonten" contenteditable="true"></div>
                    </div>
                </div>

                <!-- RIGHT: AI & DATA PANEL -->
                <div class="word-sidebar">
                    <div style="padding:15px; background:var(--primary); color:#fff">
                        <div class="fw-700 text-sm">🤖 Legal Brain AI (Gemini Pro)</div>
                        <div class="text-xs" style="opacity:0.8">Analisis & Drafting Interaktif</div>
                    </div>

                    <div id="aiChatBox" style="flex:1; overflow-y:auto; padding:15px; font-size:0.82rem; background:#f9f9f9">
                        <div style="margin-bottom:12px; background:#fff; border:1px solid #e0e0e0; padding:12px; border-radius:10px; box-shadow:0 2px 4px rgba(0,0,0,0.02)">
                            Halo! Saya <b>AI Legal Assistant</b> Anda.<br><br>
                            Gunakan panel ini untuk berdiskusi mengenai pasal atau meminta saya meninjau draf yang sedang Anda buat.
                        </div>
                    </div>

                    <div style="padding:15px; border-top:1px solid #ddd; background:#fff">
                        <textarea class="form-control" id="aiPrompt" style="min-height:100px; font-size:0.85rem; border-radius:10px; border:2px solid #edf2f7" placeholder="Ketik permintaan Anda di sini..."></textarea>
                        <div class="flex gap-4 mt-12">
                            <button class="btn btn-primary" style="flex:1" onclick="discussWithAI()">💬 Kirim AI</button>
                            <button class="btn btn-info" onclick="discussWithAI(true)" title="Kirim draf saat ini ke AI untuk dianalisis">🧐 Analisis Draf</button>
                            <button class="btn btn-success" onclick="executeAIDraft()" title="Terapkan ke lembar kerja">⚡ Terapkan</button>
                        </div>
                        <div class="form-group mt-16">
                            <label class="text-xs">Informasi Pihak Kedua</label>
                            <input class="form-control" id="drPihak2" placeholder="Nama Pihak Kedua (Lembaga/Orang)">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `, true);

    // Convert current modal to fullscreen
    const modal = document.getElementById("modalContent");
    if (modal) {
        modal.classList.add("modal-fullscreen");
        modal.parentElement.style.padding = "0"; // remove overlay padding
    }
}

function formatDoc(cmd, val) {
    document.execCommand(cmd, false, val);
    const editor = document.getElementById("drKonten");
    if (editor) editor.focus();
}

function applyLegalTemplate() {
    const type = document.getElementById("drTemplate").value;
    const konten = document.getElementById("drKonten");
    const judul = document.getElementById("drJudul");
    const num = document.getElementById("drNomor").value;

    const templates = {
        mou: {
            judul: "MEMORANDUM OF UNDERSTANDING (MOU)",
            isi: `<p style="text-align:center"><b>MEMORANDUM OF UNDERSTANDING</b></p>
            <p style="text-align:center">Nomor: ${num}</p><br>
            <p>Antara <b>LPK IJEF CORP</b> Dan <b>[PIHAK KEDUA]</b> Tentang <b>[PERIHAL KERJASAMA]</b></p><br>
            <p>Pada hari ini [HARI], tanggal [TANGGAL], kami yang bertanda tangan di bawah ini:</p>
            <ol>
                <li><b>Nama: Muhammad Agus Ryanda</b><br>Jabatan: Administrator<br>Bertindak untuk dan atas nama LPK IJEF CORP, selanjutnya disebut PIHAK PERTAMA.</li><br>
                <li><b>Nama: [NAMA PIHAK KEDUA]</b><br>Jabatan: [JABATAN]<br>Bertindak untuk dan atas nama [PERUSAHAAN], selanjutnya disebut PIHAK KEDUA.</li>
            </ol>
            <p>Kedua belah pihak sepakat untuk melakukan kerjasama dalam bidang [...] dengan ketentuan sebagai berikut:</p>
            <p><b>PASAL 1: MAKSUD DAN TUJUAN</b><br>...</p>`
        },
        nda: {
            judul: "NON-DISCLOSURE AGREEMENT (NDA)",
            isi: `<p style="text-align:center"><b>NON-DISCLOSURE AGREEMENT (NDA)</b></p>
            <p style="text-align:center">Nomor: ${num}</p><br>
            <p>Perjanjian Kerahasiaan ini dibuat antara <b>LPK IJEF CORP</b> dan <b>[PIHAK KEDUA]</b>.</p><br>
            <p>Bahwa Para Pihak bersedia untuk mengungkapkan Informasi Rahasia tertentu kepada Pihak lainnya untuk tujuan [...]</p>
            <p><b>PASAL 1: DEFINISI INFORMASI RAHASIA</b><br>Informasi Rahasia berarti setiap data, laporan, catatan, rahasia dagang, atau informasi teknis maupun komersial lainnya...</p>`
        },
        spk: {
            judul: "SURAT PERINTAH KERJA (SPK)",
            isi: `<p style="text-align:center"><b>SURAT PERINTAH KERJA (SPK)</b></p>
            <p style="text-align:center">Nomor: ${num}</p><br>
            <p>Kepada: <b>[PIHAK KEDUA]</b><br>Alamat: [ALAMAT]</p><br>
            <p>Dengan ini kami memberikan perintah kerja untuk:</p>
            <ul>
                <li>Nama Pekerjaan: [...]</li>
                <li>Nilai Kontrak: [...]</li>
                <li>Jangka Waktu: [...]</li>
            </ul><br>
            <p>Demikian surat perintah ini dibuat untuk dilaksanakan dengan sebaik-baiknya.</p>`
        },
        pks: {
            judul: "PERJANJIAN KERJA SAMA (PKS)",
            isi: `<p style="text-align:center"><b>PERJANJIAN KERJA SAMA</b></p>
            <p style="text-align:center">Nomor: ${num}</p><br>
            <p>Perjanjian ini dibuat dan ditandatangani pada hari ini [...] antara LPK IJEF CORP dan [PIHAK KEDUA].</p>
            <p><b>PASAL 1: RUANG LINGKUP PEKERJAAN</b><br>...</p>
            <p><b>PASAL 2: NILAI PERJANJIAN DAN TATA CARA PEMBAYARAN</b><br>...</p>`
        }
    };

    if (templates[type]) {
        judul.innerHTML = templates[type].judul;
        konten.innerHTML = templates[type].isi;
    }
}

async function simpanDraftLegal() {
    const data = {
        nomor: document.getElementById("drNomor").value,
        judul: document.getElementById("drJudul").innerHTML.replace(/<[^>]*>/g, ''),
        pihak2: document.getElementById("drPihak2").value,
        konten: document.getElementById("drKonten").innerHTML,
        type: "draft_kontrak",
        createdBy: currentUser.nama,
        createdAt: new Date().toISOString()
    };

    if (!data.judul || data.judul === "JUDUL DOKUMEN / PERIHAL") return toast("Judul wajib diisi", "warning");

    try {
        await db.collection("hrd_legal_drafts").add(data);
        await db.collection("hrd_surat").add({
            nomor: data.nomor,
            jenis: "SPK/LGL",
            perihal: data.judul,
            tanggal: todayStr(),
            dibuatOleh: currentUser.nama,
            createdAt: new Date().toISOString(),
            source: "Legal Drafting"
        });

        toast("Draft disimpan dan Nomor Surat telah disinkronkan!", "success");
        closeModalDirect();
    } catch (e) {
        toast("Gagal: " + e.message, "error");
    }
}

// ── PRINTING LOGIC WITH KOP SURAT ─────────────────────────────

async function printDraftLegalDirect() {
    const judul = document.getElementById("drJudul").innerHTML || "Draft Dokumen";
    const nomor = document.getElementById("drNomor").value;
    const konten = document.getElementById("drKonten").innerHTML;
    const pakeKop = document.getElementById("drPakeKop").checked;

    if (!konten) return toast("Isi konten draft dulu sebelum print", "warning");

    let cp = { nama: "LPK IJEF CORP", alamat: "Bandung Barat", telp: "-", email: "-", logo: "" };
    try {
        const doc = await db.collection("hrd_settings").doc("perusahaan").get();
        if (doc.exists) cp = { ...cp, ...doc.data() };
    } catch (e) {}

    const printWin = window.open('', '_blank');

    let kopHtml = "";
    if (pakeKop) {
        kopHtml = `
        <div style="display:flex; align-items:center; border-bottom:3px solid #000; padding-bottom:10px; margin-bottom:20px">
            <img src="${cp.logo || 'icon-ijef-v3.png'}" style="width:80px; height:80px; object-fit:contain; margin-right:20px">
            <div style="flex:1; text-align:center">
                <div style="font-size:18pt; font-weight:bold; text-transform:uppercase">${cp.nama}</div>
                <div style="font-size:10pt; margin-top:4px">${cp.alamat} ${cp.kota || ''}</div>
                <div style="font-size:10pt">Telp: ${cp.telepon || cp.telp || '-'} | Email: ${cp.email}</div>
            </div>
        </div>`;
    }

    printWin.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Cetak Dokumen Legal</title>
            <style>
                @page { size: A4; margin: 2cm; }
                body { font-family: 'Times New Roman', serif; line-height: 1.6; color: #000; padding: 0; margin: 0; }
                .content { font-size: 11pt; text-align: justify; }
                .content p { margin-bottom: 10px; }
                .title-area { text-align: center; margin-bottom: 30px; }
                .doc-title { font-size: 14pt; font-weight: bold; text-decoration: underline; margin-bottom: 5px; }
                .doc-number { font-size: 11pt; margin-bottom: 20px; }
            </style>
        </head>
        <body>
            ${kopHtml}
            <div class="title-area">
                <div class="doc-title">${judul.replace(/<[^>]*>/g, '').toUpperCase()}</div>
                <div class="doc-number">Nomor: ${nomor}</div>
            </div>
            <div class="content">${konten}</div>
            <script>setTimeout(() => { window.print(); window.close(); }, 700);</script>
        </body>
        </html>
    `);
    printWin.document.close();
}

function discussWithAI(includeDraft = false) {
    let prompt = document.getElementById("aiPrompt").value.trim();
    if (!prompt && !includeDraft) return;

    const editor = document.getElementById("drKonten");
    const currentDraft = editor.innerText || editor.textContent;

    if (includeDraft) {
        if (!currentDraft || currentDraft.length < 10) return toast("Draf masih kosong, ketik atau impor sesuatu dulu", "warning");
        prompt = prompt || "Mohon analisis draf dokumen ini dari sisi hukum dan berikan saran perbaikan.";
    }

    const chatBox = document.getElementById("aiChatBox");
    chatBox.innerHTML += `<div style="margin-bottom:10px; text-align:right"><div style="display:inline-block; background:#3182ce; color:#fff; padding:8px 12px; border-radius:15px 15px 2px 15px; max-width:90%">${escHtml(prompt)} ${includeDraft ? '<br><small>(Analisis Draf Aktif)</small>' : ''}</div></div>`;
    document.getElementById("aiPrompt").value = "";
    chatBox.scrollTop = chatBox.scrollHeight;

    chatBox.innerHTML += `<div id="aiThinking" class="text-xs" style="color:#999; margin-bottom:10px">🤖 Legal Brain sedang menganalisis hukum...</div>`;

    setTimeout(() => {
        document.getElementById("aiThinking")?.remove();
        let aiResponse = "";
        const p = prompt.toLowerCase();

        if (includeDraft) {
            aiResponse = `<b>HASIL ANALISIS HUKUM:</b><br><br>Saya telah meninjau draf Anda. Secara umum strukturnya sudah baik, namun saya menyarankan:<br>1. Pertegas klausul batasan tanggung jawab.<br>2. Tambahkan definisi "Informasi Rahasia" yang lebih spesifik.<br>3. Pastikan yurisdiksi penyelesaian sengketa sudah sesuai dengan domisili IJEF CORP.`;
        } else if (p.includes("kerahasiaan") || p.includes("nda")) {
            aiResponse = `<b>PASAL KERAHASIAAN:</b><br>1. Para Pihak wajib menjaga kerahasiaan seluruh informasi yang bersifat komersial maupun teknis.<br>2. Pelanggaran atas pasal ini dapat dikenakan sanksi denda sebesar 100% dari nilai kerjasama.`;
        } else if (p.includes("ganti rugi") || p.includes("denda")) {
            aiResponse = `<b>PASAL GANTI RUGI & DENDA:</b><br>Dalam hal terjadi kelalaian, Pihak yang lalai wajib membayar ganti rugi nyata yang dialami oleh Pihak lainnya, serta denda sebesar 0,1% per hari keterlambatan.`;
        } else {
            aiResponse = `Saran saya untuk poin <b>"${escHtml(prompt)}"</b> adalah menggunakan pendekatan protektif bagi aset perusahaan. Pastikan ada batasan tanggung jawab yang jelas. Apakah ingin saya buatkan draf detailnya?`;
        }

        window._lastAIResponse = aiResponse;
        chatBox.innerHTML += `<div style="margin-bottom:15px"><div style="display:inline-block; background:#fff; border:1px solid #ddd; padding:12px; border-radius:2px 15px 15px 15px; color:#333; line-height:1.6; box-shadow: 0 4px 6px rgba(0,0,0,0.05)">${aiResponse}</div></div>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 1200);
}

function importDocumentToWorkspace(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        const editor = document.getElementById("drKonten");
        if (file.name.endsWith('.html')) {
            editor.innerHTML = content;
        } else {
            // Treat as plain text
            editor.innerText = content;
        }
        toast(`Berhasil mengimpor: ${file.name}`, "success");
    };
    reader.readAsText(file);
    input.value = ""; // clear for next time
}

function executeAIDraft() {
    if (!window._lastAIResponse) return toast("Belum ada saran dari AI", "warning");
    const editor = document.getElementById("drKonten");
    editor.innerHTML += "<br>" + window._lastAIResponse;
    toast("Klausul AI dimasukkan ke lembar kerja!", "success");
}


// ── KAJIAN HUKUM / TIKET LOGIC ───────────────────────────────

async function loadLegalTickets() {
    const tbody = document.getElementById("tblLegalTickets");
    try {
        const snap = await db.collection("hrd_legal_tickets").orderBy("createdAt", "desc").get();
        let html = "";

        if (snap.empty) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Belum ada tiket kajian hukum.</td></tr>';
            return;
        }

        snap.forEach((doc) => {
            const p = doc.data();
            if (!p.ticket_id || p.ticket_id.trim() === "") return;

            const workflow = p.approval_workflow || {};
            const statusL1 = workflow.layer1?.status || "pending";
            const statusL2 = workflow.layer2?.status || "pending";

            let statusBadge = "";
            if (statusL2 === "approved") {
                statusBadge = '<span class="badge badge-success">Final Approved</span>';
            } else if (statusL1 === "rejected" || statusL2 === "rejected") {
                statusBadge = '<span class="badge badge-danger">Rejected</span>';
            } else if (statusL1 === "approved") {
                statusBadge = '<span class="badge badge-info">Waiting Head Legal</span>';
            } else {
                statusBadge = '<span class="badge badge-warning">Waiting Manager Divisi</span>';
            }

            html += `
            <tr>
                <td class="fw-700">${escHtml(p.ticket_id)}</td>
                <td>${escHtml(p.judul)}</td>
                <td>${escHtml(p.departemen || "-")}</td>
                <td>${statusBadge}</td>
                <td>${formatDate(p.createdAt)}</td>
                <td>
                    <button class="btn btn-xs btn-info" onclick="viewLegalTicketDetail('${doc.id}')">👁️ Detail</button>
                </td>
            </tr>`;
        });

        tbody.innerHTML = html || '<tr><td colspan="6" class="text-center">Tidak ada data valid.</td></tr>';
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="color:red">Error: ${e.message}</td></tr>`;
    }
}

function modalKajianHukum() {
    openModal(`
        <div class="modal-title">🔨 Buat Tiket Kajian Hukum</div>
        <div class="form-group">
            <label>Judul Kajian / Permasalahan</label>
            <input class="form-control" id="lgJudul" placeholder="Contoh: Tinjauan Draft Vendor">
        </div>
        <div class="form-group">
            <label>Departemen Pemohon</label>
            <input class="form-control" id="lgDept" value="${escHtml(currentUser.departemen || '')}">
        </div>
        <div class="form-group">
            <label>Deskripsi & Pertanyaan Hukum</label>
            <textarea class="form-control" id="lgDesc" style="min-height:120px"></textarea>
        </div>
        <button class="btn btn-primary" onclick="simpanKajianHukum()">📤 Kirim Tiket</button>
    `, true);
}

async function simpanKajianHukum() {
    const judul = document.getElementById("lgJudul").value.trim();
    const dept = document.getElementById("lgDept").value.trim();
    const desc = document.getElementById("lgDesc").value.trim();

    if (!judul || !desc) return toast("Judul dan Deskripsi wajib diisi", "warning");

    const ticket_id = generateLegalTicketId();
    const data = {
        ticket_id, judul, departemen: dept, deskripsi: desc,
        pemohon: currentUser.nama, pemohonId: currentUser.id,
        status: "pending",
        approval_workflow: {
            layer1: { role: "Manager Divisi", status: "pending", approvedBy: "", updatedAt: "" },
            layer2: { role: "Head Legal", status: "pending", approvedBy: "", updatedAt: "" }
        },
        createdAt: new Date().toISOString()
    };

    try {
        await db.collection("hrd_legal_tickets").add(data);
        closeModalDirect();
        toast("Tiket dikirim", "success");
        renderKajianHukum();
    } catch (e) { toast("Gagal: " + e.message, "error"); }
}

function generateLegalTicketId() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    return `LGL-${dateStr}-${Math.floor(100 + Math.random() * 900)}`;
}

async function viewLegalTicketDetail(docId) {
    const doc = await db.collection("hrd_legal_tickets").doc(docId).get();
    const p = doc.data();
    const workflow = p.approval_workflow || {};
    const l1 = workflow.layer1 || {};
    const l2 = workflow.layer2 || {};

    const canApproveL1 = (currentUser.role === 'manager' || hasAccess(6)) && l1.status === 'pending';
    const canApproveL2 = (currentUser.role === 'head' || hasAccess(6)) && l1.status === 'approved' && l2.status === 'pending';

    openModal(`
        <div class="modal-title">📄 Detail Tiket: ${escHtml(p.ticket_id)}</div>
        <div class="form-group"><label>Deskripsi</label><div class="text-sm" style="background:#f5f5f5; padding:12px; border-radius:6px">${escHtml(p.deskripsi)}</div></div>
        <div class="fw-700 mb-8 mt-16">📋 Approval Status</div>
        <div style="background:#f8f9ff; padding:16px; border-radius:8px; border:1px solid #e0e0e0">
            <div class="flex" style="justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding-bottom:8px">
                <div><b>L1: Manager Divisi</b></div>
                <div class="flex gap-4">
                    <span class="badge badge-${l1.status==='approved'?'success':'warning'}">${l1.status.toUpperCase()}</span>
                    ${canApproveL1 ? `<button class="btn btn-xs btn-success" onclick="updateLegalTicketStatus('${docId}', 1, 'approved')">Approve</button>` : ''}
                </div>
            </div>
            <div class="flex" style="justify-content:space-between; align-items:center; padding-top:8px">
                <div><b>L2: Head Legal</b></div>
                <div class="flex gap-4">
                    <span class="badge badge-${l2.status==='approved'?'success':'warning'}">${l2.status.toUpperCase()}</span>
                    ${canApproveL2 ? `<button class="btn btn-xs btn-success" onclick="updateLegalTicketStatus('${docId}', 2, 'approved')">Approve</button>` : ''}
                </div>
            </div>
        </div>
    `, true);
}

async function updateLegalTicketStatus(docId, layerNum, action) {
    const fieldPrefix = `approval_workflow.layer${layerNum}`;
    const updateData = {
        [`${fieldPrefix}.status`]: action,
        [`${fieldPrefix}.approvedBy`]: currentUser.nama,
        updatedAt: new Date().toISOString()
    };
    await db.collection("hrd_legal_tickets").doc(docId).update(updateData);
    toast("Status updated", "success");
    closeModalDirect();
    loadLegalTickets();
}

// ── PERIZINAN ───────────────────────────────────────────────

async function renderLegalPerizinan() {
    const main = document.getElementById("mainContent");
    main.innerHTML = `
    <div class="page-title"><span>⚖️ Legalitas & Perizinan</span><button class="btn btn-primary btn-sm" onclick="modalPerizinan()">+ Tambah</button></div>
    <div class="card"><div class="table-wrap"><table><thead><tr><th>Nama Dokumen</th><th>No. Registrasi</th><th>Instansi</th><th>Tgl Akhir</th><th>Status</th><th>File</th><th>Aksi</th></tr></thead><tbody id="tblLegalPerizinan"></tbody></table></div></div>`;
    loadLegalPerizinan();
}

async function loadLegalPerizinan() {
    const tbody = document.getElementById("tblLegalPerizinan");
    const snap = await db.collection("hrd_legal_perizinan").get();
    let html = "";
    if (snap.empty) { tbody.innerHTML = '<tr><td colspan="7" class="text-center">Kosong</td></tr>'; return; }
    const today = todayStr();
    snap.forEach(doc => {
        const p = doc.data();
        const isExp = p.tglBerakhir && p.tglBerakhir < today;
        html += `<tr><td>${escHtml(p.nama)}</td><td class="color-primary fw-700">${escHtml(p.nomor || "-")}</td><td>${escHtml(p.instansi || "-")}</td><td>${p.tglBerakhir ? formatDate(p.tglBerakhir) : "∞"}</td><td><span class="badge badge-${isExp?'danger':'success'}">${isExp?'Exp':'Aktif'}</span></td><td>${p.fileURL ? `<button class="btn btn-xs btn-success" onclick="window.open('${p.fileURL}')">👁️</button>` : '-'}</td><td><button class="btn btn-xs btn-info" onclick="modalPerizinan('${doc.id}')">✏️</button></td></tr>`;
    });
    tbody.innerHTML = html;
}

function modalPerizinan(id) {
    if (id) db.collection("hrd_legal_perizinan").doc(id).get().then(d => showPerizinanForm(id, d.data()));
    else showPerizinanForm(null, {});
}

function showPerizinanForm(id, p) {
    openModal(`
        <div class="modal-title">Dokumen Perizinan</div>
        <div class="form-group"><label>Nama</label><input class="form-control" id="pzNama" value="${escHtml(p.nama || '')}"></div>
        <div class="form-group"><label>Nomor</label><input class="form-control" id="pzNomor" value="${escHtml(p.nomor || '')}"></div>
        <div class="form-group"><label>Instansi</label><input class="form-control" id="pzInstansi" value="${escHtml(p.instansi || '')}"></div>
        <div class="form-group"><label>Tgl Akhir</label><input class="form-control" type="date" id="pzTgl" value="${p.tglBerakhir || ''}"></div>
        <div class="form-group"><label>Upload</label><input class="form-control" type="file" id="pzFile" accept=".pdf,image/*" onchange="window._pzFile=this.files[0]"></div>
        <button class="btn btn-primary" onclick="simpanPerizinan('${id || ''}')">💾 Simpan</button>
    `);
    window._pzFile = null;
}

async function simpanPerizinan(id) {
    const data = {
        nama: document.getElementById('pzNama').value, nomor: document.getElementById('pzNomor').value,
        instansi: document.getElementById('pzInstansi').value, tglBerakhir: document.getElementById('pzTgl').value,
        updatedAt: new Date().toISOString()
    };
    if (window._pzFile) {
        const path = `legal_perizinan/${Date.now()}_${window._pzFile.name}`;
        data.fileURL = await uploadFileToStorage(window._pzFile, path);
    }
    if (id) await db.collection("hrd_legal_perizinan").doc(id).update(data);
    else await db.collection("hrd_legal_perizinan").add({ ...data, createdAt: new Date().toISOString() });
    closeModalDirect(); renderLegalPerizinan();
}

// ── SENGKETA ───────────────────────────────────────────────

async function renderLegalSengketa() {
    const main = document.getElementById("mainContent");
    main.innerHTML = `
    <div class="page-title"><span>⚠️ Sengketa & Kasus</span><button class="btn btn-primary btn-sm" onclick="modalSengketa()">+ Tambah</button></div>
    <div class="card"><div class="table-wrap"><table><thead><tr><th>Judul</th><th>Pihak</th><th>Status</th><th>File</th><th>Aksi</th></tr></thead><tbody id="tblLegalSengketa"></tbody></table></div></div>`;
    loadLegalSengketa();
}

async function loadLegalSengketa() {
    const tbody = document.getElementById("tblLegalSengketa");
    const snap = await db.collection("hrd_legal_sengketa").get();
    let html = "";
    if (snap.empty) { tbody.innerHTML = '<tr><td colspan="5" class="text-center">Kosong</td></tr>'; return; }
    snap.forEach(doc => {
        const p = doc.data();
        html += `<tr><td>${escHtml(p.judul)}</td><td>${escHtml(p.pihak)}</td><td>${escHtml(p.status)}</td><td>${p.fileURL ? `<button class="btn btn-xs btn-success" onclick="window.open('${p.fileURL}')">👁️</button>` : '-'}</td><td><button class="btn btn-xs btn-info" onclick="modalSengketa('${doc.id}')">✏️</button></td></tr>`;
    });
    tbody.innerHTML = html;
}

function modalSengketa(id) {
    if (id) db.collection("hrd_legal_sengketa").doc(id).get().then(d => showSengketaForm(id, d.data()));
    else showSengketaForm(null, {});
}

function showSengketaForm(id, p) {
    openModal(`
        <div class="modal-title">Catatan Kasus</div>
        <div class="form-group"><label>Judul</label><input class="form-control" id="skJudul" value="${escHtml(p.judul || '')}"></div>
        <div class="form-group"><label>Pihak</label><input class="form-control" id="skPihak" value="${escHtml(p.pihak || '')}"></div>
        <div class="form-group"><label>Status</label><select class="form-control" id="skStatus"><option value="Mediasi" ${p.status==='Mediasi'?'selected':''}>Mediasi</option><option value="Selesai" ${p.status==='Selesai'?'selected':''}>Selesai</option></select></div>
        <div class="form-group"><label>Upload</label><input class="form-control" type="file" id="skFile" onchange="window._skFile=this.files[0]"></div>
        <button class="btn btn-primary" onclick="simpanSengketa('${id || ''}')">💾 Simpan</button>
    `);
    window._skFile = null;
}

async function simpanSengketa(id) {
    const data = {
        judul: document.getElementById('skJudul').value, pihak: document.getElementById('skPihak').value,
        status: document.getElementById('skStatus').value, updatedAt: new Date().toISOString()
    };
    if (window._skFile) {
        const path = `legal_sengketa/${Date.now()}_${window._skFile.name}`;
        data.fileURL = await uploadFileToStorage(window._skFile, path);
    }
    if (id) await db.collection("hrd_legal_sengketa").doc(id).update(data);
    else await db.collection("hrd_legal_sengketa").add({ ...data, createdAt: new Date().toISOString() });
    closeModalDirect(); renderLegalSengketa();
}

function switchRibbonTab(tabId) {
    // Update tab status
    document.querySelectorAll('.ribbon-tab').forEach(t => {
        t.classList.toggle('active', t.textContent.toLowerCase() === tabId);
    });

    // Update panel visibility
    document.querySelectorAll('.ribbon-panel').forEach(p => {
        p.classList.toggle('active', p.id === 'ribbon-' + tabId);
    });
}
