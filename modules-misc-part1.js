'use strict';

/**
 * Recursively find all names of subordinates for a given boss.
 * Includes loop protection and safety checks.
 */
function getAllSubordinates(bossName, allKaryawan, seen = new Set()) {
  if (!bossName) return [];
  const bossNameLow = bossName.toLowerCase().trim();

  // Protection against infinite recursion loops (e.g. A reports to A)
  if (seen.has(bossNameLow)) return [];
  seen.add(bossNameLow);

  const subordinates = [];

  // Find direct subordinates
  const direct = allKaryawan.filter(k =>
      k.nama &&
      (k.atasan || "").toLowerCase().trim() === bossNameLow
  );

  direct.forEach(sub => {
      const subName = (sub.nama || "").toLowerCase().trim();
      if (subName && !subordinates.includes(subName)) {
          subordinates.push(subName);
          // Recursively find children of this subordinate
          const subChildren = getAllSubordinates(sub.nama, allKaryawan, seen);
          subChildren.forEach(child => {
              if (!subordinates.includes(child)) subordinates.push(child);
          });
      }
  });

  return subordinates;
}

/**
 * Calculate loan eligibility limits based on BAB XI rules.
 * Attached to window for cross-module reliability.
 */
window.calculateLoanEligibility = async function(k) {
  if (!k) return { maxRegular: 0, maxEmergency: 0, eligible: false, message: 'Data karyawan tidak ditemukan.' };

  const gaji = Number(k.gajiPokok) || 0;
  const status = (k.status || '').toLowerCase();
  const tipe = (k.tipeKaryawan || '').toUpperCase(); // PKWTT, PKWT, PROBATION, FREELANCE

  // Tenure in years
  const masuk = k.tanggalMasuk ? new Date(k.tanggalMasuk) : new Date();
  const now = new Date();
  const diffTime = Math.abs(now - masuk);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffYears = diffDays / 365.25;
  const diffMonths = diffDays / 30.44;

  // Emergency Loan (Bab XI Pasal 51)
  let maxEmergency = 0;
  if (diffMonths >= 6) {
      maxEmergency = Math.min(1000000, Math.round(gaji * 0.2));
  }

  // Regular Loan
  let maxRegular = 0;
  let eligibleRegular = false;
  let regularMsg = "";

  if (status === 'aktif' || status === 'tetap' || status === 'probation' || status === 'kontrak') {
      const isPermanent = tipe === 'PKWTT' || tipe === 'TETAP';
      const isContract = ['PKWT', 'PROBATION', 'FREELANCE', 'KONTRAK', 'MAGANG'].includes(tipe);

      if (isPermanent) {
          // Permanent Staff Rules (Bab XI Pasal 51)
          if (diffYears >= 5) {
              maxRegular = Math.round(gaji * 3.4);
              eligibleRegular = true;
          } else if (diffYears >= 3) {
              maxRegular = Math.round(gaji * 2.5);
              eligibleRegular = true;
          } else if (diffYears >= 1) {
              maxRegular = Math.round(gaji * 1.5);
              eligibleRegular = true;
          } else {
              regularMsg = "PKWTT: Masa kerja minimal 12 bulan untuk Pinjaman Reguler.";
          }
      } else {
          // Default to Contract Rules if not permanent or if tipe is unknown but tenure is valid
          // This ensures staff like Hilmi (PKWT/Contract) get their 0.5x limit correctly
          if (diffYears >= 1) {
              maxRegular = Math.round(gaji * 0.5);
              eligibleRegular = true;
          } else {
              regularMsg = "Karyawan Kontrak/Probation: Masa kerja minimal 12 bulan untuk Pinjaman Reguler (0,5x Gaji).";
          }
      }
  } else {
      regularMsg = "Hanya karyawan aktif yang berhak mengajukan Pinjaman Reguler.";
  }

  return {
      maxRegular,
      maxEmergency,
      eligible: true,
      diffYears,
      diffMonths,
      regularMsg,
      isPermanent: tipe === 'PKWTT' || tipe === 'TETAP'
  };
}

