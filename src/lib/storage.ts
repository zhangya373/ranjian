import type { DyeParams } from "./dye";

export type SavedWork = {
  id: string;
  name: string;
  createdAt: string;
  params: DyeParams;
  image: string;
};

const KEY = "ranjian-works-v1";

export function loadWorks(): SavedWork[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedWork[];
  } catch {
    return [];
  }
}

export function saveWork(work: SavedWork) {
  const next = [work, ...loadWorks()].slice(0, 20);
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

export function deleteWork(id: string) {
  const next = loadWorks().filter((work) => work.id !== id);
  window.localStorage.setItem(KEY, JSON.stringify(next));
}
