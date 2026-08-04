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
          db.collection('hrd_approval_flow').get().catch(() => ({ forEach: () => {} })),
          db.collection('hrd_karyawan').get().catch(() => ({ forEach: () => {} })),
          ...collections.map(col => {
              let q = db.collection(col);
              if (tab === 'pending') {
                  return q.where('status', 'in', ['pending', 'step1', 'step2', 'step3']).get().catch(() => db.collection(col).get().catch(() => ({ forEach: () => {} })));
              } else {
                  return q.orderBy('createdAt', 'desc').limit(100).get().catch(() => db.collection(col).get().catch(() => ({ forEach: () => {} })));
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
      });

      if (tab === 'history') {
          items = items.filter(x => !['pending', 'step1', 'step2', 'step3'].includes(x.status));
      }

      items.sort((a, b) => (String(b.createdAt || '')).localeCompare(String(a.createdAt || '')));

      let h = '';
      let visibleCount = 0;

      items.forEach(item => {
          try {
              const cat = getApprovalCategory(item.collection, item);
              const flow = flows.find(f => isSameName(f.pengaju, item.nama) && f.jenis === cat && f.steps?.length > 0) ||
                           flows.find(f => isSameName(f.pengaju, item.nama) && f.steps?.length > 0);

              const steps = flow?.steps || [];
              const currentStep = item.approvalStep || 0;
              const currentApprover = (steps[currentStep]?.nama || '').toLowerCase().trim();
              const isExplicitlyMyTurn = isSameName(currentApprover, myName);

              let canSee = false;
              const isOwn = isSameName(item.nama, currentUser.nama);
              const isSubordinate = mySubordinates.includes((item.nama || "").toLowerCase().trim());

              if (isAdmin || isGM) canSee = true;
              else if (tab === 'pending') canSee = isExplicitlyMyTurn;
              else if (tab === 'history') canSee = isOwn || isSubordinate;

              if (!canSee) return;
              visibleCount++;

              const typeLabel = item.collection.replace('hrd_', '').replace(/_/g, ' ').toUpperCase();
              const detail = item.jenis || item.kategori || item.tujuan || '';
              const jumlahStr = item.jumlah ? ` — ${formatCurrency(item.jumlah)}` : '';
              const durasiStr = item.durasi ? ` (${item.durasi} hari)` : '';

              let progressHtml = '';
              if (steps.length) {
                  progressHtml = '<div class="flex gap-4 mt-8" style="flex-wrap:wrap">';
                  steps.forEach((s, i) => {
                      const done = i < currentStep;
                      const active = i === currentStep;
                      const color = done ? '#2e7d32' : active ? 'var(--primary)' : '#ccc';
                      progressHtml += `<span style="font-size:.6rem;padding:2px 6px;border-radius:4px;background:${done ? '#e8f5e9' : active ? '#eee' : '#f5f5f5'};color:${color};border:1px solid ${color}">${done ? '✓ ' : ''}${escHtml(s.nama || '')}</span>`;
                      if (i < steps.length - 1) progressHtml += `<span style="color:#ccc;font-size:.6rem">→</span>`;
                  });
                  progressHtml += '</div>';
              }

              const statusColor = { approved: 'success', rejected: 'danger', pending: 'warning', selesai: 'info' }[item.status] || 'info';
              const statusHtml = tab === 'history' ? `<span class="badge badge-${statusColor}">${(item.status || '').toUpperCase()}</span> ` : '';

              let actionButtons = `<button class="btn btn-xs btn-primary" onclick="viewApprovalDetail('${item.collection}','${item.id}')">👁️</button>`;
              if (tab === 'pending' && (isAdmin || isExplicitlyMyTurn)) {
                  actionButtons += ` <button class="btn btn-xs btn-success" onclick="approveItem('${item.collection}','${item.id}','approved')">✅</button>`;
                  actionButtons += ` <button class="btn btn-xs btn-danger" onclick="approveItem('${item.collection}','${item.id}','rejected')">❌</button>`;
              }

              if (isPowerUser) {
                  const editFuncs = { hrd_cuti: 'editCutiDoc', hrd_overtime: 'editOTDoc', hrd_reimbursement: 'editReimb', hrd_kasbon: 'editKasbonDoc', hrd_dinas_luar: 'editDinasLuar', hrd_perjalanan_dinas: 'editSPPD' };
                  const editFn = editFuncs[item.collection];
                  if (editFn) actionButtons += ` <button class="btn btn-xs btn-warning" onclick="${editFn}('${item.id}')">✏️</button>`;
                  actionButtons += ` <button class="btn btn-xs btn-danger" onclick="hapusDoc('${item.collection}','${item.id}','approval-center')">🗑️</button>`;
              }

              h += `<div style="padding:14px;border-bottom:1px solid var(--border)">
                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
                  <div style="flex:1">
                    <div>
                      ${statusHtml}
                      <span class="badge badge-info" style="font-size:.65rem">${typeLabel}</span>
                      <span class="fw-700">${escHtml(item.nama)}</span>
                      <span class="badge" style="background:#eee;color:#555;font-size:.6rem">${escHtml(item._dept?.toUpperCase() || '-')}</span>
                    </div>
                    <div class="text-sm" style="color:#555;margin-top:4px">${escHtml(detail)}${durasiStr}${jumlahStr}</div>
                    <div class="text-xs" style="color:#999;margin-top:2px">${formatDateTime(item.createdAt)}</div>
                  </div>
                  <div class="flex gap-4">
                    ${actionButtons}
                  </div>
                </div>
                ${progressHtml}
              </div>`;
          } catch (loopErr) { console.error(loopErr); }
      });

      if (!visibleCount)
          h = `<div class="empty-state"><div class="icon">✅</div><p>Tidak ada data ${tab === 'pending' ? 'menunggu approval' : 'riwayat'}</p></div>`;

      document.getElementById('approvalList').innerHTML = h;
  } catch (err) {
      console.error(err);
      document.getElementById('approvalList').innerHTML = `<div class="empty-state"><div class="icon">❌</div><p>Gagal memuat data. ${err.message}</p></div>`;
  }
}

// ── APPROVAL DETAIL HELPERS ────────────────────────────────────
function _buildEmployeeProfile(karyawan, p) {
  let h =
    '<div style="border-left:4px solid var(--primary);background:#f9f9f9;padding:14px 16px;border-radius:0 8px 8px 0;margin-bottom:16px">';
  h += '<div class="fw-700 mb-8" style="font-size:.9rem">👤 Profil Karyawan</div>';
  h += '<div class="grid-2" style="gap:8px;font-size:.85rem">';
  h += `<div><b>Nama:</b> ${escHtml(p.nama || '-')}</div>`;
  if (karyawan) {
    h += `<div><b>Departemen:</b> ${escHtml(karyawan.departemen || '-')}</div>`;
    h += `<div><b>Posisi:</b> ${escHtml(karyawan.posisi || '-')}</div>`;
    h += `<div><b>Grade:</b> ${escHtml(karyawan.gradeJabatan || karyawan.grade || '-')}</div>`;
    h += `<div><b>Masa Kerja:</b> ${hitungMasaKerja(karyawan.tanggalMasuk)}</div>`;
    h += `<div><b>NIP:</b> ${escHtml(karyawan.nip || karyawan.id || '-')}</div>`;
  } else {
    if (p.departemen) h += `<div><b>Departemen:</b> ${escHtml(p.departemen)}</div>`;
    h += `<div><b>Data karyawan:</b> <span style="color:#999">Tidak ditemukan</span></div>`;
  }
  h += '</div></div>';
  return h;
}