// ── LAPORAN KEUANGAN ──────────────────────────────────────────
function renderLaporanKeuangan() {
  const main = document.getElementById('mainContent');
  main.innerHTML = `<div class="page-title"><span>📊 Laporan Keuangan</span></div>
    <div class="card" style="border-left:4px solid var(--primary)">
      <div class="card-title mb-12">💰 Portal Laporan Keuangan IJEF</div>
      <p class="text-sm mb-16" style="color:#666;line-height:1.6">Akses portal laporan keuangan perusahaan. Data keuangan terintegrasi langsung dengan akun Anda.</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
        <a href="https://laporankeuanganijef.netlify.app/" target="_blank" class="btn btn-sm" style="background:var(--primary);color:#fff;text-decoration:none;display:inline-flex;align-items:center;gap:6px;padding:10px 20px;font-size:.9rem">📊 Buka Laporan Keuangan</a>
      </div>
      <div style="margin-top:20px;padding:14px;background:#f9f9f9;border-radius:8px">
        <div class="fw-700 mb-8" style="font-size:.85rem">ℹ️ Informasi</div>
        <div class="text-xs" style="line-height:1.8;color:#555">
          • Portal ini menampilkan data laporan keuangan perusahaan secara real-time<br>
          • Akses menggunakan kredensial yang sama dengan akun IMS Anda<br>
          • Data bersifat rahasia — hanya bisa diakses oleh user yang berwenang
        </div>
      </div>
    </div>`;
}

// ── KPI ───────────────────────────────────────────────────────
function clampScore(v) {
  return Math.max(0, Math.min(100, Math.round(Number(v) || 0)));
}
function normalizePeriodeKPI(periode) {
  return (periode || monthStr()).slice(0, 7);
}
function pickLatestByDate(items, periodKey) {
  if (!items.length) return null;
  const filtered = periodKey
    ? items.filter((x) =>
        (x.evaluasiPeriode || x.periode || x.tanggalTes || '').startsWith(periodKey)
      )
    : items;
  const src = filtered.length ? filtered : items;
  src.sort((a, b) =>
    (b.createdAt || b.updatedAt || b.tanggalTes || '').localeCompare(
      a.createdAt || a.updatedAt || a.tanggalTes || ''
    )
  );
  return src[0] || null;
}
async function hitungKPIIntegrasi(nama, periode) {
  const namaLower = (nama || '').toLowerCase().trim();
  const periodKey = normalizePeriodeKPI(periode);
  const [karySnap, jobdeskSnap, absenSnap, penSnap, discSnap, taskSnap] = await Promise.all([
    db.collection('hrd_karyawan').where('status', '==', 'aktif').get(),
    db.collection('hrd_jobdesk').get(),
    db.collection('hrd_absensi').get(),
    db.collection('hrd_penalty').get(),
    db.collection('hrd_disc_results').get(),
    db.collection('hrd_daily_tasks').get(),
  ]);
  let karyawanId = '';
  karySnap.forEach((d) => {
    const k = d.data() || {};
    if ((k.nama || '').toLowerCase().trim() === namaLower && !karyawanId) karyawanId = d.id;
  });
  let jobdeskData = null;
  jobdeskSnap.forEach((d) => {
    const jd = d.data() || {};
    const idMatch = karyawanId && (jd.karyawanId === karyawanId || jd.userId === karyawanId);
    if (idMatch && !jobdeskData) jobdeskData = jd;
  });
  const bidangJobdesk = ['deskripsi', 'tanggungJawab', 'kualifikasi', 'kpi'];
  const filledJobdesk = jobdeskData
    ? bidangJobdesk.filter((key) => (jobdeskData[key] || '').toString().trim()).length
    : 0;
  const jobdeskScore = clampScore(
    jobdeskData ? 50 + (filledJobdesk / bidangJobdesk.length) * 50 : 50
  );
  const masukPeriode = [];
  const hariMasuk = new Set();
  let countTerlambat = 0;
  let countTepat = 0;
  absenSnap.forEach((d) => {
    const a = d.data() || {};
    const isNama = (a.nama || '').toLowerCase().trim() === namaLower;
    const isId = karyawanId && a.userId === karyawanId;
    if (!(isNama || isId)) return;
    if (a.tipe !== 'masuk') return;
    if (!(a.tanggal || '').startsWith(periodKey)) return;
    masukPeriode.push(a);
    hariMasuk.add(a.tanggal);
    if ((a.status || '').toLowerCase() === 'terlambat') countTerlambat++;
    else countTepat++;
  });
  const totalHariMasuk = hariMasuk.size;
  const totalEventMasuk = masukPeriode.length;
  const absenScore = clampScore(
    totalEventMasuk > 0 ? (countTepat / totalEventMasuk) * 100 : 80
  );
  let totalPoints = 0;
  penSnap.forEach((d) => {
    const p = d.data() || {};
    const isNama = (p.nama || '').toLowerCase().trim() === namaLower;
    const isId = karyawanId && p.userId === karyawanId;
    if ((isNama || isId) && (p.tanggal || '').startsWith(periodKey)) {
      totalPoints += parseInt(p.poin) || 0;
    }
  });
  const penaltyScore = clampScore(100 - totalPoints * 5);
  let totalTasks = 0,
    doneTasks = 0;
  taskSnap.forEach((d) => {
    const t = d.data() || {};
    const isNama = (t.nama || '').toLowerCase().trim() === namaLower;
    const isId = karyawanId && (t.userId === karyawanId || t.targetUserId === karyawanId);
    if ((isNama || isId) && (t.createdAt || '').startsWith(periodKey)) {
      totalTasks++;
      if (t.status === 'selesai' || t.progress >= 100) doneTasks++;
    }
  });
  const taskScore = clampScore(totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 80);
  const murni = Math.round((jobdeskScore + absenScore + penaltyScore + taskScore) / 4);
  return { murni, penalty: totalPoints, detail: { jobdeskScore, absenScore, penaltyScore, taskScore } };
}

