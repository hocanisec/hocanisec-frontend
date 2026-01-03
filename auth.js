// frontend/auth.js
const API_BASE = "https://gardaslar.onrender.com";

const els = {
  email: document.getElementById("email"),
  code: document.getElementById("code"),
  sendBtn: document.getElementById("sendBtn"),
  verifyBtn: document.getElementById("verifyBtn"),
  resendBtn: document.getElementById("resendBtn"),
  codeBox: document.getElementById("codeBox"),
  status: document.getElementById("status"),
  // HTML dosyasındaki ID'lerle tam uyum
  kvkk: document.getElementById("checkKVKK"),
  rules: document.getElementById("checkRules"),
  auth: document.getElementById("checkAuth")
};

// Mesaj gösterme ve otomatik gizleme
function setMsg(text, type = "") {
  els.status.textContent = text || "";
  els.status.className = "msg " + (type || "");
  els.status.style.display = text ? "block" : "none";
}

// 1. KOD GÖNDERME
async function sendCode() {
  const email = els.email.value.trim().toLowerCase();

  // ⚠️ 3'LÜ TİK KONTROLÜ (Biri bile eksikse kod gitmez)
  if (!els.kvkk.checked || !els.rules.checked || !els.auth.checked) {
    setMsg("Lütfen tüm onay kutucuklarını işaretleyin.", "err");
    return;
  }

  // ⚠️ .EDU.TR ZORUNLULUĞU
  if (!email.endsWith(".edu.tr")) {
    setMsg("Üzgünüz, sadece .edu.tr uzantılı üniversite maillerini kabul ediyoruz.", "err");
    return;
  }

  setMsg("Kod gönderiliyor, lütfen e-postanı kontrol et...", "ok");
  els.sendBtn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/send-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    
    const data = await res.json();
    
    if (!res.ok) throw new Error(data.error || "Kod gönderilemedi.");

    // Başarılıysa: Kod kutusunu aç, gönder butonunu gizle
    els.codeBox.classList.add("is-open");
    els.sendBtn.style.display = "none"; 
    setMsg("Kod gönderildi! Spam (Gereksiz) kutusuna bakmayı unutma. ✉️", "ok");
    els.code.focus();
  } catch (e) {
    setMsg(e.message, "err");
    els.sendBtn.disabled = false;
  }
}

// 2. KOD DOĞRULAMA
async function verifyCode() {
  const email = els.email.value.trim().toLowerCase();
  const code = els.code.value.trim();

  if (code.length < 6) {
    setMsg("Lütfen 6 haneli kodu girin.", "err");
    return;
  }

  setMsg("Doğrulanıyor...", "ok");

  try {
    const res = await fetch(`${API_BASE}/verify-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code })
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Kod hatalı veya süresi dolmuş.");

    // Token kaydı (hocanisec_token olarak kaydediyoruz)
    if (data.token) {
      localStorage.setItem("hocanisec_token", data.token);
      setMsg("Giriş başarılı! Ana sayfaya yönlendiriliyorsunuz... ✅", "ok");
      
      // Başarılıysa 1.5 sn sonra ana sayfaya at
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    }
  } catch (e) {
    setMsg(e.message, "err");
  }
}

/* ---------- OLAY İZLEYİCİLER ---------- */
els.sendBtn.addEventListener("click", sendCode);
els.verifyBtn.addEventListener("click", verifyCode);

if (els.resendBtn) {
    els.resendBtn.addEventListener("click", (e) => {
        e.preventDefault();
        sendCode();
    });
}

// Enter tuşu desteği
els.email.addEventListener("keypress", (e) => { if(e.key === "Enter") sendCode(); });
els.code.addEventListener("keypress", (e) => { if(e.key === "Enter") verifyCode(); });