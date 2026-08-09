const DB_KEY = "web-kelas-data";

const EDITOR_NAMES = ["NADYA ABILLA SHIVA", "RAPHAEL JOSEPHINE"];
const EDITOR_PASSWORD = "123456";
let currentUser = "";
let editUnlocked = false;

function isEditorRole(){
  return EDITOR_NAMES.includes((currentUser || "").toUpperCase());
}

function requireEditAccess(){
  if(editUnlocked) return true;

  if(!isEditorRole()){
    openModal(`
      <h3>🔒 Akses terbatas</h3>
      <p class="modal-desc">Hanya <strong>Nadya Abilla Shiva</strong> dan <strong>Raphael Josephine</strong> yang bisa mengedit absensi, tugas, dan pengumuman.</p>
      <div class="modal-actions"><button class="btn primary" id="btnTutupAkses">Mengerti</button></div>
    `, (box)=>{
      box.querySelector('#btnTutupAkses').onclick = closeModal;
    });
    return false;
  }

  openModal(`
    <h3>🔐 Masuk mode editor</h3>
    <p class="modal-desc">Halo <strong>${escapeHtml(currentUser)}</strong> — masukkan kata sandi editor untuk mulai mengedit.</p>
    <label>Kata sandi</label>
    <input type="password" id="inpPwEditor" placeholder="••••••" autocomplete="off">
    <p class="modal-error" id="pwEditorError" style="display:none;">Kata sandi salah, coba lagi.</p>
    <div class="modal-actions">
      <button class="btn ghost" id="btnBatalPw">Batal</button>
      <button class="btn primary" id="btnBukaPw">Buka</button>
    </div>
  `, (box)=>{
    const inp = box.querySelector('#inpPwEditor');
    const err = box.querySelector('#pwEditorError');
    inp.focus();
    const tryUnlock = ()=>{
      if(inp.value === EDITOR_PASSWORD){
        editUnlocked = true;
        closeModal();
        updateEditUI();
      }else{
        err.style.display = 'block';
        inp.value = '';
        inp.focus();
      }
    };
    box.querySelector('#btnBukaPw').onclick = tryUnlock;
    box.querySelector('#btnBatalPw').onclick = closeModal;
    inp.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') tryUnlock(); });
  });
  return false;
}

function updateEditUI(){
  const btn = document.getElementById('editStatusBtn');
  const label = document.getElementById('editStatusLabel');
  if(btn && label){
    btn.classList.toggle('unlocked', editUnlocked);
    btn.querySelector('.dot').textContent = editUnlocked ? '🔓' : '🔒';
    label.textContent = editUnlocked ? 'Mode edit aktif' : 'Mode edit';
  }
  ['lockHintAbsensi','lockHintTugas','lockHintPengumuman'].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.style.display = editUnlocked ? 'none' : 'flex';
  });
}

/* Data siswa awal — No & Nama (dari data absen kelas) */
const SISWA_AWAL = [
  "AATHIF","ADI SUYITNO","AGUNG AKBAR PAMUNGKAS","AL VINSA PRIMADANI",
  "ALFATHIR LUXSON ILHAM MUHTIYAR","ALIEF ISKANDAR ARMAIN","ANGELICA WILDATUL ROHMA",
  "AUREL DWI PUTRA CHERINA JUNIAN","BAGAS LEO SAPUTRA","DIMAS NATHAN RAHARDIAN",
  "EFAN MAULANA","FAITH KAYSAN SUTRISNO","GALENO GIBRAN KURNIAWAN",
  "JAVIER TRIABDA WICAKSONO","LUQMAN HAKIM NURDIANSYAH","MOCHAMMAD BAFIZA DAISYAHREZA",
  "MOCHAMMAD RIZKI ABDURAHMAN","MOHAMMAD HASAN FERDIYANSAH","MUHAMMAD ALDI RAHMAN BAIHAKI",
  "MUHAMMAD BINTANG SAMPURNO AJI","MUHAMMAD DAVA AKBAR HIDAYATULLAH","MUHAMMAD FAHROSI",
  "MUUHAMMAD FIRMAN DANI","MUHAMMAD HAIKAL JAWAHIR","MUHAMMAD IZAMUL KAROMAH",
  "MUHAMMAD REZA FAHLEVI","NADYA ABILLA SHIVA","NAKSAH FAHROBI","PRAMADITA ADITYA",
  "RAFAEL VALENCIA AKBAR","RAIHAN ADITYA SAPUTRA","RAPHAEL JOSEPHINE",
  "RISQI ADITYA SAPUTRA","SHINDU PUTRA DHARMAWANGSA","ZAINUR ROFIQI","ZAKIYATUS SAADAH"
];

