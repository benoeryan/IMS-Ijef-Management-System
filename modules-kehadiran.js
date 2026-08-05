'use strict';
// ============================================================
// MODULES-KEHADIRAN.JS — HRD & Legal IJEF Corp v13.1
// ============================================================

// ── HARI LIBUR ────────────────────────────────────────────────
const HARI_LIBUR_NASIONAL_2025 = [
  { tanggal: '2025-01-01', nama: 'Tahun Baru Masehi', tipe: 'nasional' },
  { tanggal: '2025-01-27', nama: "Isra Mi'raj Nabi Muhammad SAW", tipe: 'nasional' },
  { tanggal: '2025-01-29', nama: 'Tahun Baru Imlek 2576 Kongzili', tipe: 'nasional' },
  { tanggal: '2025-03-29', nama: 'Hari Raya Nyepi Tahun Baru Saka 1947', tipe: 'nasional' },
  { tanggal: '2025-03-30', nama: 'Hari Raya Idul Fitri 1446 H (Hari 1)', tipe: 'nasional' },
  { tanggal: '2025-03-31', nama: 'Hari Raya Idul Fitri 1446 H (Hari 2)', tipe: 'nasional' },
  { tanggal: '2025-03-28', nama: 'Cuti Bersama Idul Fitri', tipe: 'cuti_bersama' },
  { tanggal: '2025-04-01', nama: 'Cuti Bersama Idul Fitri', tipe: 'cuti_bersama' },
  { tanggal: '2025-04-02', nama: 'Cuti Bersama Idul Fitri', tipe: 'cuti_bersama' },
  { tanggal: '2025-04-03', nama: 'Cuti Bersama Idul Fitri', tipe: 'cuti_bersama' },
  { tanggal: '2025-04-04', nama: 'Cuti Bersama Idul Fitri', tipe: 'cuti_bersama' },
  { tanggal: '2025-04-18', nama: 'Wafat Isa Al Masih', tipe: 'nasional' },
  { tanggal: '2025-05-01', nama: 'Hari Buruh Internasional', tipe: 'nasional' },
  { tanggal: '2025-05-12', nama: 'Hari Raya Waisak 2569 BE', tipe: 'nasional' },
  { tanggal: '2025-05-29', nama: 'Kenaikan Isa Al Masih', tipe: 'nasional' },
  { tanggal: '2025-06-01', nama: 'Hari Lahir Pancasila', tipe: 'nasional' },
  { tanggal: '2025-06-06', nama: 'Hari Raya Idul Adha 1446 H', tipe: 'nasional' },
  { tanggal: '2025-06-27', nama: 'Tahun Baru Islam 1447 H', tipe: 'nasional' },
  { tanggal: '2025-08-17', nama: 'Hari Kemerdekaan RI', tipe: 'nasional' },
  { tanggal: '2025-09-05', nama: 'Maulid Nabi Muhammad SAW', tipe: 'nasional' },
  { tanggal: '2025-12-25', nama: 'Hari Natal', tipe: 'nasional' },
  { tanggal: '2025-12-26', nama: 'Cuti Bersama Natal', tipe: 'cuti_bersama' },
];

const HARI_LIBUR_NASIONAL_2026 = [
  { tanggal: '2026-01-01', nama: 'Tahun Baru Masehi', tipe: 'nasional' },
  { tanggal: '2026-01-16', nama: "Isra Mi'raj Nabi Muhammad SAW", tipe: 'nasional' },
  { tanggal: '2026-02-17', nama: 'Tahun Baru Imlek 2577 Kongzili', tipe: 'nasional' },
  { tanggal: '2026-03-19', nama: 'Hari Raya Nyepi Tahun Baru Saka 1948', tipe: 'nasional' },
  { tanggal: '2026-03-20', nama: 'Hari Raya Idul Fitri 1447 H (Hari 1)', tipe: 'nasional' },
  { tanggal: '2026-03-21', nama: 'Hari Raya Idul Fitri 1447 H (Hari 2)', tipe: 'nasional' },
  { tanggal: '2026-03-18', nama: 'Cuti Bersama Idul Fitri', tipe: 'cuti_bersama' },
  { tanggal: '2026-03-22', nama: 'Cuti Bersama Idul Fitri', tipe: 'cuti_bersama' },
  { tanggal: '2026-03-23', nama: 'Cuti Bersama Idul Fitri', tipe: 'cuti_bersama' },
  { tanggal: '2026-04-03', nama: 'Wafat Isa Al Masih', tipe: 'nasional' },
  { tanggal: '2026-05-01', nama: 'Hari Buruh Internasional', tipe: 'nasional' },
  { tanggal: '2026-05-14', nama: 'Kenaikan Isa Al Masih', tipe: 'nasional' },
  { tanggal: '2026-05-27', nama: 'Hari Raya Idul Adha 1447 H', tipe: 'nasional' },
  { tanggal: '2026-05-28', nama: 'Cuti Bersama Idul Adha', tipe: 'cuti_bersama' },
  { tanggal: '2026-05-29', nama: 'Cuti Bersama Idul Adha', tipe: 'cuti_bersama' },
  { tanggal: '2026-05-31', nama: 'Hari Raya Waisak 2570 BE', tipe: 'nasional' },
  { tanggal: '2026-06-01', nama: 'Hari Lahir Pancasila', tipe: 'nasional' },
  { tanggal: '2026-06-16', nama: 'Tahun Baru Islam 1448 H', tipe: 'nasional' },
  { tanggal: '2026-08-17', nama: 'Hari Kemerdekaan RI', tipe: 'nasional' },
  { tanggal: '2026-08-26', nama: 'Maulid Nabi Muhammad SAW', tipe: 'nasional' },
  { tanggal: '2026-12-24', nama: 'Cuti Bersama Natal', tipe: 'cuti_bersama' },
  { tanggal: '2026-12-25', nama: 'Hari Natal', tipe: 'nasional' },
  { tanggal: '2026-12-31', nama: 'Cuti Bersama Tahun Baru', tipe: 'cuti_bersama' },
];