async function _buildCutiDetail(p, karyawan) {
  let h =
    '<div style="background:#fff;padding:14px;border-radius:8px;border:1px solid var(--border);border-left:4px solid var(--primary);margin-bottom:16px">';
  h += '<div class="fw-700 mb-8" style="font-size:.88rem">🏖️ Detail Cuti/Izin</div>';
  h += '<div class="grid-2" style="gap:8px;font-size:.85rem">';
  h += `<div><b>Jenis:</b> ${escHtml(p.jenis || '-')}</div>`;
  h += `<div><b>Durasi:</b> ${p.durasi || '-'} hari</div>`;
  h += `<div><b>Mulai:</b> ${formatDate(p.mulai)}</div>`;
  h += `<div><b>Selesai:</b> ${formatDate(p.selesai)}</div>`;
  if (p.keterangan)
    h += `<div style="grid-column:1/-1"><b>Keterangan:</b> ${escHtml(p.keterangan)}</div>`;
  h += '</div>';

  // Attachments display
  if (p.attachments && p.attachments.length > 0) {
      h += '<div class="mt-12"><div class="fw-700 text-xs mb-4">📎 Lampiran / Bukti:</div><div class="flex gap-8" style="flex-wrap:wrap">';
      p.attachments.forEach((file, idx) => {
          const isImg = file.type?.startsWith('image/') || file.data?.startsWith('data:image/');
          if (isImg) {
              h += `<img src="${file.data}" style="width:80px;height:80px;object-fit:cover;border-radius:6px;cursor:pointer;border:1px solid #ddd" onclick="window.open('${file.data}')" title="Klik untuk perbesar">`;
          } else {
              h += `<button class="btn btn-xs btn-outline-primary" onclick="downloadBlob('${file.data}', '${file.name || 'lampiran_' + idx}')">📄 ${escHtml(file.name || 'File ' + (idx + 1))}</button>`;
          }
      });
      h += '</div></div>';
  }

  // Leave quota calculation
  if (karyawan && (p.jenis || '').toLowerCase().includes('cuti tahunan')) {
    try {
      const jatah = hitungJatahCuti(karyawan);
      const cutiSnap = await db.collection('hrd_cuti').where('nama', '==', p.nama).get();
      let terpakai = 0;
      cutiSnap.forEach((d) => {
        const cd = d.data();
        if (cd.jenis === 'Cuti Tahunan' && cd.status === 'approved') terpakai += cd.durasi || 0;
      });
      const sisa = Math.max(0, jatah - terpakai);
      h +=
        '<div style="margin-top:12px;padding:10px;background:#f9f9f9;border-radius:6px;font-size:.83rem">';
      h += `<div class="fw-700 mb-4">📊 Sisa Jatah Cuti Tahunan</div>`;
      h += `<div>Jatah: <b>${jatah}</b> hari | Terpakai: <b>${terpakai}</b> hari | Sisa: <b style="color:${sisa <= 2 ? '#d32f2f' : '#2e7d32'}">${sisa}</b> hari</div>`;
      if (sisa < (p.durasi || 0))
        h += `<div style="color:#d32f2f;margin-top:4px;font-weight:700">⚠️ Pengajuan melebihi sisa cuti!</div>`;
      h += '</div>';
    } catch (e) {
      console.warn('Error loading cuti quota:', e);
    }
  }
  // Holiday overlap check
  try {
    if (p.mulai && p.selesai) {
      const hSnap = await db.collection('hrd_hari_libur').get();
      const holidays = [];
      hSnap.forEach((d) => {
        const hd = d.data();
        if (hd.tanggal) holidays.push(hd);
      });
      const start = new Date(p.mulai),
        end = new Date(p.selesai);
      const overlaps = holidays.filter((hl) => {
        const ht = new Date(hl.tanggal);
        return ht >= start && ht <= end;
      });
      if (overlaps.length) {
        h +=
          '<div style="margin-top:8px;padding:8px;background:#f9f9f9;border-radius:6px;font-size:.82rem">';
        h += `<div class="fw-700">📅 Tanggal bertepatan hari libur (${overlaps.length}):</div>`;
        overlaps.forEach((ol) => {
          h += `<div>• ${formatDate(ol.tanggal)} - ${escHtml(ol.nama || ol.keterangan || '')}</div>`;
        });
        h += '</div>';
      }
    }
  } catch (e) {
    console.warn('Error checking holidays:', e);
  }
  h += '</div>';
  return h;
}

async function _buildOvertimeDetail(p, karyawan) {
  let h =
    '<div style="background:#fff;padding:14px;border-radius:8px;border:1px solid var(--border);border-left:4px solid var(--primary);margin-bottom:16px">';
  h += '<div class="fw-700 mb-8" style="font-size:.88rem">⏰ Detail Lembur</div>';
  h += '<div class="grid-2" style="gap:8px;font-size:.85rem">';
  h += `<div><b>Tanggal:</b> ${formatDate(p.tanggal)}</div>`;
  h += `<div><b>Durasi:</b> ${p.durasi || '-'} jam</div>`;
  h += `<div><b>Jam Mulai:</b> ${p.jamMulai || '-'}</div>`;
  h += `<div><b>Jam Selesai:</b> ${p.jamSelesai || '-'}</div>`;
  if (p.alasan) h += `<div style="grid-column:1/-1"><b>Alasan:</b> ${escHtml(p.alasan)}</div>`;
  h += '</div>';

  // Attachments display
  if (p.attachments && p.attachments.length > 0) {
      h += '<div class="mt-12"><div class="fw-700 text-xs mb-4">📎 Lampiran / Bukti:</div><div class="flex gap-8" style="flex-wrap:wrap">';
      p.attachments.forEach((file, idx) => {
          const isImg = file.type?.startsWith('image/') || file.data?.startsWith('data:image/');
          if (isImg) {
              h += `<img src="${file.data}" style="width:80px;height:80px;object-fit:cover;border-radius:6px;cursor:pointer;border:1px solid #ddd" onclick="window.open('${file.data}')" title="Klik untuk perbesar">`;
          } else {
              h += `<button class="btn btn-xs btn-outline-primary" onclick="downloadBlob('${file.data}', '${file.name || 'lampiran_' + idx}')">📄 ${escHtml(file.name || 'File ' + (idx + 1))}</button>`;
          }
      });
      h += '</div></div>';
  }

  // Monthly overtime total
  try {
    const tgl = p.tanggal || '';
    const monthPrefix = tgl.substring(0, 7); // YYYY-MM
    if (monthPrefix && p.nama) {
      const otSnap = await db.collection('hrd_overtime').where('nama', '==', p.nama).get();
      let totalJam = 0;
      otSnap.forEach((d) => {
        const od = d.data();
        if (od.status === 'approved' && (od.tanggal || '').startsWith(monthPrefix))
          totalJam += parseFloat(od.durasi) || 0;
      });
      h +=
        '<div style="margin-top:12px;padding:10px;background:#f9f9f9;border-radius:6px;font-size:.83rem">';
      h += `<div class="fw-700 mb-4">📊 Total Lembur Bulan Ini (Approved)</div>`;
      h += `<div>Total: <b>${totalJam}</b> jam</div>`;
      h += '</div>';
    }
  } catch (e) {
    console.warn('Error loading monthly OT:', e);
  }
  // Estimated overtime pay
  if (karyawan && karyawan.gajiPokok) {
    const gaji = parseFloat(karyawan.gajiPokok) || 0;
    const hariKerja = 22;
    const gajiPerJam = gaji / (hariKerja * 8);
    const durasi = parseFloat(p.durasi) || 0;
    let lemburNominal = 0;
    if (durasi > 0) {
      lemburNominal += gajiPerJam * 1.5;
      if (durasi > 1) lemburNominal += gajiPerJam * 2 * (durasi - 1);
    }
    h +=
      '<div style="margin-top:8px;padding:10px;background:#f9f9f9;border-radius:6px;font-size:.83rem">';
    h += `<div class="fw-700 mb-4">💰 Estimasi Upah Lembur</div>`;
    h += `<div>Gaji/jam: ${formatCurrency(Math.round(gajiPerJam))} | 1 jam pertama: 1.5x | Jam berikutnya: 2x</div>`;
    h += `<div class="fw-700" style="margin-top:4px">Estimasi: ${formatCurrency(Math.round(lemburNominal))}</div>`;
    h += '</div>';
  }
  h += '</div>';
  return h;
}

