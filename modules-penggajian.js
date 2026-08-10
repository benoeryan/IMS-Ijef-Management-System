'use strict';
// == PENGGAJIAN ================================================
async function renderPenggajian() {
  const main = document.getElementById('mainContent');
  const isBOD = currentUser.role === 'bod';
  const bulan = monthStr();
  main.innerHTML = `<div class="page-title">
    <span>${renderBackButton()}💰 Penggajian</span>
    ${!isBOD ? `
    <div class="flex gap-8">
        <button class="btn btn-info btn-sm" id="btnSyncPayroll" onclick="syncAllPayrollData()">🔄 Sinkronisasi</button>
        <button class="btn btn-primary btn-sm" onclick="modalGaji()">+ Generate Slip</button>
        <button class="btn btn-success btn-sm" onclick="generateAllGaji()">⚡ Generate Semua</button>
        <button class="btn btn-secondary btn-sm" onclick="modalImportPenggajian()">⬇️ Import</button>
    </div>` : ''}
  </div>
  <div class="card">
    <div class="flex gap-8 mb-16 flex-wrap">
      <input class="form-control" type="month" id="filterBulanGaji" value="${bulan}" onchange="loadGaji()" style="max-width:160px">
      <input class="form-control" placeholder="🔍 Cari nama..." id="filterNamaGaji" oninput="filterGajiTable()" style="max-width:180px">
      <select class="form-control" id="filterDeptGaji" onchange="filterGajiTable()" style="max-width:160px"><option value="">Semua Dept</option></select>
      <select class="form-control" id="filterGajiRange" onchange="filterGajiTable()" style="max-width:160px"><option value="">Semua Gaji</option><option value="0-3000000">&lt; 3 Juta</option><option value="3000000-5000000">3-5 Juta</option><option value="5000000-10000000">5-10 Juta</option><option value="10000000-99999999">&gt; 10 Juta</option></select>
      <button class="btn btn-sm btn-info" onclick="loadGaji()">🔍</button>
    </div>
    <div id="gajiSummary" class="stats-grid mb-16"></div>
    ${!isBOD ? '<div class="flex gap-8 mb-8"><label style="font-size:.78rem;display:flex;align-items:center;gap:4px"><input type="checkbox" id="selectAllGaji" onchange="toggleSelectAllGaji()"> Pilih Semua</label><button class="btn btn-xs btn-danger" onclick="hapusSelectedGaji()">🗑️ Hapus Terpilih</button><button class="btn btn-xs btn-danger" onclick="hapusSemuaGaji()">🗑️ Hapus Semua</button></div>' : ''}
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            ${!isBOD ? '<th style="width:30px"><input type="checkbox" id="selectAllGajiHead" onchange="toggleSelectAllGaji()"></th>' : ''}
            <th>Karyawan</th><th>Gaji Pokok</th><th>Tunjangan</th><th>Insentif</th><th>Reimburse</th><th>Lembur</th><th>Potongan</th><th>Loan</th><th>PPH21</th><th>THP</th><th>Aksi</th>
          </tr>
        </thead>
        <tbody id="tblGaji"></tbody>
      </table>
    </div>
  </div>`;

  await loadGaji();

  // Auto-sync if current month has no data yet
  if (!isBOD && window._gajiData.length === 0) {
      console.log("[PAYROLL] Auto-syncing current month...");
      await syncAllPayrollData(true);
  }
}

async function syncAllPayrollData(silent = false) {
    if (silent) {
        const bulan = document.getElementById('filterBulanGaji')?.value || monthStr();
        // Silent sync uses ALL components by default
        await doGenerateAllGaji(bulan, true, {
            tunj: true, insentif: true, reimb: true, kasbon: true,
            bpjsKes: true, bpjsTK: true, pph: true
        });
        loadGaji();
        return;
    }

    openModal(`<div class="modal-title">🔄 Sinkronisasi Data Penggajian</div>
    <p class="text-sm mb-16" style="color:#666">Pilih komponen yang ingin diperbarui berdasarkan data terbaru dari modul lain:</p>
    <div style="background:#f8f9ff;padding:12px;border-radius:8px;margin-bottom:16px">
      <div class="grid-2">
        <label style="display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer;font-size:.85rem"><input type="checkbox" id="genIncTunj" checked> Tunjangan Tetap/Lain</label>
        <label style="display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer;font-size:.85rem"><input type="checkbox" id="genIncInsentif" checked> Insentif Kinerja</label>
        <label style="display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer;font-size:.85rem"><input type="checkbox" id="genIncReimb" checked> Reimbursement</label>
        <label style="display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer;font-size:.85rem"><input type="checkbox" id="genIncKasbon" checked> Kasbon / Loan</label>
        <label style="display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer;font-size:.85rem"><input type="checkbox" id="genIncBPJSKes" checked> BPJS Kesehatan (1%)</label>
        <label style="display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer;font-size:.85rem"><input type="checkbox" id="genIncBPJSTK" checked> BPJS TK/JHT (2%)</label>
        <label style="display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer;font-size:.85rem"><input type="checkbox" id="genIncPPH" checked> PPH 21 (Progresif)</label>
      </div>
    </div>
    <button class="btn btn-primary" onclick="doSyncPayroll()">🔄 Mulai Sinkronisasi</button>`);
}

async function doSyncPayroll() {
    const bulan = document.getElementById('filterBulanGaji')?.value || monthStr();

    // Read selections BEFORE closing modal
    const selections = {
        tunj: document.getElementById('genIncTunj')?.checked,
        insentif: document.getElementById('genIncInsentif')?.checked,
        reimb: document.getElementById('genIncReimb')?.checked,
        kasbon: document.getElementById('genIncKasbon')?.checked,
        bpjsKes: document.getElementById('genIncBPJSKes')?.checked,
        bpjsTK: document.getElementById('genIncBPJSTK')?.checked,
        pph: document.getElementById('genIncPPH')?.checked
    };

    closeModalDirect();
    toast("⏳ Menyelaraskan data...", "info");

    // Pass selections to generator
    await doGenerateAllGaji(bulan, true, selections);

    toast("✅ Sinkronisasi selesai", "success");
    loadGaji();
}

/**
 * Sync payroll data for a single user for a specific period.
 * Typically called after manual attendance edit or approval.
 */
window.syncSinglePayrollData = async function(nama, periode) {
    if (!nama || !periode) return;
    console.log(`[PAYROLL] Syncing single data for ${nama} in ${periode}`);

    // We'll call doGenerateAllGaji silently for this month.
    // It filters by periode internally.
    await doGenerateAllGaji(periode, true, {
        tunj: true, insentif: true, reimb: true, kasbon: true,
        bpjsKes: true, bpjsTK: true, pph: true
    });
};
async function loadGaji() {
  const bulan = document.getElementById('filterBulanGaji')?.value || monthStr();
  const allSnap = await db.collection('hrd_penggajian').get();
  window._gajiData = [];
  for (const d of allSnap) { const data = d.data();
    if (data.periode === bulan) window._gajiData.push({ id: d.id, ...data });
  }
  // Populate dept filter from karyawan data
  const kSnap = await db.collection('hrd_karyawan').get();
  const depts = new Set();
  const karyDeptMap = {};
  kSnap.forEach((d) => {
    const k = d.data();
    depts.add(k.departemen || '');
    karyDeptMap[(k.nama || '').toLowerCase()] = k.departemen || '';
  });
  for (const g of _gajiData) {
    g._dept = karyDeptMap[(g.nama || '').toLowerCase()] || '';
  }
  const sel = document.getElementById('filterDeptGaji');
  if (sel) {
    let opts = '<option value="">Semua Dept</option>';
    depts.forEach((d) => {
      if (d) opts += `<option>${escHtml(d)}</option>`;
    });
    sel.innerHTML = opts;
  }
  filterGajiTable();
}

function filterGajiTable() {
  const q = (document.getElementById('filterNamaGaji')?.value || '').toLowerCase();
  const dept = document.getElementById('filterDeptGaji')?.value || '';
  const range = document.getElementById('filterGajiRange')?.value || '';
  let filtered = (window._gajiData || []).filter((p) => {
    if (q && !(p.nama || '').toLowerCase().includes(q)) return false;
    if (dept && p._dept !== dept) return false;
    if (range) {
      const [min, max] = range.split('-').map(Number);
      const gaji = p.gajiPokok || 0;
      if (gaji < min || gaji >= max) return false;
    }
    return true;
  });
  let h = '',
    totPokok = 0,
    totNet = 0,
    totPPH = 0,
    count = 0;
  if (!filtered.length) h = '<tr><td colspan="12" class="text-center">Tidak ada data</td></tr>';
  else
    filtered.forEach((p) => {
      totPokok += Number(p.gajiPokok) || 0;
      totNet += Number(p.totalBersih) || 0;
      totPPH += Number(p.pph21) || 0;
      count++;
      const isBOD = currentUser.role === 'bod';
      h += `<tr>${!isBOD ? `<td><input type="checkbox" class="gaji-cb" value="${p.id}"></td>` : ''}<td class="fw-700">${escHtml(p.nama)}</td><td>${formatCurrency(p.gajiPokok)}</td><td>${formatCurrency(p.tunjangan)}</td><td>${formatCurrency(p.insentif || 0)}</td><td>${formatCurrency(p.reimbursement || 0)}</td><td>${formatCurrency(p.lembur || 0)}</td><td>${formatCurrency(p.potongan)}</td><td>${formatCurrency(p.kasbon || 0)}</td><td>${formatCurrency(p.pph21)}</td><td class="fw-700">${formatCurrency(p.totalBersih)}</td><td><button class="btn btn-xs btn-info" onclick="lihatSlip('${p.id}')">📄</button>${!isBOD ? ` <button class="btn btn-xs btn-warning" onclick="editGaji('${p.id}')">✏️</button> <button class="btn btn-xs btn-danger" onclick="hapusDoc('hrd_penggajian','${p.id}','penggajian')">🗑️</button>` : ''}</td></tr>`;
    });
  document.getElementById('tblGaji').innerHTML = h;
  document.getElementById('gajiSummary').innerHTML =
    `<div class="stat-card"><div class="stat-value">${count}</div><div class="stat-label">Karyawan</div></div><div class="stat-card"><div class="stat-value">${formatCurrency(totPokok)}</div><div class="stat-label">Total Gaji Pokok</div></div><div class="stat-card"><div class="stat-value">${formatCurrency(totNet)}</div><div class="stat-label">Total THP</div></div><div class="stat-card"><div class="stat-value">${formatCurrency(totPPH)}</div><div class="stat-label">Total PPH21</div></div>`;
}

function toggleSelectAllGaji() {
  const checked =
    document.getElementById('selectAllGaji')?.checked ||
    document.getElementById('selectAllGajiHead')?.checked;
  document.querySelectorAll('.gaji-cb').forEach((cb) => (cb.checked = checked));
  document.getElementById('selectAllGaji').checked = checked;
  document.getElementById('selectAllGajiHead').checked = checked;
}

async function hapusSelectedGaji() {
  const ids = [];
  document.querySelectorAll('.gaji-cb:checked').forEach((cb) => ids.push(cb.value));
  if (!ids.length) return toast('Pilih slip yang ingin dihapus', 'warning');
  if (!confirm(`Hapus ${ids.length} slip gaji terpilih?`)) return;
  for (const id of ids) {
    await db.collection('hrd_penggajian').doc(id).delete();
  }
  toast(`${ids.length} slip dihapus`, 'success');
  loadGaji();
}

async function hapusSemuaGaji() {
  if (!confirm('⚠️ HAPUS SEMUA slip gaji periode ini?')) return;
  if (!confirm('Konfirmasi: Yakin hapus SEMUA?')) return;
  const bulan = document.getElementById('filterBulanGaji')?.value || monthStr();
  const snap = await db.collection('hrd_penggajian').where('periode', '==', bulan).get();
  const batch = db.batch();
  snap.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  toast(`${snap.size} slip dihapus`, 'success');
  loadGaji();
}

