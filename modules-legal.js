"use strict";

/**
 * MODULES-LEGAL.JS
 * Professional Ribbon Architecture for Legal Drafting
 * Scalable, Modular, and Device-Aware
 */

// ── 1. RIBBON DATA DEFINITIONS (The 'Models' Part) ───────────────────────────
const LEGAL_RIBBON_STRUCTURE = [
    {
        id: "home",
        title: "Beranda",
        groups: [
            {
                title: "Clipboard & History",
                actions: [
                    { id: "undo", type: "button", icon: "⟲", label: "Undo", cmd: "undo" },
                    { id: "redo", type: "button", icon: "⟳", label: "Redo", cmd: "redo" }
                ]
            },
            {
                title: "Font",
                actions: [
                    { id: "fontName", type: "select", label: "Font", cmd: "fontName", options: [
                        { val: "Times New Roman", label: "Times New Roman" },
                        { val: "Bookman Old Style", label: "Bookman Old Style" },
                        { val: "Cambria", label: "Cambria" },
                        { val: "Tahoma", label: "Tahoma" },
                        { val: "Arial", label: "Arial" },
                        { val: "Calibri", label: "Calibri" },
                        { val: "Georgia", label: "Georgia" }
                    ]},
                    { id: "fontSize", type: "select", label: "Ukuran", cmd: "fontSize", options: [
                        { val: "1", label: "8pt" }, { val: "2", label: "10pt" },
                        { val: "3", label: "12pt" }, { val: "4", label: "14pt" },
                        { val: "5", label: "18pt" }, { val: "6", label: "24pt" }
                    ]},
                    { id: "bold", type: "toggle", icon: "<b>B</b>", label: "Tebal", cmd: "bold" },
                    { id: "italic", type: "toggle", icon: "<i>I</i>", label: "Miring", cmd: "italic" },
                    { id: "underline", type: "toggle", icon: "<u>U</u>", label: "Garis", cmd: "underline" },
                    { id: "foreColor", type: "color", icon: "🎨", label: "Warna", cmd: "foreColor" }
                ]
            },
            {
                title: "Paragraf",
                actions: [
                    { id: "justifyLeft", type: "button", icon: "≡", label: "Kiri", cmd: "justifyLeft" },
                    { id: "justifyCenter", type: "button", icon: "≣", label: "Tengah", cmd: "justifyCenter" },
                    { id: "justifyFull", type: "button", icon: "≡", label: "Rata", cmd: "justifyFull" }
                ]
            }
        ]
    },
    {
        id: "insert",
        title: "Sisipkan",
        groups: [
            {
                title: "Media",
                actions: [
                    { id: "import", type: "button", icon: "📁", label: "Impor", fn: "document.getElementById('drFileImport').click()" },
                    { id: "table", type: "button", icon: "📊", label: "Tabel", fn: "insertDrTable()" },
                    { id: "hr", type: "button", icon: "➖", label: "Garis", cmd: "insertHorizontalRule" }
                ]
            },
            {
                title: "Template Hukum",
                actions: [
                    { id: "drTemplate", type: "select", label: "Pilih Template", fn: "applyLegalTemplate()", options: [
                        { val: "mou", label: "MOU Kerjasama" },
                        { val: "nda", label: "NDA Agreement" },
                        { val: "spk", label: "Surat Perintah Kerja" },
                        { val: "pkwt", label: "Kontrak PKWT" },
                        { val: "pkwtt", label: "Kontrak PKWTT" },
                        { val: "addendum", label: "Addendum" }
                    ]}
                ]
            }
        ]
    },
    {
        id: "view",
        title: "Tampilan",
        groups: [
            {
                title: "Elemen Pembantu",
                actions: [
                    { id: "chkRuler", type: "checkbox", label: "Penggaris", fn: "toggleDrRuler()", checked: true },
                    { id: "chkGrid", type: "checkbox", label: "Garis Kisi", fn: "toggleDrGrid()" },
                    { id: "chkKop", type: "checkbox", label: "KOP", fn: "toggleDrKop()", checked: true },
                    { id: "chkHeader", type: "checkbox", label: "Header/Footer", fn: "toggleDrHeader()" }
                ]
            },
            {
                title: "Zoom",
                actions: [
                    { id: "zoomIn", type: "button", icon: "➕", label: "Zoom In", fn: "adjustDrZoom(10)" },
                    { id: "zoomOut", type: "button", icon: "➖", label: "Zoom Out", fn: "adjustDrZoom(-10)" },
                    { id: "zoomReset", type: "button", icon: "🔍", label: "100%", fn: "setDrZoom(100)" }
                ]
            }
        ]
    }
];