function loadDB(){
  try{
    const raw = localStorage.getItem(DB_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){ console.warn("Gagal memuat data, mulai dari kosong.", e); }
  return {
    siswa: SISWA_AWAL.map((nama, i) => ({ id: "s" + (i+1), nama })),
    absensi: {},
    tugas: [],
    pengumuman: [],
    namaKelas: "X RPL 1",
    tagline: "Keep coding, keep trying. Karena bahkan program terbaik pun pernah gagal dijalankan.",
    dark: true
  };
}
function saveDB(){
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

let db = loadDB();
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,6);
const todayStr = () => new Date().toISOString().slice(0,10);
const fmtDate = (s) => {
  if(!s) return "-";
  const d = new Date(s+"T00:00:00");
  return d.toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'});
};

/* ---------------- NAV TABS ---------------- */
document.querySelectorAll('.tab').forEach(tab=>{
  tab.addEventListener('click', ()=>{
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.target).classList.add('active');
  });
});

/* ---------------- NAMA KELAS EDITABLE ---------------- */
const namaKelasEl = document.getElementById('namaKelas');
const taglineEl = document.getElementById('taglineKelas');
namaKelasEl.textContent = db.namaKelas;
taglineEl.textContent = db.tagline;
namaKelasEl.addEventListener('blur', ()=>{ db.namaKelas = namaKelasEl.textContent.trim() || "Kelas"; saveDB(); });
taglineEl.addEventListener('blur', ()=>{ db.tagline = taglineEl.textContent.trim(); saveDB(); });

/* ---------------- DARK MODE ---------------- */
const toggleDarkBtn = document.getElementById('toggleDark');
const modeLabel = document.getElementById('modeLabel');
function applyMode(){
  document.body.classList.toggle('dark', !!db.dark);
  toggleDarkBtn.querySelector('.dot').textContent = db.dark ? '◑' : '◐';
  modeLabel.textContent = db.dark ? 'Neon Gelap' : 'Neon Terang';
}
toggleDarkBtn.addEventListener('click', ()=>{
  db.dark = !db.dark;
  saveDB();
  applyMode();
});
applyMode();

/* ---------------- MODE EDITOR (kunci akses) ---------------- */
document.getElementById('editStatusBtn').addEventListener('click', ()=>{
  if(editUnlocked){
    if(confirm('Kunci lagi mode edit?')){
      editUnlocked = false;
      updateEditUI();
    }
    return;
  }
  requireEditAccess();
});
['btnUnlockAbsensi','btnUnlockTugas','btnUnlockPengumuman'].forEach(id=>{
  const b = document.getElementById(id);
  if(b) b.addEventListener('click', requireEditAccess);
});
updateEditUI();

