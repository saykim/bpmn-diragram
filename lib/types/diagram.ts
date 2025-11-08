export interface Diagram {
  id: string;
  title: string;
  xml: string;
  notes?: string; // 메모 내용 (마크다운 지원)
  tags?: string[]; // 태그 배열
  folderId?: string; // 폴더 ID (루트는 null/undefined)
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string; // 부모 폴더 ID (루트는 null/undefined)
  createdAt: string;
  updatedAt: string;
}
