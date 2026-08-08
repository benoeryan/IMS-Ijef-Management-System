'use strict';
// ============================================================
// MODULES.JS — HRD & Legal IJEF Corp v15.0
// ============================================================

// == DASHBOARD ================================================-
async function renderDashboard() {
  const main = document.getElementById('mainContent');
  if (!main) return;

  main.innerHTML =
    `<div class="page-title"><span>${renderBackButton()}🏠 Beranda</span></div><div class="stats-grid" id="dashStats">Loading...</div><div class="grid-2" id="dashWidgets"></div>`;

  const [karyawan, cuti, pengumuman, overtime, reimburse, dinas] = await Promise.all([
    db.collection('hrd_karyawan').where('status', '==', 'aktif').get(),
    db.collection('hrd_cuti').where('status', '==', 'pending').get(),
    db.collection('hrd_pengumuman').get(),
    db.collection('hrd_overtime').where('status', '==', 'pending').get(),
    db.collection('hrd_reimbursement').where('status', '==', 'pending').get(),
    db.collection('hrd_dinas_luar').where('status', '==', 'pending').get(),
  ]);

  const isBOD = currentUser.role === 'bod';
  let gradeMapDash = {};
  if (isBOD) {
    karyawan.forEach((d) => {
      const k = d.data();
      gradeMapDash[(k.nama || '').toLowerCase()] = (k.gradeJabatan || k.posisi || '').toLowerCase();
    });
  }
  function isHeadLevel(nama) {
    if (!isBOD) return true;
    const grade = gradeMapDash[(nama || '').toLowerCase()] || '';
    return grade.includes('head');
  }

  let cutiCount = 0, overtimeCount = 0, reimburseCount = 0, dinasCount = 0;
  if (isBOD) {
    cuti.forEach((d) => { if (isHeadLevel(d.data().nama)) cutiCount++; });
    overtime.forEach((d) => { if (isHeadLevel(d.data().nama)) overtimeCount++; });
    reimburse.forEach((d) => { if (isHeadLevel(d.data().nama)) reimburseCount++; });
    dinas.forEach((d) => { if (isHeadLevel(d.data().nama)) dinasCount++; });
  } else {
    cutiCount = cuti.size;
    overtimeCount = overtime.size;
    reimburseCount = reimburse.size;
    dinasCount = dinas.size;
  }

  const totalPending = cutiCount + overtimeCount + reimburseCount + dinasCount;
  const statsEl = document.getElementById('dashStats');
  if (statsEl) {
    statsEl.innerHTML = `
      <div class="stat-card" style="cursor:pointer" onclick="navigateTo('karyawan')"><div class="stat-icon">👥</div><div class="stat-value">${karyawan.size}</div><div class="stat-label">Total Karyawan</div></div>
      <div class="stat-card" style="cursor:pointer" onclick="navigateTo('approval-center')"><div class="stat-icon">📋</div><div class="stat-value">${totalPending}</div><div class="stat-label">Pengajuan Pending</div></div>
      <div class="stat-card" style="cursor:pointer" onclick="navigateTo('pengumuman')"><div class="stat-icon">📢</div><div class="stat-value">${pengumuman.size}</div><div class="stat-label">Pengumuman</div></div>`;
  }

  // --- WIDGETS ---
  let widgetLeft = '';

  // 1. Pengajuan Pending
  widgetLeft += '<div class="card"><div class="card-title mb-8">📋 Pengajuan Menunggu Approval</div>';
  if (!totalPending) {
    widgetLeft += '<p class="text-sm" style="color:#999">Tidak ada pengajuan pending</p>';
  } else {
    widgetLeft += `<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:8px">`;
    if (cutiCount) widgetLeft += `<div style="cursor:pointer;padding:8px 12px;background:#fff3e0;border-radius:8px;font-size:.82rem" onclick="navigateTo('cuti')"><span class="fw-700">${cutiCount}</span> Cuti/Izin</div>`;
    if (overtimeCount) widgetLeft += `<div style="cursor:pointer;padding:8px 12px;background:#e3f2fd;border-radius:8px;font-size:.82rem" onclick="navigateTo('overtime')"><span class="fw-700">${overtimeCount}</span> Overtime</div>`;
    if (reimburseCount) widgetLeft += `<div style="cursor:pointer;padding:8px 12px;background:#e8f5e9;border-radius:8px;font-size:.82rem" onclick="navigateTo('reimbursement')"><span class="fw-700">${reimburseCount}</span> Reimburse</div>`;
    if (dinasCount) widgetLeft += `<div style="cursor:pointer;padding:8px 12px;background:#fce4ec;border-radius:8px;font-size:.82rem" onclick="navigateTo('absensi')"><span class="fw-700">${dinasCount}</span> Dinas Luar</div>`;
    widgetLeft += `</div>`;
  }
  widgetLeft += '</div>';

  // --- RIGHT WIDGETS ---
  let widgetRight = '';

  // 1. User Info Card (Profil Administrator)
  const u = currentUser;
  widgetRight += `
  <div class="card" style="border-left:4px solid var(--primary)">
    <div class="flex gap-16" style="align-items:center">
      <div style="width:50px;height:50px;font-size:1.5rem;background:var(--primary);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center">${u.nama.charAt(0)}</div>
      <div>
        <div class="fw-700" style="font-size:1rem">${escHtml(u.nama)}</div>
        <div class="text-sm" style="color:#999">${escHtml(u.id)} • ${escHtml(u.departemen || '-')}</div>
      </div>
    </div>
  </div>`;

  // 2. Financial Portal Link (GM Only)
  if ((currentUser.nama || "").toLowerCase() === "muhammad agus ryanda") {
    widgetRight += `<div class="card" style="border-left:4px solid #2e7d32">
      <div class="card-title mb-8">💰 Portal Keuangan</div>
      <p class="text-xs color-gray mb-12">Akses cepat ke Sistem Laporan Keuangan IJEF Corp.</p>
      <a href="https://laporankeuanganijef.netlify.app/" target="_blank" class="btn btn-sm" style="background:#2e7d32;color:#fff;width:100%;text-align:center;display:block">📊 Buka Laporan Keuangan</a>
    </div>`;
  }

  // 3. Team Report Widget (HEAD+)
  if (hasHeadLevelAccess()) {
    widgetRight += `
    <div class="card" id="dashTeamReportSection">
      <div class="card-title mb-12" style="display:flex;justify-content:space-between;align-items:center">
        <span>📊 Report Tim Hari Ini</span>
        <div style="display:flex;gap:6px">
          <button class="btn btn-xs btn-outline" onclick="loadPortalTeamReport('dashTeamReportList', '_dashTeamDivFilter')">🔄</button>
          <button class="btn btn-xs btn-primary" onclick="navigateTo('daily-task')">Lihat Semua</button>
        </div>
      </div>
      <div id="dashTeamReportList"><p class="text-sm" style="color:#999">Memuat...</p></div>
    </div>`;
  }

  // 3. Aksi Cepat
  widgetRight += `<div class="card"><div class="card-title mb-12">⚡ Aksi Cepat</div><div style="display:flex;gap:8px;flex-wrap:wrap">`;
  const actions = [
    { label: 'Daily Task', page: 'daily-task', icon: '📝', color: '#1565c0' },
    { label: 'Absensi', page: 'absensi', icon: '📍', color: '#000' },
    { label: 'Cuti', page: 'cuti', icon: '🏖️', color: '#546e7a' },
    { label: 'Overtime', page: 'overtime', icon: '⏰', color: '#f57f17' },
    { label: 'Karyawan', page: 'karyawan', icon: '👥', color: '#2e7d32' },
    { label: 'Approval', page: 'approval-center', icon: '✅', color: '#7cb342' },
    { label: 'FORM KAIZEN', page: 'kaizen', icon: '⚡', color: '#ef6c00' },
    { label: 'Penggajian', page: 'penggajian', icon: '💰', color: '#6a1b9a' },
    { label: 'Reimburse', page: 'reimbursement', icon: '🧾', color: '#00838f' },
    { label: 'Meeting', page: 'meeting', icon: '📅', color: '#0277bd' },
    { label: 'Obrolan', page: 'chat', icon: '💬', color: '#4e342e' },
    { label: 'Broadcast', page: 'broadcast', icon: '📡', color: '#37474f' },
  ];
  actions.forEach((a) => {
    widgetRight += `<button class="btn btn-xs" style="background:${a.color};color:#fff" onclick="navigateTo('${a.page}')">${a.icon} ${a.label}</button>`;
  });
  widgetRight += `</div></div>`;

  // 4. Pengumuman
  widgetRight += '<div class="card"><div class="card-title mb-8">📢 Pengumuman Terbaru</div>';
  if (pengumuman.empty) {
    widgetRight += '<p class="text-sm" style="color:#999">Belum ada</p>';
  } else {
    const items = [];
    pengumuman.forEach((d) => items.push({ id: d.id, ...d.data() }));
    items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    items.slice(0, 5).forEach((p) => {
      widgetRight += `<div style="padding:8px 0;border-bottom:1px solid var(--border);cursor:pointer" onclick="viewPengumuman('${p.id}')"><div class="fw-700 text-sm">${escHtml(p.judul)}</div><div class="text-xs" style="color:#999">${formatDate(p.createdAt)}</div></div>`;
    });
  }
  widgetRight += '</div>';

  if (isBOD) {
    widgetRight += '<div class="card" style="border-left:4px solid #0d47a1"><div class="card-title mb-12" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px"><span>📋 Tugaskan Daily Task</span><div style="display:flex;gap:6px"><button class="btn btn-xs btn-primary" onclick="modalAddTask()">+ Tugaskan Task</button><button class="btn btn-xs btn-outline" onclick="navigateTo(\'daily-task\')">Lihat Semua</button></div></div><div id="dashBodTaskList"><p class="text-sm" style="color:#999">Memuat...</p></div></div>';
  }

  const widgetsEl = document.getElementById('dashWidgets');
  if (widgetsEl) {
    widgetsEl.innerHTML = `<div>${widgetLeft}</div><div>${widgetRight}</div>`;
  }

  if (hasHeadLevelAccess()) {
      if (typeof loadPortalTeamReport === 'function') {
          loadPortalTeamReport('dashTeamReportList', '_dashTeamDivFilter').catch(() => {});
      }
  }

  if (isBOD) {
    loadDashBodTasks();
  }
}

