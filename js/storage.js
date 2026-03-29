const STORAGE_PREFIX = 'evolve_pm_';

function storageGet(key) {
  try {
    const val = localStorage.getItem(STORAGE_PREFIX + key);
    return val ? JSON.parse(val) : null;
  } catch { return null; }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    return true;
  } catch { return false; }
}

function storageGetRaw(key) {
  return localStorage.getItem(STORAGE_PREFIX + key);
}

function storageSetRaw(key, value) {
  localStorage.setItem(STORAGE_PREFIX + key, value);
}

function storageRemove(key) {
  localStorage.removeItem(STORAGE_PREFIX + key);
}

function storageGetGroqKey() {
  return localStorage.getItem('evolve_groq_key') || '';
}

function storageSetGroqKey(key) {
  localStorage.setItem('evolve_groq_key', key);
}
