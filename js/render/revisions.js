const REVISION_COLORS = [
  '#c8f135','#38bdf8','#f472b6','#fb923c','#a78bfa',
  '#34d399','#fbbf24','#f87171','#4ade80','#60a5fa'
];

function renderRevisions(project) {
  const container = document.getElementById('tab-revisions');
  if (!container) return;

  const revisions = project.revisions || [];

  container.innerHTML = `
    <div class="revisions-header">
      <h3>Round Revisioni</h3>
      <label class="btn btn-secondary btn-sm" style="cursor:pointer;">
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 1v12M1 7h12"/></svg>
        Carica .txt
        <input type="file" accept=".txt" style="display:none" onchange="handleRevisionUpload(event, '${escHtml(project.id)}')">
      </label>
    </div>

    ${!revisions.length ? `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M9 12h6M9 16h6M7 8h10M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z"/></svg>
        <h3>Nessuna revisione</h3>
        <p>Carica un file .txt con le revisioni del cliente. Usa [SEZIONE] per separare le categorie.</p>
      </div>` : revisions.map((round, ri) => renderRound(round, ri, project.id)).join('')}
  `;
}

function renderRound(round, roundIndex, projectId) {
  const totalItems = round.sections.reduce((s, sec) => s + sec.items.length, 0);
  const doneItems = round.sections.reduce((s, sec) => s + sec.items.filter(i => i.done).length, 0);
  const pct = totalItems ? Math.round((doneItems / totalItems) * 100) : 0;

  const allSections = round.sections.map(s => s.name);
  const filtersHtml = `
    <div class="revision-filters">
      <button class="revision-filter-btn active" onclick="filterRevision(this, '${roundIndex}', 'all')" style="background:var(--surface2);color:var(--text2);">Tutto</button>
      ${allSections.map((name, si) => {
        const color = REVISION_COLORS[si % REVISION_COLORS.length];
        return `<button class="revision-filter-btn" onclick="filterRevision(this, '${roundIndex}', '${si}')" style="background:${color}20;border-color:${color}40;color:${color};">${escHtml(name)}</button>`;
      }).join('')}
    </div>`;

  const sectionsHtml = round.sections.map((sec, si) => {
    const color = REVISION_COLORS[si % REVISION_COLORS.length];
    const itemsHtml = sec.items.map((item, ii) => `
      <div class="revision-item ${item.done ? 'done' : ''}" id="ri-${roundIndex}-${si}-${ii}">
        <label class="revision-item-check">
          <input type="checkbox" ${item.done ? 'checked' : ''} onchange="toggleRevisionItem('${projectId}', ${roundIndex}, ${si}, ${ii}, this.checked)">
          <div class="rev-check-box"></div>
        </label>
        <div class="revision-item-text">${escHtml(item.text)}</div>
      </div>`).join('');

    return `
      <div class="revision-section" data-section="${si}">
        <div class="revision-section-label" style="background:${color}20;color:${color};border:1px solid ${color}40;">${escHtml(sec.name)}</div>
        <div class="revision-section-items">${itemsHtml}</div>
      </div>`;
  }).join('');

  return `
    <div class="revision-round" id="round-${roundIndex}">
      <div class="revision-round-header" onclick="toggleRound(this)">
        <span class="revision-round-num">Round ${roundIndex + 1}</span>
        <span class="revision-round-title">${escHtml(round.name || `Revisione ${roundIndex + 1}`)}</span>
        <span class="revision-round-progress">${doneItems}/${totalItems} — ${pct}%</span>
        <span class="revision-round-toggle">
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 5l4 4 4-4"/></svg>
        </span>
      </div>
      <div class="revision-round-body">
        ${filtersHtml}
        <div class="revision-sections-wrap" id="rsw-${roundIndex}">${sectionsHtml}</div>
        <div class="revision-round-progress-bar">
          <div class="progress-bar-label">
            <span>Completamento round</span>
            <span id="rpct-${roundIndex}">${pct}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-bar-fill" id="rbar-${roundIndex}" style="width:${pct}%"></div>
          </div>
        </div>
      </div>
    </div>`;
}

function toggleRound(header) {
  header.classList.toggle('open');
  const body = header.nextElementSibling;
  if (body) body.classList.toggle('open');
}

function filterRevision(btn, roundIndex, filter) {
  const wrap = document.getElementById('rsw-' + roundIndex);
  if (!wrap) return;
  const filterBtns = btn.closest('.revision-filters').querySelectorAll('.revision-filter-btn');
  filterBtns.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const sections = wrap.querySelectorAll('.revision-section');
  sections.forEach((sec, i) => {
    if (filter === 'all' || filter === String(i)) {
      sec.style.display = '';
    } else {
      sec.style.display = 'none';
    }
  });
}

function toggleRevisionItem(projectId, roundIndex, sectionIndex, itemIndex, value) {
  const project = getProject(projectId);
  if (!project) return;
  const revisions = project.revisions || [];
  if (!revisions[roundIndex]) return;
  revisions[roundIndex].sections[sectionIndex].items[itemIndex].done = value;
  updateProject(projectId, { revisions, revisionsUpdatedAt: new Date().toISOString() });

  const itemEl = document.getElementById(`ri-${roundIndex}-${sectionIndex}-${itemIndex}`);
  if (itemEl) itemEl.classList.toggle('done', value);

  // Update progress
  const round = revisions[roundIndex];
  const total = round.sections.reduce((s, sec) => s + sec.items.length, 0);
  const done = round.sections.reduce((s, sec) => s + sec.items.filter(i => i.done).length, 0);
  const pct = total ? Math.round((done / total) * 100) : 0;
  const pctEl = document.getElementById(`rpct-${roundIndex}`);
  const barEl = document.getElementById(`rbar-${roundIndex}`);
  if (pctEl) pctEl.textContent = pct + '%';
  if (barEl) barEl.style.width = pct + '%';

  // Update header progress
  const headerProgress = document.querySelector(`#round-${roundIndex} .revision-round-progress`);
  if (headerProgress) headerProgress.textContent = `${done}/${total} — ${pct}%`;
}

function handleRevisionUpload(event, projectId) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    const text = e.target.result;
    const sections = parseRevision(text);
    const project = getProject(projectId);
    if (!project) return;
    const revisions = project.revisions || [];
    revisions.push({
      name: file.name.replace('.txt', ''),
      uploadedAt: new Date().toISOString(),
      sections
    });
    updateProject(projectId, { revisions, revisionsUpdatedAt: new Date().toISOString() });
    const updated = getProject(projectId);
    renderRevisions(updated);
    showToast(`Round ${revisions.length} aggiunto`, 'success');
  };
  reader.readAsText(file);
  event.target.value = '';
}
