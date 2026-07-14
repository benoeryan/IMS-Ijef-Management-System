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
                    <button class="dr-btn-large" onclick="window.formatDoc('paste')" title="Tempel">
                        <span style="font-size:1.8rem">📋</span>
                        <label>Tempel</label>
                    </button>
                    <div class="dr-stacked-tools">
                        <button class="dr-btn-compact" onclick="window.formatDoc('cut')" title="Potong">✂️<span>Potong</span></button>
                        <button class="dr-btn-compact" onclick="window.formatDoc('copy')" title="Salin">📑<span>Salin</span></button>
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
                        <select class="dr-select-compact" id="fontName" onchange="window.formatDoc('fontName', this.value)" style="width:110px">
                            <option>Times New Roman</option><option>Arial</option><option>Cambria</option><option>Calibri</option><option>Bookman Old Style</option><option>Tahoma</option>
                        </select>
                        <select class="dr-select-compact" id="fontSize" onchange="window.formatDoc('fontSize', this.value)" style="width:50px">
                            <option value="2">10</option><option value="3" selected>12</option><option value="4">14</option><option value="5">18</option>
                        </select>
                        <div class="dr-toolbar-separator-v"></div>
                        <button class="dr-btn-icon-only" onclick="window.adjustFontSize(1)">A<sup>+</sup></button>
                        <button class="dr-btn-icon-only" onclick="window.adjustFontSize(-1)">A<sup>-</sup></button>
                    </div>
                    <!-- Bottom Row: Styles -->
                    <div style="display:flex; align-items:center; gap:2px">
                        <button class="dr-btn-style" onclick="window.formatDoc('bold')" title="Bold"><b>B</b></button>
                        <button class="dr-btn-style" onclick="window.formatDoc('italic')" title="Italic"><i>I</i></button>
                        <button class="dr-btn-style" onclick="window.formatDoc('underline')" title="Underline"><u>U</u></button>
                        <button class="dr-btn-style" onclick="window.formatDoc('strikeThrough')"><s>abc</s></button>
                        <div class="dr-toolbar-separator-v"></div>
                        <div class="dr-color-picker-wrap">
                            <input type="color" onchange="window.formatDoc('foreColor', this.value)" title="Warna Font">
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
                        <button class="dr-btn-icon-only" onclick="window.formatDoc('insertUnorderedList')">•≡</button>
                        <button class="dr-btn-icon-only" onclick="window.formatDoc('insertOrderedList')">1≡</button>
                        <div class="dr-toolbar-separator-v"></div>
                        <button class="dr-btn-icon-only" onclick="window.formatDoc('outdent')">←┥</button>
                        <button class="dr-btn-icon-only" onclick="window.formatDoc('indent')">┝→</button>
                    </div>
                    <div style="display:flex; gap:2px">
                        <button class="dr-btn-icon-only" onclick="window.formatDoc('justifyLeft')">≡</button>
                        <button class="dr-btn-icon-only" onclick="window.formatDoc('justifyCenter')">≣</button>
                        <button class="dr-btn-icon-only" onclick="window.formatDoc('justifyRight')">≡</button>
                        <button class="dr-btn-icon-only" onclick="window.formatDoc('justifyFull')">≡</button>
                    </div>
                </div>
                <div class="dr-grp-title">Paragraf</div>
            </div>`;
    }
}

// ── 3. MAIN WORKSPACE (The 'Main' Part) ──────────────────────────────────────

window.modalLegalDrafting = async function() {
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
                padding: 1cm 2.5cm; box-shadow: 0 0 15px rgba(0,0,0,0.5); position: relative;
                transform-origin: top center; display: flex; flex-direction: column;
            }
            .dr-header-area {
                height: 30mm; border-bottom: 1px dashed #ddd; margin-bottom: 10px;
                font-size: 9pt; color: #666; outline: none; padding: 5px;
            }
            .dr-footer-area {
                height: 20mm; border-top: 1px dashed #ddd; margin-top: auto;
                font-size: 9pt; color: #666; outline: none; padding: 5px;
            }
            .dr-editable-content {
                flex: 1; width: 100%; outline: none;
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
                <div class="dr-tab active" onclick="window.switchTab('home', event)">Beranda</div>
                <div class="dr-tab" onclick="window.switchTab('insert', event)">Sisipkan</div>
                <div class="dr-tab" onclick="window.switchTab('layout', event)">Tata Letak</div>
                <div class="dr-tab" onclick="window.switchTab('reference', event)">Referensi</div>
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
                        <button class="dr-btn-large" onclick="window.onAnalyzeRequested()"><span>🧐</span><label>Analisis</label></button>
                    </div>
                    <div class="dr-grp-title">Legal AI Tools</div>
                </div>
            </div>

            <!-- 3. Split Main Area -->
            <div class="dr-main-split">
                <!-- Editor Sisi Kiri -->
                <div class="dr-editor-canvas">
                    <div class="dr-page-a4" id="a4Page">
                        <div class="dr-header-area" id="drHeader" contenteditable="true" style="font-size:9pt; color:#999; border-bottom:1px dashed #ddd; margin-bottom:10px; min-height:20mm">Ketik Header di sini...</div>
                        <div class="dr-editable-content" id="drKonten" contenteditable="true">
                            <p style="text-align:center"><b>[JUDUL DOKUMEN]</b></p>
                            <p style="text-align:center">Nomor: [NOMOR_SURAT]</p>
                            <br>
                            <p>Mulai ketik draf hukum Anda di sini...</p>
                        </div>
                        <div class="dr-footer-area" id="drFooter" contenteditable="true" style="font-size:9pt; color:#999; border-top:1px dashed #ddd; margin-top:15px; min-height:15mm">Ketik Footer di sini...</div>
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
                            <button class="btn btn-xs btn-primary" style="flex:1" onclick="window.discussWithAI()">Kirim</button>
                            <button class="btn btn-xs btn-info" style="flex:1" onclick="window.onAnalyzeRequested()">Analisis</button>
                        </div>
                        <button class="btn-terapkan" onclick="window.executeAIDraft()">⚡ TERAPKAN KE DOKUMEN</button>
                    </div>
                </div>
            </div>

            <input type="file" id="drFileImport" style="display:none" accept=".txt,.html" onchange="window.importToEditor(this)">
            <input type="file" id="drImgImport" style="display:none" accept="image/jpeg,image/png" onchange="window.uploadDrImage(this)">
        </div>
    `, true);
}

