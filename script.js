/* ============================================================
   SEIDOR — Tarifario Baseline — Lógica de UI
   No necesitas editar este archivo para cambiar precios;
   edita data.js.
   ============================================================ */

const fmtUSD = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

document.getElementById("heroUpdated").textContent = `Actualizado — ${LAST_UPDATED}`;
document.getElementById("footerUpdated").textContent = `Última actualización de precios: ${LAST_UPDATED}`;

/* ---------------- Individual services table ---------------- */
const tbody = document.getElementById("rateTableBody");
const controls = document.getElementById("controls");
const searchInput = document.getElementById("searchInput");

const categories = ["Todos", ...new Set(INDIVIDUAL_SERVICES.map((s) => s.category))];
let activeCategory = "Todos";
let searchTerm = "";

function renderFilters() {
  categories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "filter-btn" + (cat === "Todos" ? " active" : "");
    btn.textContent = cat;
    btn.type = "button";
    btn.addEventListener("click", () => {
      activeCategory = cat;
      document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderTable();
    });
    controls.insertBefore(btn, searchInput);
  });
}

function renderTable() {
  const rows = INDIVIDUAL_SERVICES.filter((s) => {
    const matchCat = activeCategory === "Todos" || s.category === activeCategory;
    const matchSearch = s.role.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  tbody.innerHTML = "";

  if (rows.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="4">No se encontraron servicios con ese filtro.</td></tr>`;
    return;
  }

  rows.forEach((s) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="cat-cell">${s.category}</td>
      <td class="role-cell">${s.role}<span class="role-notes">${s.notes || ""}</span></td>
      <td><span class="level-tag">${s.level}</span></td>
      <td class="rate-value">${fmtUSD(s.rate)}<small> / ${s.unit === "hora" ? "h" : "día"}</small></td>
    `;
    tbody.appendChild(tr);
  });
}

searchInput.addEventListener("input", (e) => {
  searchTerm = e.target.value;
  renderTable();
});

renderFilters();
renderTable();

/* ---------------- Packages ---------------- */
const pkgGrid = document.getElementById("pkgGrid");

function renderPackages() {
  PACKAGES.forEach((p) => {
    const card = document.createElement("div");
    card.className = "pkg-card";
    const priceSuffix = p.priceUnit === "mes" ? "/mes" : "baseline";
    const priceLabel = p.priceUnit === "mes" ? "Precio de referencia mensual" : "Precio de referencia total";
    const teamLabel = p.id === "ams" ? "Distribución" : "Equipo típico";
    card.innerHTML = `
      <div class="pkg-badge">${p.badge}</div>
      <h3>${p.title}</h3>
      <p class="pkg-subtitle">${p.subtitle}</p>
      <div class="pkg-price">${fmtUSD(p.price)}<span>${priceSuffix}</span></div>
      <div class="pkg-price-label">${priceLabel}</div>
      <div class="pkg-meta">
        <div><strong>Duración:</strong> ${p.duration}</div>
        <div><strong>${teamLabel}:</strong> ${p.team}</div>
      </div>
      <button class="pkg-toggle" type="button" aria-expanded="false">
        <span class="label">Ver alcance detallado</span>
        <span class="arrow">▾</span>
      </button>
      <div class="pkg-detail">
        <div class="pkg-detail-inner">
          <div class="pkg-list-title inc">Incluye</div>
          <ul>${p.includes.map((i) => `<li>${i}</li>`).join("")}</ul>
          <div class="pkg-list-title exc">No incluye</div>
          <ul>${p.excludes.map((i) => `<li>${i}</li>`).join("")}</ul>
        </div>
      </div>
      ${p.pptFile ? `<a class="pkg-download" href="${p.pptFile}" download>
        <span>Descargar PPT de Alcance</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 3v13m0 0l-5-5m5 5l5-5M4 21h16"/></svg>
      </a>` : ""}
    `;
    const toggle = card.querySelector(".pkg-toggle");
    const detail = card.querySelector(".pkg-detail");
    const label = card.querySelector(".pkg-toggle .label");
    toggle.addEventListener("click", () => {
      const isOpen = detail.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      label.textContent = isOpen ? "Ocultar alcance detallado" : "Ver alcance detallado";
    });
    pkgGrid.appendChild(card);
  });
}

renderPackages();

/* ---------------- Sticky nav reveal on scroll ---------------- */
const nav = document.getElementById("nav");
const heroHeight = () => document.querySelector(".hero").offsetHeight;

window.addEventListener("scroll", () => {
  if (window.scrollY > heroHeight() - 80) {
    nav.classList.add("is-visible");
  } else {
    nav.classList.remove("is-visible");
  }
});