async function _buildDinasDetail(p, karyawan) {
  let h =
    '<div style="background:#fff;padding:14px;border-radius:8px;border:1px solid var(--border);border-left:4px solid var(--primary);margin-bottom:16px">';
  h += '<div class="fw-700 mb-8" style="font-size:.88rem;color:var(--primary)">✈️ Detail Dinas Luar</div>';
  h += '<div class="grid-2" style="gap:8px;font-size:.85rem">';
  const tglMulai = p.tanggalMulai || p.tanggal || '';
  const tglSelesai = p.tanggalSelesai || p.tanggal || '';
  h += `<div><b>Tanggal:</b> ${formatDate(tglMulai)}${tglSelesai && tglSelesai !== tglMulai ? ' s/d ' + formatDate(tglSelesai) : ''}</div>`;
  h += `<div><b>Tujuan:</b> ${escHtml(p.tujuan || '-')}</div>`;
  if (p.noSPPD) h += `<div><b>No. SPPD:</b> ${escHtml(p.noSPPD)}</div>`;
  const grade = p.gradeJabatan || (karyawan && (karyawan.gradeJabatan || karyawan.grade)) || '';
  h += `<div><b>Grade:</b> ${escHtml(grade || '-')}</div>`;
  if (p.keperluan)
    h += `<div style="grid-column:1/-1"><b>Keperluan:</b> ${escHtml(p.keperluan)}</div>`;
  // Duration
  let dur = 0;
  if (tglMulai && tglSelesai) {
    dur = Math.max(1, Math.ceil((new Date(tglSelesai) - new Date(tglMulai)) / 86400000) + 1);
    h += `<div><b>Durasi:</b> ${dur} hari</div>`;
  }
  if (p.transportasi) h += `<div><b>Transport:</b> ${escHtml(p.transportasi)}</div>`;
  if (p.akomodasi) h += `<div><b>Akomodasi:</b> ${escHtml(p.akomodasi)}</div>`;
  h += '</div>';

  // --- SYNC WITH LINKED SPPD (Financial Data) ---
  if (p.noSPPD) {
      try {
          const sppdSnap = await db.collection('hrd_perjalanan_dinas').where('noSPPD', '==', p.noSPPD).limit(1).get();
          if (!sppdSnap.empty) {
              const sppd = sppdSnap.docs[0].data();
              h += `<div class="fw-700 mb-8 mt-16" style="font-size:.85rem;color:var(--primary)">💰 Rincian Estimasi Biaya (dari SPPD):</div>
                <div class="grid-2 mb-16" style="background:#f9f9f9;padding:12px;border-radius:8px;font-size:.85rem">
                  <div>Transport: ${formatCurrency(sppd.biayaTransport || 0)}</div>
                  <div>Akomodasi: ${formatCurrency(sppd.biayaAkomodasi || 0)}</div>
                  <div>Makan & Saku: ${formatCurrency(sppd.biayaMakan || 0)}</div>
                  <div>Lain-lain: ${formatCurrency(sppd.biayaLain || 0)}</div>
                  <div class="fw-700" style="grid-column:span 2;border-top:1px solid var(--border);padding-top:8px;margin-top:4px;font-size:.9rem;color:var(--primary)">Total: ${formatCurrency(sppd.totalEstimasi || 0)}</div>
                </div>`;
          }
      } catch (e) {
          console.warn('Sync SPPD failed:', e);
      }
  }

  // Evidence display
  if (p.evidenceURL) {
      const isImg = p.evidenceURL.match(/\.(jpg|jpeg|png|gif|webp)/i);
      h += `<div class="mt-12"><div class="fw-700 text-xs mb-4">📎 Lampiran / Eviden:</div>
        <div class="mt-4">
          ${isImg ? `<img src="${p.evidenceURL}" style="max-width:150px;max-height:150px;object-fit:contain;border-radius:8px;cursor:pointer;border:1px solid #ddd" onclick="window.open('${p.evidenceURL}')">` : `<a href="${p.evidenceURL}" target="_blank" class="btn btn-xs btn-outline-primary">📎 Lihat Dokumen</a>`}
        </div>
      </div>`;
  }

  // Grade-based benefit entitlement
  try {
    if (typeof getGradeConfig === 'function') {
        const gradeConfig = await getGradeConfig(grade);
        if (gradeConfig) {
          const malam = dur > 0 ? Math.max(dur - 1, 0) : 0;
          h +=
            '<div style="margin-top:12px;padding:12px;background:#f9f9f9;border-radius:8px;font-size:.83rem;border-left:4px solid var(--primary)">';
          h += `<div class="fw-700 mb-6">📋 Hak Benefit (${escHtml(gradeConfig.label || resolveGradeKey(grade))})</div>`;
          h += '<div class="grid-2" style="gap:6px">';
          h += `<div>Uang Harian: <b>${formatCurrency(gradeConfig.uangHarian || 0)}</b></div>`;
          h += `<div>Max Transport: <b>${formatCurrency(gradeConfig.maxTransport || 0)}</b></div>`;
          h += `<div>Max Hotel: <b>${formatCurrency(gradeConfig.maxHotel || 0)}</b> (${malam} mlm)</div>`;
          h += `<div>Max Makan: <b>${formatCurrency(gradeConfig.maxMakan || 0)}</b></div>`;
          h += '</div></div>';
        }
    }
  } catch (e) {
    console.warn('Error loading benefit config in approval:', e);
  }
  h += '</div>';
  return h;
}

/**
 * Build detailed SPPD view for approval, matching the portal view.
 */