// ── 4. ACTION LOGIC (The 'Interaction' Part) ─────────────────────────────────

window.formatDoc = function(cmd, val) {
    document.execCommand(cmd, false, val);
    const editor = document.getElementById("drKonten");
    if (editor) editor.focus();
}

window.uploadDrImage = function(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const html = `<img src="${e.target.result}" style="max-width:100%; height:auto; margin:10px 0">`;
        window.formatDoc('insertHTML', html);
    };
    reader.readAsDataURL(file);
    input.value = ""; // Reset for next use
};

window.switchTab = function(tabId, event) {
    document.querySelectorAll('.dr-tab').forEach(t => t.classList.remove('active'));
    if (event) event.currentTarget.classList.add('active');

    // Hide all ribbons first (if multiple)
    // Currently only one ribbon is implemented in HTML, we swap content
    const ribbon = document.getElementById("ribbonHome");
    if (tabId === 'home') {
        ribbon.innerHTML = `
            ${renderHomeGroup('clipboard')}
            ${renderHomeGroup('font')}
            ${renderHomeGroup('paragraph')}
            <div class="dr-toolbar-grp">
                <div class="dr-actions-wrap" style="gap:6px">
                    <button class="dr-btn-large" onclick="alert('Library')"><span>📚</span><label>Pustaka</label></button>
                    <button class="dr-btn-large" onclick="window.onAnalyzeRequested()"><span>🧐</span><label>Analisis</label></button>
                </div>
                <div class="dr-grp-title">Legal AI Tools</div>
            </div>`;
    } else if (tabId === 'insert') {
        ribbon.innerHTML = `
            <div class="dr-toolbar-grp">
                <div class="dr-actions-wrap" style="gap:4px">
                    <button class="dr-btn-large" onclick="window.insertDrTable()">
                        <span style="font-size:1.8rem">📊</span>
                        <label>Tabel</label>
                    </button>
                    <button class="dr-btn-large" onclick="document.getElementById('drImgImport').click()">
                        <span style="font-size:1.8rem">🖼️</span>
                        <label>Gambar</label>
                    </button>
                </div>
                <div class="dr-grp-title">Sisipkan</div>
            </div>`;
    } else if (tabId === 'layout') {
        ribbon.innerHTML = `
            <div class="dr-toolbar-grp">
                <div class="dr-actions-wrap" style="gap:4px">
                    <button class="dr-btn-compact" onclick="window.setDrMargins('2.5cm')">Standard (2.5cm)</button>
                    <button class="dr-btn-compact" onclick="window.setDrMargins('1cm')">Narrow (1cm)</button>
                </div>
                <div class="dr-grp-title">Margin</div>
            </div>
            <div class="dr-toolbar-grp">
                <div class="dr-actions-wrap" style="gap:4px">
                    <button class="dr-btn-compact" onclick="window.setDrOrientation('portrait')">📄 Potret</button>
                    <button class="dr-btn-compact" onclick="window.setDrOrientation('landscape')">📑 Lanskap</button>
                </div>
                <div class="dr-grp-title">Orientasi</div>
            </div>`;
    } else if (tabId === 'reference') {
        ribbon.innerHTML = `
            <div class="dr-toolbar-grp">
                <div class="dr-actions-wrap" style="gap:4px">
                    <button class="dr-btn-large" onclick="window.formatDoc('insertHTML', '<p style=\'text-align:center\'><b>DAFTAR ISI</b></p><br>')">
                        <span>📑</span><label>Daftar Isi</label>
                    </button>
                    <button class="dr-btn-large" onclick="window.formatDoc('insertHTML', '<p><sup>[1]</sup> </p>')">
                        <span>📝</span><label>Catatan Kaki</label>
                    </button>
                </div>
                <div class="dr-grp-title">Referensi Hukum</div>
            </div>`;
    }
}

