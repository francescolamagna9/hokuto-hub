// ─── TOAST ───
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icons = {
    success: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 8l3 3 7-7"/></svg>`,
    error: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4l8 8M12 4l-8 8"/></svg>`,
    warn: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2l6 12H2L8 2z"/><path d="M8 7v3M8 12v.5"/></svg>`,
    info: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 7v4M8 5.5V6"/></svg>`,
  };

  toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${escHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(12px)';
    toast.style.transition = 'all 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ─── COPY TO CLIPBOARD ───
function copyToClipboard(text, successMsg = 'Copiato!') {
  navigator.clipboard.writeText(text).then(() => {
    showToast(successMsg, 'success');
  }).catch(() => {
    showToast('Impossibile copiare', 'error');
  });
}

// ─── GROQ API KEY ───
async function testGroqKey(key) {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Say OK' }]
      })
    });
    const data = await res.json();
    return !data.error;
  } catch { return false; }
}

function updateApiStatus(valid) {
  const dots = document.querySelectorAll('.api-status');
  dots.forEach(d => {
    d.classList.toggle('ok', valid);
    d.classList.toggle('err', !valid && storageGetGroqKey().length > 0);
  });
}

// ─── SETUP SCREEN ───
async function handleSetupSubmit() {
  const input = document.getElementById('setup-key-input');
  const btn = document.getElementById('setup-test-btn');
  const key = input.value.trim();

  if (!key) { showToast('Inserisci la API key', 'warn'); return; }

  btn.innerHTML = `<div class="loading-spinner"><div class="spinner"></div><span>Test in corso...</span></div>`;
  btn.disabled = true;

  const valid = await testGroqKey(key);
  btn.innerHTML = 'Testa Connessione';
  btn.disabled = false;

  if (valid) {
    storageSetGroqKey(key);
    updateApiStatus(true);
    document.getElementById('view-setup').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    initRouter();
    showToast('API Key valida! Benvenuto in Evolve PM 🎉', 'success');
  } else {
    showToast('API Key non valida. Ricontrolla.', 'error');
  }
}

// ─── SETTINGS ───
async function testCurrentKey() {
  const key = storageGetGroqKey();
  const btn = document.getElementById('settings-test-btn');
  if (!key) { showToast('Nessuna key salvata', 'warn'); return; }
  btn.disabled = true;
  btn.textContent = 'Testing...';
  const valid = await testGroqKey(key);
  btn.disabled = false;
  btn.textContent = 'Testa';
  updateApiStatus(valid);
  showToast(valid ? 'API Key funzionante ✓' : 'API Key non valida', valid ? 'success' : 'error');
}

function saveNewKey() {
  const input = document.getElementById('settings-key-input');
  const key = input.value.trim();
  if (!key) { showToast('Inserisci la nuova key', 'warn'); return; }
  storageSetGroqKey(key);
  showToast('API Key salvata', 'success');
}

function toggleKeyVisibility() {
  const input = document.getElementById('settings-key-input');
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
}

function renderSettings() {
  const key = storageGetGroqKey();
  const container = document.getElementById('view-settings');
  if (!container) return;
  container.innerHTML = `
    <h1>Impostazioni</h1>
    <p>Gestisci la tua API key Groq e le preferenze dell'app.</p>

    <div class="settings-section">
      <h3>API Key Groq</h3>
      <div class="form-group">
        <label class="form-label">Key attuale</label>
        <div style="display:flex;gap:8px;">
          <input class="form-input mono" id="settings-key-input" type="password" value="${escHtml(key)}" placeholder="gsk_...">
          <button class="btn btn-secondary btn-sm" onclick="toggleKeyVisibility()">Mostra</button>
        </div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-primary btn-sm" onclick="saveNewKey()">Salva</button>
        <button class="btn btn-secondary btn-sm" id="settings-test-btn" onclick="testCurrentKey()">Testa</button>
      </div>
      <div style="margin-top:12px;font-size:12px;color:var(--text3);">
        Ottieni una key su <a href="https://console.groq.com/keys" target="_blank" style="color:var(--accent);">console.groq.com/keys</a>
      </div>
    </div>

    <div class="settings-section">
      <h3>Backup Completo</h3>
      <p style="font-size:13px;color:var(--text3);margin-bottom:16px;">Esporta tutti i progetti in un unico file JSON.</p>
      <button class="btn btn-secondary" onclick="exportAllProjects()">
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 1v8M3 6l4 4 4-4M1 10v2a1 1 0 001 1h10a1 1 0 001-1v-2"/></svg>
        Esporta tutti i progetti
      </button>
    </div>

    <div class="settings-section">
      <h3>Importa Backup</h3>
      <p style="font-size:13px;color:var(--text3);margin-bottom:16px;">Importa un file di backup precedentemente esportato.</p>
      <label class="btn btn-secondary" style="cursor:pointer;">
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 9V1M3 5l4-4 4 4M1 10v2a1 1 0 001 1h10a1 1 0 001-1v-2"/></svg>
        Importa backup JSON
        <input type="file" accept=".json" style="display:none" onchange="handleGlobalImport(event)">
      </label>
    </div>
  `;
}

async function handleGlobalImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const data = await readImportFile(file);
    if (data.type === 'full' && data.projects) {
      const existing = getAllProjects();
      const merged = [...existing];
      data.projects.forEach(p => {
        if (!merged.find(e => e.id === p.id)) merged.push(p);
        else Object.assign(merged.find(e => e.id === p.id), p);
      });
      saveAllProjects(merged);
      showToast(`${data.projects.length} progetti importati`, 'success');
    } else {
      showToast('Formato backup non riconosciuto. Usa l\'import dal progetto.', 'warn');
    }
  } catch (err) {
    showToast('Errore: ' + err.message, 'error');
  }
  event.target.value = '';
}

