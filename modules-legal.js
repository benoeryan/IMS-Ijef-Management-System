"use strict";

/**
 * MODULES-LEGAL.JS
 * Professional Desktop-Grade Ribbon System Architecture
 * Pixel-Perfect Microsoft Word Clone (Dark Theme)
 */

// ── 1. RIBBON DEFINITIONS (Modular Data Structure) ──────────────────────────
const RIBBON_TABS = [
    {
        id: "home",
        title: "Beranda",
        groups: [
            {
                id: "clipboard",
                title: "Papan Klip",
                layout: "clipboard-group" // Custom layout for Paste + Stacked tools
            },
            {
                id: "font",
                title: "Font",
                layout: "font-group" // Custom double-row layout
            },
            {
                id: "paragraph",
                title: "Paragraf",
                layout: "paragraph-group"
            },
            {
                id: "ai-tools",
                title: "Legal AI",
                actions: [
                    { id: "lib", icon: "📚", label: "Pustaka Klausul", fn: "alert('Clause Library')" },
                    { id: "analyze", icon: "🧐", label: "Analisis Risiko", fn: "onAnalyzeRequested()" }
                ]
            }
        ]
    },
    {
        id: "insert",
        title: "Sisipkan",
        groups: [
            {
                title: "Halaman",
                actions: [
                    { id: "cover", icon: "📄", label: "Halaman Sampul", cmd: "" },
                    { id: "break", icon: "📑", label: "Pemisah Halaman", cmd: "" }
                ]
            },
            {
                title: "Tabel",
                actions: [
                    { id: "table", icon: "📊", label: "Tabel", fn: "insertDrTable()" }
                ]
            }
        ]
    }
];