window.setDrMargins = function(val) {
    document.getElementById("a4Page").style.padding = val;
};

window.setDrOrientation = function(mode) {
    const page = document.getElementById("a4Page");
    if (mode === 'landscape') {
        page.style.width = "297mm";
        page.style.minHeight = "210mm";
    } else {
        page.style.width = "210mm";
        page.style.minHeight = "297mm";
    }
};

window.insertDrTable = function() {
    const rows = prompt("Jumlah Baris:", "3");
    const cols = prompt("Jumlah Kolom:", "3");
    if (!rows || !cols) return;

    let html = '<table style="width:100%; border-collapse:collapse; border:1px solid #000; margin:10px 0">';
    for (let i = 0; i < rows; i++) {
        html += '<tr>';
        for (let j = 0; j < cols; j++) {
            html += '<td style="border:1px solid #000; padding:5px; height:25px"></td>';
        }
        html += '</tr>';
    }
    html += '</table>';
    window.formatDoc('insertHTML', html);
}

window.adjustFontSize = function(delta) {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const currentSize = document.queryCommandValue("fontSize") || "3";
    const nextSize = Math.max(1, Math.min(7, parseInt(currentSize) + delta));
    window.formatDoc('fontSize', nextSize.toString());
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

window.importToEditor = function() {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => { document.getElementById("drKonten").innerHTML = e.target.result; };
    reader.readAsText(file);
};

// ── 5. SENGKETA & KASUS HUKUM (Fixed Dashboard) ─────────────────────────────

window.renderLegalSengketa = async function() {
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
    window.loadLegalSengketa();
}

window.loadLegalSengketa = async function() {
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

window.modalSengketa = function() {
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
        <button class="btn btn-primary" onclick="window.simpanSengketa()">💾 Simpan Kasus</button>
    `, true);
}

window.simpanSengketa = async function() {
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
    closeModalDirect(); window.renderLegalSengketa();
}

window.viewSengketaDetail = async function(id) {
    const doc = await db.collection("hrd_legal_sengketa").doc(id).get();
    const p = doc.data();
    openModal(`<div class="modal-title">👁️ Detail Kasus: ${escHtml(p.judul)}</div>
        <div style="background:#f8f9ff; padding:12px; border-radius:8px; margin-bottom:12px; font-size:0.85rem">
            <div><b>Kategori:</b> ${p.kategori} | <b>Pihak:</b> ${p.pihak}</div>
            <div><b>Status:</b> ${p.status}</div>
        </div>
        <div class="text-sm" style="white-space:pre-wrap; border:1px solid #ddd; padding:10px; border-radius:4px">${escHtml(p.kronologi)}</div>`, true);
}

window.hapusSengketa = async function(id) {
    if(!confirm("Hapus catatan sengketa ini?")) return;
    await db.collection("hrd_legal_sengketa").doc(id).delete();
    toast("Dihapus", "success");
    window.renderLegalSengketa();
}

// ── 6. SISTEM TIKET (Remaining Logic) ───────────────────────────────────────

window.renderKajianHukum = async function() {
    const main = document.getElementById("mainContent");
    main.innerHTML = `
    <div class="page-title">
        <span>🔨 Kajian Hukum / Tiket</span>
        <div class="flex gap-8">
            <button class="btn btn-outline btn-sm" onclick="window.modalLegalDrafting()">✍️ Buat Draft</button>
            <button class="btn btn-primary btn-sm" onclick="window.modalKajianHukum()">+ Buat Tiket</button>
        </div>
    </div>
    <div class="card">
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>ID Tiket</th>
                        <th>Judul</th>
                        <th>Departemen</th>
                        <th>Status</th>
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
    window.loadLegalTickets();
}

window.loadLegalTickets = async function() {
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
            html += `<tr><td class="fw-700">${escHtml(p.ticket_id)}</td><td>${escHtml(p.judul)}</td><td>${escHtml(p.departemen || "-")}</td><td>${p.status}</td><td>${formatDate(p.createdAt)}</td><td>
                <button class="btn btn-xs btn-info" onclick="viewLegalTicketDetail('${doc.id}')">👁️</button>
                <button class="btn btn-xs btn-danger" onclick="hapusLegalTicket('${doc.id}')">🗑️</button>
            </td></tr>`;
        });
        tbody.innerHTML = html;
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center">Error: ${e.message}</td></tr>`;
    }
}

