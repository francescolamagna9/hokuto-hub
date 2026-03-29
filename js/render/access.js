let accessDebounce = null;

function renderAccess(project) {
  const container = document.getElementById('tab-access');
  if (!container) return;

  const acc = project.access || {};

  container.innerHTML = `
    <div style="max-width:560px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
        <h3 style="font-family:'Syne',sans-serif;font-weight:800;font-size:16px;">Accessi WordPress</h3>
        <span style="font-size:11px;color:var(--text3);" id="access-autosave-label">Auto-save attivo</span>
      </div>

      <div class="form-group">
        <label class="form-label">URL WP-Admin</label>
        <div style="display:flex;gap:8px;">
          <input class="form-input" id="acc-url" type="url" placeholder="https://example.com/wp-admin"
            value="${escHtml(acc.url || '')}" oninput="accessAutoSave('${escHtml(project.id)}')">
          <button class="btn btn-secondary btn-sm" id="acc-open-btn"
            onclick="openWpAdmin()" ${!acc.url ? 'disabled' : ''} title="Apri WP Admin">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 7h10M8 3l4 4-4 4"/></svg>
          </button>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Username</label>
        <div style="display:flex;gap:8px;">
          <input class="form-input" id="acc-user" type="text" placeholder="admin"
            value="${escHtml(acc.username || '')}" oninput="accessAutoSave('${escHtml(project.id)}')">
          <button class="btn btn-secondary btn-sm" onclick="copyField('acc-user','Username copiato')">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="5" width="7" height="7" rx="1"/><path d="M2 9V3a1 1 0 011-1h6"/></svg>
          </button>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Password</label>
        <div style="display:flex;gap:8px;">
          <div style="position:relative;flex:1;">
            <input class="form-input mono" id="acc-pass" type="password" placeholder="••••••••••"
              value="${escHtml(acc.password || '')}" oninput="accessAutoSave('${escHtml(project.id)}')">
            <button onclick="togglePassVisibility()" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--text3);cursor:pointer;padding:4px;" id="pass-toggle-btn">
              <svg id="pass-eye" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M1 7s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z"/><circle cx="7" cy="7" r="1.5"/></svg>
            </button>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="copyField('acc-pass','Password copiata')">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="5" width="7" height="7" rx="1"/><path d="M2 9V3a1 1 0 011-1h6"/></svg>
          </button>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Note Accessi</label>
        <textarea class="form-textarea" id="acc-notes" rows="5"
          placeholder="Hosting, FTP, SSH, note generali..."
          oninput="accessAutoSave('${escHtml(project.id)}')">${escHtml(acc.notes || '')}</textarea>
      </div>
    </div>
  `;

  // Update project header if URL is set
  updateProjectHeaderWp(acc.url);
}

function accessAutoSave(projectId) {
  clearTimeout(accessDebounce);
  const label = document.getElementById('access-autosave-label');
  if (label) label.textContent = 'Salvataggio...';

  accessDebounce = setTimeout(() => {
    const url = document.getElementById('acc-url').value;
    const username = document.getElementById('acc-user').value;
    const password = document.getElementById('acc-pass').value;
    const notes = document.getElementById('acc-notes').value;

    updateProject(projectId, {
      access: { url, username, password, notes },
      accessUpdatedAt: new Date().toISOString()
    });

    const openBtn = document.getElementById('acc-open-btn');
    if (openBtn) openBtn.disabled = !url;

    updateProjectHeaderWp(url);
    if (label) label.textContent = 'Salvato ✓';
    setTimeout(() => { if (label) label.textContent = 'Auto-save attivo'; }, 1500);
  }, 600);
}

function openWpAdmin() {
  const url = document.getElementById('acc-url').value;
  if (url) window.open(url, '_blank');
}

function togglePassVisibility() {
  const input = document.getElementById('acc-pass');
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
}

function copyField(inputId, successMsg) {
  const input = document.getElementById(inputId);
  if (!input) return;
  navigator.clipboard.writeText(input.value).then(() => {
    showToast(successMsg, 'success');
  }).catch(() => {
    // Fallback
    input.select();
    document.execCommand('copy');
    showToast(successMsg, 'success');
  });
}

function updateProjectHeaderWp(url) {
  const wpLink = document.getElementById('header-wp-link');
  if (!wpLink) return;
  if (url) {
    wpLink.href = url;
    wpLink.style.display = 'inline-flex';
  } else {
    wpLink.style.display = 'none';
  }
}
