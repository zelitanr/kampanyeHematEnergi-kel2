// Instance penyimpanan Chart.js
const chartInstances = {};
let appData = null;
let chartsRendered = false;
let currentViewJurusan = true; // Toggle antara Jurusan & Gaya Belajar

// Fallback data real jika fetch JSON dibatasi oleh browser pada protokol file://
const FALLBACK_DATA = {
  meta: {
    judul: "Hasil Kuesioner Perilaku Hemat Energi Siswa Kelas XI",
    sumber: "Kuesioner - ENERGI XI (Perilaku) (Responses).xlsx",
    skala: "Likert 1-4 (1 = Jarang/Rendah, 4 = Selalu/Tinggi). Total 10 butir = 10-40.",
    jumlah_siswa_terdata: 639,
    jumlah_responden: 636,
    persen_partisipasi: 99.4,
    tanggal_pengisian: { awal: "2026-10-12", akhir: "2026-11-05" }
  },
  ringkasan: {
    rata_rata_skor: 3.36,
    rata_rata_total: 33.62,
    kategori: { "Sangat Baik": 378, "Baik": 234, "Cukup": 23, "Kurang": 1 },
    kategori_persen: { "Sangat Baik": 59.4, "Baik": 36.8, "Cukup": 3.6, "Kurang": 0.2 },
    persen_sering_rata_rata: 90.79,
    sorotan: {
      butir_tertinggi: [
        { kode: "P01", label: "Praktik hemat energi sehari-hari", rata_rata: 3.51 },
        { kode: "P02", label: "Tindakan nyata di bengkel, lab, kelas, rumah", rata_rata: 3.46 },
        { kode: "P06", label: "Cabut charger/steker setelah dipakai", rata_rata: 3.45 }
      ],
      butir_terendah: [
        { kode: "P04", label: "Batasi penggunaan gawai/laptop", rata_rata: 3.22, persen_jarang: 13.7 },
        { kode: "P09", label: "Berani menegur/mengajak teman hemat listrik", rata_rata: 3.22, persen_jarang: 13.2 },
        { kode: "P05", label: "Pilih fasilitas/transportasi hemat energi", rata_rata: 3.3, persen_jarang: 13.4 }
      ],
      jurusan_tertinggi: "PMN",
      jurusan_terendah: "PPLG"
    }
  },
  per_butir: [
    { id: 1, kode: "P01", label: "Praktik hemat energi sehari-hari", rata_rata: 3.51, persen_sering: 98.6 },
    { id: 2, kode: "P02", label: "Tindakan nyata di lab/kelas/rumah", rata_rata: 3.46, persen_sering: 95.4 },
    { id: 3, kode: "P03", label: "Matikan lampu/AC saat kelas kosong", rata_rata: 3.37, persen_sering: 90.6 },
    { id: 4, kode: "P04", label: "Batasi penggunaan gawai/laptop", rata_rata: 3.22, persen_sering: 86.3 },
    { id: 5, kode: "P05", label: "Pilih fasilitas/transport hemat energi", rata_rata: 3.30, persen_sering: 86.6 },
    { id: 6, kode: "P06", label: "Cabut charger/steker setelah dipakai", rata_rata: 3.45, persen_sering: 92.0 },
    { id: 7, kode: "P07", label: "Manfaatkan cahaya alami siang hari", rata_rata: 3.36, persen_sering: 89.5 },
    { id: 8, kode: "P08", label: "Atur suhu AC/kipas secukupnya", rata_rata: 3.31, persen_sering: 90.4 },
    { id: 9, kode: "P09", label: "Berani mengajak teman hemat listrik", rata_rata: 3.22, persen_sering: 86.8 },
    { id: 10, kode: "P10", label: "Pastikan peralatan mati saat pulang", rata_rata: 3.41, persen_sering: 91.7 }
  ],
  per_jurusan: [
    { kode: "PMN", nama: "Pemasaran", jumlah_responden: 72, rata_rata_skor: 3.51 },
    { kode: "HTL", nama: "Perhotelan", jumlah_responden: 69, rata_rata_skor: 3.46 },
    { kode: "KLN", nama: "Kuliner", jumlah_responden: 71, rata_rata_skor: 3.43 },
    { kode: "TJKT", nama: "Teknik Jaringan Komputer", jumlah_responden: 104, rata_rata_skor: 3.42 },
    { kode: "DKV", nama: "Desain Komunikasi Visual", jumlah_responden: 107, rata_rata_skor: 3.34 },
    { kode: "MPLB", nama: "Manajemen Perkantoran", jumlah_responden: 37, rata_rata_skor: 3.24 },
    { kode: "PPLG", nama: "Pengembangan Perangkat Lunak & Gim", jumlah_responden: 176, rata_rata_skor: 3.24 }
  ],
  per_gaya_belajar: [
    { gaya_belajar: "Kinestetik", jumlah_responden: 201, rata_rata_skor: 3.40 },
    { gaya_belajar: "Auditori", jumlah_responden: 145, rata_rata_skor: 3.39 },
    { gaya_belajar: "Visual", jumlah_responden: 289, rata_rata_skor: 3.32 }
  ]
};

