function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
}

const STATUS_COLORS = { attivo:'var(--success)', pausa:'var(--warn)', consegnato:'var(--info)', archiviato:'var(--muted)' };
const STATUS_LABELS = { attivo:'Attivo', pausa:'In Pausa', consegnato:'Consegnato', archiviato:'Archiviato' };

function renderDashboard() {
  const projects = getAllProjects();
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  let html = '';
  projects.forEach(project => {
    const progress = getChecklistProgress(project);
    const initials = getInitials(project.name);
    const date = new Date(project.updatedAt).toLocaleDateString('it-IT');
    const statusColor = STATUS_COLORS[project.status||'attivo'];
    const statusLabel = STATUS_LABELS[project.status||'attivo'];
    const domain = project.brief?.scheda?.dominio || project.access?.url?.replace('https://','').replace('/wp-admin','') || '';

    const avatarHtml = project.logo
      ? `<img src="${project.logo}" style="width:100%;height:100%;object-fit:contain;padding:6px;border-radius:10px;" alt="">`
      : `<span style="font-family:'Syne',sans-serif;font-weight:800;font-size:18px;color:var(--accent);">${escHtml(initials)}</span>`;

    html += `
      <div class="project-card" onclick="navigateToProject('${escHtml(project.id)}')">
        <div class="project-card-header">
          <div class="project-card-avatar">${avatarHtml}</div>
          <div style="flex:1;min-width:0;">
            <div class="project-card-name">${escHtml(project.name)}</div>
            ${domain ? `<div style="font-size:11px;color:var(--info);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escHtml(domain)}</div>` : `<div style="font-size:11px;color:var(--text3);margin-top:2px;">Aggiornato ${escHtml(date)}</div>`}
          </div>
          <button class="project-card-menu" onclick="event.stopPropagation(); openDeleteModal('${escHtml(project.id)}','${escHtml(project.name)}')" title="Elimina">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1m2 0l-.8 9.2A1 1 0 0113.2 14H2.8a1 1 0 01-1-.8L1 4"/></svg>
          </button>
        </div>

        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
          <span style="display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;font-family:'Syne',sans-serif;color:${statusColor};">
            <span style="width:6px;height:6px;border-radius:50%;background:${statusColor};"></span>
            ${statusLabel}
          </span>
          ${project.deadline ? (() => {
            const days = Math.round((new Date(project.deadline) - new Date()) / 86400000);
            const c = days < 0 ? 'var(--danger)' : days <= 7 ? 'var(--warn)' : 'var(--text3)';
            return `<span style="font-size:11px;color:${c};margin-left:auto;">${days < 0 ? 'Scaduta' : days+'gg'}</span>`;
          })() : ''}
        </div>

        <div class="progress-bar-wrap">
          <div class="progress-bar-label">
            <span>Checklist</span>
            <span>${progress.done}/${progress.total} — ${progress.pct}%</span>
          </div>
          <div class="progress-bar"><div class="progress-bar-fill" style="width:${progress.pct}%"></div></div>
        </div>
      </div>`;
  });

  html += `
    <div class="add-project-card" onclick="openNewProjectModal()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
      <span>Nuovo Progetto</span>
    </div>`;

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