async function loadDashBodTasks() {
  const el = document.getElementById('dashBodTaskList');
  if (!el) return;
  try {
    const snap = await db.collection('hrd_daily_tasks').where('ownerLevel', '==', 2).orderBy('createdAt', 'desc').limit(5).get();
    let h = '';
    if (snap.empty) h = '<p class="text-sm" style="color:#999">Tidak ada tugas aktif</p>';
    else {
      snap.forEach((d) => {
        const p = d.data();
        const badge = p.done ? 'badge-success' : 'badge-warning';
        h += `<div style="padding:10px 0;border-bottom:1px solid #eee"><div class="flex justify-between"><b>${escHtml(p.targetUserName || '-')}</b> <span class="badge ${badge}">${p.done ? 'Selesai' : 'Proses'}</span></div><div class="text-sm">${escHtml(p.title)}</div><div class="text-xs color-gray">${formatDate(p.tanggal)}</div></div>`;
      });
    }
    el.innerHTML = h;
  } catch (e) {
    el.innerHTML = '<p class="text-xs color-danger">Gagal memuat tugas</p>';
  }
}

function modalKaryawan(id) {
  if (id)
    db.collection('hrd_karyawan')
      .doc(id)
      .get()
      .then((d) => showKaryawanForm(id, d.data() || {}));
  else showKaryawanForm(null, {});
}