/**
 * Mengubah tampilan halaman/bagian (Beranda, Tentang, Data & Fakta)
 */
function showPage(page) {
    const berandaSec = document.getElementById('beranda');
    const tentangSec = document.getElementById('tentang');
    const dataSec = document.getElementById('data');
    const aksiSec = document.getElementById('aksi');

    if (berandaSec) berandaSec.style.display = 'none';
    if (tentangSec) tentangSec.style.display = 'none';
    if (dataSec) dataSec.style.display = 'none';
    if (aksiSec) aksiSec.style.display = 'none';

    const target = document.getElementById(page);
    if (target) {
        if (page === 'beranda') {
            target.style.display = window.innerWidth > 992 ? 'grid' : 'flex';
        } else {
            target.style.display = 'block';
        }
    } else {
        if (page === 'beranda' || page === 'tentang') {
            window.location.href = `index.html#${page}`;
            return;
        }
    }

    updateActiveNav(page);

    const navLinks = document.getElementById('navLinks');
    if (navLinks && navLinks.classList.contains('is-open')) {
        navLinks.classList.remove('is-open');
    }

    if (page === 'data') {
        if (!chartsRendered && appData) {
            renderCharts(appData);
            chartsRendered = true;
        } else if (!appData) {
            loadDataAndRender(true);
        } else {
            setTimeout(() => {
                Object.values(chartInstances).forEach(chart => {
                    if (chart && typeof chart.resize === 'function') {
                        chart.resize();
                    }
                });
            }, 60);
        }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (history.pushState) {
        history.pushState(null, null, `#${page}`);
    } else {
        location.hash = `#${page}`;
    }
}

/**
 * Menandai menu aktif pada navbar
 */
function updateActiveNav(page) {
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(link => {
        link.classList.remove('active');
        const linkTarget = link.getAttribute('data-page') || link.getAttribute('href');
        if (
            linkTarget === page ||
            linkTarget === `#${page}` ||
            (link.getAttribute('onclick') && link.getAttribute('onclick').includes(page))
        ) {
            link.classList.add('active');
        }
    });
}

/**
 * Inisialisasi menu hamburger mobile
 */
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('is-open');
            menuToggle.classList.toggle('is-active');
        });
    }
}

/**
 * Mengambil data dari file JSON melalui fetch()
 */
