/* =====================
   ADMIN PANEL LOGIC
   ===================== */

const PROF_KEY = "admin_professors";
const SCHOOL_KEY = "admin_schools";
const PENDING_KEY = "pending_comments";

/* ---------- VIEW SWITCH ---------- */
const buttons = document.querySelectorAll(".admin-sidebar button");
const views = document.querySelectorAll(".admin-view");

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    const view = btn.dataset.view;

    views.forEach(v => {
      v.classList.toggle("active", v.id === view);
    });

    if (view === "comments") loadComments();
    if (view === "dashboard") updateStats();
    if (view === "professors") renderProfessors();
    if (view === "schools") renderSchools();
  });
});

/* ---------- DASHBOARD ---------- */
function updateStats() {
  const profs = JSON.parse(localStorage.getItem(PROF_KEY)) || [];
  const schools = JSON.parse(localStorage.getItem(SCHOOL_KEY)) || [];

  document.getElementById("profCount").innerText = profs.length;
  document.getElementById("schoolCount").innerText = schools.length;
}

/* ---------- PROFESSORS ---------- */
const profForm = document.getElementById("profForm");
const profList = document.getElementById("profList");

profForm.addEventListener("submit", e => {
  e.preventDefault();

  const name = document.getElementById("profName").value.trim();
  const school = document.getElementById("profSchool").value.trim();

  if (!name || !school) return;

  const profs = JSON.parse(localStorage.getItem(PROF_KEY)) || [];
  profs.push({ name, school });
  localStorage.setItem(PROF_KEY, JSON.stringify(profs));

  profForm.reset();
  renderProfessors();
  updateStats();
});

function renderProfessors() {
  const profs = JSON.parse(localStorage.getItem(PROF_KEY)) || [];
  profList.innerHTML = "";

  profs.forEach((p, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <strong>${p.name}</strong>
        <div class="muted">${p.school}</div>
      </div>
      <button onclick="deleteProfessor(${i})">Sil</button>
    `;
    profList.appendChild(li);
  });
}

function deleteProfessor(i) {
  const profs = JSON.parse(localStorage.getItem(PROF_KEY)) || [];
  profs.splice(i, 1);
  localStorage.setItem(PROF_KEY, JSON.stringify(profs));
  renderProfessors();
  updateStats();
}

/* ---------- SCHOOLS ---------- */
const schoolForm = document.getElementById("schoolForm");
const schoolList = document.getElementById("schoolList");

schoolForm.addEventListener("submit", e => {
  e.preventDefault();

  const name = document.getElementById("schoolName").value.trim();
  if (!name) return;

  const schools = JSON.parse(localStorage.getItem(SCHOOL_KEY)) || [];
  schools.push(name);
  localStorage.setItem(SCHOOL_KEY, JSON.stringify(schools));

  schoolForm.reset();
  renderSchools();
  updateStats();
});

function renderSchools() {
  const schools = JSON.parse(localStorage.getItem(SCHOOL_KEY)) || [];
  schoolList.innerHTML = "";

  schools.forEach((s, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${s}</span>
      <button onclick="deleteSchool(${i})">Sil</button>
    `;
    schoolList.appendChild(li);
  });
}

function deleteSchool(i) {
  const schools = JSON.parse(localStorage.getItem(SCHOOL_KEY)) || [];
  schools.splice(i, 1);
  localStorage.setItem(SCHOOL_KEY, JSON.stringify(schools));
  renderSchools();
  updateStats();
}

/* ---------- COMMENT APPROVAL ---------- */
function loadComments() {
  const list = document.getElementById("commentList");
  const comments = JSON.parse(localStorage.getItem(PENDING_KEY)) || [];

  list.innerHTML = "";

  if (comments.length === 0) {
    list.innerHTML = "<li>Bekleyen yorum yok</li>";
    return;
  }

  comments.forEach((c, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <strong>${c.profName}</strong>
        <div class="muted">${c.school}</div>
        <div>${c.rating} ⭐</div>
        <p>${c.text}</p>
      </div>
      <div>
        <button onclick="approveComment(${i})">Onayla</button>
        <button onclick="rejectComment(${i})">Sil</button>
      </div>
    `;
    list.appendChild(li);
  });
}

function approveComment(index) {
  const pending = JSON.parse(localStorage.getItem(PENDING_KEY)) || [];
  const c = pending[index];

  const key = "prof_" + c.profName;
  const approved = JSON.parse(localStorage.getItem(key)) || [];

  approved.unshift({
    text: c.text,
    rating: c.rating,
    createdAt: c.createdAt
  });

  localStorage.setItem(key, JSON.stringify(approved));

  pending.splice(index, 1);
  localStorage.setItem(PENDING_KEY, JSON.stringify(pending));

  loadComments();
}

function rejectComment(index) {
  const pending = JSON.parse(localStorage.getItem(PENDING_KEY)) || [];
  pending.splice(index, 1);
  localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  loadComments();
}

/* ---------- INIT ---------- */
updateStats();
renderProfessors();
renderSchools();
