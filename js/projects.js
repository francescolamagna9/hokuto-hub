function getAllProjects() {
  return storageGet('projects') || [];
}
function saveAllProjects(projects) {
  storageSet('projects', projects);
}
function getProject(id) {
  const projects = getAllProjects();
  return projects.find(p => p.id === id) || null;
}
function createProject(data) {
  const projects = getAllProjects();
  const checklist = {};
  PHASES.forEach(phase => {
    phase.groups.forEach(group => {
      group.items.forEach(item => { checklist[item.id] = false; });
    });
  });
  const project = {
    id: 'proj_' + Date.now(),
    name: data.name || 'Nuovo Progetto',
    client: data.client || '',
    logo: null,           // base64 string
    status: 'attivo',     // attivo | pausa | consegnato | archiviato
    deadline: '',
    nextStep: '',
    quickNote: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    brief: null,
    briefUpdatedAt: null,
    checklist,
    checklistUpdatedAt: null,
    access: { url: '', username: '', password: '', notes: '' },
    accessUpdatedAt: null,
    assets: { links: [], briefUpdates: '', generalNotes: '' },
    assetsUpdatedAt: null,
    revisions: [],
    revisionsUpdatedAt: null,
  };
  projects.push(project);
  saveAllProjects(projects);
  return project;
}
function updateProject(id, updates) {
  const projects = getAllProjects();
  const idx = projects.findIndex(p => p.id === id);
  if (idx === -1) return null;
  projects[idx] = { ...projects[idx], ...updates, updatedAt: new Date().toISOString() };
  saveAllProjects(projects);
  return projects[idx];
}
function deleteProject(id) {
  const projects = getAllProjects().filter(p => p.id !== id);
  saveAllProjects(projects);
}
function getChecklistProgress(project) {
  if (!project || !project.checklist) return { done: 0, total: 0, pct: 0 };
  let total = 0, done = 0;
  PHASES.forEach(phase => {
    phase.groups.forEach(group => {
      group.items.forEach(item => {
        total++;
        if (project.checklist[item.id]) done++;
      });
    });
  });
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}
function getPhaseProgress(project, phaseId) {
  if (!project || !project.checklist) return { done: 0, total: 0, pct: 0 };
  const phase = PHASES.find(p => p.id === phaseId);
  if (!phase) return { done: 0, total: 0, pct: 0 };
  let total = 0, done = 0;
  phase.groups.forEach(group => {
    group.items.forEach(item => {
      total++;
      if (project.checklist[item.id]) done++;
    });
  });
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}
function updateChecklist(projectId, itemId, value) {
  const project = getProject(projectId);
  if (!project) return;
  project.checklist[itemId] = value;
  project.checklistUpdatedAt = new Date().toISOString();
  updateProject(projectId, { checklist: project.checklist, checklistUpdatedAt: project.checklistUpdatedAt });
}
function uploadProjectLogo(projectId, file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) { reject('File non valido'); return; }
    if (file.size > 500 * 1024) { reject('Logo troppo grande (max 500KB)'); return; }
    const reader = new FileReader();
    reader.onload = e => {
      const logo = e.target.result;
      updateProject(projectId, { logo });
      resolve(logo);
    };
    reader.onerror = () => reject('Errore lettura file');
    reader.readAsDataURL(file);
  });
}