window.modalKajianHukum = function() {
    openModal(`
        <div class="modal-title">🔨 Buat Tiket Kajian Hukum</div>
        <div class="form-group"><label>Judul Kajian</label><input class="form-control" id="lgJudul"></div>
        <div class="form-group"><label>Deskripsi</label><textarea class="form-control" id="lgDesc" style="min-height:120px"></textarea></div>
        <button class="btn btn-primary" onclick="window.simpanKajianHukum()">📤 Kirim</button>
    `, true);
}

window.simpanKajianHukum = async function() {
    const judul = document.getElementById("lgJudul").value.trim();
    const desc = document.getElementById("lgDesc").value.trim();
    if (!judul || !desc) return toast("Lengkapi data", "warning");
    const data = {
        ticket_id: `LGL-${Date.now().toString().slice(-6)}`,
        judul, deskripsi: desc, departemen: currentUser.departemen || '',
        pemohon: currentUser.nama, status: "pending", createdAt: new Date().toISOString()
    };
    await db.collection("hrd_legal_tickets").add(data);
    closeModalDirect(); window.renderKajianHukum();
}

window.viewLegalTicketDetail = async function(docId) {
    const doc = await db.collection("hrd_legal_tickets").doc(docId).get();
    const p = doc.data();
    openModal(`<div class="modal-title">📄 Detail Tiket</div><div class="text-sm">${escHtml(p.deskripsi)}</div>`, true);
}

window.hapusLegalTicket = async function(id) {
    if(!confirm("Hapus tiket ini?")) return;
    await db.collection("hrd_legal_tickets").doc(id).delete();
    toast("Tiket dihapus", "success");
    window.renderKajianHukum();
}

// ── 7. LEGALITAS & PERIZINAN (Restored) ──────────────────────────────────────

window.renderLegalPerizinan = async function() {
    const main = document.getElementById("mainContent");
    main.innerHTML = `
    <div class="page-title">
        <span>⚖️ Legalitas & Perizinan</span>
        <button class="btn btn-primary btn-sm" onclick="modalPerizinan()">+ Tambah Dokumen</button>
    </div>
    <div class="card">
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Nama Dokumen</th>
                        <th>Nomor</th>
                        <th>Instansi Penerbit</th>
                        <th>Masa Berlaku</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody id="tblLegalPerizinan">
                    <tr><td colspan="6" class="text-center">Memuat data...</td></tr>
                </tbody>
            </table>
        </div>
    </div>`;
    window.loadLegalPerizinan();
}

