const STATUS_LABELS = { attivo: 'Attivo', pausa: 'In Pausa', consegnato: 'Consegnato', archiviato: 'Archiviato' };
let panoramicaDebounce = null;

function renderPanoramica(project) {
  const container = document.getElementById('tab-panoramica');
  if (!container) return;

  const s = project.brief?.scheda || {};
  const b = project.brief?.brand || {};
  const progress = getChecklistProgress(project);

  // Deadline calc
  let deadlineBadge = '';
  if (project.deadline) {
    const days = Math.round((new Date(project.deadline) - new Date()) / 86400000);
    if (days < 0) deadlineBadge = `<span class="deadline-badge over">Scaduta ${Math.abs(days)}gg fa</span>`;
    else if (days <= 7) deadlineBadge = `<span class="deadline-badge warn">${days}gg rimasti</span>`;
    else deadlineBadge = `<span class="deadline-badge ok">${days}gg rimasti</span>`;
  }

  // Dati cliente rows
  const datiRows = [
    { icon: iconClient(), label: 'Cliente', val: s.cliente || project.client || '', color: '#a78bfa' },
    { icon: iconSector(), label: 'Settore', val: s.settore || '', color: '#fb923c' },
    { icon: iconPIva(), label: 'P.IVA', val: s.partitaIva || '', color: '#60a5fa', mono: true },
    { icon: iconAddress(), label: 'Indirizzo', val: s.indirizzo || '', color: '#f472b6' },
    { icon: iconPhone(), label: 'Telefono', val: s.telefono || '', color: '#4ade80', link: s.telefono ? 'tel:'+s.telefono : null },
    { icon: iconEmail(), label: 'Email', val: s.email || '', color: '#38bdf8', link: s.email ? 'mailto:'+s.email : null },
    { icon: iconWeb(), label: 'Dominio', val: s.dominio || '', color: '#c8f135', link: s.dominio ? (s.dominio.startsWith('http') ? s.dominio : 'https://'+s.dominio) : null },
    { icon: iconFb(), label: 'Facebook', val: s.facebook ? 'Pagina Facebook' : '', color: '#60a5fa', link: s.facebook || null },
    { icon: iconIg(), label: 'Instagram', val: s.instagram ? s.instagram.replace('https://www.instagram.com/','@').replace(/\/$/,'') : '', color: '#f472b6', link: s.instagram || null },
    { icon: iconCompetitor(), label: 'Competitor', val: s.competitor || '', color: '#fbbf24' },
    { icon: iconPrivacy(), label: 'Titolare Privacy', val: s.titolarePrivacy || '', color: '#a78bfa' },
  ].filter(r => r.val);

  const datiHtml = datiRows.map(r => `
    <div class="dati-row">
      <div class="dati-icon" style="background:${r.color}18;">${r.icon.replace('currentColor', r.color)}</div>
      <div class="dati-label">${r.label}</div>
      <div class="dati-value ${r.link ? '' : ''}">
        ${r.link
          ? `<a href="${escHtml(r.link)}" target="_blank">${escHtml(r.val)}</a>`
          : `<span ${r.mono ? 'style="font-family:\'JetBrains Mono\',monospace;font-size:12px;"' : ''}>${escHtml(r.val)}</span>`
        }
      </div>
    </div>`).join('');

  // Fasi
  const fasiHtml = PHASES.map(phase => {
    const pp = getPhaseProgress(project, phase.id);
    const complete = pp.pct === 100;
    return `
      <div class="fase-row ${complete ? 'fase-complete' : ''}" onclick="switchTab('checklist')" title="Vai alla checklist">
        <div class="fase-num">${String(phase.id).padStart(2,'0')}</div>
        <div class="fase-name">${escHtml(phase.title)}</div>
        <div class="fase-bar-wrap">
          <div class="fase-bar"><div class="fase-bar-fill" style="width:${pp.pct}%"></div></div>
          <div class="fase-pct">${pp.pct}%</div>
        </div>
        <div class="fase-arrow"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 2l4 4-4 4"/></svg></div>
      </div>`;
  }).join('');

  container.innerHTML = `
    <div class="panoramica-grid">

      <!-- DATI CLIENTE -->
      <div class="pano-card">
        <div class="pano-card-header">
          <div class="pano-card-icon" style="background:rgba(167,139,250,0.12);">
            <svg viewBox="0 0 14 14" fill="none" stroke="#a78bfa" stroke-width="1.5"><circle cx="7" cy="5" r="2.5"/><path d="M2 12c0-2.8 2.2-5 5-5s5 2.2 5 5"/></svg>
          </div>
          <span class="pano-card-title">Dati Cliente</span>
          ${project.brief ? `<span class="pano-card-action" onclick="switchTab('brief')">Vedi brief →</span>` : `<span class="pano-card-action" style="color:var(--warn);">Brief mancante</span>`}
        </div>
        ${datiRows.length ? `<div class="dati-table">${datiHtml}</div>` : `
          <div style="padding:24px;text-align:center;color:var(--text3);font-size:13px;">
            Carica il brief per vedere i dati cliente
          </div>`}
      </div>

      <!-- AVANZAMENTO + PROSSIMO STEP -->
      <div style="display:flex;flex-direction:column;gap:20px;">

        <!-- DEADLINE + STEP -->
        <div class="pano-card">
          <div class="pano-card-header">
            <div class="pano-card-icon" style="background:rgba(251,146,60,0.12);">
              <svg viewBox="0 0 14 14" fill="none" stroke="#fb923c" stroke-width="1.5"><rect x="1" y="2" width="12" height="11" rx="1.5"/><path d="M1 6h12M5 1v2M9 1v2"/></svg>
            </div>
            <span class="pano-card-title">Deadline</span>
            ${deadlineBadge}
          </div>
          <div class="deadline-section">
            <input type="date" id="pano-deadline" value="${escHtml(project.deadline || '')}"
              onchange="savePanoramica('${escHtml(project.id)}')">
          </div>
          <div style="border-top:1px solid var(--border);">
            <div class="pano-card-header" style="border-bottom:none;padding-bottom:0;">
              <div class="pano-card-icon" style="background:rgba(196,241,53,0.10);">
                <svg viewBox="0 0 14 14" fill="none" stroke="var(--accent)" stroke-width="1.5"><path d="M2 12V4l5-3 5 3v8"/><path d="M5 12V8h4v4"/></svg>
              </div>
              <span class="pano-card-title">Prossimo Step</span>
            </div>
            <div class="prossimo-step">
              <textarea id="pano-nextstep" placeholder="Scrivi cosa devi fare adesso..."
                oninput="savePanoramica('${escHtml(project.id)}')">${escHtml(project.nextStep || '')}</textarea>
            </div>
          </div>
        </div>

        <!-- FASI AVANZAMENTO -->
        <div class="pano-card">
          <div class="pano-card-header">
            <div class="pano-card-icon" style="background:rgba(200,241,53,0.10);">
              <svg viewBox="0 0 14 14" fill="none" stroke="var(--accent)" stroke-width="1.5"><path d="M3 7l2 2 4-4"/><rect x="1" y="1" width="12" height="12" rx="2"/></svg>
            </div>
            <span class="pano-card-title">Avanzamento Fasi</span>
            <span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--accent);">${progress.done}/${progress.total}</span>
          </div>
          <div class="fasi-list">${fasiHtml}</div>
        </div>

      </div>

      <!-- NOTE RAPIDE + BRAND PREVIEW (full width) -->
      <div class="pano-card pano-full">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0;">
          <div style="border-right:1px solid var(--border);">
            <div class="pano-card-header">
              <div class="pano-card-icon" style="background:rgba(56,189,248,0.10);">
                <svg viewBox="0 0 14 14" fill="none" stroke="var(--info)" stroke-width="1.5"><path d="M2 2h10v10H2z"/><path d="M5 5h4M5 8h4"/></svg>
              </div>
              <span class="pano-card-title">Note Rapide</span>
            </div>
            <div class="note-rapide">
              <textarea id="pano-note" placeholder="Appunti, reminder, note veloci..."
                oninput="savePanoramica('${escHtml(project.id)}')">${escHtml(project.quickNote || '')}</textarea>
            </div>
          </div>
          <div>
            <div class="pano-card-header">
              <div class="pano-card-icon" style="background:rgba(251,191,36,0.10);">
                <svg viewBox="0 0 14 14" fill="none" stroke="#fbbf24" stroke-width="1.5"><path d="M7 1l1.5 4H13L9.5 7.5 11 12 7 9.5 3 12l1.5-4.5L1 5h4.5L7 1z"/></svg>
              </div>
              <span class="pano-card-title">Brand</span>
              ${project.brief ? `<span class="pano-card-action" onclick="switchTab('brief')">Vedi brand →</span>` : ''}
            </div>
            <div class="brand-preview">
              ${b.tonoRegistro ? `<div class="brand-tono">${escHtml(b.tonoRegistro)}</div>` : ''}
              ${b.aggettivi && b.aggettivi.length ? `<div class="brand-aggettivi">${b.aggettivi.map(a=>`<span class="brand-adj">${escHtml(a)}</span>`).join('')}</div>` : ''}
              ${!b.tonoRegistro && !(b.aggettivi && b.aggettivi.length) ? `<div style="font-size:13px;color:var(--muted);">Carica il brief per vedere il profilo brand</div>` : ''}
            </div>
          </div>
        </div>
      </div>

    </div>
  `;
}