async function showKaryawanForm(id, p) {
  window._kyFoto = p.foto || null;
  const [depts, posisi, cabang] = await Promise.all([
    db.collection('hrd_departemen').get(),
    db.collection('hrd_posisi').get(),
    db.collection('hrd_cabang').get(),
  ]);
  let dOpts = '<option value="">-- Pilih Departemen --</option>';
  depts.forEach((d) => (dOpts += `<option value="${d.data().nama}" ${p.departemen === d.data().nama ? 'selected' : ''}>${d.data().nama}</option>`));
  let pOpts = '<option value="">-- Pilih Posisi --</option>';
  posisi.forEach((d) => (pOpts += `<option value="${d.data().nama}" ${p.posisi === d.data().nama ? 'selected' : ''}>${d.data().nama}</option>`));
  let cOpts = '<option value="">-- Pilih Cabang --</option>';
  cabang.forEach((d) => (cOpts += `<option value="${d.data().nama}" ${p.cabang === d.data().nama ? 'selected' : ''}>${d.data().nama}</option>`));

  openModal(
    `<div class="modal-title">${id ? 'Edit' : 'Tambah'} Karyawan</div>
    <div style="display:flex;gap:20px;margin-bottom:20px">
      <div id="kyFotoPreview" style="width:100px;height:100px;border-radius:10px;background:#eee;overflow:hidden;cursor:pointer" onclick="document.getElementById('kyFotoFile').click()">${p.foto ? `<img src="${p.foto}" style="width:100%;height:100%;object-fit:cover">` : '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:2.5rem">👤</div>'}</div>
      <div><input type="file" id="kyFotoFile" accept="image/*" style="display:none" onchange="previewKaryawanFoto(this)"><button class="btn btn-sm btn-primary" onclick="document.getElementById('kyFotoFile').click()">📸 Upload Foto</button><p class="text-xs color-gray mt-4">Klik foto atau tombol untuk upload</p></div>
    </div>
    <div class="grid-2">
      <div class="form-group"><label>NIP</label><input class="form-control" id="kyNip" value="${escHtml(p.nip || '')}" placeholder="Contoh: NIP2024001"></div>
      <div class="form-group"><label>Nama Lengkap</label><input class="form-control" id="kyNama" value="${escHtml(p.nama || '')}"></div>
    </div>
    <div class="grid-2">
      <div class="form-group"><label>Departemen</label><select class="form-control" id="kyDept">${dOpts}</select></div>
      <div class="form-group"><label>Posisi</label><select class="form-control" id="kyPos">${pOpts}</select></div>
    </div>
    <div class="grid-2">
      <div class="form-group"><label>Tipe Karyawan</label><select class="form-control" id="kyTipe"><option value="PKWTT" ${p.tipeKaryawan === 'PKWTT' ? 'selected' : ''}>PKWTT (Tetap)</option><option value="PKWT" ${p.tipeKaryawan === 'PKWT' ? 'selected' : ''}>PKWT (Kontrak)</option><option value="PROBATION" ${p.tipeKaryawan === 'PROBATION' ? 'selected' : ''}>PROBATION</option><option value="FREELANCE" ${p.tipeKaryawan === 'FREELANCE' ? 'selected' : ''}>FREELANCE</option></select></div>
      <div class="form-group"><label>Status</label><select class="form-control" id="kyStatus"><option value="aktif" ${p.status === 'aktif' ? 'selected' : ''}>Aktif</option><option value="nonaktif" ${p.status === 'nonaktif' ? 'selected' : ''}>Nonaktif</option></select></div>
    </div>
    <div class="grid-2">
      <div class="form-group"><label>Tanggal Masuk</label><input class="form-control" type="date" id="kyMasuk" value="${p.tanggalMasuk || ''}"></div>
      <div class="form-group"><label>Grade Jabatan</label><input class="form-control" id="kyGrade" value="${escHtml(p.gradeJabatan || '')}" placeholder="Staff, Leader, Manager, dll"></div>
    </div>
    <div class="grid-2">
      <div class="form-group"><label>Email</label><input class="form-control" type="email" id="kyEmail" value="${escHtml(p.email || '')}"></div>
      <div class="form-group"><label>WhatsApp</label><input class="form-control" id="kyWa" value="${escHtml(p.whatsapp || '')}"></div>
    </div>
    <div class="grid-2">
      <div class="form-group"><label>Gaji Pokok</label><input class="form-control" type="number" id="kyGaji" value="${p.gajiPokok || 0}"></div>
      <div class="form-group"><label>Cabang</label><select class="form-control" id="kyCabang">${cOpts}</select></div>
    </div>
    <button class="btn btn-primary" style="width:100%" onclick="simpanKaryawan('${id || ''}')">💾 Simpan Data Karyawan</button>`,
    true
  );
}