async function renderKPI() {
  const main = document.getElementById('mainContent');
  const isBOD = currentUser.role === 'bod';
  main.innerHTML = `<div class="page-title"><span>${renderBackButton()}📈 KPI & Penilaian</span>${!isBOD ? '<button class="btn btn-primary btn-sm" onclick="modalKPI()">+ Tambah</button>' : '<button class="btn btn-primary btn-sm" onclick="modalKPI()">+ Nilai HEAD</button>'}</div><div style="margin-bottom:12px">${!isBOD ? '<button type="button" class="btn btn-sm btn-info" onclick="document.getElementById(\'kpiInfoPanelAdmin\').style.display=document.getElementById(\'kpiInfoPanelAdmin\').style.display===\'none\'?\'block\':\'none\'">ℹ️ Info Formula KPI</button> <button type="button" class="btn btn-sm btn-warning" onclick="sinkronPenaltyKPI()">🔄 Sinkron Penalty</button>' : ''}<div id="kpiInfoPanelAdmin" style="display:none;margin-top:12px;padding:12px;background:#f9f9f9;border-radius:8px;font-size:.82rem;line-height:1.6"><strong>Metode Penilaian Terintegrasi:</strong><br>• Sumber data: Jobdesk, Absensi, <b>Daily Task (completion)</b>, <b>Daily Report (consistency)</b>, Penalty, dan DISC<br>• Nilai komponen dibentuk dari data terintegrasi lalu bisa disesuaikan penilai<br>• Skor Murni = Rata-rata Produktivitas, Kualitas, Kedisiplinan, Kerjasama<br>• Setiap 1 penalty point mengurangi skor akhir sebesar 2 poin<br>• <strong>Skor Akhir = Skor Murni - (Total Penalty x 2)</strong><br><br><strong>Grade:</strong> A (≥90) | B (≥80) | C (≥70) | D (≥60) | E (<60)</div></div><div class="card"><div class="table-wrap"><table><thead><tr style="background:var(--primary);color:#fff"><th>Karyawan</th><th>Periode</th><th>Skor Murni</th><th>Penalty</th><th>Skor Akhir</th><th>Grade</th><th>Penilai</th>${!isBOD ? '<th>Aksi</th>' : ''}</tr></thead><tbody id="tblKPI"></tbody></table></div></div>`;
  const snap = await db.collection('hrd_kpi').get();
  let h = '';
  snap.forEach((d) => {
    const p = d.data();
    const final = p.skor || 0;
    const grade = final >= 90 ? 'A' : final >= 80 ? 'B' : final >= 70 ? 'C' : final >= 60 ? 'D' : 'E';
    const color = final >= 80 ? 'var(--success)' : final >= 60 ? 'var(--warning)' : 'var(--danger)';
    h += `<tr><td class="fw-700">${escHtml(p.nama)}</td><td>${p.periode}</td><td>${p.skorMurni || p.skor}</td><td>${p.penalty || 0}</td><td class="fw-700" style="color:${color}">${final}</td><td><span class="badge" style="background:${color};color:#fff">${grade}</span></td><td>${escHtml(p.penilai || '-')}</td>${!isBOD ? `<td><button class="btn btn-xs btn-info" onclick="viewKPIDetail('${d.id}')">👁️</button> <button class="btn btn-xs btn-danger" onclick="hapusDoc('hrd_kpi','${d.id}','kpi')">🗑️</button></td>` : ''}</tr>`;
  });
  document.getElementById('tblKPI').innerHTML = h || '<tr><td colspan="8" class="text-center">Belum ada data</td></tr>';
}

