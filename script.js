(function () {
  const projects = window.PORTFOLIO_PROJECTS || [];
  const featuredGrid = document.getElementById("featuredGrid");
  const archiveList = document.getElementById("archiveList");
  const searchInput = document.getElementById("projectSearch");
  const filterBtns = document.querySelectorAll(".filter-btn");

  const projectModal = document.getElementById("projectModal");
  const closeModalBtn = document.getElementById("closeModal");
  const cmdModal = document.getElementById("cmdModal");
  const cmdInput = document.getElementById("cmdInput");
  const cmdResults = document.getElementById("cmdResults");
  const cmdTrigger = document.getElementById("cmdTrigger");
  const closeCmdBtn = document.getElementById("closeCmd");

  const themeToggle = document.getElementById("themeToggle");
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileNav = document.getElementById("mobileNav");
  const toastEl = document.getElementById("toast");

  let activeFilter = "all";
  let searchQuery = "";
  let toastTimer = null;

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.hidden = true;
    }, 2400);
  }

  // Theme Polarity (Light Paper <-> Dark Obsidian)
  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("portfolio-theme", theme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    const next = current === "light" ? "dark" : "light";
    setTheme(next);
    showToast(`POLARITY: ${next.toUpperCase()}`);
  }

  const savedTheme = localStorage.getItem("portfolio-theme");
  if (savedTheme === "dark" || savedTheme === "light") {
    setTheme(savedTheme);
  }

  themeToggle.addEventListener("click", toggleTheme);

  // Mobile Menu
  mobileMenuBtn.addEventListener("click", () => {
    const isHidden = mobileNav.hidden;
    mobileNav.hidden = !isHidden;
    mobileMenuBtn.setAttribute("aria-expanded", String(isHidden));
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileNav.hidden = true;
      mobileMenuBtn.setAttribute("aria-expanded", "false");
    });
  });

  // Live Local Time (IST)
  function updateLocalTime() {
    const el = document.getElementById("localTime");
    if (!el) return;
    try {
      const now = new Date();
      const ist = now.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });
      el.textContent = `${ist} IST`;
    } catch {
      el.textContent = "INDIA";
    }
  }
  updateLocalTime();
  setInterval(updateLocalTime, 30000);

  // Render Featured Projects
  function renderFeatured() {
    const featured = projects.filter((p) => p.featured);
    featuredGrid.innerHTML = featured
      .map(
        (p) => `
      <article class="featured-card">
        <div>
          <div class="card-top">
            <span class="card-index">${p.index} / ${p.year}</span>
            <span class="card-stats">★ ${p.stars} · ${p.language}</span>
          </div>
          <h3 class="card-title">${p.name}</h3>
          <p class="card-subtitle">${p.subtitle}</p>
          <p class="card-desc">${p.description}</p>
          <div class="tag-row">
            ${p.stack.map((t) => `<span class="tag">${t}</span>`).join("")}
          </div>
        </div>
        <div class="card-actions">
          <a href="${p.repoUrl}" target="_blank" rel="noopener noreferrer" class="card-link">GitHub ↗</a>
          ${
            p.liveUrl
              ? `<a href="${p.liveUrl}" target="_blank" rel="noopener noreferrer" class="card-link">${p.liveLabel || "Live"} ↗</a>`
              : ""
          }
          <button class="card-detail-btn" type="button" data-project-id="${p.id}">Specs +</button>
        </div>
      </article>
    `
      )
      .join("");
  }

  // Render Archive List
  function renderArchive() {
    const q = searchQuery.trim().toLowerCase();
    const filtered = projects.filter((p) => {
      const matchesCat = activeFilter === "all" || p.category === activeFilter;
      if (!matchesCat) return false;
      if (!q) return true;
      const haystack = `${p.name} ${p.subtitle} ${p.description} ${p.stack.join(" ")} ${p.language}`.toLowerCase();
      return haystack.includes(q);
    });

    if (filtered.length === 0) {
      archiveList.innerHTML = `<div class="empty-state">No repositories match "${searchQuery}".</div>`;
      return;
    }

    archiveList.innerHTML = filtered
      .map(
        (p) => `
      <div class="archive-row">
        <span class="mono muted">${p.index}</span>
        <div>
          <div class="archive-name">${p.name}</div>
          <div class="mono muted">${p.subtitle}</div>
        </div>
        <div class="archive-desc" title="${p.description}">${p.description}</div>
        <div class="archive-lang">${p.language} · ${p.year}</div>
        <div class="archive-links">
          <button type="button" data-project-id="${p.id}">Specs</button>
          <a href="${p.repoUrl}" target="_blank" rel="noopener noreferrer">Repo ↗</a>
          ${
            p.liveUrl
              ? `<a href="${p.liveUrl}" target="_blank" rel="noopener noreferrer">Live ↗</a>`
              : ""
          }
        </div>
      </div>
    `
      )
      .join("");
  }

  // Filter & Search Events
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.getAttribute("data-filter") || "all";
      renderArchive();
    });
  });

  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderArchive();
  });

  // Project Detail Modal
  function openProjectModal(id) {
    const p = projects.find((item) => item.id === id);
    if (!p) return;
    document.getElementById("modalIndex").textContent = `${p.index} / ${p.category.toUpperCase()} · ${p.year}`;
    document.getElementById("modalTitle").textContent = p.name;
    document.getElementById("modalSubtitle").textContent = p.subtitle;
    document.getElementById("modalDesc").textContent = p.description;

    const highlightsEl = document.getElementById("modalHighlights");
    if (p.highlights && p.highlights.length > 0) {
      highlightsEl.innerHTML = p.highlights.map((h) => `<li>${h}</li>`).join("");
      highlightsEl.hidden = false;
    } else {
      highlightsEl.innerHTML = "";
      highlightsEl.hidden = true;
    }

    document.getElementById("modalStack").innerHTML = p.stack
      .map((t) => `<span class="tag">${t}</span>`)
      .join("");

    document.getElementById("modalLinks").innerHTML = `
      <a href="${p.repoUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">View on GitHub ↗</a>
      ${
        p.liveUrl
          ? `<a href="${p.liveUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">${p.liveLabel || "Live Demo"} ↗</a>`
          : ""
      }
    `;

    projectModal.hidden = false;
  }

  function closeProjectModal() {
    projectModal.hidden = true;
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-project-id]");
    if (btn) {
      openProjectModal(btn.getAttribute("data-project-id"));
    }
  });

  closeModalBtn.addEventListener("click", closeProjectModal);
  projectModal.addEventListener("click", (e) => {
    if (e.target === projectModal) closeProjectModal();
  });

  // Copy Email
  function copyEmail(email) {
    navigator.clipboard.writeText(email).then(
      () => showToast(`COPIED: ${email}`),
      () => showToast(email)
    );
  }

  ["copyEmailHero", "copyEmailFooter"].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener("click", () => copyEmail(btn.getAttribute("data-email")));
    }
  });

  // Command Palette
  const baseCommands = [
    { label: "Invert Theme Polarity (Light / Dark)", hint: "I", action: toggleTheme },
    { label: "Copy Email (oneashishshankar@gmail.com)", hint: "COPY", action: () => copyEmail("oneashishshankar@gmail.com") },
    { label: "Open GitHub Profile (@Ashishshankar26)", hint: "EXT", action: () => window.open("https://github.com/Ashishshankar26", "_blank") },
    { label: "Jump to Featured Work", hint: "#work", action: () => (location.hash = "#work") },
    { label: "Jump to All Projects Archive", hint: "#archive", action: () => (location.hash = "#archive") },
    { label: "Jump to Technical Stack", hint: "#stack", action: () => (location.hash = "#stack") }
  ];

  function renderCmdResults(query) {
    const q = query.trim().toLowerCase();
    const projectCmds = projects.map((p) => ({
      label: `Project: ${p.name} — ${p.subtitle}`,
      hint: p.language,
      action: () => openProjectModal(p.id)
    }));

    const all = [...baseCommands, ...projectCmds].filter((item) =>
      item.label.toLowerCase().includes(q)
    );

    cmdResults.innerHTML = all
      .slice(0, 10)
      .map(
        (item, idx) => `
      <button class="cmd-item" type="button" data-cmd-idx="${idx}">
        <span>${item.label}</span>
        <span class="mono muted">${item.hint}</span>
      </button>
    `
      )
      .join("");

    cmdResults.querySelectorAll(".cmd-item").forEach((el, idx) => {
      el.addEventListener("click", () => {
        closeCmdModal();
        all[idx].action();
      });
    });
  }

  function openCmdModal() {
    cmdModal.hidden = false;
    cmdInput.value = "";
    renderCmdResults("");
    setTimeout(() => cmdInput.focus(), 20);
  }

  function closeCmdModal() {
    cmdModal.hidden = true;
  }

  cmdTrigger.addEventListener("click", openCmdModal);
  closeCmdBtn.addEventListener("click", closeCmdModal);
  cmdModal.addEventListener("click", (e) => {
    if (e.target === cmdModal) closeCmdModal();
  });
  cmdInput.addEventListener("input", (e) => renderCmdResults(e.target.value));

  // Keyboard Shortcuts
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (cmdModal.hidden) openCmdModal();
      else closeCmdModal();
      return;
    }

    if (e.key === "Escape") {
      closeProjectModal();
      closeCmdModal();
      return;
    }

    const activeTag = document.activeElement?.tagName;
    if (activeTag === "INPUT" || activeTag === "TEXTAREA") return;

    if (e.key.toLowerCase() === "i") {
      toggleTheme();
    } else if (e.key === "/") {
      e.preventDefault();
      openCmdModal();
    }
  });

  // Initial Render
  renderFeatured();
  renderArchive();
})();
