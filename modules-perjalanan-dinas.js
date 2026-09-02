"use strict";

// ── PERJALANAN DINAS (SPPD) ───────────────────────────────────
// Integrated with Absence (hrd_dinas_luar)
// Logic: SPPD handles Finance/Workflow, Absence handles presence records.
// ══════════════════════════════════════════════════════════════

window.renderPerjalananDinas = async function() {
  const main = document.getElementById("mainContent");
  if (!main) return;

  const isBOD = currentUser.role === "bod";
  const portalMode = !hasAccess(3);

  main.innerHTML = `
    <div class="page-title">
      <span>${renderBackButton()}✈️ Prosedur Perjalanan Dinas</span>
      ${!isBOD ? '<button class="btn btn-primary btn-sm" onclick="modalAjukanSPPD()">+ Ajukan SPPD</button>' : ""}
    </div>

    <div class="tabs mb-16" id="sppdTabs">
      <div class="tab active" onclick="showSPPDTab('daftar')">📋 Daftar SPPD</div>
      <div class="tab" onclick="showSPPDTab('prosedur')">📖 Prosedur</div>
      <div class="tab" onclick="showSPPDTab('uang-muka')">💰 Uang Muka</div>
      <div class="tab" onclick="showSPPDTab('laporan')">📝 Laporan Perjalanan</div>
      <div class="tab" onclick="showSPPDTab('reimbursement')">🧾 Reimburse Dinas</div>
    </div>

    <div id="sppdContent">Memuat...</div>
  `;

  showSPPDTab("daftar");
}

async function showSPPDTab(tab) {
  document
    .querySelectorAll("#sppdTabs .tab")
    .forEach((t) => t.classList.remove("active"));
  const tabs = document.querySelectorAll("#sppdTabs .tab");
  if (tab === "daftar") tabs[0].classList.add("active");
  else if (tab === "prosedur") tabs[1].classList.add("active");
  else if (tab === "uang-muka") tabs[2].classList.add("active");
  else if (tab === "laporan") tabs[3].classList.add("active");
  else if (tab === "reimbursement") tabs[4].classList.add("active");

  const el = document.getElementById("sppdContent");
  if (!el) return;

  if (tab === "daftar") await loadSPPDDaftar(el);
  else if (tab === "prosedur") loadSPPDProsedur(el);
  else if (tab === "uang-muka") loadSPPDUangMuka(el);
  else if (tab === "laporan") loadSPPDLaporan(el);
  else if (tab === "reimbursement") loadSPPDReimbursement(el);
}

async function loadSPPDDaftar(el) {
  const isPortal = !hasAccess(3);

  const unsub = db
    .collection("hrd_perjalanan_dinas")
    .onSnapshot((snap) => {
      let h = '<div class="card">';
      h += '<div class="table-wrap"><table><thead><tr>';
      h += "<th>No. SPPD</th><th>Nama</th><th>Tujuan</th><th>Tanggal</th><th>Durasi</th><th>Status</th><th>Aksi</th>";
      h += "</tr></thead><tbody>";

      let hasData = false;
      const items = [];
      snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
      items.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

      items.forEach((p) => {
        if (isPortal && p.userId !== currentUser.id) return;
        if (!isPortal && hasAccess(3) && !hasAccess(4)) {
            if (p.userId !== currentUser.id && (p.departemen || "").toLowerCase() !== (currentUser.departemen || "").toLowerCase()) return;
        }
        hasData = true;
        const durasi = p.tanggalMulai && p.tanggalSelesai ? Math.ceil((new Date(p.tanggalSelesai) - new Date(p.tanggalMulai)) / 86400000 + 1) + " hari" : "-";
        const badge = p.status === "approved" ? "badge-success" : p.status === "rejected" ? "badge-danger" : "badge-warning";

        h += `<tr>
          <td class="fw-700">${escHtml(p.noSPPD || "-")}</td>
          <td>${escHtml(p.nama)}</td>
          <td>${escHtml(p.tujuan || "-")}</td>
          <td>${formatDate(p.tanggalMulai)}</td>
          <td>${durasi}</td>
          <td><span class="badge ${badge}">${escHtml(p.status || "pending")}</span></td>
          <td>
            <button class="btn btn-xs btn-info" onclick="viewSPPD('${p.id}')">👁️</button>
            ${p.status === "approved" ? `<button class="btn btn-xs btn-primary" onclick="cetakSPPD('${p.id}')">🖨️</button>` : ""}
          </td>
        </tr>`;
      });

      if (!hasData) h += '<tr><td colspan="7" class="text-center">Belum ada pengajuan</td></tr>';
      h += "</tbody></table></div></div>";
      el.innerHTML = h;
    });

  if (typeof unsubscribers !== "undefined") unsubscribers.push(unsub);
}

