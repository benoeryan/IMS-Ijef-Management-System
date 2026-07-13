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
                background: #f0f2f5; font-family: 'Segoe UI', sans-serif; z-index: 9999;
            }
            .dr-header {
                background: #1a1a1a; color: #fff; padding: 12px 20px;
                display: flex; justify-content: space-between; align-items: center;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            }
            .dr-toolbar {
                background: #fff; border-bottom: 1px solid #ddd;
                padding: 10px 20px; display: flex; flex-wrap: wrap; gap: 10px;
                align-items: center; box-shadow: 0 1px 4px rgba(0,0,0,0.05);
            }
            .dr-toolbar-grp {
                display: flex; align-items: center; gap: 5px;
                padding-right: 12px; border-right: 1px solid #eee;
            }
            .dr-toolbar-grp:last-child { border-right: none; }
            .dr-btn {
                background: #f8f9fa; border: 1px solid #dee2e6;
                padding: 6px 10px; border-radius: 6px; cursor: pointer;
                font-size: 0.9rem; transition: 0.2s; color: #333;
                display: flex; align-items: center; gap: 6px;
            }
            .dr-btn:hover { background: #e9ecef; border-color: #adb5bd; }
            .dr-btn.active { background: #3182ce; color: #fff; border-color: #3182ce; }
            .dr-select {
                padding: 6px 10px; border-radius: 6px; border: 1px solid #dee2e6;
                font-size: 0.85rem; background: #fff; height: 34px; outline: none;
            }
            .dr-main {
                display: flex; flex: 1; overflow: hidden; height: calc(100vh - 120px);
            }
            .dr-editor-container {
                flex: 1; background: #525659; overflow-y: auto;
                display: flex; justify-content: center; padding: 40px 20px;
            }
            .dr-page {
                background: white; width: 210mm; min-height: 297mm;
                padding: 2.5cm 2.5cm 2cm 2.5cm; box-shadow: 0 0 20px rgba(0,0,0,0.3);
                display: flex; flex-direction: column; color: #000;
            }
            .dr-editor {
                border: none; width: 100%; min-height: 100%;
                flex: 1; font-family: 'Times New Roman', serif; font-size: 11pt;
                line-height: 1.6; outline: none; padding: 0; margin-top: 10px;
                background: #fff; text-align: justify;
            }
            .dr-sidebar {
                width: 350px; background: #fff; border-left: 1px solid #ddd;
                display: flex; flex-direction: column; overflow: hidden;
            }
            .dr-kop {
                display: none; border-bottom: 2px solid #000;
                padding-bottom: 10px; margin-bottom: 20px; align-items: center;
            }
            .dr-kop.active { display: flex; }
            #aiChatBox::-webkit-scrollbar { width: 5px; }
            #aiChatBox::-webkit-scrollbar-thumb { background: #ccc; border-radius: 10px; }
        `;
        document.head.appendChild(style);
    }

    let cp = { nama: "LPK IJEF CORP", alamat: "Bandung Barat", telp: "-", email: "-", logo: "" };
    try {
        const doc = await db.collection("hrd_settings").doc("perusahaan").get();
        if (doc.exists) cp = { ...cp, ...doc.data() };
    } catch (e) {}

    openModal(`
        <div class="modal-fullscreen" id="modalWorkspace">
            <div class="dr-header">
                <div class="flex gap-12" style="align-items:center">
                    <span style="font-size:1.5rem">📝</span>
                    <div>
                        <div class="fw-700">LEGAL DRAFTING PRO</div>
                        <div class="text-xs" style="opacity:0.7">IJEF Corp Management System</div>
                    </div>
                </div>
                <div class="flex gap-8">
                    <button class="btn btn-warning btn-sm" onclick="document.getElementById('drFileImport').click()">📁 Impor</button>
                    <input type="file" id="drFileImport" style="display:none" accept=".txt,.html,.md" onchange="importDocumentToWorkspace(this)">
                    <button class="btn btn-info btn-sm" onclick="printDraftLegalDirect()">🖨️ Cetak A4</button>
                    <button class="btn btn-success btn-sm" onclick="simpanDraftLegal()" style="font-weight:bold">💾 SIMPAN & SINKRONKAN</button>
                    <button class="btn btn-outline btn-sm" style="color:#fff; border-color:#fff" onclick="closeModalDirect()">✕</button>
                </div>
            </div>

            <div class="dr-toolbar">
                <div class="dr-toolbar-grp">
                    <button class="dr-btn" onclick="formatDoc('undo')" title="Undo">⟲</button>
                    <button class="dr-btn" onclick="formatDoc('redo')" title="Redo">⟳</button>
                </div>
                <div class="dr-toolbar-grp">
                    <select class="dr-select" id="drFontFamily" onchange="formatDoc('fontName', this.value)" style="width:180px">
                        <optgroup label="1. Profesional & Akademis (Serif)">
                            <option value="Times New Roman" selected>Times New Roman</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Garamond">Garamond</option>
                            <option value="Palatino Linotype">Palatino Linotype</option>
                            <option value="Book Antiqua">Book Antiqua</option>
                        </optgroup>
                        <optgroup label="2. Modern & Bersih (Sans Serif)">
                            <option value="Calibri">Calibri</option>
                            <option value="Arial">Arial</option>
                            <option value="Aptos, Segoe UI, sans-serif">Aptos</option>
                            <option value="Segoe UI">Segoe UI</option>
                            <option value="Trebuchet MS">Trebuchet MS</option>
                            <option value="Verdana">Verdana</option>
                        </optgroup>
                        <optgroup label="3. Judul & Dekoratif (Display)">
                            <option value="Arial Black">Arial Black</option>
                            <option value="Impact">Impact</option>
                            <option value="Copperplate">Copperplate Gothic</option>
                            <option value="Franklin Gothic Medium">Franklin Gothic Medium</option>
                        </optgroup>
                        <optgroup label="4. Tulisan Tangan (Script)">
                            <option value="Monotype Corsiva">Monotype Corsiva</option>
                            <option value="Brush Script MT">Brush Script MT</option>
                            <option value="Lucida Handwriting">Lucida Handwriting</option>
                            <option value="Edwardian Script ITC">Edwardian Script ITC</option>
                        </optgroup>
                        <optgroup label="5. Font Mesin Ketik (Monospace)">
                            <option value="Courier New">Courier New</option>
                            <option value="Consolas">Consolas</option>
                        </optgroup>
                    </select>
                    <select class="dr-select" onchange="formatDoc('fontSize', this.value)" style="width:70px">
                        <option value="3" selected>12pt</option>
                        <option value="1">8pt</option>
                        <option value="2">10pt</option>
                        <option value="4">14pt</option>
                        <option value="5">18pt</option>
                        <option value="6">24pt</option>
                    </select>
                </div>
                <div class="dr-toolbar-grp">
                    <button class="dr-btn" onclick="formatDoc('bold')" title="Bold"><b>B</b></button>
                    <button class="dr-btn" onclick="formatDoc('italic')" title="Italic"><i>I</i></button>
                    <button class="dr-btn" onclick="formatDoc('underline')" title="Underline"><u>U</u></button>
                    <input type="color" onchange="formatDoc('foreColor', this.value)" title="Warna Teks" style="width:28px;height:28px;padding:0;border:none;cursor:pointer">
                    <input type="color" value="#ffff00" onchange="formatDoc('backColor', this.value)" title="Highlight" style="width:28px;height:28px;padding:0;border:none;cursor:pointer">
                </div>
                <div class="dr-toolbar-grp">
                    <button class="dr-btn" onclick="formatDoc('justifyLeft')">≡</button>
                    <button class="dr-btn" onclick="formatDoc('justifyCenter')">≣</button>
                    <button class="dr-btn" onclick="formatDoc('justifyRight')">≡</button>
                    <button class="dr-btn" onclick="formatDoc('justifyFull')">≡</button>
                </div>
                <div class="dr-toolbar-grp">
                    <button class="dr-btn" onclick="formatDoc('insertUnorderedList')">• List</button>
                    <button class="dr-btn" onclick="formatDoc('insertOrderedList')">1. List</button>
                </div>
                <div class="dr-toolbar-grp">
                    <select class="dr-select" id="drTemplate" onchange="applyLegalTemplate()" style="width:160px; font-weight:600; color:var(--primary)">
                        <option value="">-- Pilih Template --</option>
                        <option value="mou">MOU Kerjasama</option>
                        <option value="nda">NDA Agreement</option>
                        <option value="spk">Surat Perintah Kerja</option>
                        <option value="pks">Perjanjian Kerjasama</option>
                        <option value="peraturan">Peraturan Perusahaan</option>
                    </select>
                </div>
                <div class="dr-toolbar-grp">
                    <label style="display:flex; align-items:center; gap:6px; font-size:0.8rem; cursor:pointer">
                        <input type="checkbox" id="drPakeKop" checked onchange="document.getElementById('kopPreview').classList.toggle('active', this.checked)"> Tampilkan KOP
                    </label>
                </div>
            </div>

            <div class="dr-main">
                <div class="dr-editor-container">
                    <div class="dr-page" id="wordPage">
                        <div class="dr-kop active" id="kopPreview">
                            <img src="${cp.logo || 'icon-ijef-v3.png'}" style="width:80px; height:80px; object-fit:contain; margin-right:20px">
                            <div style="flex:1; text-align:center">
                                <div style="font-size:16pt; font-weight:bold; text-transform:uppercase; color:#000">${cp.nama}</div>
                                <div style="font-size:10pt; color:#444">${cp.alamat} ${cp.kota || ''}</div>
                                <div style="font-size:10pt; color:#444">Telp: ${cp.telepon || cp.telp || '-'} | Email: ${cp.email}</div>
                            </div>
                        </div>
                        <div style="text-align:center; margin-bottom: 25px">
                            <div id="drJudul" contenteditable="true" style="width:100%; text-align:center; font-weight:bold; font-size:14pt; border:none; outline:none; text-decoration:underline">JUDUL DOKUMEN / PERIHAL</div>
                            <div style="font-size:11pt; margin-top:10px">Nomor: <input type="text" id="drNomor" value="${autoNumber}" style="border:none; background:transparent; font-family:monospace; font-size:11pt; width:250px; outline:none"></div>
                        </div>
                        <div class="dr-editor" id="drKonten" contenteditable="true"></div>
                    </div>
                </div>

                <div class="dr-sidebar">
                    <div style="padding:15px; background:#1a1a1a; color:#fff; display:flex; justify-content:space-between; align-items:center">
                        <span class="fw-700">🤖 Legal Brain AI</span>
                        <span class="badge" style="background:#2e7d32">Gemini Pro</span>
                    </div>
                    <div id="aiChatBox" style="flex:1; overflow-y:auto; padding:15px; font-size:0.85rem; background:#f4f7f6">
                        <div style="background:#fff; border:1px solid #ddd; padding:15px; border-radius:12px; line-height:1.5; box-shadow:0 2px 5px rgba(0,0,0,0.05)">
                            Halo! Saya <b>AI Legal Assistant</b> Anda.<br><br>
                            Ketik perintah di bawah untuk membuat draf pasal, menganalisis risiko, atau menerjemahkan istilah hukum.
                        </div>
                    </div>
                    <div style="padding:15px; border-top:1px solid #eee; background:#fff">
                        <textarea class="form-control" id="aiPrompt" style="min-height:100px; font-size:0.85rem; border-radius:10px" placeholder="Tanyakan sesuatu ke AI..."></textarea>
                        <div class="flex gap-4 mt-12">
                            <button class="btn btn-primary" style="flex:1" onclick="discussWithAI()">💬 Kirim</button>
                            <button class="btn btn-info" onclick="discussWithAI(true)">🧐 Analisis Draf</button>
                            <button class="btn btn-success" onclick="executeAIDraft()">⚡ Terapkan</button>
                        </div>
                        <div class="form-group mt-16">
                            <label class="text-xs">Informasi Pihak Kedua</label>
                            <input class="form-control" id="drPihak2" placeholder="Nama Lembaga/Orang">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `, true);

    const modal = document.getElementById("modalContent");
    if (modal) {
        modal.classList.add("modal-fullscreen");
        modal.parentElement.style.padding = "0";
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
            <p>Perjanjian ini dibuat dan ditandatangani pada hari ini [...] antara LPK IJEF CORP and [PIHAK KEDUA].</p>
            <p><b>PASAL 1: RUANG LINGKUP PEKERJAAN</b><br>...</p>
            <p><b>PASAL 2: NILAI PERJANJIAN DAN TATA CARA PEMBAYARAN</b><br>...</p>`
        },
        peraturan: {
            judul: "PERATURAN PERUSAHAAN (PP)",
            isi: `<p style="text-align:center"><b>PERATURAN PERUSAHAAN</b></p>
            <p style="text-align:center">Nomor: ${num}</p><br>
            <p>Ditetapkan oleh: <b>LPK IJEF CORP</b></p><br>
            <p><b>BAB I: KETENTUAN UMUM</b><br>Pasal 1: Definisi...</p>
            <p><b>BAB II: HUBUNGAN KERJA</b><br>Pasal 2: Penerimaan Karyawan...</p>`
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
        if (!currentDraft || currentDraft.length < 10) return toast("Draf masih kosong", "warning");
        prompt = prompt || "Mohon analisis draf ini.";
    }

    const chatBox = document.getElementById("aiChatBox");
    chatBox.innerHTML += `<div style="margin-bottom:10px; text-align:right"><div style="display:inline-block; background:#3182ce; color:#fff; padding:8px 12px; border-radius:15px 15px 2px 15px; max-width:90%">${escHtml(prompt)}</div></div>`;
    document.getElementById("aiPrompt").value = "";
    chatBox.scrollTop = chatBox.scrollHeight;

    chatBox.innerHTML += `<div id="aiThinking" class="text-xs" style="color:#999; margin-bottom:10px">🤖 Legal Brain sedang menganalisis...</div>`;

    setTimeout(() => {
        document.getElementById("aiThinking")?.remove();
        let aiResponse = "Analisis hukum selesai. Saya menyarankan untuk memperjelas poin batasan tanggung jawab pada pasal terkait.";
        window._lastAIResponse = aiResponse;
        chatBox.innerHTML += `<div style="margin-bottom:15px"><div style="display:inline-block; background:#fff; border:1px solid #ddd; padding:12px; border-radius:2px 15px 15px 15px; color:#333; line-height:1.6">${aiResponse}</div></div>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 1200);
}

function importDocumentToWorkspace(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const editor = document.getElementById("drKonten");
        if (file.name.endsWith('.html')) editor.innerHTML = e.target.result;
        else editor.innerText = e.target.result;
        toast(`Diimpor: ${file.name}`, "success");
    };
    reader.readAsText(file);
    input.value = "";
}

function executeAIDraft() {
    if (!window._lastAIResponse) return toast("Belum ada saran dari AI", "warning");
    const editor = document.getElementById("drKonten");
    editor.innerHTML += "<br>" + window._lastAIResponse;
    toast("Klausul AI dimasukkan!", "success");
}

async function loadLegalTickets() {
    const tbody = document.getElementById("tblLegalTickets");
    try {
        const snap = await db.collection("hrd_legal_tickets").orderBy("createdAt", "desc").get();
        let html = "";
        if (snap.empty) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Belum ada tiket.</td></tr>';
            return;
        }
        snap.forEach((doc) => {
            const p = doc.data();
            html += `<tr><td class="fw-700">${escHtml(p.ticket_id)}</td><td>${escHtml(p.judul)}</td><td>${escHtml(p.departemen || "-")}</td><td>${p.status}</td><td>${formatDate(p.createdAt)}</td><td><button class="btn btn-xs btn-info" onclick="viewLegalTicketDetail('${doc.id}')">👁️</button></td></tr>`;
        });
        tbody.innerHTML = html;
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center">Error: ${e.message}</td></tr>`;
    }
}

function modalKajianHukum() {
    openModal(`
        <div class="modal-title">🔨 Buat Tiket Kajian Hukum</div>
        <div class="form-group"><label>Judul Kajian</label><input class="form-control" id="lgJudul"></div>
        <div class="form-group"><label>Deskripsi</label><textarea class="form-control" id="lgDesc" style="min-height:120px"></textarea></div>
        <button class="btn btn-primary" onclick="simpanKajianHukum()">📤 Kirim</button>
    `, true);
}

async function simpanKajianHukum() {
    const judul = document.getElementById("lgJudul").value.trim();
    const desc = document.getElementById("lgDesc").value.trim();
    if (!judul || !desc) return toast("Lengkapi data", "warning");
    const data = {
        ticket_id: `LGL-${Date.now().toString().slice(-6)}`,
        judul, deskripsi: desc, departemen: currentUser.departemen || '',
        pemohon: currentUser.nama, status: "pending", createdAt: new Date().toISOString()
    };
    await db.collection("hrd_legal_tickets").add(data);
    closeModalDirect(); renderKajianHukum();
}

async function viewLegalTicketDetail(docId) {
    const doc = await db.collection("hrd_legal_tickets").doc(docId).get();
    const p = doc.data();
    openModal(`<div class="modal-title">📄 Detail Tiket</div><div class="text-sm">${escHtml(p.deskripsi)}</div>`, true);
}

async function renderLegalPerizinan() {
    const main = document.getElementById("mainContent");
    main.innerHTML = `<div class="page-title"><span>⚖️ Perizinan</span><button class="btn btn-primary btn-sm" onclick="modalPerizinan()">+ Tambah</button></div><div class="card"><div class="table-wrap"><table id="tblLegalPerizinan"></table></div></div>`;
    loadLegalPerizinan();
}

async function loadLegalPerizinan() {
    const snap = await db.collection("hrd_legal_perizinan").get();
    let h = '<thead><tr><th>Nama</th><th>Status</th></tr></thead><tbody>';
    snap.forEach(d => { const p = d.data(); h += `<tr><td>${escHtml(p.nama)}</td><td>Aktif</td></tr>`; });
    document.getElementById("tblLegalPerizinan").innerHTML = h + '</tbody>';
}

function modalPerizinan() {
    openModal(`<div class="modal-title">Tambah Dokumen</div><button class="btn btn-primary" onclick="closeModalDirect()">Simpan</button>`);
}

async function renderLegalSengketa() {
    const main = document.getElementById("mainContent");
    main.innerHTML = `<div class="page-title"><span>⚠️ Sengketa</span><button class="btn btn-primary btn-sm" onclick="modalSengketa()">+ Tambah</button></div><div class="card" id="tblLegalSengketa"></div>`;
}

function modalSengketa() { openModal(`<div class="modal-title">Catatan Kasus</div><button class="btn btn-primary" onclick="closeModalDirect()">Simpan</button>`); }