/* ---------------- BACKUP & RESTORE ---------------- */
document.getElementById('btnBackup').addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify(db, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const tgl = todayStr();
  a.href = url;
  a.download = `cadangan-web-kelas-${tgl}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

const inpRestore = document.getElementById('inpRestore');
document.getElementById('btnRestoreTrigger').addEventListener('click', ()=> inpRestore.click());
inpRestore.addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (ev)=>{
    try{
      const data = JSON.parse(ev.target.result);
      if(!data || typeof data !== 'object') throw new Error('format tidak valid');
      if(!confirm('Pulihkan data dari file ini? Data yang sedang tampil di browser ini akan ditimpa.')) return;
      db = {
        siswa: Array.isArray(data.siswa) ? data.siswa : [],
        absensi: data.absensi || {},
        tugas: Array.isArray(data.tugas) ? data.tugas : [],
        pengumuman: Array.isArray(data.pengumuman) ? data.pengumuman : [],
        namaKelas: data.namaKelas || db.namaKelas,
        tagline: data.tagline || db.tagline,
        dark: !!data.dark
      };
      saveDB();
      namaKelasEl.textContent = db.namaKelas;
      taglineEl.textContent = db.tagline;
      applyMode();
      renderAbsensi(); renderTugas(); renderPengumuman(); renderBeranda();
      alert('Data berhasil dipulihkan.');
    }catch(err){
      alert('Gagal memulihkan: file bukan cadangan yang valid.');
    }
    inpRestore.value = "";
  };
  reader.readAsText(file);
});

/* ---------------- MODAL HELPER ---------------- */
const overlay = document.getElementById('modalOverlay');
const modalBox = document.getElementById('modalBox');
function openModal(html, onMount){
  modalBox.innerHTML = html;
  overlay.classList.add('show');
  if(onMount) onMount(modalBox);
}
function closeModal(){
  overlay.classList.remove('show');
  modalBox.innerHTML = "";
}
overlay.addEventListener('click', (e)=>{ if(e.target === overlay) closeModal(); });

/* =========================================================
   ABSENSI
   ========================================================= */
const tglAbsen = document.getElementById('tglAbsen');
tglAbsen.value = todayStr();
tglAbsen.addEventListener('change', renderAbsensi);

function setStatus(tgl, siswaId, kode){
  if(!db.absensi[tgl]) db.absensi[tgl] = {};
  db.absensi[tgl][siswaId] = (db.absensi[tgl][siswaId] === kode) ? null : kode;
  saveDB();
  renderAbsensi();
  renderBeranda();
}

function rekapSiswa(siswaId){
  const r = {H:0,I:0,S:0,A:0};
  Object.values(db.absensi).forEach(hari=>{
    const k = hari[siswaId];
    if(k && r[k] !== undefined) r[k]++;
  });
  return r;
}

function renderAbsensi(){
  const tgl = tglAbsen.value || todayStr();
  const body = document.getElementById('bodyAbsensi');
  body.innerHTML = "";
  db.siswa.forEach((s, idx)=>{
    const statusHariIni = (db.absensi[tgl] || {})[s.id];
    const rekap = rekapSiswa(s.id);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${idx+1}</td>
      <td>${escapeHtml(s.nama)}</td>
      <td>
        <div class="status-group">
          ${['H','I','S','A'].map(k=>`<button class="status-btn ${statusHariIni===k?'on':''}" data-code="${k}" data-id="${s.id}">${k}</button>`).join('')}
        </div>
      </td>
      <td class="rekap">${rekap.H}H · ${rekap.I}I · ${rekap.S}S · ${rekap.A}A</td>
    `;
    body.appendChild(tr);
  });

  body.querySelectorAll('.status-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      if(!requireEditAccess()) return;
      setStatus(tgl, btn.dataset.id, btn.dataset.code);
    });
  });

  document.getElementById('hintAbsensiKosong').classList.toggle('show', db.siswa.length === 0);
}

