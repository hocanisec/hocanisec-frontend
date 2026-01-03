const API_BASE = "https://gardaslar.onrender.com";

/* ---------- GÖRÜNÜM DEĞİŞTİRME ---------- */
const buttons = document.querySelectorAll(".admin-sidebar button");
const views = document.querySelectorAll(".admin-view");

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    const view = btn.dataset.view;
    views.forEach(v => v.classList.toggle("active", v.id === view));

    // Sekmeye tıklandığında veriyi yükle
    if (view === "dashboard") updateStats();
    if (view === "professors") loadProfessors();
    if (view === "comments") loadPendingComments();
  });
});

/* ---------- DASHBOARD (İSTATİSTİKLER) ---------- */
async function updateStats() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/stats`);
    const data = await res.json();
    document.getElementById("profCount").innerText = data.profCount || 0;
    document.getElementById("schoolCount").innerText = data.schoolCount || 0;
  } catch (err) { console.error("Dashboard yüklenemedi"); }
}

/* ---------- HOCA YÖNETİMİ ---------- */
const profForm = document.getElementById("profForm");

profForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("profName").value.trim();
  const school = document.getElementById("profSchool").value.trim();

  try {
    const res = await fetch(`${API_BASE}/api/admin/professors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, school })
    });
    if (res.ok) {
      profForm.reset();
      loadProfessors();
      alert("Hoca Firebase'e eklendi!");
    }
  } catch (err) { alert("Hoca eklenemedi."); }
});

async function loadProfessors() {
  const list = document.getElementById("profList");
  list.innerHTML = "<li>Yükleniyor...</li>";
  try {
    const res = await fetch(`${API_BASE}/api/admin/professors`);
    const profs = await res.json();
    list.innerHTML = "";
    profs.forEach(p => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div><strong>${p.name}</strong> <span class="muted">(${p.school})</span></div>
        <button onclick="deleteProfessor('${p.id}')" style="background:#dc2626">Sil</button>
      `;
      list.appendChild(li);
    });
  } catch (err) { list.innerHTML = "<li>Hocalar çekilemedi.</li>"; }
}

async function deleteProfessor(id) {
  if (!confirm("Bu hocayı silmek istediğine emin misin?")) return;
  await fetch(`${API_BASE}/api/admin/professors/${id}`, { method: "DELETE" });
  loadProfessors();
}

/* ---------- YORUM ONAYLAMA ---------- */
async function loadPendingComments() {
  const list = document.getElementById("commentList");
  list.innerHTML = "<li>Yorumlar yükleniyor...</li>";
  try {
    const res = await fetch(`${API_BASE}/api/admin/pending-comments`);
    const comments = await res.json();
    list.innerHTML = "";

    if (comments.length === 0) {
      list.innerHTML = "<li>Bekleyen yorum yok ✅</li>";
      return;
    }

    comments.forEach(c => {
      const li = document.createElement("li");
      li.style.flexDirection = "column";
      li.style.alignItems = "flex-start";
      li.innerHTML = `
        <div style="margin-bottom: 10px;">
          <strong>Hoca ID:</strong> ${c.profId} | <strong>Puan:</strong> ${c.rating} ⭐
          <p style="background: #f8fafc; padding: 10px; border-radius: 8px; margin: 5px 0;">${c.text}</p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button onclick="approveComment('${c.id}')" style="background:#16a34a">Onayla</button>
          <button onclick="rejectComment('${c.id}')" style="background:#dc2626">Sil</button>
        </div>
      `;
      list.appendChild(li);
    });
  } catch (err) { list.innerHTML = "<li>Yorumlar çekilemedi.</li>"; }
}

async function approveComment(id) {
  await fetch(`${API_BASE}/api/admin/approve-comment/${id}`, { method: "POST" });
  loadPendingComments();
}

async function rejectComment(id) {
  await fetch(`${API_BASE}/api/admin/delete-comment/${id}`, { method: "DELETE" });
  loadPendingComments();
}

// İlk açılışta dashboard'u yükle
updateStats();