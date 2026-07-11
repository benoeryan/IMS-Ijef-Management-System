"use strict";

/**
 * MODULES-LEGAL.JS
 * Modul untuk fitur Legal Internal & Eksternal
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

    // Inject styles for Word-like interface
    const styleId = "legalDraftingStyles";
    if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
            .word-container {
                background: #525659;
                padding: 40px 20px;
                display: flex;
                justify-content: center;
                overflow-y: auto;
                max-height: 600px;
                border-radius: 8px;
            }
            .word-page {
                background: white;
                width: 210mm; /* A4 width */
                min-height: 297mm; /* A4 height */
                padding: 2.5cm 2.5cm 2cm 2.5cm;
                box-shadow: 0 0 10px rgba(0,0,0,0.5);
                display: flex;
                flex-direction: column;
                position: relative;
                color: #000;
            }
            .word-editor {
                border: 1px solid #eee;
                width: 100%;
                min-height: 20cm;
                flex: 1;
                font-family: 'Times New Roman', serif;
                font-size: 11pt;
                line-height: 1.5;
                outline: none;
                padding: 10px;
                margin-top: 10px;
                background: #fff;
                text-align: justify;
                overflow: hidden;
            }
            .word-toolbar {
                background: #f3f3f3;
                border: 1px solid #ddd;
                border-bottom: none;
                border-radius: 8px 8px 0 0;
                padding: 5px;
                display: flex;
                flex-wrap: wrap;
                gap: 2px;
                align-items: center;
                position: sticky;
                top: 0;
                z-index: 10;
            }
            .toolbar-grp {
                display: flex;
                align-items: center;
                gap: 2px;
                padding: 0 5px;
                border-right: 1px solid #ccc;
            }
            .toolbar-grp:last-child { border-right: none; }
            .toolbar-btn {
                background: transparent;
                border: 1px solid transparent;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.85rem;
                display: flex;
                align-items: center;
                justify-content: center;
                min-width: 28px;
                color: #333;
            }
            .toolbar-btn:hover { background: #e0e0e0; border-color: #bbb; }
            .toolbar-btn.active { background: #d0d0d0; border-color: #999; }
            .toolbar-select {
                padding: 2px 4px;
                border-radius: 4px;
                border: 1px solid #ccc;
                font-size: 0.75rem;
                background: #fff;
            }
            .word-kop-preview {
                display: none; /* Default hidden */
                border-bottom: 2px solid #000;
                padding-bottom: 10px;
                margin-bottom: 20px;
                align-items: center;
            }
            .word-kop-preview.active { display: flex; }
        `;
        document.head.appendChild(style);
    }

    // Load Data Perusahaan for KOP Preview
    let cp = { nama: "LPK IJEF CORP", alamat: "Bandung Barat", telp: "-", email: "-", logo: "" };
    try {
        const doc = await db.collection("hrd_settings").doc("perusahaan").get();
        if (doc.exists) cp = { ...cp, ...doc.data() };
    } catch (e) {}

    openModal(`
        <div class="modal-title" style="display:flex; justify-content:space-between; align-items:center">
            <span>✍️ Legal Drafting Workspace</span>
            <div class="flex gap-8">
                <span class="badge badge-success" style="font-size:0.6rem">🤖 AI ASSISTANT ENABLED</span>
                <button class="btn btn-xs btn-outline" onclick="closeModalDirect()">✕</button>
            </div>
        </div>

        <div style="display:grid; grid-template-columns: 2.2fr 1fr; gap:20px; height: 80vh">
            <!-- LEFT: WORD EDITOR -->
            <div style="display:flex; flex-direction:column; overflow:hidden">
                <!-- TOOLBAR (WORD STYLE) -->
                <div class="word-toolbar">
                    <div class="toolbar-grp">
                        <button class="toolbar-btn" onclick="formatDoc('undo')" title="Undo">⟲</button>
                        <button class="toolbar-btn" onclick="formatDoc('redo')" title="Redo">⟳</button>
                    </div>
                    <div class="toolbar-grp">
                        <select class="toolbar-select" onchange="formatDoc('fontName', this.value)" style="width:100px">
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Arial">Arial</option>
                            <option value="Cambria">Cambria</option>
                            <option value="Calibri">Calibri</option>
                        </select>
                        <select class="toolbar-select" onchange="formatDoc('fontSize', this.value)" style="width:50px">
                            <option value="3">12</option>
                            <option value="2">10</option>
                            <option value="4">14</option>
                            <option value="5">18</option>
                            <option value="6">24</option>
                        </select>
                    </div>
                    <div class="toolbar-grp">
                        <button class="toolbar-btn" onclick="formatDoc('bold')" title="Bold"><b>B</b></button>
                        <button class="toolbar-btn" onclick="formatDoc('italic')" title="Italic"><i>I</i></button>
                        <button class="toolbar-btn" onclick="formatDoc('underline')" title="Underline"><u>U</u></button>
                    </div>
                    <div class="toolbar-grp">
                        <input type="color" onchange="formatDoc('foreColor', this.value)" title="Text Color" style="width:25px;height:25px;border:none;background:transparent;cursor:pointer">
                        <button class="toolbar-btn" onclick="formatDoc('removeFormat')" title="Clear Formatting">⌫</button>
                    </div>
                    <div class="toolbar-grp">
                        <button class="toolbar-btn" onclick="formatDoc('justifyLeft')" title="Align Left">≡</button>
                        <button class="toolbar-btn" onclick="formatDoc('justifyCenter')" title="Align Center">≣</button>
                        <button class="toolbar-btn" onclick="formatDoc('justifyRight')" title="Align Right">≡</button>
                        <button class="toolbar-btn" onclick="formatDoc('justifyFull')" title="Justify">≡</button>
                    </div>
                    <div class="toolbar-grp">
                        <button class="toolbar-btn" onclick="formatDoc('insertUnorderedList')" title="Bullets">•</button>
                        <button class="toolbar-btn" onclick="formatDoc('insertOrderedList')" title="Numbering">1.</button>
                    </div>
                </div>

                <div class="word-container" style="flex:1">
                    <div class="word-page" id="wordPage">
                        <!-- KOP PREVIEW -->
                        <div class="word-kop-preview active" id="kopPreview">
                            <img src="${cp.logo || 'icon-ijef-v3.png'}" style="width:60px; height:60px; object-fit:contain; margin-right:15px">
                            <div style="flex:1; text-align:center">
                                <div style="font-size:12pt; font-weight:bold">${cp.nama}</div>
                                <div style="font-size:8pt">${cp.alamat} ${cp.kota || ''}</div>
                                <div style="font-size:8pt">Telp: ${cp.telepon || '-'} | Email: ${cp.email}</div>
                            </div>
                        </div>
                        <!-- TITLE AREA -->
                        <div style="text-align:center; margin-bottom: 20px">
                            <div id="drJudul" contenteditable="true" style="width:100%; text-align:center; font-weight:bold; font-size:12pt; border:none; outline:none" data-placeholder="JUDUL DOKUMEN / PERIHAL"></div>
                            <div style="font-size:10pt; margin-top:5px">Nomor: ${autoNumber}</div>
                        </div>
                        <!-- CONTENT AREA -->
                        <div class="word-editor" id="drKonten" contenteditable="true"></div>
                    </div>
                </div>
            </div>

            <!-- RIGHT: ADVANCED AI ASSISTANT -->
            <div style="background:#fff; border:1px solid var(--border); border-radius:12px; display:flex; flex-direction:column; box-shadow: 0 4px 15px rgba(0,0,0,0.05)">
                <div style="padding:15px; border-bottom:1px solid #eee; background:var(--primary); color:#fff; border-radius:12px 12px 0 0">
                    <div class="fw-700 text-sm">🤖 Legal Brain AI (Pro)</div>
                    <div class="text-xs" style="opacity:0.8">Advanced Drafting & Legal Analysis</div>
                </div>

                <div id="aiChatBox" style="flex:1; overflow-y:auto; padding:15px; font-size:0.82rem; background:#fcfcfc">
                    <div style="margin-bottom:12px; background:#e8f0fe; padding:10px; border-radius:10px; color:#1a237e">
                        Halo! Saya <b>AI Legal Assistant</b>. Apa yang ingin Anda buat hari ini?
                    </div>
                </div>

                <div style="padding:15px; border-top:1px solid #eee">
                    <textarea class="form-control" id="aiPrompt" style="min-height:90px; font-size:0.82rem; border-radius:10px" placeholder="Contoh: 'Buatkan pasal kerahasiaan 2 tahun' atau 'Analisis draft ini'"></textarea>
                    <div class="flex gap-4 mt-10">
                        <button class="btn btn-primary btn-sm" style="flex:1" onclick="discussWithAI()">💬 Kirim</button>
                        <button class="btn btn-success btn-sm" onclick="executeAIDraft()" title="Terapkan ke lembar kerja">⚡ Terapkan</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex gap-8 mt-16" style="justify-content:space-between; align-items:center">
            <div class="flex gap-16">
                <label style="display:flex; align-items:center; gap:6px; font-size:0.75rem; cursor:pointer">
                    <input type="checkbox" id="drPakeKop" checked onchange="document.getElementById('kopPreview').classList.toggle('active', this.checked)"> Tampilkan KOP
                </label>
                <div class="text-xs" style="color:#666">Pihak 2: <input id="drPihak2" style="border:none; border-bottom:1px solid #ccc; background:transparent" placeholder="Nama Pihak Kedua"></div>
            </div>
            <div class="flex gap-8">
                <button class="btn btn-outline" onclick="closeSidebar(); closeModalDirect()">Tutup</button>
                <button class="btn btn-info" onclick="printDraftLegalDirect()">🖨️ Cetak A4</button>
                <button class="btn btn-primary" onclick="simpanDraftLegal()">💾 Simpan & Sinkronkan</button>
            </div>
        </div>
    `, true);
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
            isi: `MEMORANDUM OF UNDERSTANDING<br>Nomor: ${num}<br><br>Antara<br>LPK IJEF CORP<br>Dan<br>[PIHAK KEDUA]<br><br>Tentang<br>[PERIHAL KERJASAMA]<br><br>Pada hari ini [TANGGAL], kami yang bertanda tangan di bawah ini:<br>1. Nama: [NAMA WAKIL IJEF]<br>   Jabatan: [JABATAN]<br>   Bertindak untuk dan atas nama LPK IJEF CORP.<br><br>2. Nama: [NAMA WAKIL MITRA]<br>   Jabatan: [JABATAN]<br>   Bertindak untuk dan atas nama [PIHAK KEDUA].<br><br>Sepakat untuk melakukan kerjasama dalam bidang [BIDANG KERJASAMA] dengan ketentuan sebagai berikut...`
        },
        nda: {
            judul: "NON-DISCLOSURE AGREEMENT (NDA)",
            isi: `NON-DISCLOSURE AGREEMENT (NDA)<br>Nomor: ${num}<br><br>Perjanjian Kerahasiaan ini dibuat antara LPK IJEF CORP dan [PIHAK KEDUA].<br><br>Bahwa Para Pihak bersedia untuk mengungkapkan Informasi Rahasia tertentu kepada Pihak lainnya untuk tujuan [TUJUAN].<br><br>Pihak Penerima setuju untuk menjaga kerahasiaan seluruh informasi yang diterima...`
        },
        spk: {
            judul: "SURAT PERINTAH KERJA (SPK)",
            isi: `SURAT PERINTAH KERJA (SPK)<br>Nomor: ${num}<br><br>Kepada: [PIHAK KEDUA]<br>Alamat: [ALAMAT]<br><br>Dengan ini kami memberikan perintah kerja untuk:<br>1. Pekerjaan: [NAMA PEKERJAAN]<br>2. Nilai Kontrak: [NILAI]<br>3. Jangka Waktu: [WAKTU]<br><br>Demikian surat perintah ini dibuat untuk dilaksanakan...`
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
        judul: document.getElementById("drJudul").innerHTML,
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
            perihal: data.judul.replace(/<[^>]*>/g, ''),
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

function discussWithAI() {
    const prompt = document.getElementById("aiPrompt").value.trim();
    if (!prompt) return;

    const chatBox = document.getElementById("aiChatBox");
    chatBox.innerHTML += \`<div style="margin-bottom:10px; text-align:right"><div style="display:inline-block; background:#333; color:#fff; padding:8px 12px; border-radius:15px 15px 2px 15px; max-width:90%">\${escHtml(prompt)}</div></div>\`;
    document.getElementById("aiPrompt").value = "";
    chatBox.scrollTop = chatBox.scrollHeight;

    chatBox.innerHTML += \`<div id="aiThinking" class="text-xs" style="color:#999; margin-bottom:10px">🤖 Legal Brain sedang menganalisis hukum...</div>\`;

    setTimeout(() => {
        document.getElementById("aiThinking")?.remove();
        let aiResponse = "";
        const p = prompt.toLowerCase();

        if (p.includes("kerahasiaan") || p.includes("nda")) {
            aiResponse = \`<b>PASAL KERAHASIAAN:</b><br>1. Para Pihak wajib menjaga kerahasiaan seluruh informasi.<br>2. Kewajiban ini berlaku selama 3 tahun setelah kontrak berakhir.\`;
        } else if (p.includes("ganti rugi") || p.includes("denda")) {
            aiResponse = \`<b>PASAL GANTI RUGI:</b><br>Pihak yang lalai wajib membayar denda sebesar 1/1000 dari nilai kontrak per hari keterlambatan.\`;
        } else {
            aiResponse = \`Berdasarkan analisis hukum saya, saran terbaik untuk poin <b>"\${escHtml(prompt)}"</b> adalah menggunakan klausul standar IJEF yang menekankan pada kepastian timeline dan kualitas output.\`;
        }

        window._lastAIResponse = aiResponse;
        chatBox.innerHTML += \`<div style="margin-bottom:15px"><div style="display:inline-block; background:#fff; border:1px solid #ddd; padding:12px; border-radius:2px 15px 15px 15px; color:#333; line-height:1.6; box-shadow: 0 2px 5px rgba(0,0,0,0.05)">\${aiResponse}</div></div>\`;
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 1000);
}

function executeAIDraft() {
    if (!window._lastAIResponse) return toast("Belum ada saran dari AI", "warning");
    const editor = document.getElementById("drKonten");
    editor.innerHTML += "<br><br>" + window._lastAIResponse;
    toast("Saran AI diterapkan!", "success");
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
                <td class="fw-700">\${escHtml(p.ticket_id)}</td>
                <td>\${escHtml(p.judul)}</td>
                <td>\${escHtml(p.departemen || "-")}</td>
                <td>\${statusBadge}</td>
                <td>\${formatDate(p.createdAt)}</td>
                <td>
                    <button class="btn btn-xs btn-info" onclick="viewLegalTicketDetail('\${doc.id}')">👁️ Detail</button>
                </td>
            </tr>`;
        });

        tbody.innerHTML = html || '<tr><td colspan="6" class="text-center">Tidak ada data valid.</td></tr>';
    } catch (e) {
        tbody.innerHTML = \`<tr><td colspan="6" class="text-center" style="color:red">Error: \${e.message}</td></tr>\`;
    }
}

function modalKajianHukum() {
    openModal(\`
        <div class="modal-title">🔨 Buat Tiket Kajian Hukum</div>
        <div class="form-group">
            <label>Judul Kajian / Permasalahan</label>
            <input class="form-control" id="lgJudul" placeholder="Contoh: Tinjauan Draft Vendor">
        </div>
        <div class="form-group">
            <label>Departemen Pemohon</label>
            <input class="form-control" id="lgDept" value="\${escHtml(currentUser.departemen || '')}">
        </div>
        <div class="form-group">
            <label>Deskripsi & Pertanyaan Hukum</label>
            <textarea class="form-control" id="lgDesc" style="min-height:120px"></textarea>
        </div>
        <button class="btn btn-primary" onclick="simpanKajianHukum()">📤 Kirim Tiket</button>
    \`, true);
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
    return \`LGL-\${dateStr}-\${Math.floor(100 + Math.random() * 900)}\`;
}

async function viewLegalTicketDetail(docId) {
    const doc = await db.collection("hrd_legal_tickets").doc(docId).get();
    const p = doc.data();
    const workflow = p.approval_workflow || {};
    const l1 = workflow.layer1 || {};
    const l2 = workflow.layer2 || {};

    const canApproveL1 = (currentUser.role === 'manager' || hasAccess(6)) && l1.status === 'pending';
    const canApproveL2 = (currentUser.role === 'head' || hasAccess(6)) && l1.status === 'approved' && l2.status === 'pending';

    openModal(\`
        <div class="modal-title">📄 Detail Tiket: \${escHtml(p.ticket_id)}</div>
        <div class="form-group"><label>Deskripsi</label><div class="text-sm" style="background:#f5f5f5; padding:12px; border-radius:6px">\${escHtml(p.deskripsi)}</div></div>
        <div class="fw-700 mb-8 mt-16">📋 Approval Status</div>
        <div style="background:#f8f9ff; padding:16px; border-radius:8px; border:1px solid #e0e0e0">
            <div class="flex" style="justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding-bottom:8px">
                <div><b>L1: Manager Divisi</b></div>
                <div class="flex gap-4">
                    <span class="badge badge-\${l1.status==='approved'?'success':'warning'}">\${l1.status.toUpperCase()}</span>
                    \${canApproveL1 ? \`<button class="btn btn-xs btn-success" onclick="updateLegalTicketStatus('\${docId}', 1, 'approved')">Approve</button>\` : ''}
                </div>
            </div>
            <div class="flex" style="justify-content:space-between; align-items:center; padding-top:8px">
                <div><b>L2: Head Legal</b></div>
                <div class="flex gap-4">
                    <span class="badge badge-\${l2.status==='approved'?'success':'warning'}">\${l2.status.toUpperCase()}</span>
                    \${canApproveL2 ? \`<button class="btn btn-xs btn-success" onclick="updateLegalTicketStatus('\${docId}', 2, 'approved')">Approve</button>\` : ''}
                </div>
            </div>
        </div>
    \`, true);
}

async function updateLegalTicketStatus(docId, layerNum, action) {
    const fieldPrefix = \`approval_workflow.layer\${layerNum}\`;
    const updateData = {
        [\`\${fieldPrefix}.status\`]: action,
        [\`\${fieldPrefix}.approvedBy\`]: currentUser.nama,
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
    main.innerHTML = \`
    <div class="page-title"><span>⚖️ Legalitas & Perizinan</span><button class="btn btn-primary btn-sm" onclick="modalPerizinan()">+ Tambah</button></div>
    <div class="card"><div class="table-wrap"><table><thead><tr><th>Nama Dokumen</th><th>No. Registrasi</th><th>Instansi</th><th>Tgl Akhir</th><th>Status</th><th>File</th><th>Aksi</th></tr></thead><tbody id="tblLegalPerizinan"></tbody></table></div></div>\`;
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
        html += \`<tr><td>\${escHtml(p.nama)}</td><td class="color-primary fw-700">\${escHtml(p.nomor || "-")}</td><td>\${escHtml(p.instansi || "-")}</td><td>\${p.tglBerakhir ? formatDate(p.tglBerakhir) : "∞"}</td><td><span class="badge badge-\${isExp?'danger':'success'}">\${isExp?'Exp':'Aktif'}</span></td><td>\${p.fileURL ? \`<button class="btn btn-xs btn-success" onclick="window.open('\${p.fileURL}')">👁️</button>\` : '-'}</td><td><button class="btn btn-xs btn-info" onclick="modalPerizinan('\${doc.id}')">✏️</button></td></tr>\`;
    });
    tbody.innerHTML = html;
}

function modalPerizinan(id) {
    if (id) db.collection("hrd_legal_perizinan").doc(id).get().then(d => showPerizinanForm(id, d.data()));
    else showPerizinanForm(null, {});
}

function showPerizinanForm(id, p) {
    openModal(\`
        <div class="modal-title">Dokumen Perizinan</div>
        <div class="form-group"><label>Nama</label><input class="form-control" id="pzNama" value="\${escHtml(p.nama || '')}"></div>
        <div class="form-group"><label>Nomor</label><input class="form-control" id="pzNomor" value="\${escHtml(p.nomor || '')}"></div>
        <div class="form-group"><label>Instansi</label><input class="form-control" id="pzInstansi" value="\${escHtml(p.instansi || '')}"></div>
        <div class="form-group"><label>Tgl Akhir</label><input class="form-control" type="date" id="pzTgl" value="\${p.tglBerakhir || ''}"></div>
        <div class="form-group"><label>Upload</label><input class="form-control" type="file" id="pzFile" accept=".pdf,image/*" onchange="window._pzFile=this.files[0]"></div>
        <button class="btn btn-primary" onclick="simpanPerizinan('\${id || ''}')">💾 Simpan</button>
    \`);
    window._pzFile = null;
}

async function simpanPerizinan(id) {
    const data = {
        nama: document.getElementById('pzNama').value, nomor: document.getElementById('pzNomor').value,
        instansi: document.getElementById('pzInstansi').value, tglBerakhir: document.getElementById('pzTgl').value,
        updatedAt: new Date().toISOString()
    };
    if (window._pzFile) {
        const path = \`legal_perizinan/\${Date.now()}_\${window._pzFile.name}\`;
        data.fileURL = await uploadFileToStorage(window._pzFile, path);
    }
    if (id) await db.collection("hrd_legal_perizinan").doc(id).update(data);
    else await db.collection("hrd_legal_perizinan").add({ ...data, createdAt: new Date().toISOString() });
    closeModalDirect(); renderLegalPerizinan();
}

// ── SENGKETA ───────────────────────────────────────────────

async function renderLegalSengketa() {
    const main = document.getElementById("mainContent");
    main.innerHTML = \`
    <div class="page-title"><span>⚠️ Sengketa & Kasus</span><button class="btn btn-primary btn-sm" onclick="modalSengketa()">+ Tambah</button></div>
    <div class="card"><div class="table-wrap"><table><thead><tr><th>Judul</th><th>Pihak</th><th>Status</th><th>File</th><th>Aksi</th></tr></thead><tbody id="tblLegalSengketa"></tbody></table></div></div>\`;
    loadLegalSengketa();
}

async function loadLegalSengketa() {
    const tbody = document.getElementById("tblLegalSengketa");
    const snap = await db.collection("hrd_legal_sengketa").get();
    let html = "";
    if (snap.empty) { tbody.innerHTML = '<tr><td colspan="5" class="text-center">Kosong</td></tr>'; return; }
    snap.forEach(doc => {
        const p = doc.data();
        html += \`<tr><td>\${escHtml(p.judul)}</td><td>\${escHtml(p.pihak)}</td><td>\${escHtml(p.status)}</td><td>\${p.fileURL ? \`<button class="btn btn-xs btn-success" onclick="window.open('\${p.fileURL}')">👁️</button>\` : '-'}</td><td><button class="btn btn-xs btn-info" onclick="modalSengketa('\${doc.id}')">✏️</button></td></tr>\`;
    });
    tbody.innerHTML = html;
}

function modalSengketa(id) {
    if (id) db.collection("hrd_legal_sengketa").doc(id).get().then(d => showSengketaForm(id, d.data()));
    else showSengketaForm(null, {});
}

function showSengketaForm(id, p) {
    openModal(\`
        <div class="modal-title">Catatan Kasus</div>
        <div class="form-group"><label>Judul</label><input class="form-control" id="skJudul" value="\${escHtml(p.judul || '')}"></div>
        <div class="form-group"><label>Pihak</label><input class="form-control" id="skPihak" value="\${escHtml(p.pihak || '')}"></div>
        <div class="form-group"><label>Status</label><select class="form-control" id="skStatus"><option value="Mediasi" \${p.status==='Mediasi'?'selected':''}>Mediasi</option><option value="Selesai" \${p.status==='Selesai'?'selected':''}>Selesai</option></select></div>
        <div class="form-group"><label>Upload</label><input class="form-control" type="file" id="skFile" onchange="window._skFile=this.files[0]"></div>
        <button class="btn btn-primary" onclick="simpanSengketa('\${id || ''}')">💾 Simpan</button>
    \`);
    window._skFile = null;
}

async function simpanSengketa(id) {
    const data = {
        judul: document.getElementById('skJudul').value, pihak: document.getElementById('skPihak').value,
        status: document.getElementById('skStatus').value, updatedAt: new Date().toISOString()
    };
    if (window._skFile) {
        const path = \`legal_sengketa/\${Date.now()}_\${window._skFile.name}\`;
        data.fileURL = await uploadFileToStorage(window._skFile, path);
    }
    if (id) await db.collection("hrd_legal_sengketa").doc(id).update(data);
    else await db.collection("hrd_legal_sengketa").add({ ...data, createdAt: new Date().toISOString() });
    closeModalDirect(); renderLegalSengketa();
}
