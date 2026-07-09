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
        <button class="btn btn-primary btn-sm" onclick="modalKajianHukum()">+ Buat Tiket Kajian</button>
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

function renderLegalPerizinan() {
    const main = document.getElementById("mainContent");
    main.innerHTML = `
    <div class="page-title"><span>⚖️ Legalitas & Perizinan</span></div>
    <div class="empty-state">
        <div class="icon">⚖️</div>
        <p>Modul Manajemen Perizinan (NIB, SIUP, IMB, dll) sedang disiapkan.</p>
    </div>`;
}

function renderLegalSengketa() {
    const main = document.getElementById("mainContent");
    main.innerHTML = `
    <div class="page-title"><span>⚠️ Sengketa & Kasus</span></div>
    <div class="empty-state">
        <div class="icon">⚠️</div>
        <p>Modul Monitoring Sengketa Hukum & Kasus Litigasi sedang disiapkan.</p>
    </div>`;
}
