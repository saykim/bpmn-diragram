import { Diagram, Folder } from './types/diagram';

const DIAGRAMS_KEY = 'bpmn-diagrams';
const FOLDERS_KEY = 'bpmn-folders';

// 다이어그램 관련 함수
export function getAllDiagrams(): Diagram[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(DIAGRAMS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getDiagramById(id: string): Diagram | undefined {
  const diagrams = getAllDiagrams();
  return diagrams.find(d => d.id === id);
}

export function saveDiagram(diagram: Diagram): void {
  const diagrams = getAllDiagrams();
  const index = diagrams.findIndex(d => d.id === diagram.id);

  if (index !== -1) {
    diagrams[index] = { ...diagram, updatedAt: new Date().toISOString() };
  } else {
    diagrams.push({
      ...diagram,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  localStorage.setItem(DIAGRAMS_KEY, JSON.stringify(diagrams));
}

export function deleteDiagram(id: string): void {
  const diagrams = getAllDiagrams();
  const filtered = diagrams.filter(d => d.id !== id);
  localStorage.setItem(DIAGRAMS_KEY, JSON.stringify(filtered));
}

export function getDiagramsByFolder(folderId?: string): Diagram[] {
  const diagrams = getAllDiagrams();
  return diagrams.filter(d => d.folderId === folderId);
}

export function getDiagramsByTag(tag: string): Diagram[] {
  const diagrams = getAllDiagrams();
  return diagrams.filter(d => d.tags?.includes(tag));
}

export function getAllTags(): string[] {
  const diagrams = getAllDiagrams();
  const tagSet = new Set<string>();

  diagrams.forEach(diagram => {
    diagram.tags?.forEach(tag => tagSet.add(tag));
  });

  return Array.from(tagSet).sort();
}

// 폴더 관련 함수
export function getAllFolders(): Folder[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(FOLDERS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getFolderById(id: string): Folder | undefined {
  const folders = getAllFolders();
  return folders.find(f => f.id === id);
}

export function saveFolder(folder: Folder): void {
  const folders = getAllFolders();
  const index = folders.findIndex(f => f.id === folder.id);

  if (index !== -1) {
    folders[index] = { ...folder, updatedAt: new Date().toISOString() };
  } else {
    folders.push({
      ...folder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
}

export function deleteFolder(id: string): void {
  const folders = getAllFolders();
  const filtered = folders.filter(f => f.id !== id);
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(filtered));

  // 폴더에 속한 다이어그램들의 folderId를 제거
  const diagrams = getAllDiagrams();
  diagrams.forEach(diagram => {
    if (diagram.folderId === id) {
      diagram.folderId = undefined;
    }
  });
  localStorage.setItem(DIAGRAMS_KEY, JSON.stringify(diagrams));
}

export function getFoldersByParent(parentId?: string): Folder[] {
  const folders = getAllFolders();
  return folders.filter(f => f.parentId === parentId);
}
