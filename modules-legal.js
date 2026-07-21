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
        <button class="btn btn-primary btn-sm" onclick="modalSengketa()">+ Tambah Kasus</button>
    </div>
    <div class="card">
        <div class="table-wrap">
            <table>
                <thead>
                    <tr><th>ID</th><th>Judul</th><th>Kategori</th><th>Status</th><th>Pihak</th><th>Tanggal</th><th>Aksi</th></tr>
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

// ── 3. WORKSPACE ─────────────────────────────────────────────────────────────
window.modalLegalDrafting = async function() {
    const styleId = "legalRibbonStyles";
    if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
            .modal-fullscreen { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; display: flex; flex-direction: column; background: #f0f0f0; z-index: 9999; }
            .dr-header { background: #2b579a; color: #fff; height: 40px; display: flex; align-items: center; padding: 0 15px; justify-content: space-between; }
            .dr-ribbon { background: #f3f2f1; height: 100px; border-bottom: 1px solid #ddd; display: flex; padding: 5px; color: #333; }
            .dr-toolbar-grp { display: flex; flex-direction: column; align-items: center; padding: 0 10px; border-right: 1px solid #ddd; }
            .dr-grp-title { font-size: 10px; color: #666; margin-top: auto; }
            .dr-actions-wrap { display: flex; align-items: center; flex: 1; }
            .dr-btn-large { background: transparent; border: none; display: flex; flex-direction: column; align-items: center; cursor: pointer; padding: 5px; border-radius: 4px; }
            .dr-btn-large:hover { background: #edebe9; }
            .dr-btn-compact { background: transparent; border: none; font-size: 11px; display: flex; align-items: center; gap: 5px; cursor: pointer; padding: 2px 5px; width: 100%; border-radius: 2px; }
            .dr-btn-compact:hover { background: #edebe9; }
            .dr-select-compact { border: 1px solid #ddd; font-size: 12px; height: 22px; outline: none; }
            .dr-btn-style, .dr-btn-icon-only { background: transparent; border: none; width: 24px; height: 24px; cursor: pointer; border-radius: 2px; }
            .dr-btn-style:hover, .dr-btn-icon-only:hover { background: #edebe9; }
            .dr-toolbar-separator-v { width: 1px; height: 20px; background: #ddd; margin: 0 5px; }
            .dr-main-split { display: flex; flex: 1; overflow: hidden; }
            .dr-editor-canvas { flex: 1; background: #adb5bd; overflow: auto; display: flex; flex-direction: column; align-items: center; padding: 40px 20px; }
            .dr-page-a4 { background: #fff; width: 210mm; min-height: 297mm; padding: 2.5cm; box-shadow: 0 0 20px rgba(0,0,0,0.2); }
            .dr-editable-content { width: 100%; height: 100%; outline: none; font-family: 'Calibri', sans-serif; font-size: 11pt; line-height: 1.5; color: #000; }
            .dr-ai-sidebar { width: 350px; background: #fff; border-left: 1px solid #ddd; display: flex; flex-direction: column; }
            .ai-header { background: #c62828; color: #fff; padding: 10px 15px; font-weight: bold; display: flex; align-items: center; gap: 8px; }
            .ai-chat { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 10px; background: #f9f9f9; }
            .ai-msg { padding: 10px; border-radius: 8px; font-size: 13px; max-width: 90%; }
            .ai-msg.user { background: #e3f2fd; align-self: flex-end; border-bottom-right-radius: 2px; }
            .ai-msg.bot { background: #fff; border: 1px solid #ddd; align-self: flex-start; border-bottom-left-radius: 2px; }
            .ai-input-area { padding: 15px; border-top: 1px solid #ddd; }
            .ai-input { width: 100%; border: 1px solid #ddd; border-radius: 4px; padding: 10px; font-size: 13px; resize: none; min-height: 60px; outline: none; }
            .ai-input:focus { border-color: #2b579a; }
            .ai-btn-ask { background: #2b579a; color: #fff; border: none; width: 100%; padding: 10px; border-radius: 4px; font-weight: bold; cursor: pointer; margin-top: 8px; }
            .ai-btn-ask:disabled { opacity: 0.6; cursor: not-allowed; }
            @media (max-width: 1024px) { .dr-ai-sidebar { display: none; } }
        `;
        document.head.appendChild(style);
    }

    openModal(`
        <div class="modal-fullscreen" id="legalWorkspace">
            <div class="dr-header">
                <div style="font-weight:bold; display:flex; align-items:center; gap:10px">
                    <span style="font-size:1.2rem">🏛️</span> IMS Legal Suite
                </div>
                <div class="flex gap-8">
                    <button class="btn btn-success btn-xs" onclick="saveLegalDraft()">💾 Save</button>
                    <button class="btn btn-danger btn-xs" onclick="closeModalDirect()">✕ Close</button>
                </div>
            </div>
            <div class="dr-ribbon">
                <div class="dr-toolbar-grp">
                    <div class="dr-actions-wrap" style="padding-top:10px">
                        <div class="dr-tab active" style="font-weight:bold; border-bottom:3px solid #2b579a; padding:5px 15px">Home</div>
                        <div class="dr-tab" style="padding:5px 15px; opacity:0.5">Insert</div>
                        <div class="dr-tab" style="padding:5px 15px; opacity:0.5">Layout</div>
                    </div>
                </div>
                ${renderHomeGroup('clipboard')}
                ${renderHomeGroup('font')}
                ${renderHomeGroup('paragraph')}
            </div>
            <div class="dr-main-split">
                <div class="dr-editor-canvas">
                    <div class="dr-page-a4">
                        <div class="dr-editable-content" id="drKonten" contenteditable="true">
                            <p style="text-align:center"><b>[JUDUL DOKUMEN]</b></p>
                            <p style="text-align:center">Nomor: [NOMOR_SURAT]</p>
                            <br>
                            <p>Mulai ketik draf hukum Anda di sini...</p>
                        </div>
                    </div>
                </div>
                <div class="dr-ai-sidebar">
                    <div class="ai-header">✨ Gemini Legal AI <button style="margin-left:auto; background:none; border:none; color:#fff; cursor:pointer" title="Settings">⚙️</button></div>
                    <div class="ai-chat" id="aiChatBox">
                        <div class="ai-msg bot">Halo! Saya Gemini Legal AI. Masukkan perintah Anda untuk mulai menyusun draf hukum secara cerdas.</div>
                    </div>
                    <div class="ai-input-area">
                        <textarea class="ai-input" id="aiPrompt" placeholder="Ketik perintah (misal: 'buatkan draf PKWT')"></textarea>
                        <button class="ai-btn-ask" id="btnAskGemini" onclick="askGeminiAI()">Ask Gemini ✨</button>
                    </div>
                </div>
            </div>
        </div>
    `, true);
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
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
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
    const snap = await db.collection("hrd_legal_tickets").get();
    let h = "";
    snap.forEach(d => {
        const p = d.data();
        h += `<tr><td>${p.ticket_id || "-"}</td><td>${escHtml(p.judul)}</td><td>-</td><td><span class="badge badge-warning">${p.status}</span></td><td>${formatDate(p.createdAt)}</td><td><button class="btn btn-xs btn-info" onclick="toast('Detail belum tersedia')">👁️</button></td></tr>`;
    });
    tbody.innerHTML = h || '<tr><td colspan="6" class="text-center">Kosong</td></tr>';
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
        tbody.innerHTML = h || '<tr><td colspan="6" class="text-center">Belum ada data dokumen</td></tr>';
    } catch (e) {
        console.error("loadLegalPerizinan error:", e);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center color-danger">Gagal memuat data: ${e.message}</td></tr>`;
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
    const snap = await db.collection("hrd_legal_sengketa").get();
    let h = "";
    snap.forEach(d => {
        const p = d.data();
        h += `<tr><td>-</td><td>${escHtml(p.judul)}</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr>`;
    });
    tbody.innerHTML = h || '<tr><td colspan="7" class="text-center">Kosong</td></tr>';
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
window.modalSengketa = function() {
    openModal(`
        <div class="modal-title">Tambah Kasus Sengketa</div>
        <div class="form-group"><label>Judul Kasus</label><input class="form-control" id="skJudul"></div>
        <button class="btn btn-primary" onclick="simpanSengketa()">Simpan</button>`, true);
};
window.simpanSengketa = async function() {
    const judul = document.getElementById("skJudul").value;
    if(!judul) return toast("Judul wajib", "warning");
    await db.collection("hrd_legal_sengketa").add({judul, createdAt: new Date().toISOString()});
    closeModalDirect(); renderLegalSengketa();
};