async function loadDataAndRender(forceRenderCharts = false) {
    const statusBanner = document.getElementById('statusPemberitahuan');
    let data = null;

    try {
        let response = await fetch('data/data-perilaku-energi.json');
        if (!response.ok) {
            response = await fetch('data/data-energi.json');
        }
        if (!response.ok) {
            throw new Error(`HTTP status: ${response.status}`);
        }
        data = await response.json();

        if (statusBanner) {
            statusBanner.className = 'status-banner success';
            statusBanner.innerHTML = '● <b>Data Riset Terhubung:</b> 636 Responden Kelas XI • Partisipasi 99.4%';
        }
    } catch (err) {
        console.info('Menggunakan cadangan data offline:', err.message);
        data = (typeof DATA_ENERGI !== 'undefined') ? DATA_ENERGI : FALLBACK_DATA;

        if (statusBanner) {
            statusBanner.className = 'status-banner info';
            statusBanner.innerHTML = '● <b>Data Kuesioner Terverifikasi:</b> 636 Responden Kelas XI (Mode Offline Cadangan)';
        }
    }

    if (data) {
        appData = data;
        renderStatistik(data);
        renderSumberInfo(data);

        const dataSec = document.getElementById('data');
        const isDataVisible = dataSec && (dataSec.style.display === 'block' || window.getComputedStyle(dataSec).display !== 'none');

        if (forceRenderCharts || isDataVisible) {
            renderCharts(data);
            chartsRendered = true;
        }
    }
}

/**
 * Render 4 Card Statistik Ringkasan
 */
function renderStatistik(data) {
    const statsContainer = document.getElementById('statsGrid');
    if (!statsContainer || !data.ringkasan) return;

    const r = data.ringkasan;
    const m = data.meta;

    const metrics = [
        {
            angka: `${r.rata_rata_skor.toFixed(2)}`,
            satuan: "/ 4.00",
            label: "Rata-Rata Skor Perilaku",
            desc: "Skala Likert 1-4 • Kategori Sangat Baik",
            tag: "Skor Utama"
        },
        {
            angka: `${r.persen_sering_rata_rata.toFixed(1)}%`,
            satuan: "",
            label: "Konsistensi Perilaku Hemat",
            desc: "Responden sering/selalu hemat energi",
            tag: "Tingkat Rutin"
        },
        {
            angka: `${m.jumlah_responden}`,
            satuan: "Siswa",
            label: "Total Partisipasi Responden",
            desc: `99.4% dari total ${m.jumlah_siswa_terdata} siswa kelas XI`,
            tag: "Cakupan Riset"
        },
        {
            angka: `${r.kategori_persen["Sangat Baik"]}%`,
            satuan: `(${r.kategori["Sangat Baik"]} siswa)`,
            label: "Kategori Sangat Baik",
            desc: "Memperoleh skor tertinggi (3.26 - 4.00)",
            tag: "Pencapaian"
        }
    ];

    statsContainer.innerHTML = '';
    metrics.forEach(item => {
        const card = document.createElement('div');
        card.className = 'stat-card';
        card.innerHTML = `
            <div class="stat-top">
                <span class="stat-tag">${item.tag}</span>
            </div>
            <div class="stat-num-wrapper">
                <span class="stat-value">${item.angka}</span>
                <span class="stat-unit">${item.satuan}</span>
            </div>
            <div class="stat-label">${item.label}</div>
            <div class="stat-desc">${item.desc}</div>
        `;
        statsContainer.appendChild(card);
    });
}

/**
 * Render Visualisasi Chart.js
 */
function renderCharts(data) {
    if (typeof Chart === 'undefined') return;

    // Default typography & layout untuk Chart.js (Modern Clean & Professional)
    Chart.defaults.font.family = "'Inter', -apple-system, sans-serif";
    Chart.defaults.color = '#3D5043';
    // Matikan popup data (tooltip) saat kursor diarahkan ke grafik
    Chart.defaults.plugins.tooltip.enabled = false;

    renderChartJurusan(data);
    renderChartKategori(data.ringkasan);
    renderChartButir(data.per_butir);
}

/**
 * Grafik 1: Perbandingan Skor per Jurusan / Gaya Belajar
 */
