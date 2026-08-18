"use strict";
// == KEHADIRAN & DAILY TASK v16.1.5 ===============================
// == CUTI / IZIN / WFH ========================================-
async function renderCuti() {
  const main = document.getElementById("mainContent");
  // Tombol Admin/Manager
  let adminBtns = "";
  if (hasAccess(6)) {
    adminBtns = `
        <button class="btn btn-info btn-sm" onclick="modalCutiBersamaMassal()">⚡ Cuti Bersama Massal</button>
        <button id="btnFixCuti" class="btn btn-warning btn-sm" onclick="fixExistingCutiDurasi()">🛠️ Perbaiki Data</button>
      `;
  }

  main.innerHTML = `<div class="page-title"><span>${renderBackButton()}🏖️ Cuti / Izin / WFH</span><div class="flex gap-8 flex-wrap" style="justify-content:flex-end">${adminBtns}<button class="btn btn-primary btn-sm" onclick="modalCuti()">+ Pengajuan pribadi</button></div></div>
    ${hasAccess(3) ? '<div class="card mb-16"><div class="card-title mb-8">📊 Sisa Jatah Cuti Karyawan</div><div id="cutiQuotaList">Loading...</div></div>' : ""}
    <div class="card"><div class="card-title mb-8">📋 Daftar Pengajuan</div><div class="table-wrap"><table><thead><tr><th>Karyawan</th><th>Keterangan</th><th>Tanggal</th><th>Durasi</th><th>Sisa Cuti</th><th>Status</th><th>Aksi</th></tr></thead><tbody id="tblCuti"></tbody></table></div></div>`;
  // Load data
  const [cutiSnap, karySnap, flows] = await Promise.all([
    !hasAccess(3)
      ? db.collection("hrd_cuti").where("userId", "==", currentUser.id).get()
      : db.collection("hrd_cuti").get(),
    db.collection("hrd_karyawan").where("status", "==", "aktif").get(),
    loadApprovalFlows(),
  ]);
  // Calculate quota per karyawan
  // Index by both userId AND nama (lowercased) so admin table can match by name
  const cutiUsed = {}; // key -> total hari cuti approved (Tahunan & Bersama)
  for (const d of cutiSnap.docs) {
    const p = d.data();
    if (
      p.status === "approved" &&
      (p.jenis === "Cuti Tahunan" || p.jenis === "Cuti Bersama")
    ) {
      const durasi = p.durasi || 1;
      if (p.userId) {
        cutiUsed[p.userId] = (cutiUsed[p.userId] || 0) + durasi;
      }
      if (p.nama) {
        const namaKey = p.nama.trim().toLowerCase();
        cutiUsed[namaKey] = (cutiUsed[namaKey] || 0) + durasi;
      }
    }
  }
  // Build quota table
  let quotaHtml =
    '<div class="table-wrap"><table><thead><tr><th>Nama</th><th>Dept</th><th>Masa Kerja</th><th>Jatah/Tahun</th><th>Terpakai</th><th>Sisa</th></tr></thead><tbody>';
  const karyList = [];
  karySnap.forEach((d) => karyList.push({ id: d.id, ...d.data() }));
  karyList.forEach((k) => {
    const quota = hitungJatahCuti(k);
    const used =
      cutiUsed[k.id] || cutiUsed[(k.nama || "").trim().toLowerCase()] || 0;
    const sisa = Math.max(0, quota - used);
    const masaKerja = hitungMasaKerja(k.tanggalMasuk);
    const color =
      sisa <= 2
        ? "var(--danger)"
        : sisa <= 5
          ? "var(--warning)"
          : "var(--success)";
    quotaHtml += `<tr><td class="fw-700">${escHtml(k.nama)}</td><td>${escHtml(k.departemen || "-")}</td><td>${masaKerja}</td><td>${quota} hari</td><td>${used} hari</td><td style="color:${color};font-weight:700">${sisa} hari</td></tr>`;
  });
  quotaHtml += "</tbody></table></div>";
  const cutiQuotaEl = document.getElementById("cutiQuotaList");
  if (cutiQuotaEl) cutiQuotaEl.innerHTML = quotaHtml;
  // Render cuti list with sisa info
  let h = "";
  if (cutiSnap.empty)
    h = '<tr><td colspan="7" class="text-center">Belum ada</td></tr>';
  else {
    const items = [];
    cutiSnap.forEach((d) => items.push({ id: d.id, ...d.data() }));
    items.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    // Department and role-based filtering
    const isBOD = currentUser.role === "bod";
    const isAdmin = hasAccess(6);
    const myDept = (currentUser.departemen || "").toLowerCase().trim();
    let gradeMapCuti = {};
    let deptMapCuti = {};
    if (hasAccess(3) && !isAdmin) {
      karyList.forEach((k) => {
        const namaLow = (k.nama || "").toLowerCase();
        gradeMapCuti[namaLow] = (
          k.gradeJabatan ||
          k.posisi ||
          ""
        ).toLowerCase();
        deptMapCuti[namaLow] = (k.departemen || "").toLowerCase().trim();
      });
    }
    items.forEach((p) => {
      // Filter based on role
      if (hasAccess(3) && !isAdmin) {
        if (isBOD) {
          // BOD: only head-level
          const grade = gradeMapCuti[(p.nama || "").toLowerCase()] || "";
          if (!grade.includes("head")) return;
        } else if (!hasAccess(4)) {
          // Manager (level 3): only own department
          const pDept = deptMapCuti[(p.nama || "").toLowerCase()] || "";
          if (pDept && pDept !== myDept) return;
        }
        // HEAD (level 4) and GM: see all departments
      }
      const badge =
        p.status === "approved"
          ? "badge-success"
          : p.status === "rejected"
            ? "badge-danger"
            : "badge-warning";
      const uid = p.userId || p.nama;
      const kary = karyList.find(
        (k) =>
          k.id === uid ||
          k.nama === p.nama ||
          (k.nama &&
            p.nama &&
            k.nama.trim().toLowerCase() === p.nama.trim().toLowerCase()),
      );
      const quota = kary ? hitungJatahCuti(kary) : 12;
      const used =
        cutiUsed[uid] || cutiUsed[(p.nama || "").trim().toLowerCase()] || 0;
      const sisa = Math.max(0, quota - used);

      // Multi-step turn check
      const isPending =
        p.status === "pending" || (p.status && p.status.indexOf("step") === 0);

      // IMPROVED FLOW LOOKUP: Sort by steps count to pick the most complete flow
      const category = getApprovalCategory("hrd_cuti", p);
      const steps = getApprovalStepsForItem(flows, p, category);
      const currentStep = p.approvalStep || 0;
      const currentApprover = (steps[currentStep]?.nama || "")
        .toLowerCase()
        .trim();
      const myName = (currentUser.nama || "").toLowerCase().trim();
      const isMyTurn = isAdmin || currentApprover === myName;

      const canApprove = isPending && hasAccess(3) && isMyTurn;
      const canEdit = (p.userId === currentUser.id || hasAccess(6)) && isPending;
      const pendingInfo = pendingApproverHtml(
        flows,
        p,
        p.status,
        p.approvalStep,
        category,
      );
      h += `<tr><td class="fw-700">${escHtml(p.nama)}</td><td><b>${escHtml(p.jenis)}</b><br><small style="color:#666">${escHtml(p.keterangan || "-")}</small></td><td>${formatDate(p.mulai)}-${formatDate(p.selesai)}</td><td>${p.durasi || 1}h</td><td><span class="badge badge-${sisa <= 2 ? "danger" : sisa <= 5 ? "warning" : "success"}">${sisa}/${quota}</span></td><td><span class="badge ${badge}">${p.status}</span>${pendingInfo}</td><td><button class="btn btn-xs btn-info" onclick="viewCutiDetail('${p.id}')" title="Lihat Detail">👁️</button> ${canEdit ? `<button class="btn btn-xs btn-warning" onclick="modalEditCuti('${p.id}')" title="Edit Pengajuan">✏️</button>` : ""} ${canApprove ? `<button class="btn btn-xs btn-success" onclick="approveItem('hrd_cuti','${p.id}','approved')">✅</button> <button class="btn btn-xs btn-danger" onclick="approveItem('hrd_cuti','${p.id}','rejected')">❌</button>` : ""} ${hasAccess(6) || (p.userId === currentUser.id && p.status === "pending") ? `<button class="btn btn-xs btn-danger" onclick="hapusDoc('hrd_cuti','${p.id}','cuti')">🗑️</button>` : ""}</td></tr>`;
    });
  }
  document.getElementById("tblCuti").innerHTML = h;
}

// Hitung jatah cuti berdasarkan masa kerja, status, dan ketentuan
function hitungJatahCuti(karyawan) {
  // Sesuai Kebijakan Umum & Peraturan Pemerintah:
  // Karyawan berhak atas jatah cuti tahunan minimal 12 hari per tahun.

  // Kasus Khusus: Jika BOD atau join date tidak diisi, berikan jatah full 12 hari (kebijakan internal)
  const posLow = (karyawan.posisi || "").toLowerCase();
  const deptLow = (karyawan.departemen || "").toLowerCase();
  if (deptLow.includes("bod") || posLow.includes("founder") || !karyawan.tanggalMasuk) {
    return 12;
  }

  const masuk = new Date(karyawan.tanggalMasuk);
  const now = new Date();

  // Hitung perbedaan bulan secara akurat
  let bulanKerja =
    (now.getFullYear() - masuk.getFullYear()) * 12 +
    (now.getMonth() - masuk.getMonth());
  if (now.getDate() < masuk.getDate()) bulanKerja--;

  // Probation: Jika sudah > 3 bulan, anggap berhak jatah proporsional
  if (karyawan.status === "probation" && bulanKerja < 3) return 0;
  if ((karyawan.status || "").toLowerCase().includes("resign")) return 0;

  // Jatah Proporsional untuk Karyawan Baru (< 1 Tahun): 1 hari per bulan kerja
  if (bulanKerja < 12) {
    return Math.max(0, bulanKerja);
  }

  // Jika sudah >= 12 bulan, berikan jatah standar 12 hari
  return 12;
}

/**
 * Tool Pemeliharaan: Memperbaiki durasi pengajuan cuti yang sudah ada
 * agar tidak menghitung hari Sabtu & Minggu (akhir pekan).
 */
async function fixExistingCutiDurasi() {
  if (
    !confirm(
      "Sistem akan memindai seluruh data cuti dan mengoreksi durasi jika menyertakan akhir pekan. Lanjutkan?",
    )
  )
    return;

  toast("Memulai perbaikan data...", "info");
  const snap = await db.collection("hrd_cuti").get();
  const batch = db.batch();
  let count = 0;

  snap.forEach((doc) => {
    const p = doc.data();
    if (p.mulai && p.selesai) {
      let newDurasi = 0;
      if (p.jenis === "Cuti Melahirkan" || p.jenis === "Cuti Keguguran") {
        newDurasi = Math.max(
          1,
          Math.ceil((new Date(p.selesai) - new Date(p.mulai)) / 86400000) + 1,
        );
      } else {
        newDurasi = countWorkDays(p.mulai, p.selesai);
      }

      if (newDurasi !== p.durasi) {
        batch.update(doc.ref, {
          durasi: newDurasi,
          updatedBySystem: new Date().toISOString(),
        });
        count++;
      }
    }
  });

  if (count > 0) {
    await batch.commit();
    toast(`Berhasil memperbaiki ${count} data cuti.`, "success");
  } else {
    toast("Semua data sudah akurat.", "success");
  }
  renderCuti();
}

function modalCuti() {
  openModal(
    `<div class="modal-title">Pengajuan Cuti / Izin Berbayar</div>
    <div class="grid-2">
      <div class="form-group"><label>Nama</label><input class="form-control" id="ctNama" value="${currentUser.nama}"></div>
      <div class="form-group"><label>Jenis Cuti</label>
        <select class="form-control" id="ctJenis" onchange="onCutiTypeChange()">
          <optgroup label="Cuti Quota (Potong 12 Hari)">
            <option value="Cuti Tahunan">Cuti Tahunan</option>
            <option value="Cuti Bersama">Cuti Bersama</option>
          </optgroup>
          <optgroup label="Cuti Khusus (Izin Berbayar)">
            <option value="Pernikahan Sendiri">Pernikahan Sendiri (3 Hari)</option>
            <option value="Pernikahan Anak">Pernikahan Anak (2 Hari)</option>
            <option value="Khitanan/Baptis Anak">Khitanan/Baptis Anak (2 Hari)</option>
            <option value="Istri Melahirkan/Keguguran">Istri Melahirkan/Keguguran (2 Hari)</option>
            <option value="Kematian Keluarga Inti">Kematian (Suami/Istri/Anak/Ortu/Mertua) (2 Hari)</option>
            <option value="Kematian Anggota Serumah">Kematian Anggota Serumah (1 Hari)</option>
          </optgroup>
          <optgroup label="Kesehatan & Lainnya">
            <option value="Cuti Sakit">Cuti Sakit (Dgn Surat Dokter)</option>
            <option value="Cuti Melahirkan">Cuti Melahirkan (3 Bulan)</option>
            <option value="Cuti Keguguran">Cuti Keguguran (1.5 Bulan)</option>
            <option value="WFH">WFH (Work From Home)</option>
          </optgroup>
        </select>
      </div>
    </div>
    <div id="cutiInfoBox" class="mb-16 p-12 text-xs" style="background:#f9f9f9; border-radius:8px; border-left:4px solid var(--primary); display:none"></div>
    <div class="grid-2">
      <div class="form-group"><label>Mulai</label><input class="form-control" type="date" id="ctMulai" value="${todayStr()}" onchange="autoCalculateCutiEnd()"></div>
      <div class="form-group"><label>Selesai</label><input class="form-control" type="date" id="ctSelesai" value="${todayStr()}"></div>
    </div>
    <div class="form-group"><label>Keterangan</label><textarea class="form-control" id="ctKet" placeholder="Contoh: Acara keluarga, sakit demam, dll"></textarea></div>
    <div class="form-group"><label>📎 Lampiran (Wajib untuk Sakit/Dinas/Cuti Khusus)</label>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
        <button type="button" class="btn btn-sm btn-outline" onclick="document.getElementById('ctFiles').click()">📁 Pilih File</button>
        <button type="button" class="btn btn-sm btn-info" onclick="openCamera('ctFilePreview','ctCameraData')">📷 Kamera</button>
      </div>
      <input type="file" id="ctFiles" multiple accept="image/*,.pdf,.doc,.docx" onchange="previewTaskFiles(this,'ctFilePreview')" style="display:none">
      <input type="hidden" id="ctCameraData">
      <div id="ctFilePreview" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px"></div>
    </div>
    <button class="btn btn-primary" style="width:100%; padding:12px" onclick="simpanCuti()">🚀 Ajukan Pengajuan</button>`,
  );
  onCutiTypeChange();
}

function onCutiTypeChange() {
  const type = document.getElementById("ctJenis").value;
  const info = document.getElementById("cutiInfoBox");
  let text = "";

  const configs = {
    "Cuti Tahunan": "Memotong jatah cuti tahunan (Saldo 12 hari).",
    "Cuti Bersama": "Memotong jatah cuti tahunan sesuai kalender pemerintah.",
    "Pernikahan Sendiri":
      "<b>Jatah: 3 Hari Kerja.</b> Tidak memotong jatah cuti tahunan.",
    "Pernikahan Anak":
      "<b>Jatah: 2 Hari Kerja.</b> Tidak memotong jatah cuti tahunan.",
    "Khitanan/Baptis Anak":
      "<b>Jatah: 2 Hari Kerja.</b> Tidak memotong jatah cuti tahunan.",
    "Istri Melahirkan/Keguguran":
      "<b>Jatah: 2 Hari Kerja.</b> Tidak memotong jatah cuti tahunan.",
    "Kematian Keluarga Inti":
      "<b>Jatah: 2 Hari Kerja.</b> Untuk Suami/Istri/Anak/Orang Tua/Mertua.",
    "Kematian Anggota Serumah":
      "<b>Jatah: 1 Hari Kerja.</b> Untuk anggota keluarga yang tinggal serumah.",
    "Cuti Melahirkan":
      "<b>Jatah: 3 Bulan (Hari Kalender).</b> 1.5 bulan sebelum & 1.5 bulan sesudah.",
    "Cuti Keguguran":
      "<b>Jatah: 1.5 Bulan (Hari Kalender).</b> Dengan surat keterangan dokter.",
    "Cuti Sakit":
      "Wajib melampirkan Surat Keterangan Dokter jika lebih dari 2 hari.",
    WFH: "Bekerja dari rumah, tetap dianggap hadir penuh.",
  };

  if (configs[type]) {
    info.style.display = "block";
    info.innerHTML = configs[type];
  } else {
    info.style.display = "none";
  }
  autoCalculateCutiEnd();
}

function autoCalculateCutiEnd() {
  const type = document.getElementById("ctJenis").value;
  const startVal = document.getElementById("ctMulai").value;
  if (!startVal) return;

  const start = new Date(startVal + "T00:00:00");
  const endInput = document.getElementById("ctSelesai");

  // Config: type -> [days, isCalendarDay]
  const durations = {
    "Pernikahan Sendiri": [3, false],
    "Pernikahan Anak": [2, false],
    "Khitanan/Baptis Anak": [2, false],
    "Istri Melahirkan/Keguguran": [2, false],
    "Kematian Keluarga Inti": [2, false],
    "Kematian Anggota Serumah": [1, false],
    "Cuti Melahirkan": [90, true],
    "Cuti Keguguran": [45, true],
  };

  if (durations[type]) {
    const [days, isCalendar] = durations[type];
    let end = new Date(start);

    if (isCalendar) {
      end.setDate(start.getDate() + (days - 1));
    } else {
      // Count work days (excluding weekend)
      let added = 1;
      while (added < days) {
        end.setDate(end.getDate() + 1);
        const day = end.getDay();
        if (day !== 0 && day !== 6) added++;
      }
    }
    endInput.value = end.toISOString().split("T")[0];
  }
}
async function simpanCuti() {
  const mulai = document.getElementById("ctMulai").value,
    selesai = document.getElementById("ctSelesai").value;
  const jenis = document.getElementById("ctJenis").value;

  // Perhitungan durasi:
  // Cuti Melahirkan & Keguguran dihitung hari kalender (termasuk Sabtu-Minggu)
  // Jenis lainnya (Cuti Tahunan, Sakit, Izin Khusus, WFH) hanya menghitung hari kerja
  let durasi = 0;
  if (jenis === "Cuti Melahirkan" || jenis === "Cuti Keguguran") {
    durasi = Math.max(
      1,
      Math.ceil(
        (new Date(selesai + "T00:00:00") - new Date(mulai + "T00:00:00")) /
          86400000,
      ) + 1,
    );
  } else {
    durasi = countWorkDays(mulai, selesai);
  }

  const attachments = await getFilesAsBase64("ctFiles");
  const nama = document.getElementById("ctNama").value;

  if (!nama) return toast("Nama wajib", "warning");

  // --- VALIDASI JATAH CUTI (v14.8) ---
  if (jenis === "Cuti Tahunan") {
    try {
      const kSnapForQuota = await db
        .collection("hrd_karyawan")
        .where("nama", "==", currentUser.nama)
        .limit(1)
        .get();
      if (!kSnapForQuota.empty) {
        const kData = kSnapForQuota.docs[0].data();
        const totalQuota = hitungJatahCuti(kData);

        // Get already used leave
        const cSnap = await db
          .collection("hrd_cuti")
          .where("userId", "==", currentUser.id)
          .get();
        let used = 0;
        cSnap.forEach((doc) => {
          const d = doc.data();
          if (
            d.status === "approved" &&
            (d.jenis === "Cuti Tahunan" || d.jenis === "Cuti Bersama")
          ) {
            used += d.durasi || 1;
          }
        });

        const remaining = Math.max(0, totalQuota - used);
        if (durasi > remaining) {
          return toast(
            `Gagal: Sisa jatah cuti Anda (${remaining} hari) tidak mencukupi untuk pengajuan ${durasi} hari.`,
            "warning",
          );
        }
      }
    } catch (e) {
      console.warn("Quota validation failed, continuing...", e);
    }
  }

  const data = {
    nama: nama,
    jenis: jenis,
    mulai,
    selesai,
    durasi,
    keterangan: document.getElementById("ctKet").value,
    attachments,
    status: "pending",
    userId: currentUser.id,
    createdAt: new Date().toISOString(),
  };
  if (!data.nama) return toast("Nama wajib", "warning");
  // Find atasan (supervisor) from karyawan data for hierarchical approval
  const kSnap = await db
    .collection("hrd_karyawan")
    .where("nama", "==", currentUser.nama)
    .limit(1)
    .get();
  if (!kSnap.empty) {
    const kData = kSnap.docs[0].data();
    data.atasan = kData.atasan || "";
    data.departemen = kData.departemen || "";
  }
  await db.collection("hrd_cuti").add(data);
  // Notify atasan first, then HR
  if (data.atasan) {
    const atasanSnap = await db
      .collection("hrd_users")
      .where("nama", "==", data.atasan)
      .limit(1)
      .get();
    if (!atasanSnap.empty)
      await sendNotification(
        atasanSnap.docs[0].id,
        "📋 Pengajuan Cuti",
        `${data.nama} mengajukan ${data.jenis} (${durasi} hari)`,
        "approval-center",
      );
  }
  await sendNotification(
    "hr",
    "📋 Pengajuan Cuti",
    `${data.nama} mengajukan ${data.jenis}`,
    "approval-center",
  );
  closeModalDirect();
  toast(
    "Diajukan ke atasan & HR. Data akan sinkron ke penggajian setelah disetujui.",
    "success",
  );
  renderCuti();
}

async function viewCutiDetail(id) {
  const [doc, flows] = await Promise.all([
    db.collection("hrd_cuti").doc(id).get(),
    loadApprovalFlows(),
  ]);
  if (!doc.exists) return toast("Data tidak ditemukan", "warning");
  const p = doc.data();
  let attachHtml = "";
  if (p.attachments && p.attachments.length) {
    attachHtml =
      '<tr><td class="fw-700" style="padding:6px 8px">Lampiran</td><td style="padding:6px 8px"><div style="display:flex;gap:8px;flex-wrap:wrap">';
    for (const a of p.attachments) {
      const fileData = encodeURIComponent(
        JSON.stringify({ name: a.name, type: a.type, data: a.data }),
      );
      if (a.data && (a.type || "").startsWith("image/")) {
        attachHtml +=
          '<img src="' +
          a.data +
          '" style="max-width:100px;max-height:100px;border-radius:6px;border:1px solid #ddd;cursor:pointer" onclick="viewEviden(\'' +
          fileData +
          "')\">";
      } else {
        attachHtml +=
          '<div style="cursor:pointer;padding:6px 10px;background:#f9f9f9;border-radius:6px;font-size:.8rem;border:1px solid #d0d9ff;display:flex;align-items:center;gap:6px" onclick="viewEviden(\'' +
          fileData +
          "')\">" +
          "<span>📄 " +
          escHtml(a.name || "Dokumen") +
          "</span>" +
          '<span style="font-size:.6rem;color:#1565c0;font-weight:600">👁️ Lihat</span>' +
          "</div>";
      }
    }
    attachHtml += "</div></td></tr>";
  }
  // Pending approver row
  let pendingRow = "";
  const isPending =
    p.status === "pending" || (p.status && p.status.indexOf("step") === 0);

  // Build History Logs
  let historyHtml = "";
  if (p.approvalHistory && p.approvalHistory.length > 0) {
    historyHtml =
      '<div style="margin-top:16px; border-top:1px solid #eee; padding-top:12px"><div class="fw-700 mb-8" style="font-size:0.85rem; color:#555">📋 Riwayat Approval:</div>';
    p.approvalHistory.forEach((h) => {
      const hDate = formatDateTime(h.at);
      const actionLabel = h.action === "approved" ? "DISETUJUI" : "DITOLAK";
      const color = h.action === "approved" ? "#2e7d32" : "#c62828";
      historyHtml += `
        <div style="margin-bottom:8px; font-size:0.78rem; background:#fff; border:1px solid #f0f0f0; padding:8px; border-radius:6px">
            <div style="display:flex; justify-content:space-between; margin-bottom:2px">
                <b style="color:var(--primary)">${escHtml(h.nama)}</b>
                <span style="color:#999">${hDate}</span>
            </div>
            <div style="color:${color}; font-weight:700; font-size:0.65rem">${actionLabel}</div>
            ${h.catatan ? `<div class="mt-4" style="color:#666; font-style:italic">"${escHtml(h.catatan)}"</div>` : ""}
        </div>`;
    });
    historyHtml += "</div>";
  }

  let approveBtns = "";
  let editBtn = "";
  if (isPending) {
    const category = getApprovalCategory("hrd_cuti", p);
    const steps = getApprovalStepsForItem(flows, p, category);
    const currentStep = p.approvalStep || 0;
    const currentApprover = (steps[currentStep]?.nama || "")
      .toLowerCase()
      .trim();
    const myName = (currentUser.nama || "").toLowerCase().trim();
    const isMyTurn = hasAccess(6) || currentApprover === myName;

    if (isMyTurn && hasAccess(3)) {
      approveBtns = `
          <button class="btn btn-danger" onclick="approveItem('hrd_cuti','${id}','rejected')">❌ Tolak</button>
          <button class="btn btn-success" onclick="approveItem('hrd_cuti','${id}','approved')">✅ Setujui</button>`;
    }

    if (p.userId === currentUser.id || hasAccess(6)) {
      editBtn = `<button class="btn btn-warning" onclick="modalEditCuti('${id}')">✏️ Edit Pengajuan</button>`;
    }
  }

  if (isPending) {
    const approver = getApproverForItem(
      flows,
      p,
      p.approvalStep,
      getApprovalCategory("hrd_cuti", p),
    );
    if (approver) {
      pendingRow =
        '<tr><td class="fw-700" style="padding:6px 8px;color:#1565c0">\u23F3 Pending di</td><td style="padding:6px 8px;color:#1565c0;font-weight:700">' +
        escHtml(approver) +
        "</td></tr>";
    }
  }
  openModal(
    `<div class="modal-title">Detail Cuti/Izin</div>
    <table style="width:100%;border-collapse:collapse">
      <tr><td class="fw-700" style="padding:6px 8px;width:120px">Nama</td><td style="padding:6px 8px">${escHtml(p.nama || "-")}</td></tr>
      <tr><td class="fw-700" style="padding:6px 8px">Jenis</td><td style="padding:6px 8px">${escHtml(p.jenis || "-")}</td></tr>
      <tr><td class="fw-700" style="padding:6px 8px">Mulai</td><td style="padding:6px 8px">${formatDate(p.mulai)}</td></tr>
      <tr><td class="fw-700" style="padding:6px 8px">Selesai</td><td style="padding:6px 8px">${formatDate(p.selesai)}</td></tr>
      <tr><td class="fw-700" style="padding:6px 8px">Durasi</td><td style="padding:6px 8px">${p.durasi || 1} hari</td></tr>
      <tr><td class="fw-700" style="padding:6px 8px">Keterangan</td><td style="padding:6px 8px">${escHtml(p.keterangan || "-")}</td></tr>
      <tr><td class="fw-700" style="padding:6px 8px">Status</td><td style="padding:6px 8px"><span class="badge badge-${p.status === "approved" ? "success" : p.status === "rejected" ? "danger" : "warning"}">${p.status || "pending"}</span></td></tr>
      ${pendingRow}
      ${attachHtml}
      <tr><td class="fw-700" style="padding:6px 8px">Approved By</td><td style="padding:6px 8px">${escHtml(p.approvedBy || "-")}</td></tr>
      <tr><td class="fw-700" style="padding:6px 8px">Created At</td><td style="padding:6px 8px">${p.createdAt ? formatDate(p.createdAt.split("T")[0]) : "-"}</td></tr>
    </table>
    ${historyHtml}
    <div class="flex gap-8 mt-16" style="justify-content:flex-end; border-top:1px solid #eee; padding-top:16px">
      <button class="btn btn-outline" onclick="closeModalDirect()">Tutup</button>
      ${editBtn}
      ${approveBtns}
    </div>`,
    true,
  );
}

async function modalEditCuti(id) {
  const doc = await db.collection("hrd_cuti").doc(id).get();
  if (!doc.exists) return toast("Data tidak ditemukan", "warning");
  const p = doc.data();

  window._existingCutiAttachments = p.attachments || [];

  const renderExistingAttachments = () => {
    let html = "";
    window._existingCutiAttachments.forEach((a, idx) => {
      html += `
        <div style="position:relative; display:inline-block">
          ${(a.type || "").startsWith("image/") ? `<img src="${a.data}" style="width:60px;height:60px;object-fit:cover;border-radius:4px;border:1px solid #ddd">` : `<div style="width:60px;height:60px;display:flex;align-items:center;justify-content:center;background:#eee;border-radius:4px;font-size:1.5rem">📄</div>`}
          <button onclick="removeExistingCutiAttachment(${idx})" style="position:absolute;top:-5px;right:-5px;background:red;color:white;border:none;border-radius:50%;width:18px;height:18px;font-size:12px;cursor:pointer;line-height:1">×</button>
        </div>`;
    });
    const el = document.getElementById("existingCutiAttachments");
    if (el) el.innerHTML = html;
  };

  window.removeExistingCutiAttachment = (idx) => {
    window._existingCutiAttachments.splice(idx, 1);
    renderExistingAttachments();
  };

  openModal(`
    <div class="modal-title">Edit Pengajuan Cuti / Izin</div>
    <div class="grid-2">
      <div class="form-group"><label>Nama</label><input class="form-control" id="editCtNama" value="${escHtml(p.nama)}" readonly></div>
      <div class="form-group"><label>Jenis Cuti</label>
        <select class="form-control" id="editCtJenis" onchange="onCutiTypeChangeEdit()">
          <optgroup label="Cuti Quota (Potong 12 Hari)">
            <option value="Cuti Tahunan" ${p.jenis === "Cuti Tahunan" ? "selected" : ""}>Cuti Tahunan</option>
            <option value="Cuti Bersama" ${p.jenis === "Cuti Bersama" ? "selected" : ""}>Cuti Bersama</option>
          </optgroup>
          <optgroup label="Cuti Khusus (Izin Berbayar)">
            <option value="Pernikahan Sendiri" ${p.jenis === "Pernikahan Sendiri" ? "selected" : ""}>Pernikahan Sendiri (3 Hari)</option>
            <option value="Pernikahan Anak" ${p.jenis === "Pernikahan Anak" ? "selected" : ""}>Pernikahan Anak (2 Hari)</option>
            <option value="Khitanan/Baptis Anak" ${p.jenis === "Khitanan/Baptis Anak" ? "selected" : ""}>Khitanan/Baptis Anak (2 Hari)</option>
            <option value="Istri Melahirkan/Keguguran" ${p.jenis === "Istri Melahirkan/Keguguran" ? "selected" : ""}>Istri Melahirkan/Keguguran (2 Hari)</option>
            <option value="Kematian Keluarga Inti" ${p.jenis === "Kematian Keluarga Inti" ? "selected" : ""}>Kematian (Suami/Istri/Anak/Ortu/Mertua) (2 Hari)</option>
            <option value="Kematian Anggota Serumah" ${p.jenis === "Kematian Anggota Serumah" ? "selected" : ""}>Kematian Anggota Serumah (1 Hari)</option>
          </optgroup>
          <optgroup label="Kesehatan & Lainnya">
            <option value="Cuti Sakit" ${p.jenis === "Cuti Sakit" ? "selected" : ""}>Cuti Sakit (Dgn Surat Dokter)</option>
            <option value="Cuti Melahirkan" ${p.jenis === "Cuti Melahirkan" ? "selected" : ""}>Cuti Melahirkan (3 Bulan)</option>
            <option value="Cuti Keguguran" ${p.jenis === "Cuti Keguguran" ? "selected" : ""}>Cuti Keguguran (1.5 Bulan)</option>
            <option value="WFH" ${p.jenis === "WFH" ? "selected" : ""}>WFH (Work From Home)</option>
          </optgroup>
        </select>
      </div>
    </div>
    <div id="cutiInfoBoxEdit" class="mb-16 p-12 text-xs" style="background:#f9f9f9; border-radius:8px; border-left:4px solid var(--primary); display:none"></div>
    <div class="grid-2">
      <div class="form-group"><label>Mulai</label><input class="form-control" type="date" id="editCtMulai" value="${p.mulai}" onchange="autoCalculateCutiEndEdit()"></div>
      <div class="form-group"><label>Selesai</label><input class="form-control" type="date" id="editCtSelesai" value="${p.selesai}"></div>
    </div>
    <div class="form-group"><label>Keterangan</label><textarea class="form-control" id="editCtKet" placeholder="Contoh: Acara keluarga, sakit demam, dll">${escHtml(p.keterangan || "")}</textarea></div>

    <div class="form-group">
      <label>Lampiran Saat Ini</label>
      <div id="existingCutiAttachments" style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px"></div>
    </div>

    <div class="form-group"><label>Tambah Lampiran Baru</label>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
        <button type="button" class="btn btn-sm btn-outline" onclick="document.getElementById('editCtFiles').click()">📁 Pilih File</button>
        <button type="button" class="btn btn-sm btn-info" onclick="openCamera('editCtFilePreview','editCtCameraData')">📷 Kamera</button>
      </div>
      <input type="file" id="editCtFiles" multiple accept="image/*,.pdf,.doc,.docx" onchange="previewTaskFiles(this,'editCtFilePreview')" style="display:none">
      <input type="hidden" id="editCtCameraData">
      <div id="editCtFilePreview" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px"></div>
    </div>
    <div class="flex gap-8">
        <button class="btn btn-primary" style="flex:1; padding:12px" onclick="updateCuti('${id}')">💾 Simpan Perubahan</button>
        <button class="btn btn-outline" style="padding:12px" onclick="closeModalDirect()">Batal</button>
    </div>
  `);

  renderExistingAttachments();
  window.onCutiTypeChangeEdit = () => {
    const type = document.getElementById("editCtJenis").value;
    const info = document.getElementById("cutiInfoBoxEdit");
    const configs = {
      "Cuti Tahunan": "Memotong jatah cuti tahunan (Saldo 12 hari).",
      "Cuti Bersama": "Memotong jatah cuti tahunan sesuai kalender pemerintah.",
      "Pernikahan Sendiri": "<b>Jatah: 3 Hari Kerja.</b>",
      "Pernikahan Anak": "<b>Jatah: 2 Hari Kerja.</b>",
      "Khitanan/Baptis Anak": "<b>Jatah: 2 Hari Kerja.</b>",
      "Istri Melahirkan/Keguguran": "<b>Jatah: 2 Hari Kerja.</b>",
      "Kematian Keluarga Inti": "<b>Jatah: 2 Hari Kerja.</b>",
      "Kematian Anggota Serumah": "<b>Jatah: 1 Hari Kerja.</b>",
      "Cuti Melahirkan": "<b>Jatah: 3 Bulan.</b>",
      "Cuti Keguguran": "<b>Jatah: 1.5 Bulan.</b>",
      "Cuti Sakit": "Wajib melampirkan Surat Keterangan Dokter.",
      WFH: "Bekerja dari rumah.",
    };
    if (configs[type]) {
      info.style.display = "block";
      info.innerHTML = configs[type];
    } else {
      info.style.display = "none";
    }
    window.autoCalculateCutiEndEdit();
  };

  window.autoCalculateCutiEndEdit = () => {
    const type = document.getElementById("editCtJenis").value;
    const startVal = document.getElementById("editCtMulai").value;
    if (!startVal) return;
    const start = new Date(startVal + "T00:00:00");
    const endInput = document.getElementById("editCtSelesai");
    const durations = {
      "Pernikahan Sendiri": [3, false],
      "Pernikahan Anak": [2, false],
      "Khitanan/Baptis Anak": [2, false],
      "Istri Melahirkan/Keguguran": [2, false],
      "Kematian Keluarga Inti": [2, false],
      "Kematian Anggota Serumah": [1, false],
      "Cuti Melahirkan": [90, true],
      "Cuti Keguguran": [45, true],
    };
    if (durations[type]) {
      const [days, isCalendar] = durations[type];
      let end = new Date(start);
      if (isCalendar) {
        end.setDate(start.getDate() + (days - 1));
      } else {
        let added = 1;
        while (added < days) {
          end.setDate(end.getDate() + 1);
          if (end.getDay() !== 0 && end.getDay() !== 6) added++;
        }
      }
      endInput.value = end.toISOString().split("T")[0];
    }
  };
  window.onCutiTypeChangeEdit();
}

