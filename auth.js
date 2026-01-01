// frontend/auth.js
const API_BASE = "https://gardaslar.onrender.com";

const els = {
  email: document.getElementById("email"),
  code: document.getElementById("code"),
  sendBtn: document.getElementById("sendBtn"),
  verifyBtn: document.getElementById("verifyBtn"),
  resendBtn: document.getElementById("resendBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  codeBox: document.getElementById("codeBox"),
  status: document.getElementById("status"),
};

const STORAGE_KEY = "hocaniseç_token";
const EMAIL_KEY = "hocaniseç_email";

function setMsg(text, type = "") {
  els.status.textContent = text || "";
  els.status.className = "msg " + (type || "");
}
function setLoading(btn, loading) {
  btn.disabled = !!loading;
  btn.textContent = loading ? "Bekle..." : btn.dataset.label;
}
function getToken() {
  return localStorage.getItem(STORAGE_KEY) || "";
}
function setToken(token) {
  localStorage.setItem(STORAGE_KEY, token);
}
function clearToken() {
  localStorage.removeItem(STORAGE_KEY);
}
function rememberEmail(email) {
  localStorage.setItem(EMAIL_KEY, email);
}
function getRememberedEmail() {
  return localStorage.getItem(EMAIL_KEY) || "";
}
function normalizeEmail(email) {
  return (email || "").trim().toLowerCase();
}
function showCodeBox(show) {
  els.codeBox.classList.toggle("is-open", !!show);
}
function applyLoggedInUI() {
  const token = getToken();
  if (token) {
    showCodeBox(true);
    els.sendBtn.disabled = true;
    setMsg("Giriş aktif ✅ İstersen tekrar doğrulayabilir ya da çıkış yapabilirsin.", "ok");
  } else {
    showCodeBox(false);
    els.sendBtn.disabled = false;
    setMsg("", "");
  }
}

async function apiPost(path, body) {
  const res = await fetch(API_BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });

  let data = null;
  try { data = await res.json(); } catch {}

  if (!res.ok) {
    const msg = (data && data.error) ? data.error : `Hata: ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

async function sendCode() {
  const email = normalizeEmail(els.email.value);
  if (!email) return setMsg("Email gir.", "err");

  setMsg("", "");
  setLoading(els.sendBtn, true);

  try {
    await apiPost("/send-code", { email });
    rememberEmail(email);
    showCodeBox(true);
    setMsg("Kod gönderildi. Mail kutunu kontrol et ✉️", "ok");
    els.code.focus();
  } catch (e) {
    setMsg(e.message || "Kod gönderilemedi.", "err");
  } finally {
    setLoading(els.sendBtn, false);
  }
}

async function verifyCode() {
  const email = normalizeEmail(els.email.value);
  const code = (els.code.value || "").trim();

  if (!email) return setMsg("Önce email gir.", "err");
  if (!code || code.length < 4) return setMsg("Kod gir (genelde 6 hane).", "err");

  setMsg("", "");
  setLoading(els.verifyBtn, true);

  try {
    const data = await apiPost("/verify-code", { email, code });
    if (data && data.token) setToken(data.token);
    rememberEmail(email);
    setMsg("Doğrulandı ✅ Artık yorum atabilirsin.", "ok");
  } catch (e) {
    setMsg(e.message || "Kod doğrulanamadı.", "err");
  } finally {
    setLoading(els.verifyBtn, false);
  }
}

function logout() {
  clearToken();
  setMsg("Çıkış yapıldı.", "");
  applyLoggedInUI();
}

els.sendBtn.dataset.label = els.sendBtn.textContent;
els.verifyBtn.dataset.label = els.verifyBtn.textContent;
els.resendBtn.dataset.label = els.resendBtn.textContent;
els.logoutBtn.dataset.label = els.logoutBtn.textContent;

const remembered = getRememberedEmail();
if (remembered) els.email.value = remembered;

els.sendBtn.addEventListener("click", sendCode);
els.resendBtn.addEventListener("click", sendCode);
els.verifyBtn.addEventListener("click", verifyCode);
els.logoutBtn.addEventListener("click", logout);

els.email.addEventListener("keydown", (e) => { if (e.key === "Enter") sendCode(); });
els.code.addEventListener("keydown", (e) => { if (e.key === "Enter") verifyCode(); });

applyLoggedInUI();
