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
    // Ambil urutan terakhir dari hrd_surat untuk kontinuitas nomor
    let nextSeq = "001";
    try {
        const suratSnap = await db.collection("hrd_surat").get();
        nextSeq = String(suratSnap.size + 1).padStart(3, '0');
    } catch (e) {
        console.warn("Gagal mengambil sequence surat, fallback ke random.");
        nextSeq = Math.floor(100 + Math.random() * 899).toString();
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const autoNumber = `${nextSeq}/LGL-IJEF/${month}/${year}`;

    openModal(`
        <div class="modal-title">✍️ Buat Draft Dokumen Legal & AI Assistant</div>

        <div class="grid-2">
            <div class="form-group">
                <label>Nomor Surat (Terintegrasi Generator)</label>
                <input class="form-control" id="drNomor" value="${autoNumber}" readonly style="background:#f0f4ff; font-weight:bold; color:var(--primary)">
            </div>
            <div class="form-group">
                <label>Pilih Template Dasar</label>
                <select class="form-control" id="drTemplate" onchange="applyLegalTemplate()">
                    <option value="">-- Pilih Template --</option>
                    <option value="mou">MOU Kerjasama (Umum)</option>
                    <option value="nda">Non-Disclosure Agreement (NDA)</option>
                    <option value="spk">Surat Perintah Kerja (SPK)</option>
                    <option value="pks">Perjanjian Kerja Sama (PKS)</option>
                </select>
            </div>
        </div>

        <div style="display:grid; grid-template-columns: 1.5fr 1fr; gap:16px; margin-top:8px">
            <!-- AREA DRAFTING (KIRI) -->
            <div>
                <div class="form-group">
                    <label>Perihal / Judul Dokumen</label>
                    <input class="form-control" id="drJudul" placeholder="Contoh: Kerjasama Pelatihan Bahasa Jepang">
                </div>
                <div class="form-group">
                    <label>Isi / Konten Draft</label>
                    <textarea class="form-control" id="drKonten" style="height:450px; font-family:monospace; font-size:0.75rem; line-height:1.5" placeholder="Isi draft kontrak di sini atau minta bantuan AI..."></textarea>
                </div>
            </div>

            <!-- AREA AI ASSISTANT (KANAN) -->
            <div style="background:#f4f7fb; border:1px solid #d1d9e6; border-radius:10px; padding:16px; display:flex; flex-direction:column">
                <div class="fw-700 text-sm mb-12 color-primary" style="display:flex; align-items:center; gap:6px">
                    <span>🤖 AI Legal Assistant</span>
                    <span class="badge badge-success" style="font-size:0.5rem">ONLINE</span>
                </div>

                <div id="aiChatBox" style="flex:1; overflow-y:auto; background:#fff; border:1px solid #e0e0e0; border-radius:8px; padding:10px; margin-bottom:12px; font-size:0.8rem; min-height:300px; max-height:350px">
                    <div style="color:#666; font-style:italic">Halo! Saya asisten AI Legal Anda. Beritahu saya kontrak apa yang ingin Anda buat atau minta saya menambahkan pasal tertentu.</div>
                </div>

                <div class="form-group" style="margin-bottom:8px">
                    <textarea class="form-control" id="aiPrompt" style="min-height:80px; font-size:0.8rem" placeholder="Contoh: Buatkan pasal ganti rugi jika pihak kedua terlambat menyelesaikan pekerjaan..."></textarea>
                </div>

                <div class="flex gap-4">
                    <button class="btn btn-info btn-sm" style="flex:1" onclick="discussWithAI()">💬 Diskusi</button>
                    <button class="btn btn-success btn-sm" onclick="executeAIDraft()" title="Terapkan ke Draft">⚡ Eksekusi</button>
                </div>
                <div class="text-xs mt-8" style="color:#888; line-height:1.4">AI dapat membantu menyusun pasal-pasal hukum sesuai standar perusahaan.</div>
            </div>
        </div>

        <div class="flex gap-8 mt-16" style="justify-content:space-between; align-items:center">
            <div class="text-xs" style="color:#666">Pihak 2: <input id="drPihak2" style="border:none; border-bottom:1px solid #ccc; background:transparent; padding:2px" placeholder="Nama Pihak Kedua"></div>
            <div class="flex gap-8">
                <button class="btn btn-outline" onclick="closeModalDirect()">Batal</button>
                <button class="btn btn-primary" onclick="simpanDraftLegal()">💾 Simpan & Sinkronkan</button>
            </div>
        </div>
    `, true);
}

