let assetsDebounce = null;

function renderAssets(project) {
  const container = document.getElementById('tab-assets');
  if (!container) return;

  const assets = project.assets || { links: [], briefUpdates: '', generalNotes: '' };

  container.innerHTML = `
    <div style="max-width:700px;display:flex;flex-direction:column;gap:24px;">

      <!-- Link Utili -->
      <div class="settings-section">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <h3 style="font-family:'Syne',sans-serif;font-weight:800;font-size:16px;margin:0;">Link Utili</h3>
          <button class="btn btn-secondary btn-sm" onclick="openAddLinkModal('${escHtml(project.id)}')">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 1v12M1 7h12"/></svg>
            Aggiungi Link
          </button>
        </div>
        <div id="links-list">
          ${renderLinksList(assets.links, project.id)}
        </div>
      </div>

      <!-- Aggiornamenti Brief -->
      <div class="settings-section">
        <h3 style="font-family:'Syne',sans-serif;font-weight:800;font-size:16px;margin-bottom:16px;">Aggiornamenti Brief</h3>
        <p style="font-size:12px;color:var(--text3);margin-bottom:12px;">Modifiche post-brief: cambi colore, pagine aggiunte, richieste cliente ecc.</p>
        <textarea class="form-textarea" id="assets-brief-updates" rows="6"
          placeholder="Es: Il cliente ha richiesto di aggiungere una pagina Blog. Colore primario cambiato da #333 a #1a1a2e..."
          oninput="assetsAutoSave('${escHtml(project.id)}')">${escHtml(assets.briefUpdates || '')}</textarea>
      </div>

      <!-- Note Generali -->
      <div class="settings-section">
        <h3 style="font-family:'Syne',sans-serif;font-weight:800;font-size:16px;margin-bottom:16px;">Note Generali</h3>
        <textarea class="form-textarea" id="assets-notes" rows="6"
          placeholder="Appunti liberi, TODO, promemoria..."
          oninput="assetsAutoSave('${escHtml(project.id)}')">${escHtml(assets.generalNotes || '')}</textarea>
      </div>

    </div>
  `;
}

function renderLinksList(links, projectId) {
  if (!links || !links.length) {
    return `<div style="text-align:center;padding:20px;color:var(--text3);font-size:13px;">Nessun link aggiunto</div>`;
  }
  return links.map((link, idx) => `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);">
      <div style="flex:1;min-width:0;">
        <div style="font-size:13px;font-weight:500;color:var(--text);">${escHtml(link.label)}</div>
        <a href="${escHtml(link.url)}" target="_blank" style="font-size:12px;color:var(--info);text-decoration:none;word-break:break-all;">${escHtml(link.url)}</a>
      </div>
      <button class="btn btn-ghost btn-sm btn-icon" onclick="openUrl('${escHtml(link.url)}')" title="Apri">
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 7h10M8 3l4 4-4 4"/></svg>
      </button>
      <button class="btn btn-danger btn-sm btn-icon" onclick="deleteLink('${escHtml(projectId)}', ${idx})" title="Elimina">
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 3h10M5 3V2a1 1 0 011-1h2a1 1 0 011 1v1m2 0l-.7 8.2A1 1 0 0110.3 12H3.7a1 1 0 01-1-.8L2 3"/></svg>
      </button>
    </div>`).join('');
}

function openUrl(url) {
  if (url) window.open(url, '_blank');
}

function deleteLink(projectId, idx) {
  const project = getProject(projectId);
  if (!project) return;
  const assets = project.assets || { links: [], briefUpdates: '', generalNotes: '' };
  assets.links.splice(idx, 1);
  updateProject(projectId, { assets, assetsUpdatedAt: new Date().toISOString() });
  const list = document.getElementById('links-list');
  if (list) list.innerHTML = renderLinksList(assets.links, projectId);
  showToast('Link eliminato', 'success');
}

function assetsAutoSave(projectId) {
  clearTimeout(assetsDebounce);
  assetsDebounce = setTimeout(() => {
    const project = getProject(projectId);
    const assets = project ? (project.assets || { links: [], briefUpdates: '', generalNotes: '' }) : { links: [], briefUpdates: '', generalNotes: '' };
    const briefUpdates = document.getElementById('assets-brief-updates');
    const notes = document.getElementById('assets-notes');
    if (briefUpdates) assets.briefUpdates = briefUpdates.value;
    if (notes) assets.generalNotes = notes.value;
    updateProject(projectId, { assets, assetsUpdatedAt: new Date().toISOString() });
  }, 600);
}

let addLinkProjectId = null;

function openAddLinkModal(projectId) {
  addLinkProjectId = projectId;
  document.getElementById('new-link-label').value = '';
  document.getElementById('new-link-url').value = '';
  document.getElementById('modal-add-link').classList.add('open');
  setTimeout(() => document.getElementById('new-link-label').focus(), 100);
}

function closeAddLinkModal() {
  document.getElementById('modal-add-link').classList.remove('open');
  addLinkProjectId = null;
}

function confirmAddLink() {
  if (!addLinkProjectId) return;
  const label = document.getElementById('new-link-label').value.trim();
  const url = document.getElementById('new-link-url').value.trim();
  if (!label || !url) { showToast('Compila tutti i campi', 'warn'); return; }

  const project = getProject(addLinkProjectId);
  if (!project) return;
  const assets = project.assets || { links: [], briefUpdates: '', generalNotes: '' };
  assets.links.push({ label, url });
  updateProject(addLinkProjectId, { assets, assetsUpdatedAt: new Date().toISOString() });
  const list = document.getElementById('links-list');
  if (list) list.innerHTML = renderLinksList(assets.links, addLinkProjectId);
  closeAddLinkModal();
  showToast('Link aggiunto', 'success');
}