/* Data jadwal pelajaran — X RPL 1 */
const JADWAL = [
  { hari:"Senin", mapel:[
    {nama:"Matematika"},
    {nama:"Dasar Pengembangan PL dan Gim"},
    {nama:"Bahasa Indonesia"},
    {nama:"Bahasa Inggris"},
  ]},
  { hari:"Selasa", mapel:[
    {nama:"Algoritma dan Pemrograman Dasar", ruang:"Lab Kom 3"},
    {nama:"Ilmu Alam dan Sosial"},
    {nama:"PAI"},
    {nama:"Bahasa Indonesia"},
  ]},
  { hari:"Rabu", mapel:[
    {nama:"PAI"},
    {nama:"BK", ruang:"Kokurikuler"},
    {nama:"Seni Budaya"},
    {nama:"Matematika"},
    {nama:"PPKn"},
    {nama:"Sejarah Indonesia"},
  ]},
  { hari:"Kamis", mapel:[
    {nama:"Penjas/Olahraga"},
    {nama:"Project IPA dan IPS"},
    {nama:"Informatika", ruang:"Lab Kom 1"},
  ]},
  { hari:"Jumat", mapel:[
    {nama:"KKA (Koding dan Kecerdasan Artifisial)", ruang:"Lab RPL 2"},
    {nama:"Bahasa Inggris"},
    {nama:"Pemrograman Berorientasi Objek 1", ruang:"Lab Kom 1"},
  ]},
];

function renderJadwal(){
  const grid = document.getElementById('jadwalGrid');
  if(!grid) return;
  const hariIni = new Date().toLocaleDateString('id-ID', {weekday:'long'});
  grid.innerHTML = JADWAL.map(h=>`
    <div class="day-card reveal ${h.hari === hariIni ? 'today' : ''}">
      <div class="day-title">${h.hari}${h.hari === hariIni ? ' <span class="today-badge">hari ini</span>' : ''}</div>
      <ol class="subject-list">
        ${h.mapel.map(m=>`
          <li>
            <span class="subject-name">${escapeHtml(m.nama)}</span>
            ${m.ruang ? `<span class="room-tag">${escapeHtml(m.ruang)}</span>` : ''}
          </li>
        `).join('')}
      </ol>
    </div>
  `).join('');
}

/* Data struktur kelas — X RPL 1
   Kalau mau pasang foto asli: taruh file foto di folder yang sama
   (misalnya foto/ketua.jpg) lalu isi field "foto" dengan path-nya.
   Kalau foto belum ada / gagal dimuat, otomatis tampil avatar inisial. */
const STRUKTUR = [
  { peran:"Ketua Kelas", nama:"Shindu Putra Dharmawangsa", foto:"foto/ketua.jpg" },
  { peran:"Wakil Kelas", nama:"Angelica Wildatul Rohma",    foto:"foto/wakil.jpg" },
  { peran:"Sekretaris 1", nama:"Nadya Abilla Shiva",        foto:"foto/sekre1.jpg" },
  { peran:"Sekretaris 2", nama:"Raphael Josephine",         foto:"foto/sekre2.jpg" },
  { peran:"Bendahara 1", nama:"Javier Triabfa Wicaksono",   foto:"foto/bendahara1.jpg" },
  { peran:"Bendahara 2", nama:"Zakiyatus Saadah",           foto:"foto/bendahara2.jpg" },
];

function initials(nama){
  return nama.split(" ").filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase();
}

function renderStruktur(){
  const grid = document.getElementById('strukturGrid');
  if(!grid) return;
  grid.innerHTML = STRUKTUR.map(o=>`
    <div class="struktur-card reveal">
      <div class="struktur-photo">
        <span class="struktur-avatar">${initials(o.nama)}</span>
        ${o.foto ? `<img src="${o.foto}" alt="${escapeHtml(o.nama)}" onload="this.previousElementSibling.style.display='none'" onerror="this.remove()">` : ''}
      </div>
      <div class="struktur-role">${escapeHtml(o.peran)}</div>
      <div class="struktur-name">${escapeHtml(o.nama)}</div>
    </div>
  `).join('');
}

/* Data piket harian — X RPL 1 */
const PIKET = [
  { hari:"Senin", anggota:["Adi","Finza","Bintang","Dimas","Rizki","Afik","Caca","Adit"] },
  { hari:"Selasa", anggota:["Rehan","Kaka","Aldi","Jo","Agung","Izam","Reza"] },
  { hari:"Rabu", anggota:["Zaskia","Bafiza","Dafa","Evan","Lukman","Aditya","Atif"] },
  { hari:"Kamis", anggota:["Putra","Ferdi","Fatir","Ibra","Fafa","Roby","Alif"] },
  { hari:"Jumat", anggota:["Bagas","Dani","Nala","Jevi","Shindu","Haikal","Dimas"] },
];