async function _buildSppdDetail(p, karyawan) {
  const durasi = p.tanggalMulai && p.tanggalSelesai
      ? Math.ceil((new Date(p.tanggalSelesai) - new Date(p.tanggalMulai)) / 86400000 + 1) + ' hari'
      : '-';
  const durasiFull = p.tanggalMulai && p.tanggalSelesai
      ? Math.ceil((new Date(p.tanggalSelesai) - new Date(p.tanggalMulai)) / 86400000 + 1)
      : 0;

  const sppdGrade = p.gradeJabatan || (karyawan && (karyawan.gradeJabatan || karyawan.grade)) || 'STAFF';
  let gradeBenefitHtml = '';

  if (durasiFull > 0 && typeof getGradeConfig === 'function') {
    const cfg = await getGradeConfig(sppdGrade);
    const malam = Math.max(durasiFull - 1, 0);
    const maxTransport = cfg.maxTransport;
    const maxAkomodasi = cfg.maxHotel * malam;
    const maxMakan = (cfg.maxMakan + cfg.uangSaku) * durasiFull;

    const transportStatus = (p.biayaTransport || 0) <= maxTransport ? 'color:var(--success)' : 'color:var(--danger)';
    const akomodasiStatus = malam > 0 && (p.biayaAkomodasi || 0) <= maxAkomodasi ? 'color:var(--success)' : (malam === 0 ? 'color:var(--success)' : 'color:var(--danger)');
    const makanStatus = (p.biayaMakan || 0) <= maxMakan ? 'color:var(--success)' : 'color:var(--danger)';

    gradeBenefitHtml = `<div class="mb-16" style="background:#f9f9f9;padding:12px;border-radius:8px;border-left:4px solid var(--primary)">
      <div class="fw-700 text-sm mb-8">🎯 Benefit Grade: <span class="badge badge-info">${escHtml(sppdGrade)}</span> (${escHtml(cfg.label)})</div>
      <div class="text-sm" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px">
        <div>Transport</div><div>Diajukan: ${formatCurrency(p.biayaTransport || 0)}</div><div style="${transportStatus}">Max: ${formatCurrency(maxTransport)}</div>
        <div>Akomodasi</div><div>Diajukan: ${formatCurrency(p.biayaAkomodasi || 0)}</div><div style="${akomodasiStatus}">Max: ${formatCurrency(maxAkomodasi)} (${malam} mlm)</div>
        <div>Makan+Saku</div><div>Diajukan: ${formatCurrency(p.biayaMakan || 0)}</div><div style="${makanStatus}">Max: ${formatCurrency(maxMakan)} (${durasiFull} hr)</div>
      </div>
    </div>`;
  }

  let h = `<div style="background:#fff;padding:16px;border-radius:8px;border:1px solid var(--border);border-left:4px solid var(--primary);margin-bottom:16px">`;
  h += `<div class="fw-700 mb-12" style="font-size:1rem;color:var(--primary)">✈️ Detail Perjalanan Dinas (SPPD)</div>`;

  h += `<div class="grid-2 mb-16" style="font-size:.85rem;gap:10px">
    <div><b>No. SPPD:</b> ${escHtml(p.noSPPD || '-')}</div>
    <div><b>Tujuan:</b> ${escHtml(p.tujuan || '-')}</div>
    <div><b>Klien/Instansi:</b> ${escHtml(p.klien || '-')}</div>
    <div><b>Tanggal:</b> ${formatDate(p.tanggalMulai)} - ${formatDate(p.tanggalSelesai)}</div>
    <div><b>Durasi:</b> ${durasi}</div>
    <div><b>Transport:</b> ${escHtml(p.transportasi || '-')}</div>
    <div><b>Akomodasi:</b> ${escHtml(p.akomodasi || '-')}</div>
  </div>`;

  if (p.keperluan) h += `<div class="mb-16"><b>Keperluan:</b><div class="text-sm mt-4" style="background:#f9f9f9;padding:10px;border-radius:6px">${escHtml(p.keperluan)}</div></div>`;

  h += gradeBenefitHtml;

  h += `<div class="fw-700 mb-8" style="font-size:.85rem">💰 Estimasi Biaya:</div>
    <div class="grid-2 mb-16" style="background:#f9f9f9;padding:12px;border-radius:8px;font-size:.85rem">
      <div>Transport: ${formatCurrency(p.biayaTransport || 0)}</div>
      <div>Akomodasi: ${formatCurrency(p.biayaAkomodasi || 0)}</div>
      <div>Makan & Saku: ${formatCurrency(p.biayaMakan || 0)}</div>
      <div>Lain-lain: ${formatCurrency(p.biayaLain || 0)}</div>
      <div class="fw-700" style="grid-column:span 2;border-top:1px solid var(--border);padding-top:8px;margin-top:4px;font-size:.9rem;color:var(--primary)">Total: ${formatCurrency(p.totalEstimasi || 0)}</div>
    </div>`;

  if (p.catatan) h += `<div class="mb-16"><b>Catatan:</b><div class="text-sm mt-4 italic">${escHtml(p.catatan)}</div></div>`;

  if (p.evidenceURL) {
      const isImg = p.evidenceURL.match(/\.(jpg|jpeg|png|gif|webp)/i);
      h += `<div class="mb-16"><b>Lampiran / Eviden:</b><div class="mt-4">${isImg ? `<img src="${p.evidenceURL}" style="max-width:100%;border-radius:8px;cursor:pointer;border:1px solid #ddd" onclick="window.open('${p.evidenceURL}')">` : `<a href="${p.evidenceURL}" target="_blank" class="btn btn-xs btn-outline-primary">📎 Lihat Dokumen</a>`}</div></div>`;
  }

  h += `</div>`;
  return h;
}

/**
 * Build detailed Reimbursement Dinas view for approval.
 */
async function _buildReimbDinasDetail(p) {
  const selisih = (p.totalAktual || 0) - (p.uangMuka || 0);
  const selisihLabel = selisih > 0 ? `Kurang Bayar: ${formatCurrency(selisih)} (perusahaan bayar ke karyawan)` : `Kelebihan: ${formatCurrency(Math.abs(selisih))} (karyawan kembalikan ke perusahaan)`;
  const selisihColor = selisih > 0 ? 'var(--danger)' : 'var(--success)';

  let h = `<div style="background:#fff;padding:16px;border-radius:8px;border:1px solid var(--border);border-left:4px solid var(--primary);margin-bottom:16px">`;
  h += `<div class="fw-700 mb-12" style="font-size:1rem;color:var(--primary)">🧾 Detail Reimbursement Dinas</div>`;

  h += `<div class="grid-2 mb-16" style="font-size:.85rem">
    <div><b>No. SPPD:</b> ${escHtml(p.noSPPD)}</div>
    <div><b>Tanggal:</b> ${formatDate(p.createdAt)}</div>
  </div>`;

  h += `<div class="mb-16" style="background:#f9f9f9;padding:14px;border-radius:8px;font-size:.85rem">
    <div class="fw-700 mb-8">💰 Rincian Biaya Aktual:</div>
    <div class="grid-2" style="gap:6px">
      <div>Transport: ${formatCurrency(p.biayaTransport || 0)}</div>
      <div>Akomodasi: ${formatCurrency(p.biayaAkomodasi || 0)}</div>
      <div>Makan & Saku: ${formatCurrency(p.biayaMakan || 0)}</div>
      <div>Lain-lain: ${formatCurrency(p.biayaLain || 0)}</div>
    </div>
    <div style="border-top:1px solid var(--border);margin-top:10px;padding-top:10px;display:grid;gap:4px">
      <div class="fw-700">Total Aktual: ${formatCurrency(p.totalAktual || 0)}</div>
      <div>Uang Muka: ${formatCurrency(p.uangMuka || 0)}</div>
      <div class="fw-700 mt-4" style="color:${selisihColor}">${selisihLabel}</div>
    </div>
  </div>`;

  if (p.keterangan) h += `<div class="mb-16"><b>Keterangan Bukti:</b><div class="text-sm mt-4">${escHtml(p.keterangan)}</div></div>`;

  if (p.evidenceURL) {
      const isImg = p.evidenceURL.match(/\.(jpg|jpeg|png|gif|webp)/i);
      h += `<div class="mb-16"><b>Lampiran / Bukti:</b><div class="mt-4">${isImg ? `<img src="${p.evidenceURL}" style="max-width:100%;border-radius:8px;cursor:pointer;border:1px solid #ddd" onclick="window.open('${p.evidenceURL}')">` : `<a href="${p.evidenceURL}" target="_blank" class="btn btn-xs btn-outline-primary">📎 Lihat Dokumen</a>`}</div></div>`;
  }

  h += `</div>`;
  return h;
}

async function _buildReimbDetail(p) {
  let h =
    '<div style="background:#fff;padding:14px;border-radius:8px;border:1px solid var(--border);border-left:4px solid var(--primary);margin-bottom:16px">';
  h += '<div class="fw-700 mb-8" style="font-size:.88rem">🧾 Detail Reimbursement</div>';
  h += '<div class="grid-2" style="gap:8px;font-size:.85rem">';
  h += `<div><b>Kategori:</b> ${escHtml(p.kategori || '-')}</div>`;
  h += `<div><b>Jumlah:</b> <b class="color-primary">${formatCurrency(parseFloat(p.jumlah) || 0)}</b></div>`;
  if (p.keterangan)
    h += `<div style="grid-column:1/-1"><b>Keterangan:</b> ${escHtml(p.keterangan)}</div>`;
  h += '</div>';

  // Evidence display
  if (p.evidenceURL) {
      const isImg = p.evidenceURL.match(/\.(jpg|jpeg|png|gif|webp)/i);
      h += `<div class="mt-12"><div class="fw-700 text-xs mb-4">📎 Lampiran / Bukti:</div>
        <div class="mt-4">
          ${isImg ? `<img src="${p.evidenceURL}" style="max-width:150px;max-height:150px;object-fit:contain;border-radius:8px;cursor:pointer;border:1px solid #ddd" onclick="window.open('${p.evidenceURL}')">` : `<a href="${p.evidenceURL}" target="_blank" class="btn btn-xs btn-outline-primary">📎 Lihat Dokumen</a>`}
        </div>
      </div>`;
  }

  // Claim history
  try {
    if (p.nama) {
      const rSnap = await db.collection('hrd_reimbursement').where('nama', '==', p.nama).get();
      let totalBulan = 0,
        totalTahun = 0;
      const now = new Date();
      const bulanIni = now.toISOString().substring(0, 7);
      const tahunIni = now.getFullYear().toString();
      const byCategory = {};
      rSnap.forEach((d) => {
        const rd = d.data();
        if (rd.status !== 'approved') return;
        const amt = parseFloat(rd.jumlah) || 0;
        const cr = rd.createdAt || '';
        if (cr.startsWith(bulanIni)) totalBulan += amt;
        if (cr.startsWith(tahunIni)) totalTahun += amt;
        const cat = rd.kategori || 'Lainnya';
        byCategory[cat] = (byCategory[cat] || 0) + amt;
      });
      h +=
        '<div style="margin-top:12px;padding:10px;background:#f9f9f9;border-radius:6px;font-size:.83rem">';
      h += `<div class="fw-700 mb-4">📊 Riwayat Klaim (Approved)</div>`;
      h += `<div>Bulan ini: <b>${formatCurrency(totalBulan)}</b> | Tahun ini: <b>${formatCurrency(totalTahun)}</b></div>`;
      const cats = Object.keys(byCategory);
      if (cats.length) {
        h += '<div style="margin-top:6px"><b>Per Kategori (tahun ini):</b></div>';
        cats.forEach((cat) => {
          h += `<div>• ${escHtml(cat)}: ${formatCurrency(byCategory[cat])}</div>`;
        });
      }
      h += '</div>';
    }
  } catch (e) {
    console.warn('Error loading reimb history:', e);
  }
  h += '</div>';
  return h;
}

