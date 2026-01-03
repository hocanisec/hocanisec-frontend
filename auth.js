const API_BASE = "https://gardaslar.onrender.com";

const els = {
  email: document.getElementById("email"),
  code: document.getElementById("code"),
  sendBtn: document.getElementById("sendBtn"),
  verifyBtn: document.getElementById("verifyBtn"),
  status: document.getElementById("status"),
  codeBox: document.getElementById("codeBox"),
  checkKVKK: document.getElementById("checkKVKK"),
  checkTerms: document.getElementById("checkTerms"),
  checkResp: document.getElementById("checkResponsibility")
};

function setMsg(text, type = "") {
  els.status.textContent = text || "";
  els.status.className = "msg " + (type || "");
}

// Sözleşme metinlerini gösteren yardımcı fonksiyon
function showInfo(type) {
  if (type === 'kvkk') {
    alert("KVKK AYDINLATMA METNİ:\n1. E-posta adresiniz sadece doğrulama için tutulur.\n2. Kimliğiniz hocalarla veya 3. şahıslarla asla paylaşılmaz.\n3. Verileriniz güvenli sunucularda saklanır.");
  } else {
    alert("KULLANIM KOŞULLARI:\n1. Hakaret ve küfür içerikli yorumlar silinir.\n2. Sadece gerçek deneyimler paylaşılmalıdır.\n3. Yanıltıcı bilgi vermek yasaktır.");
  }
}

async function sendCode() {
  // ⚠️ ÇOK ÖNEMLİ: Onay kutuları kontrolü
  if (!els.checkKVKK.checked || !els.checkTerms.checked || !els.checkResp.checked) {
    setMsg("Lütfen tüm onay kutucuklarını işaretleyin.", "err");
    return;
  }

  const email = els.email.value.trim().toLowerCase();
  if (!email || !email.includes(".edu.tr")) {
    setMsg("Lütfen geçerli bir .edu.tr mail adresi girin.", "err");
    return;
  }

  setMsg("Kod gönderiliyor...", "ok");
  els.sendBtn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/send-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    
    if (!res.ok) throw new Error(data.error || "Sunucu hatası");

    els.codeBox.classList.add("is-open");
    setMsg("Kod gönderildi! Mail kutunu (ve spam klasörünü) kontrol et. ✉️", "ok");
  } catch (e) {
    setMsg(e.message, "err");
    els.sendBtn.disabled = false;
  }
}

async function verifyCode() {
  const email = els.email.value.trim().toLowerCase();
  const code = els.code.value.trim();

  try {
    const res = await fetch(`${API_BASE}/verify-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code })
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error);

    if (data.token) localStorage.setItem("hocaniseç_token", data.token);
    setMsg("Giriş başarılı! Ana sayfaya gidiyorsun...", "ok");
    setTimeout(() => window.location.href = "index.html", 2000);
  } catch (e) {
    setMsg(e.message, "err");
  }
}

els.sendBtn.addEventListener("click", sendCode);
els.verifyBtn.addEventListener("click", verifyCode);