window.loadLegalPerizinan = async function() {
    const tbody = document.getElementById("tblLegalPerizinan");
    try {
        const snap = await db.collection("hrd_legal_perizinan").orderBy("createdAt", "desc").get();
        let html = "";
        if (snap.empty) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Belum ada dokumen perizinan.</td></tr>';
            return;
        }
        const today = new Date().toISOString().split('T')[0];
        snap.forEach((doc) => {
            const p = doc.data();
            const isExpired = p.tglAkhir && p.tglAkhir < today;
            const statusBadge = isExpired ? 'danger' : 'success';
            html += `<tr>
                <td class="fw-700">${escHtml(p.nama)}</td>
                <td>${escHtml(p.nomor || "-")}</td>
                <td>${escHtml(p.instansi || "-")}</td>
                <td>${formatDate(p.tglAkhir)}</td>
                <td><span class="badge badge-${statusBadge}">${isExpired ? 'Expired' : 'Aktif'}</span></td>
                <td>
                    <button class="btn btn-xs btn-info" onclick="viewPerizinanDetail('${doc.id}')">👁️</button>
                    <button class="btn btn-xs btn-danger" onclick="hapusPerizinan('${doc.id}')">🗑️</button>
                </td>
            </tr>`;
        });
        tbody.innerHTML = html;
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center">Error: ${e.message}</td></tr>`;
    }
}

window.modalPerizinan = function() {
    openModal(`
        <div class="modal-title">⚖️ Tambah Dokumen Perizinan / Legalitas</div>
        <div class="form-group"><label>Nama Dokumen (NIB, SIUP, dll)</label><input class="form-control" id="pzNama"></div>
        <div class="form-group"><label>Nomor Dokumen</label><input class="form-control" id="pzNomor"></div>
        <div class="form-group"><label>Instansi Penerbit</label><input class="form-control" id="pzInstansi"></div>
        <div class="grid-2">
            <div class="form-group"><label>Tanggal Terbit</label><input class="form-control" type="date" id="pzMulai"></div>
            <div class="form-group"><label>Masa Berlaku Berakhir</label><input class="form-control" type="date" id="pzAkhir"></div>
        </div>
        <div class="form-group"><label>Keterangan Tambahan</label><textarea class="form-control" id="pzKet" style="min-height:80px"></textarea></div>
        <button class="btn btn-primary" onclick="window.simpanPerizinan()">💾 Simpan Dokumen</button>
    `, true);
}

window.simpanPerizinan = async function() {
    const nama = document.getElementById("pzNama").value.trim();
    if(!nama) return toast("Nama dokumen wajib diisi", "warning");

    const data = {
        nama,
        nomor: document.getElementById("pzNomor").value,
        instansi: document.getElementById("pzInstansi").value,
        tglMulai: document.getElementById("pzMulai").value,
        tglAkhir: document.getElementById("pzAkhir").value,
        keterangan: document.getElementById("pzKet").value,
        createdBy: currentUser.nama,
        createdAt: new Date().toISOString()
    };

    try {
        await db.collection("hrd_legal_perizinan").add(data);
        toast("Dokumen legalitas berhasil disimpan", "success");
        closeModalDirect();
        window.renderLegalPerizinan();
    } catch (e) {
        toast("Gagal: " + e.message, "error");
    }
}

window.viewPerizinanDetail = async function(id) {
    const doc = await db.collection("hrd_legal_perizinan").doc(id).get();
    const p = doc.data();
    openModal(`
        <div class="modal-title">👁️ Detail Dokumen: ${escHtml(p.nama)}</div>
        <div class="grid-2 mb-16" style="background:#f8f9ff; padding:15px; border-radius:8px">
            <div><b>Nomor:</b> ${escHtml(p.nomor || "-")}</div>
            <div><b>Penerbit:</b> ${escHtml(p.instansi || "-")}</div>
            <div><b>Berlaku s/d:</b> ${formatDate(p.tglAkhir)}</div>
            <div><b>Status:</b> ${new Date().toISOString().split('T')[0] > p.tglAkhir ? 'Expired' : 'Aktif'}</div>
        </div>
        <div class="mb-16">
            <b>Keterangan:</b>
            <div style="white-space:pre-wrap; border:1px solid #ddd; padding:10px; border-radius:5px; margin-top:8px; font-size:0.9rem">${escHtml(p.keterangan || "-")}</div>
        </div>
        <button class="btn btn-outline btn-sm" onclick="closeModalDirect()">Tutup</button>
    `, true);
}

window.hapusPerizinan = async function(id) {
    if(!confirm("Hapus catatan dokumen ini?")) return;
    await db.collection("hrd_legal_perizinan").doc(id).delete();
    toast("Dihapus", "success");
    window.renderLegalPerizinan();
}