async function generateAllGaji() {
  openModal(`<div class="modal-title">⚡ Generate Slip Gaji Semua Karyawan</div>
    <p class="text-sm mb-16" style="color:#666">Perhitungan: Tgl 20 bulan lalu s/d Tgl 20 bulan ini. Terintegrasi dengan kehadiran & lembur.</p>
    <div class="fw-700 text-sm mb-8">Komponen yang disertakan:</div>
    <div style="background:#f8f9ff;padding:12px;border-radius:8px;margin-bottom:16px">
      <div class="grid-2">
        <label style="display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer;font-size:.85rem"><input type="checkbox" id="genIncTunj" checked> Tunjangan Tetap/Lain</label>
        <label style="display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer;font-size:.85rem"><input type="checkbox" id="genIncInsentif" checked> Insentif Kinerja</label>
        <label style="display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer;font-size:.85rem"><input type="checkbox" id="genIncReimb" checked> Reimbursement</label>
        <label style="display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer;font-size:.85rem"><input type="checkbox" id="genIncKasbon" checked> Kasbon / Loan</label>
        <label style="display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer;font-size:.85rem"><input type="checkbox" id="genIncBPJSKes" checked> BPJS Kesehatan (1%)</label>
        <label style="display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer;font-size:.85rem"><input type="checkbox" id="genIncBPJSTK" checked> BPJS TK/JHT (2%)</label>
        <label style="display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer;font-size:.85rem"><input type="checkbox" id="genIncPPH" checked> PPH 21 (Progresif)</label>
        <label style="display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer;font-size:.85rem"><input type="checkbox" id="genIncTunjCuti"> Tunjangan Cuti (1/12)</label>
      </div>
    </div>
    <button class="btn btn-success" onclick="doGenerateAllGaji()">⚡ Generate Sekarang</button>`);
}
async function doGenerateAllGaji(forcedBulan, isAuto = false, forcedSelections = null) {
  // Use forcedSelections if provided (e.g. from Sync modal), otherwise read from DOM
  const incTunj = forcedSelections ? forcedSelections.tunj : (document.getElementById('genIncTunj') ? document.getElementById('genIncTunj').checked : true);
  const incInsentif = forcedSelections ? forcedSelections.insentif : (document.getElementById('genIncInsentif') ? document.getElementById('genIncInsentif').checked : true);
  const incReimb = forcedSelections ? forcedSelections.reimb : (document.getElementById('genIncReimb') ? document.getElementById('genIncReimb').checked : true);
  const incKasbon = forcedSelections ? forcedSelections.kasbon : (document.getElementById('genIncKasbon') ? document.getElementById('genIncKasbon').checked : true);

  const incTunjCuti = document.getElementById('genIncTunjCuti') ? document.getElementById('genIncTunjCuti').checked : false;
  const incBPJSKes = forcedSelections ? forcedSelections.bpjsKes : (document.getElementById('genIncBPJSKes') ? document.getElementById('genIncBPJSKes').checked : true);
  const incBPJSTK = forcedSelections ? forcedSelections.bpjsTK : (document.getElementById('genIncBPJSTK') ? document.getElementById('genIncBPJSTK').checked : true);
  const incPPH = forcedSelections ? forcedSelections.pph : (document.getElementById('genIncPPH') ? document.getElementById('genIncPPH').checked : true);

  if (!isAuto) closeModalDirect();
  if (!isAuto && !confirm('Konfirmasi: Generate slip gaji untuk semua karyawan aktif?')) return;

  try {
    const bulan = forcedBulan || document.getElementById('filterBulanGaji')?.value || monthStr();
    const [year, month] = bulan.split('-').map(Number);

    // Periode gaji: tgl 21 bulan lalu s/d tgl 20 bulan ini
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const periodeStart = `${prevYear}-${String(prevMonth).padStart(2, '0')}-21`;
    const periodeEnd = `${year}-${String(month).padStart(2, '0')}-20`;

    // Hitung Total Hari Kalender dalam Periode
    const dStart = new Date(periodeStart + 'T00:00:00');
    const dEnd = new Date(periodeEnd + 'T00:00:00');
    const totalKalender = Math.round((dEnd - dStart) / (1000 * 60 * 60 * 24)) + 1;

    const kSnapAll = await db.collection('hrd_karyawan').get();
    const kDocs = [];
    kSnapAll.forEach((d) => {
      const data = d.data();
      if (data.status === 'aktif' || data.status === 'probation' || data.status === 'kontrak') {
        kDocs.push({ id: d.id, ...data });
      }
    });

    if (kDocs.length === 0) {
      if (!isAuto) toast('Tidak ada karyawan aktif', 'warning');
      return;
    }

    // Delete existing slips for this period
    const existSnapAll = await db.collection('hrd_penggajian').where('periode', '==', bulan).get();
    for (const doc of existSnapAll.docs) {
        await doc.ref.delete();
    }

    // Load data masal
    const [
      absenSnap, reimbSnap, kasbonSnap, tunjSnap, insentifSnap,
      cutiSnap, overtimeSnap, dinasLuarSnap, liburSnap, offboardingSnap
    ] = await Promise.all([
      db.collection('hrd_absensi').where('tanggal', '>=', periodeStart).where('tanggal', '<=', periodeEnd).get(),
      db.collection('hrd_reimbursement').where('status', '==', 'approved').get(),
      db.collection('hrd_kasbon').where('status', 'in', ['aktif', 'approved']).get(),
      db.collection('hrd_tunjangan').get(),
      db.collection('hrd_insentif').get(),
      db.collection('hrd_cuti').get(),
      db.collection('hrd_overtime').where('status', '==', 'approved').get(),
      db.collection('hrd_dinas_luar').where('status', '==', 'approved').get(),
      db.collection('hrd_hari_libur').get(),
      db.collection('hrd_offboarding').get()
    ]);

    // Cache snapshots to standard arrays for safer iteration and performance
    const absenList = [], reimbList = [], kasbonList = [], tunjList = [], insentifList = [],
          cutiList = [], otList = [], dinasList = [], offList = [];

    absenSnap.forEach(d => absenList.push({ id: d.id, ...d.data() }));
    reimbSnap.forEach(d => reimbList.push({ id: d.id, ...d.data() }));
    kasbonSnap.forEach(d => kasbonList.push({ id: d.id, ...d.data() }));
    tunjSnap.forEach(d => tunjList.push({ id: d.id, ...d.data() }));
    insentifSnap.forEach(d => insentifList.push({ id: d.id, ...d.data() }));
    cutiSnap.forEach(d => cutiList.push({ id: d.id, ...d.data() }));
    overtimeSnap.forEach(d => otList.push({ id: d.id, ...d.data() }));
    dinasLuarSnap.forEach(d => dinasList.push({ id: d.id, ...d.data() }));
    offboardingSnap.forEach(d => offList.push({ id: d.id, ...d.data() }));

    const holidays = new Set();
    liburSnap.forEach(d => {
        const h = d.data();
        if (h.tanggal >= periodeStart && h.tanggal <= periodeEnd) holidays.add(h.tanggal);
    });

    const isWorkDay = (dateStr) => {
        const dt = new Date(dateStr + 'T00:00:00');
        const day = dt.getDay();
        return day !== 0 && day !== 6 && !holidays.has(dateStr);
    };

    // Resign map
    const resignMap = {};
    offboardingSnap.forEach(d => {
        const o = d.data();
        if (o.tanggalKeluar) resignMap[(o.nama || '').toLowerCase().trim()] = o.tanggalKeluar;
    });

    for (const k of kDocs) {
      const namaLow = (k.nama || '').trim().toLowerCase();
      // ROOT FIX: Management Exemption (BOD, Grade BOD, or specifically named individuals)
      const isExempt = ( (k.role || '').toLowerCase() === 'bod' ||
                         (k.gradeJabatan || '').toUpperCase() === 'BOD' ||
                         (k.posisi || '').toUpperCase() === 'FOUNDER' ||
                         ['mahpudin', 'misriana', 'budi cahyo'].some(n => namaLow.includes(n)) );

      // 1. Masa Aktif Prorata
      const tglMasuk = k.tanggalMasuk || periodeStart;
      const tglKeluar = resignMap[namaLow] || '9999-12-31';
      const rangeStart = tglMasuk > periodeStart ? tglMasuk : periodeStart;
      const rangeEnd = tglKeluar < periodeEnd ? tglKeluar : periodeEnd;

      let hariAktifKalender = 0;
      if (rangeEnd >= rangeStart) {
          const rs = new Date(rangeStart + 'T00:00:00');
          const re = new Date(rangeEnd + 'T00:00:00');
          hariAktifKalender = Math.round((re - rs) / (1000 * 60 * 60 * 24)) + 1;
      }
      const isFullMonth = (tglMasuk <= periodeStart && tglKeluar >= periodeEnd);
      let gajiPokok = Number(k.gajiPokok) || 0;
      if (!isFullMonth) {
          gajiPokok = Math.round((hariAktifKalender / totalKalender) * (Number(k.gajiPokok) || 0));
      }

      // 2. Attendance & Mangkir (Match any activity as 'present')
      const absenDatesSet = new Set();
      absenList.forEach(a => {
          const aNama = (a.nama || '').trim().toLowerCase();
          if ((a.userId === k.id || aNama === namaLow || aNama.includes(namaLow) || namaLow.includes(aNama)) &&
              a.tanggal >= rangeStart && a.tanggal <= rangeEnd) {
              absenDatesSet.add(a.tanggal);
          }
      });

      const cutiDatesArr = [], dinasDatesArr = [], absentDatesArr = [];
      const cutiSet = new Set(), dinasSet = new Set();

      cutiList.forEach(c => {
          if (c.status !== 'approved') return;
          const cNama = (c.nama || '').trim().toLowerCase();
          const isMatch = (c.userId === k.id || cNama === namaLow || namaLow.includes(cNama) || cNama.includes(namaLow));
          if (isMatch) {
              const start = c.mulai;
              const end = c.selesai || c.mulai;
              for (let dt = new Date(start + 'T00:00:00'); dt <= new Date(end + 'T00:00:00'); dt.setDate(dt.getDate() + 1)) {
                  const ds = getSafeDateString(dt);
                  if (ds >= rangeStart && ds <= rangeEnd) {
                      cutiSet.add(ds);
                      if (!cutiDatesArr.includes(ds)) cutiDatesArr.push(ds);
                  }
              }
          }
      });

      dinasList.forEach(dl => {
          const dNama = (dl.nama || '').trim().toLowerCase();
          if (dl.userId === k.id || dNama === namaLow || dNama.includes(namaLow) || namaLow.includes(dNama)) {
              const start = dl.tanggalMulai || dl.tanggal;
              const end = dl.tanggalSelesai || dl.tanggal;
              for (let dt = new Date(start + 'T00:00:00'); dt <= new Date(end + 'T00:00:00'); dt.setDate(dt.getDate() + 1)) {
                  const ds = getSafeDateString(dt);
                  if (ds >= rangeStart && ds <= rangeEnd) {
                      dinasSet.add(ds);
                      if (!dinasDatesArr.includes(ds)) dinasDatesArr.push(ds);
                  }
              }
          }
      });

      let hadirCount = 0, mangkirCount = 0;
      for (let dt = new Date(rangeStart + 'T00:00:00'); dt <= new Date(rangeEnd + 'T00:00:00'); dt.setDate(dt.getDate() + 1)) {
          const ds = getSafeDateString(dt);
          if (isWorkDay(ds)) {
              if (absenDatesSet.has(ds)) {
                  hadirCount++;
              } else if (cutiSet.has(ds) || dinasSet.has(ds)) {
                  // Valid absence, not mangkir
              } else {
                  mangkirCount++;
                  absentDatesArr.push(ds);
              }
          }
      }

      const potonganMangkir = isExempt ? 0 : Math.round((mangkirCount / totalKalender) * (Number(k.gajiPokok) || 0));

      // 4. Lembur
      let lemburJam = 0;
      otList.forEach(o => {
          const oNama = (o.nama || '').trim().toLowerCase();
          if ((o.userId === k.id || oNama === namaLow || oNama.includes(namaLow)) && o.tanggal >= periodeStart && o.tanggal <= periodeEnd) {
              lemburJam += (parseFloat(o.durasi) || 0);
          }
      });
      const gajiPerJam = Math.round((Number(k.gajiPokok) || 0) / 173);
      const lemburNominal = Math.round(lemburJam * gajiPerJam);

      // 5. Tunjangan & Finance Sync
      let tunjTetap = 0, tunjLain = 0, insentif = 0, reimb = 0, loan = 0;
      if (incTunj) {
          tunjList.forEach(t => {
              const p = (t.penerima || 'Semua').trim().toLowerCase();
              if (p === 'semua' || p === 'all' || p.split(',').some(x => namaLow.includes(x.trim()))) {
                  if (t.jenis === 'tetap') tunjTetap += (Number(t.nominal) || 0);
                  else tunjLain += (Number(t.nominal) || 0);
              }
          });
      }
      if (incInsentif) {
          insentifList.forEach(ins => {
              if (ins.status && ins.status !== 'approved') return;
              const insNama = (ins.nama || '').trim().toLowerCase();
              // PRIORITY: If periode matches exactly, use it. Otherwise use date range.
              const isNameMatch = (insNama === namaLow || namaLow.includes(insNama) || insNama.includes(namaLow));
              if (isNameMatch) {
                  const insPeriode = ins.periode || "";
                  const insDate = getSafeDateString(ins.approvedAt || ins.createdAt);
                  if (insPeriode === bulan || (insPeriode === "" && insDate >= periodeStart && insDate <= periodeEnd)) {
                      insentif += (Number(ins.nominal) || 0);
                  }
              }
          });
      }
      if (incReimb) {
          reimbList.forEach(r => {
              const rNama = (r.nama || '').trim().toLowerCase();
              const rDate = getSafeDateString(r.approvedAt || r.createdAt);
              if ((rNama === namaLow || namaLow.includes(rNama)) && rDate >= periodeStart && rDate <= periodeEnd) {
                  reimb += (Number(r.jumlah) || 0);
              }
          });
      }
      if (incKasbon) {
          kasbonList.forEach(r => {
              const rNama = (r.nama || '').trim().toLowerCase();
              if (rNama === namaLow || namaLow.includes(rNama)) {
                  loan += (Number(r.angsuran) || Number(r.jumlah) || 0);
              }
          });
      }

      const bpjsKes = incBPJSKes ? Math.round((Number(k.gajiPokok) || 0) * 0.01) : 0;
      const bpjsTK = incBPJSTK ? Math.round((Number(k.gajiPokok) || 0) * 0.02) : 0;
      const bruto = gajiPokok + tunjTetap + tunjLain + insentif + reimb + lemburNominal - potonganMangkir;

      let pph21 = 0;
      if (incPPH) {
          const nettoTahunan = Math.max(0, ( (Number(k.gajiPokok) || 0) + tunjTetap - bpjsKes - bpjsTK ) * 12 - 54000000);
          let pphT = 0;
          if (nettoTahunan <= 60000000) pphT = nettoTahunan * 0.05;
          else if (nettoTahunan <= 250000000) pphT = 3000000 + (nettoTahunan - 60000000) * 0.15;
          pph21 = Math.round(pphT / 12);
      }

      const thp = bruto - bpjsKes - bpjsTK - loan - pph21;

      await db.collection('hrd_penggajian').add({
          nama: k.nama,
          karyawanId: k.id,
          periode: bulan,
          periodeStart,
          periodeEnd,
          gajiPokok,
          gajiPokokUtuh: Number(k.gajiPokok) || 0,
          tunjangan: tunjTetap + tunjLain,
          insentif,
          reimbursement: reimb,
          lembur: lemburNominal,
          lemburJam,
          bpjsKesehatan: bpjsKes,
          bpjsTK,
          potonganMangkir,
          mangkirHari: mangkirCount,
          potongan: potonganMangkir + bpjsKes + bpjsTK,
          kasbon: loan,
          pph21,
          totalBersih: thp,
          hariKerja: hadirCount + mangkirCount + cutiSet.size + dinasSet.size,
          kehadiran: hadirCount,
          cutiHari: cutiSet.size,
          dinasHari: dinasSet.size,
          tidakHadir: mangkirCount,
          cutiDates: cutiDatesArr,
          dinasDates: dinasDatesArr,
          absentDates: absentDatesArr,
          isProrata: !isFullMonth,
          activeCalendarDays: hariAktifKalender,
          totalCalendarDays: totalKalender,
          createdAt: new Date().toISOString(),
          status: 'pending'
      });
    }

    if (!isAuto) {
        toast('✅ Slip gaji berhasil digenerate', 'success');
        loadGaji();
    }
  } catch (e) {
    console.error('Payroll generate error:', e);
    if (!isAuto) toast('Gagal: ' + e.message, 'danger');
    throw e;
  }
}
function modalGaji() {
  loadKaryawanDropdownGaji();
}
async function loadKaryawanDropdownGaji() {
  const kSnap = await db.collection('hrd_karyawan').where('status', '==', 'aktif').get();
  let opts = '<option value="">-- Pilih Karyawan --</option>';
  for (const d of kSnap.docs) { const k = d.data();
    opts += `<option value="${escHtml(k.nama)}">${escHtml(k.nama)} — ${escHtml(k.departemen || '')} (${escHtml(k.posisi || '')})</option>`;
  }
  openModal(
    `<div class="modal-title">Generate Slip Gaji</div><div class="grid-2"><div class="form-group"><label>Karyawan</label><select class="form-control" id="gjNama" onchange="autoFillGajiFromKaryawan()">${opts}</select></div><div class="form-group"><label>Periode</label><input class="form-control" type="month" id="gjPeriode" value="${monthStr()}"></div></div>
    <div style="border-top:1px solid var(--border);padding-top:12px;margin-top:8px"><div class="fw-700 text-sm mb-8 color-primary">💰 Pendapatan</div><div class="grid-2"><div class="form-group"><label>Gaji Pokok</label><input class="form-control" type="number" id="gjPokok" value="0" oninput="hitungGaji()"></div><div class="form-group"><label>Tunj. Jabatan</label><input class="form-control" type="number" id="gjTunjJabatan" value="0" oninput="hitungGaji()"></div><div class="form-group"><label>Tunj. Transport</label><input class="form-control" type="number" id="gjTunjTransport" value="0" oninput="hitungGaji()"></div><div class="form-group"><label>Tunj. Makan</label><input class="form-control" type="number" id="gjTunjMakan" value="0" oninput="hitungGaji()"></div><div class="form-group"><label>Tunj. Komunikasi</label><input class="form-control" type="number" id="gjTunjKom" value="0" oninput="hitungGaji()"></div><div class="form-group"><label>Lembur</label><input class="form-control" type="number" id="gjLembur" value="0" oninput="hitungGaji()"></div></div></div>
    <div style="border-top:1px solid var(--border);padding-top:12px;margin-top:8px"><div class="fw-700 text-sm mb-8" style="color:#ff6f00">🏆 Insentif & Bonus</div><div class="grid-2"><div class="form-group"><label>Insentif Kinerja (auto KPI)</label><input class="form-control" type="number" id="gjInsentif" value="0" oninput="hitungGaji()"></div><div class="form-group"><label>Bonus</label><input class="form-control" type="number" id="gjBonus" value="0" oninput="hitungGaji()"></div><div class="form-group"><label>Tunj. Lainnya (auto)</label><input class="form-control" type="number" id="gjTunjLain" value="0" oninput="hitungGaji()"></div><div class="form-group"><label>Reimbursement (auto)</label><input class="form-control" type="number" id="gjReimburse" value="0" oninput="hitungGaji()"></div></div></div>
    <div style="border-top:1px solid var(--border);padding-top:12px;margin-top:8px"><div class="fw-700 text-sm mb-8 color-danger">📉 Potongan</div><div class="grid-2"><div class="form-group"><label>BPJS Kesehatan (1%)</label><input class="form-control" type="number" id="gjBPJSKes" value="0" oninput="hitungGaji()"></div><div class="form-group"><label>BPJS TK (2%)</label><input class="form-control" type="number" id="gjBPJSTK" value="0" oninput="hitungGaji()"></div><div class="form-group"><label>Kasbon/Loan (auto)</label><input class="form-control" type="number" id="gjKasbon" value="0" oninput="hitungGaji()"></div><div class="form-group"><label>Potongan Lain</label><input class="form-control" type="number" id="gjPotongan" value="0" oninput="hitungGaji()"></div></div></div>
    <div style="border-top:2px solid var(--primary);padding-top:12px;margin-top:12px;background:#f8f9ff;padding:12px;border-radius:8px"><div class="grid-2"><div class="form-group"><label>Total Bruto</label><input class="form-control" id="gjBruto" readonly style="font-weight:700;background:#e8f5e9"></div><div class="form-group"><label>Total Potongan</label><input class="form-control" id="gjTotPot" readonly style="color:var(--danger);background:#ffebee"></div><div class="form-group"><label>PPH 21 (auto)</label><input class="form-control" id="gjPPH" readonly style="color:var(--danger);background:#ffebee"></div><div class="form-group"><label>Take Home Pay (THP)</label><input class="form-control" id="gjTotal" readonly style="font-weight:700;font-size:1rem;background:#e8f5e9"></div></div></div>
    <button class="btn btn-primary mt-16" onclick="simpanGaji()">💾 Simpan Slip</button>`,
    true
  );
}
function hitungGaji() {
  const pokok = Number(document.getElementById('gjPokok').value) || 0;
  const tJabatan = Number(document.getElementById('gjTunjJabatan').value) || 0;
  const tTransport = Number(document.getElementById('gjTunjTransport').value) || 0;
  const tMakan = Number(document.getElementById('gjTunjMakan').value) || 0;
  const tKom = Number(document.getElementById('gjTunjKom').value) || 0;
  const lembur = Number(document.getElementById('gjLembur').value) || 0;
  const insentif = Number(document.getElementById('gjInsentif').value) || 0;
  const bonus = Number(document.getElementById('gjBonus').value) || 0;
  const tLain = Number(document.getElementById('gjTunjLain').value) || 0;
  const reimburse = Number(document.getElementById('gjReimburse').value) || 0;
  const bpjsKes = Number(document.getElementById('gjBPJSKes').value) || 0;
  const bpjsTK = Number(document.getElementById('gjBPJSTK').value) || 0;
  const potLain = Number(document.getElementById('gjPotongan').value) || 0;
  const kasbon = Number(document.getElementById('gjKasbon').value) || 0;
  const totalTunjangan = tJabatan + tTransport + tMakan + tKom + lembur + tLain;
  const bruto = pokok + totalTunjangan + insentif + bonus + reimburse;
  const totalPotongan = bpjsKes + bpjsTK + potLain + kasbon;
  const tahunan = (pokok + totalTunjangan - bpjsKes - bpjsTK) * 12;
  let pphTahunan = 0;
  if (tahunan <= 60000000) pphTahunan = tahunan * 0.05;
  else if (tahunan <= 250000000) pphTahunan = 60000000 * 0.05 + (tahunan - 60000000) * 0.15;
  else if (tahunan <= 500000000)
    pphTahunan = 60000000 * 0.05 + 190000000 * 0.15 + (tahunan - 250000000) * 0.25;
  else
    pphTahunan =
      60000000 * 0.05 + 190000000 * 0.15 + 250000000 * 0.25 + (tahunan - 500000000) * 0.3;
  const pph21 = Math.max(0, Math.round(pphTahunan / 12));
  const total = bruto - totalPotongan - pph21;
  document.getElementById('gjBruto').value = formatCurrency(bruto);
  document.getElementById('gjTotPot').value = formatCurrency(totalPotongan);
  document.getElementById('gjPPH').value = formatCurrency(pph21);
  document.getElementById('gjTotal').value = formatCurrency(total);
  window._gajiCalc = { pph21, total, bruto, totalTunjangan, totalPotongan, insentif, reimburse };
}
async function autoFillGajiFromKaryawan() {
  const nama = (document.getElementById('gjNama').value || '').trim();
  if (!nama) return;
  // Find karyawan
  let k = null;
  const snap = await db.collection('hrd_karyawan').where('nama', '==', nama).limit(1).get();
  if (!snap.empty) {
    k = snap.docs[0].data();
  } else {
    const all = await db.collection('hrd_karyawan').get();
    all.forEach((d) => {
      if (d.data().nama?.toLowerCase() === nama.toLowerCase()) k = d.data();
    });
    if (!k) return toast('Karyawan tidak ditemukan', 'warning');
  }
  const gaji = k.gajiPokok || 0;
  document.getElementById('gjPokok').value = gaji;
  document.getElementById('gjBPJSKes').value = Math.round(gaji * 0.01);
  document.getElementById('gjBPJSTK').value = Math.round(gaji * 0.02);
  // Auto-load tunjangan from hrd_tunjangan
  const tunjSnap = await db.collection('hrd_tunjangan').get();
  let tunjTotal = 0;
  for (const d of tunjSnap) { const t = d.data();
    const penerima = (t.penerima || 'Semua').toLowerCase();
    if (penerima === 'semua' || penerima.includes(nama.toLowerCase())) tunjTotal += t.nominal || 0;
  }
  document.getElementById('gjTunjLain').value = tunjTotal;
  // Auto-load reimbursement (approved)
  const reimbSnap = await db
    .collection('hrd_reimbursement')
    .where('status', '==', 'approved')
    .get();
  let totalReimb = 0;
  reimbSnap.forEach((d) => {
    const r = d.data();
    if ((r.nama || '').toLowerCase() === nama.toLowerCase()) totalReimb += r.jumlah || 0;
  });
  document.getElementById('gjReimburse').value = totalReimb;
  // Auto-load kasbon/loan (aktif)
  const kasbonSnap = await db.collection('hrd_kasbon').get();
  let totalLoan = 0;
  for (const d of kasbonSnap) { const r = d.data();
    if (
      (r.nama || '').toLowerCase() === nama.toLowerCase() &&
      (r.status === 'aktif' || r.status === 'approved')
    )
      totalLoan += r.angsuran || r.jumlah || 0;
  }
  document.getElementById('gjKasbon').value = totalLoan;
  // Auto-calculate insentif based on KPI score
  const kpiSnap = await db.collection('hrd_kpi').get();
  let kpiScore = 0,
    kpiFound = false;
  kpiSnap.forEach((d) => {
    const r = d.data();
    if ((r.nama || '').toLowerCase() === nama.toLowerCase()) {
      kpiScore = r.skor || 0;
      kpiFound = true;
    }
  });
  if (kpiFound && kpiScore > 0) {
    // Insentif formula: KPI >= 90 = 15% gaji, >= 80 = 10%, >= 70 = 5%, < 70 = 0
    let insentifPct = 0;
    if (kpiScore >= 90) insentifPct = 0.15;
    else if (kpiScore >= 80) insentifPct = 0.1;
    else if (kpiScore >= 70) insentifPct = 0.05;
    document.getElementById('gjInsentif').value = Math.round(gaji * insentifPct);
  }
  // Auto-load overtime (approved) for current period
  const periode = document.getElementById('gjPeriode').value || monthStr();
  const [pYear, pMonth] = periode.split('-').map(Number);
  const prevMo = pMonth === 1 ? 12 : pMonth - 1;
  const prevYr = pMonth === 1 ? pYear - 1 : pYear;
  const pStart = `${prevYr}-${String(prevMo).padStart(2, '0')}-20`;
  const pEnd = `${pYear}-${String(pMonth).padStart(2, '0')}-20`;
  const otSnap = await db.collection('hrd_overtime').get();
  let totalOTJam = 0;
  for (const d of otSnap) { const o = d.data();
    if (o.status !== 'approved') return;
    if (!o.tanggal || o.tanggal < pStart || o.tanggal > pEnd) return;
    if ((o.nama || '').toLowerCase() === nama.toLowerCase())
      totalOTJam += parseFloat(o.durasi) || 0;
  }
  if (totalOTJam > 0) {
    const gajiPerJam = Math.round(gaji / (22 * 8));
    let lemburNominal = 0;
    const jam1 = Math.min(totalOTJam, 1);
    const jamSisa = Math.max(0, totalOTJam - 1);
    lemburNominal = Math.round(jam1 * gajiPerJam * 1.5 + jamSisa * gajiPerJam * 2);
    document.getElementById('gjLembur').value = lemburNominal;
  }
  hitungGaji();
  toast(
    `Data dimuat: Gaji ${formatCurrency(gaji)}, Tunj ${formatCurrency(tunjTotal)}, Reimb ${formatCurrency(totalReimb)}, Loan ${formatCurrency(totalLoan)}${totalOTJam > 0 ? `, Lembur ${totalOTJam} jam` : ''}`,
    'success'
  );
}
async function simpanGaji() {
  const tJab = Number(document.getElementById('gjTunjJabatan').value) || 0;
  const tTrans = Number(document.getElementById('gjTunjTransport').value) || 0;
  const tMakan = Number(document.getElementById('gjTunjMakan').value) || 0;
  const tKom = Number(document.getElementById('gjTunjKom').value) || 0;
  const lembur = Number(document.getElementById('gjLembur').value) || 0;
  const insentif = Number(document.getElementById('gjInsentif').value) || 0;
  const bonus = Number(document.getElementById('gjBonus').value) || 0;
  const tLain = Number(document.getElementById('gjTunjLain').value) || 0;
  const reimburse = Number(document.getElementById('gjReimburse').value) || 0;
  const nama = document.getElementById('gjNama').value;
  const data = {
    nama,
    periode: document.getElementById('gjPeriode').value,
    gajiPokok: Number(document.getElementById('gjPokok').value) || 0,
    tunjangan: tJab + tTrans + tMakan + tKom + lembur + tLain,
    tunjJabatan: tJab,
    tunjTransport: tTrans,
    tunjMakan: tMakan,
    tunjKomunikasi: tKom,
    lembur,
    insentif,
    bonus,
    tunjLain: tLain,
    reimbursement: reimburse,
    bpjsKesehatan: Number(document.getElementById('gjBPJSKes').value) || 0,
    bpjsTK: Number(document.getElementById('gjBPJSTK').value) || 0,
    potongan: Number(document.getElementById('gjPotongan').value) || 0,
    kasbon: Number(document.getElementById('gjKasbon').value) || 0,
    pph21: window._gajiCalc?.pph21 || 0,
    totalBersih: window._gajiCalc?.total || 0,
    createdAt: new Date().toISOString(),
  };
  if (!nama) return toast('Pilih karyawan dulu', 'warning');
  await db.collection('hrd_penggajian').add(data);
  closeModalDirect();
  toast('Slip disimpan', 'success');
  renderPenggajian();
}
function modalImportPenggajian() {
  openModal(
    `<div class="modal-title">📥 Import Data Penggajian</div>
    <div class="tabs mb-16"><div class="tab active" onclick="switchImportTab('gaji','file')">📄 Upload CSV</div><div class="tab" onclick="switchImportTab('gaji','api')">🔗 API Google Sheets</div></div>
    <div id="importGajiTab">
      <p class="text-sm mb-8" style="color:#666">Upload file CSV. Header: Nama, Periode, Gaji Pokok, Tunjangan, Potongan, PPH21, Total Bersih.</p>
      <div class="form-group"><label>File CSV</label><input class="form-control" type="file" accept=".csv" id="importGajiFile"></div>
      <div class="flex gap-8 mb-16"><button class="btn btn-primary" onclick="processImportPenggajian()">📥 Proses Import</button><button class="btn btn-outline btn-sm" onclick="downloadPenggajianTemplate()">📄 Download Template</button></div>
      <div class="text-xs" style="color:#666">Template CSV akan membantu memastikan header sesuai dengan format sheet.</div>
    </div>`,
    true
  );
}

