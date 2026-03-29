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
  const metaEl = document.getElementById('project-header-meta');
  if (nameEl) nameEl.textContent = project.name;
  if (metaEl) {
    const progress = getChecklistProgress(project);
    metaEl.innerHTML = `
      <span>${progress.pct}% completato</span>
      <a id="header-wp-link" href="${escHtml(project.access?.url || '')}" target="_blank"
        style="${project.access?.url ? '' : 'display:none'}">
        <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 5h8M6 2l3 3-3 3"/></svg>
        WP Admin
      </a>`;
  }
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