function loadSPPDProsedur(el) {
  el.innerHTML = `
    <div class="card">
      <div class="card-title mb-12">📖 Prosedur Perjalanan Dinas</div>
      <div class="text-sm color-gray" style="line-height:1.7">
        <p>1. Karyawan mengajukan SPPD minimal <b>H-3</b> sebelum keberangkatan.</p>
        <p>2. Persetujuan dilakukan secara bertahap: <b>Leader → Manager → GM/BOD</b>.</p>
        <p>3. Setelah SPPD disetujui, karyawan dapat mengajukan <b>Uang Muka</b> (jika diperlukan).</p>
        <p>4. Selama di lokasi dinas, karyawan wajib melakukan <b>Absen Dinas Luar</b> (Selfie + GPS) via menu Absensi.</p>
        <p>5. Setelah kembali, karyawan wajib mengisi <b>Laporan Perjalanan</b> dan menyelesaikan <b>Reimbursement</b> jika ada selisih biaya.</p>
      </div>
    </div>
  `;
}

async function loadSPPDUangMuka(el) {
    const isPortal = !hasAccess(3);
    const unsub = db.collection("hrd_uang_muka_dinas").onSnapshot((snap) => {
        let h = '<div class="card"><div class="card-header"><div class="card-title">💰 Uang Muka</div></div><div class="table-wrap"><table><thead><tr><th>No. SPPD</th><th>Nama</th><th>Jumlah</th><th>Status</th><th>Aksi</th></tr></thead><tbody>';
        let hasData = false;
        snap.forEach(d => {
            const p = d.data();
            if (isPortal && p.userId !== currentUser.id) return;
            hasData = true;
            const badge = p.status === 'dicairkan' ? 'badge-success' : p.status === 'ditolak' ? 'badge-danger' : 'badge-warning';
            h += `<tr><td>${escHtml(p.noSPPD)}</td><td>${escHtml(p.nama)}</td><td>${formatCurrency(p.jumlah)}</td><td><span class="badge ${badge}">${p.status}</span></td><td><button class="btn btn-xs btn-info" onclick="viewUangMukaDinas('${d.id}')">👁️</button></td></tr>`;
        });
        if (!hasData) h += '<tr><td colspan="5" class="text-center">Tidak ada data</td></tr>';
        h += '</tbody></table></div></div>';
        el.innerHTML = h;
    });
    if (typeof unsubscribers !== "undefined") unsubscribers.push(unsub);
}

function loadSPPDLaporan(el) {
    el.innerHTML = '<div class="card"><p class="text-sm">Silakan gunakan menu Detail pada Daftar SPPD untuk mengisi laporan.</p></div>';
}

function loadSPPDReimbursement(el) {
    el.innerHTML = '<div class="card"><p class="text-sm">Riwayat reimbursement perjalanan dinas dapat dilihat pada menu Keuangan atau Detail SPPD.</p></div>';
}