function renderPiket(){
  const grid = document.getElementById('piketGrid');
  if(!grid) return;
  const hariIni = new Date().toLocaleDateString('id-ID', {weekday:'long'});
  grid.innerHTML = PIKET.map(h=>`
    <div class="day-card piket-card reveal ${h.hari === hariIni ? 'today' : ''}">
      <div class="day-title">${h.hari}${h.hari === hariIni ? ' <span class="today-badge">hari ini</span>' : ''}</div>
      <ol class="subject-list">
        ${h.anggota.map(n=>`<li><span class="subject-name">${escapeHtml(n)}</span></li>`).join('')}
      </ol>
    </div>
  `).join('');
}

/* ---------------- IMMERSIVE / INTERAKTIF ---------------- */
/* spotlight lembut yang ngikutin kursor */
const cursorGlow = document.getElementById('cursorGlow');
let glowRaf = null;
if(cursorGlow){
  window.addEventListener('pointermove', (e)=>{
    if(glowRaf) return;
    glowRaf = requestAnimationFrame(()=>{
      cursorGlow.style.setProperty('--mx', e.clientX + 'px');
      cursorGlow.style.setProperty('--my', e.clientY + 'px');
      glowRaf = null;
    });
  });
}

/* tilt 3D halus di kartu-kartu utama saat disorot mouse */
const TILT_SELECTOR = '.stat-card, .struktur-card, .day-card, .tugas-card, .sticky';
document.addEventListener('mousemove', (e)=>{
  const card = e.target.closest(TILT_SELECTOR);
  if(!card) return;
  const r = card.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width;
  const py = (e.clientY - r.top) / r.height;
  const rx = (0.5 - py) * 7;
  const ry = (px - 0.5) * 7;
  card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
});
document.addEventListener('mouseout', (e)=>{
  const card = e.target.closest(TILT_SELECTOR);
  if(card && (!e.relatedTarget || !card.contains(e.relatedTarget))) card.style.transform = '';
});

/* efek ripple saat tombol diklik */
document.addEventListener('click', (e)=>{
  const el = e.target.closest('.btn, .tab, .status-btn, .filter-btn, .mode-toggle, .icon-btn');
  if(!el) return;
  const rect = el.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.className = 'ripple-fx';
  const size = Math.max(rect.width, rect.height);
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
  ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
  el.appendChild(ripple);
  setTimeout(()=> ripple.remove(), 550);
});

