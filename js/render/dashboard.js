function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function renderDashboard() {
  const projects = getAllProjects();
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  let html = '';

  projects.forEach(project => {
    const progress = getChecklistProgress(project);
    const initials = getInitials(project.name);
    const date = new Date(project.updatedAt).toLocaleDateString('it-IT');

    html += `
      <div class="project-card" data-id="${escHtml(project.id)}" onclick="navigateToProject('${escHtml(project.id)}')">
        <div class="project-card-header">
          <div class="project-card-avatar">${escHtml(initials)}</div>
          <button class="project-card-menu" onclick="event.stopPropagation(); openDeleteModal('${escHtml(project.id)}', '${escHtml(project.name)}')" title="Elimina progetto">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1m2 0l-.8 9.2A1 1 0 0113.2 14H2.8a1 1 0 01-1-.8L1 4"/>
            </svg>
          </button>
        </div>
        <div class="project-card-name">${escHtml(project.name)}</div>
        <div class="project-card-meta">Aggiornato il ${escHtml(date)}</div>
        <div class="progress-bar-wrap">
          <div class="progress-bar-label">
            <span>Checklist</span>
            <span>${progress.done}/${progress.total} — ${progress.pct}%</span>
          </div>
          <div class="progress-bar"><div class="progress-bar-fill" style="width:${progress.pct}%"></div></div>
        </div>
      </div>
    `;
  });

  html += `
    <div class="add-project-card" onclick="openNewProjectModal()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>
      </svg>
      <span>Nuovo Progetto</span>
    </div>
  `;

  grid.innerHTML = html;
}

let deleteProjectId = null;

function openDeleteModal(id, name) {
  deleteProjectId = id;
  document.getElementById('delete-project-name').textContent = name;
  document.getElementById('modal-delete').classList.add('open');
}

function closeDeleteModal() {
  document.getElementById('modal-delete').classList.remove('open');
  deleteProjectId = null;
}

function confirmDeleteProject() {
  if (!deleteProjectId) return;
  deleteProject(deleteProjectId);
  closeDeleteModal();
  renderDashboard();
  showToast('Progetto eliminato', 'success');
}

function openNewProjectModal() {
  document.getElementById('modal-new-project').classList.add('open');
  document.getElementById('new-project-name').value = '';
  document.getElementById('new-project-client').value = '';
  document.getElementById('new-brief-file-name').textContent = '';
  window._newBriefFile = null;
  setTimeout(() => document.getElementById('new-project-name').focus(), 100);
}

function closeNewProjectModal() {
  document.getElementById('modal-new-project').classList.remove('open');
}
