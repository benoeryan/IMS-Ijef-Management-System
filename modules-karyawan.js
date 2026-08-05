'use strict';
// ============================================================
// MODULES.JS — HRD & Legal IJEF Corp v13.0
// ============================================================

// ── DASHBOARD ─────────────────────────────────────────────────
async function renderDashboard() {
  const main = document.getElementById('mainContent');
  if (!main) return;

  main.innerHTML =
    `<div class="page-title"><span>${renderBackButton()}🏠 Beranda</span></div><div class="stats-grid" id="dashStats">Loading...</div><div class="grid-2" id="dashWidgets"></div>`;

  const [karyawan, cuti, absen, pengumuman, overtime, reimburse, dinas] = await Promise.all([
    db.collection('hrd_karyawan').where('status', '==', 'aktif').get(),
    db.collection('hrd_cuti').where('status', '==', 'pending').get(),
    db.collection('hrd_absensi').where('tanggal', '==', todayStr()).get(),
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
      <div class="stat-card" style="cursor:pointer" onclick="navigateTo('absensi')"><div class="stat-icon">📍</div><div class="stat-value">${absen.size}</div><div class="stat-label">Hadir Hari Ini</div></div>
      <div class="stat-card" style="cursor:pointer" onclick="navigateTo('approval-center')"><div class="stat-icon">📋</div><div class="stat-value">${totalPending}</div><div class="stat-label">Pengajuan Pending</div></div>
      <div class="stat-card" style="cursor:pointer" onclick="navigateTo('pengumuman')"><div class="stat-icon">📢</div><div class="stat-value">${pengumuman.size}</div><div class="stat-label">Pengumuman</div></div>`;
  }

  let widgetLeft = '<div class="card"><div class="card-title mb-8">📋 Pengajuan Menunggu Approval</div>';
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

  widgetLeft += '<div class="card"><div class="card-title mb-8">📢 Pengumuman Terbaru</div>';
  if (pengumuman.empty) {
    widgetLeft += '<p class="text-sm" style="color:#999">Belum ada</p>';
  } else {
    const items = [];
    pengumuman.forEach((d) => items.push({ id: d.id, ...d.data() }));
    items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    items.slice(0, 5).forEach((p) => {
      widgetLeft += `<div style="padding:8px 0;border-bottom:1px solid var(--border);cursor:pointer" onclick="viewPengumuman('${p.id}')"><div class="fw-700 text-sm">${escHtml(p.judul)}</div><div class="text-xs" style="color:#999">${formatDate(p.createdAt)}</div></div>`;
    });
  }
  widgetLeft += '</div>';

  if (isBOD) {
    widgetLeft += '<div class="card" style="border-left:4px solid #0d47a1"><div class="card-title mb-12" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px"><span>📋 Tugaskan Daily Task</span><div style="display:flex;gap:6px"><button class="btn btn-xs btn-primary" onclick="modalAddTask()">+ Tugaskan Task</button><button class="btn btn-xs btn-outline" onclick="navigateTo(\'daily-task\')">Lihat Semua</button></div></div><div id="dashBodTaskList"><p class="text-sm" style="color:#999">Memuat...</p></div></div>';
  }

  let widgetRight = `<div class="card"><div class="card-title mb-12">⚡ Aksi Cepat</div><div style="display:flex;gap:8px;flex-wrap:wrap">`;
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

  const widgetsEl = document.getElementById('dashWidgets');
  if (widgetsEl) {
    widgetsEl.innerHTML = widgetLeft + widgetRight;
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