async function _buildKasbonDetail(p, karyawan) {
  const angsuran = p.angsuran || Math.ceil((parseFloat(p.jumlah) || 0) / (parseInt(p.cicilan) || 1));
  const sisa = Math.max(0, (parseFloat(p.jumlah) || 0) - (parseFloat(p.sudahBayar) || 0));

  let h =
    '<div style="background:#fff;padding:14px;border-radius:8px;border:1px solid var(--border);border-left:4px solid var(--primary);margin-bottom:16px">';
  h += '<div class="fw-700 mb-8" style="font-size:.88rem">💳 Detail Kasbon/Pinjaman</div>';
  h += '<div class="grid-2" style="gap:8px;font-size:.85rem">';
  h += `<div><b>Jenis:</b> ${escHtml(p.jenis || '-')}</div>`;
  h += `<div><b>Jumlah:</b> <b class="color-primary">${formatCurrency(parseFloat(p.jumlah) || 0)}</b></div>`;
  h += `<div><b>Cicilan:</b> ${p.cicilan || '-'}x</div>`;
  h += `<div><b>Angsuran/bulan:</b> <b class="color-danger">${formatCurrency(parseFloat(angsuran) || 0)}</b></div>`;
  if (p.sudahBayar) h += `<div><b>Sudah Bayar:</b> ${formatCurrency(p.sudahBayar)}</div>`;
  if (sisa > 0) h += `<div><b>Sisa:</b> <b class="color-primary">${formatCurrency(sisa)}</b></div>`;

  if (p.keterangan)
    h += `<div style="grid-column:1/-1"><b>Keterangan:</b> ${escHtml(p.keterangan)}</div>`;
  h += '</div>';

  // Evidence display
  if (p.evidenceURL) {
      const isImg = p.evidenceURL.match(/\.(jpg|jpeg|png|gif|webp)/i);
      h += `<div class="mt-12"><div class="fw-700 text-xs mb-4">📎 Lampiran / Bukti:</div>
        <div class="mt-4">
          ${isImg ? `<img src="${p.evidenceURL}" style="max-width:150px;max-height:150px;object-fit:contain;border-radius:8px;cursor:pointer;border:1px solid #ddd" onclick="window.open('${p.evidenceURL}')">` : `<a href="${p.evidenceURL}" target="_blank" class="btn btn-xs btn-outline-primary">📎 Lihat Dokumen</a>`}
        </div>
      </div>`;
  }

  // Existing active loans
  try {
    if (p.nama) {
      const kSnap = await db.collection('hrd_kasbon').where('nama', '==', p.nama).get();
      let totalOutstanding = 0;
      let activeCount = 0;
      kSnap.forEach((d) => {
        const kd = d.data();
        if (kd.status !== 'approved') return;
        const jumlah = parseFloat(kd.jumlah) || 0;
        const sudahBayar = parseFloat(kd.sudahBayar) || 0;
        const sisa = jumlah - sudahBayar;
        if (sisa > 0) {
          totalOutstanding += sisa;
          activeCount++;
        }
      });
      h +=
        '<div style="margin-top:12px;padding:10px;background:#f9f9f9;border-radius:6px;font-size:.83rem">';
      h += `<div class="fw-700 mb-4">📊 Pinjaman Aktif</div>`;
      h += `<div>Jumlah pinjaman aktif: <b>${activeCount}</b> | Total sisa: <b>${formatCurrency(totalOutstanding)}</b></div>`;
      // Loan-to-salary ratio
      if (karyawan && karyawan.gajiPokok) {
        const gaji = parseFloat(karyawan.gajiPokok) || 0;
        const pinjBaru = parseFloat(p.jumlah) || 0;
        const ratio = gaji > 0 ? Math.round((pinjBaru / gaji) * 100) : 0;
        h += `<div style="margin-top:6px">Rasio pinjaman/gaji: <b style="color:${ratio > 50 ? '#d32f2f' : '#2e7d32'}">${ratio}%</b>${ratio > 50 ? ' ⚠️ Melebihi 50%' : ''}</div>`;
      }
      h += '</div>';
    }
  } catch (e) {
    console.warn('Error loading kasbon history:', e);
  }
  h += '</div>';
  return h;
}

function _buildGenericDetail(p) {
  let h =
    '<div style="background:#fff;padding:14px;border-radius:8px;border:1px solid var(--border);border-left:4px solid var(--primary);margin-bottom:16px">';
  h += '<div class="fw-700 mb-8" style="font-size:.88rem">📄 Detail Pengajuan</div>';
  h += '<div class="grid-2" style="gap:8px;font-size:.85rem">';
  if (p.jenis) h += `<div><b>Jenis:</b> ${escHtml(p.jenis)}</div>`;
  if (p.kategori) h += `<div><b>Kategori:</b> ${escHtml(p.kategori)}</div>`;
  if (p.tanggal) h += `<div><b>Tanggal:</b> ${formatDate(p.tanggal)}</div>`;
  if (p.mulai) h += `<div><b>Mulai:</b> ${formatDate(p.mulai)}</div>`;
  if (p.selesai) h += `<div><b>Selesai:</b> ${formatDate(p.selesai)}</div>`;
  if (p.durasi) h += `<div><b>Durasi:</b> ${p.durasi}</div>`;
  if (p.jumlah) h += `<div><b>Jumlah:</b> ${formatCurrency(parseFloat(p.jumlah) || 0)}</div>`;
  if (p.tujuan) h += `<div><b>Tujuan:</b> ${escHtml(p.tujuan)}</div>`;
  if (p.keterangan)
    h += `<div style="grid-column:1/-1"><b>Keterangan:</b> ${escHtml(p.keterangan)}</div>`;
  if (p.alasan) h += `<div style="grid-column:1/-1"><b>Alasan:</b> ${escHtml(p.alasan)}</div>`;
  if (p.keperluan)
    h += `<div style="grid-column:1/-1"><b>Keperluan:</b> ${escHtml(p.keperluan)}</div>`;
  h += '</div></div>';
  return h;
}

