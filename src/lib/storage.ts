import type { EngineState } from './types';

const STORAGE_KEY = 'zo-engine-state';
const SAVED_LIST_KEY = 'zo-engine-saved';

export function saveState(state: EngineState, name?: string): string {
  const id = name || `evaluation-${Date.now()}`;
  try {
    const saved = getSavedList();
    saved[id] = {
      name: id,
      location: state.propertyInput?.location || 'Unknown',
      date: new Date().toISOString(),
      rating: state.viability?.rating || 'pending',
    };
    localStorage.setItem(SAVED_LIST_KEY, JSON.stringify(saved));
    localStorage.setItem(`${STORAGE_KEY}-${id}`, JSON.stringify(state));
    return id;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      // Try to free space by removing oldest evaluations
      const saved = getSavedList();
      const entries = Object.entries(saved).sort((a, b) =>
        new Date(a[1].date).getTime() - new Date(b[1].date).getTime()
      );
      // Remove oldest 3 entries to free space
      for (let i = 0; i < Math.min(3, entries.length); i++) {
        const [oldId] = entries[i];
        localStorage.removeItem(`${STORAGE_KEY}-${oldId}`);
        delete saved[oldId];
      }
      try {
        localStorage.setItem(SAVED_LIST_KEY, JSON.stringify(saved));
        localStorage.setItem(`${STORAGE_KEY}-${id}`, JSON.stringify(state));
        return id;
      } catch {
        throw new Error('Storage is full. Please delete some saved evaluations and try again.');
      }
    }
    throw err;
  }
}

export function loadState(id: string): EngineState | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}-${id}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getSavedList(): Record<string, { name: string; location: string; date: string; rating: string }> {
  try {
    const raw = localStorage.getItem(SAVED_LIST_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function deleteState(id: string): void {
  try {
    const saved = getSavedList();
    delete saved[id];
    localStorage.setItem(SAVED_LIST_KEY, JSON.stringify(saved));
    localStorage.removeItem(`${STORAGE_KEY}-${id}`);
  } catch {
    // Silently ignore delete errors
  }
}