async function updateCuti(id) {
  const mulai = document.getElementById("editCtMulai").value,
    selesai = document.getElementById("editCtSelesai").value;
  const jenis = document.getElementById("editCtJenis").value;

  let durasi = 0;
  if (jenis === "Cuti Melahirkan" || jenis === "Cuti Keguguran") {
    durasi = Math.max(
      1,
      Math.ceil(
        (new Date(selesai + "T00:00:00") - new Date(mulai + "T00:00:00")) /
          86400000,
      ) + 1,
    );
  } else {
    durasi = countWorkDays(mulai, selesai);
  }

  const newAttachments = await getFilesAsBase64("editCtFiles");
  // Ensure we don't have any hidden complexity in existing attachments
  const existingAttachments = Array.isArray(window._existingCutiAttachments) ? window._existingCutiAttachments : [];
  const allAttachments = [
    ...existingAttachments,
    ...newAttachments,
  ];

  try {
    toast("⏳ Menyimpan perubahan...", "info");

    // EXTREME CLEANING: Re-create every object to ensure NO prototype or hidden properties
    const cleanAttachments = [];
    allAttachments.forEach(a => {
        if (!a || typeof a !== 'object') return;
        cleanAttachments.push({
            name: String(a.name || "File"),
            type: String(a.type || ""),
            size: Number(a.size || 0),
            data: String(a.data || "")
        });
    });

    const payload = {
        jenis: String(jenis || ""),
        mulai: String(mulai || ""),
        selesai: String(selesai || ""),
        durasi: Number(durasi) || 0,
        keterangan: String(document.getElementById("editCtKet")?.value || ""),
        attachments: cleanAttachments,
        updatedAt: new Date().toISOString(),
    };

    // Use .set with merge:true as it's often more reliable for complex updates in some SDKs
    await db.collection("hrd_cuti").doc(id).set(payload, { merge: true });

    toast("Pengajuan cuti berhasil diperbarui", "success");
    closeModalDirect();
    renderCuti();
  } catch (e) {
    console.error("[Cuti Update Error Detailed]", e);
    toast("Gagal update: " + e.message, "error");
  }
}

// == OVERTIME ==================================================
async function renderOvertime() {
  const main = document.getElementById("mainContent");
  main.innerHTML = `<div class="page-title"><span>${renderBackButton()}⏰ Overtime</span><button class="btn btn-primary btn-sm" onclick="modalOvertime()">+ Pengajuan</button></div><div class="card"><div class="table-wrap"><table><thead><tr><th>Karyawan</th><th>Tanggal</th><th>Jam</th><th>Durasi</th><th>Status</th><th>Aksi</th></tr></thead><tbody id="tblOT"></tbody></table></div></div>`;
  let snap;
  if (!hasAccess(3)) {
    // Staff/Leader: only own overtime
    snap = await db
      .collection("hrd_overtime")
      .where("userId", "==", currentUser.id)
      .get();
  } else {
    snap = await db.collection("hrd_overtime").get();
  }
  const flows = await loadApprovalFlows();
  const isBOD = currentUser.role === "bod";
  const isAdmin = hasAccess(6);
  const myDept = (currentUser.departemen || "").toLowerCase().trim();
  // Build dept map for filtering
  let deptMapOT = {};
  let gradeMapOT = {};
  if (hasAccess(3) && !isAdmin) {
    const kSnap = await db.collection("hrd_karyawan").get();
    for (const d of kSnap.docs) {
      const k = d.data();
      const namaLow = (k.nama || "").toLowerCase();
      deptMapOT[namaLow] = (k.departemen || "").toLowerCase().trim();
      gradeMapOT[namaLow] = (k.gradeJabatan || k.posisi || "").toLowerCase();
    }
  }
  let h = "";
  if (snap.empty)
    h = '<tr><td colspan="6" class="text-center">Belum ada</td></tr>';
  else
    snap.forEach((d) => {
      const p = d.data();
      // Filter by department for manager/head (not admin)
      if (hasAccess(3) && !isAdmin) {
        const pDept =
          deptMapOT[(p.nama || "").toLowerCase()] ||
          (p.departemen || "").toLowerCase().trim();
        if (isBOD) {
          // BOD: only head-level
          const grade = gradeMapOT[(p.nama || "").toLowerCase()] || "";
          if (!grade.includes("head")) return;
        } else if (!hasAccess(4)) {
          // Manager (level 3): only own department
          if (pDept && pDept !== myDept) return;
        }
        // HEAD (level 4) and GM: see all departments
      }
      const badge =
        p.status === "approved"
          ? "badge-success"
          : p.status === "rejected"
            ? "badge-danger"
            : "badge-warning";

      // Multi-step turn check
      const isPending =
        p.status === "pending" || (p.status && p.status.indexOf("step") === 0);
      const steps = getApprovalStepsForItem(
        flows,
        p,
        getApprovalCategory("hrd_overtime", p),
      );
      const currentStep = p.approvalStep || 0;
      const currentApprover = (steps[currentStep]?.nama || "")
        .toLowerCase()
        .trim();
      const myName = (currentUser.nama || "").toLowerCase().trim();
      const isMyTurn = isAdmin || currentApprover === myName;

      const canApprove = isPending && hasAccess(3) && isMyTurn;
      const pendingInfo = pendingApproverHtml(
        flows,
        p,
        p.status,
        p.approvalStep,
        getApprovalCategory("hrd_overtime", p),
      );
      h += `<tr><td class="fw-700">${escHtml(p.nama)}</td><td>${formatDate(p.tanggal)}</td><td>${p.jamMulai || "-"}-${p.jamSelesai || "-"}</td><td>${p.durasi || 0}j</td><td><span class="badge ${badge}">${p.status}</span>${pendingInfo}</td><td><button class="btn btn-xs btn-info" onclick="viewOvertimeDetail('${d.id}')">👁️</button> ${canApprove ? `<button class="btn btn-xs btn-success" onclick="approveItem('hrd_overtime','${d.id}','approved')">✅</button> <button class="btn btn-xs btn-danger" onclick="approveItem('hrd_overtime','${d.id}','rejected')">❌</button>` : ""} ${hasAccess(6) ? `<button class="btn btn-xs btn-warning" onclick="editOTDoc('${d.id}')">✏️</button> <button class="btn btn-xs btn-danger" onclick="hapusDoc('hrd_overtime','${d.id}','overtime')">🗑️</button>` : ""}</td></tr>`;
    });
  document.getElementById("tblOT").innerHTML = h;
}
function modalOvertime() {
  openModal(
    `<div class="modal-title">Pengajuan Overtime</div><div class="form-group"><label>Nama</label><input class="form-control" id="otNama" value="${currentUser.nama}"></div><div class="grid-3"><div class="form-group"><label>Tanggal</label><input class="form-control" type="date" id="otTgl" value="${todayStr()}"></div><div class="form-group"><label>Mulai</label><input class="form-control" type="time" id="otStart"></div><div class="form-group"><label>Selesai</label><input class="form-control" type="time" id="otEnd"></div></div><div class="form-group"><label>Alasan</label><textarea class="form-control" id="otAlasan"></textarea></div><div class="form-group"><label>📎 Lampiran (Foto/Dokumen)</label><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px"><button type="button" class="btn btn-sm btn-outline" onclick="document.getElementById('otFiles').click()">📁 Pilih File</button><button type="button" class="btn btn-sm btn-info" onclick="openCamera('otFilePreview','otCameraData')">📷 Kamera</button></div><input type="file" id="otFiles" multiple accept="image/*,.pdf,.doc,.docx" onchange="previewTaskFiles(this,'otFilePreview')" style="display:none"><input type="hidden" id="otCameraData"><div id="otFilePreview" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px"></div><div class="text-xs" style="color:#999;margin-top:4px">Maks 5 file. Format: Gambar, PDF, DOC</div></div><button class="btn btn-primary" onclick="simpanOvertime()">Ajukan</button>`,
  );
}
async function simpanOvertime() {
  const s = document.getElementById("otStart").value,
    e = document.getElementById("otEnd").value;
  const durasi =
    s && e
      ? Math.max(
          0,
          (new Date("2000-01-01T" + e) - new Date("2000-01-01T" + s)) / 3600000,
        ).toFixed(1)
      : 0;
  const attachments = await getFilesAsBase64("otFiles");
  await db.collection("hrd_overtime").add({
    nama: document.getElementById("otNama").value,
    tanggal: document.getElementById("otTgl").value,
    jamMulai: s,
    jamSelesai: e,
    durasi: parseFloat(durasi),
    alasan: document.getElementById("otAlasan").value,
    attachments,
    status: "pending",
    userId: currentUser.id,
    createdAt: new Date().toISOString(),
  });
  await sendNotification(
    "hr",
    "📋 Pengajuan Overtime",
    `${currentUser.nama} mengajukan overtime ${document.getElementById("otTgl").value} (${durasi} jam)`,
    "approval-center",
  );
  closeModalDirect();
  toast("Diajukan", "success");
  renderOvertime();
}

// == HARI LIBUR ================================================

// Indonesian National Holidays moved to core.js

let hariLiburCalendarMonth = null;
let hariLiburViewMode = "myCalendar"; // 'myCalendar' or 'daftar'

async function renderHariLibur() {
  const main = document.getElementById("mainContent");
  if (!hariLiburCalendarMonth) {
    const now = new Date();
    hariLiburCalendarMonth = { year: now.getFullYear(), month: now.getMonth() };
  }
  main.innerHTML = `
    <div class="page-title"><span>${renderBackButton()}📅 Hari Libur</span></div>
    <div class="card">
      <div class="tabs mb-16" id="hariLiburTabs">
        <div class="tab ${hariLiburViewMode === "myCalendar" ? "active" : ""}" onclick="switchHariLiburView('myCalendar')">📅 Kalender</div>
        <div class="tab ${hariLiburViewMode === "daftar" ? "active" : ""}" onclick="switchHariLiburView('daftar')">📋 Daftar Libur</div>
      </div>
      <div id="hariLiburContent"></div>
    </div>`;
  await loadHariLiburView();
}

function switchHariLiburView(mode) {
  hariLiburViewMode = mode;
  renderHariLibur();
}

function hariLiburPrevMonth() {
  hariLiburCalendarMonth.month--;
  if (hariLiburCalendarMonth.month < 0) {
    hariLiburCalendarMonth.month = 11;
    hariLiburCalendarMonth.year--;
  }
  loadHariLiburView();
}

function hariLiburNextMonth() {
  hariLiburCalendarMonth.month++;
  if (hariLiburCalendarMonth.month > 11) {
    hariLiburCalendarMonth.month = 0;
    hariLiburCalendarMonth.year++;
  }
  loadHariLiburView();
}

async function loadHariLiburView() {
  const y = hariLiburCalendarMonth.year;
  const m = hariLiburCalendarMonth.month;
  const container = document.getElementById("hariLiburContent");
  if (!container) return;
  window._hariLiburUserReminders = [];
  window._hariLiburUserNotes = [];

  if (hariLiburViewMode === "myCalendar") {
    renderMyCalendarView(container);
  } else {
    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    const startDate = `${y}-${String(m + 1).padStart(2, "0")}-01`;
    const endDate = `${y}-${String(m + 1).padStart(2, "0")}-${String(new Date(y, m + 1, 0).getDate()).padStart(2, "0")}`;
    let holidays = [];
    try {
      const snap = await db.collection("hrd_hari_libur").get();
      for (const d of snap.docs) {
        const data = d.data();
        if (data.tanggal >= startDate && data.tanggal <= endDate)
          holidays.push({ id: d.id, ...data });
      }
    } catch (e) {
      console.warn("Failed to load holidays:", e);
    }
    let navHtml = `<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:16px">
      <div style="display:flex;align-items:center;gap:8px">
        <button class="btn btn-sm btn-outline" onclick="hariLiburPrevMonth()">&lt;</button>
        <span class="fw-700 color-primary" style="min-width:140px;text-align:center">${monthNames[m]} ${y}</span>
        <button class="btn btn-sm btn-outline" onclick="hariLiburNextMonth()">&gt;</button>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${hasAccess(6) ? '<button class="btn btn-info btn-sm" onclick="syncHariLiburNasional()">🔄 Sinkron Nasional</button>' : ""}
        ${hasAccess(6) ? '<button class="btn btn-primary btn-sm" onclick="modalHariLibur()">+ Tambah Custom</button>' : ""}
      </div>
    </div>`;
    container.innerHTML = navHtml;
    const listDiv = document.createElement("div");
    container.appendChild(listDiv);
    renderHariLiburList(listDiv, y, m, holidays);
  }
}

function renderHariLiburList(container, year, month, holidays) {
  let html =
    '<div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Nama</th><th>Tipe</th><th>Aksi</th></tr></thead><tbody>';
  if (!holidays.length) {
    html +=
      '<tr><td colspan="4" class="text-center">Tidak ada hari libur bulan ini</td></tr>';
  } else {
    holidays.forEach((h) => {
      const tipeBadge =
        h.tipe === "nasional"
          ? "badge-danger"
          : h.tipe === "cuti_bersama"
            ? "badge-warning"
            : "badge-info";
      const tipeLabel =
        h.tipe === "nasional"
          ? "Nasional"
          : h.tipe === "cuti_bersama"
            ? "Cuti Bersama"
            : "Perusahaan";
      html += `<tr>
        <td>${formatDate(h.tanggal)}</td>
        <td class="fw-700">${escHtml(h.nama)}</td>
        <td><span class="badge ${tipeBadge}">${tipeLabel}</span></td>
        <td>
          <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&dates=${h.tanggal.replace(/-/g, "")}/${h.tanggal.replace(/-/g, "")}&text=${encodeURIComponent(h.nama)}" target="_blank" class="btn btn-xs btn-info" title="Tambah ke Google Calendar">📅</a>
          ${hasAccess(6) ? '<button class="btn btn-xs btn-danger" onclick="hapusHariLibur(\'' + h.id + "')\">🗑️</button>" : ""}
        </td>
      </tr>`;
    });
  }
  html += "</tbody></table></div>";
  container.innerHTML = html;
}

async function renderMyCalendarView(container) {
  const y = hariLiburCalendarMonth.year;
  const m = hariLiburCalendarMonth.month;
  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const dayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const today = todayStr();

  // Navigation
  let navHtml = `<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:16px">
    <div style="display:flex;align-items:center;gap:8px">
      <button class="btn btn-sm btn-outline" onclick="hariLiburPrevMonth()">&lt;</button>
      <span class="fw-700 color-primary" style="min-width:140px;text-align:center">${monthNames[m]} ${y}</span>
      <button class="btn btn-sm btn-outline" onclick="hariLiburNextMonth()">&gt;</button>
    </div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
      ${hasAccess(6) ? '<button class="btn btn-info btn-sm" onclick="syncHariLiburNasional()">🔄 Sinkron</button>' : ""}
      ${hasAccess(6) ? '<button class="btn btn-primary btn-sm" onclick="modalHariLibur()">+ Hari Libur</button>' : ""}
    </div>
  </div>`;

  let legendHtml =
    '<div style="margin-bottom:12px"><span style="font-size:.75rem;color:var(--text-light)">🔴 Libur &nbsp; 🔵 Task &nbsp; 🟢 Selesai &nbsp; 🟠 Terlambat &nbsp; 🟣 Report &nbsp; ⚫ Ditugaskan</span></div>';
  container.innerHTML =
    navHtml +
    legendHtml +
    '<div style="text-align:center;padding:24px;color:var(--text-light)">Memuat kalender...</div>';

  // Load holidays and tasks for this month
  const startDate = `${y}-${String(m + 1).padStart(2, "0")}-01`;
  const endDate = `${y}-${String(m + 1).padStart(2, "0")}-${String(new Date(y, m + 1, 0).getDate()).padStart(2, "0")}`;
  let holidays = [];
  let tasks = [];

  try {
    const [holSnap, taskSnap] = await Promise.all([
      db.collection("hrd_hari_libur").get(),
      db.collection("hrd_daily_tasks").get(),
    ]);
    holSnap.forEach((d) => {
      const data = d.data();
      if (data.tanggal >= startDate && data.tanggal <= endDate)
        holidays.push({ id: d.id, ...data });
    });
    for (const d of taskSnap.docs) {
      const t = d.data();
      if (
        doesTaskBelongToUser(t) &&
        t.tanggal >= startDate &&
        t.tanggal <= endDate
      ) {
        tasks.push({ id: d.id, ...t });
      }
      if (
        hasAccess(3) &&
        wasTaskAssignedByUser(t) &&
        !doesTaskBelongToUser(t) &&
        t.tanggal >= startDate &&
        t.tanggal <= endDate
      ) {
        tasks.push({ id: d.id, ...t, _isAssigned: true });
      }
    }
  } catch (e) {
    console.warn("Failed to load calendar data:", e);
  }

  // Build calendar grid
  const firstDay = new Date(y, m, 1).getDay(); // 0=Sun,1=Mon,...
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const daysInPrevMonth = new Date(y, m, 0).getDate();
  // Adjust to Monday start: Mon=0, Tue=1,...Sun=6
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  // Map holidays and tasks by day
  const holidayMap = {};
  holidays.forEach((h) => {
    const day = parseInt(h.tanggal.split("-")[2]);
    if (!holidayMap[day]) holidayMap[day] = [];
    holidayMap[day].push(h);
  });
  const taskMap = {};
  tasks.forEach((t) => {
    const day = parseInt(t.tanggal.split("-")[2]);
    if (!taskMap[day]) taskMap[day] = [];
    taskMap[day].push(t);
  });

  let calHtml =
    '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:1px;background:#e0e0e0;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden">';
  // Header
  dayNames.forEach((dn) => {
    calHtml += `<div style="background:#f5f5f5;padding:8px;text-align:center;font-weight:700;font-size:.8rem">${dn}</div>`;
  });

  // Previous month padding days
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    calHtml += `<div style="background:#fafafa;min-height:80px;padding:4px;opacity:.4"><div style="font-size:.8rem;color:#999">${d}</div></div>`;
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const isToday = dateStr === today;
    const dayHolidays = holidayMap[day] || [];
    const dayTasks = taskMap[day] || [];
    const bgColor = isToday ? "#e3f2fd" : "#fff";
    const borderStyle = isToday ? "box-shadow:inset 0 0 0 2px #1565c0;" : "";

    calHtml += `<div style="background:${bgColor};min-height:80px;padding:4px;${borderStyle}position:relative">`;
    calHtml += `<div style="font-weight:700;font-size:.85rem;${isToday ? "color:#1565c0" : ""}">${day}</div>`;

    // Show holidays
    dayHolidays.forEach((h) => {
      const label =
        h.nama.length > 15 ? h.nama.substring(0, 15) + "..." : h.nama;
      calHtml += `<div style="font-size:.6rem;background:#c62828;color:#fff;padding:1px 4px;border-radius:3px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${escHtml(h.nama)}">${escHtml(label)}</div>`;
    });

    // Show tasks
    dayTasks.forEach((t) => {
      let bgTask;
      if (t.type === "report") {
        bgTask = "#7b1fa2"; // Purple for reports
      } else if (t._isAssigned) {
        bgTask = "#6a1b9a";
      } else if (t.done) {
        bgTask = "#4caf50";
      } else if (t.tanggal < today) {
        bgTask = "#c62828";
      } else {
        bgTask = "#1565c0";
      }
      const icon = t.type === "report" ? "📝 " : "";
      const priorityMark =
        t.priority === "high" && t.type !== "report" ? "! " : "";
      const rawLabel = icon + priorityMark + (t.title || "");
      const taskLabel =
        rawLabel.length > 14 ? rawLabel.substring(0, 14) + "..." : rawLabel;
      const clickFn =
        t.type === "report"
          ? `viewDailyReport('${t.id}')`
          : `viewDailyTask('${t.id}')`;
      calHtml += `<div style="font-size:.6rem;background:${bgTask};color:#fff;padding:1px 4px;border-radius:3px;margin-top:2px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${escHtml(t.title || "")}${t._isAssigned ? " (ditugaskan ke " + escHtml(t.targetUserName || "") + ")" : ""}" onclick="${clickFn}">${escHtml(taskLabel)}</div>`;
    });

    calHtml += "</div>";
  }

  // Next month padding days
  const totalCells = startOffset + daysInMonth;
  const remainder = totalCells % 7;
  if (remainder > 0) {
    for (let i = 1; i <= 7 - remainder; i++) {
      calHtml += `<div style="background:#fafafa;min-height:80px;padding:4px;opacity:.4"><div style="font-size:.8rem;color:#999">${i}</div></div>`;
    }
  }

  calHtml += "</div>";

  container.innerHTML = navHtml + legendHtml + calHtml;
}

async function hapusHariLibur(id) {
  if (!confirm("Hapus hari libur ini?")) return;
  await db.collection("hrd_hari_libur").doc(id).delete();
  toast("Dihapus", "success");
  loadHariLiburView();
}

function modalHariLibur() {
  openModal(`<div class="modal-title">+ Tambah Hari Libur Custom</div>
    <div class="form-group"><label>Tanggal</label><input class="form-control" type="date" id="hlTgl"></div>
    <div class="form-group"><label>Nama Hari Libur</label><input class="form-control" id="hlNama" placeholder="Contoh: HUT Perusahaan"></div>
    <div class="form-group"><label>Tipe</label><select class="form-control" id="hlTipe">
      <option value="perusahaan">Perusahaan</option>
      <option value="nasional">Nasional</option>
      <option value="cuti_bersama">Cuti Bersama</option>
    </select></div>
    <button class="btn btn-primary" onclick="simpanHariLibur()">Simpan</button>`);
}

async function simpanHariLibur() {
  const tanggal = document.getElementById("hlTgl").value;
  const nama = document.getElementById("hlNama").value;
  const tipe = document.getElementById("hlTipe").value;
  if (!tanggal || !nama) return toast("Lengkapi data", "warning");
  const tahun = parseInt(tanggal.split("-")[0]);
  await db.collection("hrd_hari_libur").add({
    tanggal,
    nama,
    tipe,
    tahun,
    createdAt: new Date().toISOString(),
  });
  closeModalDirect();
  toast("Hari libur ditambahkan", "success");
  loadHariLiburView();
}

async function checkHariLiburReminders() {}

async function syncHariLiburNasional() {
  const year = hariLiburCalendarMonth.year;
  let dataToSync = [];
  if (year === 2025) dataToSync = HARI_LIBUR_NASIONAL_2025;
  else if (year === 2026) dataToSync = HARI_LIBUR_NASIONAL_2026;
  else {
    toast(
      `Data hari libur nasional tahun ${year} belum tersedia. Tersedia: 2025, 2026`,
      "warning",
    );
    return;
  }

  if (
    !confirm(
      `Sinkronisasi ${dataToSync.length} hari libur nasional tahun ${year}? Data yang sudah ada (nasional/cuti_bersama) akan diperbarui.`,
    )
  )
    return;

  toast("Memproses sinkronisasi...", "info");

  // Delete ALL existing national/cuti_bersama holidays for this year (by date range)
  const startYear = `${year}-01-01`,
    endYear = `${year}-12-31`;
  const existingSnap = await db.collection("hrd_hari_libur").get();
  const batch1 = [];
  for (const d of existingSnap.docs) {
    const data = d.data();
    const tgl = data.tanggal || "";
    const tipe = data.tipe || "";
    if (
      tgl >= startYear &&
      tgl <= endYear &&
      (tipe === "nasional" || tipe === "cuti_bersama")
    )
      batch1.push(d.ref.delete());
  }
  await Promise.all(batch1);

  // Add all national holidays
  const batch2 = [];
  dataToSync.forEach((h) => {
    batch2.push(
      db.collection("hrd_hari_libur").add({
        tanggal: h.tanggal,
        nama: h.nama,
        tipe: h.tipe,
        tahun: year,
        createdAt: new Date().toISOString(),
      }),
    );
  });
  await Promise.all(batch2);

  toast(
    `${dataToSync.length} hari libur nasional ${year} berhasil disinkronkan`,
    "success",
  );
  loadHariLiburView();
}

// autoLoadHariLiburNasional moved to core.js

// Check if a given date is a holiday - returns holiday info or null
async function checkHoliday(dateStr) {
  const snap = await db
    .collection("hrd_hari_libur")
    .where("tanggal", "==", dateStr)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return snap.docs[0].data();
}