let hariLiburCalendarMonth = null;
let hariLiburViewMode = 'myCalendar'; // 'myCalendar' or 'daftar'

async function renderHariLibur() {
  if (!hariLiburCalendarMonth) {
    const now = new Date();
    hariLiburCalendarMonth = { year: now.getFullYear(), month: now.getMonth() };
  }
  const main = document.getElementById('mainContent');
  main.innerHTML = `<div class="page-title"><span>${renderBackButton()}📅 Hari Libur</span></div>
  <div class="tabs mb-16" id="hariLiburTabs">
    <div class="tab ${hariLiburViewMode === 'myCalendar' ? 'active' : ''}" onclick="switchHariLiburView('myCalendar')">📅 Kalender</div>
    <div class="tab ${hariLiburViewMode === 'daftar' ? 'active' : ''}" onclick="switchHariLiburView('daftar')">📜 Daftar Libur</div>
  </div>
  <div id="hariLiburContent"></div>`;

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
  const container = document.getElementById('hariLiburContent');

  window._hariLiburUserReminders = [];
  window._hariLiburUserNotes = [];

  if (hariLiburViewMode === 'myCalendar') {
    renderMyCalendarView(container);
  } else {
    const monthNames = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];
    const startDate = `${y}-${String(m + 1).padStart(2, '0')}-01`;
    const endDate = `${y}-${String(m + 1).padStart(2, '0')}-${String(new Date(y, m + 1, 0).getDate()).padStart(2, '0')}`;
    let holidays = [];
    try {
      const snap = await db.collection('hrd_hari_libur').get();
      snap.forEach((d) => {
        const data = d.data();
        if (data.tanggal >= startDate && data.tanggal <= endDate)
          holidays.push({ id: d.id, ...data });
      });
    } catch (e) {
      console.warn('Failed to load holidays:', e);
    }
    let navHtml = `<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:16px">
      <div style="display:flex;align-items:center;gap:8px">
        <button class="btn btn-sm btn-outline" onclick="hariLiburPrevMonth()">&lt;</button>
        <span class="fw-700 color-primary" style="min-width:140px;text-align:center">${monthNames[m]} ${y}</span>
        <button class="btn btn-sm btn-outline" onclick="hariLiburNextMonth()">&gt;</button>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${hasAccess(6) ? '<button class="btn btn-info btn-sm" onclick="syncHariLiburNasional()">🔄 Sinkron Nasional</button>' : ''}
        ${hasAccess(6) ? '<button class="btn btn-primary btn-sm" onclick="modalHariLibur()">+ Tambah Custom</button>' : ''}
      </div>
    </div>`;

    const listDiv = document.createElement('div');
    listDiv.className = 'card';
    container.innerHTML = navHtml;
    container.appendChild(listDiv);
    renderHariLiburList(listDiv, y, m, holidays);
  }
}

function renderHariLiburList(container, year, month, holidays) {
  let html =
    '<div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Keterangan</th><th>Tipe</th><th>Aksi</th></tr></thead><tbody>';
  if (!holidays.length) {
    html += '<tr><td colspan="4" class="text-center">Tidak ada hari libur bulan ini</td></tr>';
  } else {
    holidays.sort((a, b) => a.tanggal.localeCompare(b.tanggal));
    holidays.forEach((h) => {
      const t =
        h.tipe === 'nasional'
          ? '<span class="badge badge-danger">Nasional</span>'
          : h.tipe === 'cuti_bersama'
            ? '<span class="badge badge-warning">Cuti Bersama</span>'
            : '<span class="badge badge-info">Custom</span>';
      html += `<tr>
        <td class="fw-700">${formatDate(h.tanggal)}</td>
        <td>${escHtml(h.nama)}</td>
        <td>${t}</td>
        <td>${hasAccess(6) ? '<button class="btn btn-xs btn-danger" onclick="hapusHariLibur(\'' + h.id + '\')">🗑️</button>' : '-'}</td>
      </tr>`;
    });
  }
  html += '</tbody></table></div>';
  container.innerHTML = html;
}

async function renderMyCalendarView(container) {
  const y = hariLiburCalendarMonth.year;
  const m = hariLiburCalendarMonth.month;
  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const [liburSnap] = await Promise.all([db.collection('hrd_hari_libur').get()]);

  const holidays = {};
  liburSnap.forEach((d) => {
    const data = d.data();
    if (data.tanggal) holidays[data.tanggal] = data;
  });

  let html = `<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:16px">
    <div style="display:flex;align-items:center;gap:8px">
      <button class="btn btn-sm btn-outline" onclick="hariLiburPrevMonth()">&lt;</button>
      <span class="fw-700 color-primary" style="min-width:140px;text-align:center">${monthNames[m]} ${y}</span>
      <button class="btn btn-sm btn-outline" onclick="hariLiburNextMonth()">&gt;</button>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      ${hasAccess(6) ? '<button class="btn btn-info btn-sm" onclick="syncHariLiburNasional()">🔄 Sinkron</button>' : ''}
      ${hasAccess(6) ? '<button class="btn btn-primary btn-sm" onclick="modalHariLibur()">+ Hari Libur</button>' : ''}
    </div>
  </div>`;

  html +=
    '<div style="margin-bottom:12px"><span style="font-size:.75rem;color:var(--text-light)">🔴 Libur &nbsp; 🟡 Cuti Bersama &nbsp; 🔵 Custom</span></div>';

  const firstDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  html += '<div class="calendar-grid">';
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  dayNames.forEach((d) => (html += `<div class="calendar-day-header">${d}</div>`));

  for (let i = 0; i < firstDay; i++) {
    html += '<div class="calendar-day empty"></div>';
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const h = holidays[ds];
    let dayClass = 'calendar-day';
    const isWknd = new Date(y, m, d).getDay() === 0 || new Date(y, m, d).getDay() === 6;
    if (isWknd) dayClass += ' weekend';

    let content = '';
    if (h) {
      const dotColor =
        h.tipe === 'nasional' ? '#c62828' : h.tipe === 'cuti_bersama' ? '#f57f17' : '#1565c0';
      dayClass += ' holiday';
      content = `<div class="holiday-dot" style="background:${dotColor}" title="${escHtml(h.nama)}"></div><div class="holiday-name">${escHtml(h.nama)}</div>`;
    }

    html += `<div class="${dayClass}"><span>${d}</span>${content}</div>`;
  }
  html += '</div>';

  container.innerHTML = `<div class="card">${html}</div>`;
}