async function modalAjukanSPPD() {
    const noSPPD = "SPPD/" + new Date().getFullYear() + "/" + Math.floor(Math.random() * 900000 + 100000);
    openModal(`
        <div class="modal-title">✈️ Ajukan Perjalanan Dinas</div>
        <div class="form-group"><label>Nomor SPPD</label><input class="form-control" value="${noSPPD}" readonly></div>
        <div class="grid-2">
            <div class="form-group"><label>Nama</label><input class="form-control" id="sppdNama" value="${currentUser.nama}" readonly></div>
            <div class="form-group"><label>Departemen</label><input class="form-control" id="sppdDept" value="${currentUser.departemen}" readonly></div>
        </div>
        <div class="grid-2">
            <div class="form-group"><label>Tujuan</label><input class="form-control" id="sppdTujuan" placeholder="Kota/Lokasi"></div>
            <div class="form-group"><label>Klien/Instansi</label><input class="form-control" id="sppdKlien" placeholder="Opsional"></div>
        </div>
        <div class="grid-2">
            <div class="form-group"><label>Tanggal Mulai</label><input class="form-control" type="date" id="sppdMulai" value="${todayStr()}"></div>
            <div class="form-group"><label>Tanggal Selesai</label><input class="form-control" type="date" id="sppdSelesai" value="${todayStr()}"></div>
        </div>
        <div class="form-group"><label>Keperluan</label><textarea class="form-control" id="sppdKeperluan"></textarea></div>
        <div class="grid-2">
            <div class="form-group"><label>Estimasi Transport</label><input class="form-control" type="number" id="sppdBiayaTransport" value="0"></div>
            <div class="form-group"><label>Estimasi Akomodasi</label><input class="form-control" type="number" id="sppdBiayaAkomodasi" value="0"></div>
        </div>
        <button class="btn btn-primary" style="width:100%" onclick="simpanSPPD('${noSPPD}')">📤 Ajukan SPPD</button>
    `, true);
}

async function simpanSPPD(noSPPD) {
    const data = {
        noSPPD,
        nama: document.getElementById('sppdNama').value,
        departemen: document.getElementById('sppdDept').value,
        tujuan: document.getElementById('sppdTujuan').value,
        klien: document.getElementById('sppdKlien').value,
        tanggalMulai: document.getElementById('sppdMulai').value,
        tanggalSelesai: document.getElementById('sppdSelesai').value,
        keperluan: document.getElementById('sppdKeperluan').value,
        biayaTransport: parseInt(document.getElementById('sppdBiayaTransport').value) || 0,
        biayaAkomodasi: parseInt(document.getElementById('sppdBiayaAkomodasi').value) || 0,
        status: 'pending',
        userId: currentUser.id,
        createdAt: new Date().toISOString(),
    };
    data.totalEstimasi = data.biayaTransport + data.biayaAkomodasi;

    if (!data.tujuan || !data.tanggalMulai || !data.keperluan) return toast("Lengkapi data", "warning");

    await db.collection('hrd_perjalanan_dinas').add(data);
    closeModalDirect();
    toast("SPPD diajukan", "success");
}

async function viewSPPD(id) {
    const d = await db.collection('hrd_perjalanan_dinas').doc(id).get();
    const p = d.data();
    openModal(`
        <div class="modal-title">📋 Detail SPPD — ${p.noSPPD}</div>
        <div class="grid-2 mb-16">
            <div><b>Nama:</b> ${escHtml(p.nama)}</div>
            <div><b>Tujuan:</b> ${escHtml(p.tujuan)}</div>
            <div><b>Status:</b> <span class="badge badge-warning">${p.status}</span></div>
            <div><b>Estimasi:</b> ${formatCurrency(p.totalEstimasi)}</div>
        </div>
        <div><b>Keperluan:</b><p class="text-sm mt-4">${escHtml(p.keperluan)}</p></div>
    `);
}

function cetakSPPD(id) {
    toast("Mencetak...", "info");
}