// == PENALTY ==================================================-
async function renderPenalty() {
  const main = document.getElementById("mainContent");
  const isBOD = currentUser.role === "bod";
  main.innerHTML = `<div class="page-title"><span>${renderBackButton()}⚠️ Penalty Point</span><div class="flex gap-8">${hasAccess(4) && !isBOD ? '<button class="btn btn-info btn-sm" onclick="syncPenaltyToKPI()">🔄 Sinkronisasi ke KPI</button>' : ""}${!isBOD ? '<button class="btn btn-primary btn-sm" onclick="modalPenalty()">+ Tambah</button>' : ""}</div></div>
    <div class="card mb-16"><div class="card-title mb-8">📊 Ringkasan Poin per Karyawan</div><div id="penaltySummary">Loading...</div></div>
    <div class="card"><div class="table-wrap"><table><thead><tr><th>Karyawan</th><th>Tanggal</th><th>Jenis</th><th>Poin</th><th>Keterangan</th><th>Status</th><th>Aksi</th></tr></thead><tbody id="tblPenalty"></tbody></table></div></div>`;
  const [penSnap, karyawanSnap] = await Promise.all([
    db.collection("hrd_penalty").get(),
    db.collection("hrd_karyawan").where("status", "==", "aktif").get(),
  ]);
  // Build karyawan dept map
  const karyDeptMap = {};
  for (const d of karyawanSnap.docs) {
    const k = d.data();
    karyDeptMap[(k.nama || "").toLowerCase().trim()] = k.departemen || "-";
  }
  const myDept = (currentUser.departemen || "").toLowerCase().trim();
  const myNama = (currentUser.nama || "").toLowerCase().trim();
  // Filter penalty data based on role
  const allPenalty = [];
  for (const d of penSnap.docs) {
    allPenalty.push({ id: d.id, ...d.data() });
  }
  let visiblePenalty = allPenalty;
  if (!hasAccess(4)) {
    // Staff/leader (level 1-2): only see own penalty
    visiblePenalty = allPenalty.filter(
      (p) => (p.nama || "").toLowerCase().trim() === myNama,
    );
  } else if (!hasAccess(6)) {
    // Manager/Head (level 3-4): see own department only
    visiblePenalty = allPenalty.filter((p) => {
      const pDept = (
        karyDeptMap[(p.nama || "").toLowerCase().trim()] ||
        p.departemen ||
        ""
      )
        .toLowerCase()
        .trim();
      return pDept === myDept || (p.nama || "").toLowerCase().trim() === myNama;
    });
  }
  // Admin (level 6): sees all — no filter
  // Build summary grouped by employee name
  const summary = {};
  for (const d of karyawanSnap.docs) {
    const k = d.data();
    // Only include karyawan visible to current user
    if (!hasAccess(6)) {
      if (!hasAccess(4)) {
        if ((k.nama || "").toLowerCase().trim() !== myNama) continue;
      } else {
        if ((k.departemen || "").toLowerCase().trim() !== myDept) continue;
      }
    }
    summary[k.nama] = {
      nama: k.nama,
      departemen: k.departemen || "-",
      poin: 0,
      detail: {},
    };
  }
  for (const p of visiblePenalty) {
    if (!summary[p.nama])
      summary[p.nama] = {
        nama: p.nama,
        departemen: karyDeptMap[(p.nama || "").toLowerCase().trim()] || "-",
        poin: 0,
        detail: {},
      };
    summary[p.nama].poin += parseInt(p.poin) || 0;
    const j = p.jenis || "Lainnya";
    summary[p.nama].detail[j] = (summary[p.nama].detail[j] || 0) + 1;
  }
  // Render summary - only employees with points > 0
  const summaryItems = Object.values(summary).filter((s) => s.poin > 0);
  summaryItems.sort((a, b) => b.poin - a.poin);
  let sumH = "";
  if (!summaryItems.length) {
    sumH =
      '<p class="text-sm" style="color:#999">Belum ada karyawan dengan penalty point</p>';
  } else {
    sumH =
      '<div class="table-wrap"><table><thead><tr><th>Karyawan</th><th>Departemen</th><th>Total Poin</th><th>Rincian</th><th>Status</th><th>Aksi</th></tr></thead><tbody>';
    for (const s of summaryItems) {
      const badgeClass =
        s.poin >= 10
          ? "badge-danger"
          : s.poin >= 5
            ? "badge-warning"
            : "badge-info";
      const statusLabel =
        s.poin >= 10
          ? '<span class="badge badge-danger">SP III</span>'
          : s.poin >= 7
            ? '<span class="badge badge-danger">SP II</span>'
            : s.poin >= 4
              ? '<span class="badge badge-warning">SP I</span>'
              : '<span class="badge badge-info">Peringatan</span>';

      const details = Object.entries(s.detail)
        .map(([k, v]) => `${v} ${k}`)
        .join(", ");
      const jsName = escHtml(s.nama).replace(/'/g, "\\'");
      sumH += `<tr><td class="fw-700">${escHtml(s.nama)}</td><td>${escHtml(s.departemen)}</td><td><span class="badge ${badgeClass}">${s.poin}</span></td><td class="text-xs" style="color:#666">${escHtml(details)}</td><td>${statusLabel}</td><td><button class="btn btn-xs btn-info" onclick="viewPenaltyDetail('${jsName}')">👁️</button>${hasAccess(2) && !isBOD ? ` <button class="btn btn-xs btn-primary" onclick="modalPenalty('${jsName}')">+ Tambah</button>` : ""}</td></tr>`;
    }
    sumH += "</tbody></table></div>";
  }
  document.getElementById("penaltySummary").innerHTML = sumH;
  // Render detail table
  let h = "";
  if (!visiblePenalty.length)
    h = '<tr><td colspan="6" class="text-center">Belum ada</td></tr>';
  else {
    visiblePenalty.sort((a, b) =>
      (b.tanggal || "").localeCompare(a.tanggal || ""),
    );
    for (const p of visiblePenalty) {
      const statusBadge =
        p.jenis === "SP III"
          ? '<span class="badge badge-danger">Berat</span>'
          : p.jenis === "SP II"
            ? '<span class="badge badge-warning">Sedang</span>'
            : p.jenis === "SP I"
              ? '<span class="badge badge-warning">Ringan</span>'
              : p.jenis === "Mangkir"
                ? '<span class="badge badge-danger">Mangkir</span>'
                : '<span class="badge badge-info">Ringan</span>';
      h += `<tr><td class="fw-700">${escHtml(p.nama)}</td><td>${formatDate(p.tanggal)}</td><td>${escHtml(p.jenis)}</td><td><span class="badge badge-danger">${p.poin}</span></td><td class="text-xs" style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${escHtml(p.deskripsi || "-")}">${escHtml(p.deskripsi || "-")}</td><td>${statusBadge}</td><td><button class="btn btn-xs btn-info" onclick="viewPenaltyItem('${p.id}')">👁️</button>${hasAccess(2) && !isBOD ? ` <button class="btn btn-xs btn-primary" onclick="editPenalty('${p.id}')">✏️</button> <button class="btn btn-xs btn-danger" onclick="hapusDoc('hrd_penalty','${p.id}','penalty')">🗑️</button>` : ""}</td></tr>`;
    }
  }
  document.getElementById("tblPenalty").innerHTML = h;
}

async function viewPenaltyDetail(nama) {
  try {
    const snap = await db.collection("hrd_penalty").get();
    const items = [];
    for (const d of snap.docs) {
      const p = d.data();
      if (p.nama === nama) items.push({ id: d.id, ...p });
    }
    items.sort((a, b) => (b.tanggal || "").localeCompare(a.tanggal || ""));
    const totalPoin = items.reduce(
      (sum, p) => sum + (parseInt(p.poin) || 0),
      0,
    );
    const statusLabel =
      totalPoin >= 10
        ? "🔴 SP III - Pelanggaran Berat"
        : totalPoin >= 7
          ? "🟠 SP II - Pelanggaran Sedang"
          : totalPoin >= 4
            ? "🟡 SP I - Pelanggaran Ringan"
            : "⚪ Peringatan";
    const penaltyDeduction = totalPoin * 2;
    let h = `<div class="modal-title">👁️ Detail Penalty - ${escHtml(nama)}</div>
      <div style="background:#f9f9f9;padding:16px;border-radius:8px;margin-bottom:16px;border-left:4px solid var(--primary)">
        <div class="fw-700" style="font-size:1.05rem">${escHtml(nama)}</div>
        <div class="text-sm mt-8">Total Poin: <span class="badge badge-danger">${totalPoin}</span></div>
        <div class="text-sm mt-4">Pengurangan Skor KPI: <b>-${penaltyDeduction} poin</b></div>
        <div class="text-sm mt-4">Status: <b>${statusLabel}</b></div>
      </div>
      <div style="background:#fff8e1;padding:10px;border-radius:8px;margin-bottom:12px;font-size:.8rem;color:#555">
        <b>Panduan Poin:</b> Terlambat=1 | Mangkir=2 | SP I=3 | SP II=5 | SP III=10<br>
        <b>Dampak KPI:</b> Setiap 1 poin penalty = -2 skor KPI
      </div>
      <div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Jenis</th><th>Poin</th><th>Keterangan</th></tr></thead><tbody>`;
    items.forEach((p) => {
      h += `<tr><td>${formatDate(p.tanggal)}</td><td>${escHtml(p.jenis)}</td><td><span class="badge badge-danger">${p.poin}</span></td><td class="text-xs">${escHtml(p.deskripsi || "-")}</td></tr>`;
    });
    h += "</tbody></table></div>";
    openModal(h, true);
  } catch (e) {
    toast("Gagal memuat detail: " + e.message, "error");
  }
}

async function viewPenaltyItem(id) {
  const doc = await db.collection("hrd_penalty").doc(id).get();
  if (!doc.exists) return toast("Data tidak ditemukan", "warning");
  const p = doc.data();
  const statusBadge =
    p.jenis === "SP III"
      ? "🔴 Berat"
      : p.jenis === "SP II"
        ? "🟠 Sedang"
        : p.jenis === "SP I"
          ? "🟡 Ringan"
          : p.jenis === "Mangkir"
            ? "🔴 Mangkir"
            : "⚪ Ringan";
  openModal(`<div class="modal-title">👁️ Detail Penalty</div>
    <div style="background:#f9f9f9;padding:16px;border-radius:8px;border-left:4px solid var(--danger)">
      <div class="text-sm" style="line-height:2">
        <div><b>Karyawan:</b> ${escHtml(p.nama)}</div>
        <div><b>Tanggal:</b> ${formatDate(p.tanggal)}</div>
        <div><b>Jenis:</b> ${escHtml(p.jenis)}</div>
        <div><b>Poin:</b> <span class="badge badge-danger">${p.poin}</span></div>
        <div><b>Status:</b> ${statusBadge}</div>
        ${p.deskripsi ? `<div><b>Deskripsi:</b></div><div class="text-xs" style="white-space:pre-line;background:#fff;padding:8px;border-radius:4px;margin-top:4px;border:1px solid #eee">${escHtml(p.deskripsi)}</div>` : ""}
        <div><b>Dibuat oleh:</b> ${escHtml(p.createdByName || "-")}</div>
        <div><b>Dibuat:</b> ${formatDate(p.createdAt)}</div>
      </div>
    </div>`);
}

async function editPenalty(id) {
  const doc = await db.collection("hrd_penalty").doc(id).get();
  if (!doc.exists) return toast("Data tidak ditemukan", "warning");
  const p = doc.data();
  openModal(`<div class="modal-title">✏️ Edit Penalty</div>
    <div class="grid-2">
      <div class="form-group"><label>Karyawan</label><input class="form-control" id="editPenNama" value="${escHtml(p.nama || "")}"></div>
      <div class="form-group"><label>Tanggal</label><input class="form-control" type="date" id="editPenTgl" value="${p.tanggal || ""}"></div>
    </div>
    <div class="grid-2">
      <div class="form-group"><label>Jenis</label><select class="form-control" id="editPenJenis" onchange="autoFillEditPenaltyPoin()"><option ${p.jenis === "Terlambat" ? "selected" : ""} value="Terlambat">Terlambat (1 poin)</option><option ${p.jenis === "Mangkir" ? "selected" : ""} value="Mangkir">Mangkir (2 poin)</option><option ${p.jenis === "SP I" ? "selected" : ""} value="SP I">SP I - Ringan (3 poin)</option><option ${p.jenis === "SP II" ? "selected" : ""} value="SP II">SP II - Sedang (5 poin)</option><option ${p.jenis === "SP III" ? "selected" : ""} value="SP III">SP III - Berat (10 poin)</option></select></div>
      <div class="form-group"><label>Poin</label><input class="form-control" type="number" id="editPenPoin" value="${p.poin || 1}" min="1"></div>
    </div>
    <div class="form-group"><label>Deskripsi / Keterangan</label><textarea class="form-control" id="editPenDeskripsi" rows="3" placeholder="Jelaskan alasan pemberian penalty...">${escHtml(p.deskripsi || "")}</textarea></div>
    <button class="btn btn-primary" onclick="updatePenalty('${id}')">💾 Simpan</button>`);
}

function autoFillEditPenaltyPoin() {
  const jenis = document.getElementById("editPenJenis")?.value || "";
  const poinMap = {
    Terlambat: 1,
    Mangkir: 2,
    "SP I": 3,
    "SP II": 5,
    "SP III": 10,
  };
  const poinEl = document.getElementById("editPenPoin");
  if (poinEl && poinMap[jenis] !== undefined) {
    poinEl.value = poinMap[jenis];
  }
}

async function updatePenalty(id) {
  const data = {
    nama: document.getElementById("editPenNama").value,
    tanggal: document.getElementById("editPenTgl").value,
    jenis: document.getElementById("editPenJenis").value,
    poin: parseInt(document.getElementById("editPenPoin").value) || 1,
    deskripsi: document.getElementById("editPenDeskripsi").value || "",
    updatedAt: new Date().toISOString(),
  };
  if (!data.nama) return toast("Nama wajib", "warning");
  await db.collection("hrd_penalty").doc(id).update(data);
  closeModalDirect();
  toast("Penalty diperbarui", "success");
  renderPenalty();
}

async function syncPenaltyToKPI() {
  if (
    !confirm(
      "Sinkronisasi penalty point ke data KPI?\n\nIni akan menghitung ulang skor akhir KPI berdasarkan total penalty masing-masing karyawan.\nJika karyawan belum punya KPI, akan dibuatkan record KPI default.",
    )
  )
    return;
  const [kpiSnap, penSnap, karySnap] = await Promise.all([
    db.collection("hrd_kpi").get(),
    db.collection("hrd_penalty").get(),
    db.collection("hrd_karyawan").where("status", "==", "aktif").get(),
  ]);
  // Calculate total penalty per nama
  const penaltyMap = {};
  for (const d of penSnap.docs) {
    const p = d.data();
    const n = (p.nama || "").toLowerCase().trim();
    penaltyMap[n] = (penaltyMap[n] || 0) + (parseInt(p.poin) || 0);
  }
  // Track which names already have KPI records
  const kpiNames = new Set();
  let count = 0;
  // Update existing KPI records
  for (const doc of kpiSnap.docs) {
    const r = doc.data();
    const n = (r.nama || "").toLowerCase().trim();
    kpiNames.add(n);
    const totalPenalty = penaltyMap[n] || 0;
    const skorMurni = r.skorMurni != null ? r.skorMurni : r.skor;
    const skorAkhir = Math.max(0, skorMurni - totalPenalty * 2);
    if (
      r.penaltyPoin !== totalPenalty ||
      r.skor !== skorAkhir ||
      r.skorMurni == null
    ) {
      await db
        .collection("hrd_kpi")
        .doc(doc.id)
        .update({
          skorMurni: skorMurni,
          skor: skorAkhir,
          penaltyPoin: totalPenalty,
          penaltyDeduction: totalPenalty * 2,
          syncedAt: new Date().toISOString(),
        });
      count++;
    }
  }
  // Create KPI records for employees that have penalty but NO KPI record yet
  for (const [namaLower, totalPenalty] of Object.entries(penaltyMap)) {
    if (totalPenalty > 0 && !kpiNames.has(namaLower)) {
      // Find original nama from karyawan
      let originalNama = namaLower;
      for (const d of karySnap.docs) {
        const k = d.data();
        if ((k.nama || "").toLowerCase().trim() === namaLower)
          originalNama = k.nama;
      }
      const skorMurni = 80; // Default skor murni
      const skorAkhir = Math.max(0, skorMurni - totalPenalty * 2);
      await db.collection("hrd_kpi").add({
        nama: originalNama,
        periode: new Date().toISOString().slice(0, 7),
        produktivitas: 80,
        kualitas: 80,
        kedisiplinan: 80,
        kerjasama: 80,
        skorMurni: skorMurni,
        skor: skorAkhir,
        penaltyPoin: totalPenalty,
        penaltyDeduction: totalPenalty * 2,
        penilai: "Auto-Sync Penalty",
        catatan: `Auto-generated dari sinkronisasi penalty (${totalPenalty} poin)`,
        createdAt: new Date().toISOString(),
        syncedAt: new Date().toISOString(),
      });
      count++;
    }
  }
  toast(`Sinkronisasi selesai: ${count} data KPI diperbarui/dibuat`, "success");
}

async function modalPenalty(prefillNama) {
  // Load active employees for dropdown — leader/manager only see own dept
  const kSnap = await db
    .collection("hrd_karyawan")
    .where("status", "==", "aktif")
    .get();
  const myDept = (currentUser.departemen || "").toLowerCase().trim();
  let opts = '<option value="">-- Pilih Karyawan --</option>';
  for (const d of kSnap.docs) {
    const k = d.data();
    // Non-admin/head: only show karyawan from same department
    if (!hasAccess(4)) {
      if ((k.departemen || "").toLowerCase().trim() !== myDept) continue;
    }
    const sel = prefillNama && k.nama === prefillNama ? " selected" : "";
    opts += `<option value="${escHtml(k.nama)}"${sel}>${escHtml(k.nama)} — ${escHtml(k.departemen || "-")} (${escHtml(k.posisi || "-")})</option>`;
  }
  openModal(`<div class="modal-title">Tambah Penalty</div>
    <div style="background:#fff8e1;padding:12px;border-radius:8px;margin-bottom:16px;border-left:4px solid #ff9800">
      <div class="text-xs fw-700 mb-4">📋 Panduan Perhitungan Poin Penalty:</div>
      <div class="text-xs" style="line-height:1.8;color:#555">
        • <b>Terlambat:</b> 1 poin per kejadian<br>
        • <b>Mangkir:</b> 2 poin per kejadian<br>
        • <b>SP I (Pelanggaran Ringan):</b> 3 poin<br>
        • <b>SP II (Pelanggaran Sedang):</b> 5 poin<br>
        • <b>SP III (Pelanggaran Berat):</b> 10 poin<br>
        <hr style="margin:6px 0;border-color:#e0e0e0">
        <b>Dampak ke KPI:</b> Setiap 1 penalty point mengurangi skor akhir KPI sebesar <b>2 poin</b><br>
        <b>Status:</b> ⚪ &lt;4 poin (Peringatan) | 🟡 4-6 poin (SP I) | 🟠 7-9 poin (SP II) | 🔴 ≥10 poin (SP III)
      </div>
    </div>
    <div class="grid-2">
      <div class="form-group"><label>Karyawan</label>
        <select class="form-control" id="penNamaSelect" onchange="document.getElementById('penNama').value=this.value;autoFillPenaltyPoin()">${opts}</select>
        <input class="form-control mt-4" id="penNama" placeholder="Atau ketik nama manual..." value="${escHtml(prefillNama || "")}">
      </div>
      <div class="form-group"><label>Tanggal</label><input class="form-control" type="date" id="penTgl" value="${todayStr()}"></div>
    </div>
    <div class="grid-2">
      <div class="form-group"><label>Jenis</label><select class="form-control" id="penJenis" onchange="autoFillPenaltyPoin()"><option value="Terlambat">Terlambat (1 poin)</option><option value="Mangkir">Mangkir (2 poin)</option><option value="SP I">SP I - Ringan (3 poin)</option><option value="SP II">SP II - Sedang (5 poin)</option><option value="SP III">SP III - Berat (10 poin)</option></select></div>
      <div class="form-group"><label>Poin</label><input class="form-control" type="number" id="penPoin" value="1" min="1"></div>
    </div>
    <div class="form-group"><label>Deskripsi / Keterangan</label><textarea class="form-control" id="penDeskripsi" rows="3" placeholder="Jelaskan alasan pemberian penalty...\nContoh: Terlambat masuk 30 menit tanpa keterangan"></textarea></div>
    <button class="btn btn-primary" onclick="simpanPenalty()">Simpan</button>`);
}

function autoFillPenaltyPoin() {
  const jenis = document.getElementById("penJenis")?.value || "";
  const poinMap = {
    Terlambat: 1,
    Mangkir: 2,
    "SP I": 3,
    "SP II": 5,
    "SP III": 10,
  };
  const poinEl = document.getElementById("penPoin");
  if (poinEl && poinMap[jenis] !== undefined) {
    poinEl.value = poinMap[jenis];
  }
}

async function simpanPenalty() {
  const selectVal = document.getElementById("penNamaSelect").value;
  const inputVal = document.getElementById("penNama").value;
  const nama = selectVal || inputVal;
  if (!nama) return toast("Nama wajib", "warning");
  // Look up departemen for this karyawan
  let dept = "";
  try {
    const kSnap = await db.collection("hrd_karyawan").get();
    const nTarget = nama.toLowerCase().trim();
    for (const d of kSnap.docs) {
      const k = d.data();
      if ((k.nama || "").toLowerCase().trim() === nTarget)
        dept = k.departemen || "";
    }
  } catch (e) {}
  const data = {
    nama: nama,
    departemen: dept,
    tanggal: document.getElementById("penTgl").value,
    jenis: document.getElementById("penJenis").value,
    poin: parseInt(document.getElementById("penPoin").value) || 1,
    deskripsi: document.getElementById("penDeskripsi").value || "",
    createdBy: currentUser.id,
    createdByName: currentUser.nama,
    createdAt: new Date().toISOString(),
  };
  await db.collection("hrd_penalty").add(data);
  closeModalDirect();
  toast("Ditambahkan", "success");
  renderPenalty();
}

// == DAILY TASK & REMINDER ====================================-
function buildGCalUrl(t) {
  const title = encodeURIComponent(t.title);
  let dates;
  if (t.waktu) {
    const startDT =
      t.tanggal.replace(/-/g, "") + "T" + t.waktu.replace(":", "") + "00";
    const startDate = new Date(t.tanggal + "T" + t.waktu + ":00");
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    const endDT =
      endDate
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(".000Z", "")
        .split("T")[0]
        .substring(0, 8) +
      "T" +
      String(endDate.getHours()).padStart(2, "0") +
      String(endDate.getMinutes()).padStart(2, "0") +
      "00";
    dates = startDT + "/" + endDT;
  } else {
    const d = t.tanggal.replace(/-/g, "");
    const nextDay = new Date(t.tanggal);
    nextDay.setDate(nextDay.getDate() + 1);
    const endD = nextDay.toISOString().split("T")[0].replace(/-/g, "");
    dates = d + "/" + endD;
  }
  let details = "";
  if (t.description) details += t.description + "\n\n";
  details +=
    "Prioritas: " +
    (t.priority === "high"
      ? "Tinggi"
      : t.priority === "low"
        ? "Rendah"
        : "Sedang");
  if (t.assignedByName) details += "\nDitugaskan oleh: " + t.assignedByName;
  details += "\n\n[IMS Daily Task]";
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${encodeURIComponent(details)}&trp=false`;
}

function getDailyTaskTabs(activeFilter) {
  const cmd = (f) => `loadDailyTasks('${f}')`;

  let tabs = `<div class="tab ${activeFilter === "all" ? "active" : ""}" onclick="${cmd("all")}">Semua</div>`;
  tabs += `<div class="tab ${activeFilter === "today" ? "active" : ""}" onclick="${cmd("today")}">Hari Ini</div>`;

  if (!hasAccess(5) || hasAccess(6)) {
    tabs += `<div class="tab ${activeFilter === "upcoming" ? "active" : ""}" onclick="${cmd("upcoming")}">Mendatang</div>`;
    tabs += `<div class="tab ${activeFilter === "done" ? "active" : ""}" onclick="${cmd("done")}">Selesai</div>`;
    tabs += `<div class="tab ${activeFilter === "overdue" ? "active" : ""}" onclick="${cmd("overdue")}">Terlambat</div>`;
  }

  tabs += `<div class="tab ${activeFilter === "report" ? "active" : ""}" onclick="${cmd("report")}">📝 Daily Report</div>`;

  if (hasAccess(2) || hasHeadLevelAccess()) {
    tabs += `<div class="tab ${activeFilter === "team-report" ? "active" : ""}" onclick="${cmd("team-report")}">📊 Report Tim</div>`;
  }

  if (hasHeadLevelAccess()) {
    tabs += `<div class="tab ${activeFilter === "all-report" ? "active" : ""}" onclick="${cmd("all-report")}">🏢 Semua Divisi</div>`;
  }

  if (hasAccess(3) || hasHeadLevelAccess()) {
    tabs += `<div class="tab ${activeFilter === "report-summary" ? "active" : ""}" onclick="navigateTo('report-summary')">📋 Rangkuman Report</div>`;
  }

  if (
    ((hasAccess(2) || hasHeadLevelAccess()) && !hasAccess(5)) ||
    (hasAccess(5) && !hasAccess(6)) ||
    hasAccess(6)
  ) {
    tabs += `<div class="tab ${activeFilter === "assigned" ? "active" : ""}" onclick="${cmd("assigned")}">📋 Ditugaskan</div>`;
  }

  if (((hasAccess(2) || hasHeadLevelAccess()) && !hasAccess(5)) || hasAccess(6)) {
    tabs += `<div class="tab ${activeFilter === "history-assigned" ? "active" : ""}" onclick="${cmd("history-assigned")}">📊 History Tugas</div>`;
  }

  if (hasAccess(2) || hasHeadLevelAccess()) {
    tabs += `<div class="tab ${activeFilter === "weekly" ? "active" : ""}" onclick="loadDailyTasks('weekly')">📈 Laporan Mingguan</div>`;
  }

  return tabs;
}

window.renderDailyTask = async function(initialFilter = "all") {
  const main = document.getElementById("mainContent");
  if (!main) return;
  const tabs = getDailyTaskTabs(initialFilter);
  main.innerHTML = `<div class="page-title"><span>${renderBackButton()}📋 Daily Task</span><div class="flex gap-8"><button class="btn btn-primary btn-sm" onclick="modalDailyTask()">+ Task Baru</button><button class="btn btn-info btn-sm" onclick="modalAddDailyReport()">📝 Daily Report</button></div></div>
    <div id="taskStats" class="stats-grid mb-16"></div>
    <div class="card">
      <div class="tabs mb-12" id="taskTabs" style="flex-wrap:wrap">${tabs}</div>
      <div id="taskList"></div>
    </div>`;
  loadDailyTasks(initialFilter, true);
};

function modalAddTaskChoice() {
  openModal(`<div class="modal-title">+ Tambah</div>
    <p class="text-sm mb-16" style="color:#666">Pilih jenis yang ingin Anda buat:</p>
    <div style="display:flex;gap:12px;flex-wrap:wrap">
      <div style="flex:1;min-width:200px;padding:20px;border:2px solid var(--border);border-radius:12px;cursor:pointer;text-align:center;transition:all .2s" onclick="closeModalDirect();modalAddTask()" onmouseover="this.style.borderColor='var(--primary)';this.style.background='#f8f9ff'" onmouseout="this.style.borderColor='var(--border)';this.style.background=''">
        <div style="font-size:2rem;margin-bottom:8px">📋</div>
        <div class="fw-700">Daily Task</div>
        <div class="text-xs" style="color:#666;margin-top:4px">Tugas harian, reminder, deadline</div>
      </div>
      <div style="flex:1;min-width:200px;padding:20px;border:2px solid var(--border);border-radius:12px;cursor:pointer;text-align:center;transition:all .2s" onclick="closeModalDirect();modalAddDailyReport()" onmouseover="this.style.borderColor='var(--accent)';this.style.background='#fff8f8'" onmouseout="this.style.borderColor='var(--border)';this.style.background=''">
        <div style="font-size:2rem;margin-bottom:8px">📝</div>
        <div class="fw-700">Daily Report</div>
        <div class="text-xs" style="color:#666;margin-top:4px">Laporan aktivitas harian</div>
      </div>
    </div>`);
}

let _dailyTaskFilter = "all";
let _dailyTaskData = [];

window.loadDailyTasks = async function(filter, skipAutoRender = false) {
  _dailyTaskFilter = filter || "all";

  if (!skipAutoRender && !document.getElementById("taskList")) {
    await renderDailyTask(_dailyTaskFilter);
    return;
  }

  document
    .querySelectorAll("#taskTabs .tab")
    .forEach((t) => t.classList.remove("active"));
  const map = {
    all: "Semua",
    today: "Hari Ini",
    upcoming: "Mendatang",
    done: "Selesai",
    overdue: "Terlambat",
    assigned: "📋 Ditugaskan",
    "history-assigned": "📊 History Tugas",
    report: "📝 Daily Report",
    "team-report": "📊 Report Tim",
    "all-report": "🏢 Semua Divisi",
  };
  document.querySelectorAll("#taskTabs .tab").forEach((t) => {
    if (t.textContent.trim() === map[filter]) t.classList.add("active");
  });

  const myId = currentUser.id;
  const myLevel = ROLES[currentUser.role] || 0;
  const myDept = (currentUser.departemen || "").toLowerCase().trim();
  const myName = normalizePersonName(currentUser.nama || "");

  try {
    let directSubNames = [];
    if (myLevel === 2) {
      const kSnap = await db
        .collection("hrd_karyawan")
        .where("atasan", "==", currentUser.nama)
        .get();
      for (const sk of kSnap.docs) {
        const n = sk.data().nama;
        if (n) directSubNames.push(normalizePersonName(n));
      }
    }
    window._directSubNamesCache = directSubNames;

    const snap = await db.collection("hrd_daily_tasks").get();
    _dailyTaskData = [];
    for (const d of snap.docs) {
      const t = d.data();
      const taskDept = (t.departemen || "").toLowerCase().trim();
      const ownerName = normalizePersonName(getTaskOwnerDisplayName(t));
      const ownerMatchesMe = doesTaskBelongToUser(t);
      const assignedByMe = wasTaskAssignedByUser(t);
      const isReport = isDailyReportEntry(t);

      let isVisible = false;
      if (
        hasHeadLevelAccess() ||
        currentUser.id === "admin" ||
        currentUser.role === "admin"
      ) {
        isVisible = true;
      } else {
        // Strict Privacy: Tasks are only visible to owner and assigner
        if (ownerMatchesMe || assignedByMe) {
          isVisible = true;
        } else if (isReport) {
          // Reports follow hierarchy: visible to supervisors
          if (hasAccess(3)) {
            if (taskDept === myDept || !taskDept) isVisible = true;
          } else if (hasAccess(2)) {
            if (directSubNames.includes(ownerName) || taskDept === myDept)
              isVisible = true;
          }
        }
      }

      if (isVisible) _dailyTaskData.push({ id: d.id, ...t });
    }
  } catch (e) {
    _dailyTaskData = [];
    const errEl = document.getElementById("taskList");
    if (errEl) errEl.innerHTML = `<p style="color:#c62828;padding:20px;text-align:center">⚠️ Gagal memuat data: ${escHtml(e.message || String(e))}</p>`;
    return;
  }

  const today = todayStr();
  let filtered = _dailyTaskData;

  if (filter === "today")
    filtered = _dailyTaskData.filter((t) => t.tanggal === today && !t.done);
  else if (filter === "upcoming")
    filtered = _dailyTaskData.filter((t) => t.tanggal > today && !t.done);
  else if (filter === "done") filtered = _dailyTaskData.filter((t) => t.done);
  else if (filter === "overdue")
    filtered = _dailyTaskData.filter((t) => t.tanggal < today && !t.done);
  else if (filter === "assigned")
    filtered = _dailyTaskData.filter(
      (t) => wasTaskAssignedByUser(t) && !doesTaskBelongToUser(t),
    );
  else if (filter === "history-assigned") {
    const canSeeAllTaskHistory =
      hasAccess(2) || hasHeadLevelAccess() || hasAccess(6);
    filtered = _dailyTaskData.filter((t) => {
      const isReport = isDailyReportEntry(t);
      if (isReport) return false;
      if (canSeeAllTaskHistory) return true;
      return wasTaskAssignedByUser(t) && !doesTaskBelongToUser(t);
    });
    const haFrom = document.getElementById("historyAssignedFrom")?.value;
    const haTo = document.getElementById("historyAssignedTo")?.value;
    if (haFrom) filtered = filtered.filter((t) => t.tanggal >= haFrom);
    if (haTo) filtered = filtered.filter((t) => t.tanggal <= haTo);
    filtered.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  } else if (filter === "report") {
    filtered = _dailyTaskData.filter(
      (t) => isDailyReportEntry(t) && doesTaskBelongToUser(t),
    );
  } else if (filter === "team-report" || filter === "all-report") {
    filtered = _dailyTaskData.filter((t) => isDailyReportEntry(t));
    if (filter === "team-report" && !hasAccess(4)) {
      if (hasAccess(3))
        filtered = filtered.filter(
          (t) => (t.departemen || "").toLowerCase().trim() === myDept,
        );
      else if (hasAccess(2)) {
        const subs = window._directSubNamesCache || [];
        filtered = filtered.filter(
          (t) =>
            subs.includes(normalizePersonName(getTaskOwnerDisplayName(t))) ||
            doesTaskBelongToUser(t),
        );
      }
    }
    const drFrom = document.getElementById("reportDateFrom")?.value;
    const drTo = document.getElementById("reportDateTo")?.value;
    if (drFrom) filtered = filtered.filter((t) => t.tanggal >= drFrom);
    if (drTo) filtered = filtered.filter((t) => t.tanggal <= drTo);

    const divFilter =
      filter === "team-report"
        ? window._teamReportDivFilter
        : window._allReportDivFilter;
    if (divFilter)
      filtered = filtered.filter((t) =>
        (t.departemen || "").toUpperCase().includes(divFilter),
      );

    const catFilter =
      filter === "team-report"
        ? window._teamReportCatFilter
        : window._allReportCatFilter;
    if (catFilter)
      filtered = filtered.filter((t) =>
        catFilter === "Tanpa Kategori"
          ? !t.kategori || t.kategori === ""
          : (t.kategori || "").toLowerCase().includes(catFilter.toLowerCase()),
      );

    filtered.sort(
      (a, b) =>
        (a.departemen || "").localeCompare(b.departemen || "") ||
        (a.kategori || "").localeCompare(b.kategori || "") ||
        b.tanggal.localeCompare(a.tanggal),
    );
  } else if (filter === "weekly") {
    loadWeeklyReports();
    return;
  }

  if (!["team-report", "all-report", "history-assigned"].includes(filter)) {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    filtered.sort((a, b) => {
      if (!a.done && !b.done) {
        if (a.tanggal < today && b.tanggal >= today) return -1;
        if (b.tanggal < today && a.tanggal >= today) return 1;
      }
      return (
        a.tanggal.localeCompare(b.tanggal) ||
        (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1)
      );
    });
  }

  const statsEl = document.getElementById("taskStats");
  if (statsEl) {
    const total = _dailyTaskData.length;
    const done = _dailyTaskData.filter((t) => t.done).length;
    const todayTasks = _dailyTaskData.filter(
      (t) => t.tanggal === today && !t.done,
    ).length;
    const overdue = _dailyTaskData.filter(
      (t) => t.tanggal < today && !t.done,
    ).length;
    statsEl.innerHTML = `<div class="stat-card" style="border-left-color:#1565c0"><div class="stat-value" style="color:#1565c0">${total}</div><div class="stat-label">Total Task</div></div><div class="stat-card" style="border-left-color:#f57f17"><div class="stat-value" style="color:#f57f17">${todayTasks}</div><div class="stat-label">Hari Ini</div></div><div class="stat-card" style="border-left-color:#c62828"><div class="stat-value" style="color:#c62828">${overdue}</div><div class="stat-label">Terlambat</div></div><div class="stat-card" style="border-left-color:#2e7d32"><div class="stat-value" style="color:#2e7d32">${done}</div><div class="stat-label">Selesai</div></div>`;
  }

  const listEl = document.getElementById("taskList");
  if (!listEl) return;

  let html = "";
  if (filter === "history-assigned") {
    const curHaFrom = document.getElementById("historyAssignedFrom")?.value || "";
    const curHaTo = document.getElementById("historyAssignedTo")?.value || "";
    html = `<div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap;padding:10px;background:#f9f9f9;border-radius:8px">
      <span class="text-sm fw-700">📅 Periode:</span>
      <input type="date" class="form-control" id="historyAssignedFrom" value="${escAttr(curHaFrom)}" style="max-width:160px;padding:6px 10px" onchange="loadDailyTasks('history-assigned')">
      <span class="text-sm">s/d</span>
      <input type="date" class="form-control" id="historyAssignedTo" value="${escAttr(curHaTo)}" style="max-width:160px;padding:6px 10px" onchange="loadDailyTasks('history-assigned')">
      <button class="btn btn-xs btn-outline" onclick="document.getElementById('historyAssignedFrom').value='';document.getElementById('historyAssignedTo').value='';loadDailyTasks('history-assigned')">Reset</button>
    </div>`;
  }
  if (filter === "team-report" || filter === "all-report") {
    const curFrom = document.getElementById("reportDateFrom")?.value || "";
    const curTo = document.getElementById("reportDateTo")?.value || "";
    html = `<div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap;padding:10px;background:#f9f9f9;border-radius:8px">
      <span class="text-sm fw-700">📅 Periode:</span>
      <input type="date" class="form-control" id="reportDateFrom" value="${escAttr(curFrom)}" style="max-width:160px;padding:6px 10px" onchange="loadDailyTasks('${filter}')">
      <span class="text-sm">s/d</span>
      <input type="date" class="form-control" id="reportDateTo" value="${escAttr(curTo)}" style="max-width:160px;padding:6px 10px" onchange="loadDailyTasks('${filter}')">
      <button class="btn btn-xs btn-outline" onclick="document.getElementById('reportDateFrom').value='';document.getElementById('reportDateTo').value='';loadDailyTasks('${filter}')">Reset</button>
    </div>`;

    let divFilterBtns = "";
    if (hasHeadLevelAccess()) {
      const curDiv =
        filter === "team-report"
          ? window._teamReportDivFilter
          : window._allReportDivFilter;
      divFilterBtns = `<button class="btn btn-xs ${!curDiv ? "btn-primary" : "btn-outline"}" onclick="window['_${filter === "team-report" ? "team" : "all"}ReportDivFilter']='';loadDailyTasks('${filter}')">Semua</button>
      <button class="btn btn-xs ${curDiv === "ACADEMIC" ? "btn-primary" : "btn-outline"}" onclick="window['_${filter === "team-report" ? "team" : "all"}ReportDivFilter']='ACADEMIC';loadDailyTasks('${filter}')">📚 ACADEMIC</button>
      <button class="btn btn-xs ${curDiv === "OFFICE" ? "btn-primary" : "btn-outline"}" onclick="window['_${filter === "team-report" ? "team" : "all"}ReportDivFilter']='OFFICE';loadDailyTasks('${filter}')">🏢 OFFICE</button>`;
    }

    let catOpts = '<option value="">Semua Kategori</option>';
    const catList = [
      "Siswa",
      "Sensei",
      "Curriculum",
      "TSK-Job",
      "HR & Legal",
      "Document",
      "Facility's",
      "Finance",
      "Marketing & Sales",
      "Promosi",
      "Tanpa Kategori",
    ];
    const curCat =
      filter === "team-report"
        ? window._teamReportCatFilter
        : window._allReportCatFilter;
    catList.forEach(
      (c) =>
        (catOpts += `<option value="${c}" ${curCat === c ? "selected" : ""}>${c}</option>`),
    );

    html += `<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center">${divFilterBtns} <select class="form-control" style="max-width:180px;padding:4px 8px;font-size:.8rem" onchange="window['_${filter === "team-report" ? "team" : "all"}ReportCatFilter']=this.value;loadDailyTasks('${filter}')">${catOpts}</select></div>`;
    html += _renderGroupedReportTracker(filtered, filter);
    listEl.innerHTML = html;
    return;
  }

  for (const t of filtered) {
    if (isDailyReportEntry(t)) {
      const progressColor =
        (t.progress || 0) >= 80
          ? "#2e7d32"
          : (t.progress || 0) >= 50
            ? "#f57f17"
            : "#c62828";
      html += `<div style="display:flex;align-items:flex-start;gap:12px;padding:12px;border-left:4px solid #7b1fa2;margin-bottom:8px;background:#faf5ff;border-radius:0 8px 8px 0;cursor:pointer" onclick="viewDailyReport('${t.id}')">
        <div style="font-size:1.5rem">📝</div>
        <div style="flex:1"><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><span style="font-weight:700;font-size:.9rem">${escHtml(t.title || "Daily Report")}</span><span class="badge" style="background:#7b1fa220;color:#7b1fa2">Report</span></div>
        <div style="font-size:.8rem;color:#666;margin-top:4px">${escHtml((t.aktivitas || "").substring(0, 100))}...</div>
        <div style="font-size:.7rem;color:#999;margin-top:4px">👤 ${escHtml(t.targetUserName || "")} | 📅 ${formatDate(t.tanggal)} | Progress: <span style="color:${progressColor};font-weight:600">${t.progress || 0}%</span></div>
        </div>
        <div style="display:flex;gap:4px"><button class="btn btn-xs btn-info" onclick="event.stopPropagation();viewDailyReport('${t.id}')">👁️</button>
        ${doesTaskBelongToUser(t) || hasAccess(3) ? `<button class="btn btn-xs btn-warning" onclick="event.stopPropagation();editDailyReport('${t.id}')">✏️</button>` : ""}
        </div></div>`;
    } else {
      const isOverdue = t.tanggal < today && !t.done;
      const borderColor = t.done
        ? "#2e7d32"
        : isOverdue
          ? "#c62828"
          : t.tanggal === today
            ? "#1565c0"
            : "#e0e0e0";
      html += `<div style="display:flex;align-items:flex-start;gap:12px;padding:12px;border-left:4px solid ${borderColor};margin-bottom:8px;background:${t.done ? "#f1f8e9" : isOverdue ? "#fff8f8" : "#fff"};border-radius:0 8px 8px 0;cursor:pointer" onclick="viewDailyTask('${t.id}')">
        <input type="checkbox" ${t.done ? "checked" : ""} onchange="event.stopPropagation();toggleDailyTask('${t.id}')" style="margin-top:4px;width:18px;height:18px;accent-color:#2e7d32;cursor:pointer">
        <div style="flex:1"><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><span style="font-weight:700;font-size:.9rem;${t.done ? "text-decoration:line-through;color:#999" : ""}">${escHtml(t.title)}</span></div>
        <div style="font-size:.8rem;color:#666;margin-top:4px">${escHtml(t.description || "")}</div>
        <div style="font-size:.7rem;color:#999;margin-top:4px">📅 ${formatDate(t.tanggal)} | ${t.priority}${t.targetUserName ? ` | 👤 ${escHtml(t.targetUserName)}` : ""}</div></div>
        <div style="display:flex;gap:4px"><button class="btn btn-xs btn-warning" onclick="event.stopPropagation();editDailyTask('${t.id}')">✏️</button></div></div>`;
    }
  }
  if (filtered.length === 0) html += '<p style="color:#999;padding:20px;text-align:center">Tidak ada data</p>';
  listEl.innerHTML = html;
}

function filterDailyTasks(f) {
  loadDailyTasks(f);
}

function viewDailyTask(id) {
  var task = _dailyTaskData.find((t) => t.id === id);
  if (!task) {
    // Fallback: fetch from Firestore if not in local cache
    db.collection("hrd_daily_tasks")
      .doc(id)
      .get()
      .then(function (doc) {
        if (!doc.exists) return toast("Data tidak ditemukan", "warning");
        var t = { id: doc.id, ...doc.data() };
        _showDailyTaskDetail(t);
      });
    return;
  }
  _showDailyTaskDetail(task);
}