function previewKaryawanFoto(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      const size = Math.min(img.width, img.height);
      const sx = (img.width - size) / 2, sy = (img.height - size) / 2;
      ctx.drawImage(img, sx, sy, size, size, 0, 0, 300, 300);
      window._kyFoto = canvas.toDataURL('image/jpeg', 0.8);
      document.getElementById('kyFotoPreview').innerHTML = `<img src="${window._kyFoto}" style="width:100%;height:100%;object-fit:cover">`;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

async function simpanKaryawan(id) {
  const data = {
    nip: document.getElementById('kyNip').value.trim(),
    nama: document.getElementById('kyNama').value.trim(),
    departemen: document.getElementById('kyDept').value,
    posisi: document.getElementById('kyPos').value,
    tipeKaryawan: document.getElementById('kyTipe').value,
    status: document.getElementById('kyStatus').value,
    tanggalMasuk: document.getElementById('kyMasuk').value,
    gradeJabatan: document.getElementById('kyGrade').value.trim(),
    email: document.getElementById('kyEmail').value.trim(),
    whatsapp: document.getElementById('kyWa').value.trim(),
    gajiPokok: Number(document.getElementById('kyGaji').value) || 0,
    cabang: document.getElementById('kyCabang').value,
    updatedAt: new Date().toISOString(),
  };
  if (window._kyFoto) data.foto = window._kyFoto;
  if (!data.nama || !data.nip) return toast('Nama & NIP wajib diisi', 'warning');

  try {
    if (id) await db.collection('hrd_karyawan').doc(id).update(data);
    else await db.collection('hrd_karyawan').add({ ...data, createdAt: new Date().toISOString() });
    closeModalDirect();
    toast('Data karyawan berhasil disimpan', 'success');
    renderKaryawan();
    window._kyFoto = null;
  } catch (e) {
    toast('Gagal menyimpan: ' + e.message, 'error');
  }
}

async function renderDepartemen() {
  const main = document.getElementById('mainContent');
  if (!main) return;
  const isBOD = currentUser.role === 'bod';
  main.innerHTML = `<div class="page-title"><span>${renderBackButton()}🏢 Departemen</span>${!isBOD ? '<button class="btn btn-primary btn-sm" onclick="modalDept()">+ Tambah</button>' : ''}</div><div class="card"><div class="table-wrap"><table><thead><tr><th>Kode</th><th>Nama Departemen</th><th>Manager/Head</th><th>Aksi</th></tr></thead><tbody id="tblDept"></tbody></table></div></div>`;
  const snap = await db.collection('hrd_departemen').get();
  let h = '';
  snap.forEach((d) => {
    const p = d.data();
    h += `<tr><td>${escHtml(p.kode || '-')}</td><td class="fw-700">${escHtml(p.nama)}</td><td>${escHtml(p.manager || '-')}</td><td>${!isBOD ? `<button class="btn btn-xs btn-info" onclick="modalDept('${d.id}')">✏️</button> <button class="btn btn-xs btn-danger" onclick="hapusDoc('hrd_departemen','${d.id}','departemen')">🗑️</button>` : '-'}</td></tr>`;
  });
  document.getElementById('tblDept').innerHTML = h || '<tr><td colspan="4" class="text-center">Belum ada</td></tr>';
}

function modalDept(id) {
  if (id) db.collection('hrd_departemen').doc(id).get().then((d) => showDeptForm(id, d.data()));
  else showDeptForm(null, {});
}
function showDeptForm(id, p) {
  openModal(`<div class="modal-title">${id ? 'Edit' : 'Tambah'} Departemen</div><div class="form-group"><label>Kode</label><input class="form-control" id="dpKode" value="${escHtml(p.kode || '')}"></div><div class="form-group"><label>Nama Departemen</label><input class="form-control" id="dpNama" value="${escHtml(p.nama || '')}"></div><div class="form-group"><label>Manager / Head</label><input class="form-control" id="dpMgr" value="${escHtml(p.manager || '')}"></div><button class="btn btn-primary" onclick="simpanDept('${id || ''}')">Simpan</button>`);
}
async function simpanDept(id) {
  const data = { kode: document.getElementById('dpKode').value, nama: document.getElementById('dpNama').value, manager: document.getElementById('dpMgr').value, updatedAt: new Date().toISOString() };
  if (!data.nama) return toast('Nama wajib', 'warning');
  if (id) await db.collection('hrd_departemen').doc(id).update(data);
  else await db.collection('hrd_departemen').add({ ...data, createdAt: new Date().toISOString() });
  closeModalDirect();
  toast('Disimpan', 'success');
  renderDepartemen();
}

async function renderPosisi() {
  const main = document.getElementById('mainContent');
  if (!main) return;
  const isBOD = currentUser.role === 'bod';
  main.innerHTML = `<div class="page-title"><span>${renderBackButton()}💼 Posisi</span>${!isBOD ? '<div class="flex gap-8"><button class="btn btn-info btn-sm" onclick="syncAllKaryawanGrade()">🔄 Sinkron Grade</button><button class="btn btn-primary btn-sm" onclick="modalPosisi()">+ Tambah</button></div>' : ''}</div><div class="card"><div class="table-wrap"><table><thead><tr><th>Nama Posisi</th><th>Grade</th><th>Gapok Standar</th><th>Aksi</th></tr></thead><tbody id="tblPosisi"></tbody></table></div></div>`;
  const snap = await db.collection('hrd_posisi').get();
  let h = '';
  snap.forEach((d) => {
    const p = d.data();
    h += `<tr><td class="fw-700">${escHtml(p.nama)}</td><td><span class="badge badge-info">${escHtml(p.grade || '-')}</span></td><td>${formatCurrency(p.gapok || 0)}</td><td>${!isBOD ? `<button class="btn btn-xs btn-info" onclick="modalPosisi('${d.id}')">✏️</button> <button class="btn btn-xs btn-danger" onclick="hapusDoc('hrd_posisi','${d.id}','posisi')">🗑️</button>` : '-'}</td></tr>`;
  });
  document.getElementById('tblPosisi').innerHTML = h || '<tr><td colspan="4" class="text-center">Belum ada</td></tr>';
}

function modalPosisi(id) {
  if (id) db.collection('hrd_posisi').doc(id).get().then((d) => showPosisiForm(id, d.data()));
  else showPosisiForm(null, {});
}
function showPosisiForm(id, p) {
  openModal(`<div class="modal-title">${id ? 'Edit' : 'Tambah'} Posisi</div><div class="form-group"><label>Nama Posisi</label><input class="form-control" id="psNama" value="${escHtml(p.nama || '')}"></div><div class="form-group"><label>Grade</label><input class="form-control" id="psGrade" value="${escHtml(p.grade || '')}" placeholder="Contoh: Manager, Staff, Leader"></div><div class="form-group"><label>Gapok Standar</label><input class="form-control" type="number" id="psGapok" value="${p.gapok || 0}"></div><button class="btn btn-primary" onclick="simpanPosisi('${id || ''}')">Simpan</button>`);
}
async function simpanPosisi(id) {
  const data = { nama: document.getElementById('psNama').value, grade: document.getElementById('psGrade').value, gapok: Number(document.getElementById('psGapok').value) || 0, updatedAt: new Date().toISOString() };
  if (!data.nama) return toast('Nama wajib', 'warning');
  if (id) await db.collection('hrd_posisi').doc(id).update(data);
  else await db.collection('hrd_posisi').add({ ...data, createdAt: new Date().toISOString() });
  closeModalDirect();
  toast('Disimpan', 'success');
  renderPosisi();
}

async function renderCabang() {
  const main = document.getElementById('mainContent');
  if (!main) return;
  main.innerHTML = `<div class="page-title"><span>${renderBackButton()}🏛️ Cabang</span><button class="btn btn-primary btn-sm" onclick="modalCabang()">+ Tambah</button></div><div class="card"><div class="table-wrap"><table><thead><tr><th>Nama Cabang</th><th>Alamat</th><th>Aksi</th></tr></thead><tbody id="tblCabang"></tbody></table></div></div>`;
  const snap = await db.collection('hrd_cabang').get();
  let h = '';
  snap.forEach((d) => {
    const p = d.data();
    h += `<tr><td class="fw-700">${escHtml(p.nama)}</td><td>${escHtml(p.alamat || '-')}</td><td><button class="btn btn-xs btn-info" onclick="modalCabang('${d.id}')">✏️</button> <button class="btn btn-xs btn-danger" onclick="hapusDoc('hrd_cabang','${d.id}','cabang')">🗑️</button></td></tr>`;
  });
  document.getElementById('tblCabang').innerHTML = h || '<tr><td colspan="3" class="text-center">Belum ada</td></tr>';
}
function modalCabang(id) {
  if (id) db.collection('hrd_cabang').doc(id).get().then((d) => showCabangForm(id, d.data()));
  else showCabangForm(null, {});
}
function showCabangForm(id, p) {
  openModal(`<div class="modal-title">${id ? 'Edit' : 'Tambah'} Cabang</div><div class="form-group"><label>Nama Cabang</label><input class="form-control" id="cbNama" value="${escHtml(p.nama || '')}"></div><div class="form-group"><label>Alamat</label><textarea class="form-control" id="cbAlamat">${escHtml(p.alamat || '')}</textarea></div><button class="btn btn-primary" onclick="simpanCabang('${id || ''}')">Simpan</button>`);
}
async function simpanCabang(id) {
  const data = { nama: document.getElementById('cbNama').value, alamat: document.getElementById('cbAlamat').value, updatedAt: new Date().toISOString() };
  if (!data.nama) return toast('Nama wajib', 'warning');
  if (id) await db.collection('hrd_cabang').doc(id).update(data);
  else await db.collection('hrd_cabang').add({ ...data, createdAt: new Date().toISOString() });
  closeModalDirect();
  toast('Disimpan', 'success');
  renderCabang();
}

async function renderKaryawan() {
  const main = document.getElementById('mainContent');
  if (!main) return;
  const isBOD = currentUser.role === 'bod';
  main.innerHTML = `<div class="page-title"><span>👥 Data Karyawan</span>${!isBOD ? '<div><button class="btn btn-primary btn-sm" onclick="modalKaryawan()">+ Tambah</button> <button class="btn btn-outline btn-sm" onclick="modalImportKaryawan()">⬇️ Import</button></div>' : ''}</div><div class="card mb-16"><div style="display:flex;gap:12px;flex-wrap:wrap"><div style="flex:1;min-width:200px"><input class="form-control" placeholder="🔍 Cari nama/NIP..." id="searchKary" oninput="filterKaryawan()"></div><select class="form-control" style="width:180px" id="filterDept" onchange="filterKaryawan()"><option value="">Semua Dept</option></select></div></div><div class="card"><div class="table-wrap"><table><thead><tr><th>NIP</th><th>Nama</th><th>Departemen</th><th>Posisi</th><th>Masa Kerja</th><th>Kontrak</th><th>Status</th><th>Aksi</th></tr></thead><tbody id="tblKaryawan"></tbody></table></div></div>`;
  const depts = await db.collection('hrd_departemen').get();
  let dOpts = '<option value="">Semua Dept</option>';
  depts.forEach((d) => (dOpts += `<option value="${d.data().nama}">${d.data().nama}</option>`));
  document.getElementById('filterDept').innerHTML = dOpts;
  loadKaryawanTable();
}

async function loadKaryawanTable() {
  const snap = await db.collection('hrd_karyawan').get();
  window._allKaryawan = [];
  snap.forEach((d) => window._allKaryawan.push({ id: d.id, ...d.data() }));
  filterKaryawan();
}

function filterKaryawan() {
  const q = document.getElementById('searchKary').value.toLowerCase();
  const dept = document.getElementById('filterDept').value;
  const isBOD = currentUser.role === 'bod';
  const filtered = window._allKaryawan.filter((k) => {
    const matchQ = (k.nama || '').toLowerCase().includes(q) || (k.nip || '').toLowerCase().includes(q);
    const matchDept = !dept || k.departemen === dept;
    return matchQ && matchDept;
  });
  filtered.sort((a, b) => (a.nama || '').localeCompare(b.nama || ''));
  let h = '';
  filtered.forEach((k) => {
    const status = k.status === 'aktif' ? '<span class="badge badge-success">aktif</span>' : `<span class="badge badge-danger">Nonaktif (${k.status || 'Resign'})</span>`;
    h += `<tr><td>${escHtml(k.nip || '-')}</td><td class="fw-700">${escHtml(k.nama)}</td><td>${escHtml(k.departemen || '-')}</td><td>${escHtml(k.posisi || '-')}</td><td>${hitungMasaKerja(k.tanggalMasuk)}</td><td>${escHtml(k.tipeKaryawan || '-')}</td><td>${status}</td><td><button class="btn btn-xs btn-info" onclick="viewKaryawan('${k.id}')">👁️</button>${!isBOD ? ` <button class="btn btn-xs btn-danger" onclick="hapusDoc('hrd_karyawan','${k.id}','karyawan')">🗑️</button>` : ''}</td></tr>`;
  });
  document.getElementById('tblKaryawan').innerHTML = h || '<tr><td colspan="8" class="text-center">Tidak ada data</td></tr>';
}

function viewKaryawan(id) {
  const k = window._allKaryawan.find((x) => x.id === id);
  if (!k) return;
  const isBOD = currentUser.role === 'bod';
  let html = `<div class="modal-title">Profil Karyawan</div><div style="display:flex;gap:20px;flex-wrap:wrap;margin-bottom:20px"><div style="width:120px;height:120px;border-radius:12px;overflow:hidden;background:#eee">${k.foto ? `<img src="${k.foto}" style="width:100%;height:100%;object-fit:cover">` : '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:3rem">👤</div>'}</div><div style="flex:1"><h3>${escHtml(k.nama)}</h3><p class="color-gray">${escHtml(k.posisi)} — ${escHtml(k.departemen)}</p><div class="flex gap-8 mt-12"><span class="badge badge-primary">Grade: ${escHtml(k.gradeJabatan || k.grade || '-')}</span><span class="badge badge-info">NIP: ${escHtml(k.nip || '-')}</span></div></div></div><div class="grid-2" style="gap:12px;font-size:.85rem"><div><b>Email:</b> ${escHtml(k.email || '-')}</div><div><b>WhatsApp:</b> ${escHtml(k.whatsapp || '-')}</div><div><b>Tgl Masuk:</b> ${formatDate(k.tanggalMasuk)}</div><div><b>Tgl Lahir:</b> ${formatDate(k.tanggalLahir)}</div><div><b>Kelamin:</b> ${escHtml(k.gender || '-')}</div><div><b>Agama:</b> ${escHtml(k.agama || '-')}</div><div><b>NIK:</b> ${escHtml(k.nik || '-')}</div><div><b>NPWP:</b> ${escHtml(k.npwp || '-')}</div><div><b>BPJS Kes:</b> ${escHtml(k.bpjsKes || '-')}</div><div><b>BPJS TK:</b> ${escHtml(k.bpjsTk || '-')}</div><div><b>Bank:</b> ${escHtml(k.namaBank || '-')} - ${escHtml(k.noRekening || '-')}</div><div><b>Status:</b> ${escHtml(k.status || 'aktif')}</div></div><div class="mt-20 flex gap-8">${!isBOD ? `<button class="btn btn-primary" onclick="modalKaryawan('${k.id}')">✏️ Edit Data</button>` : ''}<button class="btn btn-outline" onclick="closeModalDirect()">Tutup</button></div>`;
  openModal(html, true);
}

async function renderStrukturOrg() {
  const main = document.getElementById('mainContent');
  if (!main) return;
  main.innerHTML = `<div class="page-title"><span>${renderBackButton()}🌳 Struktur Organisasi</span></div><div class="card" id="orgWrap">Memuat...</div>`;
  const snap = await db.collection('hrd_karyawan').get();
  const groups = {};
  snap.forEach((d) => {
    const p = d.data();
    if (!groups[p.departemen || '-']) groups[p.departemen || '-'] = [];
    groups[p.departemen || '-'].push({ id: d.id, ...p });
  });
  const deptNames = Object.keys(groups).sort();
  let h = '';
  deptNames.forEach((dept) => {
    const members = groups[dept].sort((a, b) => (a.nama || '').localeCompare(b.nama || ''));
    h += `<div class="card mb-16"><div class="card-title">🏢 ${escHtml(dept)}</div><div class="table-wrap"><table><thead><tr><th>Nama</th><th>Posisi</th><th>Grade</th><th>Status</th></tr></thead><tbody>`;
    members.forEach((m) => {
      h += `<tr><td class="fw-700">${escHtml(m.nama || '-')}</td><td>${escHtml(m.posisi || '-')}</td><td>${escHtml(m.gradeJabatan || m.grade || '-')}</td><td>${m.status === 'aktif' ? '<span class="badge badge-success">Aktif</span>' : `<span class="badge badge-danger">${escHtml(m.status || 'Nonaktif')}</span>`}</td></tr>`;
    });
    h += '</tbody></table></div></div>';
  });
  document.getElementById('orgWrap').innerHTML = h || '<div class="empty-state"><div class="icon">🌳</div><p>Belum ada data karyawan</p></div>';
}

function buildChecklistText(items) {
  if (!Array.isArray(items) || !items.length) return '-';
  return items.map((x) => `${x.done ? '✅' : '⬜'} ${escHtml(x.task || '-')}`).join('<br>');
}

function parseChecklistText(raw) {
  return (raw || '')
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean)
    .map((task) => ({ task, done: false }));
}