async function viewKPIDetail(id) {
  const doc = await db.collection('hrd_kpi').doc(id).get();
  if (!doc.exists) return toast('Data tidak ditemukan', 'warning');
  const p = doc.data();

  // Fetch live penalty for current status
  const penSnap = await db.collection('hrd_penalty').where('nama', '==', p.nama).get();
  let totalPenalty = 0;
  let penDetails = '';
  penSnap.forEach(d => {
      const pd = d.data();
      totalPenalty += (parseInt(pd.poin) || 0);
      penDetails += `<div class="text-xs mb-4">• ${formatDate(pd.tanggal)}: ${escHtml(pd.jenis)} (${pd.poin} poin) - ${escHtml(pd.deskripsi || '-')}</div>`;
  });

  const skorMurni = p.skorMurni != null ? p.skorMurni : p.skor;
  const deduksi = totalPenalty * 2;
  const skorAkhir = Math.max(0, skorMurni - deduksi);
  const grade = skorAkhir >= 90 ? 'A' : skorAkhir >= 80 ? 'B' : skorAkhir >= 70 ? 'C' : skorAkhir >= 60 ? 'D' : 'E';

  openModal(`<div class="modal-title">📊 Detail Penilaian KPI</div>
    <div style="border-left:4px solid var(--primary);background:#f9f9f9;padding:14px;border-radius:8px;margin-bottom:16px">
        <div class="fw-700" style="font-size:1rem">${escHtml(p.nama)}</div>
        <div class="text-sm color-gray">${p.periode} &mdash; Penilai: ${escHtml(p.penilai || '-')}</div>
    </div>
    <div class="grid-2 mb-16">
        <div class="card p-12 text-center" style="background:#f9f9f9;border:none">
            <div class="text-xs color-gray mb-4">SKOR MURNI</div>
            <div style="font-size:1.5rem;font-weight:700">${skorMurni}</div>
        </div>
        <div class="card p-12 text-center" style="background:#f9f9f9;border:none">
            <div class="text-xs color-gray mb-4">SKOR AKHIR</div>
            <div style="font-size:1.5rem;font-weight:700;color:var(--primary)">${skorAkhir} (${grade})</div>
        </div>
    </div>
    <div class="mb-12">
        <div class="fw-700 text-sm mb-8">📉 Pengurang Skor (Penalty):</div>
        <div style="padding:10px;background:#fff5f5;border-radius:8px;border:1px solid #ffebee">
            <div class="flex" style="justify-content:space-between"><span>Total Penalty Point:</span><b>${totalPenalty} Poin</b></div>
            <div class="flex" style="justify-content:space-between"><span>Total Deduksi Score:</span><b class="color-danger">-${deduksi} Poin</b></div>
            <div style="margin-top:8px;border-top:1px dashed #ffcdd2;padding-top:8px">${penDetails || '<i class="text-xs color-gray">Tidak ada penalty tercatat</i>'}</div>
        </div>
    </div>
    <div class="form-group"><label>Catatan Penilai</label><div class="text-sm p-10 bg-light border-radius-8 italic">${escHtml(p.catatan || '-')}</div></div>`);
}