/* angka statistik ngitung naik, bukan langsung ganti */
function animateNumber(el, to){
  if(!el) return;
  const from = parseInt(el.textContent, 10) || 0;
  if(from === to){ el.textContent = to; return; }
  const dur = 500;
  const start = performance.now();
  function step(now){
    const p = Math.min((now - start) / dur, 1);
    el.textContent = Math.round(from + (to - from) * p);
    if(p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ---------------- REVEAL ON SCROLL ---------------- */
let revealObserver = null;
function setupRevealObserver(){
  if(revealObserver) return;
  revealObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {threshold:0.12, rootMargin:"0px 0px -40px 0px"});
}
function observeReveals(){
  setupRevealObserver();
  document.querySelectorAll('.reveal:not(.in-view)').forEach(el=>{
    revealObserver.observe(el);
  });
}

/* =========================================================
   TUGAS
   ========================================================= */
function openTugasForm(existing){
  const isEdit = !!existing;
  openModal(`
    <h3>${isEdit ? 'Edit tugas' : 'Tugas baru'}</h3>
    <label>Mata pelajaran</label>
    <input type="text" id="inpMapel" placeholder="cth. Pemrograman Web" value="${isEdit ? escapeHtml(existing.mapel) : ''}">
    <label>Judul tugas</label>
    <input type="text" id="inpJudul" placeholder="cth. Membuat landing page" value="${isEdit ? escapeHtml(existing.judul) : ''}">
    <label>Deadline</label>
    <input type="date" id="inpDeadline" value="${isEdit ? existing.deadline : todayStr()}">
    <div class="modal-actions">
      <button class="btn ghost" id="btnBatal">Batal</button>
      <button class="btn primary" id="btnSimpan">${isEdit ? 'Simpan perubahan' : 'Simpan'}</button>
    </div>
  `, (box)=>{
    box.querySelector('#btnBatal').onclick = closeModal;
    box.querySelector('#btnSimpan').onclick = ()=>{
      const mapel = box.querySelector('#inpMapel').value.trim() || "Umum";
      const judul = box.querySelector('#inpJudul').value.trim();
      const deadline = box.querySelector('#inpDeadline').value;
      if(!judul) return;
      if(isEdit){
        existing.mapel = mapel;
        existing.judul = judul;
        existing.deadline = deadline;
      }else{
        db.tugas.push({id: uid(), mapel, judul, deadline, selesai:false});
      }
      saveDB();
      closeModal();
      renderTugas();
      renderBeranda();
    };
  });
}

document.getElementById('btnTambahTugas').addEventListener('click', ()=>{
  if(!requireEditAccess()) return;
  openTugasForm(null);
});

/* filter & pencarian tugas */
let tugasFilter = 'semua';
let tugasQuery = '';

document.getElementById('cariTugas').addEventListener('input', (e)=>{
  tugasQuery = e.target.value.trim().toLowerCase();
  renderTugas();
});
document.getElementById('filterTugas').addEventListener('click', (e)=>{
  const btn = e.target.closest('.filter-btn');
  if(!btn) return;
  document.querySelectorAll('#filterTugas .filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  tugasFilter = btn.dataset.filter;
  renderTugas();
});

function renderTugas(){
  const list = document.getElementById('listTugas');
  list.innerHTML = "";
  const today = todayStr();

  let filtered = db.tugas.filter(t=>{
    const overdue = !t.selesai && t.deadline && t.deadline < today;
    if(tugasFilter === 'aktif' && t.selesai) return false;
    if(tugasFilter === 'selesai' && !t.selesai) return false;
    if(tugasFilter === 'lewat' && !overdue) return false;
    if(tugasQuery){
      const hay = (t.judul + ' ' + t.mapel).toLowerCase();
      if(!hay.includes(tugasQuery)) return false;
    }
    return true;
  });

  const sorted = filtered.sort((a,b)=> (a.deadline||"").localeCompare(b.deadline||""));

  sorted.forEach(t=>{
    const overdue = !t.selesai && t.deadline && t.deadline < today;
    const div = document.createElement('div');
    div.className = 'tugas-card reveal' + (t.selesai ? ' done' : '') + (overdue ? ' overdue' : '');
    div.innerHTML = `
      <div class="tugas-main">
        <div class="tugas-mapel">${escapeHtml(t.mapel)}</div>
        <div class="tugas-judul ${t.selesai?'strike':''}">${escapeHtml(t.judul)}</div>
        <div class="tugas-deadline">${overdue ? '⚠ lewat deadline · ' : ''}deadline ${fmtDate(t.deadline)}</div>
      </div>
      <div class="tugas-actions">
        <button class="icon-btn" data-edit="${t.id}" title="Edit tugas">✎</button>
        <button class="btn small ${t.selesai?'':'primary'}" data-toggle="${t.id}">${t.selesai ? 'Batal selesai' : 'Tandai selesai'}</button>
        <button class="icon-btn" data-hapus="${t.id}" title="Hapus tugas">✕</button>
      </div>
    `;
    list.appendChild(div);
  });

  list.querySelectorAll('[data-edit]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      if(!requireEditAccess()) return;
      const t = db.tugas.find(x=>x.id===btn.dataset.edit);
      openTugasForm(t);
    });
  });
  list.querySelectorAll('[data-toggle]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      if(!requireEditAccess()) return;
      const t = db.tugas.find(x=>x.id===btn.dataset.toggle);
      t.selesai = !t.selesai;
      saveDB(); renderTugas(); renderBeranda();
    });
  });
  list.querySelectorAll('[data-hapus]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      if(!requireEditAccess()) return;
      if(!confirm('Hapus tugas ini?')) return;
      db.tugas = db.tugas.filter(x=>x.id!==btn.dataset.hapus);
      saveDB(); renderTugas(); renderBeranda();
    });
  });

  document.getElementById('hintTugasKosong').classList.toggle('show', db.tugas.length===0);
  document.getElementById('hintTugasFilterKosong').classList.toggle('show', db.tugas.length>0 && filtered.length===0);
  observeReveals();
}

