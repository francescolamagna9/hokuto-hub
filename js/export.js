function exportSelective(projectId, sections) {
  const project = getProject(projectId);
  if (!project) return;

  const exportData = {
    version: '3.0',
    exportedAt: new Date().toISOString(),
    projectId: project.id,
    projectName: project.name,
    sections: {}
  };

  if (sections.includes('brief') && project.brief) {
    exportData.sections.brief = { data: project.brief, updatedAt: project.briefUpdatedAt };
  }
  if (sections.includes('checklist') && project.checklist) {
    exportData.sections.checklist = { data: project.checklist, updatedAt: project.checklistUpdatedAt };
  }
  if (sections.includes('access')) {
    exportData.sections.access = { data: project.access, updatedAt: project.accessUpdatedAt };
  }
  if (sections.includes('assets')) {
    exportData.sections.assets = { data: project.assets, updatedAt: project.assetsUpdatedAt };
  }
  if (sections.includes('revisions')) {
    exportData.sections.revisions = { data: project.revisions, updatedAt: project.revisionsUpdatedAt };
  }

  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = project.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const date = new Date().toLocaleDateString('it-IT').replace(/\//g, '-');
  a.href = url;
  a.download = `evolve-backup-${safeName}-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportAllProjects() {
  const projects = getAllProjects();
  const exportData = {
    version: '3.0',
    exportedAt: new Date().toISOString(),
    type: 'full',
    projects
  };
  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toLocaleDateString('it-IT').replace(/\//g, '-');
  a.href = url;
  a.download = `evolve-full-backup-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function readImportFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch {
        reject(new Error('File JSON non valido'));
      }
    };
    reader.onerror = () => reject(new Error('Errore lettura file'));
    reader.readAsText(file);
  });
}

function importSelective(projectId, importData, sections) {
  const project = getProject(projectId);
  if (!project) return;

  const updates = {};

  if (sections.includes('brief') && importData.sections.brief) {
    updates.brief = importData.sections.brief.data;
    updates.briefUpdatedAt = importData.sections.brief.updatedAt;
  }
  if (sections.includes('checklist') && importData.sections.checklist) {
    updates.checklist = importData.sections.checklist.data;
    updates.checklistUpdatedAt = importData.sections.checklist.updatedAt;
  }
  if (sections.includes('access') && importData.sections.access) {
    updates.access = importData.sections.access.data;
    updates.accessUpdatedAt = importData.sections.access.updatedAt;
  }
  if (sections.includes('assets') && importData.sections.assets) {
    updates.assets = importData.sections.assets.data;
    updates.assetsUpdatedAt = importData.sections.assets.updatedAt;
  }
  if (sections.includes('revisions') && importData.sections.revisions) {
    updates.revisions = importData.sections.revisions.data;
    updates.revisionsUpdatedAt = importData.sections.revisions.updatedAt;
  }

  updateProject(projectId, updates);
}