function _showDailyTaskDetail(task) {
  const userName = (currentUser.nama || "").toLowerCase().trim();
  const isGA = userName.includes("rizky") || userName.includes("rizkynur");
  const priorityLabel =
    task.priority === "high"
      ? "Tinggi"
      : task.priority === "low"
        ? "Rendah"
        : "Sedang";
  const priorityColor =
    task.priority === "high"
      ? "#c62828"
      : task.priority === "low"
        ? "#666"
        : "#f57f17";
  const trackerProgress = task.done
    ? 100
    : Math.max(0, Math.min(100, parseInt(task.progress, 10) || 0));
  const trackerColor =
    trackerProgress >= 100
      ? "#2e7d32"
      : trackerProgress >= 50
        ? "#f57f17"
        : "#c62828";
  const trackerActivity = task.aktivitas || task.description || "-";
  const statusLabel = task.done
    ? '<span class="badge badge-success">Selesai</span>'
    : task.tanggal < todayStr()
      ? '<span class="badge badge-danger">Terlambat</span>'
      : '<span class="badge badge-info">Aktif</span>';

  // Specific Feedback Section for Kaizen (Latest Superior Feedback)
  let feedbackHtml = "";
  if (
    task.source === "FORM KAIZEN" &&
    (task.kaizenStatus === "pending" || task.kaizenStatus === "rejected")
  ) {
    const color = task.kaizenStatus === "pending" ? "#f57f17" : "#c62828";
    const label =
      task.kaizenStatus === "pending"
        ? "⚠️ REVISI ATASAN (PENDING)"
        : "❌ TUGAS DITOLAK (REJECT)";
    feedbackHtml = `
      <div style="margin-top:16px; padding:14px; background:#fff8e1; border-radius:10px; border:2px solid ${color}">
          <div class="fw-700 mb-4" style="color:${color}; font-size:0.85rem">${label}</div>
          <div class="text-sm" style="font-weight:700; color:#333; margin-bottom:4px">Kekurangan/Catatan:</div>
          <div style="font-size:0.82rem; background:#fff; padding:10px; border-radius:6px; border:1px solid #ddd; white-space:pre-wrap">${escHtml(task.approverComment || "Tidak ada catatan spesifik")}</div>
          <div class="text-xs mt-8" style="color:#666">Oleh: <b>Irsan Janwar Wibawa</b></div>
      </div>`;
  }

  // Build Logs History for Kaizen
  let logsHtml = "";
  if (
    task.source === "FORM KAIZEN" &&
    task.kaizenLogs &&
    task.kaizenLogs.length > 0
  ) {
    logsHtml =
      '<div style="margin-top:16px; border-top:1px solid #eee; padding-top:12px"><div class="fw-700 mb-8" style="font-size:0.85rem; color:#555">💬 Riwayat Komentar & Keputusan:</div>';
    task.kaizenLogs.forEach((log) => {
      const date = formatDateTime(log.timestamp);
      let color = "#333";
      let actionLabel =
        log.action === "comment" ? "" : "PUTUSAN: " + log.action;
      if (log.action === "approved") color = "#2e7d32";
      else if (log.action === "pending") color = "#f57f17";
      else if (log.action === "rejected") color = "#c62828";
      else if (
        log.action === "update_progress" ||
        log.action === "submit_done"
      ) {
        color = "var(--primary)";
        actionLabel = `UPDATE PROGRESS: ${log.progress || 0}%`;
      }

      const isMyLog = log.userId === currentUser.id;
      const deleteBtn = isMyLog
        ? `<button class="btn btn-xs btn-outline" style="color:#ccc; border:none; padding:2px; min-width:auto" onclick="deleteKaizenLog('${task.id}', '${log.timestamp}')" title="Hapus Komentar/Log">🗑️</button>`
        : "";

      // Attachments for this specific log entry
      let attachHtml = "";
      if (log.attachments && log.attachments.length > 0) {
        attachHtml =
          '<div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px">';
        log.attachments.forEach((a, i) => {
          attachHtml += `<div style="cursor:pointer" onclick="viewEviden('${encodeURIComponent(JSON.stringify(a))}')">
                    <img src="${a.data}" style="width:50px; height:50px; object-fit:cover; border-radius:4px; border:1px solid #ddd" title="${escHtml(a.name)}">
                </div>`;
        });
        attachHtml += "</div>";
      }

      logsHtml += `
        <div style="margin-bottom:10px; font-size:0.78rem; background:#fff; border:1px solid #f0f0f0; padding:8px; border-radius:6px">
            <div style="display:flex; justify-content:space-between; margin-bottom:4px">
                <b style="color:var(--primary)">${escHtml(log.userName)}</b>
                <div style="display:flex; align-items:center; gap:8px">
                    <span style="color:#999">${date}</span>
                    ${deleteBtn}
                </div>
            </div>
            <div style="color:${color}; font-weight:600; text-transform:uppercase; font-size:0.65rem; margin-bottom:2px">${actionLabel}</div>
            <div style="white-space:pre-wrap">${escHtml(log.comment)}</div>
            ${attachHtml}
        </div>`;
    });
    logsHtml += "</div>";
  }

  // General Comment Input for Kaizen
  let commentInput = "";
  if (task.source === "FORM KAIZEN") {
    commentInput = `
      <div style="margin-top:12px; display:flex; gap:8px">
          <input class="form-control" id="kzGenComment" placeholder="Tambah komentar..." style="font-size:0.8rem">
          <button class="btn btn-primary btn-sm" onclick="addKaizenGeneralComment('${task.id}')">Kirim</button>
      </div>`;
  }

  openModal(`<div class="modal-title">📋 Detail Task</div>
    <table style="width:100%;border-collapse:collapse">
      <tr><td style="padding:8px;font-weight:700;width:140px">Judul</td><td style="padding:8px">${escHtml(task.title)}</td></tr>
      <tr><td style="padding:8px;font-weight:700;width:140px;vertical-align:top">Deskripsi</td><td style="padding:8px;white-space:pre-line;word-break:break-word">${escHtml(task.description || "-")}</td></tr>
      <tr><td style="padding:8px;font-weight:700">Tanggal</td><td style="padding:8px">${formatDate(task.tanggal)}</td></tr>
      <tr><td style="padding:8px;font-weight:700">Waktu</td><td style="padding:8px">${task.waktu || "-"}</td></tr>
      <tr><td style="padding:8px;font-weight:700">Prioritas</td><td style="padding:8px"><span style="color:${priorityColor};font-weight:600">${priorityLabel}</span></td></tr>
      <tr><td style="padding:8px;font-weight:700">Pengingat</td><td style="padding:8px">${task.reminder || "Tidak ada"}</td></tr>
      <tr><td style="padding:8px;font-weight:700">Status</td><td style="padding:8px">${statusLabel}</td></tr>
      ${task.assignedByName ? `<tr><td style="padding:8px;font-weight:700">Ditugaskan oleh</td><td style="padding:8px">${escHtml(task.assignedByName)}</td></tr>` : ""}
      ${task.targetUserName ? `<tr><td style="padding:8px;font-weight:700">Untuk</td><td style="padding:8px">${escHtml(task.targetUserName)}</td></tr>` : ""}
      ${task.doneAt ? `<tr><td style="padding:8px;font-weight:700">Selesai pada</td><td style="padding:8px">${formatDate(task.doneAt.split("T")[0])} ${task.doneAt.split("T")[1] ? task.doneAt.split("T")[1].substring(0, 5) : ""}</td></tr>` : ""}
    </table>
    <div style="margin-top:16px;padding:14px;background:#f9f9f9;border-radius:10px;border:1px solid #dfe7ff">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
        <div class="fw-700" style="color:#1565c0">📈 Tracker Aktivitas</div>
        <div style="font-weight:700;color:${trackerColor}">${trackerProgress}%</div>
      </div>
      <div style="height:8px;background:#e5e7eb;border-radius:999px;overflow:hidden;margin:8px 0 10px">
        <div style="height:100%;width:${trackerProgress}%;background:${trackerColor};border-radius:999px"></div>
      </div>
      <div style="font-size:.82rem;color:#333;white-space:pre-wrap;line-height:1.6">📋 ${escHtml(trackerActivity)}</div>
      ${task.kendala ? `<div style="font-size:.78rem;color:#c62828;margin-top:8px;white-space:pre-wrap">⚠️ Kendala: ${escHtml(task.kendala)}</div>` : ""}
      ${task.solusi ? `<div style="font-size:.78rem;color:#ef6c00;margin-top:6px;white-space:pre-wrap">💡 Tindak Lanjut: ${escHtml(task.solusi)}</div>` : ""}
    </div>
    ${task.attachments && task.attachments.length ? `<div style="margin-top:16px;padding:16px;background:#f9f9f9;border-radius:10px;border:1px solid var(--border)"><div class="fw-700 mb-12" style="color:var(--primary)">📎 Lampiran Eviden (${task.attachments.length} file)</div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:12px">${task.attachments.map((a, i) => (a.type && a.type.startsWith("image/") ? `<div style="text-align:center;cursor:pointer" onclick="viewEviden('${encodeURIComponent(JSON.stringify({ name: a.name, type: a.type, data: a.data }))}')"><img src="${a.data}" style="width:100%;height:90px;object-fit:cover;border-radius:8px;border:2px solid var(--border)"><div style="font-size:.6rem;color:#666;margin-top:4px">${escHtml(a.name || "Foto " + (i + 1))}</div></div>` : `<div style="cursor:pointer;display:flex;flex-direction:column;align-items:center;padding:12px;background:#fff;border-radius:8px;border:1px solid var(--border)" onclick="viewEviden('${encodeURIComponent(JSON.stringify({ name: a.name, type: a.type, data: a.data }))}')"><div style="font-size:2rem">${a.name && a.name.endsWith(".pdf") ? "📕" : a.name && a.name.match(/\\.docx?$/) ? "📘" : a.name && a.name.match(/\\.xlsx?$/) ? "📗" : "📄"}</div><div style="font-size:.65rem;color:#333;margin-top:4px;text-align:center;word-break:break-all">${escHtml(a.name)}</div><div style="font-size:.6rem;color:#1565c0;margin-top:4px">👁️ Lihat</div></div>`)).join("")}</div></div>` : ""}

    ${feedbackHtml}
    ${logsHtml}
    ${commentInput}

    <div style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end">
      ${hasAccess(6) || (doesTaskBelongToUser(task) && !isGA) || wasTaskAssignedByUser(task) ? `<button class="btn btn-sm btn-warning" onclick="closeModalDirect();editDailyTask('${task.id}')">✏️ Edit</button>` : ""}
      <a href="${buildGCalUrl(task)}" target="_blank" class="btn btn-sm btn-info" style="text-decoration:none">📅 Google Calendar</a>
      <button class="btn btn-sm btn-outline" onclick="closeModalDirect()">Tutup</button>
    </div>`);
}

async function modalAddTask() {
  // Leader/Manager/Head can assign tasks to subordinates
  let assignHtml = "";
  if (hasAccess(2) && !hasAccess(5)) {
    try {
      const usersSnap = await db.collection("hrd_users").get();
      const myDept = (currentUser.departemen || "").toLowerCase().trim();
      const isManager = (currentUser.role || "") === "manager";
      let checkboxes = "";
      for (const d of usersSnap.docs) {
        var u = d.data();
        if (u.status !== "nonaktif" && d.id !== currentUser.id) {
          // Only show same division members
          if (myDept && (u.departemen || "").toLowerCase().trim() !== myDept)
            continue;
          const uRole = u.role || "-";
          const uDept = u.departemen || "-";
          checkboxes +=
            '<label style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:6px;cursor:pointer;transition:background .15s" onmouseover="this.style.background=\'#f0f4ff\'" onmouseout="this.style.background=\'\'">';
          checkboxes +=
            '<input type="checkbox" class="dt-assign-cb" value="' +
            d.id +
            '" data-nama="' +
            escHtml(u.nama) +
            '"> ';
          checkboxes +=
            "<span>" +
            escHtml(u.nama) +
            ' <span style="color:#999;font-size:.75rem">(' +
            escHtml(uRole) +
            " \u2022 " +
            escHtml(uDept) +
            ")</span></span></label>";
        }
      }
      const labelTitle = isManager
        ? "Tugaskan Ke (Staff / Leader)"
        : "Tugaskan Ke (Anggota Tim)";
      const noteText = isManager
        ? "Hanya menampilkan anggota divisi yang sama"
        : "Centang satu atau lebih anggota tim";
      assignHtml = '<div class="form-group"><label>' + labelTitle + "</label>";
      assignHtml +=
        '<label style="display:flex;align-items:center;gap:8px;padding:6px 8px;margin-bottom:4px;background:#f9f9f9;border-radius:6px;cursor:pointer"><input type="checkbox" id="dtAssignSelf" checked> <span class="fw-700">📝 Untuk Diri Sendiri</span></label>';
      assignHtml +=
        '<div style="max-height:200px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;padding:4px">';
      assignHtml +=
        '<label style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-bottom:1px solid #eee;cursor:pointer"><input type="checkbox" id="dtAssignAll" onchange="document.querySelectorAll(\'.dt-assign-cb\').forEach(function(c){c.checked=this.checked}.bind(this))"> <span class="fw-700 text-sm">Pilih Semua</span></label>';
      assignHtml +=
        checkboxes ||
        '<p class="text-sm" style="color:#999;padding:8px">Tidak ada anggota tim di divisi ini</p>';
      assignHtml +=
        '</div><div class="text-xs" style="color:#999;margin-top:4px">' +
        noteText +
        "</div></div>";
    } catch (_e) {
      assignHtml = "";
    }
  } else if (hasAccess(5)) {
    // BOD: can assign tasks to Head and Manager level users only
    try {
      const usersSnap = await db.collection("hrd_users").get();
      let checkboxes = "";
      usersSnap.forEach(function (d) {
        var u = d.data();
        if (u.status !== "nonaktif" && d.id !== currentUser.id) {
          const uRole = (u.role || "").toLowerCase();
          const uPosisi = (u.posisi || "").toUpperCase();
          const isHeadOrManager =
            uRole === "head" ||
            uRole === "manager" ||
            uPosisi.includes("HEAD") ||
            uPosisi.includes("KEPALA");
          if (!isHeadOrManager) return;
          checkboxes +=
            '<label style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:6px;cursor:pointer;transition:background .15s" onmouseover="this.style.background=\'#f0f4ff\'" onmouseout="this.style.background=\'\'">';
          checkboxes +=
            '<input type="checkbox" class="dt-assign-cb" value="' +
            d.id +
            '" data-nama="' +
            escHtml(u.nama) +
            '"> ';
          checkboxes +=
            "<span>" +
            escHtml(u.nama) +
            ' <span style="color:#999;font-size:.75rem">(' +
            escHtml(u.role || "-") +
            " • " +
            escHtml(u.departemen || "-") +
            ")</span></span></label>";
        }
      });
      assignHtml =
        '<div class="form-group"><label>Tugaskan Ke (Head / Manager)</label>';
      assignHtml +=
        '<div style="max-height:200px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;padding:4px">';
      assignHtml +=
        '<label style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-bottom:1px solid #eee;cursor:pointer"><input type="checkbox" id="dtAssignAll" onchange="document.querySelectorAll(\'.dt-assign-cb\').forEach(function(c){c.checked=this.checked}.bind(this))"> <span class="fw-700 text-sm">Pilih Semua</span></label>';
      assignHtml +=
        checkboxes ||
        '<p class="text-sm" style="color:#999;padding:8px">Tidak ada Head/Manager ditemukan</p>';
      assignHtml +=
        '</div><div class="text-xs" style="color:#999;margin-top:4px">Hanya menampilkan karyawan layer Head dan Manager</div></div>';
    } catch (_e) {
      assignHtml = "";
    }
  } else if (hasAccess(6)) {
    try {
      const usersSnap = await db.collection("hrd_users").get();
      let checkboxes = "";
      for (const d of usersSnap.docs) {
        var u = d.data();
        if (u.status !== "nonaktif" && d.id !== currentUser.id) {
          checkboxes +=
            '<label style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:6px;cursor:pointer;transition:background .15s" onmouseover="this.style.background=\'#f0f4ff\'" onmouseout="this.style.background=\'\'">';
          checkboxes +=
            '<input type="checkbox" class="dt-assign-cb" value="' +
            d.id +
            '" data-nama="' +
            escHtml(u.nama) +
            '"> ';
          checkboxes +=
            "<span>" +
            escHtml(u.nama) +
            ' <span style="color:#999;font-size:.75rem">(' +
            escHtml(u.departemen || "-") +
            ")</span></span></label>";
        }
      }
      assignHtml = '<div class="form-group"><label>Tugaskan Ke</label>';
      assignHtml +=
        '<label style="display:flex;align-items:center;gap:8px;padding:6px 8px;margin-bottom:4px;background:#f9f9f9;border-radius:6px;cursor:pointer"><input type="checkbox" id="dtAssignSelf" checked> <span class="fw-700">📝 Untuk Diri Sendiri</span></label>';
      assignHtml +=
        '<div style="max-height:180px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;padding:4px">';
      assignHtml +=
        '<label style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-bottom:1px solid #eee;cursor:pointer"><input type="checkbox" id="dtAssignAll" onchange="document.querySelectorAll(\'.dt-assign-cb\').forEach(function(c){c.checked=this.checked}.bind(this))"> <span class="fw-700 text-sm">Pilih Semua</span></label>';
      assignHtml += checkboxes;
      assignHtml +=
        '</div><div class="text-xs" style="color:#999;margin-top:4px">Centang satu atau lebih karyawan</div></div>';
    } catch (_e) {
      assignHtml = "";
    }
  }
  const catHtml =
    hasAccess(2) && !hasAccess(3)
      ? `<div class="form-group"><label>Kategori</label><select class="form-control" id="dtKategori">${getReportCategoryOptions()}</select></div>`
      : "";
  openModal(`<div class="modal-title">+ Tambah Task</div>
    ${assignHtml}
    ${catHtml}
    <div class="form-group"><label>Judul Task *</label><input class="form-control" id="dtTitle" placeholder="Contoh: Meeting dengan klien"></div>
    <div class="form-group"><label>Deskripsi</label><textarea class="form-control" id="dtDesc" rows="4" placeholder="Detail task...\n(Tekan Enter untuk baris baru)" style="white-space:pre-wrap"></textarea></div>
    <div class="form-group"><label>Aktivitas / Update Progress</label><textarea class="form-control" id="dtAktivitas" rows="3" placeholder="Contoh: Follow up klien, revisi draft, koordinasi internal"></textarea></div>
    <div class="grid-2"><div class="form-group"><label>Progress (%)</label><input class="form-control" type="number" id="dtProgress" value="0" min="0" max="100"></div><div class="form-group"><label>Kendala</label><input class="form-control" id="dtKendala" placeholder="Opsional"></div></div>
    <div class="form-group"><label>Tindak Lanjut / Solusi</label><textarea class="form-control" id="dtSolusi" rows="2" placeholder="Opsional"></textarea></div>
    <div class="grid-2"><div class="form-group"><label>Tanggal *</label><input class="form-control" type="date" id="dtDate" value="${todayStr()}"></div><div class="form-group"><label>Waktu</label><input class="form-control" type="time" id="dtTime"></div></div>
    <div class="grid-2"><div class="form-group"><label>Prioritas</label><select class="form-control" id="dtPriority"><option value="medium">Sedang</option><option value="high">Tinggi</option><option value="low">Rendah</option></select></div><div class="form-group"><label>Pengingat</label><select class="form-control" id="dtReminder"><option value="">Tidak ada</option><option value="15 menit">15 menit</option><option value="30 menit">30 menit</option><option value="1 jam">1 jam</option><option value="1 hari">1 hari</option></select></div></div>
    <div class="form-group"><label>Ulangi</label><select class="form-control" id="dtRepeat"><option value="">Tidak</option><option value="daily">Setiap Hari</option><option value="weekly">Setiap Minggu</option><option value="monthly">Setiap Bulan</option></select></div>
    <div class="form-group"><label>📎 Lampiran (Eviden)</label><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px"><button type="button" class="btn btn-sm btn-outline" onclick="document.getElementById('dtFiles').click()">📁 Pilih File</button><button type="button" class="btn btn-sm btn-info" onclick="openCamera('dtFilePreview','dtCameraData')">📷 Kamera</button></div><input type="file" id="dtFiles" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip" onchange="previewTaskFiles(this,'dtFilePreview')" style="display:none"><input type="hidden" id="dtCameraData"><div id="dtFilePreview" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px"></div><div class="text-xs" style="color:#999;margin-top:4px">Maks 5 file, 10MB per file. Format: Gambar, PDF, DOC, XLS, PPT, ZIP</div></div>
    <button class="btn btn-primary" onclick="simpanDailyTask()">💾 Simpan</button>`);
}

async function simpanDailyTask() {
  const title = document.getElementById("dtTitle").value.trim();
  const tanggal = document.getElementById("dtDate").value;
  if (!title || !tanggal) return toast("Judul dan tanggal wajib", "warning");
  // Collect selected users from checkboxes
  var targets = [];
  var selfCb = document.getElementById("dtAssignSelf");
  if (selfCb && selfCb.checked) {
    targets.push({ id: currentUser.id, nama: currentUser.nama });
  }
  var assignCbs = document.querySelectorAll(".dt-assign-cb:checked");
  assignCbs.forEach(function (cb) {
    targets.push({ id: cb.value, nama: cb.getAttribute("data-nama") || "" });
  });
  // Fallback: if nothing selected, assign to self (old dropdown compatibility)
  var oldSelect = document.getElementById("dtAssignUser");
  if (!targets.length && oldSelect) {
    if (oldSelect.value === "self") {
      targets.push({ id: currentUser.id, nama: currentUser.nama });
    } else {
      var opt = oldSelect.options[oldSelect.selectedIndex];
      targets.push({
        id: oldSelect.value,
        nama: opt.getAttribute("data-nama") || opt.text,
      });
    }
  }
  if (!targets.length)
    targets.push({ id: currentUser.id, nama: currentUser.nama });
  try {
    const kategoriEl = document.getElementById("dtKategori");
    const attachments = await getFilesAsBase64("dtFiles");
    for (var i = 0; i < targets.length; i++) {
      var t = targets[i];
      var assignedBy = t.id !== currentUser.id ? currentUser.id : "";
      var assignedByName = t.id !== currentUser.id ? currentUser.nama : "";
      await db.collection("hrd_daily_tasks").add({
        title: title,
        description: document.getElementById("dtDesc").value.trim(),
        aktivitas: document.getElementById("dtAktivitas").value.trim(),
        progress: Math.max(
          0,
          Math.min(
            100,
            parseInt(document.getElementById("dtProgress").value, 10) || 0,
          ),
        ),
        kendala: document.getElementById("dtKendala").value.trim(),
        solusi: document.getElementById("dtSolusi").value.trim(),
        tanggal: tanggal,
        waktu: document.getElementById("dtTime").value || "",
        priority: document.getElementById("dtPriority").value,
        reminder: document.getElementById("dtReminder").value,
        repeat: document.getElementById("dtRepeat").value || "",
        kategori: kategoriEl ? kategoriEl.value : "",
        attachments: attachments,
        done: false,
        type: "task",
        userId: t.id,
        targetUserName: t.nama,
        departemen: currentUser.departemen || "",
        ownerLevel: ROLES[currentUser.role] || 0,
        assignedBy: assignedBy,
        assignedByName: assignedByName,
        createdAt: new Date().toISOString(),
      });
      // Notify target user if assigned to someone else
      if (t.id !== currentUser.id) {
        await db.collection("hrd_notifikasi").add({
          targetUser: t.id,
          title: "📋 Task Baru Ditugaskan",
          message: currentUser.nama + " menugaskan: " + title,
          read: false,
          type: "daily-task",
          createdAt: new Date().toISOString(),
        });
      }
    }
    toast("Task ditambahkan untuk " + targets.length + " orang", "success");
  } catch (e) {
    toast("Gagal: " + e.message, "error");
  }
  closeModalDirect();
  await loadDailyTasks(_dailyTaskFilter);
}

async function toggleDailyTask(id) {
  try {
    const ref = db.collection("hrd_daily_tasks").doc(id);
    const doc = await ref.get();
    if (!doc.exists) return;
    const t = doc.data();
    await ref.update({
      done: !t.done,
      doneAt: !t.done ? new Date().toISOString() : null,
    });
  } catch (e) {
    toast("Gagal: " + e.message, "error");
  }
  await loadDailyTasks(_dailyTaskFilter);
}

async function editDailyTask(id) {
  let task =
    typeof _dailyTaskData !== "undefined" && _dailyTaskData.length
      ? _dailyTaskData.find((t) => t.id === id)
      : null;
  if (!task) {
    const doc = await db.collection("hrd_daily_tasks").doc(id).get();
    if (!doc.exists) return toast("Data tidak ditemukan", "warning");
    task = { id: doc.id, ...doc.data() };
  }
  // If admin, show re-assignment dropdown
  let reassignHtml = "";
  if (hasAccess(3)) {
    try {
      const usersSnap = await db.collection("hrd_users").get();
      let opts = `<option value="self" ${doesTaskBelongToUser(task) ? "selected" : ""}>\u{1F4DD} Untuk Diri Sendiri (Catatan Pribadi)</option><option disabled>\u2500\u2500 Tugaskan ke Karyawan \u2500\u2500</option>`;
      for (const d of usersSnap.docs) {
        const u = d.data();
        if (u.status !== "nonaktif")
          opts += `<option value="${d.id}" data-nama="${escHtml(u.nama)}" ${d.id === task.userId && d.id !== currentUser.id ? "selected" : ""}>${escHtml(u.nama)} (${u.role})</option>`;
      }
      reassignHtml = `<div class="form-group"><label>Untuk Siapa</label><select class="form-control" id="dtEditAssignUser">${opts}</select></div>`;
    } catch (_e) {
      reassignHtml = "";
    }
  }
  openModal(`<div class="modal-title">✏️ Edit Task</div>
    ${reassignHtml}
    <div class="form-group"><label>Judul *</label><input class="form-control" id="dtEditTitle" value="${escHtml(task.title)}"></div>
    <div class="form-group"><label>Deskripsi</label><textarea class="form-control" id="dtEditDesc" rows="4" style="white-space:pre-wrap">${escHtml(task.description || "")}</textarea></div>
    <div class="form-group"><label>Aktivitas / Update Progress</label><textarea class="form-control" id="dtEditAktivitas" rows="3" style="white-space:pre-wrap">${escHtml(task.aktivitas || "")}</textarea></div>
    <div class="grid-2"><div class="form-group"><label>Progress (%)</label><input class="form-control" type="number" id="dtEditProgress" value="${Math.max(0, Math.min(100, parseInt(task.progress, 10) || 0))}" min="0" max="100"></div><div class="form-group"><label>Kendala</label><input class="form-control" id="dtEditKendala" value="${escHtml(task.kendala || "")}"></div></div>
    <div class="form-group"><label>Tindak Lanjut / Solusi</label><textarea class="form-control" id="dtEditSolusi" rows="2" style="white-space:pre-wrap">${escHtml(task.solusi || "")}</textarea></div>
    <div class="grid-2"><div class="form-group"><label>Tanggal *</label><input class="form-control" type="date" id="dtEditDate" value="${task.tanggal}"></div><div class="form-group"><label>Waktu</label><input class="form-control" type="time" id="dtEditTime" value="${task.waktu || ""}"></div></div>
    <div class="grid-2"><div class="form-group"><label>Prioritas</label><select class="form-control" id="dtEditPriority"><option value="medium" ${task.priority === "medium" ? "selected" : ""}>Sedang</option><option value="high" ${task.priority === "high" ? "selected" : ""}>Tinggi</option><option value="low" ${task.priority === "low" ? "selected" : ""}>Rendah</option></select></div><div class="form-group"><label>Pengingat</label><select class="form-control" id="dtEditReminder"><option value="" ${!task.reminder ? "selected" : ""}>Tidak ada</option><option value="15 menit" ${task.reminder === "15 menit" ? "selected" : ""}>15 menit</option><option value="30 menit" ${task.reminder === "30 menit" ? "selected" : ""}>30 menit</option><option value="1 jam" ${task.reminder === "1 jam" ? "selected" : ""}>1 jam</option><option value="1 hari" ${task.reminder === "1 hari" ? "selected" : ""}>1 hari</option></select></div></div>
    <div class="form-group"><label>Ulangi</label><select class="form-control" id="dtEditRepeat"><option value="" ${!task.repeat ? "selected" : ""}>Tidak</option><option value="daily" ${task.repeat === "daily" ? "selected" : ""}>Setiap Hari</option><option value="weekly" ${task.repeat === "weekly" ? "selected" : ""}>Setiap Minggu</option><option value="monthly" ${task.repeat === "monthly" ? "selected" : ""}>Setiap Bulan</option></select></div>
    <button class="btn btn-primary" onclick="updateDailyTask('${id}')">💾 Simpan</button>`);
}

async function updateDailyTask(id) {
  const title = document.getElementById("dtEditTitle").value.trim();
  const tanggal = document.getElementById("dtEditDate").value;
  if (!title || !tanggal) return toast("Judul dan tanggal wajib", "warning");
  const updateData = {
    title,
    description: document.getElementById("dtEditDesc").value.trim(),
    aktivitas: document.getElementById("dtEditAktivitas").value.trim(),
    progress: Math.max(
      0,
      Math.min(
        100,
        parseInt(document.getElementById("dtEditProgress").value, 10) || 0,
      ),
    ),
    kendala: document.getElementById("dtEditKendala").value.trim(),
    solusi: document.getElementById("dtEditSolusi").value.trim(),
    tanggal,
    waktu: document.getElementById("dtEditTime").value || "",
    priority: document.getElementById("dtEditPriority").value,
    reminder: document.getElementById("dtEditReminder").value,
    repeat: document.getElementById("dtEditRepeat").value || "",
    updatedAt: new Date().toISOString(),
  };
  // Handle re-assignment for admin
  const reassignEl = document.getElementById("dtEditAssignUser");
  if (reassignEl) {
    const task = _dailyTaskData.find((t) => t.id === id);
    const isSelf = reassignEl.value === "self";
    const newUserId = isSelf ? currentUser.id : reassignEl.value;
    const newUserName = isSelf
      ? currentUser.nama
      : reassignEl.options[reassignEl.selectedIndex].getAttribute(
          "data-nama",
        ) || reassignEl.options[reassignEl.selectedIndex].text;
    updateData.userId = newUserId;
    updateData.targetUserName = newUserName;
    if (newUserId !== currentUser.id) {
      updateData.assignedBy = currentUser.id;
      updateData.assignedByName = currentUser.nama;
    } else {
      updateData.assignedBy = "";
      updateData.assignedByName = "";
    }
    // Notify if re-assigned to different user
    if (task && newUserId !== task.userId && newUserId !== currentUser.id) {
      try {
        await db.collection("hrd_notifikasi").add({
          targetUser: newUserId,
          title: "\u{1F4CB} Task Dialihkan",
          message: `${currentUser.nama} mengalihkan task: ${title}`,
          read: false,
          type: "daily-task",
          createdAt: new Date().toISOString(),
        });
      } catch (_e) {}
    }
  }
  try {
    await db.collection("hrd_daily_tasks").doc(id).update(updateData);
    toast("Diperbarui", "success");
  } catch (e) {
    toast("Gagal: " + e.message, "error");
  }
  closeModalDirect();
  await loadDailyTasks(_dailyTaskFilter);
}

async function hapusDailyTask(id) {
  if (!confirm("Hapus task ini?")) return;
  try {
    await db.collection("hrd_daily_tasks").doc(id).delete();
    toast("Dihapus", "success");
  } catch (e) {
    toast("Gagal: " + e.message, "error");
  }
  await loadDailyTasks(_dailyTaskFilter);
}

// == TASK REMINDER SYSTEM ======================================
let _reminderCheckInterval = null;

async function checkTaskReminders() {
  if (!currentUser) return;
  try {
    const snap = await db.collection("hrd_daily_tasks").get();
    const now = new Date();
    const today = todayStr();
    const tasks = [];
    for (const d of snap.docs) {
      const t = d.data();
      if (doesTaskBelongToUser(t) && !t.done) tasks.push({ id: d.id, ...t });
    }

    for (const task of tasks) {
      if (!task.reminder || !task.tanggal) continue;
      // Calculate reminder time
      const taskDateTime = new Date(
        task.tanggal + "T" + (task.waktu || "09:00") + ":00",
      );
      let reminderMs = 0;
      if (task.reminder === "15 menit") reminderMs = 15 * 60 * 1000;
      else if (task.reminder === "30 menit") reminderMs = 30 * 60 * 1000;
      else if (task.reminder === "1 jam") reminderMs = 60 * 60 * 1000;
      else if (task.reminder === "1 hari") reminderMs = 24 * 60 * 60 * 1000;
      const reminderTime = new Date(taskDateTime.getTime() - reminderMs);
      // Check if reminder should fire (within last 5 minutes window)
      const diffMs = now.getTime() - reminderTime.getTime();
      if (diffMs >= 0 && diffMs < 5 * 60 * 1000) {
        // Check if we already sent this reminder (use localStorage to avoid duplicates)
        const reminderKey = "task_reminder_" + task.id + "_" + task.tanggal;
        if (localStorage.getItem(reminderKey)) continue;
        localStorage.setItem(reminderKey, "1");
        // Create notification in Firestore
        await db.collection("hrd_notifikasi").add({
          targetUser: currentUser.id,
          title: "⏰ Pengingat Task",
          message: task.title + (task.waktu ? " (" + task.waktu + ")" : ""),
          read: false,
          type: "task-reminder",
          createdAt: new Date().toISOString(),
        });
        // Show browser notification
        showSystemNotification(
          "⏰ Pengingat Task",
          task.title + (task.waktu ? " - " + task.waktu : ""),
        );
        toast("⏰ Pengingat: " + task.title, "info");
      }
      // Also check overdue tasks (past the task date+time and not reminded as overdue)
      if (task.tanggal < today) {
        const overdueKey = "task_overdue_" + task.id + "_" + today;
        if (localStorage.getItem(overdueKey)) continue;
        localStorage.setItem(overdueKey, "1");
        await db.collection("hrd_notifikasi").add({
          targetUser: currentUser.id,
          title: "⚠️ Task Terlambat",
          message: task.title + " (tenggat: " + formatDate(task.tanggal) + ")",
          read: false,
          type: "task-overdue",
          createdAt: new Date().toISOString(),
        });
      }
    }
  } catch (_e) {
    /* silent */
  }
}

async function editDailyReport(id) {
  const doc = await db.collection("hrd_daily_tasks").doc(id).get();
  if (!doc.exists) return toast("Data tidak ditemukan", "warning");
  const t = doc.data();
  const showKategori = !hasAccess(3);
  let catHtml = "";
  if (showKategori) {
    const cats =
      REPORT_CATEGORIES[(currentUser.departemen || "").toUpperCase().trim()] ||
      [];
    let opts = '<option value="">-- Pilih --</option>';
    for (const c of cats) {
      opts += `<option value="${c}" ${t.kategori === c ? "selected" : ""}>${c}</option>`;
    }
    catHtml = `<div class="form-group"><label>Kategori</label><select class="form-control" id="erKategori">${opts}</select></div>`;
  }
  openModal(
    `<div class="modal-title">✏️ Edit Daily Report</div>
    <div class="grid-2">
      <div class="form-group"><label>Tanggal</label><input class="form-control" type="date" id="erTanggal" value="${t.tanggal || ""}"></div>
      ${catHtml}
    </div>
    <div class="grid-2">
      <div class="form-group"><label>Jam Masuk</label><input class="form-control" type="time" id="erJamMasuk" value="${t.jamMasuk || ""}"></div>
      <div class="form-group"><label>Jam Keluar</label><input class="form-control" type="time" id="erJamKeluar" value="${t.jamKeluar || ""}"></div>
    </div>
    <div class="form-group"><label>Aktivitas *</label><textarea class="form-control" id="erAktivitas" rows="3">${escHtml(t.aktivitas || "")}</textarea></div>
    <div class="form-group"><label>Hasil / Output</label><textarea class="form-control" id="erHasil" rows="2">${escHtml(t.hasil || "")}</textarea></div>
    <div class="form-group"><label>Kendala</label><textarea class="form-control" id="erKendala" rows="2">${escHtml(t.kendala || "")}</textarea></div>
    <div class="form-group"><label>Solusi</label><textarea class="form-control" id="erSolusi" rows="2">${escHtml(t.solusi || "")}</textarea></div>
    <div class="form-group"><label>Rencana Besok</label><textarea class="form-control" id="erRencana" rows="2">${escHtml(t.rencana || "")}</textarea></div>
    <div class="grid-2">
      <div class="form-group"><label>Durasi (hari)</label><input class="form-control" type="number" id="erDurasi" value="${t.durasi || 1}" step="0.5"></div>
      <div class="form-group"><label>Progress (%)</label><input class="form-control" type="number" id="erProgress" value="${t.progress || 0}" min="0" max="100"></div>
    </div>
    <button class="btn btn-primary" onclick="updateDailyReport('${id}')">💾 Simpan</button>`,
    true,
  );
}

async function updateDailyReport(id) {
  const aktivitas = document.getElementById("erAktivitas").value.trim();
  if (!aktivitas) return toast("Aktivitas wajib", "warning");
  const updateData = {
    tanggal: document.getElementById("erTanggal").value,
    jamMasuk: document.getElementById("erJamMasuk").value,
    jamKeluar: document.getElementById("erJamKeluar").value,
    aktivitas,
    hasil: document.getElementById("erHasil").value.trim(),
    kendala: document.getElementById("erKendala").value.trim(),
    solusi: document.getElementById("erSolusi").value.trim(),
    rencana: document.getElementById("erRencana").value.trim(),
    durasi: parseFloat(document.getElementById("erDurasi").value) || 0,
    progress: parseInt(document.getElementById("erProgress").value) || 0,
    description: aktivitas,
    title:
      "📝 Daily Report — " +
      formatDate(document.getElementById("erTanggal").value),
    updatedAt: new Date().toISOString(),
  };
  const katEl = document.getElementById("erKategori");
  if (katEl) updateData.kategori = katEl.value;
  await db.collection("hrd_daily_tasks").doc(id).update(updateData);
  closeModalDirect();
  toast("Report diperbarui", "success");
  await loadDailyTasks(_dailyTaskFilter);
}

// == FILE UPLOAD HELPERS ======================================-
function previewTaskFiles(input, previewId) {
  const preview = document.getElementById(previewId);
  if (!preview) return;
  const files = Array.from(input.files).slice(0, 5);
  files.forEach((file) => {
    if (file.size > 10 * 1024 * 1024) {
      toast(`File "${file.name}" terlalu besar (maks 10MB)`, "warning");
      return;
    }
    const isImage = file.type.startsWith("image/");
    const reader = new FileReader();
    reader.onload = (e) => {
      if (isImage) {
        preview.innerHTML += `<div style="position:relative;display:inline-block" class="file-preview-item"><img src="${e.target.result}" style="width:70px;height:70px;object-fit:cover;border-radius:8px;border:2px solid var(--border);cursor:pointer" onclick="window.open(this.src,'_blank')"><div style="position:absolute;top:-6px;right:-6px;background:#c62828;color:#fff;border-radius:50%;width:18px;height:18px;font-size:.65rem;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,.3)" onclick="this.parentElement.remove()">✕</div><div style="font-size:.55rem;text-align:center;color:#666;margin-top:2px;max-width:70px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(file.name.substring(0, 12))}</div></div>`;
      } else {
        const ext = file.name.split(".").pop().toUpperCase();
        const icon =
          ext === "PDF"
            ? "📕"
            : ext.includes("DOC")
              ? "📘"
              : ext.includes("XLS")
                ? "📗"
                : ext.includes("PPT")
                  ? "📙"
                  : "📄";
        preview.innerHTML += `<div style="position:relative;display:inline-flex;flex-direction:column;align-items:center;padding:8px 12px;background:#f5f5f5;border-radius:8px;border:1px solid var(--border);min-width:70px" class="file-preview-item"><div style="font-size:1.5rem">${icon}</div><div style="font-size:.55rem;color:#666;margin-top:4px;max-width:70px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(file.name.substring(0, 12))}</div><div style="font-size:.5rem;color:#999">${(file.size / 1024 / 1024).toFixed(1)}MB</div><div style="position:absolute;top:-6px;right:-6px;background:#c62828;color:#fff;border-radius:50%;width:18px;height:18px;font-size:.65rem;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,.3)" onclick="this.parentElement.remove()">✕</div></div>`;
      }
    };
    reader.readAsDataURL(file);
  });
}

async function getFilesAsBase64(inputId) {
  const input = document.getElementById(inputId);
  const results = [];
  if (input && input.files && input.files.length) {
    const files = Array.from(input.files).slice(0, 5);
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) continue;
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
      results.push({
        name: file.name,
        type: file.type,
        size: file.size,
        data: base64,
      });
    }
  }
  // Also get camera captures
  const cameraId = inputId.replace("Files", "CameraData");
  const cameraEl = document.getElementById(cameraId);
  if (cameraEl && cameraEl.value) {
    try {
      const cam = JSON.parse(cameraEl.value);
      cam.forEach((p) => results.push(p));
    } catch (e) {}
  }
  return results.slice(0, 5);
}