// ── 2. RIBBON ENGINE (The 'Components' Part) ─────────────────────────────────

function renderRibbonEngine() {
    const device = getDeviceType();
    let tabsHtml = "";
    let contentHtml = "";

    LEGAL_RIBBON_STRUCTURE.forEach((tab, idx) => {
        tabsHtml += `<div class="dr-tab ${idx === 0 ? 'active' : ''}" id="tab-${tab.id}" onclick="switchDrTab('${tab.id}')">${tab.title}</div>`;

        let groupsHtml = "";
        tab.groups.forEach(group => {
            let actionsHtml = "";
            group.actions.forEach(action => {
                if (action.type === "button" || action.type === "toggle") {
                    actionsHtml += `<button class="dr-btn" onclick="${action.fn ? action.fn : `formatDoc('${action.cmd}')`}" title="${action.label}"><span>${action.icon}</span><label>${action.label}</label></button>`;
                } else if (action.type === "select") {
                    let opts = `<option value="">-- ${action.label} --</option>` + action.options.map(o => `<option value="${o.val}">${o.label}</option>`).join("");
                    actionsHtml += `<div class="dr-toolbar-grp-item"><label class="text-xs">${action.label}</label><select class="dr-select" id="${action.id}" onchange="${action.fn ? action.fn : `formatDoc('${action.cmd}', this.value)`}">${opts}</select></div>`;
                } else if (action.type === "checkbox") {
                    actionsHtml += `<label class="dr-chk-label"><input type="checkbox" id="${action.id}" ${action.checked ? 'checked' : ''} onchange="${action.fn}"> ${action.label}</label>`;
                } else if (action.type === "color") {
                    actionsHtml += `<div class="dr-toolbar-grp-item"><label class="text-xs">${action.label}</label><input type="color" onchange="formatDoc('${action.cmd}', this.value)" class="dr-color-input"></div>`;
                }
            });
            groupsHtml += `<div class="dr-toolbar-grp"><div class="dr-actions-wrap">${actionsHtml}</div><div class="dr-grp-title">${group.title}</div></div>`;
        });

        contentHtml += `<div class="dr-toolbar" id="dr-toolbar-${tab.id}" style="${idx === 0 ? 'display:flex' : 'display:none'}">${groupsHtml}</div>`;
    });

    return { tabs: tabsHtml, toolbars: contentHtml };
}

// ── 3. MAIN WORKSPACE (The 'Main' Part) ──────────────────────────────────────

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

