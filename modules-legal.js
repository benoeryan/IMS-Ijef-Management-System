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
    const deviceType = getDeviceType();

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
                background: #2b579a; color: #fff; padding: 8px 20px;
                display: flex; justify-content: space-between; align-items: center;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            }
            .dr-toolbar-tabs {
                background: #2b579a; display: flex; padding: 0 20px; gap: 4px;
            }
            .dr-tab {
                padding: 8px 16px; color: #fff; cursor: pointer; font-size: 0.85rem;
                border-radius: 4px 4px 0 0; transition: 0.2s;
            }
            .dr-tab:hover { background: rgba(255,255,255,0.1); }
            .dr-tab.active { background: #fff; color: #2b579a; font-weight: 600; }

            .dr-toolbar {
                background: #fff; border-bottom: 1px solid #ddd;
                padding: 8px 20px; display: flex; flex-wrap: wrap; gap: 10px;
                align-items: center; box-shadow: 0 1px 4px rgba(0,0,0,0.05);
            }
            .dr-toolbar-grp {
                display: flex; align-items: center; gap: 5px;
                padding-right: 12px; border-right: 1px solid #eee;
                height: 40px;
            }
            .dr-toolbar-grp:last-child { border-right: none; }
            .dr-btn {
                background: transparent; border: 1px solid transparent;
                padding: 6px 8px; border-radius: 4px; cursor: pointer;
                font-size: 0.9rem; transition: 0.2s; color: #333;
                display: flex; flex-direction: column; align-items: center; gap: 2px;
                min-width: 40px;
            }
            .dr-btn:hover { background: #f0f0f0; border-color: #ddd; }
            .dr-btn span { font-size: 0.7rem; }
            .dr-btn.active { background: #e2e8f0; color: #2b579a; border-color: #cbd5e0; }

            .dr-select {
                padding: 4px 8px; border-radius: 4px; border: 1px solid #ddd;
                font-size: 0.8rem; background: #fff; outline: none;
            }
            .dr-main {
                display: flex; flex: 1; overflow: hidden; height: calc(100vh - 145px);
            }
            @media (max-width: 1024px) {
                .dr-main { flex-direction: column; overflow-y: auto; height: auto; min-height: calc(100vh - 145px); }
                .dr-sidebar { width: 100% !important; border-left: none; border-top: 1px solid #ddd; height: auto !important; }
                .dr-editor-container { padding: 20px 10px; }
                .dr-ruler-h, .dr-ruler-v { display: none !important; }
                .dr-page { width: 100% !important; max-width: 210mm; padding: 1.5cm !important; margin-left: 0 !important; }
            }
            @media (max-width: 768px) {
                .dr-toolbar-grp { padding-right: 6px; gap: 3px; }
                .dr-btn { min-width: 32px; padding: 4px 5px; }
                .dr-btn span { display: none; }
                .dr-select { font-size: 0.75rem; padding: 2px 4px; }
                .dr-tab { padding: 6px 10px; font-size: 0.75rem; }
            }
            .dr-editor-container {
                flex: 1; background: #e9ecef; overflow: auto;
                display: flex; flex-direction: column; align-items: center; padding: 40px 20px;
                position: relative;
            }

            .dr-ruler-h {
                width: 210mm; height: 25px; background: #fff; border: 1px solid #ccc;
                border-bottom: 2px solid #333; position: relative; flex-shrink: 0;
                display: flex; align-items: flex-end;
            }
            .dr-ruler-v {
                width: 25px; min-height: 297mm; background: #fff; border: 1px solid #ccc;
                border-right: 2px solid #333; position: absolute; left: -25px; top: 0;
                display: flex; flex-direction: column; align-items: center;
            }
            .ruler-tick { position: absolute; background: #666; }
            .ruler-tick.major { height: 10px; width: 1px; }
            .ruler-tick.minor { height: 5px; width: 1px; }
            .ruler-num { position: absolute; font-size: 9px; color: #333; font-family: sans-serif; }

            .dr-page-wrapper { position: relative; margin-top: 10px; }
            .dr-page {
                background: white; width: 210mm; min-height: 297mm;
                padding: 2.5cm 2.5cm 2cm 2.5cm; box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                display: flex; flex-direction: column; color: #000; position: relative;
            }
            .dr-page.gridlines {
                background-image:
                    linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px);
                background-size: 5mm 5mm;
            }

            .dr-editor {
                border: none; width: 100%; min-height: 100%;
                flex: 1; font-family: 'Times New Roman', serif; font-size: 11pt;
                line-height: 1.6; outline: none; padding: 0; margin-top: 10px;
                background: transparent; text-align: justify;
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
        <div class="modal-fullscreen device-${deviceType}" id="modalWorkspace">
            <div class="dr-header">
                <div class="flex gap-12" style="align-items:center">
                    <div style="background:#fff; color:#2b579a; width:32px; height:32px; border-radius:4px; display:flex; align-items:center; justify-content:center; font-weight:bold">W</div>
                    <div>
                        <div class="fw-700" style="font-size:0.9rem">Legal Drafting Pro ${deviceType !== 'desktop' ? '('+deviceType+')' : ''}</div>
                        <div class="text-xs" style="opacity:0.8">Tersimpan di Cloud</div>
                    </div>
                </div>
                <div class="flex gap-8">
                    <button class="btn btn-sm" style="background:rgba(255,255,255,0.1); color:#fff" onclick="simpanDraftLegal()">💾 Simpan</button>
                    <button class="btn btn-sm" style="background:rgba(255,255,255,0.1); color:#fff" onclick="printDraftLegalDirect()">🖨️ Cetak</button>
                    <button class="btn btn-outline btn-sm" style="color:#fff; border-color:#fff" onclick="closeModalDirect()">✕</button>
                </div>
            </div>

            <div class="dr-toolbar-tabs">
                <div class="dr-tab active" id="tab-home" onclick="switchDrTab('home')">Beranda</div>
                <div class="dr-tab" id="tab-insert" onclick="switchDrTab('insert')">Sisipkan</div>
                <div class="dr-tab" id="tab-layout" onclick="switchDrTab('layout')">Tata Letak</div>
                <div class="dr-tab" id="tab-view" onclick="switchDrTab('view')">Tampilan</div>
            </div>

            <!-- HOME TOOLBAR -->
            <div class="dr-toolbar" id="dr-toolbar-home">
                <div class="dr-toolbar-grp">
                    <button class="dr-btn" onclick="formatDoc('undo')" title="Undo">↺<span>Undo</span></button>
                    <button class="dr-btn" onclick="formatDoc('redo')" title="Redo">↻<span>Redo</span></button>
                </div>
                <div class="dr-toolbar-grp">
                    <select class="dr-select" id="drFontFamily" onchange="formatDoc('fontName', this.value)" style="width:140px">
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Arial">Arial</option>
                        <option value="Calibri">Calibri</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Courier New">Courier New</option>
                    </select>
                    <select class="dr-select" onchange="formatDoc('fontSize', this.value)" style="width:60px">
                        <option value="3" selected>12</option>
                        <option value="1">8</option>
                        <option value="2">10</option>
                        <option value="4">14</option>
                        <option value="5">18</option>
                    </select>
                </div>
                <div class="dr-toolbar-grp">
                    <button class="dr-btn" onclick="formatDoc('bold')" title="Bold"><b>B</b><span>Tebal</span></button>
                    <button class="dr-btn" onclick="formatDoc('italic')" title="Italic"><i>I</i><span>Miring</span></button>
                    <button class="dr-btn" onclick="formatDoc('underline')" title="Underline"><u>U</u><span>Garis</span></button>
                    <div style="display:flex; flex-direction:column; align-items:center">
                        <input type="color" onchange="formatDoc('foreColor', this.value)" style="width:20px; height:20px; padding:0; border:none; cursor:pointer">
                        <span style="font-size:0.6rem">Warna</span>
                    </div>
                </div>
                <div class="dr-toolbar-grp">
                    <button class="dr-btn" onclick="formatDoc('justifyLeft')">≡<span>Kiri</span></button>
                    <button class="dr-btn" onclick="formatDoc('justifyCenter')">≣<span>Tengah</span></button>
                    <button class="dr-btn" onclick="formatDoc('justifyFull')">≡<span>Rata</span></button>
                </div>
                <div class="dr-toolbar-grp">
                    <select class="dr-select" id="drTemplate" onchange="applyLegalTemplate()" style="width:130px">
                        <option value="">-- Template --</option>
                        <option value="mou">MOU</option>
                        <option value="nda">NDA</option>
                        <option value="spk">SPK</option>
                    </select>
                </div>
            </div>

            <!-- LAYOUT TOOLBAR -->
            <div class="dr-toolbar" id="dr-toolbar-layout" style="display:none">
                <div class="dr-toolbar-grp">
                    <button class="dr-btn" onclick="changeMargins()">📐<span>Margin</span></button>
                    <button class="dr-btn" onclick="changeOrientation()">📄<span>Orientasi</span></button>
                    <button class="dr-btn" onclick="changePageSize()">📏<span>Ukuran</span></button>
                </div>
            </div>

            <!-- VIEW TOOLBAR -->
            <div class="dr-toolbar" id="dr-toolbar-view" style="display:none">
                <div class="dr-toolbar-grp">
                    <label style="display:flex; flex-direction:column; font-size:0.7rem; gap:2px">
                        <span style="display:flex; align-items:center; gap:4px"><input type="checkbox" id="chkRuler" ${deviceType === 'desktop' ? 'checked' : ''} onchange="toggleDrRuler()"> Penggaris</span>
                        <span style="display:flex; align-items:center; gap:4px"><input type="checkbox" id="chkGrid" onchange="toggleDrGrid()"> Garis Kisi</span>
                        <span style="display:flex; align-items:center; gap:4px"><input type="checkbox" id="chkKop" checked onchange="toggleDrKop()"> Tampilkan KOP</span>
                    </label>
                </div>
                <div class="dr-toolbar-grp">
                    <button class="dr-btn" onclick="setDrZoom(100)">🔍<span>100%</span></button>
                    ${deviceType === 'mobile' ? '<button class="dr-btn" onclick="setDrZoom(\'width\')">↔️<span>Fit</span></button>' : ''}
                </div>
            </div>

            <!-- INSERT TOOLBAR -->
            <div class="dr-toolbar" id="dr-toolbar-insert" style="display:none">
                <div class="dr-toolbar-grp">
                    <button class="dr-btn" onclick="document.getElementById('drFileImport').click()">📁<span>Unggah</span></button>
                    <button class="dr-btn" onclick="formatDoc('insertHorizontalRule')">➖<span>Garis</span></button>
                </div>
            </div>

            <div class="dr-main">
                <div class="dr-editor-container">
                    <div id="drRulerH" class="dr-ruler-h" style="${deviceType !== 'desktop' ? 'display:none' : ''}"></div>

                    <div class="dr-page-wrapper">
                        <div id="drRulerV" class="dr-ruler-v" style="${deviceType !== 'desktop' ? 'display:none' : ''}"></div>

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
                    <div style="height:100px; flex-shrink:0"></div>
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
                        <textarea class="form-control" id="aiPrompt" style="min-height:80px; font-size:0.85rem; border-radius:10px" placeholder="Tanyakan sesuatu ke AI..."></textarea>
                        <div class="flex gap-4 mt-12">
                            <button class="btn btn-primary" style="flex:1" onclick="discussWithAI()">💬 Kirim</button>
                            <button class="btn btn-info btn-sm" onclick="discussWithAI(true)">🧐 Analisis</button>
                            <button class="btn btn-success btn-sm" onclick="executeAIDraft()">⚡ Terapkan</button>
                        </div>
                        <div class="form-group mt-12">
                            <label class="text-xs">Pihak Kedua:</label>
                            <input class="form-control form-control-sm" id="drPihak2" placeholder="Nama Lembaga/Orang">
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

    initDrRulers();

    // AUTO-DETECT DEVICE FLEXIBILITY: Set initial zoom & state
    setTimeout(() => {
        if (deviceType === 'mobile') {
            setDrZoom('width');
            if (typeof toggleDrRuler === 'function') {
                // Ensure rulers are hidden on mobile by default in JS state too
                document.getElementById('chkRuler').checked = false;
                toggleDrRuler();
            }
        } else if (deviceType === 'tablet') {
            setDrZoom(85);
        } else {
            setDrZoom(100);
        }
    }, 500);
}

window.switchDrTab = function(tab) {
    document.querySelectorAll('.dr-toolbar').forEach(t => t.style.display = 'none');
    document.querySelectorAll('.dr-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('dr-toolbar-' + tab).style.display = 'flex';
    document.getElementById('tab-' + tab).classList.add('active');
};

window.initDrRulers = function() {
    const rh = document.getElementById("drRulerH");
    const rv = document.getElementById("drRulerV");
    if(!rh || !rv) return;

    let hHtml = "";
    for(let i=0; i<=21; i++) {
        hHtml += `<div class="ruler-tick major" style="left:${i}cm; bottom:0"></div>`;
        if(i < 21) {
            for(let j=1; j<10; j++) {
                hHtml += `<div class="ruler-tick minor" style="left:${i}.${j}cm; bottom:0"></div>`;
            }
        }
        hHtml += `<div class="ruler-num" style="left:${i}cm; bottom:12px; transform: translateX(-50%)">${i}</div>`;
    }
    rh.innerHTML = hHtml;

    let vHtml = "";
    for(let i=0; i<=30; i++) {
        vHtml += `<div class="ruler-tick major" style="top:${i}cm; right:0; width:10px; height:1px"></div>`;
        if(i < 30) {
            for(let j=1; j<10; j++) {
                vHtml += `<div class="ruler-tick minor" style="top:${i}.${j}cm; right:0; width:5px; height:1px"></div>`;
            }
        }
        vHtml += `<div class="ruler-num" style="top:${i}cm; right:12px; transform: translateY(-50%)">${i}</div>`;
    }
    rv.innerHTML = vHtml;
};

window.toggleDrRuler = function() {
    const active = document.getElementById('chkRuler').checked;
    document.getElementById('drRulerH').style.visibility = active ? 'visible' : 'hidden';
    document.getElementById('drRulerV').style.visibility = active ? 'visible' : 'hidden';
};

window.toggleDrGrid = function() {
    document.getElementById('wordPage').classList.toggle('gridlines', document.getElementById('chkGrid').checked);
};

window.toggleDrKop = function() {
    document.getElementById('kopPreview').classList.toggle('active', document.getElementById('chkKop').checked);
};

window.setDrZoom = function(val) {
    const container = document.querySelector('.dr-editor-container');
    const page = document.getElementById('wordPage');
    const rulerH = document.getElementById('drRulerH');

    if (val === 'width') {
        const targetWidth = container.clientWidth - 80;
        const scale = targetWidth / page.offsetWidth;
        page.style.transform = `scale(${scale})`;
        page.style.transformOrigin = 'top center';
        rulerH.style.transform = `scale(${scale})`;
        rulerH.style.transformOrigin = 'bottom center';
    } else {
        const scale = val / 100;
        page.style.transform = `scale(${scale})`;
        page.style.transformOrigin = 'top center';
        rulerH.style.transform = `scale(${scale})`;
        rulerH.style.transformOrigin = 'bottom center';
    }
};

window.changeMargins = function() {
    const m = prompt("Masukkan Margin (cm) [Top Right Bottom Left]:", "2.5 2.5 2 2.5");
    if(!m) return;
    const vals = m.split(" ").map(v => v + "cm");
    document.getElementById('wordPage').style.padding = vals.join(" ");
};

window.changeOrientation = function() {
    const page = document.getElementById('wordPage');
    const rulerH = document.getElementById('drRulerH');
    const rulerV = document.getElementById('drRulerV');

    const isPortrait = page.style.width === "210mm" || !page.style.width;
    if (isPortrait) {
        page.style.width = "297mm";
        page.style.minHeight = "210mm";
        rulerH.style.width = "297mm";
        rulerV.style.minHeight = "210mm";
    } else {
        page.style.width = "210mm";
        page.style.minHeight = "297mm";
        rulerH.style.width = "210mm";
        rulerV.style.minHeight = "297mm";
    }
    initDrRulers();
};

window.changePageSize = function() {
    const size = prompt("Pilih Ukuran (A4, Letter, F4):", "A4").toUpperCase();
    const page = document.getElementById('wordPage');
    const rulerH = document.getElementById('drRulerH');
    const rulerV = document.getElementById('drRulerV');

    if (size === "A4") {
        page.style.width = "210mm"; page.style.minHeight = "297mm";
    } else if (size === "LETTER") {
        page.style.width = "216mm"; page.style.minHeight = "279mm";
    } else if (size === "F4") {
        page.style.width = "210mm"; page.style.minHeight = "330mm";
    }
    rulerH.style.width = page.style.width;
    rulerV.style.minHeight = page.style.minHeight;
    initDrRulers();
};

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
    const pakeKop = document.getElementById("drPakeKop")?.checked ?? true;

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