function openCamera(previewId, cameraDataId) {
  // Detect mobile (Android/iOS)
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile) {
    // Mobile: use native camera via file input (most reliable on Android & iOS)
    let camInput = document.getElementById("_mobileCamInput");
    if (!camInput) {
      camInput = document.createElement("input");
      camInput.id = "_mobileCamInput";
      camInput.type = "file";
      camInput.accept = "image/*";
      camInput.capture = "environment";
      camInput.style.display = "none";
      document.body.appendChild(camInput);
    }
    camInput.onchange = function () {
      const file = camInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (e) {
        const dataUrl = e.target.result;
        const fileName =
          "foto_" +
          new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19) +
          ".jpg";
        // Add to preview
        const preview = document.getElementById(previewId);
        if (preview) {
          preview.innerHTML += `<div style="position:relative;display:inline-block" class="file-preview-item"><img src="${dataUrl}" style="width:70px;height:70px;object-fit:cover;border-radius:8px;border:2px solid #4caf50;cursor:pointer" onclick="window.open(this.src,'_blank')"><div style="position:absolute;top:-6px;right:-6px;background:#c62828;color:#fff;border-radius:50%;width:18px;height:18px;font-size:.65rem;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,.3)" onclick="this.parentElement.remove()">✕</div><div style="font-size:.55rem;text-align:center;color:#4caf50;margin-top:2px">📷 Kamera</div></div>`;
        }
        // Save to hidden camera data
        const cameraEl = document.getElementById(cameraDataId);
        if (cameraEl) {
          let existing = [];
          try {
            existing = JSON.parse(cameraEl.value || "[]");
          } catch (ex) {}
          existing.push({
            name: fileName,
            type: "image/jpeg",
            size: dataUrl.length,
            data: dataUrl,
          });
          cameraEl.value = JSON.stringify(existing);
        }
        toast("📷 Foto berhasil diambil!", "success");
      };
      reader.readAsDataURL(file);
      camInput.value = ""; // reset for next use
    };
    camInput.click();
    return;
  }

  // Desktop: use overlay with getUserMedia
  const overlay = document.createElement("div");
  overlay.id = "cameraOverlay";
  overlay.style.cssText =
    "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.9);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px";
  overlay.innerHTML = `<div style="width:100%;max-width:500px;text-align:center">
    <video id="cameraVideo" autoplay playsinline muted style="width:100%;border-radius:12px;border:3px solid #fff;background:#000"></video>
    <div style="margin-top:16px;display:flex;gap:12px;justify-content:center">
      <button class="btn btn-primary" onclick="capturePhoto('${previewId}','${cameraDataId}')" style="padding:14px 28px;font-size:1.1rem;border-radius:50px">📸 Ambil Foto</button>
      <button class="btn btn-outline" onclick="stopCamera();document.getElementById('cameraOverlay')?.remove()" style="border-radius:50px;color:#fff;border-color:#fff">✕ Batal</button>
    </div>
    <p class="text-xs mt-8" style="color:#ccc">Izinkan akses kamera.</p>
  </div>`;
  document.body.appendChild(overlay);
  setTimeout(() => {
    const video = document.getElementById("cameraVideo");
    if (!video) return;
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      })
      .then((stream) => {
        video.srcObject = stream;
        window._cameraStream = stream;
      })
      .catch(() => {
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((stream) => {
            video.srcObject = stream;
            window._cameraStream = stream;
          })
          .catch((err) => {
            toast("Gagal akses kamera: " + err.message, "error");
            document.getElementById("cameraOverlay")?.remove();
          });
      });
  }, 300);
}

function capturePhoto(previewId, cameraDataId) {
  const video = document.getElementById("cameraVideo");
  const canvas = document.createElement("canvas");
  if (!video) return;
  canvas.width = video.videoWidth || 1280;
  canvas.height = video.videoHeight || 720;
  canvas.getContext("2d").drawImage(video, 0, 0);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
  const fileName =
    "foto_" +
    new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19) +
    ".jpg";
  stopCamera();
  document.getElementById("cameraOverlay")?.remove();
  // Add to preview
  setTimeout(() => {
    const preview = document.getElementById(previewId);
    if (preview) {
      preview.innerHTML += `<div style="position:relative;display:inline-block" class="file-preview-item"><img src="${dataUrl}" style="width:70px;height:70px;object-fit:cover;border-radius:8px;border:2px solid #4caf50;cursor:pointer" onclick="window.open(this.src,'_blank')"><div style="position:absolute;top:-6px;right:-6px;background:#c62828;color:#fff;border-radius:50%;width:18px;height:18px;font-size:.65rem;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,.3)" onclick="this.parentElement.remove()">✕</div><div style="font-size:.55rem;text-align:center;color:#4caf50;margin-top:2px">📷 Kamera</div></div>`;
    }
    const cameraEl = document.getElementById(cameraDataId);
    if (cameraEl) {
      let existing = [];
      try {
        existing = JSON.parse(cameraEl.value || "[]");
      } catch (e) {}
      existing.push({
        name: fileName,
        type: "image/jpeg",
        size: dataUrl.length,
        data: dataUrl,
      });
      cameraEl.value = JSON.stringify(existing);
    }
    toast("📷 Foto berhasil diambil!", "success");
  }, 200);
}

function stopCamera() {
  if (window._cameraStream) {
    window._cameraStream.getTracks().forEach((t) => t.stop());
    window._cameraStream = null;
  }
}

// == EVIDEN ZOOM VIEWER ========================================-
var _zoomState = {
  scale: 1,
  posX: 0,
  posY: 0,
  isDragging: false,
  startX: 0,
  startY: 0,
  lastPosX: 0,
  lastPosY: 0,
};

function initEvidenZoom() {
  _zoomState = {
    scale: 1,
    posX: 0,
    posY: 0,
    isDragging: false,
    startX: 0,
    startY: 0,
    lastPosX: 0,
    lastPosY: 0,
  };
  const container = document.getElementById("zoomContainer");
  const img = document.getElementById("zoomImage");
  if (!container || !img) return;

  // Wait for image to load then fit
  img.onload = function () {
    evidenZoomFit();
  };
  // If already loaded (cached)
  if (img.complete && img.naturalWidth) {
    evidenZoomFit();
  }

  // Mouse wheel zoom
  container.addEventListener(
    "wheel",
    function (e) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.15 : 0.15;
      const newScale = Math.min(5, Math.max(0.2, _zoomState.scale + delta));
      _zoomState.scale = newScale;
      updateZoomTransform();
    },
    { passive: false },
  );

  // Mouse drag
  container.addEventListener("mousedown", function (e) {
    e.preventDefault();
    _zoomState.isDragging = true;
    _zoomState.startX = e.clientX - _zoomState.posX;
    _zoomState.startY = e.clientY - _zoomState.posY;
    img.classList.add("no-transition");
  });
  document.addEventListener("mousemove", handleZoomDrag);
  document.addEventListener("mouseup", handleZoomDragEnd);

  // Touch support (pinch-to-zoom + drag)
  var lastTouchDist = 0;
  container.addEventListener(
    "touchstart",
    function (e) {
      if (e.touches.length === 1) {
        _zoomState.isDragging = true;
        _zoomState.startX = e.touches[0].clientX - _zoomState.posX;
        _zoomState.startY = e.touches[0].clientY - _zoomState.posY;
        img.classList.add("no-transition");
      } else if (e.touches.length === 2) {
        lastTouchDist = getTouchDist(e.touches);
      }
    },
    { passive: true },
  );

  container.addEventListener(
    "touchmove",
    function (e) {
      e.preventDefault();
      if (e.touches.length === 1 && _zoomState.isDragging) {
        _zoomState.posX = e.touches[0].clientX - _zoomState.startX;
        _zoomState.posY = e.touches[0].clientY - _zoomState.startY;
        updateZoomTransform();
      } else if (e.touches.length === 2) {
        const dist = getTouchDist(e.touches);
        if (lastTouchDist > 0) {
          const pinchDelta = (dist - lastTouchDist) * 0.008;
          _zoomState.scale = Math.min(
            5,
            Math.max(0.2, _zoomState.scale + pinchDelta),
          );
          updateZoomTransform();
        }
        lastTouchDist = dist;
      }
    },
    { passive: false },
  );

  container.addEventListener("touchend", function (e) {
    _zoomState.isDragging = false;
    lastTouchDist = 0;
    img.classList.remove("no-transition");
  });

  // Double click/tap to reset
  container.addEventListener("dblclick", function () {
    evidenZoomReset();
  });
}

function handleZoomDrag(e) {
  if (!_zoomState.isDragging) return;
  _zoomState.posX = e.clientX - _zoomState.startX;
  _zoomState.posY = e.clientY - _zoomState.startY;
  updateZoomTransform();
}

function handleZoomDragEnd() {
  _zoomState.isDragging = false;
  var img = document.getElementById("zoomImage");
  if (img) img.classList.remove("no-transition");
}

function getTouchDist(touches) {
  var dx = touches[0].clientX - touches[1].clientX;
  var dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function updateZoomTransform() {
  var img = document.getElementById("zoomImage");
  var levelText = document.getElementById("zoomLevelText");
  if (img) {
    img.style.transform =
      "translate(calc(-50% + " +
      _zoomState.posX +
      "px), calc(-50% + " +
      _zoomState.posY +
      "px)) scale(" +
      _zoomState.scale +
      ")";
  }
  if (levelText) {
    levelText.textContent = Math.round(_zoomState.scale * 100) + "%";
  }
}

function evidenZoomIn() {
  _zoomState.scale = Math.min(5, _zoomState.scale + 0.25);
  updateZoomTransform();
}

function evidenZoomOut() {
  _zoomState.scale = Math.max(0.2, _zoomState.scale - 0.25);
  updateZoomTransform();
}

function evidenZoomReset() {
  _zoomState.scale = 1;
  _zoomState.posX = 0;
  _zoomState.posY = 0;
  updateZoomTransform();
}

function evidenZoomFit() {
  var container = document.getElementById("zoomContainer");
  var img = document.getElementById("zoomImage");
  if (!container || !img || !img.naturalWidth) {
    evidenZoomReset();
    return;
  }
  var cw = container.clientWidth;
  var ch = container.clientHeight;
  var iw = img.naturalWidth;
  var ih = img.naturalHeight;
  var fitScale = Math.min(cw / iw, ch / ih, 1);
  _zoomState.scale = fitScale;
  _zoomState.posX = 0;
  _zoomState.posY = 0;
  updateZoomTransform();
}

function viewEviden(encodedData) {
  try {
    const file = JSON.parse(decodeURIComponent(encodedData));
    const isImage = file.type && file.type.startsWith("image/");
    const isPdf =
      (file.type && file.type === "application/pdf") ||
      (file.name && file.name.toLowerCase().endsWith(".pdf"));
    let content = "";
    if (isImage) {
      content = `<div class="zoom-controls">
        <button class="zoom-btn" onclick="evidenZoomOut()" title="Zoom Out">➖</button>
        <button class="zoom-btn" onclick="evidenZoomReset()" title="Reset">🔄</button>
        <span class="zoom-level" id="zoomLevelText">100%</span>
        <button class="zoom-btn" onclick="evidenZoomIn()" title="Zoom In">➕</button>
        <button class="zoom-btn" onclick="evidenZoomFit()" title="Fit">📐</button>
      </div>
      <div class="zoom-container" id="zoomContainer">
        <img id="zoomImage" src="${file.data}" alt="${escHtml(file.name || "Eviden")}">
      </div>
      <div style="text-align:center;margin-top:8px">
        <span class="text-xs" style="color:#999">💡 Scroll untuk zoom • Drag untuk geser • Double-tap reset</span>
      </div>`;
    } else if (isPdf) {
      content = `<iframe src="${file.data}" style="width:100%;height:70vh;border:none;border-radius:8px"></iframe>`;
    } else {
      const ext = (file.name || "").split(".").pop().toUpperCase();
      const icon =
        ext === "PDF"
          ? "📕"
          : ext.match(/DOCX?/)
            ? "📘"
            : ext.match(/XLSX?/)
              ? "📗"
              : ext.match(/PPTX?/)
                ? "📙"
                : "📄";
      content = `<div style="text-align:center;padding:40px"><div style="font-size:4rem;margin-bottom:16px">${icon}</div><div class="fw-700 mb-8" style="font-size:1.1rem">${escHtml(file.name)}</div><p class="text-sm mb-16" style="color:#666">Preview langsung tidak tersedia untuk format ${ext}.</p><div style="display:flex;gap:12px;justify-content:center"><a href="${file.data}" target="_blank" class="btn btn-primary">📂 Buka di Tab Baru</a><a href="${file.data}" download="${escHtml(file.name)}" class="btn btn-outline">⬇️ Download</a></div></div>`;
    }
    openModal(
      `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><div class="fw-700" style="font-size:1rem">📎 ${escHtml(file.name || "Lampiran")}</div><button class="btn btn-xs btn-outline" onclick="closeModalDirect()">✕</button></div>${content}`,
      true,
    );
    // Initialize zoom if image
    if (isImage) {
      setTimeout(initEvidenZoom, 100);
    }
  } catch (e) {
    toast("Gagal membuka file", "error");
  }
}

function startTaskReminderCheck() {
  if (_reminderCheckInterval) clearInterval(_reminderCheckInterval);
  // Check immediately then every 2 minutes
  checkTaskReminders();
  _reminderCheckInterval = setInterval(checkTaskReminders, 2 * 60 * 1000);
}

// == DAILY REPORT AUTO-SUMMARY & WA SHARE ======================
let _reportSummaryInterval = null;
let _reportSummaryDivisionFilter = "all";
let _reportSummaryCache = {};

function startReportSummaryScheduler() {
  if (_reportSummaryInterval) clearInterval(_reportSummaryInterval);
  // Check immediately then every minute
  checkReportSummaryTime();
  _reportSummaryInterval = setInterval(checkReportSummaryTime, 60 * 1000);
}

function checkReportSummaryTime() {
  // Only for Manager (level 3), Head (level 4) and BOD (level 5)
  if (!hasAccess(3)) return;

  const now = new Date();
  // Skip Sunday (0 = Sunday)
  if (now.getDay() === 0) return;

  const hour = now.getHours();
  // Trigger at or after 20:00 (8 PM) WIB
  if (hour >= 20) {
    const todayKey = "report_summary_sent_" + todayStr();
    if (!localStorage.getItem(todayKey)) {
      localStorage.setItem(todayKey, "1");
      generateAndNotifyReportSummary();
    }
  }
}

async function generateAndNotifyReportSummary() {
  // Send notification to current user (Head/BOD)
  await sendNotification(
    currentUser.id,
    "\ud83d\udccb Rangkuman Daily Report",
    "Rangkuman report hari ini siap di-share via WhatsApp",
    "report-summary",
  );
  toast(
    "\ud83d\udccb Rangkuman Daily Report siap! Klik notifikasi untuk share.",
    "info",
  );
}

async function renderReportSummary() {
  const main = document.getElementById("mainContent");

  let addBtn = "";
  if (hasAccess(6)) {
    addBtn = '<button class="btn btn-primary btn-sm" onclick="modalAddTaskChoice()">+ Tambah</button> <button class="btn btn-success btn-sm" onclick="modalImportWeeklyReport()">⬆️ Import Laporan</button>';
  } else if (hasAccess(5)) {
    addBtn = '<button class="btn btn-primary btn-sm" onclick="modalAddTask()">+ Tambah Task</button>';
  } else if (hasAccess(2) || hasHeadLevelAccess()) {
    addBtn = '<button class="btn btn-primary btn-sm" onclick="modalAddTaskChoice()">+ Tambah</button> <button class="btn btn-success btn-sm" onclick="modalImportWeeklyReport()">⬆️ Import Laporan</button>';
  } else {
    addBtn = '<button class="btn btn-primary btn-sm" onclick="modalAddDailyReport()">+ Daily Report</button>';
  }

  const tabs = getDailyTaskTabs('report-summary');

  main.innerHTML = `
    <div class="page-title"><span>📋 Daily Task & Report</span>${addBtn}</div>
    <div class="stats-grid mb-16" id="taskStats"></div>
    <div class="card">
      <div class="tabs mb-16" id="taskTabs" style="flex-wrap:wrap">${tabs}</div>
      <div id="reportSummaryContent"><div class="loading-spinner"></div> Loading...</div>
    </div>`;

  // Load stats separately since we're in report summary view but want to keep the header consistent
  _loadTaskStatsForHeader();

  const today = todayStr();
  await _loadReportSummaryForDate(today);
}

async function _loadTaskStatsForHeader() {
  const statsEl = document.getElementById("taskStats");
  if (!statsEl) return;

  try {
    const snap = await db.collection("hrd_daily_tasks").get();
    let total = 0, todayCount = 0, overdue = 0, done = 0;
    const today = todayStr();

    snap.forEach(d => {
      const t = d.data();
      if (!doesTaskBelongToUser(t)) return;
      total++;
      if (t.tanggal === today) todayCount++;
      if (t.status === "selesai") done++;
      else if (t.deadline && t.deadline < today) overdue++;
    });

    statsEl.innerHTML = `
      <div class="stat-card" onclick="filterDailyTasks('all')" style="border-left-color:var(--primary); cursor:pointer">
        <div class="stat-value" style="color:var(--primary)">${total}</div>
        <div class="stat-label">Total Task</div>
      </div>
      <div class="stat-card" onclick="filterDailyTasks('today')" style="border-left-color:var(--warning); cursor:pointer">
        <div class="stat-value" style="color:var(--warning)">${todayCount}</div>
        <div class="stat-label">Hari Ini</div>
      </div>
      <div class="stat-card" onclick="filterDailyTasks('overdue')" style="border-left-color:var(--danger); cursor:pointer">
        <div class="stat-value" style="color:var(--danger)">${overdue}</div>
        <div class="stat-label">Terlambat</div>
      </div>
      <div class="stat-card" onclick="filterDailyTasks('done')" style="border-left-color:var(--success); cursor:pointer">
        <div class="stat-value" style="color:var(--success)">${done}</div>
        <div class="stat-label">Selesai</div>
      </div>`;
  } catch (e) {}
}

async function _loadReportSummaryForDate(dateVal) {
  const container = document.getElementById("reportSummaryContent");
  if (!container) return;
  container.innerHTML =
    '<div class="loading-spinner"></div> Loading data dari database...';

  // Optimization: use filtered query
  let snap;
  try {
    snap = await db
      .collection("hrd_daily_tasks")
      .where("type", "==", "report")
      .where("tanggal", "==", dateVal)
      .get();
  } catch (e) {
    console.error("[Report] Query failed:", e.message);
    // Fallback: search all if index is missing (temp)
    snap = await db.collection("hrd_daily_tasks").get();
  }

  // Build cache and collect reports for selected date
  _reportSummaryCache = {};
  const allReports = [];
  for (const d of snap.docs) {
    const t = d.data();
    if (t.type === "report" && t.tanggal === dateVal) {
      const rep = Object.assign({ id: d.id }, t);
      allReports.push(rep);
      _reportSummaryCache[d.id] = rep;
    }
  }

  // Prepare header info
  const dayNames = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ];
  const dObj = new Date(dateVal + "T00:00:00");
  const dayName = dayNames[dObj.getDay()] || "Hari ini";
  const dateStr = dObj.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  let waText =
    "\ud83d\udccb *REPORT HARIAN IJEF*\n\ud83d\udcc5 " +
    dayName +
    ", " +
    dateStr +
    "\n\n";

  // Apply division filter
  let reports = allReports;
  if (_reportSummaryDivisionFilter === "academic") {
    reports = allReports.filter(
      (r) => (r.departemen || "").toUpperCase() === "ACADEMIC",
    );
  } else if (_reportSummaryDivisionFilter === "office") {
    reports = allReports.filter(
      (r) => (r.departemen || "").toUpperCase() === "OFFICE",
    );
  }

  let htmlContent = "";
  let totalDone = 0,
    totalProgressValue = 0,
    totalOnTrack = 0,
    totalNeedAttention = 0,
    totalKendala = 0;

  if (!reports.length) {
    waText += "\u26a0\ufe0f 0 report masuk untuk hari ini.\n";
    htmlContent = `<div class="card"><p>\u26a0\ufe0f Tidak ada report masuk pada tanggal ${dateStr}.</p></div>`;
  } else {
    // Group by department then by category
    const byDept = {};
    for (const r of reports) {
      const dept = (r.departemen || "LAINNYA").toUpperCase();
      const kat = (r.kategori || "UMUM").toUpperCase();
      if (!byDept[dept]) byDept[dept] = {};
      if (!byDept[dept][kat]) byDept[dept][kat] = [];
      byDept[dept][kat].push(r);
    }

    for (const dept of Object.keys(byDept).sort()) {
      const katMap = byDept[dept];
      const deptItems = Object.values(katMap).flat();
      const icon = dept.includes("ACADEMIC") ? "\ud83d\udcda" : "\ud83c\udfe2";
      let deptDone = 0,
        deptOnTrack = 0,
        deptNeedAttention = 0;

      waText += "*" + icon + " " + dept + " (" + deptItems.length + " report)*\n";
      htmlContent += `<div class="card mb-8"><div class="fw-700 mb-8">${icon} ${escHtml(dept)} (${deptItems.length})</div>`;

      for (const kat of Object.keys(katMap).sort()) {
        const items = katMap[kat];
        waText += "  \ud83d\udcc2 " + kat + " (" + items.length + ")\n";
        htmlContent += `<div style="margin-bottom:12px;background:#f9f9f9;border-radius:8px;padding:10px 12px">
              <div style="font-weight:600;font-size:.82rem;color:#1565c0;margin-bottom:6px;border-bottom:1px solid #d0d9ff;padding-bottom:4px">\ud83d\udcc2 ${escHtml(kat)} (${items.length})</div>`;

        for (const r of items) {
          const nama = (r.targetUserName || r.nama || "-").toUpperCase();
          const aktivitasRaw = (r.aktivitas || r.description || "-").trim();
          let prog = parseInt(r.progress, 10) || 0;
          prog = Math.max(0, Math.min(100, prog));

          const hasil = (r.hasil || "").trim();
          const kendala = (r.kendala || "").trim();

          // Build WA Detail
          waText += "    \u2022 " + nama + " (" + prog + "%)\n";
          waText += "      \ud83d\udccb " + aktivitasRaw.split("\n")[0].substring(0, 100) + "\n";
          if (hasil) waText += "      \u2714 Hasil: " + hasil.split("\n")[0].substring(0, 100) + "\n";
          if (kendala) waText += "      \u26a0\ufe0f Kendala: " + kendala.split("\n")[0].substring(0, 100) + "\n";

          // Build HTML Detail
          const progressColor = prog >= 100 ? "#2e7d32" : prog >= 70 ? "#f57f17" : "#c62828";
          htmlContent += `<div style="padding:8px 0;border-bottom:1px solid #eee;font-size:.85rem;cursor:pointer" onclick="viewReportFromSummary('${r.id}')">
                <div style="display:flex;justify-content:space-between">
                  <b>\u2022 ${escHtml(nama)}</b>
                  <span style="font-weight:700;color:${progressColor}">${prog}%</span>
                </div>
                <div class="text-xs color-light mt-4">${escHtml(aktivitasRaw.substring(0, 120))}...</div>
              </div>`;

          totalProgressValue += prog;
          if (prog >= 100) {
            totalDone++;
            deptDone++;
          } else {
            if (prog >= 70) {
              totalOnTrack++;
              deptOnTrack++;
            } else {
              totalNeedAttention++;
              deptNeedAttention++;
            }
          }
          if (kendala && prog < 100) totalKendala++;
        }
        htmlContent += `</div>`;
      }

      const deptAvg = Math.round(
        deptItems.reduce((acc, it) => acc + (parseInt(it.progress) || 0), 0) /
          deptItems.length,
      );
      waText += `  \ud83d\udcca Dept Summary: \u2705 ${deptDone} | \ud83d\udfe1 ${deptOnTrack} | \ud83d\udd34 ${deptNeedAttention} | \ud83d\udcc8 ${deptAvg}%\n\n`;
      htmlContent += `</div>`;
    }

    const avgOverall = Math.round(totalProgressValue / reports.length);
    waText += `\ud83d\udcca *OVERALL SUMMARY*\nTotal: ${reports.length} | \u2705 Done: ${totalDone} | \ud83d\udfe1 On Track: ${totalOnTrack} | \ud83d\udd34 Perlu Atensi: ${totalNeedAttention} | \u26a0 Kendala: ${totalKendala} | \ud83d\udcc8 Avg: ${avgOverall}%`;
  }

  // UI Setup
  const filterTabs = `<div class="flex gap-8 mb-12">${["all", "academic", "office"]
    .map((div) => {
      const active = _reportSummaryDivisionFilter === div;
      return `<button class="btn btn-sm ${active ? "btn-primary" : "btn-outline"}" onclick="filterReportSummaryByDivision('${div}')">${escHtml(div.toUpperCase())}</button>`;
    })
    .join("")}</div>`;

  container.innerHTML = `
    <div class="card mb-16">
      <div class="flex" style="justify-content:space-between;align-items:center">
        <div class="fw-700">\ud83d\udccb Rangkuman Report - ${escHtml(dateStr)}</div>
        <div class="flex gap-8">
          <input type="date" class="form-control" id="summaryDate" value="${escAttr(dateVal)}" onchange="loadReportSummaryByDate(this.value)" style="width:150px">
          <button class="btn btn-sm btn-success" onclick="shareReportWAManual()" style="background:#25D366; border-color:#25D366; color:#fff" title="Share langsung ke WhatsApp">📱 Share WA</button>
          <button class="btn btn-sm btn-success" onclick="shareReportWA()" title="Kirim otomatis ke grup admin via Gateway">📡 Gateway WA</button>
        </div>
      </div>
    </div>
    ${filterTabs}
    ${htmlContent}`;

  container.setAttribute("data-wa-text", waText);
}

function filterReportSummaryByDivision(div) {
  _reportSummaryDivisionFilter = div;
  var dateVal =
    (document.getElementById("summaryDate") || {}).value || todayStr();
  _loadReportSummaryForDate(dateVal);
}

function viewReportFromSummary(id) {
  var task = _reportSummaryCache[id];
  if (!task) {
    toast("Data report tidak ditemukan", "warning");
    return;
  }
  var moodMap = {
    sangat_baik: "\ud83e\udd29 Sangat Baik",
    baik: "\ud83d\ude0a Baik",
    cukup: "\ud83d\ude10 Cukup",
    kurang: "\ud83d\ude1f Kurang",
    buruk: "\ud83d\ude1e Buruk",
    sangat_buruk: "\ud83d\ude2b Sangat Buruk",
  };
  var moodLabel = moodMap[task.mood] || "\ud83d\ude10 " + (task.mood || "-");
  var progressColor =
    task.progress >= 80
      ? "#2e7d32"
      : task.progress >= 50
        ? "#f57f17"
        : "#c62828";
  openModal(
    '<div class="modal-title">\ud83d\udcdd Daily Report</div>' +
      '<div style="background:#f9f9f9;padding:16px;border-radius:8px;margin-bottom:16px;border-left:4px solid var(--primary)">' +
      '<div class="fw-700" style="color:var(--primary)">' +
      escHtml(task.targetUserName || task.nama || "-") +
      "</div>" +
      '<div class="text-sm" style="color:#666">\ud83d\udcc5 ' +
      formatDate(task.tanggal) +
      " | \u23f0 " +
      (task.jamMasuk || "-") +
      " - " +
      (task.jamKeluar || "-") +
      "</div>" +
      '<div class="text-sm mt-4">\ud83c\udfe2 ' +
      escHtml(task.departemen || "-") +
      " | \ud83d\udcc2 " +
      escHtml(task.kategori || "-") +
      "</div>" +
      '<div class="text-sm mt-4">Progress: <span style="color:' +
      progressColor +
      ';font-weight:700">' +
      (task.progress || 0) +
      "%</span> | Durasi: <b>" +
      (task.durasi || "-") +
      " hari</b> | Mood: " +
      moodLabel +
      "</div>" +
      "</div>" +
      '<div class="mb-16"><div class="fw-700 mb-4" style="color:var(--primary)">\ud83d\udccb Aktivitas</div>' +
      '<div style="background:#fff;border:1px solid var(--border);border-radius:8px;padding:12px;font-size:.85rem;white-space:pre-wrap;line-height:1.7">' +
      escHtml(task.aktivitas || task.description || "-") +
      "</div></div>" +
      (task.hasil
        ? '<div class="mb-16"><div class="fw-700 mb-4" style="color:#2e7d32">\u2705 Hasil / Output</div><div style="background:#f1f8e9;border-radius:8px;padding:12px;font-size:.85rem;white-space:pre-wrap">' +
          escHtml(task.hasil) +
          "</div></div>"
        : "") +
      (task.kendala
        ? '<div class="mb-16"><div class="fw-700 mb-4" style="color:#c62828">\u26a0\ufe0f Kendala / Case</div><div style="background:#fff8f8;border-radius:8px;padding:12px;font-size:.85rem;white-space:pre-wrap">' +
          escHtml(task.kendala) +
          "</div></div>"
        : "") +
      (task.solusi
        ? '<div class="mb-16"><div class="fw-700 mb-4" style="color:#ff6f00">\ud83d\udca1 Solusi / Tindakan</div><div style="background:#fff8e1;border-radius:8px;padding:12px;font-size:.85rem;white-space:pre-wrap">' +
          escHtml(task.solusi) +
          "</div></div>"
        : "") +
      (task.rencana
        ? '<div class="mb-16"><div class="fw-700 mb-4" style="color:#1565c0">\ud83c\udf1f Rencana Besok</div><div style="background:#e3f2fd;border-radius:8px;padding:12px;font-size:.85rem;white-space:pre-wrap">' +
          escHtml(task.rencana) +
          "</div></div>"
        : "") +
      (task.komentarAtasan
        ? '<div class="mb-16"><div class="fw-700 mb-4" style="color:#6a1b9a">\ud83d\udcac Komentar untuk Atasan</div><div style="background:#f3e5f5;border-radius:8px;padding:12px;font-size:.85rem;white-space:pre-wrap">' +
          escHtml(task.komentarAtasan) +
          "</div></div>"
        : "") +
      (task.komentarRekan
        ? '<div class="mb-16"><div class="fw-700 mb-4" style="color:#00695c">\ud83e\udd1d Komentar untuk Rekan Kerja</div><div style="background:#e0f2f1;border-radius:8px;padding:12px;font-size:.85rem;white-space:pre-wrap">' +
          escHtml(task.komentarRekan) +
          "</div></div>"
        : "") +
      (task.attachments && task.attachments.length
        ? '<div class="mb-16" style="padding:16px;background:#f9f9f9;border-radius:10px;border:1px solid var(--border)"><div class="fw-700 mb-12" style="color:#37474f">\ud83d\udcce Lampiran Eviden (' +
          task.attachments.length +
          ' file)</div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:12px">' +
          task.attachments
            .map(function (a, i) {
              return a.type && a.type.startsWith("image/")
                ? '<div style="text-align:center;cursor:pointer" onclick="viewEviden(\'' +
                    encodeURIComponent(
                      JSON.stringify({
                        name: a.name,
                        type: a.type,
                        data: a.data,
                      }),
                    ) +
                    '\')"><img src="' +
                    a.data +
                    '" style="width:100%;height:100px;object-fit:cover;border-radius:8px;border:2px solid var(--border)"><div style="font-size:.6rem;color:#666;margin-top:4px">' +
                    escHtml(a.name || "Foto " + (i + 1)) +
                    "</div></div>"
                : '<div style="cursor:pointer;display:flex;flex-direction:column;align-items:center;padding:14px;background:#fff;border-radius:8px;border:1px solid var(--border)" onclick="viewEviden(\'' +
                    encodeURIComponent(
                      JSON.stringify({
                        name: a.name,
                        type: a.type,
                        data: a.data,
                      }),
                    ) +
                    '\')"><div style="font-size:2.5rem">' +
                    (a.name && a.name.endsWith(".pdf")
                      ? "\ud83d\udcd5"
                      : a.name && a.name.match(/\.docx?$/)
                        ? "\ud83d\udcd8"
                        : a.name && a.name.match(/\.xlsx?$/)
                          ? "\ud83d\udcd7"
                          : "\ud83d\udcc4") +
                    '</div><div style="font-size:.65rem;color:#333;margin-top:6px;text-align:center;word-break:break-all">' +
                    escHtml(a.name) +
                    '</div><div style="font-size:.6rem;color:#1565c0;margin-top:4px;font-weight:600">\ud83d\udc41\ufe0f Lihat</div></div>';
            })
            .join("") +
          "</div></div>"
        : "") +
      '<div class="text-xs" style="color:#999">Dikirim: ' +
      formatDateTime(task.createdAt) +
      "</div>",
    true,
  );
}

async function shareReportWAManual() {
  var container = document.getElementById("reportSummaryContent");
  var text = container ? container.getAttribute("data-wa-text") : "";
  if (!text) {
    return toast("Tidak ada data untuk di-share", "warning");
  }
  var waNumbers = await getRegisteredWhatsAppNumbers();
  var target = waNumbers[0] || "";

  // Use a temporary textarea to copy text to clipboard for better sharing experience
  try {
      await navigator.clipboard.writeText(text);
      toast("Teks laporan disalin ke clipboard", "info");
  } catch (err) {}

  window.open(buildWhatsAppShareUrl(text, target), "_blank");
}

async function shareReportWA() {
  var container = document.getElementById("reportSummaryContent");
  var text = container ? container.getAttribute("data-wa-text") : "";
  if (!text) {
    return toast("Tidak ada data untuk di-share", "warning");
  }
  var waNumbers = await getRegisteredWhatsAppNumbers();
  if (!waNumbers.length) {
    return toast(
      "Nomor WhatsApp admin belum terdaftar di Data Perusahaan.",
      "warning",
    );
  }
  try {
    toast("⏳ Mengirim ke antrian gateway...", "info");
    const batch = db.batch();
    for (const waNumber of waNumbers) {
      const ref = db.collection("hrd_wa_outbox").doc();
      batch.set(ref, {
        targetNumber: waNumber,
        message: text,
        type: "daily_report_summary_manual",
        requestedBy: currentUser?.nama || "user",
        requestedById: currentUser?.id || "",
        createdAt: new Date().toISOString(),
        status: "queued",
      });
    }
    await batch.commit();

    toast(
      "✅ Berhasil! Report masuk antrian gateway ke " + waNumbers.length + " nomor.",
      "success",
    );
  } catch (e) {
    console.warn("[WA Outbox] Queue failed:", e.message);
    toast("Gateway bermasalah. Menggunakan share manual...", "warning");
    shareReportWAManual();
  }
}

async function loadReportSummaryByDate(dateVal) {
  if (!dateVal) return;
  await _loadReportSummaryForDate(dateVal);
}

// == DAILY REPORT ==============================================
const REPORT_CATEGORIES = {
  ACADEMIC: ["SISWA", "TSK-JOB", "SENSEI", "CURRICULUM"],
  OFFICE: [
    "FACILITY'S",
    "FINANCE",
    "HR & LEGAL",
    "PROMOSI",
    "DOCUMENT",
    "MARKETING & SALES",
  ],
};

function getReportCategoryOptions() {
  const dept = (currentUser.departemen || "").toUpperCase().trim();
  const cats = REPORT_CATEGORIES[dept] || REPORT_CATEGORIES["OFFICE"] || [];
  let opts = '<option value="">-- Pilih Kategori --</option>';
  for (const c of cats) {
    opts += `<option value="${c}">${c}</option>`;
  }
  return opts;
}