async function processImportPenggajianFromText(text) {
  const rows = parseCsvRows(text);
  if (rows.length < 2) return toast('Data kosong', 'warning');
  const headers = rows[0].map((h) => normalizeHeader(h));
  const map = {};
  headers.forEach((h, i) => {
    if (['nama', 'name', 'nama karyawan', 'employee name'].includes(h)) map.nama = i;
    else if (['periode', 'period', 'bulan', 'month', 'periode gaji'].includes(h)) map.periode = i;
    else if (['gaji pokok', 'salary', 'basic salary', 'gaji', 'upah pokok'].includes(h))
      map.gajiPokok = i;
    else if (['tunjangan', 'allowance', 'tunjangan total', 'total tunjangan'].includes(h))
      map.tunjangan = i;
    else if (['potongan', 'deduction', 'deductions', 'total potongan'].includes(h))
      map.potongan = i;
    else if (['pph21', 'pph', 'pph 21', 'pajak'].includes(h)) map.pph21 = i;
    else if (
      [
        'total bersih',
        'total',
        'net total',
        'net salary',
        'take home pay',
        'thp',
        'gaji bersih',
      ].includes(h)
    )
      map.totalBersih = i;
    else if (['lembur', 'overtime', 'uang lembur'].includes(h)) map.lembur = i;
    else if (['bonus'].includes(h)) map.bonus = i;
  });
  if (map.nama === undefined) return toast('Header harus berisi kolom "Nama"', 'warning');
  let added = 0,
    updated = 0;
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const nama = (row[map.nama] || '').trim();
    if (!nama) continue;
    const periode = map.periode !== undefined ? (row[map.periode] || '').trim() : monthStr();
    if (!periode) continue;
    const gajiPokok =
      Number(
        String(map.gajiPokok !== undefined ? row[map.gajiPokok] : '').replace(/[^0-9.-]/g, '')
      ) || 0;
    const tunjangan =
      Number(
        String(map.tunjangan !== undefined ? row[map.tunjangan] : '').replace(/[^0-9.-]/g, '')
      ) || 0;
    const lembur =
      Number(String(map.lembur !== undefined ? row[map.lembur] : '').replace(/[^0-9.-]/g, '')) || 0;
    const bonus =
      Number(String(map.bonus !== undefined ? row[map.bonus] : '').replace(/[^0-9.-]/g, '')) || 0;
    const potongan =
      Number(
        String(map.potongan !== undefined ? row[map.potongan] : '').replace(/[^0-9.-]/g, '')
      ) || 0;
    const pph21 =
      Number(String(map.pph21 !== undefined ? row[map.pph21] : '').replace(/[^0-9.-]/g, '')) || 0;
    let totalBersih =
      Number(
        String(map.totalBersih !== undefined ? row[map.totalBersih] : '').replace(/[^0-9.-]/g, '')
      ) || 0;
    if (!totalBersih) totalBersih = gajiPokok + tunjangan + lembur + bonus - potongan - pph21;
    const payload = {
      nama,
      periode,
      gajiPokok,
      tunjangan: tunjangan + lembur + bonus,
      potongan,
      pph21,
      totalBersih,
      updatedAt: new Date().toISOString(),
    };
    const snap = await db.collection('hrd_penggajian').where('nama', '==', nama).get();
    let existDoc = null;
    for (const d of snap.docs) { if (d.data().periode === periode) existDoc = d;
    }
    if (existDoc) {
      await db.collection('hrd_penggajian').doc(existDoc.id).update(payload);
      updated++;
    } else {
      await db
        .collection('hrd_penggajian')
        .add({ ...payload, createdAt: new Date().toISOString() });
      added++;
    }
  }
  closeModalDirect();
  toast(`✅ Import selesai: ${added} baru, ${updated} terupdate`, 'success');
  renderPenggajian();
}