// ── AI LOGIC FOR LEGAL ────────────────────────────────────────

function discussWithAI() {
    const prompt = document.getElementById("aiPrompt").value.trim();
    if (!prompt) return toast("Ketik sesuatu untuk berdiskusi dengan AI", "warning");

    const chatBox = document.getElementById("aiChatBox");

    // User bubble
    chatBox.innerHTML += `<div style="margin-bottom:10px; text-align:right"><div style="display:inline-block; background:var(--primary); color:#fff; padding:8px 12px; border-radius:12px 12px 2px 12px; max-width:90%">${escHtml(prompt)}</div></div>`;

    document.getElementById("aiPrompt").value = "";
    chatBox.scrollTop = chatBox.scrollHeight;

    // Simulate AI thinking and response
    setTimeout(() => {
        let aiResponse = "Tentu, saya bisa membantu menyusun pasal tersebut. Berikut draf usulannya:";

        if (prompt.toLowerCase().includes("ganti rugi") || prompt.toLowerCase().includes("terlambat")) {
            aiResponse = `<b>PASAL GANTI RUGI (Denda Keterlambatan):</b>\n\nApabila PIHAK KEDUA terlambat menyelesaikan pekerjaan sesuai jangka waktu yang disepakati, maka PIHAK KEDUA dikenakan denda sebesar 1‰ (satu per mil) dari nilai kontrak untuk setiap hari keterlambatan, dengan jumlah maksimal sebesar 5% (lima persen) dari total nilai kontrak.`;
        } else if (prompt.toLowerCase().includes("force majeure") || prompt.toLowerCase().includes("keadaan kahar")) {
            aiResponse = `<b>PASAL FORCE MAJEURE:</b>\n\nKeadaan Kahar meliputi peristiwa-peristiwa di luar kendali Para Pihak termasuk namun tidak terbatas pada bencana alam, perang, huru-hara, dan kebijakan pemerintah di bidang moneter yang secara langsung menghambat pelaksanaan Perjanjian ini.`;
        } else {
            aiResponse = `Berdasarkan permintaan Anda mengenai "${escHtml(prompt)}", saya merekomendasikan untuk menyisipkan klausul standar kepatuhan operasional IJEF CORP yang mencakup poin integritas dan standar kualitas layanan. Ingin saya buatkan draf rincinya?`;
        }

        window._lastAIResponse = aiResponse; // Store for execution

        chatBox.innerHTML += `<div style="margin-bottom:10px"><div style="display:inline-block; background:#e8f0fe; color:#1a237e; padding:8px 12px; border-radius:12px 12px 12px 2px; border:1px solid #c2d7ff; max-width:90%">${aiResponse}</div></div>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 1000);
}

function executeAIDraft() {
    if (!window._lastAIResponse) return toast("Belum ada saran dari AI untuk dieksekusi", "warning");

    const konten = document.getElementById("drKonten");
    const cleanText = window._lastAIResponse.replace(/<[^>]*>/g, ''); // strip HTML

    konten.value += (konten.value ? "\n\n" : "") + cleanText;
    toast("AI Draft berhasil diterapkan ke konten!", "success");
}

async function simpanDraftLegal() {
    const data = {
        nomor: document.getElementById("drNomor").value,
        judul: document.getElementById("drJudul").value,
        pihak2: document.getElementById("drPihak2").value,
        konten: document.getElementById("drKonten").value,
        type: "draft_kontrak",
        createdBy: currentUser.nama,
        createdAt: new Date().toISOString()
    };

    if (!data.judul) return toast("Judul wajib diisi", "warning");

    try {
        // 1. Simpan ke hrd_legal_drafts
        await db.collection("hrd_legal_drafts").add(data);

        // 2. Sinkronkan ke hrd_surat agar nomor terpakai secara resmi
        await db.collection("hrd_surat").add({
            nomor: data.nomor,
            jenis: "SPK/LGL", // Kategori legal
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

            // VALIDASI ANCHOR (Mandatory Requirement)
            // Abaikan render jika ticket_id null, undefined, atau kosong untuk menghindari blank rows
            if (!p.ticket_id || p.ticket_id.trim() === "") {
                console.warn("Skipping invalid ticket record:", doc.id);
                return;
            }

            const workflow = p.approval_workflow || {};
            const statusL1 = workflow.layer1?.status || "pending";
            const statusL2 = workflow.layer2?.status || "pending";

            // Logic penentuan badge status keseluruhan
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

        tbody.innerHTML = html || '<tr><td colspan="6" class="text-center">Tidak ada data valid untuk ditampilkan.</td></tr>';
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="color:red">Error: ${e.message}</td></tr>`;
    }
}

function modalKajianHukum() {
    openModal(`
        <div class="modal-title">🔨 Buat Tiket Kajian Hukum</div>
        <div class="form-group">
            <label>Judul Kajian / Permasalahan</label>
            <input class="form-control" id="lgJudul" placeholder="Contoh: Tinjauan Draft Perjanjian Kerjasama Vendor X">
        </div>
        <div class="form-group">
            <label>Departemen Pemohon</label>
            <input class="form-control" id="lgDept" value="${escHtml(currentUser.departemen || '')}">
        </div>
        <div class="form-group">
            <label>Deskripsi & Pertanyaan Hukum</label>
            <textarea class="form-control" id="lgDesc" style="min-height:120px" placeholder="Jelaskan detail latar belakang dan apa yang ingin dikaji..."></textarea>
        </div>
        <div class="card mb-16" style="background:#f8f9ff; border:1px solid #d0d8f0">
            <div class="text-xs fw-700 color-primary mb-8">🛠️ WORKFLOW APPROVAL</div>
            <div class="text-xs" style="color:#666">
                1. Layer 1: Manager Divisi (${escHtml(currentUser.departemen || 'Terkait')})<br>
                2. Layer 2: Head of Legal
            </div>
        </div>
        <button class="btn btn-primary" onclick="simpanKajianHukum()">📤 Kirim Tiket Kajian</button>
    `, true);
}

async function simpanKajianHukum() {
    const judul = document.getElementById("lgJudul").value.trim();
    const dept = document.getElementById("lgDept").value.trim();
    const desc = document.getElementById("lgDesc").value.trim();

    if (!judul || !desc) return toast("Judul dan Deskripsi wajib diisi", "warning");

    const ticket_id = generateLegalTicketId();

    const data = {
        ticket_id: ticket_id,
        judul: judul,
        departemen: dept,
        deskripsi: desc,
        pemohon: currentUser.nama,
        pemohonId: currentUser.id,
        status: "pending",
        approval_workflow: {
            layer1: {
                role: "Manager Divisi",
                status: "pending",
                approvedBy: "",
                updatedAt: ""
            },
            layer2: {
                role: "Head Legal",
                status: "pending",
                approvedBy: "",
                updatedAt: ""
            }
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    try {
        await db.collection("hrd_legal_tickets").add(data);
        closeModalDirect();
        toast("Tiket kajian hukum berhasil dikirim", "success");
        renderKajianHukum();
    } catch (e) {
        toast("Gagal menyimpan: " + e.message, "error");
    }
}

function generateLegalTicketId() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
    const random = Math.floor(100 + Math.random() * 900); // 3 digit random
    return `LGL-${dateStr}-${random}`;
}

async function viewLegalTicketDetail(docId) {
    const doc = await db.collection("hrd_legal_tickets").doc(docId).get();
    if (!doc.exists) return toast("Tiket tidak ditemukan", "error");
    const p = doc.data();

    const workflow = p.approval_workflow || {};
    const l1 = workflow.layer1 || {};
    const l2 = workflow.layer2 || {};

    // Cek apakah user saat ini punya hak approve
    // Layer 1: Bisa di-approve oleh Manager/Admin (untuk simulasi)
    const canApproveL1 = (currentUser.role === 'manager' || hasAccess(6)) && l1.status === 'pending';
    // Layer 2: Bisa di-approve oleh Head/Admin jika L1 sudah approved
    const canApproveL2 = (currentUser.role === 'head' || hasAccess(6)) && l1.status === 'approved' && l2.status === 'pending';

    openModal(`
        <div class="modal-title">📄 Detail Tiket: ${escHtml(p.ticket_id)}</div>
        <div class="grid-2 mb-16">
            <div><b>Pemohon:</b> ${escHtml(p.pemohon)}</div>
            <div><b>Departemen:</b> ${escHtml(p.departemen)}</div>
            <div style="grid-column: 1 / -1"><b>Judul:</b> ${escHtml(p.judul)}</div>
        </div>
        <div class="form-group">
            <label>Deskripsi Permasalahan</label>
            <div class="text-sm" style="background:#f5f5f5; padding:12px; border-radius:6px; white-space:pre-wrap">${escHtml(p.deskripsi)}</div>
        </div>

        <div class="fw-700 mb-8 mt-16">📋 Status Approval Workflow</div>
        <div style="background:#f8f9ff; padding:16px; border-radius:8px; border:1px solid #e0e0e0">
            <!-- LAYER 1 -->
            <div class="flex" style="justify-content:space-between; align-items:center; margin-bottom:12px; padding-bottom:12px; border-bottom:1px solid #eee">
                <div>
                    <div class="fw-700 text-sm">Layer 1: Manager Divisi</div>
                    <div class="text-xs color-secondary">${l1.status === 'approved' ? 'Disetujui oleh ' + l1.approvedBy : 'Menunggu Persetujuan'}</div>
                </div>
                <div class="flex gap-4">
                    <span class="badge badge-${l1.status === 'approved' ? 'success' : l1.status === 'rejected' ? 'danger' : 'warning'}">${l1.status.toUpperCase()}</span>
                    ${canApproveL1 ? `
                        <button class="btn btn-xs btn-success" onclick="updateLegalTicketStatus('${docId}', 1, 'approved')">Approve</button>
                        <button class="btn btn-xs btn-danger" onclick="updateLegalTicketStatus('${docId}', 1, 'rejected')">Reject</button>
                    ` : ''}
                </div>
            </div>
            <!-- LAYER 2 -->
            <div class="flex" style="justify-content:space-between; align-items:center">
                <div>
                    <div class="fw-700 text-sm">Layer 2: Head of Legal</div>
                    <div class="text-xs color-secondary">${l2.status === 'approved' ? 'Disetujui oleh ' + l2.approvedBy : (l1.status === 'approved' ? 'Menunggu Persetujuan' : 'Menunggu Layer 1')}</div>
                </div>
                <div class="flex gap-4">
                    <span class="badge badge-${l2.status === 'approved' ? 'success' : l2.status === 'rejected' ? 'danger' : 'warning'}">${l2.status.toUpperCase()}</span>
                    ${canApproveL2 ? `
                        <button class="btn btn-xs btn-success" onclick="updateLegalTicketStatus('${docId}', 2, 'approved')">Approve</button>
                        <button class="btn btn-xs btn-danger" onclick="updateLegalTicketStatus('${docId}', 2, 'rejected')">Reject</button>
                    ` : ''}
                </div>
            </div>
        </div>
        <div class="mt-16 text-right">
            <button class="btn btn-outline" onclick="closeModalDirect()">Tutup</button>
        </div>
    `, true);
}

async function updateLegalTicketStatus(docId, layerNum, action) {
    const fieldPrefix = `approval_workflow.layer${layerNum}`;
    const updateData = {
        [`${fieldPrefix}.status`]: action,
        [`${fieldPrefix}.approvedBy`]: currentUser.nama,
        [`${fieldPrefix}.updatedAt`]: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    try {
        await db.collection("hrd_legal_tickets").doc(docId).update(updateData);
        toast(`Berhasil melakukan ${action} pada Layer ${layerNum}`, "success");
        closeModalDirect();
        loadLegalTickets();
    } catch (e) {
        toast("Gagal update: " + e.message, "error");
    }
}

// ── PLACEHOLDERS UNTUK MENU LAIN ───────────────────────────────

async function renderLegalPerizinan() {
    const main = document.getElementById("mainContent");
    main.innerHTML = `
    <div class="page-title">
        <span>⚖️ Legalitas & Perizinan</span>
        <button class="btn btn-primary btn-sm" onclick="modalPerizinan()">+ Tambah Izin/Legalitas</button>
    </div>
    <div class="card">
        <p class="text-sm mb-16" style="color:#666">Monitoring masa berlaku dokumen legalitas perusahaan (NIB, SIUP, IMB, Sertifikat, dll).</p>
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Nama Dokumen</th>
                        <th>No. Registrasi</th>
                        <th>Instansi Penerbit</th>
                        <th>Tgl Berakhir</th>
                        <th>Status</th>
                        <th>File</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody id="tblLegalPerizinan">
                    <tr><td colspan="7" class="text-center">Memuat data...</td></tr>
                </tbody>
            </table>
        </div>
    </div>`;

    loadLegalPerizinan();
}

async function loadLegalPerizinan() {
    const tbody = document.getElementById("tblLegalPerizinan");
    const snap = await db.collection("hrd_legal_perizinan").get();
    let html = "";
    if (snap.empty) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Belum ada data perizinan.</td></tr>';
        return;
    }
    const today = todayStr();
    snap.forEach(doc => {
        const p = doc.data();
        const isExpired = p.tglBerakhir && p.tglBerakhir < today;
        const fileBtn = p.fileURL ? `<button class="btn btn-xs btn-success" onclick="window.open('${p.fileURL}', '_blank')">👁️ Lihat</button>` : '<span class="text-xs" style="color:#999">-</span>';
        html += `
        <tr>
            <td class="fw-700">${escHtml(p.nama)}</td>
            <td class="color-primary fw-700">${escHtml(p.nomor || "-")}</td>
            <td>${escHtml(p.instansi || "-")}</td>
            <td>${p.tglBerakhir ? formatDate(p.tglBerakhir) : "Seumur Hidup"}</td>
            <td><span class="badge badge-${isExpired ? 'danger' : 'success'}">${isExpired ? 'Expired' : 'Aktif'}</span></td>
            <td>${fileBtn}</td>
            <td>
                <button class="btn btn-xs btn-info" onclick="modalPerizinan('${doc.id}')">✏️ Edit</button>
                <button class="btn btn-xs btn-danger" onclick="hapusDoc('hrd_legal_perizinan','${doc.id}','legal-perizinan')">🗑️</button>
            </td>
        </tr>`;
    });
    tbody.innerHTML = html;
}

function modalPerizinan(id) {
    if (id) db.collection("hrd_legal_perizinan").doc(id).get().then(d => showPerizinanForm(id, d.data()));
    else showPerizinanForm(null, {});
}

function showPerizinanForm(id, p) {
    openModal(`
        <div class="modal-title">${id ? 'Edit' : 'Tambah'} Dokumen Perizinan</div>
        <div class="form-group"><label>Nama Dokumen / Jenis Izin</label><input class="form-control" id="pzNama" value="${escHtml(p.nama || '')}" placeholder="Contoh: NIB, SIUP, IMB"></div>
        <div class="form-group"><label>Nomor Registrasi / No. SK</label><input class="form-control" id="pzNomor" value="${escHtml(p.nomor || '')}" placeholder="Masukkan nomor resmi dokumen"></div>
        <div class="form-group"><label>Instansi Penerbit</label><input class="form-control" id="pzInstansi" value="${escHtml(p.instansi || '')}" placeholder="Contoh: DPMPTSP, Kemenkumham"></div>
        <div class="form-group"><label>Tanggal Berakhir (Kosongkan jika Seumur Hidup)</label><input class="form-control" type="date" id="pzTgl" value="${p.tglBerakhir || ''}"></div>
        <div class="form-group">
            <label>Upload Softcopy Dokumen (PDF/JPG)</label>
            <input class="form-control" type="file" id="pzFile" accept=".pdf,image/*" onchange="previewPerizinanFile(this)">
            <div id="pzFileStatus" class="text-xs mt-4">${p.fileURL ? '<span class="color-success">✅ File sudah tersedia</span>' : ''}</div>
        </div>
        <button class="btn btn-primary" onclick="simpanPerizinan('${id || ''}')">💾 Simpan & Upload</button>
    `);
    window._pzFile = null;
}

function previewPerizinanFile(input) {
    const file = input.files[0];
    if (file) {
        window._pzFile = file;
        document.getElementById("pzFileStatus").innerHTML = `<span class="badge badge-success">Siap upload: ${file.name}</span>`;
    }
}

async function simpanPerizinan(id) {
    const data = {
        nama: document.getElementById('pzNama').value,
        nomor: document.getElementById('pzNomor').value,
        instansi: document.getElementById('pzInstansi').value,
        tglBerakhir: document.getElementById('pzTgl').value,
        updatedAt: new Date().toISOString()
    };
    if (!data.nama) return toast("Nama dokumen wajib", "warning");

    // Upload file if selected
    if (window._pzFile) {
        try {
            toast("⏳ Mengupload dokumen...", "info");
            const path = `legal_perizinan/${Date.now()}_${window._pzFile.name}`;
            data.fileURL = await uploadFileToStorage(window._pzFile, path);
            data.fileName = window._pzFile.name;
        } catch (e) {
            return toast("Gagal upload: " + e.message, "error");
        }
    }

    if (id) await db.collection("hrd_legal_perizinan").doc(id).update(data);
    else await db.collection("hrd_legal_perizinan").add({ ...data, createdAt: new Date().toISOString() });

    window._pzFile = null;
    closeModalDirect();
    toast("Data perizinan dan dokumen berhasil disimpan", "success");
    renderLegalPerizinan();
}


async function renderLegalSengketa() {
    const main = document.getElementById("mainContent");
    main.innerHTML = `
    <div class="page-title">
        <span>⚠️ Sengketa & Kasus</span>
        <button class="btn btn-primary btn-sm" onclick="modalSengketa()">+ Catat Kasus Baru</button>
    </div>
    <div class="card">
        <p class="text-sm mb-16" style="color:#666">Monitoring penanganan sengketa hukum, mediasi, atau kasus litigasi/non-litigasi.</p>
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Judul Kasus</th>
                        <th>Pihak Terkait</th>
                        <th>Kategori</th>
                        <th>Status</th>
                        <th>Update Terakhir</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody id="tblLegalSengketa">
                    <tr><td colspan="6" class="text-center">Memuat data...</td></tr>
                </tbody>
            </table>
        </div>
    </div>`;
    loadLegalSengketa();
}

async function loadLegalSengketa() {
    const tbody = document.getElementById("tblLegalSengketa");
    const snap = await db.collection("hrd_legal_sengketa").get();
    let html = "";
    if (snap.empty) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Belum ada catatan kasus.</td></tr>';
        return;
    }
    snap.forEach(doc => {
        const p = doc.data();
        html += `
        <tr>
            <td class="fw-700">${escHtml(p.judul)}</td>
            <td>${escHtml(p.pihak || "-")}</td>
            <td><span class="badge badge-info">${escHtml(p.kategori || "Umum")}</span></td>
            <td><span class="badge badge-warning">${escHtml(p.status || "Proses")}</span></td>
            <td>${formatDate(p.updatedAt || p.createdAt)}</td>
            <td>
                <button class="btn btn-xs btn-info" onclick="modalSengketa('${doc.id}')">✏️ Edit</button>
                <button class="btn btn-xs btn-danger" onclick="hapusDoc('hrd_legal_sengketa','${doc.id}','legal-sengketa')">🗑️</button>
            </td>
        </tr>`;
    });
    tbody.innerHTML = html;
}

function modalSengketa(id) {
    if (id) db.collection("hrd_legal_sengketa").doc(id).get().then(d => showSengketaForm(id, d.data()));
    else showSengketaForm(null, {});
}

function showSengketaForm(id, p) {
    openModal(`
        <div class="modal-title">${id ? 'Edit' : 'Tambah'} Catatan Sengketa/Kasus</div>
        <div class="form-group"><label>Judul Kasus</label><input class="form-control" id="skJudul" value="${escHtml(p.judul || '')}"></div>
        <div class="form-group"><label>Pihak Terkait</label><input class="form-control" id="skPihak" value="${escHtml(p.pihak || '')}"></div>
        <div class="grid-2">
            <div class="form-group"><label>Kategori</label><select class="form-control" id="skKat"><option value="Ketenagakerjaan" ${p.kategori==='Ketenagakerjaan'?'selected':''}>Ketenagakerjaan</option><option value="Perdata" ${p.kategori==='Perdata'?'selected':''}>Perdata</option><option value="Pidana" ${p.kategori==='Pidana'?'selected':''}>Pidana</option></select></div>
            <div class="form-group"><label>Status</label><select class="form-control" id="skStatus"><option value="Mediasi" ${p.status==='Mediasi'?'selected':''}>Mediasi</option><option value="Proses Hukum" ${p.status==='Proses Hukum'?'selected':''}>Proses Hukum</option><option value="Selesai" ${p.status==='Selesai'?'selected':''}>Selesai</option></select></div>
        </div>
        <div class="form-group"><label>Kronologi / Update</label><textarea class="form-control" id="skKronologi" style="min-height:100px">${escHtml(p.kronologi || '')}</textarea></div>
        <button class="btn btn-primary" onclick="simpanSengketa('${id || ''}')">💾 Simpan</button>
    `);
}

async function simpanSengketa(id) {
    const data = {
        judul: document.getElementById('skJudul').value,
        pihak: document.getElementById('skPihak').value,
        kategori: document.getElementById('skKat').value,
        status: document.getElementById('skStatus').value,
        kronologi: document.getElementById('skKronologi').value,
        updatedAt: new Date().toISOString()
    };
    if (!data.judul) return toast("Judul wajib", "warning");
    if (id) await db.collection("hrd_legal_sengketa").doc(id).update(data);
    else await db.collection("hrd_legal_sengketa").add({ ...data, createdAt: new Date().toISOString() });
    closeModalDirect();
    toast("Kasus disimpan", "success");
    renderLegalSengketa();
}
