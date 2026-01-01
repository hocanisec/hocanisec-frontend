/* =====================
   1. ÜNİVERSİTE VERİ TABANI (Yerel Liste)
===================== */
const UNIVERSITIES = [
  "Abdullah Gül Üniversitesi", "Acıbadem Mehmet Ali Aydınlar Üniversitesi", "Afyon Kocatepe Üniversitesi", "Afyonkarahisar Sağlık Bilimleri Üniversitesi", "Ağrı İbrahim Çeçen Üniversitesi", "Akdeniz Üniversitesi", "Aksaray Üniversitesi", "Alanya Alaaddin Keykubat Üniversitesi", "Alanya Üniversitesi", "Amasya Üniversitesi", "Anadolu Üniversitesi", "Anka Teknoloji Üniversitesi", "Ankara Bilim Üniversitesi", "Ankara Hacı Bayram Veli Üniversitesi", "Ankara Medipol Üniversitesi", "Ankara Müzik ve Güzel Sanatlar Üniversitesi", "Ankara Sosyal Bilimler Üniversitesi", "Ankara Üniversitesi", "Ankara Yıldırım Beyazıt Üniversitesi", "Antalya Belek Üniversitesi", "Antalya Bilim Üniversitesi", "Ardahan Üniversitesi", "Artvin Çoruh Üniversitesi", "Ataşehir Adıgüzel Meslek Yüksekokulu", "Atatürk Üniversitesi", "Atılım Üniversitesi", "Avrasya Üniversitesi", "Aydın Adnan Menderes Üniversitesi", "Babylon Üniversitesi", "Bahçeşehir Üniversitesi", "Balıkesir Üniversitesi", "Bandırma Onyedi Eylül Üniversitesi", "Bartın Üniversitesi", "Başkent Üniversitesi", "Batman Üniversitesi", "Bayburt Üniversitesi", "Beykent Üniversitesi", "Beykoz Üniversitesi", "Bezmialem Vakıf Üniversitesi", "Bilecik Şeyh Edebali Üniversitesi", "Bingöl Üniversitesi", "Biruni Üniversitesi", "Bitlis Eren Üniversitesi", "Boğaziçi Üniversitesi", "Bursa Teknik Üniversitesi", "Bursa Uludağ Üniversitesi", "Çağ Üniversitesi", "Çanakkale Onsekiz Mart Üniversitesi", "Çankaya Üniversitesi", "Çankırı Karatekin Üniversitesi", "Çukurova Üniversitesi", "Dicle Üniversitesi", "Doğuş Üniversitesi", "Dokuz Eylül Üniversitesi", "Ege Üniversitesi", "Erciyes Üniversitesi", "Fırat Üniversitesi", "Galatasaray Üniversitesi", "Gazi Üniversitesi", "Gaziantep Üniversitesi", "Hacettepe Üniversitesi", "İstanbul Teknik Üniversitesi", "İstanbul Üniversitesi", "İzmir Ekonomi Üniversitesi", "Koç Üniversitesi", "Marmara Üniversitesi", "Orta Doğu Teknik Üniversitesi", "Özyeğin Üniversitesi", "Sabancı Üniversitesi", "Yeditepe Üniversitesi", "Yıldız Teknik Üniversitesi", "Zonguldak Bülent Ecevit Üniversitesi"
];

/* =====================
   2. TAKMA ADLAR (METU, ODTU VB.)
===================== */
const ALIASES = {
  "odtu": "Orta Doğu Teknik Üniversitesi",
  "odtü": "Orta Doğu Teknik Üniversitesi",
  "ödtü": "Orta Doğu Teknik Üniversitesi",
  "metu": "Orta Doğu Teknik Üniversitesi",
  "itu": "İstanbul Teknik Üniversitesi",
  "itü": "İstanbul Teknik Üniversitesi",
  "boun": "Boğaziçi Üniversitesi",
  "bogazici": "Boğaziçi Üniversitesi",
  "ytu": "Yıldız Teknik Üniversitesi",
  "ytü": "Yıldız Teknik Üniversitesi"
};

const API_BASE = "https://gardaslar.onrender.com"; // Canlı backend adresin
const INPUT = document.getElementById("searchInput");
const RESULT = document.getElementById("results");

/* =====================
   3. SÜPER NORMALLEŞTİRME
===================== */
function superNormalize(str = "") {
  return str.toString()
    .replace(/İ/g, "i").replace(/I/g, "i").replace(/ı/g, "i")
    .toLowerCase().trim()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/\s+/g, ""); 
}

/* =====================
   4. ARAMA MOTORU
===================== */
async function search() {
  if (!INPUT || !RESULT) return;
  const rawQ = INPUT.value.trim();
  const q = superNormalize(rawQ);
  
  RESULT.innerHTML = "";
  if (q.length < 2) return;

  // --- A. OKUL ARAMA ---
  let foundSchools = new Set();
  
  // Alias (METU/ODTÜ) kontrolü
  Object.keys(ALIASES).forEach(key => {
    if (superNormalize(key).includes(q)) {
      foundSchools.add(ALIASES[key]);
    }
  });

  // Normal okul listesi kontrolü
  UNIVERSITIES.forEach(s => {
    if (superNormalize(s).includes(q)) {
      foundSchools.add(s);
    }
  });

  // Okul Kartlarını Bas
  foundSchools.forEach(s => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.borderLeft = "5px solid #2563eb";
    card.innerHTML = `
      <div class="title">🏫 ${s}</div>
      <div class="sub">Üniversite</div>
      <div class="card-foot"><span class="rating">Görüntüle</span></div>
    `;
    card.onclick = () => window.location.href = `school.html?name=${encodeURIComponent(s)}`;
    RESULT.appendChild(card);
  });

  // --- B. HOCA ARAMA (BACKEND / FIREBASE) ---
  try {
    const response = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(rawQ)}`);
    const data = await response.json();

    if (data.profs && data.profs.length > 0) {
      data.profs.forEach(p => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <div class="title">👨‍🏫 ${p.name}</div>
          <div class="sub">${p.school}</div>
          <div class="card-foot"><span class="rating">Profili Aç</span></div>
        `;
        card.onclick = () => {
          window.location.href = `profile.html?id=${p.id}&name=${encodeURIComponent(p.name)}&school=${encodeURIComponent(p.school)}`;
        };
        RESULT.appendChild(card);
      });
    }
  } catch (err) {
    console.error("Hoca verisi çekilemedi:", err);
  }

  // Sonuç yoksa mesaj çıkar
  if (foundSchools.size === 0 && RESULT.innerHTML === "") {
    RESULT.innerHTML = `<div class="empty">Sonuç bulunamadı</div>`;
  }
}

/* =====================
   5. OLAYLAR
===================== */
if (INPUT) INPUT.addEventListener("input", search);

document.querySelectorAll(".quick-chips button").forEach(btn => {
  btn.onclick = function() {
    INPUT.value = this.innerText;
    search();
  };
});