async function processImportPenggajian() {
  const file = document.getElementById('importGajiFile')?.files?.[0];
  if (!file) return toast('Pilih file CSV', 'warning');
  const text = await file.text();
  await processImportPenggajianFromText(text);
}
async function lihatSlip(id) {
  try {
    const d = await db.collection('hrd_penggajian').doc(id).get();
    if (!d.exists) return toast('Data tidak ditemukan', 'warning');
    const p = d.data();
    // Get karyawan data for jabatan & status
    let jabatan = '-',
      statusKary = '-',
      departemen = '-';
    if (p.karyawanId) {
      const kDoc = await db.collection('hrd_karyawan').doc(p.karyawanId).get();
      if (kDoc.exists) {
        const k = kDoc.data();
        jabatan = k.posisi || '-';
        statusKary = k.tipeKaryawan || k.status || '-';
        departemen = k.departemen || '-';
      }
    } else {
      const kSnap = await db
        .collection('hrd_karyawan')
        .where('nama', '==', p.nama)
        .limit(1)
        .get();
      if (!kSnap.empty) {
        const k = kSnap.docs[0].data();
        jabatan = k.posisi || '-';
        statusKary = k.tipeKaryawan || k.status || '-';
        departemen = k.departemen || '-';
      }
    }
    const bruto =
      (Number(p.gajiPokok) || 0) +
      (Number(p.tunjangan) || 0) +
      (Number(p.tunjCuti) || 0) +
      (Number(p.insentif) || 0) +
      (Number(p.bonus) || 0) +
      (Number(p.reimbursement) || 0) +
      (Number(p.lembur) || 0);
    const totPot =
      (Number(p.bpjsKesehatan) || 0) +
      (Number(p.bpjsTK) || 0) +
      (Number(p.potonganMangkir) || 0) +
      (Number(p.kasbon) || 0) +
      (Number(p.pph21) || 0);

    // Build deduction details list
    let potDetailHtml = '';
    if (p.potonganMangkir) potDetailHtml += `<tr><td>Pot. Absen / Mangkir (${p.mangkirHari || 0} hari)</td><td style="text-align:right;color:var(--danger)">-${formatCurrency(p.potonganMangkir)}</td></tr>`;
    if (p.bpjsKesehatan) potDetailHtml += `<tr><td>BPJS Kesehatan (1%)</td><td style="text-align:right;color:var(--danger)">-${formatCurrency(p.bpjsKesehatan)}</td></tr>`;
    if (p.bpjsTK) potDetailHtml += `<tr><td>BPJS TK (2%)</td><td style="text-align:right;color:var(--danger)">-${formatCurrency(p.bpjsTK)}</td></tr>`;
    if (p.kasbon) potDetailHtml += `<tr><td>Kasbon/Loan</td><td style="text-align:right;color:var(--danger)">-${formatCurrency(p.kasbon)}</td></tr>`;
    if (p.pph21) potDetailHtml += `<tr><td>PPH 21</td><td style="text-align:right;color:var(--danger)">-${formatCurrency(p.pph21)}</td></tr>`;

    // Build reimbursement evidence list
    let reimbDetailHtml = '';
    if (p.reimbursementDetails && p.reimbursementDetails.length > 0) {
        reimbDetailHtml = '<div class="mt-16" style="border-top:1px solid #ddd; padding-top:8px"><div class="fw-700 text-xs color-primary mb-4">📎 Bukti Reimbursement:</div><div style="display:flex; gap:8px; flex-wrap:wrap">';
        p.reimbursementDetails.forEach(r => {
            const fileData = encodeURIComponent(JSON.stringify({ name: r.judul, type: "image/jpeg", data: r.bukti }));
            reimbDetailHtml += `
            <div style="cursor:pointer; background:#fff; border:1px solid #ddd; border-radius:4px; padding:4px; display:flex; align-items:center; gap:6px" onclick="viewEviden('${fileData}')">
              <span style="font-size:.7rem">🖼️ ${escHtml(r.judul)}</span>
              <span class="text-xs fw-700 color-primary">${formatCurrency(r.nominal)}</span>
            </div>`;
        });
        reimbDetailHtml += '</div></div>';
    }

    openModal(
      `<div id="slipGajiPrint">
  <div style="text-align:center;padding:16px;border:2px solid var(--primary);border-radius:8px;margin-bottom:16px"><div class="fw-700 color-primary" style="font-size:1.2rem">LPK IJEF CORP</div><div class="text-xs">Slip Gaji Periode: ${p.periode}</div><div class="text-xs" style="color:#999">${p.periodeStart ? `(${p.periodeStart} s/d ${p.periodeEnd})` : ''}</div></div>
  <div style="background:#f8f9ff;padding:12px;border-radius:8px;margin-bottom:16px"><div style="font-size:.82rem;display:grid;grid-template-columns:1fr 1fr;gap:6px"><div><b>Nama:</b> ${escHtml(p.nama)}</div><div><b>Periode:</b> ${p.periode}</div><div><b>Jabatan:</b> ${escHtml(jabatan)}</div><div><b>Departemen:</b> ${escHtml(departemen)}</div><div><b>Status:</b> <span class="badge badge-${statusKary === 'tetap' || statusKary === 'aktif' ? 'success' : 'warning'}" style="font-size:.7rem">${escHtml(statusKary)}</span></div><div></div></div></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
  <div><div class="fw-700 text-sm color-primary mb-8">💰 Pendapatan</div><table style="width:100%;font-size:.82rem"><tr><td>Gaji Pokok</td><td style="text-align:right">${formatCurrency(p.gajiPokok)}</td></tr><tr><td>Tunjangan</td><td style="text-align:right">${formatCurrency(p.tunjangan)}</td></tr>${p.tunjCuti ? `<tr><td>Tunj. Cuti (1/12)</td><td style="text-align:right">${formatCurrency(p.tunjCuti)}</td></tr>` : ''}${p.lembur ? `<tr><td>Lembur (${p.lemburJam || 0} jam)</td><td style="text-align:right">${formatCurrency(p.lembur)}</td></tr>` : ''}${p.insentif ? `<tr><td>Insentif</td><td style="text-align:right">${formatCurrency(p.insentif)}</td></tr>` : ''}${p.bonus ? `<tr><td>Bonus</td><td style="text-align:right">${formatCurrency(p.bonus)}</td></tr>` : ''}${p.reimbursement ? `<tr><td>Reimbursement</td><td style="text-align:right">${formatCurrency(p.reimbursement)}</td></tr>` : ''}<tr style="border-top:2px solid var(--primary);font-weight:700"><td>Total Bruto</td><td style="text-align:right">${formatCurrency(bruto)}</td></tr></table></div>
  <div><div class="fw-700 text-sm color-danger mb-8">📉 Potongan</div><table style="width:100%;font-size:.82rem">${potDetailHtml}<tr style="border-top:2px solid var(--danger);font-weight:700"><td>Total Potongan</td><td style="text-align:right;color:var(--danger)">-${formatCurrency(totPot)}</td></tr></table></div></div>
  <div style="background:var(--primary);color:#fff;padding:16px;border-radius:8px;text-align:center"><div style="font-size:.8rem;opacity:.8">TAKE HOME PAY</div><div style="font-size:1.5rem;font-weight:700">${formatCurrency(p.totalBersih)}</div></div>

  ${reimbDetailHtml}

  <div class="mt-16" style="background:#f8f9ff;padding:12px;border-radius:8px;border:1px solid #d0d9ff">
      <div class="fw-700 text-sm color-primary mb-8">📊 Detail Absensi (Periode 20-20)</div>
      <div class="grid-2" style="font-size:.8rem;gap:8px">
          <div>Jatah Hari Kerja: <b>${Number(p.hariKerja) || 0} hari</b></div>
          <div>Hadir (Check-in): <b>${Number(p.kehadiran) || 0} hari</b></div>
          <div>Cuti (Approved): <b>${Number(p.cutiHari) || 0} hari</b></div>
          <div>Dinas Luar: <b>${Number(p.dinasHari) || 0} hari</b></div>
      </div>

      <div style="border-top:1px solid #ddd;padding-top:8px;margin-top:8px">
          ${p.cutiDates && p.cutiDates.length > 0 ? `
              <div class="mb-4 text-xs">
                  <b style="color:var(--info)">Daftar Tanggal Cuti:</b><br>
                  ${p.cutiDates.map(d => formatDate(d)).join(", ")}
              </div>
          ` : ""}
          ${p.dinasDates && p.dinasDates.length > 0 ? `
              <div class="mb-4 text-xs">
                  <b style="color:var(--primary)">Daftar Tanggal Dinas:</b><br>
                  ${p.dinasDates.map(d => formatDate(d)).join(", ")}
              </div>
          ` : ""}
          <div class="mt-4 text-xs" style="background:#fff;padding:8px;border-radius:4px;border:1px solid #eee">
              <b style="color:var(--danger)">Mangkir/Tidak Absen: ${Number(p.tidakHadir) || 0} hari</b><br>
              ${p.absentDates && p.absentDates.length > 0 ? `
                  <div style="margin-top:4px">Daftar Tanggal: ${p.absentDates.map(d => formatDate(d)).join(", ")}</div>
              ` : "Tidak ada data mangkir."}
          </div>
      </div>
  </div>

  ${p.hariKerja ? `<div class="mt-16 slip-no-print" style="background:#fff3e0;padding:10px;border-radius:6px;font-size:.72rem;line-height:1.6"><b>Dasar Perhitungan:</b><br>• Gaji/hari: ${formatCurrency(Math.round((p.gajiPokok || 0) / (p.hariKerja || 22)))} (${p.gajiPokok ? formatCurrency(p.gajiPokok) : '-'} ÷ ${p.hariKerja} hari)<br>• Lembur: 1.5x jam pertama + 2x jam berikutnya (UU Cipta Kerja)<br>• PPH21: Tarif progresif UU HPP 2022 (PTKP TK/0 = Rp 54.000.000)<br>• Periode: Tgl 20 bulan lalu s/d Tgl 20 bulan ini</div>` : ''}</div>
  <div class="mt-16 flex gap-8" style="justify-content:center"><button class="btn btn-primary btn-sm" onclick="cetakSlipPDF()">📄 Cetak / Save PDF</button><button class="btn btn-outline btn-sm" onclick="window.print()">🖨️ Print</button></div>`,
      true
    );
  } catch (e) {
    console.error(e);
    toast('Gagal memuat slip gaji', 'error');
  }
}