function renderChartJurusan(data) {
    const canvas = document.getElementById('chartPerbandingan');
    if (!canvas) return;

    if (chartInstances.jurusan) {
        chartInstances.jurusan.destroy();
    }

    const isJurusan = currentViewJurusan;
    let labels, values, backgroundColors, borderColors;

    if (isJurusan && data.per_jurusan) {
        labels = data.per_jurusan.map(j => j.kode);
        values = data.per_jurusan.map(j => j.rata_rata_skor);
        // Highlight PPLG (jurusan pembuat) dengan warna sage berbeda yang elegan
        backgroundColors = data.per_jurusan.map(j => j.kode === 'PPLG' ? 'rgba(107, 135, 113, 0.95)' : 'rgba(22, 51, 35, 0.85)');
        borderColors = data.per_jurusan.map(j => j.kode === 'PPLG' ? '#556D5B' : '#163323');
    } else if (data.per_gaya_belajar) {
        labels = data.per_gaya_belajar.map(g => g.gaya_belajar);
        values = data.per_gaya_belajar.map(g => g.rata_rata_skor);
        backgroundColors = ['rgba(22, 51, 35, 0.85)', 'rgba(107, 135, 113, 0.85)', 'rgba(197, 164, 109, 0.85)'];
        borderColors = ['#163323', '#6B8771', '#C5A46D'];
    }

    const ctx = canvas.getContext('2d');
    chartInstances.jurusan = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Rata-Rata Skor (Skala 1 - 4)',
                data: values,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1,
                borderRadius: 8,
                barPercentage: 0.58
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 900, easing: 'easeOutQuart' },
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            },
            scales: {
                y: {
                    min: 2.8,
                    max: 4.0,
                    grid: { color: 'rgba(22, 51, 35, 0.05)' },
                    ticks: {
                        stepSize: 0.2,
                        callback: (v) => v.toFixed(1)
                    }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

/**
 * Mengganti tampilan Grafik 1 antara Jurusan dan Gaya Belajar
 */
function toggleJurusanGaya(view) {
    currentViewJurusan = (view === 'jurusan');

    const btnJurusan = document.getElementById('btnViewJurusan');
    const btnGaya = document.getElementById('btnViewGaya');
    if (btnJurusan && btnGaya) {
        if (currentViewJurusan) {
            btnJurusan.classList.add('active');
            btnGaya.classList.remove('active');
        } else {
            btnJurusan.classList.remove('active');
            btnGaya.classList.add('active');
        }
    }

    if (appData) {
        renderChartJurusan(appData);
    }
}

/**
 * Grafik 2: Donut Distribusi Kategori Perilaku Siswa
 */
function renderChartKategori(ringkasan) {
    const canvas = document.getElementById('chartKebiasaan');
    if (!canvas || !ringkasan) return;

    if (chartInstances.kategori) {
        chartInstances.kategori.destroy();
    }

    const labels = ["Sangat Baik", "Baik", "Cukup", "Kurang"];
    const persen = [
        ringkasan.kategori_persen["Sangat Baik"],
        ringkasan.kategori_persen["Baik"],
        ringkasan.kategori_persen["Cukup"],
        ringkasan.kategori_persen["Kurang"]
    ];

    const ctx = canvas.getContext('2d');
    chartInstances.kategori = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: persen,
                backgroundColor: [
                    '#163323', // Forest Green
                    '#6B8771', // Sage Green
                    '#C5A46D', // Warm Gold/Cream
                    '#C27357'  // Muted Terracotta
                ],
                borderColor: '#FAF7F2',
                borderWidth: 3,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            animation: { animateRotate: true, duration: 900 },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 10,
                        padding: 14,
                        font: { size: 12, weight: '500' }
                    }
                },
                tooltip: { enabled: false }
            }
        }
    });
}

/**
 * Grafik 3: Evaluasi 10 Butir Tindakan Hemat Energi (Horizontal Bar Chart)
 */