function savePanoramica(projectId) {
  clearTimeout(panoramicaDebounce);
  panoramicaDebounce = setTimeout(() => {
    const deadline = document.getElementById('pano-deadline')?.value || '';
    const nextStep = document.getElementById('pano-nextstep')?.value || '';
    const quickNote = document.getElementById('pano-note')?.value || '';
    updateProject(projectId, { deadline, nextStep, quickNote });
  }, 500);
}

// ── SVG ICONS ──
function iconClient() { return `<svg viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6.5" cy="4.5" r="2"/><path d="M1.5 11c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5"/></svg>`; }
function iconSector() { return `<svg viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="4" width="11" height="8" rx="1"/><path d="M4 4V3a2.5 2.5 0 015 0v1"/></svg>`; }
function iconPIva() { return `<svg viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="2" width="11" height="9" rx="1.5"/><path d="M4 6h5M4 8.5h3"/></svg>`; }
function iconAddress() { return `<svg viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6.5 1C4.5 1 2.5 2.7 2.5 5c0 3 4 7 4 7s4-4 4-7c0-2.3-2-4-4-4z"/><circle cx="6.5" cy="5" r="1.2"/></svg>`; }
function iconPhone() { return `<svg viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 2l2 1 .8 2L3.5 6.3c.7 1.4 1.8 2.5 3.2 3.2L8 8.2l2 .8 1 2c-5 1.5-10.5-4-9-9z"/></svg>`; }
function iconEmail() { return `<svg viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="2.5" width="11" height="8" rx="1"/><path d="M1 4l5.5 3.5L12 4"/></svg>`; }
function iconWeb() { return `<svg viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6.5" cy="6.5" r="5"/><path d="M1.5 6.5h10M6.5 1.5c-2 2-2 6 0 10M6.5 1.5c2 2 2 6 0 10"/></svg>`; }
function iconFb() { return `<svg viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="1" width="11" height="11" rx="2"/><path d="M8 1v3H6.5a1 1 0 00-1 1v1.5H8L7.5 9H5.5v4"/></svg>`; }
function iconIg() { return `<svg viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="1" width="11" height="11" rx="3"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="9.5" cy="3.5" r=".5" fill="currentColor" stroke="none"/></svg>`; }
function iconCompetitor() { return `<svg viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6.5 1l1.5 4H12l-3.5 2.5L10 12 6.5 9.5 3 12l1.5-4.5L1 5h4L6.5 1z"/></svg>`; }
function iconPrivacy() { return `<svg viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6.5 1L2 3v4c0 2.8 2 5 4.5 6C9 11 11 8.8 11 6V3L6.5 1z"/></svg>`; }