async function renderOnboarding() {
  const main = document.getElementById('mainContent');
  if (!main) return;
  main.innerHTML = `<div class="page-title"><span>${renderBackButton()}🚀 Onboarding</span><button class="btn btn-primary btn-sm" onclick="modalOnboarding()">+ Tambah</button></div><div class="card"><div class="table-wrap"><table><thead><tr><th>Nama</th><th>Tanggal Mulai</th><th>Progress</th><th>Aksi</th></tr></thead><tbody id="tblOnboarding"></tbody></table></div></div>`;
  const snap = await db.collection('hrd_onboarding').orderBy('createdAt', 'desc').get();
  let h = '';
  snap.forEach((d) => {
    const p = d.data();
    const total = Array.isArray(p.checklist) ? p.checklist.length : 0;
    const done = Array.isArray(p.checklist) ? p.checklist.filter((x) => x.done).length : 0;
    h += `<tr><td class="fw-700">${escHtml(p.nama || '-')}</td><td>${formatDate(p.tanggalMulai)}</td><td>${done}/${total}</td><td><button class="btn btn-xs btn-info" onclick="modalOnboarding('${d.id}')">✏️</button> <button class="btn btn-xs btn-danger" onclick="hapusDoc('hrd_onboarding','${d.id}','onboarding')">🗑️</button></td></tr>`;
  });
  document.getElementById('tblOnboarding').innerHTML = h || '<tr><td colspan="4" class="text-center">Belum ada data</td></tr>';
}