function _buildApprovalTimeline(p) {
  if (!p.approvalHistory || !p.approvalHistory.length) return '';
  let h =
    '<div style="margin-bottom:16px"><div class="fw-700 mb-8" style="font-size:.88rem">📋 Riwayat Approval</div>';
  h += '<div style="padding-left:16px;border-left:2px solid #e0e0e0">';
  p.approvalHistory.forEach(function (entry, i) {
    const isLast = i === p.approvalHistory.length - 1;
    const color =
      entry.action === 'approved' ? '#2e7d32' : entry.action === 'rejected' ? '#d32f2f' : '#ff9800';
    h += `<div style="position:relative;padding:8px 0 12px 16px;${isLast ? '' : 'border-bottom:none'}">`;
    h += `<div style="position:absolute;left:-9px;top:12px;width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 0 0 2px ${color}"></div>`;
    h += `<div style="font-size:.83rem"><span class="fw-700" style="color:${color}">${entry.action === 'approved' ? '✅ Disetujui' : '❌ Ditolak'}</span> oleh <b>${escHtml(entry.nama || '')}</b> <span style="color:#666">(${escHtml(entry.role || '')})</span></div>`;
    h += `<div style="font-size:.75rem;color:#999;margin-top:2px">${formatDateTime(entry.at)}</div>`;
    if (entry.catatan)
      h += `<div style="font-size:.8rem;color:#555;margin-top:4px;padding:4px 8px;background:#f5f5f5;border-radius:4px">💬 ${escHtml(entry.catatan)}</div>`;
    h += '</div>';
  });
  h += '</div></div>';
  return h;
}

function _buildApprovalActions(col, id) {
  if (!hasAccess(3))
    return '<div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border)"><p style="color:var(--text-secondary);font-size:.85rem">⏳ Menunggu approval</p></div>';
  let h = '<div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border)">';
  h +=
    '<div class="form-group"><label class="fw-700" style="font-size:.85rem">💬 Catatan (opsional)</label>';
  h +=
    '<textarea class="form-control" id="approvalCatatan" rows="2" placeholder="Tambahkan catatan untuk pemohon..." style="font-size:.85rem"></textarea></div>';
  h += '<div class="flex gap-8 mt-8">';
  h += `<button class="btn btn-success" onclick="_doApprovalAction('${col}','${id}','approved')">✅ Approve</button>`;
  h += `<button class="btn btn-danger" onclick="_doApprovalAction('${col}','${id}','rejected')">❌ Reject</button>`;
  h += '</div></div>';
  return h;
}

function _doApprovalAction(col, id, status) {
  const el = document.getElementById('approvalCatatan');
  const catatan = el ? el.value.trim() : '';
  approveItem(col, id, status, catatan);
}

async function viewApprovalDetail(col, id) {
  try {
    const d = await db.collection(col).doc(id).get();
    const p = d.data();
    const type = col.replace('hrd_', '').replace('_', ' ').toUpperCase();
    // Fetch employee data
    let karyawan = null;
    try {
      const kSnap = await db.collection('hrd_karyawan').where('nama', '==', p.nama).limit(1).get();
      if (!kSnap.empty) {
        const kDoc = kSnap.docs[0];
        karyawan = { id: kDoc.id, ...kDoc.data() };
      }
    } catch (e) {
      console.warn('Error fetching karyawan:', e);
    }
    let html = `<div class="modal-title">📋 Detail Pengajuan - ${type}</div>`;
    html += `<div style="max-height:70vh;overflow-y:auto;padding-right:4px">`;
    // Employee profile
    html += _buildEmployeeProfile(karyawan, p);
    // Status badge
    html += `<div style="margin-bottom:12px"><b>Status:</b> <span class="badge badge-${p.status === 'approved' ? 'success' : p.status === 'rejected' ? 'danger' : 'warning'}">${escHtml(p.status || 'pending')}</span> | <b>Diajukan:</b> ${formatDateTime(p.createdAt)}</div>`;
    // Type-specific details
    if (col === 'hrd_cuti') html += await _buildCutiDetail(p, karyawan);
    else if (col === 'hrd_overtime') html += await _buildOvertimeDetail(p, karyawan);
    else if (col === 'hrd_dinas_luar') html += await _buildDinasDetail(p, karyawan);
    else if (col === 'hrd_perjalanan_dinas') html += await _buildSppdDetail(p, karyawan);
    else if (col === 'hrd_reimbursement') html += await _buildReimbDetail(p);
    else if (col === 'hrd_reimburse_dinas') html += await _buildReimbDinasDetail(p);
    else if (col === 'hrd_kasbon') html += await _buildKasbonDetail(p, karyawan);
    else html += _buildGenericDetail(p);
    // Approval timeline
    html += _buildApprovalTimeline(p);
    html += '</div>';
    // Action buttons with catatan
    html += _buildApprovalActions(col, id);
    openModal(html, true);
  } catch (e) {
    console.error('viewApprovalDetail error:', e);
    toast('Gagal memuat detail', 'error');
  }
}

async function approveItem(col, id, status, catatan) {
  const doc = await db.collection(col).doc(id).get();
  if (!doc.exists) return toast('Data tidak ditemukan', 'warning');
  const data = doc.data();
  const currentStep = data.approvalStep || 0;
  const history = data.approvalHistory || [];
  const entry = {
    nama: currentUser.nama,
    role: currentUser.role,
    action: status,
    at: new Date().toISOString(),
  };
  if (catatan) entry.catatan = catatan;
  history.push(entry);

  if (status === 'rejected') {
    await db.collection(col).doc(id).update({
      status: 'rejected',
      approvedAt: new Date().toISOString(),
      approvalHistory: history,
      rejectedBy: currentUser.nama,
      rejectionCatatan: catatan || ''
    });

    // Special Logic: Propagate status to linked SPPD record if hrd_dinas_luar
    if (col === 'hrd_dinas_luar') {
        try {
            const linkSnap = await db.collection('hrd_perjalanan_dinas').where('dinasLuarId', '==', id).get();
            linkSnap.forEach((d) =>
              d.ref.update({
                status: 'rejected',
                approvedBy: currentUser.nama,
                approvedAt: new Date().toISOString(),
              })
            );
        } catch (err) {}
    }

    if (data.userId)
      await sendNotification(
        data.userId,
        '❌ Ditolak',
        `Pengajuan ${data.jenis || col.replace('hrd_', '')} ditolak oleh ${currentUser.nama}`
      );
  } else {
    // Robust flow lookup: pick the flow for this specific pengaju and CATEGORY
    let steps = data.approvalFlow || [];

    if (steps.length === 0) {
        const flowSnap = await db.collection('hrd_approval_flow').get();
        const cat = getApprovalCategory(col, data);

        const matchingFlows = [];
        flowSnap.forEach((d) => {
          const f = d.data();
          if (isSameName(f.pengaju, data.nama)) {
              matchingFlows.push(f);
          }
        });

        // Try to find match for Category, fallback to longest flow
        const validFlow = matchingFlows.find(f => f.jenis === cat) ||
                          matchingFlows.sort((a, b) => (b.steps?.length || 0) - (a.steps?.length || 0))[0];

        if (validFlow) steps = validFlow.steps || [];
    }

    const nextStep = currentStep + 1;
    if (nextStep < steps.length) {
      await db
        .collection(col)
        .doc(id)
        .update({
          status: `step${nextStep}`,
          approvalStep: nextStep,
          approvalHistory: history,
          lastApprovedBy: currentUser.nama,
        });
      const nextApprover = steps[nextStep];
      if (nextApprover?.nama) {
        const uSnap = await db
          .collection('hrd_users')
          .get();

        let targetUserId = '';
        uSnap.forEach(uDoc => {
            if (isSameName(uDoc.data().nama, nextApprover.nama)) targetUserId = uDoc.id;
        });

        if (targetUserId)
          await sendNotification(
            targetUserId,
            '📋 Perlu Approval',
            `${data.nama}: ${data.jenis || col.replace('hrd_', '')} — disetujui ${currentUser.nama}, menunggu Anda`
          );
      }
      if (data.userId)
        await sendNotification(
          data.userId,
          '⏳ Proses',
          `Disetujui ${currentUser.nama}, menunggu ${nextApprover?.nama || 'selanjutnya'}`
        );
    } else {
      await db.collection(col).doc(id).update({
        status: 'approved',
        approvedBy: currentUser.nama,
        approvedAt: new Date().toISOString(),
        approvalStep: nextStep,
        approvalHistory: history,
      });

      // Special Logic: Propagate status to linked SPPD record if hrd_dinas_luar
      if (col === 'hrd_dinas_luar') {
          try {
              const linkSnap = await db.collection('hrd_perjalanan_dinas').where('dinasLuarId', '==', id).get();
              linkSnap.forEach((d) =>
                d.ref.update({
                  status: 'approved',
                  approvedBy: currentUser.nama,
                  approvedAt: new Date().toISOString(),
                })
              );
          } catch (err) {}
      }

      if (data.userId)
        await sendNotification(
          data.userId,
          '✅ Disetujui (Final)',
          `Pengajuan ${data.jenis || col.replace('hrd_', '')} DISETUJUI oleh ${currentUser.nama}`
        );

      // Automatic Payroll Sync Trigger (Final Approval)
      const relevantCollections = ['hrd_cuti', 'hrd_overtime', 'hrd_reimbursement', 'hrd_insentif', 'hrd_kasbon'];
      if (relevantCollections.includes(col)) {
          const nama = data.nama;
          const tanggal = data.mulai || data.tanggal || data.createdAt;
          const periode = (tanggal || "").slice(0, 7); // yyyy-mm
          if (nama && periode && typeof syncSinglePayrollData === 'function') {
              console.log(`[SYNC] Triggering background payroll sync for ${nama} in ${periode}`);
              syncSinglePayrollData(nama, periode);
          }
      }
    }
  }
  closeModalDirect();
  toast(status === 'approved' ? 'Disetujui' : 'Ditolak', 'success');
  invalidateApprovalFlowCache();

  // Smart Refresh based on context
  if (typeof currentPage !== 'undefined') {
    if (currentPage === 'approval-center') {
      renderApprovalCenter();
    } else if (currentPage === 'absensi') {
      if (col === 'hrd_cuti') renderCuti();
      else if (col === 'hrd_overtime') renderOvertime();
      else if (col === 'hrd_perjalanan_dinas' || col === 'hrd_dinas_luar') {
          if (typeof loadDinasTab === 'function') loadDinasTab('pengajuan');
          else navigateTo('absensi');
      }
    } else {
       const refreshFunc = { 'hrd_cuti': 'renderCuti', 'hrd_overtime': 'renderOvertime' }[col];
       if (refreshFunc && typeof window[refreshFunc] === 'function') {
           window[refreshFunc]();
       } else {
           navigateTo(currentPage);
       }
    }
  }
}