// ── 2. UI COMPONENTS (The 'Stateless' Parts) ─────────────────────────────────

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
                        <button class="dr-btn-compact" onclick="alert('Format Painter')" title="Penyalin Format">🖌️<span>Format</span></button>
                    </div>
                </div>
                <div class="dr-grp-title">Papan Klip</div>
            </div>`;
    }

    if (id === "font") {
        return `
            <div class="dr-toolbar-grp">
                <div style="display:flex; flex-direction:column; gap:4px">
                    <!-- Top Row: Font Select + Size -->
                    <div style="display:flex; align-items:center; gap:4px">
                        <select class="dr-select-compact" id="fontName" onchange="formatDoc('fontName', this.value)" style="width:110px">
                            <option>Times New Roman</option><option>Arial</option><option>Cambria</option><option>Calibri</option><option>Bookman Old Style</option><option>Tahoma</option>
                        </select>
                        <select class="dr-select-compact" id="fontSize" onchange="formatDoc('fontSize', this.value)" style="width:50px">
                            <option value="2">10</option><option value="3" selected>12</option><option value="4">14</option><option value="5">18</option>
                        </select>
                        <div class="dr-toolbar-separator-v"></div>
                        <button class="dr-btn-icon-only" onclick="adjustFontSize(1)">A<sup>+</sup></button>
                        <button class="dr-btn-icon-only" onclick="adjustFontSize(-1)">A<sup>-</sup></button>
                    </div>
                    <!-- Bottom Row: Styles -->
                    <div style="display:flex; align-items:center; gap:2px">
                        <button class="dr-btn-style" onclick="formatDoc('bold')" title="Bold"><b>B</b></button>
                        <button class="dr-btn-style" onclick="formatDoc('italic')" title="Italic"><i>I</i></button>
                        <button class="dr-btn-style" onclick="formatDoc('underline')" title="Underline"><u>U</u></button>
                        <button class="dr-btn-style" onclick="formatDoc('strikeThrough')"><s>abc</s></button>
                        <div class="dr-toolbar-separator-v"></div>
                        <div class="dr-color-picker-wrap">
                            <input type="color" onchange="formatDoc('foreColor', this.value)" title="Warna Font">
                            <span>A</span>
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
                        <button class="dr-btn-icon-only" onclick="formatDoc('justifyFull')">≡</button>
                    </div>
                </div>
                <div class="dr-grp-title">Paragraf</div>
            </div>`;
    }
}

// ── 3. MAIN WORKSPACE (The 'Main' Part) ──────────────────────────────────────

async function modalLegalDrafting() {
    const deviceType = getDeviceType();

    const styleId = "legalRibbonStyles";
    if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
            :root {
                --office-bg: #1F1F1F;
                --ribbon-bg: #2B2B2B;
                --ribbon-border: #404040;
                --ribbon-text: #F1F1F1;
                --ribbon-label: #A0A0A0;
                --ribbon-hover: #3D3D3D;
                --ribbon-accent: #2b579a;
            }
            .modal-fullscreen {
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; background: var(--office-bg);
                font-family: 'Segoe UI', Arial, sans-serif; z-index: 9999; color: #fff;
            }
            /* TAB BAR */
            .dr-tab-bar {
                background: var(--office-bg); height: 32px; display: flex;
                align-items: flex-end; padding: 0 10px; gap: 2px;
            }
            .dr-tab {
                padding: 4px 15px; font-size: 11.5sp; cursor: pointer; color: #ccc;
                border-radius: 4px 4px 0 0; transition: 0.1s;
            }
            .dr-tab:hover { background: #333; }
            .dr-tab.active { background: var(--ribbon-bg); color: #fff; }

            /* RIBBON AREA */
            .dr-ribbon {
                background: var(--ribbon-bg); height: 95px; border-bottom: 1px solid var(--ribbon-border);
                display: flex; overflow-x: auto; padding: 0 5px;
            }
            .dr-toolbar-grp {
                display: flex; flex-direction: column; align-items: center;
                padding: 4px 8px; border-right: 1px solid var(--ribbon-border); min-width: 60px;
            }
            .dr-grp-title { font-size: 10px; color: var(--ribbon-label); margin-top: auto; padding-bottom: 2px; }
            .dr-actions-wrap { display: flex; align-items: center; flex: 1; }

            /* COMPACT COMPONENTS */
            .dr-btn-large {
                background: transparent; border: 1px solid transparent; color: #fff;
                display: flex; flex-direction: column; align-items: center; gap: 2px;
                padding: 4px 10px; border-radius: 3px; cursor: pointer; height: 100%;
            }
            .dr-btn-large:hover { background: var(--ribbon-hover); border-color: #555; }
            .dr-btn-large label { font-size: 11px; cursor: pointer; }

            .dr-stacked-tools { display: flex; flex-direction: column; gap: 1px; justify-content: center; }
            .dr-btn-compact {
                background: transparent; border: none; color: #fff; padding: 2px 6px;
                font-size: 11px; display: flex; align-items: center; gap: 6px; cursor: pointer;
                text-align: left; border-radius: 2px;
            }
            .dr-btn-compact:hover { background: var(--ribbon-hover); }
            .dr-btn-compact span { font-size: 10.5px; }

            .dr-select-compact {
                background: #333; color: #fff; border: 1px solid #555; height: 22px;
                font-size: 11px; outline: none; padding: 0 4px; border-radius: 2px;
            }
            .dr-btn-icon-only {
                background: transparent; border: 1px solid transparent; color: #fff;
                width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
                cursor: pointer; border-radius: 2px; font-size: 12px;
            }
            .dr-btn-icon-only:hover { background: var(--ribbon-hover); border-color: #555; }
            .dr-btn-style {
                background: transparent; border: 1px solid transparent; color: #fff;
                width: 24px; height: 24px; cursor: pointer; border-radius: 2px; font-size: 13px;
            }
            .dr-btn-style:hover { background: var(--ribbon-hover); }
            .dr-btn-style.active { background: #444; border-color: var(--ribbon-accent); }

            .dr-toolbar-separator-v { width: 1px; height: 20px; background: var(--ribbon-border); margin: 0 4px; }

            .dr-color-picker-wrap {
                position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
            }
            .dr-color-picker-wrap input {
                position: absolute; width: 100%; height: 100%; opacity: 0; cursor: pointer;
            }
            .dr-color-picker-wrap span { font-size: 14px; font-weight: bold; text-decoration: underline; }

            /* MAIN SPLIT LAYOUT */
            .dr-main-split { display: flex; flex: 1; overflow: hidden; }
            .dr-editor-canvas {
                flex: 1; background: #525659; overflow: auto; display: flex;
                flex-direction: column; align-items: center; padding: 30px 10px;
            }
            .dr-page-a4 {
                background: white; width: 210mm; min-height: 297mm; color: #000;
                padding: 2.5cm; box-shadow: 0 0 15px rgba(0,0,0,0.5); position: relative;
                transform-origin: top center;
            }
            .dr-editable-content {
                width: 100%; height: 100%; min-height: 100%; outline: none;
                font-family: 'Times New Roman'; font-size: 11pt; line-height: 1.5;
                text-align: justify;
            }

            /* AI SIDEBAR (Legal Brain AI) */
            .dr-ai-sidebar {
                width: 320px; background: #F5F5F5; display: flex; flex-direction: column;
                border-left: 1px solid #404040; color: #333;
            }
            .ai-header {
                height: 48px; background: var(--ribbon-bg); color: #fff;
                display: flex; align-items: center; padding: 0 15px; gap: 10px;
            }
            .ai-chat-history { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 10px; }
            .ai-bubble {
                background: #fff; border: 1px solid #ddd; padding: 10px; border-radius: 8px 8px 8px 2px;
                font-size: 0.85rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            .ai-input-panel { padding: 15px; border-top: 1px solid #ddd; background: #fff; }
            .ai-prompt-box {
                width: 100%; min-height: 70px; border: 1px solid #ccc; border-radius: 4px;
                padding: 8px; font-size: 0.85rem; resize: none; margin-bottom: 10px;
            }
            .ai-actions-row { display: flex; gap: 5px; }
            .btn-terapkan { background: #2e7d32; color: #fff; font-weight: bold; border: none; padding: 8px; border-radius: 4px; width: 100%; margin-top: 5px; cursor: pointer; }

            @media (max-width: 1024px) {
                .dr-ai-sidebar { display: none; } /* Hide on mobile to keep focus */
            }
        `;
        document.head.appendChild(style);
    }

    openModal(`
        <div class="modal-fullscreen" id="legalWorkspace">
            <!-- 1. Header Area -->
            <div class="dr-tab-bar">
                <div style="color:var(--ribbon-accent); padding: 0 12px; font-weight:bold; font-size:12px">W</div>
                <div class="dr-tab active" onclick="switchTab('home')">Beranda</div>
                <div class="dr-tab" onclick="switchTab('insert')">Sisipkan</div>
                <div class="dr-tab">Tata Letak</div>
                <div class="dr-tab">Referensi</div>
                <div style="margin-left:auto; padding: 0 15px; color:#999; font-size:11px">Legal Drafting Pro v2.0</div>
            </div>

            <!-- 2. Ribbon Area -->
            <div class="dr-ribbon" id="ribbonHome">
                ${renderHomeGroup('clipboard')}
                ${renderHomeGroup('font')}
                ${renderHomeGroup('paragraph')}
                <div class="dr-toolbar-grp">
                    <div class="dr-actions-wrap" style="gap:6px">
                        <button class="dr-btn-large" onclick="alert('Library')"><span>📚</span><label>Pustaka</label></button>
                        <button class="dr-btn-large" onclick="onAnalyzeRequested()"><span>🧐</span><label>Analisis</label></button>
                    </div>
                    <div class="dr-grp-title">Legal AI Tools</div>
                </div>
            </div>

            <!-- 3. Split Main Area -->
            <div class="dr-main-split">
                <!-- Editor Sisi Kiri -->
                <div class="dr-editor-canvas">
                    <div class="dr-page-a4" id="a4Page">
                        <div class="dr-editable-content" id="drKonten" contenteditable="true">
                            <p style="text-align:center"><b>[JUDUL DOKUMEN]</b></p>
                            <p style="text-align:center">Nomor: [NOMOR_SURAT]</p>
                            <br>
                            <p>Mulai ketik draf hukum Anda di sini...</p>
                        </div>
                    </div>
                </div>

                <!-- AI Sidebar Sisi Kanan -->
                <div class="dr-ai-sidebar">
                    <div class="ai-header">
                        <span style="font-size:1.2rem">🤖</span>
                        <div style="display:flex; flex-direction:column">
                            <span style="font-weight:bold; font-size:0.85rem">Legal Brain AI</span>
                            <span style="font-size:0.6rem; color:#4caf50">● ONLINE</span>
                        </div>
                    </div>
                    <div class="ai-chat-history" id="aiChatBox">
                        <div class="ai-bubble">
                            Halo! Saya <b>AI Legal Assistant</b>. Saya bisa membantu Anda membuat pasal, menganalisis risiko hukum, atau meninjau draf Anda secara real-time.
                        </div>
                    </div>
                    <div class="ai-input-panel">
                        <textarea class="ai-prompt-box" id="aiPrompt" placeholder="Ketik perintah (cth: Buat pasal kerahasiaan...)"></textarea>
                        <div class="ai-actions-row">
                            <button class="btn btn-xs btn-primary" style="flex:1" onclick="discussWithAI()">Kirim</button>
                            <button class="btn btn-xs btn-info" style="flex:1" onclick="onAnalyzeRequested()">Analisis</button>
                        </div>
                        <button class="btn-terapkan" onclick="executeAIDraft()">⚡ TERAPKAN KE DOKUMEN</button>
                    </div>
                </div>
            </div>

            <input type="file" id="drFileImport" style="display:none" accept=".txt,.html" onchange="importToEditor(this)">
        </div>
    `, true);
}

