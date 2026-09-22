import { IDEAS } from '@/content/catalog';

export type SavedIdea = { story_id: string; note: string; saved_at: string };
export const STORAGE_KEY = 'curio-library-v1';
export const LEGACY_KEY = 'commonwealth-saved';
const ids = new Set(IDEAS.map(i => i.id));

export function readLibrary(current: string | null, legacy: string | null): SavedIdea[] {
  if (current !== null) {
    const value: unknown = JSON.parse(current);
    if (!Array.isArray(value)) throw new Error('Invalid saved library');
    const records = value.filter((r): r is SavedIdea => !!r && typeof r === 'object' &&
      typeof r.story_id === 'string' && r.story_id.length > 0 && typeof r.note === 'string' &&
      r.note.length <= 10000 && typeof r.saved_at === 'string');
    return [...new Map(records.map(r => [r.story_id, r])).values()];
  }
  const value: unknown = JSON.parse(legacy || '[]');
  if (!Array.isArray(value)) throw new Error('Invalid legacy library');
  return [...new Set(value.filter((id): id is string => typeof id === 'string' && ids.has(id)))]
    .map(story_id => ({ story_id, note: '', saved_at: new Date().toISOString() }));
}

export function filterIdeas(query: string, categories: string[], themes: string[]) {
  const q = query.trim().toLowerCase();
  return IDEAS.filter(i => (!categories.length || categories.includes(i.category)) &&
    (!themes.length || themes.includes(i.theme)) &&
    [i.name, i.title, i.description, i.maker, i.category, i.theme].join(' ').toLowerCase().includes(q));
}