async function hapusHariLibur(id) {
  if (!confirm('Hapus hari libur ini?')) return;
  await db.collection('hrd_hari_libur').doc(id).delete();
  loadHariLiburView();
}

function modalHariLibur() {
  openModal(`<div class="modal-title">+ Tambah Hari Libur Custom</div>
  <div class="form-group"><label>Nama Hari Libur</label><input class="form-control" id="hlNama" placeholder="Contoh: Libur Internal Perusahaan"></div>
  <div class="grid-2">
    <div class="form-group"><label>Tanggal</label><input class="form-control" type="date" id="hlTgl" value="${todayStr()}"></div>
    <div class="form-group"><label>Tipe</label><select class="form-control" id="hlTipe"><option value="custom">Custom (Internal)</option><option value="nasional">Nasional (Merah)</option><option value="cuti_bersama">Cuti Bersama</option></select></div>
  </div>
  <button class="btn btn-primary" onclick="simpanHariLibur()">Simpan</button>`);
}

async function simpanHariLibur() {
  const data = {
    nama: document.getElementById('hlNama').value.trim(),
    tanggal: document.getElementById('hlTgl').value,
    tipe: document.getElementById('hlTipe').value,
    tahun: parseInt(document.getElementById('hlTgl').value.split('-')[0]),
    createdAt: new Date().toISOString(),
  };
  if (!data.nama || !data.tanggal) return toast('Lengkapi data', 'warning');
  await db.collection('hrd_hari_libur').add(data);
  closeModalDirect();
  toast('Hari libur ditambahkan', 'success');
  loadHariLiburView();
}

async function syncHariLiburNasional() {
  const year = hariLiburCalendarMonth.year;
  let dataToSync = [];
  if (year === 2025) dataToSync = HARI_LIBUR_NASIONAL_2025;
  else if (year === 2026) dataToSync = HARI_LIBUR_NASIONAL_2026;
  else {
    toast(`Data hari libur nasional tahun ${year} belum tersedia. Tersedia: 2025, 2026`, 'warning');
    return;
  }

  if (
    !confirm(
      `Sinkronisasi ${dataToSync.length} hari libur nasional tahun ${year}? Data yang sudah ada (nasional/cuti_bersama) akan diperbarui.`
    )
  )
    return;

  toast('Memproses sinkronisasi...', 'info');

  const startYear = `${year}-01-01`,
    endYear = `${year}-12-31`;
  const existingSnap = await db.collection('hrd_hari_libur').get();
  const batch1 = [];
  existingSnap.forEach((d) => {
    const data = d.data();
    const tgl = data.tanggal || '';
    const tipe = data.tipe || '';
    if (tgl >= startYear && tgl <= endYear && (tipe === 'nasional' || tipe === 'cuti_bersama'))
      batch1.push(d.ref.delete());
  });
  await Promise.all(batch1);

  const batch2 = [];
  dataToSync.forEach((h) => {
    batch2.push(
      db.collection('hrd_hari_libur').add({
        tanggal: h.tanggal,
        nama: h.nama,
        tipe: h.tipe,
        tahun: year,
        createdAt: new Date().toISOString(),
      })
    );
  });
  await Promise.all(batch2);

  toast(`${dataToSync.length} hari libur nasional ${year} berhasil disinkronkan`, 'success');
  loadHariLiburView();
}

// Auto-load national holidays on first render if collection is empty for 2025 and 2026
async function autoLoadHariLiburNasional() {
  const years = [2025, 2026];
  for (const year of years) {
    const dataToSync = year === 2025 ? HARI_LIBUR_NASIONAL_2025 : HARI_LIBUR_NASIONAL_2026;

    const existingSnap = await db.collection('hrd_hari_libur').where('tahun', '==', year).get();
    let alreadyPopulated = false;
    existingSnap.forEach((d) => {
      const t = d.data().tipe;
      if (t === 'nasional' || t === 'cuti_bersama') alreadyPopulated = true;
    });

    if (!alreadyPopulated) {
      console.log(`[PAYROLL] Auto-loading holidays for ${year}...`);
      const batch = [];
      dataToSync.forEach((h) => {
        batch.push(
          db.collection('hrd_hari_libur').add({
            tanggal: h.tanggal,
            nama: h.nama,
            tipe: h.tipe,
            tahun: year,
            createdAt: new Date().toISOString(),
          })
        );
      });
      await Promise.all(batch);
    }
  }
}

// Check if a given date is a holiday - returns holiday info or null
async function checkHoliday(dateStr) {
  const snap = await db.collection('hrd_hari_libur').where('tanggal', '==', dateStr).limit(1).get();
  if (snap.empty) return null;
  return snap.docs[0].data();
}

// ── FORM KAIZEN — General Affair Work Request ──

async function findCurrentGA() {
  try {
    const snap = await db.collection('hrd_users').get();
    let ga = null;
    snap.forEach(d => {
      const u = d.data();
      const pos = (u.posisi || '').toUpperCase();
      const name = (u.nama || '').toUpperCase();
      const role = (u.role || '').toLowerCase();
      const isActive = u.status === 'aktif' || u.status === undefined;

      if (!isActive) return;
      if (name.includes('NANDA YOGA')) return;

      // Search by GA identifiers
      if (pos.includes('GENERAL AFFAIR') || pos === 'GA' || name.includes('RIZKY NUR FADILAH') || role === 'ga') {
          ga = { id: d.id, ...u };
      }
    });
    return ga;
  } catch (e) {
    console.error("Error finding GA:", e);
    return null;
  }
}