function modalOnboarding(id) {
  if (id) db.collection('hrd_onboarding').doc(id).get().then((d) => showOnboardingForm(id, d.data() || {}));
  else showOnboardingForm(null, {});
}

function showOnboardingForm(id, p) {
  const checklist = Array.isArray(p.checklist) && p.checklist.length ? p.checklist.map((x) => x.task).join('\n') : 'Orientasi perusahaan\nSetup akun kerja\nPengenalan tim\nReview SOP';
  openModal(
    `<div class="modal-title">${id ? 'Edit' : 'Tambah'} Onboarding</div>
    <div class="form-group"><label>Nama</label><input class="form-control" id="obNama" value="${escHtml(p.nama || '')}"></div>
    <div class="form-group"><label>Tanggal Mulai</label><input class="form-control" type="date" id="obTanggal" value="${p.tanggalMulai || todayStr()}"></div>
    <div class="form-group"><label>Checklist (1 baris = 1 item)</label><textarea class="form-control" id="obChecklist" rows="6">${escHtml(checklist)}</textarea></div>
    <button class="btn btn-primary" style="width:100%" onclick="simpanOnboarding('${id || ''}')">💾 Simpan</button>`
  );
}

async function simpanOnboarding(id) {
  const data = {
    nama: document.getElementById('obNama').value.trim(),
    tanggalMulai: document.getElementById('obTanggal').value,
    checklist: parseChecklistText(document.getElementById('obChecklist').value),
    updatedAt: new Date().toISOString(),
  };
  if (!data.nama) return toast('Nama wajib diisi', 'warning');
  if (id) {
    const old = (await db.collection('hrd_onboarding').doc(id).get()).data() || {};
    const oldMap = {};
    (old.checklist || []).forEach((x) => (oldMap[(x.task || '').trim().toLowerCase()] = !!x.done));
    data.checklist = data.checklist.map((x) => ({ ...x, done: oldMap[(x.task || '').trim().toLowerCase()] || false }));
    await db.collection('hrd_onboarding').doc(id).update(data);
  } else {
    await db.collection('hrd_onboarding').add({ ...data, createdAt: new Date().toISOString() });
  }
  closeModalDirect();
  toast('Onboarding disimpan', 'success');
  renderOnboarding();
}

async function renderOffboarding() {
  const main = document.getElementById('mainContent');
  if (!main) return;
  main.innerHTML = `<div class="page-title"><span>${renderBackButton()}📦 Offboarding</span><button class="btn btn-primary btn-sm" onclick="modalOffboarding()">+ Tambah</button></div><div class="card"><div class="table-wrap"><table><thead><tr><th>Nama</th><th>Tanggal Keluar</th><th>Checklist</th><th>Alasan</th><th>Aksi</th></tr></thead><tbody id="tblOffboarding"></tbody></table></div></div>`;
  const snap = await db.collection('hrd_offboarding').orderBy('createdAt', 'desc').get();
  let h = '';
  snap.forEach((d) => {
    const p = d.data();
    const total = Array.isArray(p.checklist) ? p.checklist.length : 0;
    const done = Array.isArray(p.checklist) ? p.checklist.filter((x) => x.done).length : 0;
    h += `<tr><td class="fw-700">${escHtml(p.nama || '-')}</td><td>${formatDate(p.tanggalKeluar)}</td><td>${done}/${total}</td><td>${escHtml(p.alasan || '-')}</td><td><button class="btn btn-xs btn-info" onclick="modalOffboarding('${d.id}')">✏️</button> <button class="btn btn-xs btn-danger" onclick="hapusDoc('hrd_offboarding','${d.id}','offboarding')">🗑️</button></td></tr>`;
  });
  document.getElementById('tblOffboarding').innerHTML = h || '<tr><td colspan="5" class="text-center">Belum ada data</td></tr>';
}

function modalOffboarding(id) {
  if (id) db.collection('hrd_offboarding').doc(id).get().then((d) => showOffboardingForm(id, d.data() || {}));
  else showOffboardingForm(null, {});
}

function showOffboardingForm(id, p) {
  const defaultChecklist = ['Serah terima tugas', 'Pengembalian aset', 'Deaktivasi akun', 'Exit interview', 'Surat referensi'];
  const checklist = Array.isArray(p.checklist) && p.checklist.length ? p.checklist.map((x) => x.task).join('\n') : defaultChecklist.join('\n');
  openModal(
    `<div class="modal-title">${id ? 'Edit' : 'Tambah'} Offboarding</div>
    <div class="form-group"><label>Nama</label><input class="form-control" id="ofNama" value="${escHtml(p.nama || '')}"></div>
    <div class="grid-2">
      <div class="form-group"><label>Tanggal Keluar</label><input class="form-control" type="date" id="ofTanggal" value="${p.tanggalKeluar || todayStr()}"></div>
      <div class="form-group"><label>Alasan</label><input class="form-control" id="ofAlasan" value="${escHtml(p.alasan || '')}"></div>
    </div>
    <div class="form-group"><label>Checklist (1 baris = 1 item)</label><textarea class="form-control" id="ofChecklist" rows="6">${escHtml(checklist)}</textarea></div>
    <button class="btn btn-primary" style="width:100%" onclick="simpanOffboarding('${id || ''}')">💾 Simpan</button>`
  );
}

