const GROQ_SYSTEM = `Sei un assistente specializzato nell'estrazione strutturata di dati da Project Bible per agenzie web italiane. Rispondi SEMPRE e SOLO con JSON valido, senza markdown, senza backtick, senza testo aggiuntivo prima o dopo il JSON. Se un campo non è presente nel testo, usa stringa vuota '' o array vuoto [].`;

const GROQ_USER_TEMPLATE = `Analizza questo Project Bible e restituisci SOLO il seguente JSON:
{
  "scheda": {
    "cliente": "", "nomeCommerciale": "", "settore": "",
    "tipoSito": "", "obiettivo": "", "dominio": "",
    "partitaIva": "", "indirizzo": "", "telefono": "",
    "email": "", "facebook": "", "instagram": "",
    "competitor": "", "titolarePrivacy": "",
    "noteOperative": []
  },
  "brand": {
    "chiEIlCliente": "", "propostaValore": "",
    "tonoRegistro": "", "aggettivi": [],
    "comeNonSuonare": [], "frasiGiuste": [], "frasiEvitare": []
  },
  "target": {
    "personas": [
      { "nome": "", "eta": "", "professione": "", "obiettivo": "", "painPoint": "", "comeParla": "" }
    ]
  },
  "struttura": {
    "pagine": [
      { "nome": "", "keyword": "", "sezioni": [] }
    ]
  },
  "keywords": {
    "rows": [
      { "pagina": "", "keywordPrincipale": "", "keywordSecondarie": "" }
    ]
  },
  "stile": {
    "moodVisivo": "",
    "palette": [
      { "ruolo": "", "nome": "", "hex": "", "uso": "" }
    ],
    "tipografia": [
      { "ruolo": "", "font": "", "motivazione": "" }
    ],
    "templateQuery": []
  }
}

PROJECT BIBLE DA ANALIZZARE:
{TESTO_BRIEF}`;

async function parseBriefWithGroq(briefText) {
  const key = storageGetGroqKey();
  if (!key) throw new Error('API Key Groq non configurata');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + key
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 4000,
      temperature: 0.1,
      messages: [
        { role: 'system', content: GROQ_SYSTEM },
        { role: 'user', content: GROQ_USER_TEMPLATE.replace('{TESTO_BRIEF}', briefText) }
      ]
    })
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  const raw = data.choices[0].message.content.trim();
  const clean = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