async function renderFormKaizen() {
  const main = document.getElementById('mainContent');
  if (!main) return;

  main.innerHTML = `<div class="p-20 text-center"><div class="spinner mb-12"></div><p>Memuat modul Kaizen...</p></div>`;

  try {
    const gaUser = await findCurrentGA();
    const gaNama = gaUser ? gaUser.nama : 'Muhammad Rizky Nur Fadilah';

    const isGA = gaUser && currentUser.id === gaUser.id;
    const isIrsan = (currentUser.nama || '').toLowerCase().includes('irsan janwar');
    const isGM = (currentUser.posisi || '').toLowerCase().includes('general manager') || (currentUser.posisi || '').toLowerCase() === 'gm';
    const isAdmin = hasAccess(6);

    const addBtn = !isGA ? '<button class="btn btn-primary btn-sm" onclick="modalAddKaizen()">+ Buat Form Kaizen</button>' : '';

    // Priority Filter
    let filterHtml = '';
    if (isGA || hasAccess(3) || hasHeadLevelAccess()) {
      filterHtml = `
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px; background:#f8f9ff; padding:8px 12px; border-radius:8px">
          <span class="text-sm fw-700">🚩 Skala Prioritas:</span>
          <select class="form-control" id="kzFilterPriority" style="max-width:180px; padding:4px 8px; font-size:.82rem" onchange="loadKaizenRecords({ isGA: ${isGA}, isIrsan: ${isIrsan}, isGM: ${isGM}, isAdmin: ${isAdmin} })">
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
        ${addBtn}
      </div>
      <div class="card">
        <p class="text-sm mb-16" style="color:#666">Pemberian tugas/permintaan perbaikan terkait fasilitas & General Affair ditujukan kepada <b>${escHtml(gaNama)}</b>.</p>
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
  } catch (err) {
    console.error("Kaizen render error:", err);
    main.innerHTML = `<div class="empty-state"><div class="icon">❌</div><p>Gagal memuat form Kaizen: ${err.message}</p></div>`;
  }
}

async function loadKaizenRecords(roles) {
  const tbody = document.getElementById('tblKaizen');
  const statsEl = document.getElementById('kaizenStats');
  if (!tbody) return;

  try {
    const { isGA, isIrsan, isGM, isAdmin } = roles || {};

    const snap = await db.collection('hrd_daily_tasks').where('source', '==', 'FORM KAIZEN').get();
    
    let items = [];
    snap.forEach(d => items.push({ id: d.id, ...d.data() }));
    items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

    // Filter by visibility: Level 3+ and GA see all, others see only their assigned/owned
    if (!hasAccess(3) && !isGA) {
        items = items.filter(it => it.assignedBy === currentUser.id || it.userId === currentUser.id);
    }

    const filterPriority = document.getElementById('kzFilterPriority')?.value || 'all';
    if (filterPriority !== 'all') {
        items = items.filter(it => it.priority === filterPriority);
    }

    let html = '';
    if (!items.length) {
      html = '<tr><td colspan="7" class="text-center">Belum ada form Kaizen.</td></tr>';
    } else {
      items.forEach(it => {
        let statusBadge = '';
        if (it.done) {
            statusBadge = '<span class="badge badge-success">Selesai</span>';
        } else if (it.kaizenStatus === 'waiting_approval') {
            statusBadge = '<span class="badge badge-info">⏳ Menunggu Approval</span>';
        } else if (it.kaizenStatus === 'pending') {
            statusBadge = '<span class="badge badge-warning">⚠️ Pending (Revisi)</span>';
        } else if (it.kaizenStatus === 'rejected') {
            statusBadge = '<span class="badge badge-danger">❌ Reject</span>';
        } else {
            statusBadge = '<span class="badge badge-warning">Proses</span>';
        }

        let aksiBtns = `<button class="btn btn-xs btn-info" onclick="viewDailyTask('${it.id}')" title="Lihat Detail">👁️</button>`;

        if (isIrsan && it.kaizenStatus === 'waiting_approval') {
            aksiBtns += ` <button class="btn btn-xs btn-primary" onclick="modalApproveKaizen('${it.id}')" title="Approval Atasan">✅ Approval</button>`;
        }

        if (isGA && !it.done && it.kaizenStatus !== 'waiting_approval') {
            aksiBtns += ` <button class="btn btn-xs btn-success" onclick="modalUpdateKaizenProgress('${it.id}')" title="Berikan Respon/Progress">⚡ Respon</button>`;
        }

        // Edit access for Admin, GM, or Irsan
        if (isAdmin || isGM || isIrsan) {
            aksiBtns += ` <button class="btn btn-xs btn-warning" onclick="editDailyTask('${it.id}')" title="Edit Form Kaizen">✏️</button>`;
        }

        if (it.assignedBy === currentUser.id || isAdmin) {
            aksiBtns += ` <button class="btn btn-xs btn-danger" onclick="hapusDailyTask('${it.id}')" title="Hapus">🗑️</button>`;
        }

        let sisaWaktuHtml = '-';
        if (it.done) {
            sisaWaktuHtml = '<span class="badge badge-success">Selesai</span>';
        } else if (it.tanggal) {
            const tglTarget = new Date(it.tanggal + 'T23:59:59');
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
                ${escHtml(it.title.replace('⚡ KAIZEN: ', ''))}
                <div class="text-xs" style="font-weight:400;color:#666">Progress: ${it.progress || 0}%</div>
            </td>
            <td>${escHtml(it.assignedByName || '-')}</td>
            <td>${formatDate(it.tanggal)}</td>
            <td>${sisaWaktuHtml}</td>
            <td>${statusBadge}</td>
            <td>${aksiBtns}</td>
          </tr>`;
      });
    }
    tbody.innerHTML = html;

    const total = items.length;
    const done = items.filter(it => it.done).length;
    const pending = total - done;
    if (statsEl) {
      statsEl.innerHTML = `
        <div class="stat-card" style="border-left-color:var(--primary)"><div class="stat-value">${total}</div><div class="stat-label">Total Permintaan</div></div>
        <div class="stat-card" style="border-left-color:var(--warning)"><div class="stat-value">${pending}</div><div class="stat-label">Sedang Diproses</div></div>
        <div class="stat-card" style="border-left-color:var(--success)"><div class="stat-value">${done}</div><div class="stat-label">Berhasil Diperbaiki</div></div>
      `;
    }
  } catch (e) {
    console.error("loadKaizenRecords error:", e);
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="color:red">Gagal memuat data: ${e.message}</td></tr>`;
  }
}

async function modalAddKaizen() {
  const gaUser = await findCurrentGA();
  const gaNama = gaUser ? gaUser.nama : 'Muhammad Rizky Nur Fadilah';

  openModal(`
    <div class="modal-title">⚡ Buat FORM KAIZEN (General Affair)</div>
    <p class="text-sm mb-16" style="color:#666">Gunakan form ini untuk memberikan tugas perbaikan fasilitas atau GA kepada <b>${escHtml(gaNama)}</b>.</p>
    
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
      <input type="file" id="kzFiles" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" class="form-control">
      <div class="text-xs mt-4" style="color:#999">Maks 3 file. Format: Gambar, PDF, Word, Excel.</div>
    </div>

    <input type="hidden" id="targetGAId" value="${gaUser ? gaUser.id : 'rizky'}">
    <input type="hidden" id="targetGANama" value="${gaUser ? gaUser.nama : 'Muhammad Rizky Nur Fadilah'}">

    <button class="btn btn-primary" style="width:100%" onclick="simpanKaizen()">📤 Kirim Form Kaizen</button>
  `);
}

async function simpanKaizen() {
  const title = document.getElementById('kzTitle').value.trim();
  const desc = document.getElementById('kzDesc').value.trim();
  const targetId = document.getElementById('targetGAId').value;
  const targetNama = document.getElementById('targetGANama').value;
  
  if (!title || !desc) return toast('Judul dan deskripsi wajib diisi', 'warning');

  const data = {
    type: 'daily-task',
    source: 'FORM KAIZEN',
    title: '⚡ KAIZEN: ' + title,
    description: desc,
    tanggal: document.getElementById('kzTanggal').value,
    priority: document.getElementById('kzPriority').value,
    userId: targetId,
    targetUserName: targetNama,
    assignedBy: currentUser.id,
    assignedByName: currentUser.nama,
    done: false,
    progress: 0,
    aktivitas: 'Menunggu pengerjaan oleh GA.',
    ownerLevel: 1,
    departemen: 'GENERAL AFFAIR',
    createdAt: new Date().toISOString()
  };

  try {
    toast('⏳ Mengirim form kaizen...', 'info');
    data.attachments = await getFilesAsBase64('kzFiles');
    await db.collection('hrd_daily_tasks').add(data);
    
    if (targetId) {
        await sendNotification(targetId, '⚡ FORM KAIZEN BARU', `${currentUser.nama} memberikan tugas: ${title}`, 'kaizen');
    }

    toast('Form Kaizen berhasil dikirim ke GA', 'success');
    closeModalDirect();
    renderFormKaizen();
  } catch (e) {
    toast('Gagal: ' + e.message, 'error');
  }
}

function filterDailyTasks(f) {
  loadDailyTasks(f);
}

function viewDailyTask(id) {
  let task = typeof _dailyTaskData !== 'undefined' ? _dailyTaskData.find((t) => t.id === id) : null;
  if (!task) {
    db.collection('hrd_daily_tasks')
      .doc(id)
      .get()
      .then(function (doc) {
        if (!doc.exists) return toast('Data tidak ditemukan', 'warning');
        _showDailyTaskDetail({ id: doc.id, ...doc.data() });
      });
    return;
  }
  _showDailyTaskDetail(task);
}

async function editDailyTask(id) {
  let task = typeof _dailyTaskData !== 'undefined' ? _dailyTaskData.find((t) => t.id === id) : null;
  if (!task) {
    const doc = await db.collection('hrd_daily_tasks').doc(id).get();
    if (!doc.exists) return toast('Data tidak ditemukan', 'warning');
    task = { id: doc.id, ...doc.data() };
  }

  let reassignHtml = '';
  if (hasAccess(3)) {
    try {
      const usersSnap = await db.collection('hrd_users').get();
      let opts = `<option value="self" ${task.userId === currentUser.id ? 'selected' : ''}>📝 Untuk Diri Sendiri</option><option disabled>── Tugaskan ke Karyawan ──</option>`;
      usersSnap.forEach((d) => {
        const u = d.data();
        if (u.status !== 'nonaktif')
          opts += `<option value="${d.id}" data-nama="${escHtml(u.nama)}" ${d.id === task.userId && d.id !== currentUser.id ? 'selected' : ''}>${escHtml(u.nama)} (${u.role})</option>`;
      });
      reassignHtml = `<div class="form-group"><label>Untuk Siapa</label><select class="form-control" id="dtEditAssignUser">${opts}</select></div>`;
    } catch (_e) {}
  }

  openModal(`<div class="modal-title">✏️ Edit Task / Form</div>
    ${reassignHtml}
    <div class="form-group"><label>Judul *</label><input class="form-control" id="dtEditTitle" value="${escHtml(task.title)}"></div>
    <div class="form-group"><label>Deskripsi</label><textarea class="form-control" id="dtEditDesc" rows="4" style="white-space:pre-wrap">${escHtml(task.description || '')}</textarea></div>
    <div class="form-group"><label>Aktivitas / Update Progress</label><textarea class="form-control" id="dtEditAktivitas" rows="3" style="white-space:pre-wrap">${escHtml(task.aktivitas || '')}</textarea></div>
    <div class="grid-2"><div class="form-group"><label>Progress (%)</label><input class="form-control" type="number" id="dtEditProgress" value="${Math.max(0, Math.min(100, parseInt(task.progress, 10) || 0))}" min="0" max="100"></div><div class="form-group"><label>Kendala</label><input class="form-control" id="dtEditKendala" value="${escHtml(task.kendala || '')}"></div></div>
    <div class="form-group"><label>Tindak Lanjut / Solusi</label><textarea class="form-control" id="dtEditSolusi" rows="2" style="white-space:pre-wrap">${escHtml(task.solusi || '')}</textarea></div>
    <div class="grid-2"><div class="form-group"><label>Tanggal *</label><input class="form-control" type="date" id="dtEditDate" value="${task.tanggal}"></div><div class="form-group"><label>Waktu</label><input class="form-control" type="time" id="dtEditTime" value="${task.waktu || ''}"></div></div>
    <div class="grid-2"><div class="form-group"><label>Prioritas</label><select class="form-control" id="dtEditPriority"><option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Sedang</option><option value="high" ${task.priority === 'high' ? 'selected' : ''}>Tinggi</option><option value="low" ${task.priority === 'low' ? 'selected' : ''}>Rendah</option></select></div><div class="form-group"><label>Pengingat</label><select class="form-control" id="dtEditReminder"><option value="" ${!task.reminder ? 'selected' : ''}>Tidak ada</option><option value="15 menit" ${task.reminder === '15 menit' ? 'selected' : ''}>15 menit</option><option value="30 menit" ${task.reminder === '30 menit' ? 'selected' : ''}>30 menit</option><option value="1 jam" ${task.reminder === '1 jam' ? 'selected' : ''}>1 jam</option><option value="1 hari" ${task.reminder === '1 hari' ? 'selected' : ''}>1 hari</option></select></div></div>
    <div class="form-group"><label>Ulangi</label><select class="form-control" id="dtEditRepeat"><option value="" ${!task.repeat ? 'selected' : ''}>Tidak</option><option value="daily" ${task.repeat === 'daily' ? 'selected' : ''}>Setiap Hari</option><option value="weekly" ${task.repeat === 'weekly' ? 'selected' : ''}>Setiap Minggu</option><option value="monthly" ${task.repeat === 'monthly' ? 'selected' : ''}>Setiap Bulan</option></select></div>
    <button class="btn btn-primary" onclick="updateDailyTask('${id}')">💾 Simpan</button>`);
}

async function updateDailyTask(id) {
  const title = document.getElementById('dtEditTitle').value.trim();
  const tanggal = document.getElementById('dtEditDate').value;
  if (!title || !tanggal) return toast('Judul dan tanggal wajib', 'warning');
  const updateData = {
    title,
    description: document.getElementById('dtEditDesc').value.trim(),
    aktivitas: document.getElementById('dtEditAktivitas').value.trim(),
    progress: Math.max(0, Math.min(100, parseInt(document.getElementById('dtEditProgress').value, 10) || 0)),
    kendala: document.getElementById('dtEditKendala').value.trim(),
    solusi: document.getElementById('dtEditSolusi').value.trim(),
    tanggal,
    waktu: document.getElementById('dtTime' in document.getElementById ? document.getElementById('dtEditTime').value : '') || '',
    priority: document.getElementById('dtEditPriority').value,
    reminder: document.getElementById('dtEditReminder').value,
    repeat: document.getElementById('dtEditRepeat').value || '',
    updatedAt: new Date().toISOString(),
  };
  const reassignEl = document.getElementById('dtEditAssignUser');
  if (reassignEl) {
    const isSelf = reassignEl.value === 'self';
    updateData.userId = isSelf ? currentUser.id : reassignEl.value;
    updateData.targetUserName = isSelf ? currentUser.nama : reassignEl.options[reassignEl.selectedIndex].text.split(' (')[0];
    if (!isSelf) {
      updateData.assignedBy = currentUser.id;
      updateData.assignedByName = currentUser.nama;
    }
  }
  try {
    await db.collection('hrd_daily_tasks').doc(id).update(updateData);
    toast('Diperbarui', 'success');
    closeModalDirect();
    if (typeof renderFormKaizen === 'function') renderFormKaizen();
    else if (typeof loadDailyTasks === 'function') loadDailyTasks(_dailyTaskFilter);
  } catch (e) {
    toast('Gagal: ' + e.message, 'error');
  }
}

async function hapusDailyTask(id) {
  if (!confirm('Hapus task ini?')) return;
  try {
    await db.collection('hrd_daily_tasks').doc(id).delete();
    toast('Dihapus', 'success');
    if (typeof renderFormKaizen === 'function') renderFormKaizen();
    else if (typeof loadDailyTasks === 'function') loadDailyTasks(_dailyTaskFilter);
  } catch (e) {
    toast('Gagal: ' + e.message, 'error');
  }
}

async function modalUpdateKaizenProgress(id) {
  const doc = await db.collection('hrd_daily_tasks').doc(id).get();
  if (!doc.exists) return toast('Data tidak ditemukan', 'warning');
  const task = doc.data();

  openModal(`
    <div class="modal-title">⚡ Update Progress Form Kaizen</div>
    <div style="background:#f8f9ff;padding:12px;border-radius:8px;margin-bottom:16px;border-left:4px solid var(--primary)">
      <div class="fw-700">${escHtml(task.title.replace('⚡ KAIZEN: ', ''))}</div>
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
        <option value="false" ${!task.done ? 'selected' : ''}>⏳ Sedang Diproses (Pending)</option>
        <option value="true" ${task.done ? 'selected' : ''}>✅ Selesai Dikerjakan</option>
      </select>
    </div>

    <div class="form-group">
      <label>Respon / Catatan Progress</label>
      <textarea class="form-control" id="upKzAktivitas" rows="3" placeholder="Contoh: Sedang menunggu sparepart / Sudah diperbaiki dan dicek ulang.">${escHtml(task.aktivitas || '')}</textarea>
    </div>

    <div class="form-group">
      <label>📎 Upload Foto Hasil (Opsional)</label>
      <input type="file" id="upKzFiles" multiple accept="image/*" class="form-control">
    </div>

    <button class="btn btn-primary" style="width:100%" onclick="simpanUpdateKaizen('${id}')">💾 Simpan Progress</button>
  `);
}

async function simpanUpdateKaizen(id) {
  const progress = parseInt(document.getElementById('upKzProgress').value);
  const markDone = document.getElementById('upKzDone').value === 'true';
  const aktivitas = document.getElementById('upKzAktivitas').value.trim();
  
  if (!aktivitas) return toast('Harap berikan catatan progress', 'warning');

  try {
    toast('⏳ Menyimpan progress...', 'info');
    const newAttachments = await getFilesAsBase64('upKzFiles');

    const updateData = {
      progress: progress,
      aktivitas: aktivitas,
      updatedAt: new Date().toISOString(),
      kaizenLogs: firebase.firestore.FieldValue.arrayUnion({
          userId: currentUser.id,
          userName: currentUser.nama,
          action: markDone ? 'submit_done' : 'update_progress',
          comment: aktivitas,
          progress: progress,
          attachments: newAttachments || [],
          timestamp: new Date().toISOString()
      })
    };

    if (markDone) {
      updateData.kaizenStatus = 'waiting_approval';
      updateData.progress = 100;
      updateData.done = false;
    } else {
      updateData.kaizenStatus = 'proses';
      updateData.done = false;
    }

    if (newAttachments && newAttachments.length > 0) {
        const doc = await db.collection('hrd_daily_tasks').doc(id).get();
        const oldAttachments = doc.data().attachments || [];
        updateData.attachments = [...oldAttachments, ...newAttachments].slice(0, 15);
    }

    await db.collection('hrd_daily_tasks').doc(id).update(updateData);

    if (markDone) {
        try {
            const irsanSnap = await db.collection('hrd_users').get();
            let irsanId = '';
            irsanSnap.forEach(d => {
                if ((d.data().nama || '').toLowerCase().includes('irsan janwar')) irsanId = d.id;
            });
            if (irsanId) {
                await sendNotification(irsanId, '🔔 Approval Kaizen', `GA telah menyelesaikan tugas Kaizen. Mohon tinjau & approve.`, 'kaizen');
            }
        } catch (err) {}
    }

    const finalDoc = await db.collection('hrd_daily_tasks').doc(id).get();
    const taskFinal = finalDoc.data();
    await sendNotification(taskFinal.assignedBy, '⚡ UPDATE KAIZEN', `GA telah mengupdate tugas: "${taskFinal.title.replace('⚡ KAIZEN: ', '')}" ke ${progress}%`, 'kaizen');

    toast(markDone ? 'Tugas dikirim untuk approval atasan' : 'Progress diperbarui', 'success');
    closeModalDirect();
    renderFormKaizen();
  } catch (e) {
    toast('Gagal update: ' + e.message, 'error');
  }
}

async function modalApproveKaizen(id) {
  const doc = await db.collection('hrd_daily_tasks').doc(id).get();
  const task = doc.data();

  openModal(`
    <div class="modal-title">✅ Approval Form Kaizen</div>
    <div style="background:#f8f9ff;padding:12px;border-radius:8px;margin-bottom:16px;border-left:4px solid var(--primary)">
      <div class="fw-700">Tugas: ${escHtml(task.title.replace('⚡ KAIZEN: ', ''))}</div>
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
    const komentar = document.getElementById('apKzKomentar').value.trim();
    if ((action === 'pending' || action === 'rejected') && !komentar) {
        return toast('Harap berikan komentar alasan', 'warning');
    }

    const docRef = await db.collection('hrd_daily_tasks').doc(id).get();
    const task = docRef.data();

    const updateData = {
        kaizenStatus: action,
        approverComment: komentar,
        updatedAt: new Date().toISOString(),
        kaizenLogs: firebase.firestore.FieldValue.arrayUnion({
            userId: currentUser.id,
            userName: currentUser.nama,
            action: action,
            comment: komentar || 'Status diperbarui',
            timestamp: new Date().toISOString()
        })
    };

    if (action === 'approved') {
        updateData.done = true;
        updateData.doneAt = new Date().toISOString();
        updateData.progress = 100;
    } else {
        updateData.done = false;
        if (action === 'pending') updateData.progress = 90;
        else updateData.progress = 0;
    }

    try {
        toast('⏳ Memproses approval...', 'info');
        await db.collection('hrd_daily_tasks').doc(id).update(updateData);

        if (action === 'approved') {
            try {
                const reportData = {
                    type: 'report',
                    source: 'AUTO-KAIZEN-FINAL',
                    title: '📝 Daily Report — ' + formatDate(todayStr()),
                    tanggal: todayStr(),
                    kategori: "FACILITY'S",
                    jamMasuk: '08:00',
                    jamKeluar: new Date().toTimeString().substring(0, 5),
                    aktivitas: `[APPROVED KAIZEN] - ${task.title.replace('⚡ KAIZEN: ', '')}\nRespon GA: ${task.aktivitas}\nReview Atasan: ${komentar || 'Sesuai'}`,
                    hasil: `Pekerjaan Selesai & Disetujui Atasan: ${task.title.replace('⚡ KAIZEN: ', '')}`,
                    kendala: '',
                    solusi: '',
                    rencana: '',
                    progress: 100,
                    done: true,
                    doneAt: new Date().toISOString(),
                    userId: task.userId,
                    targetUserName: task.targetUserName || 'Muhammad Rizky Nur Fadilah',
                    departemen: 'GENERAL AFFAIR',
                    owner_level: 1,
                    attachments: task.attachments || [],
                    createdAt: new Date().toISOString()
                };
                await db.collection('hrd_daily_tasks').add(reportData);
            } catch (err) {
                console.warn("Integrasi report gagal:", err.message);
            }
        }

        const gaSnap = await db.collection('hrd_users').get();
        let gaId = '';
        gaSnap.forEach(d => {
            if ((d.data().nama || '').toLowerCase().includes('rizky')) gaId = d.id;
        });
        if (gaId) {
            const actLabel = action === 'approved' ? 'DISETUJUI' : action === 'pending' ? 'DITANGGUHKAN (REVISI)' : 'DITOLAK (REJECT)';
            await sendNotification(gaId, '⚡ STATUS KAIZEN', `Tugas "${task.title.replace('⚡ KAIZEN: ', '')}" telah ${actLabel} oleh Irsan. Pesan: ${komentar || '-'}`, 'kaizen');
        }

        await sendNotification(task.assignedBy, '⚡ UPDATE KAIZEN', `Tugas yang Anda minta "${task.title.replace('⚡ KAIZEN: ', '')}" berstatus: ${action.toUpperCase()}. Pesan Atasan: ${komentar || '-'}`, 'kaizen');

        toast('Status Kaizen diperbarui: ' + action.toUpperCase(), 'success');
        closeModalDirect();
        renderFormKaizen();
    } catch (e) {
        toast('Gagal: ' + e.message, 'error');
    }
}

