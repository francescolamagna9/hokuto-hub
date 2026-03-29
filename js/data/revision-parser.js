function parseRevision(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const sections = [];
  let currentSection = null;

  for (const line of lines) {
    const sectionMatch = line.match(/^\[(.+)\]$/);
    if (sectionMatch) {
      currentSection = { name: sectionMatch[1], items: [] };
      sections.push(currentSection);
    } else if (currentSection) {
      currentSection.items.push({ text: line, done: false });
    } else {
      // Line before any section header — create a "GENERALE" section
      if (!sections.length || sections[0].name !== 'GENERALE') {
        currentSection = { name: 'GENERALE', items: [] };
        sections.unshift(currentSection);
      }
      currentSection.items.push({ text: line, done: false });
    }
  }

  return sections;
}