function renderBrief(project) {
  const container = document.getElementById('tab-brief');
  if (!container) return;

  const brief = project.brief;

  if (!brief) {
    container.innerHTML = `<div class="empty-state" style="padding-top:80px;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M9 12h6M9 16h6M7 8h10M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z"/></svg>
      <h3>Nessun brief caricato</h3>
      <p>Usa il pulsante "Carica brief" nella barra in alto per caricare il file .docx del Project Bible.</p>
    </div>`;
    return;
  }

  const s = brief.scheda || {};
  const b = brief.brand || {};
  const t = brief.target || {};
  const str = brief.struttura || {};
  const kw = brief.keywords || {};
  const st = brief.stile || {};

  container.innerHTML = `
    <div class="brief-inner-tabs">
      <button class="brief-inner-tab active" onclick="switchBriefTab(this,'bs-scheda')">Scheda Cliente</button>
      <button class="brief-inner-tab" onclick="switchBriefTab(this,'bs-brand')">Brand</button>
      <button class="brief-inner-tab" onclick="switchBriefTab(this,'bs-target')">Target</button>
      <button class="brief-inner-tab" onclick="switchBriefTab(this,'bs-struttura')">Struttura</button>
      <button class="brief-inner-tab" onclick="switchBriefTab(this,'bs-keywords')">Keywords</button>
      <button class="brief-inner-tab" onclick="switchBriefTab(this,'bs-stile')">Stile</button>
    </div>

    <div id="bs-scheda" class="brief-section active">
      <div class="brief-section-title">Scheda Cliente</div>
      <div class="field-grid">
        ${bField('Cliente', s.cliente)} ${bField('Nome Commerciale', s.nomeCommerciale)}
        ${bField('Settore', s.settore)} ${bField('Tipo Sito', s.tipoSito)}
        ${bField('Dominio', s.dominio, true)} ${bField('P.IVA', s.partitaIva)}
        ${bField('Telefono', s.telefono)} ${bField('Email', s.email)}
        ${bField('Facebook', s.facebook, true)} ${bField('Instagram', s.instagram, true)}
        ${bField('Competitor', s.competitor)} ${bField('Titolare Privacy', s.titolarePrivacy)}
        <div class="brief-field field-full">
          <div class="brief-field-label">Obiettivo</div>
          <div class="brief-field-value ${s.obiettivo ? '' : 'empty'}">${escHtml(s.obiettivo) || 'Non specificato'}</div>
        </div>
        <div class="brief-field field-full">
          <div class="brief-field-label">Indirizzo</div>
          <div class="brief-field-value ${s.indirizzo ? '' : 'empty'}">${escHtml(s.indirizzo) || 'Non specificato'}</div>
        </div>
      </div>
      ${s.noteOperative && s.noteOperative.length ? `
        <div class="brief-subsection-title">Note Operative</div>
        <div class="note-operative-list">
          ${s.noteOperative.map(n => `
            <div class="note-operativa-item">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 1l1.5 4.5H14l-3.5 2.5 1.5 4.5L8 10l-4 2.5 1.5-4.5L2 5.5h4.5L8 1z"/></svg>
              <span>${escHtml(n)}</span>
            </div>`).join('')}
        </div>` : ''}
    </div>

    <div id="bs-brand" class="brief-section">
      <div class="brief-section-title">Brand Identity</div>
      <div class="field-grid">
        <div class="brief-field field-full">
          <div class="brief-field-label">Chi è il Cliente</div>
          <div class="brief-field-value ${b.chiEIlCliente ? '' : 'empty'}">${escHtml(b.chiEIlCliente) || 'Non specificato'}</div>
        </div>
        <div class="brief-field field-full">
          <div class="brief-field-label">Proposta di Valore</div>
          <div class="brief-field-value ${b.propostaValore ? '' : 'empty'}">${escHtml(b.propostaValore) || 'Non specificato'}</div>
        </div>
        <div class="brief-field field-full">
          <div class="brief-field-label">Tono & Registro</div>
          <div class="brief-field-value ${b.tonoRegistro ? '' : 'empty'}">${escHtml(b.tonoRegistro) || 'Non specificato'}</div>
        </div>
      </div>
      ${b.aggettivi && b.aggettivi.length ? `
        <div class="brief-subsection-title">Aggettivi Brand</div>
        <div class="aggettivi-list">${b.aggettivi.map(a => `<span class="aggettivo-tag">${escHtml(a)}</span>`).join('')}</div>` : ''}
      ${b.comeNonSuonare && b.comeNonSuonare.length ? `
        <div class="brief-subsection-title">Come NON suonare</div>
        <div class="aggettivi-list">${b.comeNonSuonare.map(a => `<span class="aggettivo-tag avoid">${escHtml(a)}</span>`).join('')}</div>` : ''}
      ${b.frasiGiuste && b.frasiGiuste.length ? `
        <div class="brief-subsection-title">Frasi nel tono giusto</div>
        ${b.frasiGiuste.map(f => `<div class="struttura-sezione-item" style="border-color:var(--success);">${escHtml(f)}</div>`).join('')}` : ''}
      ${b.frasiEvitare && b.frasiEvitare.length ? `
        <div class="brief-subsection-title">Frasi da evitare</div>
        ${b.frasiEvitare.map(f => `<div class="struttura-sezione-item" style="border-color:var(--danger);">${escHtml(f)}</div>`).join('')}` : ''}
    </div>

    <div id="bs-target" class="brief-section">
      <div class="brief-section-title">Target & Personas</div>
      <div class="personas-grid">
        ${(t.personas || []).map((p, i) => `
          <div class="persona-card">
            <div class="persona-card-header">
              <div class="persona-avatar">${escHtml(p.nome ? p.nome[0] : String(i+1))}</div>
              <div>
                <div class="persona-card-name">${escHtml(p.nome) || 'Persona ' + (i+1)}</div>
                <div class="persona-card-role">${escHtml(p.eta)} ${p.eta && p.professione ? '·' : ''} ${escHtml(p.professione)}</div>
              </div>
            </div>
            ${p.obiettivo ? `<div class="persona-field"><div class="persona-field-label">Obiettivo</div><div class="persona-field-value">${escHtml(p.obiettivo)}</div></div>` : ''}
            ${p.painPoint ? `<div class="persona-field"><div class="persona-field-label">Pain Point</div><div class="persona-field-value">${escHtml(p.painPoint)}</div></div>` : ''}
            ${p.comeParla ? `<div class="persona-field"><div class="persona-field-label">Come parla</div><div class="persona-field-value">${escHtml(p.comeParla)}</div></div>` : ''}
          </div>`).join('')}
      </div>
    </div>

    <div id="bs-struttura" class="brief-section">
      <div class="brief-section-title">Struttura Sito</div>
      ${(str.pagine || []).map(p => `
        <div class="struttura-page">
          <div class="struttura-page-header" onclick="this.nextElementSibling.classList.toggle('open')">
            <div>
              <div class="struttura-page-name">${escHtml(p.nome)}</div>
              ${p.keyword ? `<div class="struttura-page-keyword">${escHtml(p.keyword)}</div>` : ''}
            </div>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 5l4 4 4-4"/></svg>
          </div>
          <div class="struttura-page-sections">
            ${(p.sezioni || []).map(s => `<div class="struttura-sezione-item">${escHtml(s)}</div>`).join('')}
            ${!(p.sezioni || []).length ? '<div style="font-size:12px;color:var(--muted);padding:4px 0;">Nessuna sezione specificata</div>' : ''}
          </div>
        </div>`).join('')}
    </div>

    <div id="bs-keywords" class="brief-section">
      <div class="brief-section-title">Keyword Map</div>
      <table class="keywords-table">
        <thead>
          <tr><th>Pagina</th><th>Keyword Principale</th><th>Keyword Secondarie</th></tr>
        </thead>
        <tbody>
          ${(kw.rows || []).map(r => `
            <tr>
              <td>${escHtml(r.pagina)}</td>
              <td>${escHtml(r.keywordPrincipale)}</td>
              <td>${escHtml(r.keywordSecondarie)}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <div id="bs-stile" class="brief-section">
      <div class="brief-section-title">Stile Visivo</div>
      ${st.moodVisivo ? `
        <div class="brief-field" style="margin-bottom:20px;">
          <div class="brief-field-label">Mood Visivo</div>
          <div class="brief-field-value">${escHtml(st.moodVisivo)}</div>
        </div>` : ''}
      ${st.palette && st.palette.length ? `
        <div class="brief-subsection-title">Palette Colori</div>
        <div class="palette-grid">
          ${st.palette.map(c => `
            <div class="palette-swatch" title="${escHtml(c.uso)}">
              <div class="palette-color" style="background:${escHtml(c.hex) || '#333'}" onclick="copyToClipboard('${escHtml(c.hex)}', 'Colore copiato')"></div>
              <div class="palette-name">${escHtml(c.nome)}</div>
              <div class="palette-hex">${escHtml(c.hex)}</div>
            </div>`).join('')}
        </div>` : ''}
      ${st.tipografia && st.tipografia.length ? `
        <div class="brief-subsection-title">Tipografia</div>
        <div class="tipografia-list">
          ${st.tipografia.map(f => `
            <div class="tipografia-item">
              <div class="tipografia-ruolo">${escHtml(f.ruolo)}</div>
              <div>
                <div class="tipografia-font">${escHtml(f.font)}</div>
                <div class="tipografia-motivazione">${escHtml(f.motivazione)}</div>
              </div>
            </div>`).join('')}
        </div>` : ''}
      ${st.templateQuery && st.templateQuery.length ? `
        <div class="brief-subsection-title">Query Envato</div>
        <div style="display:flex;flex-direction:column;gap:6px;">
          ${st.templateQuery.map(q => `
            <div style="display:flex;align-items:center;gap:10px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);padding:8px 12px;">
              <span style="font-size:13px;flex:1;">${escHtml(q)}</span>
              <button class="copy-btn" onclick="copyToClipboard('${escHtml(q)}', 'Query copiata')">Copia</button>
            </div>`).join('')}
        </div>` : ''}
    </div>
  `;
}

function bField(label, value, isLink = false) {
  const hasValue = value && value.trim();
  let display = hasValue ? escHtml(value) : 'Non specificato';
  if (isLink && hasValue) {
    const href = value.startsWith('http') ? value : 'https://' + value;
    display = `<a href="${escHtml(href)}" target="_blank">${escHtml(value)}</a>`;
  }
  return `
    <div class="brief-field">
      <div class="brief-field-label">${label}</div>
      <div class="brief-field-value ${hasValue ? '' : 'empty'}">${display}</div>
    </div>`;
}

function switchBriefTab(btn, sectionId) {
  document.querySelectorAll('.brief-inner-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.brief-section').forEach(s => s.classList.remove('active'));
  btn.classList.add('active');
  const el = document.getElementById(sectionId);
  if (el) el.classList.add('active');
}

async function handleBriefUpload(event, projectId) {
  const file = event.target.files[0];
  if (!file) return;

  // Show loading state on the strip chip
  const strip = document.getElementById('project-info-strip');
  const loadingHtml = strip ? strip.innerHTML : '';

  showToast('Estrazione testo in corso...', 'info');

  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value;

    if (!text || text.trim().length < 50) {
      throw new Error('Il file .docx sembra vuoto o non contiene testo sufficiente');
    }

    showToast('Analisi con Groq AI...', 'info');
    const briefData = await parseBriefWithGroq(text);

    updateProject(projectId, { brief: briefData, briefUpdatedAt: new Date().toISOString() });
    const project = getProject(projectId);

    // Refresh header strip e brief tab
    updateClientHeader(project);
    if (currentTab === 'brief') renderBrief(project);

    showToast('Brief estratto e salvato con successo!', 'success');
  } catch (err) {
    showToast('Errore: ' + err.message, 'error');
  }

  if (event.target) event.target.value = '';
}
