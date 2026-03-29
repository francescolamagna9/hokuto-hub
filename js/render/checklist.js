function renderChecklist(project) {
  const container = document.getElementById('tab-checklist');
  if (!container) return;

  const progress = getChecklistProgress(project);

  let navItems = PHASES.map(phase => {
    const pp = getPhaseProgress(project, phase.id);
    return `
      <a class="checklist-phase-nav-item" href="#phase-${phase.id}" onclick="scrollToPhase(${phase.id})">
        <span class="phase-nav-num">0${phase.id > 9 ? '' : ''}${phase.id}</span>
        <span class="phase-nav-name">${escHtml(phase.title)}</span>
        <span class="phase-nav-pct">${pp.pct}%</span>
      </a>`;
  }).join('');

  let phasesHtml = PHASES.map(phase => {
    const pp = getPhaseProgress(project, phase.id);
    const isComplete = pp.pct === 100;

    let groupsHtml = phase.groups.map(group => {
      const doneCount = group.items.filter(item => project.checklist[item.id]).length;
      let itemsHtml = group.items.map(item => {
        const checked = project.checklist[item.id] || false;
        const tags = (item.tags || []).map(t => `<span class="tag tag-${t}">${t}</span>`).join('');
        return `
          <div class="checklist-item ${checked ? 'done' : ''}" id="ci-${item.id}">
            <label class="checklist-item-check">
              <input type="checkbox" ${checked ? 'checked' : ''} onchange="toggleCheckItem('${project.id}', '${item.id}', this.checked)">
              <div class="checklist-check-box"></div>
            </label>
            <div class="checklist-item-content">
              <div class="checklist-item-text">${escHtml(item.text)}</div>
              ${tags ? `<div class="checklist-item-tags">${tags}</div>` : ''}
            </div>
          </div>`;
      }).join('');

      return `
        <div class="checklist-group">
          <div class="checklist-group-header" onclick="toggleGroup(this)">
            <svg class="checklist-group-toggle" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 5l4 4 4-4"/></svg>
            <span class="checklist-group-name">${escHtml(group.name)}</span>
            <span class="checklist-group-count">${doneCount}/${group.items.length}</span>
          </div>
          <div class="checklist-group-items">${itemsHtml}</div>
        </div>`;
    }).join('');

    return `
      <div class="checklist-phase ${isComplete ? 'phase-complete' : ''}" id="phase-${phase.id}">
        <div class="checklist-phase-header">
          <div class="phase-num-badge">${String(phase.id).padStart(2, '0')}</div>
          <div class="phase-header-info">
            <div class="phase-title">${escHtml(phase.title)}</div>
            <div class="phase-progress-mini">
              <div class="progress-bar">
                <div class="progress-bar-fill" style="width:${pp.pct}%"></div>
              </div>
              <span>${pp.done}/${pp.total}</span>
            </div>
          </div>
          ${isComplete ? `<span class="badge badge-success">✓ Completa</span>` : ''}
        </div>
        ${groupsHtml}
      </div>`;
  }).join('');

  container.innerHTML = `
    <div class="checklist-layout">
      <div class="checklist-sidebar">
        <div class="checklist-global-progress">
          <div class="progress-bar-label">
            <span class="progress-label-title">Progresso Totale</span>
          </div>
          <div class="checklist-global-percent">${progress.pct}%</div>
          <div class="progress-bar"><div class="progress-bar-fill" style="width:${progress.pct}%"></div></div>
          <div style="font-size:11px;color:var(--text3);margin-top:6px;">${progress.done} di ${progress.total} completate</div>
        </div>
        <div class="checklist-phase-nav">${navItems}</div>
      </div>
      <div class="checklist-phases">${phasesHtml}</div>
    </div>
  `;
}

function toggleCheckItem(projectId, itemId, value) {
  updateChecklist(projectId, itemId, value);
  const item = document.getElementById('ci-' + itemId);
  if (item) item.classList.toggle('done', value);

  // Update progress UI without full re-render
  const project = getProject(projectId);
  const progress = getChecklistProgress(project);
  const globalPct = document.querySelector('.checklist-global-percent');
  if (globalPct) globalPct.textContent = progress.pct + '%';
  const globalBar = document.querySelector('.checklist-global-progress .progress-bar-fill');
  if (globalBar) globalBar.style.width = progress.pct + '%';
  const globalCount = document.querySelector('.checklist-global-progress div:last-child');
  if (globalCount) globalCount.textContent = `${progress.done} di ${progress.total} completate`;

  // Update tab badge
  updateChecklistBadge(project);
}

function updateChecklistBadge(project) {
  const progress = getChecklistProgress(project);
  const badge = document.querySelector('[data-tab="checklist"] .tab-progress-badge');
  if (badge) badge.textContent = `${progress.pct}%`;
}

function toggleGroup(header) {
  header.classList.toggle('collapsed');
  const items = header.nextElementSibling;
  if (items) items.classList.toggle('collapsed');
}

function scrollToPhase(phaseId) {
  const el = document.getElementById('phase-' + phaseId);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