async function modalAddDailyReport() {
  // Kategori only for staff and leader (level 1-2), not manager+
  const showKategori = !hasAccess(3);
  const catHtml = showKategori
    ? `<div class="form-group"><label>Kategori *</label><select class="form-control" id="drKategori" onchange="saveDailyReportDraft()">${getReportCategoryOptions()}</select></div>`
    : '<input type="hidden" id="drKategori" value="" onchange="saveDailyReportDraft()">';
  openModal(
    `<div class="modal-title">📝 Daily Report</div>
    <p class="text-sm mb-16" style="color:#666">Isi laporan aktivitas harian Anda.</p>
    <div id="draftNotice" style="display:none; background:#fff3e0; padding:10px; border-radius:8px; border-left:4px solid var(--warning); margin-bottom:16px; font-size:.8rem">
        ✨ Draft laporan sebelumnya telah dimuat otomatis.
    </div>
    <div class="grid-2">
      <div class="form-group"><label>Tanggal Laporan *</label><input class="form-control" type="date" id="drTanggal" value="${todayStr()}" oninput="saveDailyReportDraft()"></div>
      ${catHtml}
    </div>
    <div class="grid-2">
      <div class="form-group"><label>Jam Masuk</label><input class="form-control" type="time" id="drJamMasuk" value="08:00" oninput="saveDailyReportDraft()"></div>
      <div class="form-group"><label>Jam Keluar</label><input class="form-control" type="time" id="drJamKeluar" value="17:00" oninput="saveDailyReportDraft()"></div>
    </div>
    <div class="form-group"><label>Aktivitas Hari Ini *</label><textarea class="form-control" id="drAktivitas" rows="4" placeholder="1. Meeting dengan tim marketing\n2. Follow up client ABC\n3. Buat proposal project X\n..." oninput="saveDailyReportDraft()"></textarea></div>
    <div class="form-group"><label>Hasil / Output</label><textarea class="form-control" id="drHasil" rows="2" placeholder="Proposal selesai 80%, meeting berhasil dapat approval..." oninput="saveDailyReportDraft()"></textarea></div>
    <div class="form-group"><label>Kendala / Hambatan</label><textarea class="form-control" id="drKendala" rows="2" placeholder="Tidak ada / Menunggu data dari divisi lain..." oninput="saveDailyReportDraft()"></textarea></div>
    <div class="form-group"><label>Solusi / Tindakan atas Kendala</label><textarea class="form-control" id="drSolusi" rows="2" placeholder="Koordinasi dengan divisi terkait / Eskalasi ke atasan..." oninput="saveDailyReportDraft()"></textarea></div>
    <div class="form-group"><label>Rencana Besok</label><textarea class="form-control" id="drRencana" rows="2" placeholder="1. Finalisasi proposal\n2. Kirim ke client..." oninput="saveDailyReportDraft()"></textarea></div>
    <div class="grid-2">
      <div class="form-group"><label>Durasi Pekerjaan (hari)</label><input class="form-control" type="number" id="drDurasi" min="0" max="30" step="0.5" value="1" placeholder="Contoh: 1" oninput="saveDailyReportDraft()"></div>
      <div class="form-group"><label>Progress Keseluruhan (%)</label><input class="form-control" type="number" id="drProgress" min="0" max="100" value="100" placeholder="0-100" oninput="saveDailyReportDraft()"></div>
    </div>
    <div class="form-group"><label>Mood Hari Ini</label><select class="form-control" id="drMood" onchange="saveDailyReportDraft()"><option value="sangat_baik">🤩 Sangat Baik / Luar Biasa Produktif</option><option value="baik">😊 Baik / Produktif</option><option value="cukup">😐 Cukup / Biasa Saja</option><option value="kurang">😟 Kurang / Ada Hambatan</option><option value="buruk">😞 Buruk / Banyak Masalah</option><option value="sangat_buruk">😫 Sangat Buruk / Overwhelmed</option></select></div>
    <div class="form-group"><label>Komentar untuk Atasan</label><textarea class="form-control" id="drKomentarAtasan" rows="2" placeholder="Pesan/catatan khusus untuk atasan (opsional)..." oninput="saveDailyReportDraft()"></textarea></div>
    <div class="form-group"><label>Komentar untuk Rekan Kerja</label><textarea class="form-control" id="drKomentarRekan" rows="2" placeholder="Apresiasi/pesan untuk rekan tim (opsional)..." oninput="saveDailyReportDraft()"></textarea></div>
    <div class="form-group"><label>📎 Lampiran Eviden</label><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px"><button type="button" class="btn btn-sm btn-outline" onclick="document.getElementById('drFiles').click()">📁 Pilih File</button><button type="button" class="btn btn-sm btn-info" onclick="openCamera('drFilePreview','drCameraData')">📷 Kamera</button></div><input type="file" id="drFiles" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip" onchange="previewTaskFiles(this,'drFilePreview')" style="display:none"><input type="hidden" id="drCameraData"><div id="drFilePreview" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px"></div><div class="text-xs" style="color:#999;margin-top:4px">Maks 5 file, 10MB per file. Format: Gambar, PDF, DOC, XLS, PPT, ZIP. Bisa juga foto langsung via kamera.</div></div>
    <button class="btn btn-primary" onclick="simpanDailyReport()">📤 Kirim Daily Report</button>`,
    true,
  );

  // Restore draft if exists
  const draftKey = "dr_draft_" + currentUser.id;
  const draftRaw = localStorage.getItem(draftKey);
  if (draftRaw) {
    try {
      const d = JSON.parse(draftRaw);
      // Only auto-restore if updated within last 24h
      if (new Date().getTime() - (d.updatedAt || 0) < 86400000) {
        if (d.tanggal) document.getElementById("drTanggal").value = d.tanggal;
        if (d.kategori) document.getElementById("drKategori").value = d.kategori;
        if (d.jamMasuk) document.getElementById("drJamMasuk").value = d.jamMasuk;
        if (d.jamKeluar) document.getElementById("drJamKeluar").value = d.jamKeluar;
        if (d.aktivitas) document.getElementById("drAktivitas").value = d.aktivitas;
        if (d.hasil) document.getElementById("drHasil").value = d.hasil;
        if (d.kendala) document.getElementById("drKendala").value = d.kendala;
        if (d.solusi) document.getElementById("drSolusi").value = d.solusi;
        if (d.rencana) document.getElementById("drRencana").value = d.rencana;
        if (d.durasi) document.getElementById("drDurasi").value = d.durasi;
        if (d.progress) document.getElementById("drProgress").value = d.progress;
        if (d.mood) document.getElementById("drMood").value = d.mood;
        if (d.komentarAtasan) document.getElementById("drKomentarAtasan").value = d.komentarAtasan;
        if (d.komentarRekan) document.getElementById("drKomentarRekan").value = d.komentarRekan;

        const notice = document.getElementById("draftNotice");
        if (notice) notice.style.display = "block";
      }
    } catch (e) {}
  }
}

async function simpanDailyReport() {
  const tanggal = document.getElementById("drTanggal").value;
  const aktivitas = document.getElementById("drAktivitas").value.trim();
  const kategori = document.getElementById("drKategori").value;
  if (!tanggal || !aktivitas)
    return toast("Tanggal dan aktivitas wajib diisi", "warning");
  if (!hasAccess(3) && !kategori)
    return toast("Kategori wajib dipilih", "warning");
  const data = {
    type: "report",
    title: "📝 Daily Report — " + formatDate(tanggal),
    tanggal,
    kategori,
    jamMasuk: document.getElementById("drJamMasuk").value || "",
    jamKeluar: document.getElementById("drJamKeluar").value || "",
    aktivitas,
    hasil: document.getElementById("drHasil").value.trim(),
    kendala: document.getElementById("drKendala").value.trim(),
    solusi: document.getElementById("drSolusi").value.trim(),
    rencana: document.getElementById("drRencana").value.trim(),
    durasi: parseFloat(document.getElementById("drDurasi").value) || 0,
    progress: parseInt(document.getElementById("drProgress").value) || 0,
    mood: document.getElementById("drMood").value,
    komentarAtasan: document.getElementById("drKomentarAtasan").value.trim(),
    komentarRekan: document.getElementById("drKomentarRekan").value.trim(),
    description: aktivitas,
    done: true,
    doneAt: new Date().toISOString(),
    priority: "medium",
    userId: currentUser.id,
    targetUserName: currentUser.nama,
    departemen: currentUser.departemen || "",
    ownerLevel: ROLES[currentUser.role] || 0,
    ownerRole: currentUser.role || "",
    attachments: [],
    createdAt: new Date().toISOString(),
  };
  // Get file attachments
  data.attachments = await getFilesAsBase64("drFiles");
  try {
    await db.collection("hrd_daily_tasks").add(data);
    toast("Daily Report berhasil dikirim", "success");
    // Clear draft on success
    localStorage.removeItem("dr_draft_" + currentUser.id);
  } catch (e) {
    toast("Gagal: " + e.message, "error");
  }
  closeModalDirect();
  await loadDailyTasks("report");
}