// ─── EXPORT/IMPORT PROJECT ───
function openExportModal(projectId) {
  document.getElementById('modal-export').classList.add('open');
  document.getElementById('modal-export').dataset.projectId = projectId;
  document.querySelectorAll('#modal-export input[type="checkbox"]').forEach(c => {
    c.checked = false;
  });
}

function closeExportModal() {
  document.getElementById('modal-export').classList.remove('open');
}

function confirmExport() {
  const modal = document.getElementById('modal-export');
  const projectId = modal.dataset.projectId;
  const allChecked = document.getElementById('export-all').checked;
  let sections = [];

  if (allChecked) {
    sections = ['brief', 'checklist', 'access', 'assets', 'revisions'];
  } else {
    document.querySelectorAll('#modal-export input[type="checkbox"]:not(#export-all):checked').forEach(c => {
      sections.push(c.value);
    });
  }

  if (!sections.length) { showToast('Seleziona almeno una sezione', 'warn'); return; }
  exportSelective(projectId, sections);
  closeExportModal();
  showToast('Export completato!', 'success');
}

function openImportModal(projectId) {
  document.getElementById('modal-import').classList.add('open');
  document.getElementById('modal-import').dataset.projectId = projectId;
  document.getElementById('import-preview').innerHTML = '';
  window._importData = null;
}

function closeImportModal() {
  document.getElementById('modal-import').classList.remove('open');
  window._importData = null;
}

async function handleImportFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const data = await readImportFile(file);
    window._importData = data;
    renderImportPreview(data);
  } catch (err) {
    showToast('Errore: ' + err.message, 'error');
  }
  event.target.value = '';
}

function renderImportPreview(data) {
  const preview = document.getElementById('import-preview');
  if (!data.sections) { preview.innerHTML = '<p style="color:var(--warn);font-size:13px;">Formato non valido</p>'; return; }

  let html = `<div style="margin-bottom:12px;"><span style="font-size:13px;color:var(--text2);">Progetto: <strong>${escHtml(data.projectName)}</strong></span></div>`;
  html += `<div style="font-size:12px;color:var(--text3);margin-bottom:8px;">Scegli le sezioni da importare:</div>`;

  const sectionNames = { brief: 'Brief', checklist: 'Checklist', access: 'Accessi', assets: 'Assets & Link', revisions: 'Revisioni' };
  Object.keys(data.sections).forEach(key => {
    const sec = data.sections[key];
    const date = sec.updatedAt ? new Date(sec.updatedAt).toLocaleString('it-IT') : 'N/A';
    html += `
      <label class="checkbox-wrap" style="margin-bottom:8px;">
        <input type="checkbox" class="import-section-check" value="${key}" checked>
        <div class="checkbox-custom"></div>
        <div class="checkbox-label">${sectionNames[key] || key} <span style="color:var(--text3);font-size:11px;">(${date})</span></div>
      </label>`;
  });

  preview.innerHTML = html;
}

function confirmImport() {
  const modal = document.getElementById('modal-import');
  const projectId = modal.dataset.projectId;
  if (!window._importData) { showToast('Carica prima un file', 'warn'); return; }
  const sections = [];
  document.querySelectorAll('.import-section-check:checked').forEach(c => sections.push(c.value));
  if (!sections.length) { showToast('Seleziona almeno una sezione', 'warn'); return; }
  importSelective(projectId, window._importData, sections);
  closeImportModal();
  const project = getProject(projectId);
  renderTabContent(project, currentTab);
  showToast('Import completato!', 'success');
}

// ─── NEW PROJECT ───
async function confirmNewProject() {
  const nameInput = document.getElementById('new-project-name');
  const clientInput = document.getElementById('new-project-client');
  const name = nameInput.value.trim();
  const client = clientInput.value.trim();

  if (!name) { showToast('Inserisci il nome del progetto', 'warn'); nameInput.focus(); return; }

  const project = createProject({ name, client });
  closeNewProjectModal();
  showToast('Progetto creato!', 'success');

  if (window._newBriefFile) {
    navigateToProject(project.id, 'brief');
    setTimeout(async () => {
      const fakeEvent = { target: { files: [window._newBriefFile], value: '' } };
      await handleBriefUpload(fakeEvent, project.id);
      window._newBriefFile = null;
    }, 300);
  } else {
    navigateToProject(project.id, 'brief');
  }
}

// ─── KEYBOARD SHORTCUTS ───
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  }
});

// ─── INIT ───
document.addEventListener('DOMContentLoaded', () => {
  const key = storageGetGroqKey();

  if (!key) {
    document.getElementById('view-setup').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
  } else {
    document.getElementById('view-setup').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    updateApiStatus(true);
    initRouter();
  }

  // New project brief file
  const briefFileInput = document.getElementById('new-brief-file-input');
  if (briefFileInput) {
    briefFileInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (file) {
        window._newBriefFile = file;
        const label = document.getElementById('new-brief-file-name');
        if (label) label.textContent = file.name;
      }
    });
  }

  // Settings link
  const settingsLinks = document.querySelectorAll('[href="#settings"]');
  settingsLinks.forEach(link => {
    link.addEventListener('click', () => renderSettings());
  });
});