async function modalLegalDrafting() {
    const deviceType = getDeviceType();
    const ribbon = renderRibbonEngine();

    // Auto-generate numbering
    let nextSeq = "001";
    try {
        const suratSnap = await db.collection("hrd_surat").get();
        nextSeq = String(suratSnap.size + 1).padStart(3, '0');
    } catch (e) {}
    const autoNumber = `${nextSeq}/LGL-IJEF/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${new Date().getFullYear()}`;

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
            }
            .dr-toolbar-tabs { background: #2b579a; display: flex; padding: 0 20px; gap: 4px; }
            .dr-tab {
                padding: 8px 16px; color: #fff; cursor: pointer; font-size: 0.85rem;
                border-radius: 4px 4px 0 0; transition: 0.2s;
            }
            .dr-tab.active { background: #fff; color: #2b579a; font-weight: 600; }

            .dr-toolbar {
                background: #f3f2f1; border-bottom: 1px solid #ddd;
                padding: 5px 20px; display: flex; gap: 0; align-items: stretch;
                height: 95px; overflow-x: auto;
            }
            .dr-toolbar-grp {
                display: flex; flex-direction: column; align-items: center;
                padding: 5px 12px; border-right: 1px solid #ddd; position: relative;
            }
            .dr-actions-wrap { display: flex; gap: 8px; align-items: center; flex: 1; }
            .dr-grp-title { font-size: 0.65rem; color: #666; margin-top: auto; padding-top: 4px; }

            .dr-btn {
                background: transparent; border: 1px solid transparent;
                padding: 4px 8px; border-radius: 4px; cursor: pointer;
                display: flex; flex-direction: column; align-items: center; gap: 2px;
                min-width: 45px; transition: 0.2s;
            }
            .dr-btn:hover { background: #edebe9; }
            .dr-btn span { font-size: 1.2rem; }
            .dr-btn label { font-size: 0.7rem; cursor: pointer; white-space: nowrap; }

            .dr-select { padding: 2px 4px; border: 1px solid #ddd; font-size: 0.75rem; border-radius: 2px; }
            .dr-chk-label { font-size: 0.7rem; display: flex; align-items: center; gap: 4px; cursor: pointer; }
            .dr-color-input { width: 24px; height: 24px; border: none; padding: 0; cursor: pointer; background: transparent; }

            .dr-main { display: flex; flex: 1; overflow: hidden; }

            /* LEFT SIDE: Ribbon + Editor */
            .dr-editor-section {
                flex: 1; display: flex; flex-direction: column; background: #adb5bd;
                overflow: hidden; position: relative;
            }
            .dr-editor-scroll-area {
                flex: 1; overflow: auto; display: flex; flex-direction: column;
                align-items: center; padding: 40px 20px; scroll-behavior: smooth;
            }

            /* RIGHT SIDE: AI Sidebar (320dp equivalent) */
            .dr-ai-sidebar {
                width: 320px; background: #f5f5f5; border-left: 1px solid #404040;
                display: flex; flex-direction: column; z-index: 10;
            }
            .ai-sidebar-header {
                height: 48px; background: #1a1a1a; color: #fff; padding: 0 15px;
                display: flex; align-items: center; gap: 10px; flex-shrink: 0;
            }
            .ai-chat-area {
                flex: 1; overflow-y: auto; padding: 15px; display: flex;
                flex-direction: column; gap: 12px;
            }
            .ai-input-area {
                padding: 15px; background: #fff; border-top: 1px solid #ddd;
                display: flex; flex-direction: column; gap: 8px;
            }

            .dr-page-wrapper { position: relative; transition: transform 0.2s; transform-origin: top center; }
            .dr-page {
                background: white; width: 210mm; min-height: 297mm;
                padding: 2.5cm 2.5cm 2cm 2.5cm; box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                display: flex; flex-direction: column; color: #000; position: relative;
            }
            .dr-editor {
                border: none; width: 100%; min-height: 100%;
                flex: 1; font-family: 'Times New Roman', serif; font-size: 11pt;
                line-height: 1.6; outline: none; background: transparent; text-align: justify;
            }

            .dr-header-area, .dr-footer-area {
                font-size: 9pt; color: #999; border: 1px dashed transparent;
                padding: 5px; margin-bottom: 10px; min-height: 30px; outline: none;
            }
            .dr-header-area:hover, .dr-footer-area:hover { border-color: #ddd; }

            .dr-sidebar { width: 320px; background: #fff; border-left: 1px solid #ddd; display: flex; flex-direction: column; }

            /* RULER STYLES */
            .dr-ruler-h { width: 210mm; height: 20px; background: #f8f9fa; border-bottom: 1px solid #333; position: relative; flex-shrink: 0; }
            .dr-ruler-v { width: 20px; height: 100%; background: #f8f9fa; border-right: 1px solid #333; position: absolute; left: -20px; top: 0; }
            .ruler-tick { position: absolute; background: #999; }
            .ruler-tick.major { height: 8px; width: 1px; }
            .ruler-num { position: absolute; font-size: 8px; color: #666; transform: translateX(-50%); }

            @media (max-width: 1024px) {
                .dr-main { flex-direction: column; }
                .dr-sidebar { width: 100%; height: 300px; border-left: none; border-top: 1px solid #ddd; }
                .dr-ruler-h, .dr-ruler-v { display: none !important; }
            }
        `;
        document.head.appendChild(style);
    }

    let cp = { nama: "LPK IJEF CORP", logo: "" };
    try {
        const doc = await db.collection("hrd_settings").doc("perusahaan").get();
        if (doc.exists) cp = doc.data();
    } catch (e) {}

    openModal(`
        <div class="modal-fullscreen" id="modalWorkspace">
            <div class="dr-header">
                <div class="flex gap-12" style="align-items:center">
                    <div style="background:#fff; color:#2b579a; width:28px; height:28px; border-radius:4px; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:0.8rem">LGL</div>
                    <div class="fw-700" style="font-size:0.85rem">Legal Drafting Pro — ${deviceType.toUpperCase()}</div>
                </div>
                <div class="flex gap-8">
                    <button class="btn btn-sm btn-success" onclick="simpanDraftLegal()">💾 Simpan</button>
                    <button class="btn btn-sm btn-info" onclick="printDraftLegalDirect()">🖨️ Cetak</button>
                    <button class="btn btn-outline btn-sm" style="color:#fff; border-color:#fff" onclick="closeModalDirect()">✕</button>
                </div>
            </div>

            <div class="dr-toolbar-tabs">${ribbon.tabs}</div>
            <div id="ribbonContainer">${ribbon.toolbars}</div>

            <div class="dr-main">
                <!-- LEFT SECTION -->
                <div class="dr-editor-section">
                    <div class="dr-editor-scroll-area">
                        <div id="drRulerH" class="dr-ruler-h"></div>
                        <div class="dr-page-wrapper" id="pageWrapper">
                            <div id="drRulerV" class="dr-ruler-v"></div>
                            <div class="dr-page" id="wordPage">
                                <div class="dr-header-area" id="drHeaderArea" contenteditable="true" style="display:none">Ketik Header di sini...</div>
                                <div class="dr-kop active" id="kopPreview" style="display:flex; border-bottom:2px solid #000; padding-bottom:10px; margin-bottom:20px; align-items:center">
                                    <img src="${cp.logo || 'icon-ijef-v3.png'}" style="width:70px; height:70px; object-fit:contain; margin-right:15px">
                                    <div style="flex:1; text-align:center">
                                        <div style="font-size:14pt; font-weight:bold">${cp.nama}</div>
                                        <div style="font-size:9pt; color:#444">${cp.alamat || '-'}</div>
                                    </div>
                                </div>
                                <div style="text-align:center; margin-bottom: 20px">
                                    <div id="drJudul" contenteditable="true" style="font-weight:bold; font-size:13pt; text-decoration:underline">JUDUL DOKUMEN</div>
                                    <div style="font-size:10pt; margin-top:5px">Nomor: <input type="text" id="drNomor" value="${autoNumber}" style="border:none; width:200px; outline:none; text-align:center"></div>
                                </div>
                                <div class="dr-editor" id="drKonten" contenteditable="true"></div>
                                <div class="dr-footer-area" id="drFooterArea" contenteditable="true" style="display:none">Ketik Footer di sini...</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- RIGHT SECTION: AI SIDEBAR -->
                <div class="dr-ai-sidebar">
                    <div class="ai-sidebar-header">
                        <span style="font-size:1.2rem">🤖</span>
                        <div style="display:flex; flex-direction:column">
                            <span class="fw-700" style="font-size:0.85rem">Legal Brain AI</span>
                            <span class="text-xs" style="color:#4caf50; font-size:0.65rem">● Online</span>
                        </div>
                    </div>

                    <div class="ai-chat-area" id="aiChatBox">
                        <div style="background:#fff; border:1px solid #ddd; padding:12px; border-radius:12px 12px 12px 2px; font-size:0.8rem; line-height:1.5; box-shadow:0 1px 3px rgba(0,0,0,0.05)">
                            Halo! Saya <b>AI Legal Assistant</b> Anda.<br><br>
                            Ketik perintah di bawah untuk membuat draf pasal, menganalisis risiko, atau menerjemahkan istilah hukum.
                        </div>
                    </div>

                    <div class="ai-input-area">
                        <textarea class="form-control" id="aiPrompt" style="min-height:80px; font-size:0.85rem; border-radius:8px" placeholder="Contoh: Buatkan draf pasal kerahasiaan untuk MOU..."></textarea>
                        <div style="display:flex; gap:6px; margin-top:5px">
                            <button class="btn btn-primary btn-sm" style="flex:1" onclick="discussWithAI()">Kirim</button>
                            <button class="btn btn-info btn-sm" onclick="onAnalyzeRequested()">Analisis</button>
                        </div>
                        <button class="btn btn-success btn-sm w-100 mt-4" style="font-weight:bold" onclick="executeAIDraft()">⚡ Terapkan ke Dokumen</button>
                    </div>
                </div>
            </div>
            <input type="file" id="drFileImport" style="display:none" accept=".txt,.html" onchange="importDocumentToWorkspace(this)">
        </div>
    `, true);

    initDrRulers();
    // Auto-detect and set zoom
    setTimeout(() => {
        if (deviceType === 'mobile') {
            setDrZoom('width');
            document.getElementById('chkRuler').checked = false;
            toggleDrRuler();
        } else if (deviceType === 'tablet') {
            setDrZoom(85);
        } else {
            setDrZoom(100);
        }
    }, 500);
}

// ── 4. LOGIC ENGINE (The 'Interaction' Part) ─────────────────────────────────

window.switchDrTab = function(tabId) {
    document.querySelectorAll('.dr-toolbar').forEach(t => t.style.display = 'none');
    document.querySelectorAll('.dr-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('dr-toolbar-' + tabId).style.display = 'flex';
    document.getElementById('tab-' + tabId).classList.add('active');
};

function formatDoc(cmd, val) {
    document.execCommand(cmd, false, val);
    document.getElementById("drKonten").focus();
}

window.adjustDrZoom = function(delta) {
    window._drZoom = (window._drZoom || 100) + delta;
    setDrZoom(window._drZoom);
};

window.setDrZoom = function(val) {
    const wrapper = document.getElementById('pageWrapper');
    if (!wrapper) return;
    if (val === 'width') {
        const container = document.querySelector('.dr-editor-container');
        val = ((container.clientWidth - 40) / 794) * 100;
    }
    window._drZoom = val;
    wrapper.style.transform = `scale(${val / 100})`;
};

window.insertDrTable = function() {
    const r = prompt("Baris:", "3"), c = prompt("Kolom:", "3");
    if(!r || !c) return;
    let h = '<table style="width:100%; border-collapse:collapse; border:1px solid #000; margin:10px 0">';
    for(let i=0; i<r; i++) {
        h += '<tr>';
        for(let j=0; j<c; j++) h += '<td style="border:1px solid #000; padding:5px">...</td>';
        h += '</tr>';
    }
    h += '</table><p></p>';
    formatDoc('insertHTML', h);
};

window.toggleDrRuler = function() {
    const show = document.getElementById('chkRuler').checked;
    document.getElementById('drRulerH').style.display = show ? 'block' : 'none';
    document.getElementById('drRulerV').style.display = show ? 'block' : 'none';
};

window.toggleDrGrid = function() {
    document.getElementById('wordPage').style.backgroundImage = document.getElementById('chkGrid').checked ?
        'linear-gradient(#eee 1px, transparent 1px), linear-gradient(90deg, #eee 1px, transparent 1px)' : 'none';
    document.getElementById('wordPage').style.backgroundSize = '20px 20px';
};

window.toggleDrKop = function() {
    document.getElementById('kopPreview').style.display = document.getElementById('chkKop').checked ? 'flex' : 'none';
};

window.toggleDrHeader = function() {
    const show = document.getElementById('chkHeader').checked;
    document.getElementById('drHeaderArea').style.display = show ? 'block' : 'none';
    document.getElementById('drFooterArea').style.display = show ? 'block' : 'none';
};

window.initDrRulers = function() {
    const rh = document.getElementById("drRulerH"), rv = document.getElementById("drRulerV");
    if(!rh || !rv) return;
    let h = "", v = "";
    for(let i=0; i<=21; i++) {
        h += `<div class="ruler-tick major" style="left:${i}cm; bottom:0"></div>`;
        h += `<div class="ruler-num" style="left:${i}cm; bottom:10px">${i}</div>`;
    }
    for(let i=0; i<=30; i++) {
        v += `<div class="ruler-tick major" style="top:${i}cm; right:0; width:8px"></div>`;
        v += `<div class="ruler-num" style="top:${i}cm; right:10px; transform:translateY(-50%)">${i}</div>`;
    }
    rh.innerHTML = h; rv.innerHTML = v;
};

function applyLegalTemplate() {
    const type = document.getElementById("drTemplate").value;
    const konten = document.getElementById("drKonten");
    const judul = document.getElementById("drJudul");
    const num = document.getElementById("drNomor").value;

    const templates = {
        mou: { judul: "MEMORANDUM OF UNDERSTANDING", isi: `<p>Perjanjian Kerjasama antara LPK IJEF CORP dan [PIHAK KEDUA]...</p>` },
        nda: { judul: "NON-DISCLOSURE AGREEMENT", isi: `<p>Pihak-pihak sepakat menjaga kerahasiaan data...</p>` },
        spk: { judul: "SURAT PERINTAH KERJA", isi: `<p>Dengan ini LPK IJEF CORP memerintahkan [PIHAK KEDUA] untuk...</p>` },
        pkwt: { judul: "KONTRAK KERJA (PKWT)", isi: `<p>HUBUNGAN KERJA WAKTU TERTENTU<br>Jabatan: [POSISI]<br>Durasi: [BULAN] Bulan</p>` },
        pkwtt: { judul: "KONTRAK KERJA TETAP (PKWTT)", isi: `<p>SURAT KEPUTUSAN PENGANGKATAN KARYAWAN TETAP...</p>` },
        addendum: { judul: "ADDENDUM PERJANJIAN", isi: `<p>Perubahan atas Perjanjian Nomor [...] Mengenai Pasal [...]</p>` }
    };
    if(templates[type]) { judul.innerText = templates[type].judul; konten.innerHTML = templates[type].isi; }
}

async function simpanDraftLegal() {
    const data = {
        nomor: document.getElementById("drNomor").value,
        judul: document.getElementById("drJudul").innerText.trim(),
        pihak2: document.getElementById("drPihak2")?.value || '',
        konten: document.getElementById("drKonten").innerHTML,
        type: "draft_kontrak",
        createdBy: currentUser.nama,
        createdAt: new Date().toISOString()
    };
    if (!data.judul || data.judul === "JUDUL DOKUMEN") return toast("Judul wajib", "warning");
    await db.collection("hrd_legal_drafts").add(data);
    toast("Draft disimpan!", "success");
}

async function printDraftLegalDirect() {
    const judul = document.getElementById("drJudul").innerText;
    const nomor = document.getElementById("drNomor").value;
    const konten = document.getElementById("drKonten").innerHTML;
    const header = document.getElementById("drHeaderArea").innerHTML;
    const footer = document.getElementById("drFooterArea").innerHTML;
    const isHeaderActive = document.getElementById("chkHeader").checked;

    const printWin = window.open('', '_blank');
    printWin.document.write(`<html><head><title>Print</title><style>@page{margin:2cm}body{font-family:'Times New Roman',serif;font-size:11pt}.header{font-size:9pt;color:#999;margin-bottom:20px;text-align:center}.footer{position:fixed;bottom:0;width:100%;font-size:9pt;color:#999;text-align:center}</style></head><body>${isHeaderActive?`<div class='header'>${header}</div>`:''}<div style='text-align:center;margin-bottom:30px'><b>${judul}</b><br>Nomor: ${nomor}</div>${konten}${isHeaderActive?`<div class='footer'>${footer}</div>`:''}</body></html>`);
    printWin.document.close();
    setTimeout(() => { printWin.print(); printWin.close(); }, 500);
}

function discussWithAI() {
    const prompt = document.getElementById("aiPrompt").value.trim();
    if(!prompt) return;

    onSendPrompt(prompt);
}

window.onSendPrompt = function(prompt) {
    const chatBox = document.getElementById("aiChatBox");
    chatBox.innerHTML += `<div style="align-self: flex-end; background: #2b579a; color: #fff; padding: 10px; border-radius: 12px 12px 2px 12px; font-size: 0.8rem; max-width: 85%">${escHtml(prompt)}</div>`;
    document.getElementById("aiPrompt").value = "";
    chatBox.scrollTop = chatBox.scrollHeight;

    // Simulate AI response
    setTimeout(() => {
        const response = "Berdasarkan instruksi Anda, berikut adalah draf klausul yang disarankan:\n\n'Para Pihak sepakat untuk menjaga kerahasiaan seluruh informasi teknis dan bisnis yang dipertukarkan selama masa perjanjian ini.'";
        window._lastAiDraft = response;
        chatBox.innerHTML += `<div style="background: #fff; border: 1px solid #ddd; padding: 12px; border-radius: 12px 12px 12px 2px; font-size: 0.8rem; line-height: 1.5; box-shadow: 0 1px 3px rgba(0,0,0,0.05)">${escHtml(response).replace(/\n/g, '<br>')}</div>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 1000);
};

window.onAnalyzeRequested = function() {
    const editor = document.getElementById("drKonten");
    const text = editor.innerText;
    if(text.length < 10) return toast("Dokumen terlalu singkat untuk dianalisis", "warning");

    const chatBox = document.getElementById("aiChatBox");
    chatBox.innerHTML += `<div style="background: #fff3e0; border: 1px solid #ffe0b2; padding: 10px; border-radius: 8px; font-size: 0.75rem; color: #e65100">🔍 Menganalisis draf Anda...</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;

    setTimeout(() => {
        chatBox.innerHTML += `<div style="background: #fff; border: 1px solid #ddd; padding: 12px; border-radius: 12px; font-size: 0.8rem"><b>Hasil Analisis:</b><br>Draf Anda sudah cukup baik, namun perlu penambahan detail sanksi pada Pasal Pelanggaran Kontrak.</div>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 1500);
};

window.executeAIDraft = function() {
    if(!window._lastAiDraft) return toast("Belum ada draf AI untuk diterapkan", "warning");

    const editor = document.getElementById("drKonten");
    editor.innerHTML += `<p>${window._lastAiDraft.replace(/\n/g, '<br>')}</p>`;
    toast("Draf AI berhasil dimasukkan ke dokumen", "success");
    window._lastAiDraft = null;
};

function importDocumentToWorkspace(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => { document.getElementById("drKonten").innerHTML = e.target.result; };
    reader.readAsText(file);
}

// ── 5. SENGKETA & KASUS HUKUM ───────────────────────────────────────────────

async function renderLegalSengketa() {
    const main = document.getElementById("mainContent");
    main.innerHTML = `
    <div class="page-title">
        <span>⚠️ Sengketa & Kasus Hukum</span>
        <button class="btn btn-primary btn-sm" onclick="modalSengketa()">+ Tambah Kasus</button>
    </div>
    <div class="card">
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>ID Kasus</th>
                        <th>Judul Kasus</th>
                        <th>Kategori</th>
                        <th>Status</th>
                        <th>Pihak Terkait</th>
                        <th>Tanggal</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody id="tblLegalSengketa">
                    <tr><td colspan="7" class="text-center">Memuat data...</td></tr>
                </tbody>
            </table>
        </div>
    </div>`;
    loadLegalSengketa();
}

async function loadLegalSengketa() {
    const tbody = document.getElementById("tblLegalSengketa");
    try {
        const snap = await db.collection("hrd_legal_sengketa").orderBy("createdAt", "desc").get();
        let html = "";
        if (snap.empty) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">Belum ada catatan sengketa.</td></tr>';
            return;
        }
        snap.forEach((doc) => {
            const p = doc.data();
            const statusBadge = p.status === 'Selesai' ? 'success' : p.status === 'Proses' ? 'warning' : 'danger';
            html += `<tr>
                <td class="fw-700">${escHtml(p.case_id)}</td>
                <td>${escHtml(p.judul)}</td>
                <td>${escHtml(p.kategori)}</td>
                <td><span class="badge badge-${statusBadge}">${p.status}</span></td>
                <td>${escHtml(p.pihak)}</td>
                <td>${formatDate(p.createdAt)}</td>
                <td>
                    <button class="btn btn-xs btn-info" onclick="viewSengketaDetail('${doc.id}')">👁️</button>
                    <button class="btn btn-xs btn-danger" onclick="hapusSengketa('${doc.id}')">🗑️</button>
                </td>
            </tr>`;
        });
        tbody.innerHTML = html;
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center">Error: ${e.message}</td></tr>`;
    }
}

function modalSengketa() {
    openModal(`
        <div class="modal-title">⚠️ Tambah Catatan Kasus / Sengketa</div>
        <div class="form-group"><label>Judul Kasus</label><input class="form-control" id="skJudul"></div>
        <div class="grid-2">
            <div class="form-group">
                <label>Kategori</label>
                <select class="form-control" id="skKategori">
                    <option value="Perdata">Perdata</option>
                    <option value="Pidana">Pidana</option>
                    <option value="PHI">PHI</option>
                    <option value="Internal">Internal</option>
                </select>
            </div>
            <div class="form-group"><label>Status</label><select class="form-control" id="skStatus"><option>Baru</option><option>Proses</option><option>Selesai</option></select></div>
        </div>
        <div class="form-group"><label>Pihak Terkait</label><input class="form-control" id="skPihak"></div>
        <div class="form-group"><label>Kronologi</label><textarea class="form-control" id="skKronologi" style="min-height:100px"></textarea></div>
        <button class="btn btn-primary" onclick="simpanSengketa()">💾 Simpan Kasus</button>
    `, true);
}

async function simpanSengketa() {
    const data = {
        case_id: `SKT-${Date.now().toString().slice(-6)}`,
        judul: document.getElementById("skJudul").value,
        kategori: document.getElementById("skKategori").value,
        status: document.getElementById("skStatus").value,
        pihak: document.getElementById("skPihak").value,
        kronologi: document.getElementById("skKronologi").value,
        createdAt: new Date().toISOString()
    };
    if(!data.judul) return toast("Judul wajib", "warning");
    await db.collection("hrd_legal_sengketa").add(data);
    closeModalDirect(); renderLegalSengketa();
}

async function viewSengketaDetail(id) {
    const doc = await db.collection("hrd_legal_sengketa").doc(id).get();
    const p = doc.data();
    openModal(`<div class="modal-title">👁️ Detail Kasus</div><div class="text-sm" style="white-space:pre-wrap">${escHtml(p.kronologi)}</div>`, true);
}

async function hapusSengketa(id) {
    if(!confirm("Hapus?")) return;
    await db.collection("hrd_legal_sengketa").doc(id).delete();
    renderLegalSengketa();
}

// ── 6. SISTEM TIKET & PERIZINAN (REMAINING) ─────────────────────────────────

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