function viewDailyReport(id) {
  const task = _dailyTaskData.find((t) => t.id === id);
  if (!task) return;
  const moodMap = {
    sangat_baik: "🤩 Sangat Baik",
    baik: "😊 Baik",
    cukup: "😐 Cukup",
    kurang: "😟 Kurang",
    buruk: "😞 Buruk",
    sangat_buruk: "😫 Sangat Buruk",
  };
  const moodLabel = moodMap[task.mood] || "😐 " + (task.mood || "-");
  const progressColor =
    task.progress >= 80
      ? "#2e7d32"
      : task.progress >= 50
        ? "#f57f17"
        : "#c62828";
  openModal(
    `<div class="modal-title">📝 Daily Report</div>
    <div style="background:#f9f9f9;padding:16px;border-radius:8px;margin-bottom:16px;border-left:4px solid var(--primary);cursor:pointer" onclick="viewUserProfile('${escHtml(task.targetUserName || task.nama || currentUser.nama)}')">
      <div class="fw-700" style="color:var(--primary)">${escHtml(task.targetUserName || currentUser.nama)} <span style="font-size:.7rem;color:#999;font-weight:400">👤 klik untuk lihat profil</span></div>
      <div class="text-sm" style="color:#666">📅 ${formatDate(task.tanggal)} | ⏰ ${task.jamMasuk || "-"} - ${task.jamKeluar || "-"}</div>
      <div class="text-sm mt-4">🏢 ${escHtml(task.departemen || "-")} | 📂 ${escHtml(task.kategori || "-")}</div>
      <div class="text-sm mt-4">Progress: <span style="color:${progressColor};font-weight:700">${task.progress || 0}%</span> | Durasi: <b>${task.durasi || "-"} hari</b> | Mood: ${moodLabel}</div>
    </div>
    <div class="mb-16"><div class="fw-700 mb-4" style="color:var(--primary)">📋 Aktivitas</div><div style="background:#fff;border:1px solid var(--border);border-radius:8px;padding:12px;font-size:.85rem;white-space:pre-wrap;line-height:1.7">${escHtml(task.aktivitas || task.description || "-")}</div></div>
    ${task.hasil ? `<div class="mb-16"><div class="fw-700 mb-4" style="color:#2e7d32">✅ Hasil / Output</div><div style="background:#f1f8e9;border-radius:8px;padding:12px;font-size:.85rem;white-space:pre-wrap">${escHtml(task.hasil)}</div></div>` : ""}
    ${task.kendala || task.case_desc ? `<div class="mb-16"><div class="fw-700 mb-4" style="color:#c62828">⚠️ Kendala / Case</div><div style="background:#fff8f8;border-radius:8px;padding:12px;font-size:.85rem;white-space:pre-wrap">${escHtml(task.kendala || task.case_desc)}</div></div>` : ""}
    ${task.solusi || task.solution ? `<div class="mb-16"><div class="fw-700 mb-4" style="color:#ff6f00">💡 Solusi / Tindakan</div><div style="background:#fff8e1;border-radius:8px;padding:12px;font-size:.85rem;white-space:pre-wrap">${escHtml(task.solusi || task.solution)}</div></div>` : ""}
    ${task.rencanaBesok || task.rencana || task.planning ? `<div class="mb-16"><div class="fw-700 mb-4" style="color:#1565c0">🌟 Planning & Target / Rencana</div><div style="background:#e3f2fd;border-radius:8px;padding:12px;font-size:.85rem;white-space:pre-wrap">${escHtml(task.rencanaBesok || task.rencana || task.planning)}</div></div>` : ""}
    ${task.komentar || task.komentarAtasan ? `<div class="mb-16"><div class="fw-700 mb-4" style="color:#6a1b9a">💬 Komentar</div><div style="background:#f3e5f5;border-radius:8px;padding:12px;font-size:.85rem;white-space:pre-wrap">${escHtml(task.komentar || task.komentarAtasan)}</div></div>` : ""}
    ${task.komentarRekan ? `<div class="mb-16"><div class="fw-700 mb-4" style="color:#00695c">🤝 Komentar untuk Rekan Kerja</div><div style="background:#e0f2f1;border-radius:8px;padding:12px;font-size:.85rem;white-space:pre-wrap">${escHtml(task.komentarRekan)}</div></div>` : ""}
    ${task.attachments && task.attachments.length ? `<div class="mb-16" style="padding:16px;background:#f9f9f9;border-radius:10px;border:1px solid var(--border)"><div class="fw-700 mb-12" style="color:#37474f">📎 Lampiran Eviden (${task.attachments.length} file)</div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:12px">${task.attachments.map((a, i) => (a.type && a.type.startsWith("image/") ? `<div style="text-align:center;cursor:pointer" onclick="viewEviden('${encodeURIComponent(JSON.stringify({ name: a.name, type: a.type, data: a.data }))}')"><img src="${a.data}" style="width:100%;height:100px;object-fit:cover;border-radius:8px;border:2px solid var(--border)"><div style="font-size:.6rem;color:#666;margin-top:4px">${escHtml(a.name || "Foto " + (i + 1))}</div></div>` : `<div style="cursor:pointer;display:flex;flex-direction:column;align-items:center;padding:14px;background:#fff;border-radius:8px;border:1px solid var(--border)" onclick="viewEviden('${encodeURIComponent(JSON.stringify({ name: a.name, type: a.type, data: a.data }))}')"><div style="font-size:2.5rem">${a.name && a.name.endsWith(".pdf") ? "📕" : a.name && a.name.match(/\\.docx?$/) ? "📘" : a.name && a.name.match(/\\.xlsx?$/) ? "📗" : "📄"}</div><div style="font-size:.65rem;color:#333;margin-top:6px;text-align:center;word-break:break-all">${escHtml(a.name)}</div><div style="font-size:.6rem;color:#1565c0;margin-top:4px;font-weight:600">👁️ Lihat</div></div>`)).join("")}</div></div>` : ""}
    <div class="text-xs" style="color:#999">Dikirim: ${formatDateTime(task.createdAt)}</div>`,
    true,
  );
}

// == DAILY REPORT DRAFT HELPERS ================================
function saveDailyReportDraft() {
  try {
    const draft = {
      tanggal: document.getElementById("drTanggal")?.value,
      kategori: document.getElementById("drKategori")?.value,
      jamMasuk: document.getElementById("drJamMasuk")?.value,
      jamKeluar: document.getElementById("drJamKeluar")?.value,
      aktivitas: document.getElementById("drAktivitas")?.value,
      hasil: document.getElementById("drHasil")?.value,
      kendala: document.getElementById("drKendala")?.value,
      solusi: document.getElementById("drSolusi")?.value,
      rencana: document.getElementById("drRencana")?.value,
      durasi: document.getElementById("drDurasi")?.value,
      progress: document.getElementById("drProgress")?.value,
      mood: document.getElementById("drMood")?.value,
      komentarAtasan: document.getElementById("drKomentarAtasan")?.value,
      komentarRekan: document.getElementById("drKomentarRekan")?.value,
      updatedAt: new Date().getTime(),
    };
    localStorage.setItem("dr_draft_" + currentUser.id, JSON.stringify(draft));
  } catch (e) {}
}

// == IMPORT LAPORAN MINGGUAN (dari Spreadsheet) ========================
function modalImportWeeklyReport() {
  openModal(
    '<div class="modal-title">⬆️ Import Laporan Mingguan</div>' +
      '<p class="text-sm mb-16" style="color:#666">Pilih metode import laporan mingguan:</p>' +
      '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px">' +
      "<div style=\"flex:1;min-width:200px;padding:16px;border:2px solid var(--border);border-radius:12px;cursor:pointer;text-align:center\" onclick=\"importFromGoogleSheets()\" onmouseover=\"this.style.borderColor='#1565c0';this.style.background='#f8f9ff'\" onmouseout=\"this.style.borderColor='var(--border)';this.style.background=''\">" +
      '<div style="font-size:2rem;margin-bottom:8px">🌐</div>' +
      '<div class="fw-700">Tarik dari Google Sheets</div>' +
      '<div class="text-xs" style="color:#666;margin-top:4px">Langsung tarik data dari spreadsheet online</div></div>' +
      "<div style=\"flex:1;min-width:200px;padding:16px;border:2px solid var(--border);border-radius:12px;cursor:pointer;text-align:center\" onclick=\"closeModalDirect();modalImportFromFile()\" onmouseover=\"this.style.borderColor='#2e7d32';this.style.background='#f0fff0'\" onmouseout=\"this.style.borderColor='var(--border)';this.style.background=''\">" +
      '<div style="font-size:2rem;margin-bottom:8px">📁</div>' +
      '<div class="fw-700">Upload File Excel/CSV</div>' +
      '<div class="text-xs" style="color:#666;margin-top:4px">Upload file .xlsx atau .csv dari komputer</div></div>' +
      "</div>",
  );
}

// Google Sheets config
var GSHEET_ID = "1K_EiWBpjukWXhiEzJAUXgpT6pmZUb3akRmq298T4g3c";
var GSHEET_GID = "329845829";

function importFromGoogleSheets() {
  closeModalDirect();
  openModal(
    '<div class="modal-title">🌐 Import dari Google Sheets</div>' +
      '<div style="margin-bottom:16px">' +
      '<div class="form-group"><label>Spreadsheet ID</label><input class="form-control" id="gsSheetId" value="' +
      GSHEET_ID +
      '" onchange="loadSheetList()"></div>' +
      '<div class="form-group"><label>Pilih Sheet</label><div style="display:flex;gap:8px"><select class="form-control" id="gsSheetSelect"><option value="' +
      GSHEET_GID +
      '">GABUNGAN REPORT (default)</option></select><button class="btn btn-xs btn-info" onclick="loadSheetList()">🔄 Muat Sheet</button></div></div>' +
      '<div class="grid-2">' +
      '<div class="form-group"><label>Filter Divisi</label><select class="form-control" id="gsFilterDivisi"><option value="">Semua Divisi</option>' +
      '<optgroup label="DIVISI AKADEMIK"><option value="SISWA">SISWA</option><option value="TSK-JOB">TSK-JOB</option><option value="SENSEI">SENSEI</option><option value="CURRICULUM">CURRICULUM</option></optgroup>' +
      '<optgroup label="DIVISI MANAJEMEN"><option value="FACILITY\'S">FACILITY\'S</option><option value="FINANCE">FINANCE</option><option value="HR & LEGAL">HR & LEGAL</option><option value="PROMOSI">PROMOSI</option><option value="DOCUMENT">DOCUMENT</option><option value="MARKETING & SALES">MARKETING & SALES</option></optgroup>' +
      "</select></div>" +
      '<div class="form-group"><label>Filter Waktu</label>' +
      '<select class="form-control mb-8" id="gsFilterMode" onchange="toggleGsFilterMode()" style="margin-bottom:8px"><option value="">Tanpa Filter</option><option value="bulan">Bulan Tertentu</option><option value="periode">Periode (Dari - Sampai)</option></select>' +
      '<div id="gsFilterBulanWrap" style="display:none"><input class="form-control" type="month" id="gsFilterBulan"></div>' +
      '<div id="gsFilterPeriodeWrap" style="display:none"><div style="display:flex;gap:6px;align-items:center"><input class="form-control" type="month" id="gsFilterDari" style="flex:1"> <span class="text-sm">s/d</span> <input class="form-control" type="month" id="gsFilterSampai" style="flex:1"></div></div>' +
      "</div>" +
      "</div>" +
      "</div>" +
      '<div id="gsPreview" style="margin-bottom:16px"></div>' +
      '<div style="display:flex;gap:8px">' +
      '<button class="btn btn-info" onclick="pullFromGoogleSheets()">🔄 Tarik Data</button>' +
      '<button class="btn btn-primary" id="gsImportBtn" style="display:none" onclick="submitGSheetImport()">💾 Import ke Sistem</button>' +
      "</div>" +
      '<div class="text-xs mt-8" style="color:#999">⚠️ Spreadsheet harus di-set "Anyone with the link can view"</div>',
  );
  // Auto-load sheet list
  setTimeout(loadSheetList, 500);
}

async function loadSheetList() {
  var sheetId = document.getElementById("gsSheetId").value.trim();
  var selectEl = document.getElementById("gsSheetSelect");
  if (!selectEl || !sheetId) return;
  selectEl.innerHTML = '<option value="">⏳ Memuat daftar sheet...</option>';
  try {
    // Fetch spreadsheet HTML page to extract sheet names and gids
    var resp = await fetch(
      "https://docs.google.com/spreadsheets/d/" + sheetId + "/edit",
    );
    if (!resp.ok) throw new Error("Gagal akses");
    var html = await resp.text();
    // Parse sheet tabs from HTML - look for sheet names in the page
    var sheets = [];
    // Method 1: Extract from gid parameter in page content
    var regex = /gid=(\d+)[^"]*"[^>]*>([^<]+)</g;
    var match;
    while ((match = regex.exec(html)) !== null) {
      sheets.push({ gid: match[1], name: match[2].trim() });
    }
    // Method 2: Try alternate pattern
    if (!sheets.length) {
      var regex2 = /"name":"([^"]+)"[^}]*"sheetId":(\d+)/g;
      while ((match = regex2.exec(html)) !== null) {
        sheets.push({ gid: match[2], name: match[1] });
      }
    }
    // Method 3: Simple fallback - extract from sheet-tab elements
    if (!sheets.length) {
      var regex3 = /sheet-button-text[^>]*>([^<]+)/g;
      var gidRegex = /gid=(\d+)/g;
      var names = [];
      var gids = [];
      while ((match = regex3.exec(html)) !== null) names.push(match[1].trim());
      while ((match = gidRegex.exec(html)) !== null) gids.push(match[1]);
      // Remove duplicate gids
      var uniqueGids = [...new Set(gids)];
      for (var i = 0; i < Math.min(names.length, uniqueGids.length); i++) {
        sheets.push({ gid: uniqueGids[i], name: names[i] });
      }
    }
    if (sheets.length) {
      var opts = "";
      for (const s of sheets) {
        var selected = s.name.toUpperCase().includes("GABUNGAN")
          ? " selected"
          : "";
        opts +=
          '<option value="' +
          s.gid +
          '"' +
          selected +
          ">" +
          escHtml(s.name) +
          "</option>";
      }
      selectEl.innerHTML = opts;
    } else {
      // Fallback: use default
      selectEl.innerHTML =
        '<option value="' +
        GSHEET_GID +
        '">GABUNGAN REPORT (default)</option><option value="0">Sheet1 (gid=0)</option>';
    }
  } catch (e) {
    selectEl.innerHTML =
      '<option value="' + GSHEET_GID + '">GABUNGAN REPORT (default)</option>';
  }
}

var _gsImportData = [];

function toggleGsFilterMode() {
  var mode = document.getElementById("gsFilterMode").value;
  var bulanWrap = document.getElementById("gsFilterBulanWrap");
  var periodeWrap = document.getElementById("gsFilterPeriodeWrap");
  if (bulanWrap) bulanWrap.style.display = mode === "bulan" ? "block" : "none";
  if (periodeWrap)
    periodeWrap.style.display = mode === "periode" ? "flex" : "none";
}

// Parse month/year from various formats in spreadsheet data
function _parseMonthFromReport(bulan, tanggal) {
  var src = (bulan || tanggal || "").toString().trim();
  if (!src) return null;
  var monthNames = {
    jan: 1,
    januari: 1,
    january: 1,
    feb: 2,
    februari: 2,
    february: 2,
    mar: 3,
    maret: 3,
    march: 3,
    apr: 4,
    april: 4,
    may: 5,
    mei: 5,
    jun: 6,
    juni: 6,
    june: 6,
    jul: 7,
    juli: 7,
    july: 7,
    aug: 8,
    agustus: 8,
    august: 8,
    agu: 8,
    sep: 9,
    september: 9,
    okt: 10,
    oktober: 10,
    oct: 10,
    october: 10,
    nov: 11,
    november: 11,
    nop: 11,
    des: 12,
    desember: 12,
    dec: 12,
    december: 12,
  };
  // Try yyyy-MM or yyyy-MM-dd
  var m1 = src.match(/^(\d{4})-(\d{1,2})/);
  if (m1) return { year: parseInt(m1[1]), month: parseInt(m1[2]) };
  // Try dd/MM/yyyy or MM/dd/yyyy
  var m2 = src.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (m2) return { year: parseInt(m2[3]), month: parseInt(m2[2]) };
  // Try "Okt 2025", "Oktober 2025", "Oct-25"
  var m3 = src.match(/([a-zA-Z]+)\s*[\/\-]?\s*(\d{2,4})/i);
  if (m3) {
    var mn = monthNames[m3[1].toLowerCase().substring(0, 3)];
    var yr = parseInt(m3[2]);
    if (yr < 100) yr += 2000;
    if (mn && yr) return { year: yr, month: mn };
  }
  // Try "2025 Oktober" or "2025-Okt"
  var m4 = src.match(/(\d{4})\s*[\/\-]?\s*([a-zA-Z]+)/i);
  if (m4) {
    var mn2 = monthNames[m4[2].toLowerCase().substring(0, 3)];
    if (mn2) return { year: parseInt(m4[1]), month: mn2 };
  }
  // Try Excel serial date number
  var num = parseFloat(src);
  if (num > 40000 && num < 60000) {
    var d = new Date((num - 25569) * 86400000);
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  }
  // Try just a number as month (1-12)
  if (num >= 1 && num <= 12)
    return { year: new Date().getFullYear(), month: parseInt(num) };
  return null;
}

async function pullFromGoogleSheets() {
  var sheetId = document.getElementById("gsSheetId").value.trim();
  var gid = document.getElementById("gsSheetSelect").value || GSHEET_GID;
  var filterDivisi = document.getElementById("gsFilterDivisi").value;
  var filterMode = document.getElementById("gsFilterMode").value;
  var filterBulan = document.getElementById("gsFilterBulan")?.value || "";
  var filterDari = document.getElementById("gsFilterDari")?.value || "";
  var filterSampai = document.getElementById("gsFilterSampai")?.value || "";
  var preview = document.getElementById("gsPreview");
  preview.innerHTML =
    '<p class="text-sm" style="color:#999">⏳ Mengambil data dari Google Sheets...</p>';
  try {
    // Use gviz endpoint (no CORS issues) with fallback to export
    var url =
      "https://docs.google.com/spreadsheets/d/" +
      sheetId +
      "/gviz/tq?tqx=out:csv&gid=" +
      gid;
    var response;
    try {
      response = await fetch(url);
      if (!response.ok) throw new Error("gviz failed");
    } catch (e1) {
      url =
        "https://docs.google.com/spreadsheets/d/" +
        sheetId +
        "/export?format=csv&gid=" +
        gid;
      response = await fetch(url);
    }
    if (!response.ok)
      throw new Error(
        "Gagal akses spreadsheet (HTTP " +
          response.status +
          "). Pastikan sharing = Anyone with link.",
      );
    var csvText = await response.text();
    if (!csvText || csvText.includes("<!DOCTYPE html>"))
      throw new Error(
        "Spreadsheet tidak bisa diakses. Pastikan sharing = Anyone with the link can view.",
      );
    var workbook = XLSX.read(csvText, { type: "string" });
    var sheet = workbook.Sheets[workbook.SheetNames[0]];
    var jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    if (!jsonData.length) {
      preview.innerHTML =
        '<p class="text-sm" style="color:#c62828">Data kosong.</p>';
      return;
    }
    // Map columns
    _gsImportData = [];
    for (const row of jsonData) {
      var mapped = {
        bulan: String(row["BULAN"] || row["bulan"] || ""),
        tanggal: String(row["TANGGAL"] || row["tanggal"] || ""),
        divisi: String(row["DIVISI"] || row["divisi"] || ""),
        kategori: String(row["KATEGORI"] || row["kategori"] || ""),
        progress: String(row["PROGRESS"] || row["progress"] || ""),
        case_desc: String(row["CASE"] || row["case"] || ""),
        solution: String(row["SOLUTION"] || row["solution"] || ""),
        planning: String(row["PLANNING & TARGET"] || row["PLANNING"] || ""),
        pic: String(row["PIC"] || row["pic"] || ""),
        keterangan: String(row["KETERANGAN"] || row["keterangan"] || ""),
      };
      if (
        mapped.progress ||
        mapped.case_desc ||
        mapped.planning ||
        mapped.pic
      ) {
        _gsImportData.push(mapped);
      }
    }
    // Apply filters
    if (filterDivisi) {
      _gsImportData = _gsImportData.filter(function (r) {
        var kat = (r.kategori || "").toUpperCase().trim();
        var div = (r.divisi || "").toUpperCase().trim();
        var filt = filterDivisi.toUpperCase().trim();
        return (
          kat === filt ||
          div === filt ||
          kat.includes(filt) ||
          div.includes(filt)
        );
      });
    }
    if (filterMode === "bulan" && filterBulan) {
      var fYear = filterBulan.split("-")[0];
      var fMonth = parseInt(filterBulan.split("-")[1]);
      _gsImportData = _gsImportData.filter(function (r) {
        var parsed = _parseMonthFromReport(r.bulan, r.tanggal);
        if (!parsed) return false;
        return parsed.year === parseInt(fYear) && parsed.month === fMonth;
      });
    } else if (filterMode === "periode" && (filterDari || filterSampai)) {
      var dariY = filterDari ? parseInt(filterDari.split("-")[0]) : 0;
      var dariM = filterDari ? parseInt(filterDari.split("-")[1]) : 0;
      var sampaiY = filterSampai ? parseInt(filterSampai.split("-")[0]) : 9999;
      var sampaiM = filterSampai ? parseInt(filterSampai.split("-")[1]) : 12;
      var dariVal = dariY * 100 + dariM;
      var sampaiVal = sampaiY * 100 + sampaiM;
      _gsImportData = _gsImportData.filter(function (r) {
        var parsed = _parseMonthFromReport(r.bulan, r.tanggal);
        if (!parsed) return true; // include if can't parse
        var val = parsed.year * 100 + parsed.month;
        return val >= dariVal && val <= sampaiVal;
      });
    }
    if (!_gsImportData.length) {
      preview.innerHTML =
        '<p class="text-sm" style="color:#f57f17">Tidak ada data yang cocok dengan filter. (Total baris dari spreadsheet: ' +
        jsonData.length +
        ")</p>";
      return;
    }
    // Show preview
    var h =
      '<div class="text-sm fw-700 mb-8">📋 ' +
      _gsImportData.length +
      " baris data ditemukan</div>";
    h +=
      '<div class="table-wrap" style="max-height:220px;overflow-y:auto"><table style="font-size:.75rem"><thead><tr><th>Bulan</th><th>Tgl</th><th>Divisi</th><th>Kategori</th><th>Progress</th><th>PIC</th></tr></thead><tbody>';
    _gsImportData.slice(0, 15).forEach(function (r) {
      h +=
        "<tr><td>" +
        escHtml(r.bulan) +
        "</td><td>" +
        escHtml(r.tanggal) +
        "</td><td>" +
        escHtml(r.divisi) +
        "</td><td>" +
        escHtml(r.kategori) +
        "</td><td>" +
        escHtml((r.progress || "").substring(0, 40)) +
        "</td><td>" +
        escHtml(r.pic) +
        "</td></tr>";
    });
    if (_gsImportData.length > 15)
      h +=
        '<tr><td colspan="6" class="text-center">... ' +
        (_gsImportData.length - 15) +
        " baris lagi</td></tr>";
    h += "</tbody></table></div>";
    preview.innerHTML = h;
    document.getElementById("gsImportBtn").style.display = "inline-block";
  } catch (e) {
    preview.innerHTML =
      '<p class="text-sm" style="color:#c62828">❌ ' +
      escHtml(e.message) +
      "</p>";
  }
}

async function submitGSheetImport() {
  if (!_gsImportData.length) return toast("Tidak ada data", "warning");
  if (
    !confirm(
      "Import " +
        _gsImportData.length +
        " baris sebagai Daily Report ke sistem?",
    )
  )
    return;
  var btn = document.getElementById("gsImportBtn");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "⏳ Cek duplikat & mengimport...";
  }
  // Load existing imported reports to check duplicates
  var existingKeys = new Set();
  try {
    var existingSnap = await db
      .collection("hrd_daily_tasks")
      .where("source", "==", "spreadsheet-import")
      .get();
    existingSnap.forEach(function (d) {
      var e = d.data();
      var key =
        (e.tanggal || "") +
        "|" +
        (e.kategori || "") +
        "|" +
        (e.aktivitas || "").substring(0, 50) +
        "|" +
        (e.targetUserName || "");
      existingKeys.add(key.toLowerCase().trim());
    });
  } catch (ex) {}
  var success = 0,
    skipped = 0;
  for (var i = 0; i < _gsImportData.length; i++) {
    var r = _gsImportData[i];
    var tgl = _parseDateToISO(r.tanggal || r.bulan || "") || r.tanggal || "";
    var key =
      tgl +
      "|" +
      (r.kategori || "") +
      "|" +
      (r.progress || "").substring(0, 50) +
      "|" +
      (r.pic || "");
    if (existingKeys.has(key.toLowerCase().trim())) {
      skipped++;
      continue;
    }
    existingKeys.add(key.toLowerCase().trim());
    try {
      await db.collection("hrd_daily_tasks").add({
        title:
          "Laporan " +
          (r.kategori || r.divisi || "Mingguan") +
          " - " +
          (r.pic || ""),
        type: "report",
        tanggal: tgl,
        aktivitas: r.progress || "",
        kendala: r.case_desc || "",
        solusi: r.solution || "",
        rencanaBesok: r.planning || "",
        komentar: r.keterangan || "",
        kategori: r.kategori || "",
        departemen: _convertDivisi(r.divisi || ""),
        targetUserName: r.pic || "",
        nama: r.pic || "",
        userId: "",
        done: true,
        progress: 100,
        ownerLevel: 0,
        source: "spreadsheet-import",
        importedBy: currentUser.nama,
        createdAt: new Date().toISOString(),
      });
      success++;
    } catch (e) {}
  }
  toast(
    "✅ " +
      success +
      " laporan diimport" +
      (skipped ? ", " + skipped + " duplikat dilewati" : ""),
    "success",
  );
  closeModalDirect();
  loadDailyTasks("report");
}

function modalImportFromFile() {
  openModal(
    '<div class="modal-title">⬆️ Import Laporan Mingguan</div>' +
      '<p class="text-sm mb-16" style="color:#666">Upload file Excel (.xlsx) atau CSV dari spreadsheet laporan mingguan. Format kolom: <b>BULAN, TANGGAL, DIVISI, KATEGORI, PROGRESS, CASE, SOLUTION, PLANNING & TARGET, PIC, KETERANGAN</b></p>' +
      '<div class="form-group"><label>Pilih File Spreadsheet</label>' +
      '<input type="file" id="weeklyReportFile" class="form-control" accept=".xlsx,.xls,.csv" onchange="previewWeeklyImport(this)">' +
      "</div>" +
      '<div id="weeklyImportPreview" style="margin-bottom:16px"></div>' +
      '<div id="weeklyImportActions" style="display:none">' +
      '<button class="btn btn-primary" onclick="submitWeeklyImport()">💾 Import ke Sistem</button>' +
      "</div>",
  );
}

var _weeklyImportData = [];

function previewWeeklyImport(input) {
  var file = input.files[0];
  if (!file) return;
  var preview = document.getElementById("weeklyImportPreview");
  var actions = document.getElementById("weeklyImportActions");
  preview.innerHTML =
    '<p class="text-sm" style="color:#999">Membaca file...</p>';
  var reader = new FileReader();
  reader.onload = function (e) {
    try {
      var workbook = XLSX.read(e.target.result, { type: "array" });
      // Try to find sheet "GABUNGAN REPORT" or use first sheet
      var sheetName =
        workbook.SheetNames.find(function (n) {
          return n.toUpperCase().includes("GABUNGAN");
        }) || workbook.SheetNames[0];
      var sheet = workbook.Sheets[sheetName];
      var jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      if (!jsonData.length) {
        preview.innerHTML =
          '<p class="text-sm" style="color:#c62828">File kosong atau format tidak sesuai.</p>';
        return;
      }
      // Map columns (flexible matching)
      _weeklyImportData = [];
      for (const row of jsonData) {
        var mapped = {
          bulan: row["BULAN"] || row["bulan"] || row["Bulan"] || "",
          tanggal: row["TANGGAL"] || row["tanggal"] || row["Tanggal"] || "",
          divisi: row["DIVISI"] || row["divisi"] || row["Divisi"] || "",
          kategori: row["KATEGORI"] || row["kategori"] || row["Kategori"] || "",
          progress: row["PROGRESS"] || row["progress"] || row["Progress"] || "",
          case_desc: row["CASE"] || row["case"] || row["Case"] || "",
          solution: row["SOLUTION"] || row["solution"] || row["Solution"] || "",
          planning:
            row["PLANNING & TARGET"] ||
            row["PLANNING"] ||
            row["planning"] ||
            row["Planning & Target"] ||
            "",
          pic: row["PIC"] || row["pic"] || row["Pic"] || "",
          keterangan:
            row["KETERANGAN"] || row["keterangan"] || row["Keterangan"] || "",
        };
        // Skip empty rows
        if (
          mapped.progress ||
          mapped.case_desc ||
          mapped.planning ||
          mapped.pic
        ) {
          _weeklyImportData.push(mapped);
        }
      }
      if (!_weeklyImportData.length) {
        preview.innerHTML =
          '<p class="text-sm" style="color:#c62828">Tidak ada data valid ditemukan.</p>';
        return;
      }
      // Show preview table
      var h =
        '<div class="text-sm fw-700 mb-8">📋 Preview: ' +
        _weeklyImportData.length +
        ' baris dari sheet "' +
        escHtml(sheetName) +
        '"</div>';
      h +=
        '<div class="table-wrap" style="max-height:250px;overflow-y:auto"><table style="font-size:.75rem"><thead><tr><th>Bulan</th><th>Tanggal</th><th>Divisi</th><th>Kategori</th><th>Progress</th><th>PIC</th></tr></thead><tbody>';
      _weeklyImportData.slice(0, 20).forEach(function (r) {
        h +=
          "<tr><td>" +
          escHtml(r.bulan) +
          "</td><td>" +
          escHtml(String(r.tanggal)) +
          "</td><td>" +
          escHtml(r.divisi) +
          "</td><td>" +
          escHtml(r.kategori) +
          "</td><td>" +
          escHtml((r.progress || "").substring(0, 50)) +
          "</td><td>" +
          escHtml(r.pic) +
          "</td></tr>";
      });
      if (_weeklyImportData.length > 20)
        h +=
          '<tr><td colspan="6" class="text-center">... dan ' +
          (_weeklyImportData.length - 20) +
          " baris lagi</td></tr>";
      h += "</tbody></table></div>";
      preview.innerHTML = h;
      actions.style.display = "block";
    } catch (err) {
      preview.innerHTML =
        '<p class="text-sm" style="color:#c62828">Gagal membaca file: ' +
        escHtml(err.message) +
        "</p>";
    }
  };
  reader.readAsArrayBuffer(file);
}

async function submitWeeklyImport() {
  if (!_weeklyImportData.length)
    return toast("Tidak ada data untuk diimport", "warning");
  if (
    !confirm(
      "Import " +
        _weeklyImportData.length +
        " baris laporan mingguan ke sistem?",
    )
  )
    return;
  var btn = document.querySelector("#weeklyImportActions button");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "⏳ Mengimport...";
  }
  var success = 0;
  var failed = 0;
  try {
    for (var i = 0; i < _weeklyImportData.length; i++) {
      var r = _weeklyImportData[i];
      try {
        await db.collection("hrd_weekly_reports").add({
          bulan: r.bulan,
          tanggal: String(r.tanggal),
          divisi: r.divisi,
          kategori: r.kategori,
          progress: r.progress,
          case_desc: r.case_desc,
          solution: r.solution,
          planning: r.planning,
          pic: r.pic,
          keterangan: r.keterangan,
          importedBy: currentUser.nama,
          importedAt: new Date().toISOString(),
          type: "weekly-report",
        });
        success++;
      } catch (e) {
        failed++;
      }
    }
    toast(
      "✅ Import selesai: " +
        success +
        " berhasil" +
        (failed ? ", " + failed + " gagal" : ""),
      "success",
    );
    closeModalDirect();
    // Refresh view if on report tab
    if (
      _dailyTaskFilter === "team-report" ||
      _dailyTaskFilter === "all-report"
    ) {
      loadDailyTasks(_dailyTaskFilter);
    }
  } catch (e) {
    toast("Gagal import: " + e.message, "error");
  }
  if (btn) {
    btn.disabled = false;
    btn.textContent = "💾 Import ke Sistem";
  }
}

// == DISPLAY LAPORAN MINGGUAN ==================================
var _weeklyReportFilter = "all";
var _wrDateFrom = "";
var _wrDateTo = "";
var _wrSummaryFilter = "";
var _weeklyReportLookup = {};
var WEEKLY_REPORT_DEFAULT_COL = "hrd_daily_tasks";
var WEEKLY_REPORT_PREVIEW_MAX_LENGTH = 140;

async function loadWeeklyReports(divFilter) {
  if (divFilter !== undefined) {
    _weeklyReportFilter = divFilter;
    _wrSummaryFilter = "";
  }

  if (!document.getElementById("taskList")) {
    await renderDailyTask("weekly");
    return;
  }

  document.querySelectorAll("#taskTabs .tab").forEach(function (t) {
    t.classList.remove("active");
  });
  document.querySelectorAll("#taskTabs .tab").forEach(function (t) {
    if (t.textContent.trim() === "📈 Laporan Mingguan")
      t.classList.add("active");
  });
  var listEl = document.getElementById("taskList");
  if (!listEl) return;
  listEl.innerHTML =
    '<p class="text-sm" style="color:#999">Memuat laporan mingguan...</p>';
  try {
    var items = [];
    var [snap1, snap2] = await Promise.all([
      db.collection("hrd_daily_tasks").where("type", "==", "report").get(),
      db.collection("hrd_weekly_reports").get(),
    ]);
    for (const d of snap1.docs) {
      items.push({ id: d.id, col: "hrd_daily_tasks", ...d.data() });
    }
    snap2.forEach(function (d) {
      items.push({ id: d.id, col: "hrd_weekly_reports", ...d.data() });
    });

    items.sort(function (a, b) {
      return (b.tanggal || b.bulan || "").localeCompare(
        a.tanggal || a.bulan || "",
      );
    });

    if (!items.length) {
      listEl.innerHTML =
        '<div style="text-align:center;padding:32px;color:#999"><div style="font-size:2rem;margin-bottom:8px">📈</div><p>Belum ada laporan mingguan.</p></div>';
      return;
    }

    // Hierarchical visibility for Weekly Reports: Manager+ see all, Staff/Leader see own division
    if (!hasAccess(3)) {
      var myDept = (currentUser.departemen || "").toUpperCase().trim();
      if (myDept) {
        items = items.filter(function (r) {
          var d = (r.departemen || r.divisi || "").toUpperCase().trim();
          const isOwn = doesTaskBelongToUser(r);
          return (
            isOwn ||
            d === myDept ||
            d.includes(myDept) ||
            myDept.includes(d) ||
            !d
          );
        });
      }
    }

    var filtered = items;
    if (_weeklyReportFilter === "akademik")
      filtered = items.filter(function (r) {
        var d = (r.departemen || r.divisi || "").toUpperCase();
        return d.includes("ACADEMIC") || d.includes("AKADEMIK");
      });
    else if (_weeklyReportFilter === "manajemen")
      filtered = items.filter(function (r) {
        var d = (r.departemen || r.divisi || "").toUpperCase();
        return d.includes("OFFICE") || d.includes("MANAJEMEN");
      });

    var filterFrom =
      document.getElementById("wrDateFrom")?.value || _wrDateFrom;
    var filterTo = document.getElementById("wrDateTo")?.value || _wrDateTo;
    _wrDateFrom = filterFrom;
    _wrDateTo = filterTo;
    if (filterFrom)
      filtered = filtered.filter(function (r) {
        return (r.tanggal || "") >= filterFrom;
      });
    if (filterTo)
      filtered = filtered.filter(function (r) {
        return (r.tanggal || "") <= filterTo;
      });

    if (window._wrCatFilter) {
      filtered = filtered.filter(function (r) {
        var kat = (r.kategori || "").toLowerCase();
        var fv = (window._wrCatFilter || "").toLowerCase();
        if (fv === "tanpa kategori")
          return !r.kategori || r.kategori.trim() === "";
        return kat.includes(fv);
      });
    }

    var html = "";

    // --- RANGKUMAN DATA LAPORAN MINGGUAN (DASHBOARD BOX) ---
    const totalReportsSummary = filtered.length;
    const avgProgressSummary =
      totalReportsSummary > 0
        ? Math.round(
            filtered.reduce(
              (acc, cur) => acc + (parseInt(cur.progress) || 0),
              0,
            ) / totalReportsSummary,
          )
        : 0;
    const totalObstaclesSummary = filtered.filter(
      (it) =>
        (it.kendala || it.case_desc || "").trim().length > 0 &&
        (parseInt(it.progress) || 0) < 100,
    ).length;

    // Apply summary filter (set by clicking on summary boxes)
    var filteredForList = filtered;
    if (_wrSummaryFilter === "low_progress") {
      filteredForList = filtered.filter(function (r) {
        return (parseInt(r.progress) || 0) < 70;
      });
    } else if (_wrSummaryFilter === "kendala") {
      filteredForList = filtered.filter(function (r) {
        return (
          (r.kendala || r.case_desc || "").trim().length > 0 &&
          (parseInt(r.progress) || 0) < 100
        );
      });
    }
    filtered = filteredForList;

    var _sfTotal = _wrSummaryFilter === "" || _wrSummaryFilter === "total";
    var _sfProgress = _wrSummaryFilter === "low_progress";
    var _sfKendala = _wrSummaryFilter === "kendala";

    html += `
    <div id="weeklySummaryBox" style="background:#f9f9f9; border:1px solid #d0d9ff; border-radius:12px; padding:16px; margin-bottom:20px; display:grid; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); gap:16px">
        <div onclick="filterWeeklySummary('')" style="text-align:center;cursor:pointer;border-radius:8px;padding:8px;transition:background .2s${_sfTotal ? ";background:#e8eaf6;outline:2px solid var(--primary)" : ""}" title="Klik untuk lihat semua data">
            <div style="font-size:0.75rem; color:#666; margin-bottom:4px">📊 Total Laporan</div>
            <div style="font-size:1.5rem; font-weight:800; color:var(--primary)">${totalReportsSummary}</div>
            <div style="font-size:0.65rem; color:#999; margin-top:2px">Klik untuk lihat semua</div>
        </div>
        <div onclick="filterWeeklySummary('low_progress')" style="text-align:center;cursor:pointer;border-radius:8px;padding:8px;transition:background .2s${_sfProgress ? ";background:#e8f5e9;outline:2px solid #2e7d32" : ""}" title="Klik untuk lihat data progress rendah (<70%)">
            <div style="font-size:0.75rem; color:#666; margin-bottom:4px">📈 Rata-rata Progres</div>
            <div style="font-size:1.5rem; font-weight:800; color:#2e7d32">${avgProgressSummary}%</div>
            <div style="font-size:0.65rem; color:#999; margin-top:2px">Klik untuk lihat progress &lt;70%</div>
        </div>
        <div onclick="filterWeeklySummary('kendala')" style="text-align:center;cursor:pointer;border-radius:8px;padding:8px;transition:background .2s${_sfKendala ? ";background:#ffebee;outline:2px solid #c62828" : ""}" title="Klik untuk lihat data yang memiliki kendala">
            <div style="font-size:0.75rem; color:#666; margin-bottom:4px">⚠️ Total Kendala</div>
            <div style="font-size:1.5rem; font-weight:800; color:#c62828">${totalObstaclesSummary}</div>
            <div style="font-size:0.65rem; color:#999; margin-top:2px">Klik untuk lihat kendala</div>
        </div>
    </div>`;

    if (_wrSummaryFilter) {
      var _sfLabel =
        _wrSummaryFilter === "low_progress"
          ? "📈 Menampilkan: Progress &lt;70%"
          : "⚠️ Menampilkan: Data Berkendala";
      html += `<div style="display:flex;align-items:center;gap:8px;padding:6px 12px;background:#fff3e0;border:1px solid #ff9800;border-radius:8px;margin-bottom:10px;font-size:.82rem;font-weight:700;color:#e65100">
        <span>${_sfLabel}</span>
        <button class="btn btn-xs btn-outline" style="margin-left:auto" onclick="filterWeeklySummary('')">✕ Hapus Filter</button>
      </div>`;
    }

    html +=
      '<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center">';
    html +=
      '<button class="btn btn-xs ' +
      (_weeklyReportFilter === "all" ? "btn-primary" : "btn-outline") +
      '" onclick="loadWeeklyReports(\'all\')">Semua</button>';
    html +=
      '<button class="btn btn-xs ' +
      (_weeklyReportFilter === "akademik" ? "btn-primary" : "btn-outline") +
      '" onclick="loadWeeklyReports(\'akademik\')">📚 ACADEMIC</button>';
    html +=
      '<button class="btn btn-xs ' +
      (_weeklyReportFilter === "manajemen" ? "btn-primary" : "btn-outline") +
      '" onclick="loadWeeklyReports(\'manajemen\')">🏢 OFFICE</button>';
    html +=
      '<button class="btn btn-xs btn-info" style="margin-left:8px" onclick="showWeeklyReportSummaryModal()">📊 Lihat Rangkuman</button>';

    let wrCatOpts = '<option value="">Semua Kategori</option>';
    const categories =
      _weeklyReportFilter === "akademik"
        ? ["Siswa", "Sensei", "Curriculum", "TSK-Job", "Tanpa Kategori"]
        : _weeklyReportFilter === "manajemen"
          ? [
              "HR & Legal",
              "Document",
              "Facility's",
              "Finance",
              "Marketing & Sales",
              "Promosi",
            ]
          : [
              "Siswa",
              "Sensei",
              "Curriculum",
              "TSK-Job",
              "HR & Legal",
              "Document",
              "Facility's",
              "Finance",
              "Marketing & Sales",
              "Promosi",
              "Tanpa Kategori",
            ];
    categories.forEach(function (c) {
      wrCatOpts +=
        '<option value="' +
        c +
        '" ' +
        (window._wrCatFilter === c ? "selected" : "") +
        ">" +
        c +
        "</option>";
    });
    html +=
      '<select class="form-control" style="max-width:180px;padding:4px 8px;font-size:.8rem" onchange="window._wrCatFilter=this.value;loadWeeklyReports()">' +
      wrCatOpts +
      "</select>";
    html += '<span style="margin-left:auto"></span>';
    if (currentUser.role !== "bod") {
      html +=
        '<button class="btn btn-xs btn-danger" onclick="deleteSelectedWeeklyReports()">🗑️ Hapus Terpilih</button> ';
      html +=
        '<button class="btn btn-xs btn-warning" onclick="resetAllWeeklyReports()">⚠️ Reset Semua</button>';
    }
    html += "</div>";

    html +=
      '<div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap;padding:8px 12px;background:#f9f9f9;border-radius:8px">';
    html += '<span class="text-sm fw-700">📅 Periode:</span>';
    html +=
      '<input type="date" class="form-control" id="wrDateFrom" value="' +
      filterFrom +
      '" style="max-width:140px;padding:4px 8px;font-size:.82rem" onchange="_wrDateFrom=this.value;loadWeeklyReports()">';
    html += '<span class="text-sm">—</span>';
    html +=
      '<input type="date" class="form-control" id="wrDateTo" value="' +
      filterTo +
      '" style="max-width:140px;padding:4px 8px;font-size:.82rem" onchange="_wrDateTo=this.value;loadWeeklyReports()">';
    if (filterFrom || filterTo)
      html +=
        "<button class=\"btn btn-xs btn-outline\" onclick=\"_wrDateFrom='';_wrDateTo='';loadWeeklyReports()\">✕</button>";
    html += "</div>";

    if (currentUser.role !== "bod") {
      html +=
        '<div style="margin-bottom:8px"><label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" id="wrSelectAll" onchange="document.querySelectorAll(\'.wr-check\').forEach(function(c){c.checked=this.checked}.bind(this))"> <span class="text-sm fw-700">Pilih Semua (' +
        filtered.length +
        " data)</span></label></div>";
    }

    _weeklyReportLookup = {};
    var groups = {};
    filtered.forEach(function (r) {
      var div = r.departemen || r.divisi || "Tanpa Divisi";
      if (!groups[div]) groups[div] = [];
      groups[div].push(r);
    });

    Object.keys(groups)
      .sort()
      .forEach(function (div) {
        var rows = groups[div];
        html += '<div style="margin-bottom:20px">';
        html +=
          '<div style="padding:8px 14px;background:#e8eaf6;border-radius:8px;font-weight:700;font-size:.88rem;color:#283593;border-left:4px solid #3f51b5;margin-bottom:8px">🏢 ' +
          escHtml(div) +
          " (" +
          rows.length +
          " data)</div>";
        var byPic = {};
        rows.forEach(function (r) {
          var picKey = r.targetUserName || r.pic || r.nama || "-";
          if (!byPic[picKey]) byPic[picKey] = [];
          byPic[picKey].push(r);
        });
        Object.keys(byPic)
          .sort()
          .forEach(function (pic) {
            var userRows = byPic[pic];
            html +=
              '<div style="padding:8px 12px;margin:10px 0 8px;background:#f4f6ff;border-radius:8px;border-left:4px solid #5c6bc0;font-weight:700;font-size:.82rem;color:#3949ab">👤 ' +
              escHtml(pic) +
              " (" +
              userRows.length +
              " report)</div>";
            userRows.forEach(function (r) {
              var tgl = r.tanggal || r.bulan || "-";
              var kat = r.kategori || "-";
              var wrKey = (r.col || WEEKLY_REPORT_DEFAULT_COL) + "::" + r.id;
              _weeklyReportLookup[wrKey] = r;
              var previewText =
                [
                  r.aktivitas,
                  r.kendala,
                  r.solusi,
                  r.rencanaBesok,
                  r.rencana,
                  r.planning,
                  r.komentar,
                  r.keterangan,
                ].find((t) => t && t.trim()) || "-";
              if (previewText.length > WEEKLY_REPORT_PREVIEW_MAX_LENGTH)
                previewText =
                  previewText.substring(0, WEEKLY_REPORT_PREVIEW_MAX_LENGTH) +
                  "...";

              var progressNum = parseInt(r.progress, 10);
              var progressColor = !isNaN(progressNum)
                ? progressNum >= 100
                  ? "#2e7d32"
                  : progressNum >= 70
                    ? "#f57f17"
                    : "#c62828"
                : "#1565c0";

              html += `<div class="wr-item" data-report-key="${escAttr(encodeURIComponent(wrKey))}" style="border:1px solid #e0e0e0;border-radius:10px;padding:14px;margin-bottom:10px;background:#fff;cursor:pointer">
            <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px">
              ${currentUser.role !== "bod" ? `<input type="checkbox" class="wr-check" value="${escAttr(r.id)}" data-col="${escAttr(r.col || WEEKLY_REPORT_DEFAULT_COL)}">` : ""}
              <div style="flex:1"><div class="fw-700">${escHtml(pic)}</div>
              <div class="text-xs" style="color:#666">📅 ${escHtml(tgl)} | 🏢 ${escHtml(div)} | 🏷️ ${escHtml(kat)}</div></div></div>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px">
              <div style="font-size:.8rem;font-weight:700;color:${progressColor}">📈 Progress: ${escHtml(r.progress || "-")}${!isNaN(progressNum) && String(r.progress).indexOf("%") === -1 ? "%" : ""}</div>
              <button class="btn btn-xs btn-info wr-view-btn" data-report-key="${escAttr(encodeURIComponent(wrKey))}">👁️ View</button>
            </div>
            <div style="font-size:.82rem;color:#333;line-height:1.5;background:#f9f9f9;border:1px solid #dfe7ff;border-radius:8px;padding:8px">📝 ${escHtml(previewText)}</div>
          </div>`;
            });
            html += _buildReportTrackerStats(userRows);
          });
        html += _buildReportTrackerStats(rows);
        html += "</div>";
      });
    if (Object.keys(groups).length > 0) {
      html += `<div style="margin-top:20px;padding:10px 14px;background:#fafafa;border-radius:8px;border:1px solid #ddd;font-weight:700;font-size:.82rem;color:#555">📊 Ringkasan Keseluruhan Laporan Mingguan (${filtered.length} data)</div>`;
      html += _buildReportTrackerStats(filtered);
    }
    listEl.innerHTML = html;
    listEl.querySelectorAll(".wr-item").forEach((itemEl) => {
      itemEl.addEventListener("click", function () {
        viewWeeklyReportItem(this.dataset.reportKey || "");
      });
    });
    listEl.querySelectorAll(".wr-view-btn").forEach((btn) => {
      btn.addEventListener("click", function (event) {
        event.stopPropagation();
        viewWeeklyReportItem(this.dataset.reportKey || "");
      });
    });
    listEl.querySelectorAll(".wr-check").forEach((checkbox) => {
      checkbox.addEventListener("click", function (event) {
        event.stopPropagation();
      });
    });
  } catch (e) {
    listEl.innerHTML =
      '<p class="text-sm" style="color:#c62828">Gagal memuat: ' +
      escHtml(e.message) +
      "</p>";
  }
}

/**
 * Modal Rangkuman Laporan Mingguan
 * Menampilkan statistik berdasarkan data yang sedang difilter
 */
function filterWeeklySummary(type) {
  _wrSummaryFilter = type;
  loadWeeklyReports();
  setTimeout(function () {
    var listEl = document.getElementById("taskList");
    if (listEl) listEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 400);
}

function showWeeklyReportSummaryModal() {
  const summaryBox = document.getElementById("weeklySummaryBox");
  if (!summaryBox) return toast("Data rangkuman belum siap", "warning");

  const summaryHtml = summaryBox.innerHTML;
  openModal(`
        <div class="modal-title">📋 Rangkuman Laporan Mingguan</div>
        <p class="text-sm mb-16" style="color:#666">Statistik berdasarkan filter periode dan divisi yang sedang aktif.</p>
        <div style="background:#f9f9f9; border:2px solid var(--primary); border-radius:12px; padding:20px; margin-bottom:16px">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px">
                ${summaryHtml}
            </div>
        </div>
        <div class="text-center">
            <button class="btn btn-outline" onclick="closeModalDirect()">Tutup</button>
        </div>
    `);
}

function viewWeeklyReportItem(key) {
  key = decodeURIComponent(key || "");
  var report = _weeklyReportLookup[key];
  if (!report) return toast("Data laporan tidak ditemukan", "warning");
  var tgl = report.tanggal ? formatDate(report.tanggal) : report.bulan || "-";
  var pic = report.targetUserName || report.pic || report.nama || "-";
  var div = report.departemen || report.divisi || "-";
  var kat = report.kategori || "-";
  var progressText = String(report.progress || "-").trim() || "-";
  var progressNum = parseInt(progressText, 10);
  var hasProgressNum = !isNaN(progressNum);
  var aktivitas = report.aktivitas || report.description || "-";
  var kendala = report.kendala || report.case_desc || "";
  var solusi = report.solusi || report.solution || "";
  var rencana = report.rencanaBesok || report.rencana || report.planning || "";
  var komentar =
    report.komentar || report.keterangan || report.komentarAtasan || "";
  openModal(
    '<div class="modal-title">👁️ Detail Laporan</div>' +
      '<div style="background:#f9f9f9;padding:14px;border-radius:8px;margin-bottom:14px;border-left:4px solid #1565c0">' +
      '<div class="fw-700" style="color:#1565c0">👤 ' +
      escHtml(pic) +
      "</div>" +
      '<div class="text-sm mt-4">📅 ' +
      escHtml(tgl) +
      " | 🏢 " +
      escHtml(div) +
      " | 📂 " +
      escHtml(kat) +
      "</div>" +
      '<div class="text-sm mt-4">📈 Progress: <b>' +
      escHtml(progressText) +
      (hasProgressNum && progressText.indexOf("%") === -1 ? "%" : "") +
      "</b></div>" +
      "</div>" +
      '<div class="mb-12"><div class="fw-700 mb-4" style="color:#1565c0">📋 Aktivitas</div><div style="background:#fff;border:1px solid var(--border);border-radius:8px;padding:10px;font-size:.84rem;white-space:pre-wrap;line-height:1.6">' +
      escHtml(aktivitas) +
      "</div></div>" +
      (kendala
        ? '<div class="mb-12"><div class="fw-700 mb-4" style="color:#e65100">⚠️ Kendala / Case</div><div style="background:#fff8e1;border-radius:8px;padding:10px;font-size:.84rem;white-space:pre-wrap">' +
          escHtml(kendala) +
          "</div></div>"
        : "") +
      (solusi
        ? '<div class="mb-12"><div class="fw-700 mb-4" style="color:#2e7d32">💡 Solusi / Tindakan</div><div style="background:#e8f5e9;border-radius:8px;padding:10px;font-size:.84rem;white-space:pre-wrap">' +
          escHtml(solusi) +
          "</div></div>"
        : "") +
      (rencana
        ? '<div class="mb-12"><div class="fw-700 mb-4" style="color:#6a1b9a">🌟 Planning & Target</div><div style="background:#f3e5f5;border-radius:8px;padding:10px;font-size:.84rem;white-space:pre-wrap">' +
          escHtml(rencana) +
          "</div></div>"
        : "") +
      (komentar
        ? '<div class="mb-12"><div class="fw-700 mb-4" style="color:#555">💬 Keterangan</div><div style="background:#f5f5f5;border-radius:8px;padding:10px;font-size:.84rem;white-space:pre-wrap">' +
          escHtml(komentar) +
          "</div></div>"
        : ""),
    true,
  );
}
async function deleteSelectedWeeklyReports() {
  var checked = document.querySelectorAll(".wr-check:checked");
  if (!checked.length) return toast("Pilih data yang mau dihapus", "warning");
  if (!confirm("Hapus " + checked.length + " data yang dipilih?")) return;
  for (var i = 0; i < checked.length; i++) {
    try {
      await db
        .collection(checked[i].dataset.col || "hrd_daily_tasks")
        .doc(checked[i].value)
        .delete();
    } catch (e) {}
  }
  toast("🗑️ " + checked.length + " data dihapus", "success");
  loadWeeklyReports();
}
async function resetAllWeeklyReports() {
  if (
    !confirm(
      "RESET SEMUA laporan mingguan? Data import dari spreadsheet akan dihapus permanen.",
    )
  )
    return;
  if (!confirm("Yakin? Tindakan ini TIDAK BISA dibatalkan.")) return;
  var count = 0;
  try {
    var s1 = await db
      .collection("hrd_daily_tasks")
      .where("source", "==", "spreadsheet-import")
      .get();
    for (var i = 0; i < s1.docs.length; i++) {
      await s1.docs[i].ref.delete();
      count++;
    }
  } catch (e) {}
  try {
    var s2 = await db.collection("hrd_weekly_reports").get();
    for (var j = 0; j < s2.docs.length; j++) {
      await s2.docs[j].ref.delete();
      count++;
    }
  } catch (e) {}
  toast("⚠️ " + count + " data dihapus", "success");
  loadWeeklyReports();
}

// Parse date string to yyyy-MM-dd format
function _parseDateToISO(dateStr) {
  if (!dateStr) return "";
  var s = String(dateStr).trim();
  // Already yyyy-MM-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // Try dd-Mon-yy (e.g. "31-Oct-25")
  var monthNames = {
    jan: "01",
    feb: "02",
    mar: "03",
    apr: "04",
    may: "05",
    mei: "05",
    jun: "06",
    jul: "07",
    aug: "08",
    agu: "08",
    sep: "09",
    oct: "10",
    okt: "10",
    nov: "11",
    dec: "12",
    des: "12",
  };
  var m1 = s.match(/^(\d{1,2})[\-\/]([a-zA-Z]+)[\-\/](\d{2,4})$/);
  if (m1) {
    var day = m1[1].padStart(2, "0");
    var mon = monthNames[m1[2].toLowerCase().substring(0, 3)] || "01";
    var yr = m1[3].length === 2 ? "20" + m1[3] : m1[3];
    return yr + "-" + mon + "-" + day;
  }
  // Try dd/MM/yyyy
  var m2 = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m2)
    return m2[3] + "-" + m2[2].padStart(2, "0") + "-" + m2[1].padStart(2, "0");
  // Try Mon-yy or "Oct 25"
  var m3 = s.match(/^([a-zA-Z]+)\s*[\-\/]?\s*(\d{2,4})$/);
  if (m3) {
    var mon2 = monthNames[m3[1].toLowerCase().substring(0, 3)] || "01";
    var yr2 = m3[2].length === 2 ? "20" + m3[2] : m3[2];
    return yr2 + "-" + mon2 + "-01";
  }
  // Try Excel serial number
  var num = parseFloat(s);
  if (num > 40000 && num < 60000) {
    var d = new Date((num - 25569) * 86400000);
    return d.toISOString().split("T")[0];
  }
  return s;
}

// Convert divisi names from spreadsheet to system format
function _convertDivisi(divisi) {
  var upper = (divisi || "").toUpperCase().trim();
  if (upper.includes("AKADEMIK") || upper.includes("ACADEMIC"))
    return "ACADEMIC";
  if (
    upper.includes("MANAJEMEN") ||
    upper.includes("MANAGEMENT") ||
    upper.includes("OFFICE")
  )
    return "OFFICE";
  return divisi || "";
}

// View user profile by name
async function viewUserProfile(nama) {
  if (!nama) return;
  try {
    // Search in hrd_karyawan first
    var kSnap = await db
      .collection("hrd_karyawan")
      .where("nama", "==", nama)
      .limit(1)
      .get();
    var profile = null;
    if (!kSnap.empty) {
      profile = kSnap.docs[0].data();
    } else {
      // Try hrd_users
      var uSnap = await db
        .collection("hrd_users")
        .where("nama", "==", nama)
        .limit(1)
        .get();
      if (!uSnap.empty) profile = uSnap.docs[0].data();
    }
    if (!profile) {
      toast("Profil tidak ditemukan untuk: " + nama, "warning");
      return;
    }
    var foto = profile.foto || profile.profilePic || "";
    var fotoHtml = foto
      ? '<img src="' +
        foto +
        '" style="width:150px;height:150px;border-radius:50%;object-fit:cover;border:4px solid var(--primary);cursor:pointer;transition:transform .2s" onmouseover="this.style.transform=\'scale(1.05)\'" onmouseout="this.style.transform=\'scale(1)\'" onclick="viewProfilePhoto(this.src)">'
      : '<div style="width:150px;height:150px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:3.5rem;font-weight:700">' +
        escHtml((profile.nama || "?").charAt(0)) +
        "</div>";
    openModal(
      '<div class="modal-title">👤 Profil Karyawan</div>' +
        '<div style="text-align:center;margin-bottom:20px">' +
        fotoHtml +
        '<div class="fw-700" style="font-size:1.2rem;margin-top:12px">' +
        escHtml(profile.nama || nama) +
        "</div>" +
        '<div class="text-sm" style="color:#666">' +
        escHtml(profile.posisi || profile.role || "-") +
        "</div></div>" +
        '<div style="background:#f9f9f9;border-radius:10px;padding:16px;border:1px solid #e0e0e0">' +
        '<table style="width:100%;border-collapse:collapse;font-size:.88rem">' +
        '<tr><td style="padding:8px;font-weight:700;width:140px;color:#555">NIP</td><td style="padding:8px">' +
        escHtml(profile.nip || "-") +
        "</td></tr>" +
        '<tr><td style="padding:8px;font-weight:700;color:#555">Departemen</td><td style="padding:8px">' +
        escHtml(profile.departemen || "-") +
        "</td></tr>" +
        '<tr><td style="padding:8px;font-weight:700;color:#555">Posisi/Jabatan</td><td style="padding:8px">' +
        escHtml(profile.posisi || profile.role || "-") +
        "</td></tr>" +
        '<tr><td style="padding:8px;font-weight:700;color:#555">Status</td><td style="padding:8px"><span class="badge badge-' +
        (profile.status === "aktif" || profile.status === "active"
          ? "success"
          : "warning") +
        '">' +
        escHtml(profile.status || "aktif") +
        "</span></td></tr>" +
        '<tr><td style="padding:8px;font-weight:700;color:#555">Email</td><td style="padding:8px">' +
        escHtml(profile.email || "-") +
        "</td></tr>" +
        '<tr><td style="padding:8px;font-weight:700;color:#555">No. HP</td><td style="padding:8px">' +
        escHtml(profile.noHp || profile.telepon || "-") +
        "</td></tr>" +
        '<tr><td style="padding:8px;font-weight:700;color:#555">Alamat</td><td style="padding:8px">' +
        escHtml(profile.alamat || "-") +
        "</td></tr>" +
        '<tr><td style="padding:8px;font-weight:700;color:#555">Tanggal Masuk</td><td style="padding:8px">' +
        escHtml(profile.tanggalMasuk || profile.joinDate || "-") +
        "</td></tr>" +
        '<tr><td style="padding:8px;font-weight:700;color:#555">Atasan</td><td style="padding:8px">' +
        escHtml(profile.atasan || "-") +
        "</td></tr>" +
        '<tr><td style="padding:8px;font-weight:700;color:#555">Grade</td><td style="padding:8px">' +
        escHtml(profile.gradeJabatan || "-") +
        "</td></tr>" +
        "</table></div>" +
        '<div style="margin-top:16px;text-align:right"><button class="btn btn-outline" onclick="closeModalDirect()">Tutup</button></div>',
    );
  } catch (e) {
    toast("Gagal memuat profil: " + e.message, "error");
  }
}

// == ACTIVITY TRACKER HELPERS ====================================
// Compute and render tracker stats block for a group of report items
function _buildReportTrackerStats(items) {
  var done = 0,
    onTrack = 0,
    needAttention = 0,
    progress = 0,
    kendala = 0,
    tanpaKendala = 0,
    totalPct = 0;
  items.forEach(function (r) {
    var p = parseInt(String(r.progress || "").trim(), 10);
    if (isNaN(p)) p = 0;
    p = Math.max(0, Math.min(100, p));
    totalPct += p;
    if (p >= 100) {
      done++;
    } else {
      progress++;
      if (p >= 70) onTrack++;
      else needAttention++;
    }
    if ((r.kendala || r.case_desc || "").trim() && p < 100) kendala++;
    else tanpaKendala++;
  });
  var total = items.length;
  var avg = total ? Math.round(totalPct / total) : 0;
  var kendalaCov = total ? Math.round((kendala / total) * 100) : 0;
  var highCov = total ? Math.round(((done + onTrack) / total) * 100) : 0;
  var lowCov = total ? Math.round((needAttention / total) * 100) : 0;
  return (
    '<div style="padding:8px 12px;background:#f0faf4;border-radius:8px;margin-top:8px;font-size:.75rem;border:1px solid #c8e6c9">' +
    '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:4px">' +
    "<span>\u2705 Done: <b>" +
    done +
    "</b></span>" +
    "<span>\ud83d\udfe1 On Track: <b>" +
    onTrack +
    "</b></span>" +
    "<span>\ud83d\udd34 Perlu Atensi: <b>" +
    needAttention +
    "</b></span>" +
    "<span>\u23f3 Progress: <b>" +
    progress +
    "</b></span>" +
    "<span>\u26a0\ufe0f Kendala: <b>" +
    kendala +
    "</b></span>" +
    "<span>\u2705 Tanpa Kendala: <b>" +
    tanpaKendala +
    "</b></span>" +
    "</div>" +
    '<div style="color:#2e7d32;font-weight:700">\ud83d\udcc8 Rata-rata: ' +
    avg +
    "%</div>" +
    '<div style="color:#777;margin-top:2px">Coverage kendala: <b>' +
    kendalaCov +
    "%</b> report punya hambatan</div>" +
    '<div style="color:#777">Coverage progres tinggi (Done + On Track): <b>' +
    highCov +
    "%</b></div>" +
    '<div style="color:#777">Coverage progres rendah (Perlu Atensi): <b>' +
    lowCov +
    "%</b></div>" +
    "</div>"
  );
}

// Render a single report person row with progress bar + aktivitas
function _buildReportTrackerRow(r) {
  var prog = Math.max(0, Math.min(100, parseInt(r.progress, 10) || 0));
  var progressColor =
    prog >= 100 ? "#2e7d32" : prog >= 70 ? "#f57f17" : "#c62828";
  var statusIcon =
    prog >= 100 ? "\u2705" : prog >= 70 ? "\ud83d\udfe1" : "\ud83d\udd34";
  var aktivitasDisplay = (r.aktivitas || r.description || "-").substring(
    0,
    200,
  );
  var canEditReport =
    doesTaskBelongToUser(r) ||
    hasAccess(3) ||
    wasTaskAssignedByUser(r) ||
    r.source === "spreadsheet-import";
  var editBtns = canEditReport
    ? ' <button class="btn btn-xs btn-warning" onclick="event.stopPropagation();editDailyReport(\'' +
      r.id +
      "')\">&#9999;&#65039;</button>" +
      ' <button class="btn btn-xs btn-danger" onclick="event.stopPropagation();hapusDailyTask(\'' +
      r.id +
      "')\">\ud83d\uddd1\ufe0f</button>"
    : "";
  return (
    '<div style="margin-bottom:8px;padding:10px 12px;border:1px solid #e8e8e8;border-radius:8px;background:#fff;cursor:pointer" onclick="viewDailyReport(\'' +
    r.id +
    "')\">" +
    '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">' +
    '<div style="font-weight:600;font-size:.85rem">' +
    statusIcon +
    " " +
    escHtml((r.targetUserName || r.nama || "-").toUpperCase()) +
    "</div>" +
    '<div style="display:flex;align-items:center;gap:6px">' +
    '<span style="font-weight:700;color:' +
    progressColor +
    '">' +
    (prog >= 100 ? "\u2705" : prog + "%") +
    "</span>" +
    '<button class="btn btn-xs btn-info" onclick="event.stopPropagation();viewDailyReport(\'' +
    r.id +
    '\')" style="padding:2px 7px;font-size:.7rem">\ud83d\udc41\ufe0f View</button>' +
    editBtns +
    "</div></div>" +
    '<div style="height:8px;background:#eee;border-radius:999px;overflow:hidden;margin:6px 0">' +
    '<div style="height:100%;width:' +
    prog +
    "%;background:" +
    progressColor +
    ';border-radius:999px;transition:width .3s"></div>' +
    "</div>" +
    '<div style="font-size:.82rem;color:#333">\ud83d\udccb Aktivitas: ' +
    escHtml(aktivitasDisplay) +
    "</div>" +
    (r.kendala
      ? '<div style="font-size:.78rem;color:#c62828;margin-top:3px">\u26a0\ufe0f Kendala: ' +
        escHtml((r.kendala || "").substring(0, 120)) +
        "</div>"
      : "") +
    "</div>"
  );
}

// Build task completion stats block for a group of task items
function _buildTaskTrackerStats(tasks) {
  var total = tasks.length;
  var done = tasks.filter(function (t) {
    return t.done;
  }).length;
  var today2 = todayStr();
  var overdue = tasks.filter(function (t) {
    return !t.done && t.tanggal < today2;
  }).length;
  var pending = total - done - overdue;
  var pct = total ? Math.round((done / total) * 100) : 0;
  var progressColor = pct >= 80 ? "#2e7d32" : pct >= 50 ? "#f57f17" : "#c62828";
  return (
    '<div style="padding:8px 12px;background:#e8f5e9;border-radius:8px;margin-top:8px;font-size:.75rem;border:1px solid #c8e6c9">' +
    '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:4px">' +
    "<span>\u2705 Selesai: <b>" +
    done +
    "</b></span>" +
    "<span>\u23f3 Proses: <b>" +
    pending +
    "</b></span>" +
    "<span>\ud83d\udd34 Terlambat: <b>" +
    overdue +
    "</b></span>" +
    "<span>\ud83d\udccb Total: <b>" +
    total +
    "</b></span>" +
    "</div>" +
    '<div style="height:6px;background:#eee;border-radius:999px;overflow:hidden;margin-top:4px">' +
    '<div style="height:100%;width:' +
    pct +
    "%;background:" +
    progressColor +
    ';border-radius:999px"></div>' +
    "</div>" +
    '<div style="color:' +
    progressColor +
    ';font-weight:700;margin-top:4px">\ud83d\udcc8 Penyelesaian: ' +
    pct +
    "%</div>" +
    "</div>"
  );
}

// Render grouped report tracker (team-report or all-report style)
function _renderGroupedReportTracker(reports, filter) {
  if (!reports.length) {
    return (
      '<div style="text-align:center;padding:32px;color:#999">' +
      '<div style="font-size:2rem;margin-bottom:8px">\ud83d\udcca</div>' +
      "<p>Tidak ada report</p></div>"
    );
  }
  var html = "";
  if (filter === "all-report") {
    // group by dept → category
    var byDept = {};
    for (const r of reports) {
      var dept = r.departemen || "Tanpa Departemen";
      if (!byDept[dept]) byDept[dept] = {};
      var cat = r.kategori || "Tanpa Kategori";
      if (!byDept[dept][cat]) byDept[dept][cat] = [];
      byDept[dept][cat].push(r);
    }
    Object.keys(byDept)
      .sort()
      .forEach(function (dept) {
        var katMap = byDept[dept];
        var allDeptItems = Object.values(katMap).reduce(function (a, b) {
          return a.concat(b);
        }, []);
        html +=
          '<div style="margin-bottom:20px">' +
          '<div style="padding:12px 14px;margin:8px 0;background:#1a1a1a;border-radius:8px;font-weight:700;font-size:.95rem;color:#fff">' +
          "\ud83c\udfe2 " +
          escHtml(dept) +
          " (" +
          allDeptItems.length +
          ")</div>";
        Object.keys(katMap)
          .sort()
          .forEach(function (cat) {
            var catItems = katMap[cat];
            html +=
              '<div style="margin-bottom:12px;background:#f9f9f9;border-radius:8px;padding:10px 12px">' +
              '<div style="font-weight:600;font-size:.82rem;color:#7b1fa2;margin-bottom:8px;border-bottom:1px solid #e0d0ff;padding-bottom:4px">' +
              "\ud83d\udcc2 " +
              escHtml(cat) +
              " (" +
              catItems.length +
              ")</div>";
            catItems.forEach(function (r) {
              html += _buildReportTrackerRow(r);
            });
            html += _buildReportTrackerStats(catItems);
            html += "</div>";
          });
        html += "</div>";
      });
  } else {
    // team-report: group by category → person
    var byCat = {};
    reports.forEach(function (r) {
      var cat = r.kategori || "Tanpa Kategori";
      if (!byCat[cat]) byCat[cat] = [];
      byCat[cat].push(r);
    });
    Object.keys(byCat)
      .sort()
      .forEach(function (cat) {
        var catItems = byCat[cat];
        html +=
          '<div style="margin-bottom:16px">' +
          '<div style="padding:10px 12px;margin:8px 0;background:#e8f5e9;border-radius:8px;font-weight:700;font-size:.92rem;color:#2e7d32;border-left:4px solid #2e7d32">' +
          "\ud83d\udcc2 " +
          escHtml(cat) +
          " (" +
          catItems.length +
          ")</div>";
        // group by person
        var byPerson = {};
        catItems.forEach(function (r) {
          var person = r.targetUserName || "-";
          if (!byPerson[person]) byPerson[person] = [];
          byPerson[person].push(r);
        });
        var personKeys = Object.keys(byPerson).sort();
        personKeys.forEach(function (person) {
          var pItems = byPerson[person];
          html +=
            '<div style="padding:6px 8px;margin:8px 0 6px;background:#fff;border:1px solid #e9eef6;border-radius:8px;font-size:.8rem;color:#555;font-weight:600">' +
            "\ud83d\udc64 " +
            escHtml(person) +
            " (" +
            pItems.length +
            ")</div>";
          pItems.forEach(function (r) {
            html += _buildReportTrackerRow(r);
          });
          html += _buildReportTrackerStats(pItems);
        });
        html += "</div>";
      });
  }
  return html;
}

// Full-screen photo viewer (WhatsApp style)
function viewProfilePhoto(src) {
  if (!src) return;
  var overlay = document.createElement("div");
  overlay.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.95);z-index:999999;display:flex;align-items:center;justify-content:center;flex-direction:column";
  overlay.onclick = function (e) {
    if (e.target === overlay || e.target.tagName === "DIV") overlay.remove();
  };
  overlay.innerHTML =
    '<div style="position:absolute;top:16px;right:20px;color:#fff;font-size:2rem;cursor:pointer" onclick="this.parentElement.remove()">✕</div>' +
    '<img src="' +
    src +
    '" style="max-width:90vw;max-height:90vh;object-fit:contain;border-radius:4px;image-rendering:auto">' +
    '<div style="color:rgba(255,255,255,.5);margin-top:12px;font-size:.8rem">Klik ✕ atau area gelap untuk menutup</div>';
  document.body.appendChild(overlay);
}

// == FORM KAIZEN — General Affair Work Request for GA ==

async function renderFormKaizen() {
  const main = document.getElementById("mainContent");
  if (!main) return;

  const userName = (currentUser.nama || "").toLowerCase().trim();
  const isGA = userName.includes("rizky") || userName.includes("rizkynur");
  const isAdmin = hasAccess(3); // Level 3+ (Manager, Head, BOD, Admin) can see Sync Naming
  const isIrsan = (currentUser.nama || "")
    .toLowerCase()
    .includes("irsan janwar");
  const isGM =
    (currentUser.posisi || "").toLowerCase().includes("general manager") ||
    (currentUser.posisi || "").toLowerCase() === "gm";

  const addBtn = !isGA
    ? '<button class="btn btn-primary btn-sm" onclick="modalAddKaizen()">+ Buat Form Kaizen</button>'
    : "";

  // Priority Filter
  let filterHtml = "";
  if (isGA || hasAccess(3) || hasHeadLevelAccess()) {
    filterHtml = `
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px; background:#f9f9f9; padding:8px 12px; border-radius:8px">
        <span class="text-sm fw-700">🚩 Skala Prioritas:</span>
        <select class="form-control" id="kzFilterPriority" style="max-width:180px; padding:4px 8px; font-size:.82rem" onchange="loadKaizenRecords()">
          <option value="all">Semua Prioritas</option>
          <option value="high">🔴 Tinggi (Mendesak)</option>
          <option value="medium">🟡 Sedang</option>
          <option value="low">🟢 Rendah</option>
        </select>
      </div>`;
  }

  main.innerHTML = `
    <div class="page-title">
      <span>⚡ FORM KAIZEN (General Affair)</span>
      <div class="flex gap-8">
          ${isAdmin ? '<button class="btn btn-warning btn-sm" onclick="fixKaizenNamingData()">🔄 Sync Naming</button>' : ""}
          ${addBtn}
      </div>
    </div>
    <div class="card">
      <p class="text-sm mb-16" style="color:#666">Pemberian tugas/permintaan perbaikan terkait fasilitas & General Affair ditujukan kepada <b>Muhammad Rizky Nur Fadilah</b>.</p>
      ${filterHtml}
      <div id="kaizenStats" class="stats-grid mb-16"></div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Judul Tugas</th>
              <th>Pemohon</th>
              <th>Target Selesai</th>
              <th>Sisa Waktu</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody id="tblKaizen">
            <tr><td colspan="7" class="text-center">Memuat data...</td></tr>
          </tbody>
        </table>
      </div>
    </div>`;
  loadKaizenRecords({ isGA, isIrsan, isGM, isAdmin });
}

async function loadKaizenRecords(roles) {
  const tbody = document.getElementById("tblKaizen");
  const statsEl = document.getElementById("kaizenStats");
  if (!tbody) return;

  try {
    const { isGA, isIrsan, isGM, isAdmin } = roles || {
      isGA: (currentUser.nama || "").toLowerCase().includes("rizky"),
      isIrsan: (currentUser.nama || "").toLowerCase().includes("irsan janwar"),
      isGM:
        (currentUser.posisi || "").toLowerCase().includes("general manager") ||
        (currentUser.posisi || "").toLowerCase() === "gm",
      isAdmin: hasAccess(3),
    };

    const snap = await db
      .collection("hrd_daily_tasks")
      .where("source", "==", "FORM KAIZEN")
      .get();

    let items = [];
    snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
    items.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

    // Filter by visibility: Level 3+ and GA see all, others see only their assigned/owned
    if (!hasAccess(3) && !isGA) {
      items = items.filter(
        (it) => wasTaskAssignedByUser(it) || doesTaskBelongToUser(it),
      );
    }

    const filterPriority =
      document.getElementById("kzFilterPriority")?.value || "all";
    if (filterPriority !== "all") {
      items = items.filter((it) => it.priority === filterPriority);
    }

    let html = "";
    if (!items.length) {
      html =
        '<tr><td colspan="7" class="text-center">Belum ada form Kaizen.</td></tr>';
    } else {
      items.forEach((it) => {
        let statusBadge = "";
        if (it.done) {
          statusBadge = '<span class="badge badge-success">Selesai</span>';
        } else if (it.kaizenStatus === "waiting_approval") {
          statusBadge =
            '<span class="badge badge-info">⏳ Menunggu Approval</span>';
        } else if (it.kaizenStatus === "pending") {
          statusBadge =
            '<span class="badge badge-warning">⚠️ Pending (Revisi)</span>';
        } else if (it.kaizenStatus === "rejected") {
          statusBadge = '<span class="badge badge-danger">❌ Reject</span>';
        } else {
          statusBadge = '<span class="badge badge-warning">Proses</span>';
        }

        let aksiBtns = `<button class="btn btn-xs btn-info" onclick="viewDailyTask('${it.id}')" title="Lihat Detail">👁️</button>`;

        if (isIrsan && it.kaizenStatus === "waiting_approval") {
          aksiBtns += ` <button class="btn btn-xs btn-primary" onclick="modalApproveKaizen('${it.id}')" title="Approval Atasan">✅ Approval</button>`;
        }

        if (isGA && !it.done && it.kaizenStatus !== "waiting_approval") {
          aksiBtns += ` <button class="btn btn-xs btn-success" onclick="modalUpdateKaizenProgress('${it.id}')" title="Berikan Respon/Progress">⚡ Respon</button>`;
        }

        // Edit access: GA specifically EXCLUDED from editing Kaizen tasks
        if (isAdmin || isGM || (isIrsan && !isGA)) {
          aksiBtns += ` <button class="btn btn-xs btn-warning" onclick="editDailyTask('${it.id}')" title="Edit Form Kaizen">✏️</button>`;
        }

        if (wasTaskAssignedByUser(it) || isAdmin) {
          aksiBtns += ` <button class="btn btn-xs btn-danger" onclick="hapusDailyTask('${it.id}')" title="Hapus">🗑️</button>`;
        }

        let sisaWaktuHtml = "-";
        if (it.done) {
          sisaWaktuHtml = '<span class="badge badge-success">Selesai</span>';
        } else if (it.tanggal) {
          const tglTarget = new Date(it.tanggal + "T23:59:59");
          const tglSkrg = new Date();
          const diffTime = tglTarget - tglSkrg;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays < 0) {
            sisaWaktuHtml = `<span style="color:#c62828;font-weight:700">🔴 Terlambat ${Math.abs(diffDays)} hr</span>`;
          } else if (diffDays === 0) {
            sisaWaktuHtml = `<span style="color:#f57f17;font-weight:700">🟡 Hari Ini</span>`;
          } else {
            sisaWaktuHtml = `<span style="color:#1565c0;font-weight:700">🔵 ${diffDays} hr lagi</span>`;
          }
        }

        html += `
          <tr>
            <td class="text-xs">#${it.id.substring(0, 5)}</td>
            <td class="fw-700">
                ${escHtml(it.title.replace("⚡ KAIZEN: ", ""))}
                <div class="text-xs" style="font-weight:400;color:#666">Progress: ${it.progress || 0}%</div>
            </td>
            <td>${escHtml(it.assignedByName || "-")}</td>
            <td>${formatDate(it.tanggal)}</td>
            <td>${sisaWaktuHtml}</td>
            <td>${statusBadge}</td>
            <td>${aksiBtns}</td>
          </tr>`;
      });
    }
    tbody.innerHTML = html;

    const total = items.length;
    const done = items.filter((it) => it.done).length;
    const pending = total - done;
    if (statsEl) {
      statsEl.innerHTML = `
        <div class="stat-card" style="border-left-color:var(--primary)"><div class="stat-value">${total}</div><div class="stat-label">Total Permintaan</div></div>
        <div class="stat-card" style="border-left-color:var(--warning)"><div class="stat-value">${pending}</div><div class="stat-label">Sedang Diproses</div></div>
        <div class="stat-card" style="border-left-color:var(--success)"><div class="stat-value">${done}</div><div class="stat-label">Berhasil Diperbaiki</div></div>
      `;
    }
  } catch (e) {
    if (tbody)
      tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="color:red">Error: ${e.message}</td></tr>`;
  }
}

