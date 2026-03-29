let currentProjectId = null;
let currentTab = 'panoramica';

function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

function handleRoute() {
  const hash = window.location.hash || '#dashboard';
  if (hash.startsWith('#project/')) {
    const parts = hash.split('/');
    const id = parts[1];
    const tab = parts[2] || 'panoramica';
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

function showProjectView(projectId, tab = 'panoramica') {
  const project = getProject(projectId);
  if (!project) { window.location.hash = '#dashboard'; return; }
  currentProjectId = projectId;
  currentTab = tab;
  showView('project');
  renderProjectHeader(project);
  setActiveTab(tab);
  renderTabContent(project, tab);
  updateSidebarActive(null);
}

/* ═══════════════════════
   PROJECT HEADER RENDER
═══════════════════════ */
function renderProjectHeader(project) {
  const acc = project.access || {};
  const s = project.brief?.scheda || {};
  const progress = getChecklistProgress(project);
  const statusLabel = { attivo:'Attivo', pausa:'In Pausa', consegnato:'Consegnato', archiviato:'Archiviato' };
  const domain = s.dominio || acc.url?.replace('/wp-admin','').replace('https://','').replace('http://','') || '';

  // Logo / avatar
  const logoHtml = project.logo
    ? `<img src="${project.logo}" alt="logo">`
    : `<span class="ph-logo-initials">${getInitialsFor(project.name)}</span>`;

  // Access bar chips
  let accessChips = '';
  if (acc.url) {
    accessChips += `<a class="access-chip wp" href="${escHtml(acc.url)}" target="_blank">
      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6" cy="6" r="5"/><path d="M1 6h10M6 1.5a7 7 0 010 9M6 1.5a7 7 0 000 9"/></svg>
      WP Admin — ${escHtml(acc.url.replace('https://','').replace('http://','').replace('/wp-admin',''))}
    </a>`;
  }
  if (acc.username) {
    accessChips += `<div class="access-chip cred" onclick="copyToClipboard('${escHtml(acc.username)}','Username copiato')" title="Copia username">
      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6" cy="4" r="2"/><path d="M2 10c0-2.2 1.8-4 4-4s4 1.8 4 4"/></svg>
      <span class="access-chip-label">User</span>${escHtml(acc.username)}
    </div>`;
  }
  if (acc.password) {
    accessChips += `<div class="access-chip cred" onclick="copyToClipboard('${escHtml(acc.password)}','Password copiata')" title="Copia password">
      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="5" width="8" height="6" rx="1"/><path d="M4 5V4a2 2 0 014 0v1"/></svg>
      <span class="access-chip-label">Pass</span>••••••••
    </div>`;
  }

  // Progress in access bar
  accessChips += `
    <div class="ph-progress-bar-wrap" style="margin-left:auto;">
      <div class="ph-progress-mini"><div class="ph-progress-mini-fill" id="hdr-prog-bar" style="width:${progress.pct}%"></div></div>
      <span class="ph-progress-pct" id="hdr-prog-pct">${progress.pct}%</span>
    </div>`;

  // Brief upload chip (sempre visibile)
  accessChips += `
    <label class="access-chip" style="cursor:pointer;background:${project.brief?'rgba(200,241,53,0.08)':'var(--surface2)'};border-color:${project.brief?'rgba(200,241,53,0.25)':'var(--border)'};color:${project.brief?'var(--accent)':'var(--text3)'};" title="${project.brief?'Ricarica brief':'Carica brief .docx'}">
      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 8V2M3 5l3-3 3 3M1 9v1.5A1.5 1.5 0 002.5 12h7a1.5 1.5 0 001.5-1.5V9"/></svg>
      ${project.brief ? 'Brief ✓' : 'Carica brief'}
      <input type="file" accept=".docx" style="display:none" onchange="handleBriefUpload(event,'${escHtml(project.id)}')">
    </label>`;

  document.getElementById('project-header').innerHTML = `
    <!-- TOP BAR -->
    <div class="ph-top">
      <a class="ph-back" href="#dashboard">
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2L4 6l4 4"/></svg>
      </a>

      <!-- LOGO UPLOAD -->
      <label class="ph-logo" title="Cambia logo progetto">
        ${logoHtml}
        <div class="ph-logo-overlay">
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 3v8M3 7l4-4 4 4"/></svg>
        </div>
        <input type="file" accept="image/*" onchange="handleLogoUpload(event,'${escHtml(project.id)}')">
      </label>

      <!-- NAME + DOMAIN -->
      <div class="ph-info">
        <div class="ph-name">${escHtml(project.name)}</div>
        <div class="ph-meta">
          ${domain ? `<a class="ph-domain" href="${domain.startsWith('http')?domain:'https://'+domain}" target="_blank">
            <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 5h8M6 2l3 3-3 3"/></svg>
            ${escHtml(domain)}
          </a>` : ''}
          ${s.tipoSito ? `<span class="ph-badge ph-badge-type">${escHtml(s.tipoSito)}</span>` : ''}
        </div>
      </div>

      <!-- STATUS -->
      <div class="ph-status-wrap">
        <div class="ph-status" data-status="${escHtml(project.status||'attivo')}" onclick="toggleStatusDropdown(event)">
          <span class="status-dot"></span>
          <span id="ph-status-label">${statusLabel[project.status||'attivo']}</span>
          <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 4l3 3 3-3"/></svg>
        </div>
        <div class="status-dropdown" id="status-dropdown">
          ${Object.entries(statusLabel).map(([val,label])=>`
            <div class="status-option" data-val="${val}" onclick="setProjectStatus('${escHtml(project.id)}','${val}',this)">
              <span class="status-dot"></span>${label}
            </div>`).join('')}
        </div>
      </div>

      <!-- ACTIONS -->
      <div class="ph-actions">
        <button class="btn btn-secondary btn-sm" onclick="openExportModal(currentProjectId)">
          <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6.5 1v7M3.5 5.5l3 3 3-3M1 9.5v1.5a1 1 0 001 1h9a1 1 0 001-1V9.5"/></svg>
          Export
        </button>
        <label class="btn btn-secondary btn-sm" style="cursor:pointer;">
          <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6.5 9V2M3.5 4l3-3 3 3M1 9.5v1.5a1 1 0 001 1h9a1 1 0 001-1V9.5"/></svg>
          Import
          <input type="file" accept=".json" style="display:none" onchange="openImportModalFromFile(event)">
        </label>
      </div>
    </div>

    <!-- ACCESS BAR -->
    <div class="ph-access-bar">${accessChips}</div>
  `;
}

function getInitialsFor(name) {
  if (!name) return '?';
  return name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
}

async function handleLogoUpload(event, projectId) {
  const file = event.target.files[0];
  if (!file) return;
  try {
    await uploadProjectLogo(projectId, file);
    const project = getProject(projectId);
    renderProjectHeader(project);
    renderDashboard(); // refresh cards
    showToast('Logo aggiornato!', 'success');
  } catch(e) {
    showToast('Errore: ' + e, 'error');
  }
  event.target.value = '';
}

function toggleStatusDropdown(e) {
  e.stopPropagation();
  const dd = document.getElementById('status-dropdown');
  dd.classList.toggle('open');
}

function setProjectStatus(projectId, status, el) {
  updateProject(projectId, { status });
  const statusEl = document.querySelector('.ph-status');
  const labelEl = document.getElementById('ph-status-label');
  if (statusEl) statusEl.dataset.status = status;
  const labels = { attivo:'Attivo', pausa:'In Pausa', consegnato:'Consegnato', archiviato:'Archiviato' };
  if (labelEl) labelEl.textContent = labels[status];
  document.getElementById('status-dropdown')?.classList.remove('open');
  showToast(`Stato: ${labels[status]}`, 'success');
}

function refreshHeaderProgress(project) {
  const progress = getChecklistProgress(project);
  const bar = document.getElementById('hdr-prog-bar');
  const pct = document.getElementById('hdr-prog-pct');
  if (bar) bar.style.width = progress.pct + '%';
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
    case 'panoramica': renderPanoramica(project); break;
    case 'brief': renderBrief(project); break;
    case 'checklist': renderChecklist(project); break;
    case 'access': renderAccess(project); break;
    case 'assets': renderAssets(project); break;
    case 'revisions': renderRevisions(project); break;
  }
}

function navigateToProject(projectId, tab = 'panoramica') {
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

// Close dropdowns on outside click
document.addEventListener('click', () => {
  document.getElementById('status-dropdown')?.classList.remove('open');
});