async function addKaizenGeneralComment(id) {
    const comment = document.getElementById('kzGenComment').value.trim();
    if (!comment) return;

    try {
        await db.collection('hrd_daily_tasks').doc(id).update({
            kaizenLogs: firebase.firestore.FieldValue.arrayUnion({
                userId: currentUser.id,
                userName: currentUser.nama,
                action: 'comment',
                comment: comment,
                timestamp: new Date().toISOString()
            })
        });
        toast('Komentar ditambahkan', 'success');

        // Refresh detail view
        const doc = await db.collection('hrd_daily_tasks').doc(id).get();
        _showDailyTaskDetail({ id: doc.id, ...doc.data() });
    } catch (e) {
        toast('Gagal: ' + e.message, 'error');
    }
}

async function deleteKaizenLog(taskId, timestamp) {
    if (!confirm('Hapus log/komentar ini?')) return;
    try {
        const doc = await db.collection('hrd_daily_tasks').doc(taskId).get();
        if (!doc.exists) return;
        const logs = doc.data().kaizenLogs || [];
        const logToRemove = logs.find(l => l.timestamp === timestamp);
        if (logToRemove) {
            await db.collection('hrd_daily_tasks').doc(taskId).update({
                kaizenLogs: firebase.firestore.FieldValue.arrayRemove(logToRemove)
            });
            toast('Log dihapus', 'success');
            // Refresh detail view
            const newDoc = await db.collection('hrd_daily_tasks').doc(taskId).get();
            _showDailyTaskDetail({ id: newDoc.id, ...newDoc.data() });
        }
    } catch (e) {
        toast('Gagal hapus: ' + e.message, 'error');
    }
}