async function renderApprovalCenter(tab = 'pending') {
  const main = document.getElementById('mainContent');
  if (!main) return;

  const role = (currentUser.role || '').toLowerCase();
  const isBOD = role === 'bod' || role === 'founder';
  const isAdmin = hasAccess(6);
  const isPowerUser = isAdmin || isBOD || hasAccess(4);

  main.innerHTML = `<div class="page-title"><span>✅ Approval Center</span></div>
    <div class="tabs mb-16" id="approvalTabs">
      <div class="tab ${tab === 'pending' ? 'active' : ''}" onclick="renderApprovalCenter('pending')">⏳ Menunggu</div>
      <div class="tab ${tab === 'history' ? 'active' : ''}" onclick="renderApprovalCenter('history')">📜 Riwayat</div>
    </div>
    <div class="card" id="approvalList">
      <div class="p-20 text-center"><div class="spinner mb-12"></div><p>Memuat data approval...</p></div>
    </div>`;

  try {
      const myName = (currentUser.nama || '').toLowerCase().trim();
      const isGM = (currentUser.posisi || '').toLowerCase().includes('general manager') || (currentUser.posisi || '').toLowerCase() === 'gm';

      const collections = ['hrd_cuti', 'hrd_overtime', 'hrd_reimbursement', 'hrd_kasbon', 'hrd_dinas_luar', 'hrd_perjalanan_dinas', 'hrd_reimburse_dinas'];
      const [flowSnap, karySnap, ...colSnaps] = await Promise.all([
          db.collection('hrd_approval_flow').get(),
          db.collection('hrd_karyawan').get(),
          ...collections.map(col => {
              let q = db.collection(col);
              if (tab === 'pending') {
                  return q.where('status', 'in', ['pending', 'step1', 'step2', 'step3']).get().catch(() => db.collection(col).get());
              } else {
                  return q.orderBy('createdAt', 'desc').limit(100).get().catch(() => db.collection(col).get());
              }
          })
      ]);

      const flows = [];
      flowSnap.forEach(d => flows.push({ id: d.id, ...d.data() }));

      const allKaryawan = [];
      const deptMap = {};
      karySnap.forEach(d => {
          const k = d.data();
          const n = (k.nama || '').toLowerCase().trim();
          allKaryawan.push({ id: d.id, ...k });
          deptMap[n] = (k.departemen || '').trim();
      });

      const mySubordinates = getAllSubordinates(currentUser.nama, allKaryawan);

      let items = [];
      colSnaps.forEach((snap, idx) => {
          const colName = collections[idx];
          snap.forEach(d => {
              const data = { id: d.id, collection: colName, ...d.data() };
              const n = (data.nama || '').toLowerCase().trim();
              data._dept = (data.departemen || deptMap[n] || '').toLowerCase().trim();
              items.push(data);
          });