// ── 4. ACTION LOGIC (The 'Interaction' Part) ─────────────────────────────────

function formatDoc(cmd, val) {
    document.execCommand(cmd, false, val);
    document.getElementById("drKonten").focus();
}

window.adjustFontSize = function(delta) {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const currentSize = document.queryCommandValue("fontSize") || "3";
    const nextSize = Math.max(1, Math.min(7, parseInt(currentSize) + delta));
    formatDoc('fontSize', nextSize.toString());
};

window.onAnalyzeRequested = function() {
    const content = document.getElementById("drKonten").innerText;
    if (content.length < 20) return toast("Dokumen terlalu pendek untuk dianalisis", "warning");

    const chatBox = document.getElementById("aiChatBox");
    chatBox.innerHTML += `<div class="ai-bubble" style="background:#fff3e0; border-color:#ffe0b2; color:#e65100">🔍 Menganalisis risiko hukum pada draf Anda...</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;

    setTimeout(() => {
        chatBox.innerHTML += `<div class="ai-bubble"><b>Review AI:</b> Draf Anda terlihat standar. Namun, pastikan Pasal 'Penyelesaian Sengketa' mencantumkan domisili hukum yang spesifik di Pengadilan Negeri setempat.</div>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 1500);
};

window.discussWithAI = function() {
    const p = document.getElementById("aiPrompt").value.trim();
    if (!p) return;

    const chatBox = document.getElementById("aiChatBox");
    chatBox.innerHTML += `<div style="align-self:flex-end; background:#2b579a; color:#fff; padding:10px; border-radius:8px 8px 2px 8px; font-size:0.8rem; max-width:85%">${escHtml(p)}</div>`;
    document.getElementById("aiPrompt").value = "";
    chatBox.scrollTop = chatBox.scrollHeight;

    setTimeout(() => {
        const drafPasal = "<b>PASAL X: KERAHASIAAN</b><br>Seluruh informasi yang dipertukarkan dalam perjanjian ini bersifat rahasia dan tidak boleh dibocorkan kepada pihak ketiga tanpa persetujuan tertulis...";
        window._lastAIDraft = drafPasal;
        chatBox.innerHTML += `<div class="ai-bubble">Saran klausul telah siap. Klik 'Terapkan' untuk memasukkannya ke dokumen.</div>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 1000);
};

window.executeAIDraft = function() {
    if (!window._lastAIDraft) return toast("Belum ada saran AI untuk diterapkan", "warning");
    const editor = document.getElementById("drKonten");
    editor.innerHTML += `<br>${window._lastAIDraft}`;
    toast("Klausul AI dimasukkan!", "success");
    window._lastAIDraft = null;
};

window.importToEditor = function(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => { document.getElementById("drKonten").innerHTML = e.target.result; };
    reader.readAsText(file);
};

// ── 5. SENGKETA & KASUS HUKUM (Fixed Dashboard) ─────────────────────────────

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
                    <option value="PHI">PHI (Hub. Industrial)</option>
                    <option value="Internal">Internal / Disiplin</option>
                </select>
            </div>
            <div class="form-group"><label>Status</label><select class="form-control" id="skStatus"><option>Baru</option><option>Proses</option><option>Mediasi</option><option>Selesai</option></select></div>
        </div>
        <div class="form-group"><label>Pihak Terkait</label><input class="form-control" id="skPihak" placeholder="Nama orang / lembaga"></div>
        <div class="form-group"><label>Kronologi / Deskripsi</label><textarea class="form-control" id="skKronologi" style="min-height:100px"></textarea></div>
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
        createdBy: currentUser.nama,
        createdAt: new Date().toISOString()
    };
    if(!data.judul || !data.pihak) return toast("Lengkapi data", "warning");
    await db.collection("hrd_legal_sengketa").add(data);
    closeModalDirect(); renderLegalSengketa();
}

async function viewSengketaDetail(id) {
    const doc = await db.collection("hrd_legal_sengketa").doc(id).get();
    const p = doc.data();
    openModal(`<div class="modal-title">👁️ Detail Kasus: ${escHtml(p.judul)}</div>
        <div style="background:#f8f9ff; padding:12px; border-radius:8px; margin-bottom:12px; font-size:0.85rem">
            <div><b>Kategori:</b> ${p.kategori} | <b>Pihak:</b> ${p.pihak}</div>
            <div><b>Status:</b> ${p.status}</div>
        </div>
        <div class="text-sm" style="white-space:pre-wrap; border:1px solid #ddd; padding:10px; border-radius:4px">${escHtml(p.kronologi)}</div>`, true);
}

async function hapusSengketa(id) {
    if(!confirm("Hapus catatan sengketa ini?")) return;
    await db.collection("hrd_legal_sengketa").doc(id).delete();
    toast("Dihapus", "success");
    renderLegalSengketa();
}

// ── 6. SISTEM TIKET (Remaining Logic) ───────────────────────────────────────

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