// ── CUTI BERSAMA MASSAL (ADMIN ONLY) ──────────────────────────
function modalCutiBersamaMassal() {
  if (!hasAccess(3)) return toast('Akses ditolak', 'warning');
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
  const mulai = document.getElementById('massCtMulai').value;
  const selesai = document.getElementById('massCtSelesai').value;
  const keterangan = document.getElementById('massCtKet').value;

  if (!mulai || !selesai || !keterangan) return toast('Lengkapi semua data', 'warning');

  const durasi = countWorkDays(mulai, selesai);
  if (durasi <= 0) return toast('Durasi tidak valid atau hanya hari libur/weekend', 'warning');

  if (!confirm(`Input Cuti Bersama "${keterangan}" (${durasi} hari) untuk SEMUA karyawan aktif?\nIni akan memotong jatah cuti mereka.`)) return;

  toast('⏳ Sedang memproses data massal...', 'info');

  try {
    // 1. Ambil semua karyawan aktif
    const kSnap = await db.collection('hrd_karyawan').where('status', '==', 'aktif').get();

    // 2. Ambil data cuti yang sudah ada untuk cek duplikasi
    const existSnap = await db.collection('hrd_cuti')
        .where('mulai', '==', mulai)
        .where('jenis', '==', 'Cuti Bersama')
        .get();
    const existSet = new Set();
    existSnap.forEach(d => existSet.add(d.data().nama?.toLowerCase().trim()));

    let added = 0;
    let batch = db.batch();
    const createdAt = new Date().toISOString();

    kSnap.forEach(doc => {
      const k = doc.data();
      const namaLow = (k.nama || '').toLowerCase().trim();

      // Skip if already added for this exact start date
      if (existSet.has(namaLow)) return;

      const newRef = db.collection('hrd_cuti').doc();
      batch.set(newRef, {
        nama: k.nama,
        userId: '', // Optional for mass input
        jenis: 'Cuti Bersama',
        mulai,
        selesai,
        durasi,
        keterangan: keterangan,
        status: 'approved',
        approvedBy: currentUser.nama,
        approvedAt: createdAt,
        createdAt,
        isMassive: true
      });

      added++;
    });

    const karyawanDocs = kSnap.docs;
    let currentBatch = db.batch();
    let batchCount = 0;
    let totalProcessed = 0;

    for (const doc of karyawanDocs) {
        const k = doc.data();
        const namaLow = (k.nama || '').toLowerCase().trim();
        if (existSet.has(namaLow)) continue;

        const newRef = db.collection('hrd_cuti').doc();
        currentBatch.set(newRef, {
            nama: k.nama,
            jenis: 'Cuti Bersama',
            mulai,
            selesai,
            durasi,
            keterangan: keterangan,
            status: 'approved',
            approvedBy: currentUser.nama,
            approvedAt: createdAt,
            createdAt,
            isMassive: true
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
    toast(`✅ Berhasil menginput Cuti Bersama untuk ${totalProcessed} karyawan. Jangan lupa klik "Sinkronisasi" di menu Penggajian.`, 'success');
    renderCuti();

  } catch (e) {
    console.error(e);
    toast('Error: ' + e.message, 'error');
  }
}
