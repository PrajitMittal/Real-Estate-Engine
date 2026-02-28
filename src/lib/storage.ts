import type { EngineState } from './types';

const STORAGE_KEY = 'zo-engine-state';
const SAVED_LIST_KEY = 'zo-engine-saved';

export function saveState(state: EngineState, name?: string): string {
  const id = name || `evaluation-${Date.now()}`;
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
}

export function loadState(id: string): EngineState | null {
  const raw = localStorage.getItem(`${STORAGE_KEY}-${id}`);
  return raw ? JSON.parse(raw) : null;
}

export function getSavedList(): Record<string, { name: string; location: string; date: string; rating: string }> {
  const raw = localStorage.getItem(SAVED_LIST_KEY);
  return raw ? JSON.parse(raw) : {};
}

export function deleteState(id: string): void {
  const saved = getSavedList();
  delete saved[id];
  localStorage.setItem(SAVED_LIST_KEY, JSON.stringify(saved));
  localStorage.removeItem(`${STORAGE_KEY}-${id}`);
}