function cetakSlipPDF() {
  const content = document.getElementById('slipGajiPrint');
  if (!content) return;
  // Clone and remove "dasar perhitungan" section
  const clone = content.cloneNode(true);
  clone.querySelectorAll('.slip-no-print').forEach((el) => el.remove());
  const win = window.open('', '_blank');
  win.document.write(
    '<html><head><title>Slip Gaji</title><style>body{font-family:Arial,sans-serif;padding:20px;font-size:12px}table{border-collapse:collapse;width:100%}td{padding:4px 8px}.fw-700{font-weight:700}.color-primary{color:#1a237e}.color-danger{color:#d32f2f}.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}.text-sm{font-size:11px}.text-xs{font-size:10px}.mb-8{margin-bottom:8px}.mt-16{margin-top:16px}</style></head><body>'
  );
  win.document.write(clone.innerHTML);
  win.document.write('</body></html>');
  win.document.close();
  setTimeout(() => {
    win.print();
  }, 500);
}

function editGaji(id) {
  db.collection('hrd_penggajian')
    .doc(id)
    .get()
    .then((d) => {
      const p = d.data();
      openModal(
        `<div class="modal-title">✏️ Edit Slip Gaji — ${escHtml(p.nama)}</div>
  <div class="grid-2"><div class="form-group"><label>Karyawan</label><input class="form-control" id="egNama" value="${escHtml(p.nama || '')}" readonly></div><div class="form-group"><label>Periode</label><input class="form-control" type="month" id="egPeriode" value="${p.periode || ''}"></div></div>
  <div class="fw-700 text-sm mb-8 mt-16 color-primary">💰 Pendapatan</div>
  <div class="grid-2">
    <div class="form-group"><label>Gaji Pokok</label><input class="form-control" type="number" id="egPokok" value="${p.gajiPokok || 0}" oninput="calcEditGaji()"></div>
    <div class="form-group"><label>Tunjangan Tetap</label><input class="form-control" type="number" id="egTunjangan" value="${p.tunjangan || 0}" oninput="calcEditGaji()"></div>
    <div class="form-group"><label>Tunjangan Cuti (1/12)</label><input class="form-control" type="number" id="egTunjCuti" value="${p.tunjCuti || 0}" oninput="calcEditGaji()"></div>
    <div class="form-group"><label>Lembur</label><input class="form-control" type="number" id="egLembur" value="${p.lembur || 0}" oninput="calcEditGaji()"></div>
    <div class="form-group"><label>Insentif</label><input class="form-control" type="number" id="egInsentif" value="${p.insentif || 0}" oninput="calcEditGaji()"></div>
    <div class="form-group"><label>Reimbursement</label><input class="form-control" type="number" id="egReimburse" value="${p.reimbursement || 0}" oninput="calcEditGaji()"></div>
  </div>
  <div class="fw-700 text-sm mb-8 mt-16" style="color:var(--accent)">📉 Potongan</div>
  <div class="grid-2">
    <div class="form-group"><label>BPJS Kesehatan (1%)</label><input class="form-control" type="number" id="egBPJSKes" value="${p.bpjsKesehatan || 0}" oninput="calcEditGaji()"></div>
    <div class="form-group"><label>BPJS TK/JHT (2%)</label><input class="form-control" type="number" id="egBPJSTK" value="${p.bpjsTK || 0}" oninput="calcEditGaji()"></div>
    <div class="form-group"><label>Potongan Absen/Lain</label><input class="form-control" type="number" id="egPotongan" value="${p.potongan || 0}" oninput="calcEditGaji()"></div>
    <div class="form-group"><label>Kasbon/Loan</label><input class="form-control" type="number" id="egKasbon" value="${p.kasbon || 0}" oninput="calcEditGaji()"></div>
    <div class="form-group"><label>PPH 21</label><input class="form-control" type="number" id="egPPH" value="${p.pph21 || 0}" oninput="calcEditGaji()"></div>
  </div>
  <div style="background:var(--primary);color:#fff;padding:12px;border-radius:8px;text-align:center;margin-top:16px"><div style="font-size:.8rem;opacity:.8">TAKE HOME PAY</div><div style="font-size:1.3rem;font-weight:700" id="egTHPDisplay">${formatCurrency(p.totalBersih || 0)}</div></div>
  <input type="hidden" id="egTotal" value="${p.totalBersih || 0}">
  <div class="flex gap-8 mt-16"><button class="btn btn-primary" onclick="updateGaji('${id}')">💾 Simpan</button><button class="btn btn-danger" onclick="hapusDoc('hrd_penggajian','${id}','penggajian')">🗑️ Hapus</button></div>`,
        true
      );
      calcEditGaji();
    })
    .catch((e) => {
      toast('Gagal memuat slip: ' + e.message, 'error');
    });
}
function calcEditGaji() {
  const gaji = Number(document.getElementById('egPokok')?.value) || 0;
  const tunj = Number(document.getElementById('egTunjangan')?.value) || 0;
  const tunjCuti = Number(document.getElementById('egTunjCuti')?.value) || 0;
  const lembur = Number(document.getElementById('egLembur')?.value) || 0;
  const insentif = Number(document.getElementById('egInsentif')?.value) || 0;
  const reimburse = Number(document.getElementById('egReimburse')?.value) || 0;
  const bpjsKes = Number(document.getElementById('egBPJSKes')?.value) || 0;
  const bpjsTK = Number(document.getElementById('egBPJSTK')?.value) || 0;
  const potongan = Number(document.getElementById('egPotongan')?.value) || 0;
  const kasbon = Number(document.getElementById('egKasbon')?.value) || 0;
  const pph = Number(document.getElementById('egPPH')?.value) || 0;
  const bruto = gaji + tunj + tunjCuti + lembur + insentif + reimburse;
  const thp = bruto - bpjsKes - bpjsTK - potongan - kasbon - pph;
  const el = document.getElementById('egTHPDisplay');
  if (el) el.textContent = formatCurrency(thp);
  const elH = document.getElementById('egTotal');
  if (elH) elH.value = thp;
}
async function updateGaji(id) {
  const data = {
    nama: document.getElementById('egNama').value,
    periode: document.getElementById('egPeriode').value,
    gajiPokok: Number(document.getElementById('egPokok').value) || 0,
    tunjangan: Number(document.getElementById('egTunjangan').value) || 0,
    tunjCuti: Number(document.getElementById('egTunjCuti').value) || 0,
    lembur: Number(document.getElementById('egLembur').value) || 0,
    insentif: Number(document.getElementById('egInsentif').value) || 0,
    reimbursement: Number(document.getElementById('egReimburse').value) || 0,
    bpjsKesehatan: Number(document.getElementById('egBPJSKes').value) || 0,
    bpjsTK: Number(document.getElementById('egBPJSTK').value) || 0,
    potongan: Number(document.getElementById('egPotongan').value) || 0,
    kasbon: Number(document.getElementById('egKasbon').value) || 0,
    pph21: Number(document.getElementById('egPPH').value) || 0,
    totalBersih: Number(document.getElementById('egTotal').value) || 0,
    updatedAt: new Date().toISOString(),
  };
  await db.collection('hrd_penggajian').doc(id).update(data);
  closeModalDirect();
  toast('Slip gaji diupdate', 'success');
  loadGaji();
}

// == REIMBURSEMENT ============================================-
async function renderReimbursement() {
  const main = document.getElementById('mainContent');
  main.innerHTML = `<div class="page-title"><span>🧾 Reimbursement</span><button class="btn btn-primary btn-sm" onclick="modalReimburse()">+ Pengajuan</button></div><div class="card"><div class="table-wrap"><table><thead><tr><th>Karyawan</th><th>Kategori</th><th>Jumlah</th><th>Status</th><th>Aksi</th></tr></thead><tbody id="tblReimb"></tbody></table></div></div>`;
  const [snap, flows] = await Promise.all([
    db.collection('hrd_reimbursement').get(),
    loadApprovalFlows(),
  ]);
  const isBOD = currentUser.role === 'bod';
  let gradeMapReimb = {};
  if (isBOD) {
    const kSnap = await db.collection('hrd_karyawan').get();
    for (const d of kSnap.docs) { const k = d.data();
      gradeMapReimb[(k.nama || '').toLowerCase()] = (
        k.gradeJabatan ||
        k.posisi ||
        ''
      ).toLowerCase();
    }
  }
  let h = '';
  if (snap.empty) h = '<tr><td colspan="5" class="text-center">Belum ada</td></tr>';
  else
    snap.forEach((d) => {
      const p = d.data();
      if (isBOD) {
        const grade = gradeMapReimb[(p.nama || '').toLowerCase()] || '';
        if (!grade.includes('head')) return;
      }
      const badge =
        p.status === 'approved'
          ? 'badge-success'
          : p.status === 'rejected'
            ? 'badge-danger'
            : 'badge-warning';
      const canApprove = p.status === 'pending' && hasAccess(3) && !isBOD;
      const pendingInfo = pendingApproverHtml(flows, p, p.status, p.approvalStep, getApprovalCategory('hrd_reimbursement', p));
      h += `<tr><td class="fw-700">${escHtml(p.nama)}</td><td>${escHtml(p.kategori)}</td><td>${formatCurrency(p.jumlah)}</td><td><span class="badge ${badge}">${p.status}</span>${pendingInfo}</td><td><button class="btn btn-xs btn-info" onclick="viewReimb('${d.id}')">👁️</button> ${canApprove ? `<button class="btn btn-xs btn-success" onclick="approveReimb('${d.id}','approved')">✅</button> <button class="btn btn-xs btn-danger" onclick="approveReimb('${d.id}','rejected')">❌</button>` : ''} <button class="btn btn-xs btn-warning" onclick="editReimb('${d.id}')">✏️</button> ${hasAccess(6) ? `<button class="btn btn-xs btn-danger" onclick="hapusDoc('hrd_reimbursement','${d.id}','reimbursement')">🗑️</button>` : ''}</td></tr>`;
    });
  document.getElementById('tblReimb').innerHTML = h;
}
function modalReimburse() {
  openModal(
    `<div class="modal-title">Pengajuan Reimbursement</div>
    <div class="grid-2">
      <div class="form-group"><label>Nama</label><input class="form-control" id="rbNama" value="${currentUser.nama}"></div>
      <div class="form-group"><label>Kategori</label><select class="form-control" id="rbKat"><option>Transport</option><option>Makan</option><option>Kesehatan</option><option>Operasional</option></select></div>
    </div>
    <div class="form-group">
      <label>Jumlah (Rp)</label>
      <input class="form-control" type="number" id="rbJumlah" oninput="document.getElementById('rbJumlahHelper').innerText = formatCurrency(this.value)">
      <div id="rbJumlahHelper" class="text-xs mt-4 color-primary fw-700">Rp 0</div>
    </div>
    <div class="form-group"><label>Eviden (JPG, PNG, PDF, Word)</label><input type="file" id="rbFile" class="form-control" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"></div>
    <div class="form-group"><label>Keterangan</label><textarea class="form-control" id="rbKet"></textarea></div>
    <button class="btn btn-primary" onclick="simpanReimburse()">Ajukan</button>`
  );
}
async function simpanReimburse() {
  const btn = event.target;
  const originalText = btn.innerText;

  const jumlah = Number(document.getElementById('rbJumlah').value) || 0;
  if (!jumlah) return toast('Jumlah wajib', 'warning');

  const fileInput = document.getElementById('rbFile');
  let evidenceURL = '';

  try {
    btn.disabled = true;
    btn.innerText = 'Uploading...';

    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const path = `reimbursements/${Date.now()}_${file.name}`;
      evidenceURL = await uploadFileToStorage(file, path);
    }

    const data = {
      nama: document.getElementById('rbNama').value,
      kategori: document.getElementById('rbKat').value,
      jumlah: jumlah,
      keterangan: document.getElementById('rbKet').value,
      evidenceURL: evidenceURL,
      status: 'pending',
      userId: currentUser.id,
      createdAt: new Date().toISOString(),
    };

    await db.collection('hrd_reimbursement').add(data);
    closeModalDirect();
    toast('Diajukan', 'success');
    renderReimbursement();
  } catch (e) {
    console.error(e);
    toast('Gagal: ' + e.message, 'danger');
  } finally {
    btn.disabled = false;
    btn.innerText = originalText;
  }
}
async function approveReimb(id, status) {
  var komentar = '';
  if (status === 'rejected') {
    komentar = prompt('Alasan penolakan:');
    if (!komentar) return;
  } else {
    komentar = prompt('Komentar approval (opsional):') || '';
  }
  var updateData = {
    status: status,
    approvedBy: currentUser.nama,
    approvedAt: new Date().toISOString(),
  };
  if (komentar) updateData.approvalComment = komentar;
  if (status === 'rejected') {
    updateData.rejectedBy = currentUser.nama;
    updateData.alasanTolak = komentar;
  }
  await db.collection('hrd_reimbursement').doc(id).update(updateData);
  toast(
    status === 'approved' ? '✅ Reimbursement disetujui' : '❌ Reimbursement ditolak',
    'success'
  );
  renderReimbursement();
}
async function viewReimb(id) {
  const d = await db.collection('hrd_reimbursement').doc(id).get();
  if (!d.exists) return toast('Data tidak ditemukan', 'danger');
  const p = d.data();
  let h = `<div class="modal-title">🧾 Detail Reimbursement</div>
    <div class="grid-2">
      <div><label class="text-xs color-gray">Nama</label><div class="fw-700">${escHtml(p.nama)}</div></div>
      <div><label class="text-xs color-gray">Kategori</label><div class="fw-700">${escHtml(p.kategori)}</div></div>
      <div><label class="text-xs color-gray">Jumlah</label><div class="fw-700 color-primary">${formatCurrency(p.jumlah)}</div></div>
      <div><label class="text-xs color-gray">Status</label><div><span class="badge badge-${p.status === 'approved' ? 'success' : p.status === 'rejected' ? 'danger' : 'warning'}">${p.status}</span></div></div>
      <div><label class="text-xs color-gray">Tanggal</label><div>${formatDate(p.createdAt)}</div></div>
    </div>
    <div class="mt-12"><label class="text-xs color-gray">Keterangan</label><div class="text-sm">${escHtml(p.keterangan || '-')}</div></div>`;

  if (p.evidenceURL) {
    const isImg = p.evidenceURL.match(/\.(jpg|jpeg|png|gif|webp)/i);
    h += `<div class="mt-12"><label class="text-xs color-gray">Eviden / Bukti</label>
      <div class="mt-4">
        ${isImg ? `<img src="${p.evidenceURL}" style="max-width:100%;border-radius:8px;cursor:pointer" onclick="window.open('${p.evidenceURL}')">` : `<a href="${p.evidenceURL}" target="_blank" class="btn btn-xs btn-outline-primary">📎 Lihat Dokumen</a>`}
      </div>
    </div>`;
  }

  if (p.approvalComment || p.alasanTolak) {
    h += `<div class="mt-12 p-8 bg-light border-radius-8"><label class="text-xs color-gray">Catatan Approval</label><div class="text-sm italic">${escHtml(p.approvalComment || p.alasanTolak)}</div></div>`;
  }

  openModal(h);
}