/* =========================================================
   PENGUMUMAN
   ========================================================= */
document.getElementById('btnTambahPengumuman').addEventListener('click', ()=>{
  if(!requireEditAccess()) return;
  openModal(`
    <h3>Pengumuman baru</h3>
    <label>Judul</label>
    <input type="text" id="inpJudulP" placeholder="cth. Piket minggu depan">
    <label>Isi</label>
    <textarea id="inpIsiP" placeholder="Tulis detail pengumuman di sini..."></textarea>
    <div class="modal-actions">
      <button class="btn ghost" id="btnBatal">Batal</button>
      <button class="btn primary" id="btnSimpan">Simpan</button>
    </div>
  `, (box)=>{
    box.querySelector('#btnBatal').onclick = closeModal;
    box.querySelector('#btnSimpan').onclick = ()=>{
      const judul = box.querySelector('#inpJudulP').value.trim();
      const isi = box.querySelector('#inpIsiP').value.trim();
      if(!judul) return;
      db.pengumuman.unshift({id: uid(), judul, isi, tanggal: todayStr()});
      saveDB();
      closeModal();
      renderPengumuman();
      renderBeranda();
    };
  });
});

function renderPengumuman(){
  const board = document.getElementById('listPengumuman');
  board.innerHTML = "";
  db.pengumuman.forEach(p=>{
    const div = document.createElement('div');
    div.className = 'sticky reveal';
    div.innerHTML = `
      <div class="sticky-date">${fmtDate(p.tanggal)}</div>
      <div class="sticky-title">${escapeHtml(p.judul)}</div>
      <div class="sticky-body">${escapeHtml(p.isi)}</div>
      <button class="sticky-del" data-hapus="${p.id}">Hapus</button>
    `;
    board.appendChild(div);
  });
  board.querySelectorAll('[data-hapus]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      if(!requireEditAccess()) return;
      db.pengumuman = db.pengumuman.filter(p=>p.id!==btn.dataset.hapus);
      saveDB(); renderPengumuman(); renderBeranda();
    });
  });
  document.getElementById('hintPengumumanKosong').classList.toggle('show', db.pengumuman.length===0);
  observeReveals();
}

/* =========================================================
   BERANDA
   ========================================================= */
function renderBeranda(){
  animateNumber(document.getElementById('statSiswa'), db.siswa.length);

  const tgl = todayStr();
  const hadirHariIni = Object.values(db.absensi[tgl] || {}).filter(k=>k==='H').length;
  animateNumber(document.getElementById('statHadir'), hadirHariIni);

  animateNumber(document.getElementById('statTugas'), db.tugas.filter(t=>!t.selesai).length);
  animateNumber(document.getElementById('statPengumuman'), db.pengumuman.length);

  const pMini = document.getElementById('beranda-pengumuman');
  if(db.pengumuman.length===0){
    pMini.innerHTML = `<div class="mini-empty">Belum ada pengumuman.</div>`;
  }else{
    pMini.innerHTML = db.pengumuman.slice(0,4).map(p=>
      `<div>📌 <strong>${escapeHtml(p.judul)}</strong> — ${fmtDate(p.tanggal)}</div>`
    ).join('');
  }

  const tMini = document.getElementById('beranda-tugas');
  const aktif = db.tugas.filter(t=>!t.selesai).sort((a,b)=>(a.deadline||"").localeCompare(b.deadline||"")).slice(0,4);
  if(aktif.length===0){
    tMini.innerHTML = `<div class="mini-empty">Tidak ada tugas aktif.</div>`;
  }else{
    tMini.innerHTML = aktif.map(t=>
      `<div>📝 <strong>${escapeHtml(t.judul)}</strong> (${escapeHtml(t.mapel)}) — ${fmtDate(t.deadline)}</div>`
    ).join('');
  }
}