function renderChartButir(butirList) {
    const canvas = document.getElementById('chartKesadaran');
    if (!canvas || !butirList) return;

    if (chartInstances.butir) {
        chartInstances.butir.destroy();
    }

    // Urutkan butir berdasarkan skor rata-rata tertinggi ke terendah
    const sorted = [...butirList].sort((a, b) => b.rata_rata - a.rata_rata);
    const labels = sorted.map(b => `${b.kode} - ${b.label}`);
    const values = sorted.map(b => b.rata_rata);

    // Warna gradient halus: hijau tua untuk butir tertinggi, sage untuk yang sedang
    const colors = sorted.map((b, idx) => {
        if (idx < 3) return 'rgba(22, 51, 35, 0.9)'; // 3 Tertinggi
        if (idx >= sorted.length - 3) return 'rgba(197, 164, 109, 0.85)'; // 3 Terendah (evaluasi)
        return 'rgba(107, 135, 113, 0.85)'; // Menengah
    });

    const ctx = canvas.getContext('2d');
    chartInstances.butir = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Skor Rata-Rata Butir',
                data: values,
                backgroundColor: colors,
                borderRadius: 6,
                barPercentage: 0.65
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 900, easing: 'easeOutQuart' },
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            },
            scales: {
                x: {
                    min: 2.8,
                    max: 3.8,
                    grid: { color: 'rgba(22, 51, 35, 0.05)' },
                    ticks: {
                        stepSize: 0.2,
                        callback: (v) => v.toFixed(1)
                    }
                },
                y: {
                    grid: { display: false },
                    ticks: {
                        font: { size: 12 }
                    }
                }
            }
        }
    });
}

/**
 * Menampilkan informasi sumber dan catatan metodologi
 */
function renderSumberInfo(data) {
    if (!data || !data.meta) return;
    const teksSumber = document.getElementById('teksSumber');
    const teksCatatan = document.getElementById('teksCatatan');

    if (teksSumber) {
        teksSumber.textContent = `Sumber: ${data.meta.sumber} • Survei Angkatan Kelas XI (Total ${data.meta.jumlah_responden} Responden)`;
    }
    if (teksCatatan) {
        teksCatatan.innerHTML = `Data telah melalui proses kurasi dan agregasi (pembersihan ${data.meta.pembersihan?.isian_ganda_dibuang || 94} isian ganda). Terhubung secara dinamis via fungsi <code>fetch('data/data-energi.json')</code>.`;
    }
}

/**
 * Inisialisasi saat dokumen selesai dimuat
 */
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();

    const hash = window.location.hash.replace('#', '');
    if (hash && (hash === 'beranda' || hash === 'tentang' || hash === 'data')) {
        showPage(hash);
    } else {
        if (window.location.pathname.endsWith('data.html')) {
            showPage('data');
        } else {
            showPage('beranda');
        }
    }

    window.addEventListener('hashchange', () => {
        const currentHash = window.location.hash.replace('#', '');
        if (currentHash === 'beranda' || currentHash === 'tentang' || currentHash === 'data') {
            showPage(currentHash);
        }
    });

    window.addEventListener('resize', () => {
        Object.values(chartInstances).forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                chart.resize();
            }
        });
    });

    // Pemuatan data JSON
    loadDataAndRender();
});

// ================= FASE 3 =================

// Mengambil semua checkbox tantangan
const challengeChecks = document.querySelectorAll(
    ".challenge-check"
);

// Memperbarui progress tantangan
function updateChallengeProgress() {

    const total = challengeChecks.length;

    const completed = document.querySelectorAll(
        ".challenge-check:checked"
    ).length;

    const percentage = (completed / total) * 100;

    document.getElementById("progressText").textContent =
        `${completed}/${total}`;

    document.getElementById("progressFill").style.width =
        `${percentage}%`;


    const message = document.getElementById(
        "challengeMessage"
    );

    if (completed === 0) {
        message.textContent =
            "Yuk, mulai tantangan pertamamu hari ini!";
    } else if (completed < total) {
        message.textContent =
            `Bagus! Kamu sudah menyelesaikan ${completed} tantangan. Terus lanjutkan!`;
    } else {
        message.textContent =
            "Selamat! Kamu berhasil menyelesaikan Tantangan 7 Hari Hemat Energi! 🌱";
    }

}

// Menjalankan progress setiap checkbox berubah
challengeChecks.forEach(function (checkbox) {

    checkbox.addEventListener("change", updateChallengeProgress);

});

// Mengulang tantangan
function resetChallenge() {

    challengeChecks.forEach(function (checkbox) {
        checkbox.checked = false;
    });

    updateChallengeProgress();

}

// Menjalankan progress awal
updateChallengeProgress();
