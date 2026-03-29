let currentProjectId = null;
let currentTab = 'brief';

function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

function handleRoute() {
  const hash = window.location.hash || '#dashboard';

  if (hash.startsWith('#project/')) {
    const parts = hash.split('/');
    const id = parts[1];
    const tab = parts[2] || 'brief';
    showProjectView(id, tab);
  } else if (hash === '#settings') {
    showView('settings');
    updateSidebarActive('#settings');
    renderSettings();
  } else {
    showView('dashboard');
    renderDashboard();
    updateSidebarActive('#dashboard');
  }
}

function showView(viewName) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const view = document.getElementById('view-' + viewName);
  if (view) view.classList.add('active');
}

function showProjectView(projectId, tab = 'brief') {
  const project = getProject(projectId);
  if (!project) {
    window.location.hash = '#dashboard';
    return;
  }

  currentProjectId = projectId;
  currentTab = tab;

  showView('project');
  updateClientHeader(project);
  setActiveTab(tab);
  renderTabContent(project, tab);
  updateSidebarActive(null);
}

function updateClientHeader(project) {
  const nameEl = document.getElementById('project-header-name');
  if (nameEl) nameEl.textContent = project.name;

  const strip = document.getElementById('project-info-strip');
  if (!strip) return;

  const progress = getChecklistProgress(project);
  const s = project.brief?.scheda || {};
  const acc = project.access || {};

  let chips = '';

  // Progress chip
  chips += `
    <div class="progress-chip" title="Progresso checklist">
      <div class="progress-chip-bar">
        <div class="progress-chip-fill" id="header-progress-fill" style="width:${progress.pct}%"></div>
      </div>
      <span class="progress-chip-pct" id="header-progress-pct">${progress.pct}%</span>
    </div>`;

  chips += `<div class="info-strip-divider"></div>`;

  // WP Admin link (sempre mostrato, disabilitato se vuoto)
  if (acc.url) {
    chips += `
      <a class="info-chip wp-chip" href="${escHtml(acc.url)}" target="_blank" title="Apri WP Admin">
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6" cy="6" r="5"/><path d="M1.5 6h9M6 1.5a7 7 0 010 9M6 1.5a7 7 0 000 9"/></svg>
        WP Admin
      </a>`;
  }

  // Username copy
  if (acc.username) {
    chips += `
      <div class="info-chip clickable" onclick="copyToClipboard('${escHtml(acc.username)}','Username copiato')" title="Copia username">
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6" cy="4" r="2"/><path d="M2 10c0-2.2 1.8-4 4-4s4 1.8 4 4"/></svg>
        ${escHtml(acc.username)}
      </div>`;
  }

  // Password copy
  if (acc.password) {
    chips += `
      <div class="info-chip clickable" onclick="copyToClipboard('${escHtml(acc.password)}','Password copiata')" title="Copia password">
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="5" width="8" height="6" rx="1"/><path d="M4 5V4a2 2 0 014 0v1"/><circle cx="6" cy="8" r="0.8" fill="currentColor" stroke="none"/></svg>
        ••••••••
      </div>`;
  }

  // Divider se ci sono dati brief
  if (s.dominio || s.telefono || s.email) {
    chips += `<div class="info-strip-divider"></div>`;
  }

  // Dominio
  if (s.dominio) {
    const href = s.dominio.startsWith('http') ? s.dominio : 'https://' + s.dominio;
    chips += `
      <a class="info-chip clickable" href="${escHtml(href)}" target="_blank" title="Apri sito">
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 2h8v8H2zM5 2v8M2 5h8"/></svg>
        ${escHtml(s.dominio)}
      </a>`;
  }

  // Telefono
  if (s.telefono) {
    chips += `
      <a class="info-chip clickable" href="tel:${escHtml(s.telefono)}" title="Chiama">
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 2l2.5 1L5.5 5 4 6.5c.8 1.6 2 2.7 3.5 3.5L9 8.5l2 1 .5 2C6 13 1 8 2 2z"/></svg>
        ${escHtml(s.telefono)}
      </a>`;
  }

  // Email
  if (s.email) {
    chips += `
      <a class="info-chip clickable" href="mailto:${escHtml(s.email)}" title="Invia email">
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="2.5" width="10" height="7" rx="1"/><path d="M1 3.5l5 3.5 5-3.5"/></svg>
        ${escHtml(s.email)}
      </a>`;
  }

  // Upload brief button sempre in fondo alla strip
  chips += `<div class="info-strip-divider"></div>`;
  chips += `
    <label class="info-chip clickable ${project.brief ? 'accent' : ''}" title="${project.brief ? 'Ricarica brief .docx' : 'Carica brief .docx'}" style="cursor:pointer;">
      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 8V2M3 5l3-3 3 3M1 9v1.5A1.5 1.5 0 002.5 12h7a1.5 1.5 0 001.5-1.5V9"/></svg>
      ${project.brief ? 'Brief ✓' : 'Carica brief'}
      <input type="file" accept=".docx" style="display:none" onchange="handleBriefUpload(event,'${escHtml(project.id)}')">
    </label>`;

  strip.innerHTML = chips;
}

function refreshHeaderProgress(project) {
  const progress = getChecklistProgress(project);
  const fill = document.getElementById('header-progress-fill');
  const pct = document.getElementById('header-progress-pct');
  if (fill) fill.style.width = progress.pct + '%';
  if (pct) pct.textContent = progress.pct + '%';
}

function setActiveTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
}

function renderTabContent(project, tab) {
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  const pane = document.getElementById('tab-' + tab);
  if (pane) pane.classList.add('active');

  switch (tab) {
    case 'brief': renderBrief(project); break;
    case 'checklist': renderChecklist(project); break;
    case 'access': renderAccess(project); break;
    case 'assets': renderAssets(project); break;
    case 'revisions': renderRevisions(project); break;
  }
}

function navigateToProject(projectId, tab = 'brief') {
  window.location.hash = `#project/${projectId}/${tab}`;
}

function switchTab(tab) {
  if (!currentProjectId) return;
  currentTab = tab;
  window.location.hash = `#project/${currentProjectId}/${tab}`;
}

function updateSidebarActive(hash) {
  document.querySelectorAll('.sidebar-nav a, .sidebar-footer a').forEach(a => {
    a.classList.remove('active');
    if (hash && a.getAttribute('href') === hash) a.classList.add('active');
  });
}