// == KASBON & LOAN ============================================-
async function renderKasbon() {
  const main = document.getElementById('mainContent');
  main.innerHTML = `<div class="page-title"><span>💳 Kasbon & Loan</span><button class="btn btn-primary btn-sm" onclick="modalKasbon()">+ Pengajuan</button></div><div class="card"><div class="table-wrap"><table><thead><tr><th>Karyawan</th><th>Jenis</th><th>Total Pinjaman</th><th>Angsuran/Bln</th><th>Durasi</th><th>Sudah Bayar</th><th>Sisa</th><th>Sisa Bulan</th><th>Status</th><th>Aksi</th></tr></thead><tbody id="tblKasbon"></tbody></table></div></div>`;
  const snap = await db.collection('hrd_kasbon').get();
  const isBOD = currentUser.role === 'bod';
  let gradeMapKasbon = {};
  if (isBOD) {
    const kSnap = await db.collection('hrd_karyawan').get();
    kSnap.forEach((d) => {
      const k = d.data();
      gradeMapKasbon[(k.nama || '').toLowerCase()] = (
        k.gradeJabatan ||
        k.posisi ||
        ''
      ).toLowerCase();
     });
  }
  const items = [];
  for (const d of snap.docs) { const data = { id: d.id, ...d.data() };
    if (isBOD) {
      const grade = gradeMapKasbon[(data.nama || '').toLowerCase()] || '';
      if (!grade.includes('head')) return;
    }
    items.push(data);
  }
  items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  let h = '';
  if (!items.length) h = '<tr><td colspan="10" class="text-center">Belum ada</td></tr>';
  else
    items.forEach((p) => {
      const jumlah = p.jumlah || 0;
      const cicilan = p.cicilan || 1;
      const angsuran = Math.ceil(jumlah / cicilan);
      const sudahBayar = p.sudahBayar || 0;
      const sisa = Math.max(0, jumlah - sudahBayar);
      const sisaBulan = Math.ceil(sisa / angsuran) || 0;
      const badge =
        p.status === 'approved' || p.status === 'aktif'
          ? 'badge-success'
          : p.status === 'lunas'
            ? 'badge-primary'
            : p.status === 'rejected'
              ? 'badge-danger'
              : 'badge-warning';
      const canApprove = p.status === 'pending' && hasAccess(3) && !isBOD;
      h += `<tr><td class="fw-700">${escHtml(p.nama)}</td><td>${escHtml(p.jenis || '-')}</td><td>${formatCurrency(jumlah)}</td><td class="fw-700">${formatCurrency(angsuran)}</td><td>${cicilan} bulan</td><td>${formatCurrency(sudahBayar)}</td><td class="fw-700" style="color:${sisa > 0 ? 'var(--danger)' : 'var(--success)'}">${formatCurrency(sisa)}</td><td>${p.status === 'lunas' ? '✅ Lunas' : sisaBulan + ' bln'}</td><td><span class="badge ${badge}">${p.status || 'pending'}</span></td><td><button class="btn btn-xs btn-info" onclick="viewKasbon('${p.id}')">👁️</button> ${canApprove ? `<button class="btn btn-xs btn-success" onclick="approveKasbon('${p.id}','aktif')">✅</button> <button class="btn btn-xs btn-danger" onclick="approveKasbon('${p.id}','rejected')">❌</button>` : ''} ${p.status === 'aktif' ? `<button class="btn btn-xs btn-info" onclick="bayarAngsuran('${p.id}')">💰 Bayar</button>` : ''} <button class="btn btn-xs btn-warning" onclick="editKasbonDoc('${p.id}')">✏️</button> ${hasAccess(6) ? `<button class="btn btn-xs btn-danger" onclick="hapusDoc('hrd_kasbon','${p.id}','kasbon')">🗑️</button>` : ''}</td></tr>`;
    });
  document.getElementById('tblKasbon').innerHTML = h;
}
function modalKasbon() {
  openModal(
    `<div class="modal-title">Pengajuan Kasbon/Loan</div>
    <div class="grid-2">
      <div class="form-group"><label>Nama</label><input class="form-control" id="kbNama" value="${currentUser.nama}"></div>
      <div class="form-group"><label>Jenis</label><select class="form-control" id="kbJenis"><option>Kasbon</option><option>Pinjaman Karyawan</option></select></div>
    </div>
    <div class="grid-2">
      <div class="form-group"><label>Total Pinjaman (Rp)</label><input class="form-control" type="number" id="kbJumlah" oninput="calcKasbonPreview()"></div>
      <div class="form-group"><label>Durasi Cicilan (bulan)</label><input class="form-control" type="number" id="kbCicilan" value="3" min="1" oninput="calcKasbonPreview()"></div>
    </div>
    <div style="background:#f8f9ff;border-radius:8px;padding:10px;margin-bottom:14px">
      <div class="grid-2" style="font-size:.82rem"><div><b>Angsuran/bulan:</b> <span id="kbAngsuranPreview">Rp 0</span></div><div><b>Potongan gaji otomatis:</b> Ya</div></div>
    </div>
    <div class="form-group">
      <label>Lampiran / Eviden (JPG, PNG, PDF, Word, Excel)</label>
      <input type="file" id="kbFile" class="form-control" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx">
    </div>
    <div class="form-group"><label>Keterangan</label><input class="form-control" id="kbKet" placeholder="Keperluan pinjaman"></div>
    <button class="btn btn-primary" onclick="simpanKasbon()">Ajukan</button>`
  );
}
function calcKasbonPreview() {
  const jml = Number(document.getElementById('kbJumlah').value) || 0;
  const cic = Number(document.getElementById('kbCicilan').value) || 1;
  document.getElementById('kbAngsuranPreview').textContent = formatCurrency(Math.ceil(jml / cic));
}
async function simpanKasbon() {
  const btn = event.target;
  const originalText = btn.innerText;

  const jumlah = Number(document.getElementById('kbJumlah').value) || 0;
  const cicilan = Number(document.getElementById('kbCicilan').value) || 1;
  if (!jumlah) return toast('Jumlah wajib', 'warning');

  const fileInput = document.getElementById('kbFile');
  let evidenceURL = '';

  try {
    btn.disabled = true;
    btn.innerText = 'Uploading...';

    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const path = `kasbon/${Date.now()}_${file.name}`;
      evidenceURL = await uploadFileToStorage(file, path);
    }

    const data = {
      nama: document.getElementById('kbNama').value,
      jenis: document.getElementById('kbJenis').value,
      jumlah,
      cicilan,
      angsuran: Math.ceil(jumlah / cicilan),
      sudahBayar: 0,
      keterangan: document.getElementById('kbKet').value,
      evidenceURL: evidenceURL,
      status: 'pending',
      userId: currentUser.id,
      createdAt: new Date().toISOString(),
    };
    await db.collection('hrd_kasbon').add(data);
    closeModalDirect();
    toast('Diajukan', 'success');
    renderKasbon();
  } catch (e) {
    console.error(e);
    toast('Gagal: ' + e.message, 'danger');
  } finally {
    btn.disabled = false;
    btn.innerText = originalText;
  }
}
async function viewKasbon(id) {
  const d = await db.collection('hrd_kasbon').doc(id).get();
  if (!d.exists) return toast('Data tidak ditemukan', 'danger');
  const p = d.data();

  const angsuran = Math.ceil((p.jumlah || 0) / (p.cicilan || 1));
  const sisa = Math.max(0, (p.jumlah || 0) - (p.sudahBayar || 0));

  let h = `<div class="modal-title">📑 Detail Kasbon/Loan</div>
    <div class="grid-2">
      <div><label class="text-xs color-gray">Nama</label><div class="fw-700">${escHtml(p.nama)}</div></div>
      <div><label class="text-xs color-gray">Jenis</label><div class="fw-700">${escHtml(p.jenis || '-')}</div></div>
      <div><label class="text-xs color-gray">Total Pinjaman</label><div class="fw-700 color-primary">${formatCurrency(p.jumlah)}</div></div>
      <div><label class="text-xs color-gray">Angsuran / Bln</label><div class="fw-700 color-danger">${formatCurrency(angsuran)}</div></div>
      <div><label class="text-xs color-gray">Durasi</label><div>${p.cicilan} bulan</div></div>
      <div><label class="text-xs color-gray">Status</label><div><span class="badge badge-${p.status === 'lunas' ? 'primary' : p.status === 'aktif' || p.status === 'approved' ? 'success' : p.status === 'rejected' ? 'danger' : 'warning'}">${p.status || 'pending'}</span></div></div>
      <div><label class="text-xs color-gray">Sudah Bayar</label><div>${formatCurrency(p.sudahBayar || 0)}</div></div>
      <div><label class="text-xs color-gray">Sisa</label><div class="fw-700">${formatCurrency(sisa)}</div></div>
    </div>
    <div class="mt-12"><label class="text-xs color-gray">Keterangan</label><div class="text-sm">${escHtml(p.keterangan || '-')}</div></div>`;

  if (p.evidenceURL) {
    const isImg = p.evidenceURL.match(/\.(jpg|jpeg|png|gif|webp)/i);
    h += `<div class="mt-12"><label class="text-xs color-gray">Lampiran / Bukti</label>
      <div class="mt-4">
        ${isImg ? `<img src="${p.evidenceURL}" style="max-width:100%;border-radius:8px;cursor:pointer" onclick="window.open('${p.evidenceURL}')">` : `<a href="${p.evidenceURL}" target="_blank" class="btn btn-xs btn-outline-primary">📎 Lihat Dokumen</a>`}
      </div>
    </div>`;
  }

  if (p.approvalComment || p.alasanTolak) {
    h += `<div class="mt-12 p-8 bg-light border-radius-8"><label class="text-xs color-gray">Catatan Approval</label><div class="text-sm italic">${escHtml(p.approvalComment || p.alasanTolak)}</div></div>`;
  }

  if (p.paymentHistory && p.paymentHistory.length) {
    h += `<div class="mt-12"><div class="fw-700 text-sm mb-8">📜 Riwayat Pembayaran Angsuran</div><div class="table-wrap"><table style="font-size:.82rem;width:100%"><thead><tr><th style="text-align:left;padding:4px 8px">#</th><th style="text-align:left;padding:4px 8px">Tanggal</th><th style="text-align:right;padding:4px 8px">Jumlah</th><th style="text-align:left;padding:4px 8px">Dicatat Oleh</th></tr></thead><tbody>`;
    p.paymentHistory.forEach((ph, i) => {
      const tgl = ph.tanggal ? new Date(ph.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
      h += `<tr><td style="padding:4px 8px">${i + 1}</td><td style="padding:4px 8px">${tgl}</td><td style="padding:4px 8px;text-align:right;color:var(--danger)">${formatCurrency(ph.jumlah || 0)}</td><td style="padding:4px 8px">${escHtml(ph.dicatatOleh || '-')}</td></tr>`;
    });
    h += `</tbody></table></div></div>`;
  }

  openModal(h);
}
async function approveKasbon(id, status) {
  var komentar = '';
  if (status === 'rejected') {
    komentar = prompt('Alasan penolakan:');
    if (!komentar) return;
  } else {
    komentar = prompt('Komentar approval (opsional):') || '';
  }
  var updateData = {
    status: status,
    approvedBy: currentUser.nama,
    approvedAt: new Date().toISOString(),
  };
  if (komentar) updateData.approvalComment = komentar;
  if (status === 'rejected') {
    updateData.rejectedBy = currentUser.nama;
    updateData.alasanTolak = komentar;
  }
  await db.collection('hrd_kasbon').doc(id).update(updateData);
  toast(status === 'approved' ? '✅ Kasbon disetujui' : '❌ Kasbon ditolak', 'success');
  renderKasbon();
}
async function bayarAngsuran(id) {
  const doc = await db.collection('hrd_kasbon').doc(id).get();
  const p = doc.data();
  const angsuran = Math.ceil((p.jumlah || 0) / (p.cicilan || 1));
  const newSudahBayar = (p.sudahBayar || 0) + angsuran;
  const sisa = Math.max(0, (p.jumlah || 0) - newSudahBayar);
  const paymentAt = new Date().toISOString();
  const paymentHistory = [...(p.paymentHistory || []), { jumlah: angsuran, tanggal: paymentAt, dicatatOleh: currentUser.nama }];
  const update = { sudahBayar: newSudahBayar, lastPayment: paymentAt, paymentHistory };
  if (sisa <= 0) update.status = 'lunas';
  await db.collection('hrd_kasbon').doc(id).update(update);
  toast(`Angsuran ${formatCurrency(angsuran)} dibayar. Sisa: ${formatCurrency(sisa)}`, 'success');
  renderKasbon();
}

// == TUNJANGAN ================================================-
async function renderTunjangan() {
  const main = document.getElementById('mainContent');
  main.innerHTML = `<div class="page-title"><span>🎁 Tunjangan & Benefit</span><div class="flex gap-8"><button class="btn btn-success btn-sm" onclick="generateDefaultTunjangan()">⚡ Generate Default</button><button class="btn btn-primary btn-sm" onclick="modalTunjangan()">+ Tambah</button></div></div>
  <div class="card mb-16" style="background:#f8f9ff;border-left:4px solid var(--info)"><div class="text-sm" style="line-height:1.6"><b>Komponen Tunjangan:</b><br>• <b>Tunjangan Tetap</b>: Transport, Makan, Jabatan (berlaku untuk semua/per karyawan)<br>• <b>Tunjangan Tidak Tetap</b>: Komunikasi, Kehadiran (bisa berubah per bulan)<br>• Penerima "Semua" = berlaku untuk semua karyawan<br>• Penerima nama spesifik = hanya untuk karyawan tersebut</div></div>
  <div class="card"><div class="table-wrap"><table><thead><tr><th>Nama</th><th>Jenis</th><th>Nominal</th><th>Penerima</th><th>Aksi</th></tr></thead><tbody id="tblTunj"></tbody></table></div></div>`;
  const snap = await db.collection('hrd_tunjangan').get();
  let h = '';
  if (snap.empty)
    h =
      '<tr><td colspan="5" class="text-center">Belum ada. Klik "Generate Default" untuk membuat tunjangan standar.</td></tr>';
  else
    snap.forEach((d) => {
      const p = d.data();
      h += `<tr><td class="fw-700">${escHtml(p.nama)}</td><td><span class="badge badge-${p.jenis === 'tetap' ? 'success' : 'info'}">${p.jenis || 'tetap'}</span></td><td>${formatCurrency(p.nominal)}</td><td>${escHtml(p.penerima || 'Semua')}</td><td><button class="btn btn-xs btn-info" onclick="modalTunjangan('${d.id}')">✏️</button> <button class="btn btn-xs btn-danger" onclick="hapusDoc('hrd_tunjangan','${d.id}','tunjangan')">🗑️</button></td></tr>`;
     });
  document.getElementById('tblTunj').innerHTML = h;
}

async function generateDefaultTunjangan() {
  if (
    !confirm(
      'Generate tunjangan default untuk semua karyawan?\n\n• Tunjangan Transport: Rp 500.000\n• Tunjangan Makan: Rp 300.000\n• Tunjangan Komunikasi: Rp 200.000\n\nBerlaku untuk SEMUA karyawan. Anda bisa edit setelahnya.'
    )
  )
    return;
  const defaults = [
    { nama: 'Tunjangan Transport', jenis: 'tetap', nominal: 500000, penerima: 'Semua' },
    { nama: 'Tunjangan Makan', jenis: 'tetap', nominal: 300000, penerima: 'Semua' },
    { nama: 'Tunjangan Komunikasi', jenis: 'tidak_tetap', nominal: 200000, penerima: 'Semua' },
    {
      nama: 'Tunjangan Cuti',
      jenis: 'tetap',
      nominal: 0,
      penerima: 'Semua',
      keterangan:
        'Sesuai ketentuan pemerintah: 1x gaji pokok per tahun. Isi nominal per karyawan atau biarkan 0 jika belum berlaku.',
    },
  ];
  for (const t of defaults) {
    await db.collection('hrd_tunjangan').add({ ...t, createdAt: new Date().toISOString() });
  }
  toast('3 tunjangan default berhasil dibuat', 'success');
  renderTunjangan();
}
function modalTunjangan(id) {
  if (id)
    db.collection('hrd_tunjangan')
      .doc(id)
      .get()
      .then((d) => showTunjForm(id, d.data() || {}));
  else showTunjForm(null, {});
}
function showTunjForm(id, p) {
  openModal(
    `<div class="modal-title">${id ? 'Edit' : 'Tambah'} Tunjangan</div><div class="form-group"><label>Nama</label><input class="form-control" id="tjNama" value="${escHtml(p.nama || '')}"></div><div class="grid-2"><div class="form-group"><label>Jenis</label><select class="form-control" id="tjJenis"><option value="tetap" ${p.jenis === 'tetap' ? 'selected' : ''}>Tetap</option><option value="tidak_tetap" ${p.jenis === 'tidak_tetap' ? 'selected' : ''}>Tidak Tetap</option></select></div><div class="form-group"><label>Nominal</label><input class="form-control" type="number" id="tjNominal" value="${p.nominal || 0}"></div></div><div class="form-group"><label>Penerima</label><input class="form-control" id="tjPenerima" value="${escHtml(p.penerima || 'Semua')}"></div><button class="btn btn-primary" onclick="simpanTunjangan('${id || ''}')">Simpan</button>`
  );
}
async function simpanTunjangan(id) {
  const data = {
    nama: document.getElementById('tjNama').value,
    jenis: document.getElementById('tjJenis').value,
    nominal: Number(document.getElementById('tjNominal').value) || 0,
    penerima: document.getElementById('tjPenerima').value,
    updatedAt: new Date().toISOString(),
  };
  if (!data.nama) return toast('Nama wajib', 'warning');
  if (id) await db.collection('hrd_tunjangan').doc(id).update(data);
  else await db.collection('hrd_tunjangan').add({ ...data, createdAt: new Date().toISOString() });
  closeModalDirect();
  toast('Disimpan', 'success');
  renderTunjangan();
}

// == INSENTIF MODULE ==========================================-
async function renderInsentif() {
  const main = document.getElementById('mainContent');
  main.innerHTML = `<div class="page-title"><span>🏆 Insentif Kinerja</span><button class="btn btn-primary btn-sm" onclick="modalInsentif()">+ Tambah Insentif</button></div>
  <div class="card"><div style="background:#fff3e0;border-radius:8px;padding:12px;margin-bottom:16px;border-left:4px solid var(--warning)"><p class="text-sm" style="line-height:1.6"><b>Dua Jenis Insentif:</b><br><br><b>1. Insentif KPI (Kinerja)</b><br>• KPI ≥ 90 (Grade A) = <b>15%</b> dari Gaji Pokok<br>• KPI ≥ 80 (Grade B) = <b>10%</b> dari Gaji Pokok<br>• KPI ≥ 70 (Grade C) = <b>5%</b> dari Gaji Pokok<br>• KPI < 70 = <b>0%</b><br><br><b>2. Insentif Target Siswa (Manual)</b><br>• Berdasarkan jumlah siswa yang diterima/masuk<br>• Nominal per siswa ditentukan manual<br>• Contoh: 10 siswa × Rp 200.000 = Rp 2.000.000</p></div>
  <div class="flex gap-8 mb-16 flex-wrap"><button class="btn btn-success btn-sm" onclick="generateInsentifFromKPI()">⚡ Generate dari KPI</button><button class="btn btn-info btn-sm" onclick="modalInsentifSiswa()">🎓 Insentif Target Siswa</button><button class="btn btn-danger btn-sm" onclick="hapusSemuaInsentif()">🗑️ Hapus Semua</button></div>
  <div class="table-wrap"><table><thead><tr><th>Karyawan</th><th>Dept</th><th>Jenis</th><th>Basis</th><th>Nominal</th><th>Periode</th><th>Aksi</th></tr></thead><tbody id="tblInsentif"></tbody></table></div></div>`;
  const snap = await db.collection('hrd_insentif').get();
  const items = [];
  snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
  items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  let h = '';
  if (!items.length)
    h = '<tr><td colspan="7" class="text-center">Belum ada data insentif</td></tr>';
  else
    for (const p of items) { const jenis = p.jenis || 'KPI';
      const basis =
        jenis === 'KPI'
          ? `KPI ${p.kpiScore || 0} (${p.persen || 0}% gaji)`
          : `${p.jumlahSiswa || 0} siswa × ${formatCurrency(p.nominalPerSiswa || 0)}`;
      h += `<tr><td class="fw-700">${escHtml(p.nama)}</td><td>${escHtml(p.departemen || '-')}</td><td><span class="badge badge-${jenis === 'KPI' ? 'info' : 'success'}">${jenis}</span></td><td style="font-size:.78rem">${basis}</td><td class="fw-700">${formatCurrency(p.nominal || 0)}</td><td>${escHtml(p.periode || '-')}</td><td><button class="btn btn-xs btn-info" onclick="viewInsentifDetail('${p.id}')">👁️</button> <button class="btn btn-xs btn-primary" onclick="editInsentif('${p.id}')">✏️</button> <button class="btn btn-xs btn-danger" onclick="hapusDoc('hrd_insentif','${p.id}','insentif')">🗑️</button></td></tr>`;
    }
  document.getElementById('tblInsentif').innerHTML = h;
}

async function modalInsentif() {
  const kSnap = await db.collection('hrd_karyawan').where('status', '==', 'aktif').get();
  let opts = '<option value="">-- Pilih --</option>';
  kSnap.forEach((d) => {
    const k = d.data();
    opts += `<option value="${escHtml(k.nama)}" data-gaji="${k.gajiPokok || 0}" data-dept="${escHtml(k.departemen || '')}">${escHtml(k.nama)} — ${escHtml(k.departemen || '')} (${formatCurrency(k.gajiPokok || 0)})</option>`;
  });
  openModal(`<div class="modal-title">Tambah Insentif KPI</div>
    <div class="form-group"><label>Karyawan</label><select class="form-control" id="insKary" onchange="onInsKaryChange()">${opts}</select></div>
    <div class="grid-2"><div class="form-group"><label>KPI Score</label><input class="form-control" type="number" id="insKPI" value="0" oninput="calcInsentif()"></div><div class="form-group"><label>Periode</label><input class="form-control" id="insPeriode" value="${monthStr()}"></div></div>
    <div class="grid-2"><div class="form-group"><label>% Insentif (auto)</label><input class="form-control" id="insPersen" readonly></div><div class="form-group"><label>Nominal (auto)</label><input class="form-control" id="insNominal" readonly style="font-weight:700"></div></div>
    <button class="btn btn-primary" onclick="simpanInsentif()">Simpan</button>`);
}

async function modalInsentifSiswa() {
  const kSnap = await db.collection('hrd_karyawan').where('status', '==', 'aktif').get();
  let opts = '<option value="">-- Pilih --</option>';
  for (const d of kSnap.docs) { const k = d.data();
    opts += `<option value="${escHtml(k.nama)}" data-dept="${escHtml(k.departemen || '')}">${escHtml(k.nama)} — ${escHtml(k.departemen || '')}</option>`;
  }
  openModal(`<div class="modal-title">🎓 Insentif Target Siswa</div>
    <div style="background:#f9f9f9;border-radius:8px;padding:10px;margin-bottom:14px;font-size:.82rem;border-left:4px solid var(--info)">Hitung insentif berdasarkan jumlah siswa yang diterima/masuk. Nominal dihitung: Jumlah Siswa × Nominal per Siswa.</div>
    <div class="form-group"><label>Karyawan (PIC Rekrutmen)</label><select class="form-control" id="insSiswaKary" onchange="window._insSiswaDept=this.options[this.selectedIndex]?.dataset?.dept||''">${opts}</select></div>
    <div class="grid-2"><div class="form-group"><label>Jumlah Siswa Diterima</label><input class="form-control" type="number" id="insSiswaJml" value="0" oninput="calcInsentifSiswa()"></div><div class="form-group"><label>Nominal per Siswa (Rp)</label><input class="form-control" type="number" id="insSiswaRate" value="200000" oninput="calcInsentifSiswa()"></div></div>
    <div class="grid-2"><div class="form-group"><label>Periode</label><input class="form-control" id="insSiswaPeriode" value="${monthStr()}"></div><div class="form-group"><label>Total Insentif (auto)</label><input class="form-control" id="insSiswaTotal" readonly style="font-weight:700;font-size:1rem;color:var(--success)"></div></div>
    <div class="form-group"><label>Keterangan</label><input class="form-control" id="insSiswaKet" placeholder="Contoh: Batch April 2026, Program Reguler"></div>
    <button class="btn btn-primary" onclick="simpanInsentifSiswa()">Simpan</button>`);
}
function calcInsentifSiswa() {
  const jml = Number(document.getElementById('insSiswaJml').value) || 0;
  const rate = Number(document.getElementById('insSiswaRate').value) || 0;
  document.getElementById('insSiswaTotal').value = formatCurrency(jml * rate);
}
async function simpanInsentifSiswa() {
  const nama = document.getElementById('insSiswaKary').value;
  if (!nama) return toast('Pilih karyawan', 'warning');
  const jml = Number(document.getElementById('insSiswaJml').value) || 0;
  const rate = Number(document.getElementById('insSiswaRate').value) || 0;
  if (!jml) return toast('Isi jumlah siswa', 'warning');
  await db.collection('hrd_insentif').add({
    nama,
    departemen: window._insSiswaDept || '',
    jenis: 'Target Siswa',
    jumlahSiswa: jml,
    nominalPerSiswa: rate,
    nominal: jml * rate,
    periode: document.getElementById('insSiswaPeriode').value,
    status: 'approved',
    createdAt: new Date().toISOString(),
  });
  closeModalDirect();
  toast('Insentif target siswa disimpan', 'success');
  renderInsentif();
}

function onInsKaryChange() {
  const sel = document.getElementById('insKary');
  const opt = sel.options[sel.selectedIndex];
  window._insGaji = Number(opt?.dataset?.gaji) || 0;
  window._insDept = opt?.dataset?.dept || '';
  calcInsentif();
}
function calcInsentif() {
  const kpi = Number(document.getElementById('insKPI').value) || 0;
  let pct = 0;
  if (kpi >= 90) pct = 15;
  else if (kpi >= 80) pct = 10;
  else if (kpi >= 70) pct = 5;
  const nominal = Math.round(((window._insGaji || 0) * pct) / 100);
  document.getElementById('insPersen').value = pct + '%';
  document.getElementById('insNominal').value = formatCurrency(nominal);
  window._insCalc = { pct, nominal };
}
async function simpanInsentif() {
  const nama = document.getElementById('insKary').value;
  if (!nama) return toast('Pilih karyawan', 'warning');
  await db.collection('hrd_insentif').add({
    nama,
    departemen: window._insDept || '',
    gajiPokok: window._insGaji || 0,
    jenis: 'KPI',
    kpiScore: Number(document.getElementById('insKPI').value) || 0,
    persen: window._insCalc?.pct || 0,
    nominal: window._insCalc?.nominal || 0,
    periode: document.getElementById('insPeriode').value,
    status: 'approved',
    createdAt: new Date().toISOString(),
  });
  closeModalDirect();
  toast('Insentif disimpan', 'success');
  renderInsentif();
}

async function generateInsentifFromKPI() {
  if (!confirm('Generate insentif untuk semua karyawan berdasarkan data KPI terbaru?')) return;
  const kSnap = await db.collection('hrd_karyawan').where('status', '==', 'aktif').get();
  const kpiSnap = await db.collection('hrd_kpi').get();
  const kpiMap = {};
  for (const d of kpiSnap) { const r = d.data();
    const n = (r.nama || '').trim().toLowerCase();
    if (!kpiMap[n] || r.skor > kpiMap[n]) kpiMap[n] = r.skor || 0;
  }
  let count = 0;
  for (const doc of kSnap.docs) {
    const k = doc.data();
    const kpi = kpiMap[(k.nama || '').trim().toLowerCase()] || 0;
    let pct = 0;
    if (kpi >= 90) pct = 15;
    else if (kpi >= 80) pct = 10;
    else if (kpi >= 70) pct = 5;
    if (pct === 0) continue;
    const nominal = Math.round(((k.gajiPokok || 0) * pct) / 100);
    await db.collection('hrd_insentif').add({
      nama: k.nama,
      departemen: k.departemen || '',
      gajiPokok: k.gajiPokok || 0,
      kpiScore: kpi,
      persen: pct,
      nominal,
      periode: monthStr(),
      status: 'approved',
      createdAt: new Date().toISOString(),
    });
    count++;
  }
  toast(`${count} insentif di-generate dari KPI`, 'success');
  renderInsentif();
}
async function hapusSemuaInsentif() {
  if (!confirm('Hapus semua data insentif?')) return;
  const snap = await db.collection('hrd_insentif').get();
  const batch = db.batch();
  snap.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  toast('Semua insentif dihapus', 'success');
  renderInsentif();
}

function viewInsentifDetail(id) {
  db.collection('hrd_insentif')
    .doc(id)
    .get()
    .then((d) => {
      const p = d.data();
      openModal(`<div class="modal-title">🏆 Detail Insentif</div>
      <div class="grid-2 mb-16"><div><b>Nama:</b> ${escHtml(p.nama)}</div><div><b>Departemen:</b> ${escHtml(p.departemen || '-')}</div><div><b>Jenis:</b> ${escHtml(p.jenis || 'KPI')}</div><div><b>Periode:</b> ${escHtml(p.periode || '-')}</div><div><b>Nominal:</b> <span class="fw-700">${formatCurrency(p.nominal || 0)}</span></div>${p.jenis === 'KPI' ? `<div><b>KPI Score:</b> ${p.kpiScore || 0} (${p.persen || 0}%)</div>` : `<div><b>Siswa:</b> ${p.jumlahSiswa || 0} × ${formatCurrency(p.nominalPerSiswa || 0)}</div>`}</div>`);
    });
}
async function editInsentif(id) {
  const d = await db.collection('hrd_insentif').doc(id).get();
  const p = d.data();
  openModal(`<div class="modal-title">✏️ Edit Insentif</div>
    <div class="grid-2"><div class="form-group"><label>Nama</label><input class="form-control" id="eiNama" value="${escHtml(p.nama || '')}"></div><div class="form-group"><label>Nominal</label><input class="form-control" type="number" id="eiNominal" value="${p.nominal || 0}"></div></div>
    <div class="form-group"><label>Periode</label><input class="form-control" id="eiPeriode" value="${escHtml(p.periode || '')}"></div>
    <button class="btn btn-primary" onclick="simpanEditInsentif('${id}')">💾 Simpan</button>`);
}
async function simpanEditInsentif(id) {
  await db
    .collection('hrd_insentif')
    .doc(id)
    .update({
      nominal: Number(document.getElementById('eiNominal').value) || 0,
      periode: document.getElementById('eiPeriode').value,
      updatedAt: new Date().toISOString(),
    });
  closeModalDirect();
  toast('Insentif diupdate', 'success');
  renderInsentif();
}

// == TAX & BPJS CALCULATOR ====================================-
async function renderTaxCalc() {
  const main = document.getElementById('mainContent');
  const kSnap = await db.collection('hrd_karyawan').where('status', '==', 'aktif').get();
  let karyOpts = '<option value="">-- Input Manual --</option>';
  for (const d of kSnap.docs) { const k = d.data();
    karyOpts += `<option value="${k.gajiPokok || 0}" data-nama="${escHtml(k.nama)}">${escHtml(k.nama)} — ${formatCurrency(k.gajiPokok || 0)}</option>`;
  }
  main.innerHTML = `<div class="page-title"><span>🧮 Tax & BPJS Calculator</span></div>
    <div class="grid-2">
      <div class="card">
        <div class="card-title mb-16">🧮 Kalkulator Gaji</div>
        <div class="form-group"><label>Pilih Karyawan (atau input manual)</label><select class="form-control" id="tcKarySelect" onchange="onTcKarySelect()">${karyOpts}</select></div>
        <div class="form-group"><label>Gaji Pokok (Rp)</label><input class="form-control" type="number" id="tcGaji" value="5000000" oninput="calcTax()"></div>
        <div class="form-group"><label>Tunjangan (Rp)</label><input class="form-control" type="number" id="tcTunj" value="0" oninput="calcTax()"></div>
        <div class="form-group"><label>Lembur (Rp)</label><input class="form-control" type="number" id="tcLembur" value="0" oninput="calcTax()"></div>
        <div class="form-group"><label>Status PTKP</label><select class="form-control" id="tcPTKP" onchange="calcTax()"><option value="54000000">TK/0 (Rp 54.000.000)</option><option value="58500000">K/0 (Rp 58.500.000)</option><option value="63000000">K/1 (Rp 63.000.000)</option><option value="67500000">K/2 (Rp 67.500.000)</option><option value="72000000">K/3 (Rp 72.000.000)</option></select></div>
        <div style="background:#f8f9ff;padding:16px;border-radius:8px;margin-top:16px;border:1px solid var(--border)">
          <div class="fw-700 mb-12" style="color:var(--accent)">Hasil Perhitungan:</div>
          <div id="tcResultRows"></div>
          <div id="tcResultFooter" class="mt-12"></div>
        </div>
      </div>
      <div class="card">
        <div class="card-title mb-16">📊 Potongan per Karyawan</div>
        <div id="tcKaryList">Loading...</div>
      </div>
    </div>`;
  calcTax();
  loadTaxKaryList();
}
function onTcKarySelect() {
  const sel = document.getElementById('tcKarySelect');
  if (sel.value) {
    document.getElementById('tcGaji').value = sel.value;
    calcTax();
  }
}
function calcTax() {
  const gaji = Number(document.getElementById('tcGaji')?.value) || 0;
  const tunj = Number(document.getElementById('tcTunj')?.value) || 0;
  const lembur = Number(document.getElementById('tcLembur')?.value) || 0;
  const ptkp = Number(document.getElementById('tcPTKP')?.value) || 54000000;
  const bruto = gaji + tunj + lembur;
  // Allow manual override of potongan
  const bpjsKesAuto = Math.round(gaji * 0.01);
  const bpjsTKAuto = Math.round(gaji * 0.02);
  const bpjsKesPerusahaan = Math.round(gaji * 0.04);
  const bpjsTKPerusahaan = Math.round(gaji * 0.037);
  const nettoTahunan = Math.max(0, (bruto - bpjsKesAuto - bpjsTKAuto) * 12 - ptkp);
  let pphAuto = 0;
  if (nettoTahunan <= 60000000) pphAuto = nettoTahunan * 0.05;
  else if (nettoTahunan <= 250000000) pphAuto = 3000000 + (nettoTahunan - 60000000) * 0.15;
  else if (nettoTahunan <= 500000000)
    pphAuto = 3000000 + 28500000 + (nettoTahunan - 250000000) * 0.25;
  else pphAuto = 3000000 + 28500000 + 62500000 + (nettoTahunan - 500000000) * 0.3;
  const pphBulananAuto = Math.round(pphAuto / 12);
  // Use manual values if user edited them, otherwise auto
  const bpjsKes = Number(document.getElementById('tcBpjsKes')?.value) || bpjsKesAuto;
  const bpjsTK = Number(document.getElementById('tcBpjsTK')?.value) || bpjsTKAuto;
  const pphBulanan = Number(document.getElementById('tcPPH')?.value) || pphBulananAuto;
  const thp = bruto - bpjsKes - bpjsTK - pphBulanan;

  document.getElementById('tcResultRows').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #eee"><span style="font-size:.85rem">Bruto</span><span class="fw-700">${formatCurrency(bruto)}</span></div>
    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #eee"><span style="font-size:.82rem">BPJS Kes (1%)</span><input class="form-control" type="number" id="tcBpjsKes" value="${bpjsKes}" oninput="calcTaxResult()" style="width:130px;text-align:right;padding:4px 8px;font-size:.82rem;color:var(--accent)"></div>
    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #eee"><span style="font-size:.82rem">BPJS TK/JHT (2%)</span><input class="form-control" type="number" id="tcBpjsTK" value="${bpjsTK}" oninput="calcTaxResult()" style="width:130px;text-align:right;padding:4px 8px;font-size:.82rem;color:var(--accent)"></div>
    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #eee"><span style="font-size:.82rem">PPH 21/bulan</span><input class="form-control" type="number" id="tcPPH" value="${pphBulanan}" oninput="calcTaxResult()" style="width:130px;text-align:right;padding:4px 8px;font-size:.82rem;color:var(--accent)"></div>
    <div style="display:flex;justify-content:space-between;padding:12px 0;font-weight:700;font-size:1.05rem;border-top:2px solid var(--accent);margin-top:4px"><span>Take Home Pay</span><span id="tcTHP">${formatCurrency(thp)}</span></div>`;
  document.getElementById('tcResultFooter').innerHTML =
    `<div style="font-size:.75rem;color:#666;padding-top:8px;border-top:1px dashed #ddd"><b>Kontribusi Perusahaan:</b><br>BPJS Kes (4%): ${formatCurrency(bpjsKesPerusahaan)}<br>BPJS TK (3.7%): ${formatCurrency(bpjsTKPerusahaan)}</div>
    <div class="text-xs mt-8" style="color:#999">💡 Nilai potongan bisa diedit manual. Klik angka untuk mengubah.</div>`;
}
function calcTaxResult() {
  const gaji = Number(document.getElementById('tcGaji')?.value) || 0;
  const tunj = Number(document.getElementById('tcTunj')?.value) || 0;
  const lembur = Number(document.getElementById('tcLembur')?.value) || 0;
  const bruto = gaji + tunj + lembur;
  const bpjsKes = Number(document.getElementById('tcBpjsKes')?.value) || 0;
  const bpjsTK = Number(document.getElementById('tcBpjsTK')?.value) || 0;
  const pph = Number(document.getElementById('tcPPH')?.value) || 0;
  const thp = bruto - bpjsKes - bpjsTK - pph;
  const el = document.getElementById('tcTHP');
  if (el) el.textContent = formatCurrency(thp);
}
async function loadTaxKaryList() {
  const snap = await db.collection('hrd_karyawan').where('status', '==', 'aktif').get();
  let h =
    '<div class="table-wrap"><table><thead><tr><th>Nama</th><th>Gaji</th><th>BPJS Kes</th><th>BPJS TK</th><th>PPH21</th><th>THP</th></tr></thead><tbody>';
  snap.forEach((d) => {
    const k = d.data();
    const gaji = k.gajiPokok || 0;
    const bpjsKes = Math.round(gaji * 0.01);
    const bpjsTK = Math.round(gaji * 0.02);
    const netto = Math.max(0, (gaji - bpjsKes - bpjsTK) * 12 - 54000000);
    let pph = 0;
    if (netto <= 60000000) pph = netto * 0.05;
    else if (netto <= 250000000) pph = 3000000 + (netto - 60000000) * 0.15;
    else pph = 3000000 + 28500000 + (netto - 250000000) * 0.25;
    const pphBln = Math.round(pph / 12);
    const thp = gaji - bpjsKes - bpjsTK - pphBln;
    h += `<tr><td class="fw-700">${escHtml(k.nama)}</td><td>${formatCurrency(gaji)}</td><td style="color:var(--accent)">${formatCurrency(bpjsKes)}</td><td style="color:var(--accent)">${formatCurrency(bpjsTK)}</td><td style="color:var(--accent)">${formatCurrency(pphBln)}</td><td class="fw-700">${formatCurrency(thp)}</td></tr>`;
  });
  h += '</tbody></table></div>';
  document.getElementById('tcKaryList').innerHTML = h;
}