async function modalAddKaizen() {
  let gaUser = null;
  try {
    const uSnap = await db.collection("hrd_users").get();
    uSnap.forEach((d) => {
      const u = d.data();
      const n = (u.nama || "").toLowerCase();
      // Muhammad Rizky Nur Fadilah is GA
      if (n.includes("rizky") && n.includes("fadilah")) {
        gaUser = { id: d.id, ...u };
      }
    });
  } catch (e) {
    console.warn("Error finding GA user:", e);
  }

  const gaNameDisplay = gaUser ? gaUser.nama : "Muhammad Rizky Nur Fadilah";
  const gaIdValue = gaUser ? gaUser.id : ""; // Empty ID will warn later

  openModal(`
    <div class="modal-title">⚡ Buat FORM KAIZEN (General Affair)</div>
    <p class="text-sm mb-16" style="color:#666">Gunakan form ini untuk memberikan tugas perbaikan fasilitas atau GA kepada <b>${escHtml(gaNameDisplay)}</b>.</p>
    
    <div class="form-group">
      <label>Judul Permintaan / Tugas *</label>
      <input class="form-control" id="kzTitle" placeholder="Contoh: Perbaikan AC Ruang Meeting">
    </div>
    
    <div class="form-group">
      <label>Deskripsi Detail & Lokasi *</label>
      <textarea class="form-control" id="kzDesc" rows="4" placeholder="Jelaskan apa yang perlu diperbaiki atau dikerjakan..."></textarea>
    </div>

    <div class="grid-2">
      <div class="form-group"><label>Target Tanggal Selesai</label><input class="form-control" type="date" id="kzTanggal" value="${todayStr()}"></div>
      <div class="form-group"><label>Prioritas</label><select class="form-control" id="kzPriority"><option value="low">Rendah</option><option value="medium" selected>Sedang</option><option value="high">Tinggi (Mendesak)</option></select></div>
    </div>

    <div class="form-group">
      <label>📎 Lampiran Dokumen / Foto (Eviden)</label>
      <input type="file" id="kzFiles" multiple accept="image/*,.pdf,.doc,.docx" class="form-control">
      <div class="text-xs mt-4" style="color:#999">Maks 3 file. Format: Gambar, PDF, Word.</div>
    </div>

    <input type="hidden" id="targetGAId" value="${gaIdValue}">
    <input type="hidden" id="targetGANama" value="${gaNameDisplay}">

    <button class="btn btn-primary" style="width:100%" onclick="simpanKaizen()">📤 Kirim Form Kaizen</button>
  `);
}

async function simpanKaizen() {
  const title = document.getElementById("kzTitle").value.trim();
  const desc = document.getElementById("kzDesc").value.trim();
  const targetId = document.getElementById("targetGAId").value;
  const targetNama = document.getElementById("targetGANama").value;

  if (!title || !desc)
    return toast("Judul dan deskripsi wajib diisi", "warning");

  if (!targetId)
    return toast("Gagal: User GA tidak ditemukan di sistem. Hubungi Admin.", "danger");

  const data = {
    type: "daily-task",
    source: "FORM KAIZEN",
    title: "⚡ KAIZEN: " + title,
    description: desc,
    tanggal: document.getElementById("kzTanggal").value,
    priority: document.getElementById("kzPriority").value,
    userId: targetId,
    targetUserName: targetNama,
    assignedBy: currentUser.id,
    assignedByName: currentUser.nama,
    done: false,
    progress: 0,
    aktivitas: `Menunggu pengerjaan oleh GA.`,
    ownerLevel: 1,
    departemen: "GENERAL AFFAIR",
    createdAt: new Date().toISOString(),
  };

  try {
    toast("⏳ Mengirim form kaizen...", "info");
    data.attachments = await getFilesAsBase64("kzFiles");
    await db.collection("hrd_daily_tasks").add(data);

    if (targetId) {
      await sendNotification(
        targetId,
        "⚡ FORM KAIZEN BARU",
        `${currentUser.nama} memberikan tugas: ${title}`,
        "kaizen",
      );
    }

    toast("Form Kaizen berhasil dikirim ke GA", "success");
    closeModalDirect();
    renderFormKaizen();
  } catch (e) {
    toast("Gagal: " + e.message, "error");
  }
}

async function modalUpdateKaizenProgress(id) {
  const doc = await db.collection("hrd_daily_tasks").doc(id).get();
  if (!doc.exists) return toast("Data tidak ditemukan", "warning");
  const task = doc.data();

  openModal(`
    <div class="modal-title">⚡ Update Progress Form Kaizen</div>
    <div style="background:#f9f9f9;padding:12px;border-radius:8px;margin-bottom:16px;border-left:4px solid var(--primary)">
      <div class="fw-700">${escHtml(task.title.replace("⚡ KAIZEN: ", ""))}</div>
      <div class="text-xs color-light">${escHtml(task.description)}</div>
    </div>

    <div class="form-group">
      <label>Progress Pengerjaan (%)</label>
      <input type="range" class="form-control" id="upKzProgress" min="0" max="100" step="10" value="${task.progress || 0}" oninput="document.getElementById('kzProgVal').innerText = this.value + '%'">
      <div class="text-center fw-700 color-primary" id="kzProgVal">${task.progress || 0}%</div>
    </div>

    <div class="form-group">
      <label>Status Akhir</label>
      <select class="form-control" id="upKzDone">
        <option value="false" ${!task.done ? "selected" : ""}>⏳ Sedang Diproses (Pending)</option>
        <option value="true" ${task.done ? "selected" : ""}>✅ Selesai Dikerjakan</option>
      </select>
    </div>

    <div class="form-group">
      <label>Respon / Catatan Progress</label>
      <textarea class="form-control" id="upKzAktivitas" rows="3" placeholder="Contoh: Sedang menunggu sparepart / Sudah diperbaiki dan dicek ulang.">${escHtml(task.aktivitas || "")}</textarea>
    </div>

    <div class="form-group">
      <label>📎 Upload Foto Hasil (Opsional)</label>
      <input type="file" id="upKzFiles" multiple accept="image/*" class="form-control">
    </div>

    <button class="btn btn-primary" style="width:100%" onclick="simpanUpdateKaizen('${id}')">💾 Simpan Progress</button>
  `);
}

async function simpanUpdateKaizen(id) {
  const progress = parseInt(document.getElementById("upKzProgress").value);
  const markDone = document.getElementById("upKzDone").value === "true";
  const aktivitas = document.getElementById("upKzAktivitas").value.trim();

  if (!aktivitas) return toast("Harap berikan catatan progress", "warning");

  try {
    toast("⏳ Menyimpan progress...", "info");
    const newAttachments = await getFilesAsBase64("upKzFiles");

    const updateData = {
      progress: progress,
      aktivitas: aktivitas,
      updatedAt: new Date().toISOString(),
      kaizenLogs: firebase.firestore.FieldValue.arrayUnion({
        userId: currentUser.id,
        userName: currentUser.nama,
        action: markDone ? "submit_done" : "update_progress",
        comment: aktivitas,
        progress: progress,
        attachments: newAttachments || [],
        timestamp: new Date().toISOString(),
      }),
    };

    if (markDone) {
      updateData.kaizenStatus = "waiting_approval";
      updateData.progress = 100;
      updateData.done = false;
    } else {
      updateData.kaizenStatus = "proses";
      updateData.done = false;
    }

    if (newAttachments && newAttachments.length > 0) {
      const doc = await db.collection("hrd_daily_tasks").doc(id).get();
      const oldAttachments = doc.data().attachments || [];
      updateData.attachments = [...oldAttachments, ...newAttachments].slice(
        0,
        15,
      );
    }

    await db.collection("hrd_daily_tasks").doc(id).update(updateData);

    if (markDone) {
      try {
        const irsanSnap = await db.collection("hrd_users").get();
        let irsanId = "";
        irsanSnap.forEach((d) => {
          if ((d.data().nama || "").toLowerCase().includes("irsan janwar"))
            irsanId = d.id;
        });
        if (irsanId) {
          await sendNotification(
            irsanId,
            "🔔 Approval Kaizen",
            `GA telah menyelesaikan tugas Kaizen. Mohon tinjau & approve.`,
            "kaizen",
          );
        }
      } catch (err) {}
    }

    const finalDoc = await db.collection("hrd_daily_tasks").doc(id).get();
    const taskFinal = finalDoc.data();
    await sendNotification(
      taskFinal.assignedBy,
      "⚡ UPDATE KAIZEN",
      `GA telah mengupdate tugas: "${taskFinal.title.replace("⚡ KAIZEN: ", "")}" ke ${progress}%`,
      "kaizen",
    );

    toast(
      markDone ? "Tugas dikirim untuk approval atasan" : "Progress diperbarui",
      "success",
    );
    closeModalDirect();
    renderFormKaizen();
  } catch (e) {
    toast("Gagal update: " + e.message, "error");
  }
}

async function modalApproveKaizen(id) {
  const doc = await db.collection("hrd_daily_tasks").doc(id).get();
  const task = doc.data();

  openModal(`
    <div class="modal-title">✅ Approval Form Kaizen</div>
    <div style="background:#f9f9f9;padding:12px;border-radius:8px;margin-bottom:16px;border-left:4px solid var(--primary)">
      <div class="fw-700">Tugas: ${escHtml(task.title.replace("⚡ KAIZEN: ", ""))}</div>
      <div class="text-xs color-light">Dikerjakan oleh: <b>Muhammad Rizky Nur Fadilah</b></div>
      <div class="text-xs color-light">Catatan GA: <i>"${escHtml(task.aktivitas)}"</i></div>
    </div>

    <div class="form-group">
        <label>Komentar Atasan (Review)</label>
        <textarea class="form-control" id="apKzKomentar" rows="3" placeholder="Berikan alasan jika Pending atau Reject..."></textarea>
    </div>

    <div class="flex gap-8">
        <button class="btn btn-success" style="flex:1; padding:12px" onclick="simpanApprovalKaizen('${id}', 'approved')">APPROVE (SELESAI)</button>
        <button class="btn btn-warning" style="flex:1; padding:12px" onclick="simpanApprovalKaizen('${id}', 'pending')">PENDING (REVISI)</button>
        <button class="btn btn-danger" style="flex:1; padding:12px" onclick="simpanApprovalKaizen('${id}', 'rejected')">REJECT</button>
    </div>
  `);
}

async function simpanApprovalKaizen(id, action) {
  const komentar = document.getElementById("apKzKomentar").value.trim();
  if ((action === "pending" || action === "rejected") && !komentar) {
    return toast("Harap berikan komentar alasan", "warning");
  }

  const docRef = await db.collection("hrd_daily_tasks").doc(id).get();
  const task = docRef.data();

  const updateData = {
    kaizenStatus: action,
    approverComment: komentar,
    updatedAt: new Date().toISOString(),
    kaizenLogs: firebase.firestore.FieldValue.arrayUnion({
      userId: currentUser.id,
      userName: currentUser.nama,
      action: action,
      comment: komentar || "Status diperbarui",
      timestamp: new Date().toISOString(),
    }),
  };

  if (action === "approved") {
    updateData.done = true;
    updateData.doneAt = new Date().toISOString();
    updateData.progress = 100;
  } else {
    updateData.done = false;
    if (action === "pending") updateData.progress = 90;
    else updateData.progress = 0;
  }

  try {
    toast("⏳ Memproses approval...", "info");
    await db.collection("hrd_daily_tasks").doc(id).update(updateData);

    if (action === "approved") {
      try {
        const reportData = {
          type: "report",
          source: "AUTO-KAIZEN-FINAL",
          title: "📝 Daily Report — " + formatDate(todayStr()),
          tanggal: todayStr(),
          kategori: "FACILITY'S",
          jamMasuk: "08:00",
          jamKeluar: new Date().toTimeString().substring(0, 5),
          aktivitas: `[APPROVED KAIZEN] - ${task.title.replace("⚡ KAIZEN: ", "")}\nRespon GA: ${task.aktivitas}\nReview Atasan: ${komentar || "Sesuai"}`,
          hasil: `Pekerjaan Selesai & Disetujui Atasan: ${task.title.replace("⚡ KAIZEN: ", "")}`,
          kendala: "",
          solusi: "",
          rencana: "",
          progress: 100,
          done: true,
          doneAt: new Date().toISOString(),
          userId: task.userId,
          targetUserName: task.targetUserName || "Muhammad Rizky Nur Fadilah",
          departemen: "GENERAL AFFAIR",
          ownerLevel: 1,
          attachments: task.attachments || [],
          createdAt: new Date().toISOString(),
        };
        await db.collection("hrd_daily_tasks").add(reportData);
      } catch (err) {
        console.warn("Integrasi report gagal:", err.message);
      }
    }

    const gaSnap = await db.collection("hrd_users").get();
    let gaId = "";
    gaSnap.forEach((d) => {
      if ((d.data().nama || "").toLowerCase().includes("rizky")) gaId = d.id;
    });
    if (gaId) {
      const actLabel =
        action === "approved"
          ? "DISETUJUI"
          : action === "pending"
            ? "DITANGGUHKAN (REVISI)"
            : "DITOLAK (REJECT)";
      await sendNotification(
        gaId,
        "⚡ STATUS KAIZEN",
        `Tugas "${task.title.replace("⚡ KAIZEN: ", "")}" telah ${actLabel} oleh Irsan. Pesan: ${komentar || "-"}`,
        "kaizen",
      );
    }

    await sendNotification(
      task.assignedBy,
      "⚡ UPDATE KAIZEN",
      `Tugas yang Anda minta "${task.title.replace("⚡ KAIZEN: ", "")}" berstatus: ${action.toUpperCase()}. Pesan Atasan: ${komentar || "-"}`,
      "kaizen",
    );

    toast("Status Kaizen diperbarui: " + action.toUpperCase(), "success");
    closeModalDirect();
    renderFormKaizen();
  } catch (e) {
    toast("Gagal: " + e.message, "error");
  }
}

async function addKaizenGeneralComment(id) {
  const comment = document.getElementById("kzGenComment").value.trim();
  if (!comment) return;

  try {
    await db
      .collection("hrd_daily_tasks")
      .doc(id)
      .update({
        kaizenLogs: firebase.firestore.FieldValue.arrayUnion({
          userId: currentUser.id,
          userName: currentUser.nama,
          action: "comment",
          comment: comment,
          timestamp: new Date().toISOString(),
        }),
      });
    toast("Komentar ditambahkan", "success");

    // Refresh detail view
    const doc = await db.collection("hrd_daily_tasks").doc(id).get();
    _showDailyTaskDetail({ id: doc.id, ...doc.data() });
  } catch (e) {
    toast("Gagal: " + e.message, "error");
  }
}

async function deleteKaizenLog(taskId, timestamp) {
  if (!confirm("Hapus log/komentar ini?")) return;
  try {
    const doc = await db.collection("hrd_daily_tasks").doc(taskId).get();
    if (!doc.exists) return;
    const logs = doc.data().kaizenLogs || [];
    const logToRemove = logs.find((l) => l.timestamp === timestamp);
    if (logToRemove) {
      await db
        .collection("hrd_daily_tasks")
        .doc(taskId)
        .update({
          kaizenLogs: firebase.firestore.FieldValue.arrayRemove(logToRemove),
        });
      toast("Log dihapus", "success");
      // Refresh detail view
      const newDoc = await db.collection("hrd_daily_tasks").doc(taskId).get();
      _showDailyTaskDetail({ id: newDoc.id, ...newDoc.data() });
    }
  } catch (e) {
    toast("Gagal hapus: " + e.message, "error");
  }
}

async function fixKaizenNamingData() {
  if (
    !confirm(
      "Sistem akan mengganti seluruh teks 'Nanda Yoga Maulana' menjadi 'Muhammad Rizky Nur Fadilah' di data Kaizen. Lanjutkan?",
    )
  )
    return;

  toast("⏳ Membersihkan data Kaizen...", "info");
  const snap = await db
    .collection("hrd_daily_tasks")
    .where("source", "==", "FORM KAIZEN")
    .get();

  // Find Muhammad Rizky Nur Fadilah's user ID
  let gaUser = null;
  try {
    const uSnap = await db.collection("hrd_users").get();
    uSnap.forEach((d) => {
      const u = d.data();
      if ((u.nama || "").toLowerCase().includes("rizky"))
        gaUser = { id: d.id, ...u };
    });
  } catch (e) {}

  if (!gaUser) return toast("Data Muhammad Rizky tidak ditemukan", "error");

  const batch = db.batch();
  let count = 0;

  snap.forEach((doc) => {
    const d = doc.data();
    const fields = ["title", "description", "aktivitas", "hasil"];
    let changed = false;
    const updateObj = {};

    fields.forEach((f) => {
      if (
        d[f] &&
        typeof d[f] === "string" &&
        (d[f].toUpperCase().includes("NANDA") ||
          d[f].toUpperCase().includes("YOGA"))
      ) {
        updateObj[f] = d[f]
          .replace(/Nanda Yoga Maulana/gi, gaUser.nama)
          .replace(/Nanda Yoga/gi, gaUser.nama)
          .replace(/Nanda/gi, gaUser.nama);
        changed = true;
      }
    });

    if (
      d.targetUserName &&
      (d.targetUserName.toUpperCase().includes("NANDA") ||
        d.targetUserName.toUpperCase().includes("YOGA"))
    ) {
      updateObj.targetUserName = gaUser.nama;
      updateObj.userId = gaUser.id;
      changed = true;
    }

    if (changed) {
      batch.update(doc.ref, updateObj);
      count++;
    }
  });

  if (count > 0) {
    await batch.commit();
    toast(`✅ Berhasil membersihkan ${count} data!`, "success");
    renderFormKaizen();
  } else {
    toast("Semua data sudah bersih.", "success");
  }
}

function modalCutiBersamaMassal() {
  if (!hasAccess(3)) return toast("Akses ditolak", "warning");
  openModal(`
    <div class="modal-title">⚡ Input Cuti Bersama Massal</div>
    <p class="text-xs mb-16" style="color:#666">
        Gunakan fitur ini untuk menginput Cuti Bersama secara serentak ke <b>SELURUH KARYAWAN AKTIF</b>.<br>
        <b style="color:var(--danger)">⚠️ Penting:</b> Sesuai Pasal 16, Cuti Bersama akan otomatis memotong jatah cuti tahunan (12 hari) setiap karyawan.
    </p>
    <div class="grid-2">
      <div class="form-group"><label>Tanggal Mulai</label><input class="form-control" type="date" id="massCtMulai" value="${todayStr()}"></div>
      <div class="form-group"><label>Tanggal Selesai</label><input class="form-control" type="date" id="massCtSelesai" value="${todayStr()}"></div>
    </div>
    <div class="form-group">
        <label>Keterangan / Nama Libur</label>
        <input class="form-control" id="massCtKet" placeholder="Contoh: Libur Idul Fitri 1447H">
    </div>
    <div style="background:#fff3e0; padding:12px; border-radius:8px; border-left:4px solid var(--warning); margin-bottom:16px">
        <div class="text-sm fw-700 color-warning mb-4">Konfirmasi</div>
        <p class="text-xs" style="line-height:1.4">Sistem akan membuat record cuti <b>Approved</b> untuk seluruh staf aktif. Data yang sudah ada di tanggal yang sama tidak akan dibuat ganda.</p>
    </div>
    <button class="btn btn-info" style="width:100%; padding:12px" onclick="doInputCutiBersamaMassal()">⚡ Proses Input Massal</button>
  `);
}

async function doInputCutiBersamaMassal() {
  const mulai = document.getElementById("massCtMulai").value;
  const selesai = document.getElementById("massCtSelesai").value;
  const keterangan = document.getElementById("massCtKet").value;

  if (!mulai || !selesai || !keterangan)
    return toast("Lengkapi semua data", "warning");

  const durasi = countWorkDays(mulai, selesai);
  if (durasi <= 0)
    return toast("Durasi tidak valid atau hanya hari libur/weekend", "warning");

  if (
    !confirm(
      `Input Cuti Bersama "${keterangan}" (${durasi} hari) untuk SEMUA karyawan aktif?\nIni akan memotong jatah cuti mereka.`,
    )
  )
    return;

  toast("⏳ Sedang memproses data massal...", "info");

  try {
    // 1. Ambil semua karyawan aktif
    const kSnap = await db
      .collection("hrd_karyawan")
      .where("status", "==", "aktif")
      .get();

    // 2. Ambil data cuti yang sudah ada untuk cek duplikasi
    const existSnap = await db
      .collection("hrd_cuti")
      .where("mulai", "==", mulai)
      .where("jenis", "==", "Cuti Bersama")
      .get();
    const existSet = new Set();
    existSnap.forEach((d) => existSet.add(d.data().nama?.toLowerCase().trim()));

    let added = 0;
    const createdAt = new Date().toISOString();

    // Re-do with proper for...of loop for batching safety if large headcount
    const karyawanDocs = kSnap.docs;
    let currentBatch = db.batch();
    let batchCount = 0;
    let totalProcessed = 0;

    for (const doc of karyawanDocs) {
      const k = doc.data();
      const namaLow = (k.nama || "").toLowerCase().trim();
      if (existSet.has(namaLow)) continue;

      const newRef = db.collection("hrd_cuti").doc();
      currentBatch.set(newRef, {
        nama: k.nama,
        jenis: "Cuti Bersama",
        mulai,
        selesai,
        durasi,
        keterangan: keterangan,
        status: "approved",
        approvedBy: currentUser.nama,
        approvedAt: createdAt,
        createdAt,
        isMassive: true,
      });

      batchCount++;
      totalProcessed++;

      if (batchCount >= 400) {
        await currentBatch.commit();
        currentBatch = db.batch();
        batchCount = 0;
      }
    }

    if (batchCount > 0) await currentBatch.commit();

    closeModalDirect();
    toast(
      `✅ Berhasil menginput Cuti Bersama untuk ${totalProcessed} karyawan. Jangan lupa klik "Sinkronisasi" di menu Penggajian.`,
      "success",
    );
    renderCuti();
  } catch (e) {
    console.error(e);
    toast("Error: " + e.message, "error");
  }
}