async function simpanOffboarding(id) {
  const data = {
    nama: document.getElementById('ofNama').value.trim(),
    tanggalKeluar: document.getElementById('ofTanggal').value,
    alasan: document.getElementById('ofAlasan').value.trim(),
    checklist: parseChecklistText(document.getElementById('ofChecklist').value),
    updatedAt: new Date().toISOString(),
  };
  if (!data.nama) return toast('Nama wajib diisi', 'warning');
  if (id) {
    const old = (await db.collection('hrd_offboarding').doc(id).get()).data() || {};
    const oldMap = {};
    (old.checklist || []).forEach((x) => (oldMap[(x.task || '').trim().toLowerCase()] = !!x.done));
    data.checklist = data.checklist.map((x) => ({ ...x, done: oldMap[(x.task || '').trim().toLowerCase()] || false }));
    await db.collection('hrd_offboarding').doc(id).update(data);
  } else {
    await db.collection('hrd_offboarding').add({ ...data, createdAt: new Date().toISOString() });
  }
  closeModalDirect();
  toast('Offboarding disimpan', 'success');
  renderOffboarding();
}

async function renderJobdeskMgmt() {
  const main = document.getElementById('mainContent');
  if (!main) return;
  main.innerHTML = `<div class="page-title"><span>${renderBackButton()}📋 Kelola Jobdesk</span><button class="btn btn-primary btn-sm" onclick="modalJobdesk()">+ Tambah</button></div><div class="card"><div class="table-wrap"><table><thead><tr><th>Nama</th><th>Posisi</th><th>Departemen</th><th>Detail</th><th>Aksi</th></tr></thead><tbody id="tblJobdesk"></tbody></table></div></div>`;
  const snap = await db.collection('hrd_jobdesk').orderBy('updatedAt', 'desc').get();
  let h = '';
  snap.forEach((d) => {
    const p = d.data();
    h += `<tr><td class="fw-700">${escHtml(p.nama || '-')}</td><td>${escHtml(p.posisi || '-')}</td><td>${escHtml(p.departemen || '-')}</td><td>${escHtml((p.rincian || p.jobdesk || '').toString().slice(0, 90) || '-')}</td><td><button class="btn btn-xs btn-info" onclick="modalJobdesk('${d.id}')">✏️</button> <button class="btn btn-xs btn-danger" onclick="hapusDoc('hrd_jobdesk','${d.id}','jobdesk')">🗑️</button></td></tr>`;
  });
  document.getElementById('tblJobdesk').innerHTML = h || '<tr><td colspan="5" class="text-center">Belum ada data</td></tr>';
}

function modalJobdesk(id) {
  if (id) db.collection('hrd_jobdesk').doc(id).get().then((d) => showJobdeskForm(id, d.data() || {}));
  else showJobdeskForm(null, {});
}

function showJobdeskForm(id, p) {
  openModal(
    `<div class="modal-title">${id ? 'Edit' : 'Tambah'} Jobdesk</div>
    <div class="grid-2">
      <div class="form-group"><label>Nama Karyawan</label><input class="form-control" id="jdNama" value="${escHtml(p.nama || '')}"></div>
      <div class="form-group"><label>User ID</label><input class="form-control" id="jdUserId" value="${escHtml(p.userId || '')}" placeholder="opsional"></div>
    </div>
    <div class="grid-2">
      <div class="form-group"><label>Posisi</label><input class="form-control" id="jdPosisi" value="${escHtml(p.posisi || '')}"></div>
      <div class="form-group"><label>Departemen</label><input class="form-control" id="jdDepartemen" value="${escHtml(p.departemen || '')}"></div>
    </div>
    <div class="form-group"><label>Rincian Jobdesk</label><textarea class="form-control" id="jdRincian" rows="6">${escHtml(p.rincian || p.jobdesk || '')}</textarea></div>
    <button class="btn btn-primary" style="width:100%" onclick="simpanJobdesk('${id || ''}')">💾 Simpan</button>`
  );
}

async function simpanJobdesk(id) {
  const data = {
    nama: document.getElementById('jdNama').value.trim(),
    userId: document.getElementById('jdUserId').value.trim(),
    posisi: document.getElementById('jdPosisi').value.trim(),
    departemen: document.getElementById('jdDepartemen').value.trim(),
    rincian: document.getElementById('jdRincian').value.trim(),
    updatedAt: new Date().toISOString(),
  };
  if (!data.nama) return toast('Nama wajib diisi', 'warning');
  if (id) await db.collection('hrd_jobdesk').doc(id).update(data);
  else await db.collection('hrd_jobdesk').add({ ...data, createdAt: new Date().toISOString() });
  closeModalDirect();
  toast('Jobdesk disimpan', 'success');
  renderJobdeskMgmt();
}

async function renderLowongan() {
  const main = document.getElementById('mainContent');
  if (!main) return;
  main.innerHTML = `<div class="page-title"><span>${renderBackButton()}📝 Lowongan</span><button class="btn btn-primary btn-sm" onclick="modalLowongan()">+ Tambah</button></div><div class="card"><div class="table-wrap"><table><thead><tr><th>Posisi</th><th>Departemen</th><th>Status</th><th>Aksi</th></tr></thead><tbody id="tblLowongan"></tbody></table></div></div>`;
  const snap = await db.collection('hrd_lowongan').orderBy('createdAt', 'desc').get();
  let h = '';
  snap.forEach((d) => {
    const p = d.data();
    h += `<tr><td class="fw-700">${escHtml(p.posisi || '-')}</td><td>${escHtml(p.departemen || '-')}</td><td><span class="badge ${p.status === 'open' ? 'badge-success' : 'badge-secondary'}">${escHtml(p.status || 'open')}</span></td><td><button class="btn btn-xs btn-info" onclick="modalLowongan('${d.id}')">✏️</button> <button class="btn btn-xs btn-danger" onclick="hapusDoc('hrd_lowongan','${d.id}','lowongan')">🗑️</button></td></tr>`;
  });
  document.getElementById('tblLowongan').innerHTML = h || '<tr><td colspan="4" class="text-center">Belum ada lowongan</td></tr>';
}

function modalLowongan(id) {
  if (id) db.collection('hrd_lowongan').doc(id).get().then((d) => showLowonganForm(id, d.data() || {}));
  else showLowonganForm(null, {});
}

function showLowonganForm(id, p) {
  openModal(
    `<div class="modal-title">${id ? 'Edit' : 'Tambah'} Lowongan</div>
    <div class="grid-2">
      <div class="form-group"><label>Posisi</label><input class="form-control" id="lwPosisi" value="${escHtml(p.posisi || '')}"></div>
      <div class="form-group"><label>Departemen</label><input class="form-control" id="lwDept" value="${escHtml(p.departemen || '')}"></div>
    </div>
    <div class="form-group"><label>Deskripsi</label><textarea class="form-control" id="lwDesc" rows="5">${escHtml(p.deskripsi || '')}</textarea></div>
    <div class="form-group"><label>Status</label><select class="form-control" id="lwStatus"><option value="open" ${p.status === 'open' ? 'selected' : ''}>Open</option><option value="closed" ${p.status === 'closed' ? 'selected' : ''}>Closed</option></select></div>
    <button class="btn btn-primary" style="width:100%" onclick="simpanLowongan('${id || ''}')">💾 Simpan</button>`
  );
}