function invalidateApprovalFlowCache() {}

// ── MISC / OTHER ──────────────────────────────────────────────
async function renderAkun() {
  const main = document.getElementById('mainContent');
  main.innerHTML = `<div class="page-title"><span>👤 Manajemen Akun</span><button class="btn btn-primary btn-sm" onclick="modalUser()">+ User Baru</button></div><div class="card"><div class="table-wrap"><table><thead><tr><th>Nama</th><th>Username</th><th>Role</th><th>Departemen</th><th>Status</th><th>Aksi</th></tr></thead><tbody id="tblUsers"></tbody></table></div></div>`;
  const snap = await db.collection('hrd_users').get();
  let h = '';
  snap.forEach((d) => {
    const p = d.data();
    const status = p.status === 'nonaktif' ? '<span class="badge badge-danger">Nonaktif</span>' : '<span class="badge badge-success">Aktif</span>';
    h += `<tr><td class="fw-700">${escHtml(p.nama)}</td><td>${escHtml(p.username)}</td><td>${escHtml(p.role)}</td><td>${escHtml(p.departemen || '-')}</td><td>${status}</td><td><button class="btn btn-xs btn-info" onclick="modalUser('${d.id}')">✏️</button> <button class="btn btn-xs btn-danger" onclick="hapusDoc('hrd_users','${d.id}','akun')">🗑️</button></td></tr>`;
  });
  document.getElementById('tblUsers').innerHTML = h;
}

function modalUser(id) {
  if (id) db.collection('hrd_users').doc(id).get().then((d) => showUserForm(id, d.data()));
  else showUserForm(null, {});
}

async function showUserForm(id, p) {
  // Get all active karyawan for linking
  const karySnap = await db.collection('hrd_karyawan').where('status', '==', 'aktif').get();
  let karyOpts = '<option value="">-- Pilih Karyawan untuk Link Data --</option>';
  karySnap.forEach(d => {
      const k = d.data();
      const selected = p.linkedKaryawan === d.id ? 'selected' : '';
      karyOpts += `<option value="${d.id}" ${selected} data-nama="${escHtml(k.nama)}" data-nip="${escHtml(k.nip || d.id)}">${escHtml(k.nama)} (${escHtml(k.nip || 'No NIP')})</option>`;
  });

  openModal(
    `<div class="modal-title">${id ? 'Edit' : 'Tambah'} Akun Pengguna</div>
    <div class="form-group"><label>Nama Lengkap</label><input class="form-control" id="uNama" value="${escHtml(p.nama || '')}"></div>
    <div class="form-group"><label>Username (NIP)</label><input class="form-control" id="uUser" value="${escHtml(p.username || '')}" placeholder="Gunakan NIP"></div>
    <div class="form-group"><label>Password</label><input class="form-control" type="password" id="uPass" value="${escHtml(p.password || '')}"></div>
    <div class="grid-2">
      <div class="form-group"><label>Role Access</label><select class="form-control" id="uRole">
        <option value="staff" ${p.role === 'staff' ? 'selected' : ''}>Staff</option>
        <option value="leader" ${p.role === 'leader' ? 'selected' : ''}>Leader</option>
        <option value="manager" ${p.role === 'manager' ? 'selected' : ''}>Manager</option>
        <option value="head" ${p.role === 'head' ? 'selected' : ''}>Head of Dept</option>
        <option value="bod" ${p.role === 'bod' ? 'selected' : ''}>BOD / Director</option>
        <option value="admin" ${p.role === 'admin' ? 'selected' : ''}>System Admin</option>
      </select></div>
      <div class="form-group"><label>Status Akun</label><select class="form-control" id="uStatus">
        <option value="aktif" ${p.status === 'aktif' ? 'selected' : ''}>Aktif</option>
        <option value="nonaktif" ${p.status === 'nonaktif' ? 'selected' : ''}>Nonaktif</option>
      </select></div>
    </div>
    <div class="form-group"><label>Departemen</label><input class="form-control" id="uDept" value="${escHtml(p.departemen || '')}" placeholder="Contoh: ACADEMIC, OFFICE, dll"></div>

    <div class="form-group" style="background:#f9f9f9;padding:12px;border-radius:8px;border-left:4px solid var(--primary)">
        <label style="color:var(--primary)">🔗 Sambungkan ke Data Karyawan</label>
        <input class="form-control mb-8" id="akLinkedSearch" placeholder="🔍 Ketik nama untuk mencari..." oninput="filterLinkedKary()">
        <select class="form-control" id="akLinkedKary" size="10" style="height:auto;max-height:250px">${karyOpts}</select>
        <div class="text-xs mt-8" style="color:#666">Hanya karyawan aktif. Ketik nama untuk filter, lalu pilih dari daftar.</div>
    </div>

    <button class="btn btn-primary" onclick="simpanUser('${id || ''}')">Simpan Akun</button>`
  );
}

function filterLinkedKary() {
    const q = document.getElementById('akLinkedSearch').value.toLowerCase();
    const sel = document.getElementById('akLinkedKary');
    for (let opt of sel.options) {
        const txt = opt.text.toLowerCase();
        opt.style.display = txt.includes(q) || opt.value === "" ? "" : "none";
    }
}

async function simpanUser(id) {
  const nama = document.getElementById('uNama').value;
  const newUsername = document.getElementById('uUser').value;
  const password = document.getElementById('uPass').value;
  const role = document.getElementById('uRole').value;
  const departemen = document.getElementById('uDept').value;
  const status = document.getElementById('uStatus').value;

  const selKary = document.getElementById('akLinkedKary');
  const linkedKaryawan = selKary.value;
  const opt = selKary.options[selKary.selectedIndex];
  const nipKaryawan = opt ? opt.dataset.nip : '';

  if (!nama || !newUsername || !password) return toast('Lengkapi data', 'warning');

  const data = {
    nama,
    username: newUsername,
    password,
    role,
    departemen,
    status,
    linkedKaryawan,
    updatedAt: new Date().toISOString(),
  };
  if (nipKaryawan) data.nip = nipKaryawan;

  try {
    if (id) {
      await db.collection('hrd_users').doc(id).update(data);
    } else {
      await db
        .collection('hrd_users')
        .doc(newUsername)
        .set({ ...data, nip: data.nip || newUsername, createdAt: new Date().toISOString() });
    }
    closeModalDirect();
    toast('Akun disimpan & disinkronkan', 'success');
    renderAkun();
  } catch (e) {
    console.error(e);
    toast('Gagal: ' + (e.message || e), 'error');
  }
}