/* ---------------- UTIL ---------------- */
function escapeHtml(str=""){
  return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

/* ---------------- INIT ---------------- */
renderAbsensi();
renderTugas();
renderPengumuman();
renderBeranda();
renderJadwal();
renderPiket();
renderStruktur();
observeReveals();

/* =========================================================
   GATE: LOGIN → LOADING → WELCOME → DASHBOARD
   ========================================================= */
const gateLogin = document.getElementById('gateLogin');
const gateLoading = document.getElementById('gateLoading');
const gateWelcome = document.getElementById('gateWelcome');
const appRoot = document.getElementById('appRoot');
const loginNamaSelect = document.getElementById('loginNama');
const guestWrap = document.getElementById('guestWrap');
const loginGuestNama = document.getElementById('loginGuestNama');
const btnJadiGuest = document.getElementById('btnJadiGuest');
const btnMasuk = document.getElementById('btnMasuk');
const loaderStatus = document.getElementById('loaderStatus');
const loaderBarFill = document.getElementById('loaderBarFill');
const welcomeName = document.getElementById('welcomeName');

/* isi dropdown nama siswa */
db.siswa.forEach(s=>{
  const opt = document.createElement('option');
  opt.value = s.nama;
  opt.textContent = s.nama;
  loginNamaSelect.appendChild(opt);
});

let modeGuest = false;
btnJadiGuest.addEventListener('click', ()=>{
  modeGuest = !modeGuest;
  guestWrap.style.display = modeGuest ? 'block' : 'none';
  loginNamaSelect.disabled = modeGuest;
  btnJadiGuest.textContent = modeGuest ? '← Kembali pilih dari daftar siswa' : 'Bukan siswa X RPL 1? Masuk sebagai guru/tamu';
  if(modeGuest) loginGuestNama.focus();
});

const LOADING_STEPS = [
  "Memverifikasi akses",
  "Menghubungkan ke server kelas",
  "Menyiapkan dashboard"
];

btnMasuk.addEventListener('click', ()=>{
  const nama = modeGuest ? loginGuestNama.value.trim() : loginNamaSelect.value;
  if(!nama){
    (modeGuest ? loginGuestNama : loginNamaSelect).focus();
    return;
  }
  currentUser = nama;
  editUnlocked = false;
  updateEditUI();

  gateLogin.classList.add('hide');
  gateLoading.classList.remove('hide');

  let step = 0;
  loaderStatus.textContent = LOADING_STEPS[0];
  loaderBarFill.style.width = "10%";

  const stepTimer = setInterval(()=>{
    step++;
    if(step < LOADING_STEPS.length){
      loaderStatus.textContent = LOADING_STEPS[step];
      loaderBarFill.style.width = `${((step+1)/LOADING_STEPS.length)*100}%`;
    }
  }, 550);

  setTimeout(()=>{
    clearInterval(stepTimer);
    gateLoading.classList.add('hide');
    welcomeName.textContent = `Halo, ${nama}!`;
    gateWelcome.classList.remove('hide');

    setTimeout(()=>{
      gateWelcome.classList.add('hide');
      appRoot.classList.add('show');
      observeReveals();
    }, 1400);
  }, 550 * LOADING_STEPS.length + 150);
});

btnMasuk.addEventListener('keyup', ()=>{});
loginGuestNama.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') btnMasuk.click(); });