async function simpanLowongan(id) {
  const data = {
    posisi: document.getElementById('lwPosisi').value.trim(),
    departemen: document.getElementById('lwDept').value.trim(),
    deskripsi: document.getElementById('lwDesc').value.trim(),
    status: document.getElementById('lwStatus').value,
    updatedAt: new Date().toISOString(),
  };
  if (!data.posisi) return toast('Posisi wajib diisi', 'warning');
  if (id) await db.collection('hrd_lowongan').doc(id).update(data);
  else await db.collection('hrd_lowongan').add({ ...data, createdAt: new Date().toISOString() });
  closeModalDirect();
  toast('Lowongan disimpan', 'success');
  renderLowongan();
}

async function renderPipeline() {
  const main = document.getElementById('mainContent');
  if (!main) return;
  const stages = ['applied', 'disc', 'interview', 'offering', 'hired'];
  main.innerHTML = `<div class="page-title"><span>${renderBackButton()}🔄 Pipeline Kandidat</span></div><div id="pipelineWrap" style="display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))"></div>`;
  const snap = await db.collection('hrd_kandidat').get();
  const data = {};
  stages.forEach((s) => (data[s] = []));
  snap.forEach((d) => {
    const p = { id: d.id, ...d.data() };
    const st = stages.includes(p.stage) ? p.stage : 'applied';
    data[st].push(p);
  });
  let h = '';
  stages.forEach((st) => {
    h += `<div class="card"><div class="card-title">${st.toUpperCase()} (${data[st].length})</div>`;
    if (!data[st].length) h += '<p class="text-sm color-gray">Kosong</p>';
    data[st].forEach((p) => {
      h += `<div style="padding:10px;border:1px solid var(--border);border-radius:8px;margin-bottom:8px"><div class="fw-700">${escHtml(p.nama || '-')}</div><div class="text-xs color-gray mb-8">${escHtml(p.posisi || '-')}</div><select class="form-control" onchange="updateKandidatStage('${p.id}', this.value)">${stages.map((s) => `<option value="${s}" ${s === st ? 'selected' : ''}>${s.toUpperCase()}</option>`).join('')}</select></div>`;
    });
    h += '</div>';
  });
  document.getElementById('pipelineWrap').innerHTML = h;
}

async function updateKandidatStage(id, stage) {
  await db.collection('hrd_kandidat').doc(id).update({ stage, updatedAt: new Date().toISOString() });
  toast('Stage diperbarui', 'success');
  renderPipeline();
}

async function renderKandidat() {
  const main = document.getElementById('mainContent');
  if (!main) return;
  main.innerHTML = `<div class="page-title"><span>${renderBackButton()}🧑‍💼 Kandidat</span><button class="btn btn-primary btn-sm" onclick="modalKandidat()">+ Tambah</button></div><div class="card"><div class="table-wrap"><table><thead><tr><th>Nama</th><th>Posisi</th><th>Kontak</th><th>Stage</th><th>Aksi</th></tr></thead><tbody id="tblKandidat"></tbody></table></div></div>`;
  const snap = await db.collection('hrd_kandidat').orderBy('createdAt', 'desc').get();
  let h = '';
  snap.forEach((d) => {
    const p = d.data();
    h += `<tr><td class="fw-700">${escHtml(p.nama || '-')}</td><td>${escHtml(p.posisi || '-')}</td><td>${escHtml(p.kontak || p.email || '-')}</td><td>${escHtml((p.stage || 'applied').toUpperCase())}</td><td><button class="btn btn-xs btn-info" onclick="modalKandidat('${d.id}')">✏️</button> <button class="btn btn-xs btn-danger" onclick="hapusDoc('hrd_kandidat','${d.id}','kandidat')">🗑️</button></td></tr>`;
  });
  document.getElementById('tblKandidat').innerHTML = h || '<tr><td colspan="5" class="text-center">Belum ada kandidat</td></tr>';
}

function modalKandidat(id) {
  if (id) db.collection('hrd_kandidat').doc(id).get().then((d) => showKandidatForm(id, d.data() || {}));
  else showKandidatForm(null, {});
}

function showKandidatForm(id, p) {
  openModal(
    `<div class="modal-title">${id ? 'Edit' : 'Tambah'} Kandidat</div>
    <div class="form-group"><label>Nama</label><input class="form-control" id="kdNama" value="${escHtml(p.nama || '')}"></div>
    <div class="grid-2">
      <div class="form-group"><label>Posisi</label><input class="form-control" id="kdPosisi" value="${escHtml(p.posisi || '')}"></div>
      <div class="form-group"><label>Kontak/Email</label><input class="form-control" id="kdKontak" value="${escHtml(p.kontak || p.email || '')}"></div>
    </div>
    <div class="form-group"><label>Stage</label><select class="form-control" id="kdStage"><option value="applied" ${p.stage === 'applied' ? 'selected' : ''}>Applied</option><option value="disc" ${p.stage === 'disc' ? 'selected' : ''}>DISC</option><option value="interview" ${p.stage === 'interview' ? 'selected' : ''}>Interview</option><option value="offering" ${p.stage === 'offering' ? 'selected' : ''}>Offering</option><option value="hired" ${p.stage === 'hired' ? 'selected' : ''}>Hired</option></select></div>
    <button class="btn btn-primary" style="width:100%" onclick="simpanKandidat('${id || ''}')">💾 Simpan</button>`
  );
}

async function simpanKandidat(id) {
  const data = {
    nama: document.getElementById('kdNama').value.trim(),
    posisi: document.getElementById('kdPosisi').value.trim(),
    kontak: document.getElementById('kdKontak').value.trim(),
    stage: document.getElementById('kdStage').value,
    updatedAt: new Date().toISOString(),
  };
  if (!data.nama) return toast('Nama wajib diisi', 'warning');
  if (id) await db.collection('hrd_kandidat').doc(id).update(data);
  else await db.collection('hrd_kandidat').add({ ...data, createdAt: new Date().toISOString() });
  closeModalDirect();
  toast('Kandidat disimpan', 'success');
  renderKandidat();
}

window.renderStrukturOrg = renderStrukturOrg;
window.renderJobdeskMgmt = renderJobdeskMgmt;
window.renderOnboarding = renderOnboarding;
window.renderOffboarding = renderOffboarding;
window.renderLowongan = renderLowongan;
window.renderPipeline = renderPipeline;
window.renderKandidat = renderKandidat;
window.modalOnboarding = modalOnboarding;
window.simpanOnboarding = simpanOnboarding;
window.modalOffboarding = modalOffboarding;
window.simpanOffboarding = simpanOffboarding;
window.modalJobdesk = modalJobdesk;
window.simpanJobdesk = simpanJobdesk;
window.modalLowongan = modalLowongan;
window.simpanLowongan = simpanLowongan;
window.modalKandidat = modalKandidat;
window.simpanKandidat = simpanKandidat;
window.updateKandidatStage = updateKandidatStage;