async function renderBroadcast() {
    const main = document.getElementById('mainContent');
    main.innerHTML = `<div class="page-title"><span>📡 Global Broadcast</span><button class="btn btn-primary btn-sm" onclick="modalBroadcast()">+ Buat Pesan</button></div><div class="card"><div class="table-wrap"><table><thead><tr><th>Tgl</th><th>Pengirim</th><th>Target</th><th>Pesan</th><th>Aksi</th></tr></thead><tbody id="tblBroadcast"></tbody></table></div></div>`;
    const snap = await db.collection('hrd_broadcast').orderBy('createdAt','desc').get();
    let h = '';
    snap.forEach(d => {
        const p = d.data();
        h += `<tr><td>${formatDateTime(p.createdAt)}</td><td class="fw-700">${escHtml(p.pengirim)}</td><td><span class="badge badge-info">${escHtml(p.targetLabel || 'Semua')}</span></td><td class="text-sm">${escHtml(p.pesan.substring(0,60))}${p.pesan.length>60?'...':''}</td><td><button class="btn btn-xs btn-info" onclick="viewBroadcast('${d.id}')">👁️</button> <button class="btn btn-xs btn-danger" onclick="hapusDoc('hrd_broadcast','${d.id}','broadcast')">🗑️</button></td></tr>`;
    });
    document.getElementById('tblBroadcast').innerHTML = h || '<tr><td colspan="5" class="text-center">Belum ada broadcast</td></tr>';
}

function modalBroadcast() {
    openModal(`<div class="modal-title">Buat Global Broadcast</div>
        <div class="form-group"><label>Target Audience</label><select class="form-control" id="bcTarget">
            <option value="all">Semua Karyawan</option>
            <option value="staff">Khusus STAFF</option>
            <option value="leader">Khusus LEADER</option>
            <option value="manager">Khusus MANAGER</option>
        </select></div>
        <div class="form-group"><label>Pesan</label><textarea class="form-control" id="bcMsg" rows="5" placeholder="Tulis pengumuman penting di sini..."></textarea></div>
        <button class="btn btn-primary" onclick="simpanBroadcast()">📡 Kirim Sekarang</button>`);
}

async function simpanBroadcast() {
    const target = document.getElementById('bcTarget').value;
    const targetLabel = document.getElementById('bcTarget').options[document.getElementById('bcTarget').selectedIndex].text;
    const pesan = document.getElementById('bcMsg').value;
    if(!pesan) return toast('Pesan kosong','warning');
    await db.collection('hrd_broadcast').add({
        pengirim: currentUser.nama,
        target,
        targetLabel,
        pesan,
        createdAt: new Date().toISOString()
    });
    // Send background push notifications
    await sendNotification(target, '📢 BROADCAST', pesan);
    closeModalDirect();
    toast('Broadcast terkirim','success');
    renderBroadcast();
}

function viewBroadcast(id) {
    db.collection('hrd_broadcast').doc(id).get().then(doc => {
        const p = doc.data();
        openModal(`<div class="modal-title">📡 Detail Broadcast</div><div style="background:#f9f9f9;padding:12px;border-radius:8px;margin-bottom:16px;font-size:.82rem"><div><b>Pengirim:</b> ${escHtml(p.pengirim || "-")}</div><div><b>Target:</b> ${escHtml(p.targetLabel || "Semua")}</div><div><b>Tanggal:</b> ${formatDateTime(p.createdAt)}</div></div><div style="background:#fff;border:1px solid var(--border);border-radius:8px;padding:16px;font-size:.9rem;line-height:1.7;white-space:pre-wrap">${escHtml(p.pesan || "")}</div>`);
    });
}

function renderPanduan() {
  const main = document.getElementById('mainContent');
  const role = currentUser.role || 'staff';
  const level = ROLES[role] || 1;

  let content = '';

  // Staff instructions
  content += `<div class="card mb-16" style="border-left:4px solid var(--primary)"><div class="fw-700 mb-8" style="color:var(--primary)">👤 Panduan Karyawan</div>
    <div class="text-sm" style="line-height:2">
      <div><b>📍 Absensi:</b> Lakukan Clock-In saat tiba dan Clock-Out saat pulang. Sertakan selfie + GPS.</div>
      <div><b>🏖️ Cuti & Izin:</b> Ajukan cuti minimal 3 hari sebelumnya. Lampirkan bukti (surat dokter) jika sakit.</div>
      <div><b>⏰ Overtime:</b> Laporkan lembur Anda segera setelah selesai bekerja.</div>
      <div><b>Daily Task:</b> Update progress tugas harian Anda setiap sore hari.</div>
      <div><b>💰 Keuangan:</b> Cek slip gaji, sisa kasbon, dan ajukan reimburse di portal ini.</div>
    </div></div>`;

  // Leader/Manager instructions
  if (level >= 2) {
    content += `<div class="card mb-16" style="border-left:4px solid var(--primary)"><div class="fw-700 mb-8" style="color:var(--primary)">📋 Panduan Atasan (Leader/Manager)</div>
      <div class="text-sm" style="line-height:2">
        <div><b>✅ Approval Center:</b> Pantau dan berikan persetujuan untuk pengajuan bawahan Anda di sini.</div>
        <div><b>👥 Tim Saya:</b> (Head/Manager) Bisa memantau produktivitas dan absensi anggota tim.</div>
        <div><b>📈 Penilaian:</b> Berikan feedback dan input nilai KPI berkala untuk bawahan.</div>
      </div></div>`;
  }

  // Admin instructions
  if (level >= 6) {
    content += `<div class="card mb-16" style="border-left:4px solid var(--primary)"><div class="fw-700 mb-8" style="color:var(--primary)">🔧 Administrasi Sistem (Admin)</div>
      <div class="text-sm" style="line-height:2">
        <div><b>👤 Manajemen Akun:</b> Tambah/edit user, set role (staff/leader/manager/head/bod/admin) & departemen.</div>
        <div><b>📈 KPI & Penilaian:</b> Input nilai KPI, edit, hapus semua data. Sinkron penalty ke KPI.</div>
        <div><b>✏️ Full Edit:</b> Admin bisa edit & hapus semua data (task, report, penalty, dll) milik user manapun.</div>
        <div><b>🔧 System Admin:</b> Backup data / reset sistem. Hati-hati dengan reset!</div>
        <div><b>🔍 Rekrutmen:</b> Kelola lowongan, pipeline, kandidat, DISC test, test kesehatan.</div>
        <div><b>📄 Legal & Aset:</b> Kontrak, asset management, peraturan perusahaan, generator surat.</div>
        <div><b>💰 Penggajian:</b> Generate slip gaji, tax & BPJS, insentif, tunjangan.</div>
        <div><b>📱 QR & PWA:</b> Share aplikasi, generate QR code untuk akses karyawan.</div>
      </div></div>`;
  }

  main.innerHTML = `<div class="page-title"><span>📖 Panduan Penggunaan Sistem</span></div>
    <div class="card mb-16" style="background:#f9f9f9;border:none"><div style="display:flex;align-items:center;gap:12px"><div style="font-size:2rem">👋</div><div><div class="fw-700">Halo, ${escHtml(currentUser.nama)}!</div><div class="text-sm" style="color:#555">Role Anda: <b>${role.toUpperCase()}</b> | Departemen: <b>${escHtml(currentUser.departemen || '-')}</b></div><div class="text-xs" style="color:#999;margin-top:4px">Panduan di bawah disesuaikan dengan level akses Anda.</div></div></div></div>
    ${content}`;
}
