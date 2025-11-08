'use client';

import { useState, useEffect, useCallback } from 'react';
import { BpmnEditor } from '@/components/bpmn/bpmn-editor';
import { useRouter, useSearchParams } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotesPanel } from '@/components/bpmn/notes-panel';
import { TagInput } from '@/components/tags/tag-input';
import { getAllTags } from '@/lib/storage';

export default function EditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const diagramId = searchParams.get('id');

  const [currentXml, setCurrentXml] = useState<string>('');
  const [diagramTitle, setDiagramTitle] = useState<string>('새 다이어그램');
  const [diagramNotes, setDiagramNotes] = useState<string>('');
  const [diagramTags, setDiagramTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [showTagsPanel, setShowTagsPanel] = useState(false);

  // 다이어그램 로드
  useEffect(() => {
    if (diagramId) {
      const diagrams = JSON.parse(localStorage.getItem('bpmn-diagrams') || '[]');
      const diagram = diagrams.find((d: any) => d.id === diagramId);

      if (diagram) {
        setCurrentXml(diagram.xml);
        setDiagramTitle(diagram.title);
        setDiagramNotes(diagram.notes || '');
        setDiagramTags(diagram.tags || []);
      }
    }
    // 모든 태그 로드
    setAllTags(getAllTags());
  }, [diagramId]);

  // XML 변경 핸들러 (자동 저장)
  const handleXmlChange = useCallback((xml: string) => {
    setCurrentXml(xml);

    // 자동 저장 (3초 디바운스)
    const timeoutId = setTimeout(() => {
      saveDiagram(xml, diagramTitle, diagramNotes, diagramTags);
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [diagramTitle, diagramNotes, diagramTags]);

  // 다이어그램 저장
  const saveDiagram = useCallback((xml: string, title: string, notes: string, tags: string[]) => {
    if (!xml) return;

    setIsSaving(true);

    try {
      const diagrams = JSON.parse(localStorage.getItem('bpmn-diagrams') || '[]');
      const now = new Date().toISOString();

      if (diagramId) {
        // 기존 다이어그램 업데이트
        const index = diagrams.findIndex((d: any) => d.id === diagramId);
        if (index !== -1) {
          diagrams[index] = {
            ...diagrams[index],
            xml,
            title,
            notes,
            tags,
            updatedAt: now
          };
        }
      } else {
        // 새 다이어그램 생성
        const newDiagram = {
          id: `diagram-${Date.now()}`,
          title,
          xml,
          notes,
          tags,
          createdAt: now,
          updatedAt: now
        };
        diagrams.push(newDiagram);

        // URL에 ID 추가 (새 다이어그램인 경우)
        router.replace(`/editor?id=${newDiagram.id}`);
      }

      localStorage.setItem('bpmn-diagrams', JSON.stringify(diagrams));
      setLastSaved(new Date());
      setAllTags(getAllTags()); // 태그 목록 업데이트
      showToastMessage('저장 완료');
    } catch (error) {
      console.error('Save failed:', error);
      showToastMessage('저장 실패');
    } finally {
      setIsSaving(false);
    }
  }, [diagramId, router]);

  // 수동 저장
  const handleSave = useCallback(() => {
    saveDiagram(currentXml, diagramTitle, diagramNotes, diagramTags);
  }, [currentXml, diagramTitle, diagramNotes, diagramTags, saveDiagram]);

  // 메모 저장 핸들러
  const handleNotesChange = useCallback((notes: string) => {
    setDiagramNotes(notes);
    saveDiagram(currentXml, diagramTitle, notes, diagramTags);
  }, [currentXml, diagramTitle, diagramTags, saveDiagram]);

  // 태그 저장 핸들러
  const handleTagsChange = useCallback((tags: string[]) => {
    setDiagramTags(tags);
    saveDiagram(currentXml, diagramTitle, diagramNotes, tags);
  }, [currentXml, diagramTitle, diagramNotes, saveDiagram]);

  // XML 내보내기
  const handleExport = useCallback(() => {
    if (!currentXml) return;

    const blob = new Blob([currentXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${diagramTitle}.bpmn`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToastMessage('내보내기 완료');
  }, [currentXml, diagramTitle]);

  // 토스트 메시지 표시
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S 또는 Cmd+S: 저장
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          <input
            type="text"
            value={diagramTitle}
            onChange={(e) => setDiagramTitle(e.target.value)}
            className="text-lg font-semibold border-none bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
            placeholder="다이어그램 제목"
          />

          {isSaving && (
            <span className="text-sm text-gray-500 dark:text-gray-400">저장 중...</span>
          )}

          {lastSaved && !isSaving && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              마지막 저장: {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <button
            onClick={() => setShowTagsPanel(true)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
            title="태그"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            태그
            {diagramTags.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-green-500 text-white text-xs rounded-full">
                {diagramTags.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowNotesPanel(true)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
            title="메모"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            메모
            {diagramNotes && (
              <span className="ml-1 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                •
              </span>
            )}
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            저장
          </button>

          <button
            onClick={handleExport}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            내보내기
          </button>
        </div>
      </header>

      {/* BPMN 에디터 */}
      <main className="flex-1 overflow-hidden">
        <BpmnEditor
          initialXml={currentXml}
          onXmlChange={handleXmlChange}
          onSave={handleSave}
          diagramId={diagramId || undefined}
        />
      </main>

      {/* 태그 패널 */}
      {showTagsPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">태그 편집</h2>
              <button
                onClick={() => setShowTagsPanel(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <TagInput
              tags={diagramTags}
              onTagsChange={handleTagsChange}
              suggestions={allTags}
              placeholder="태그를 입력하세요 (Enter로 추가)"
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowTagsPanel(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 메모 패널 */}
      {showNotesPanel && (
        <NotesPanel
          notes={diagramNotes}
          onNotesChange={handleNotesChange}
          onClose={() => setShowNotesPanel(false)}
        />
      )}

      {/* 토스트 알림 */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 dark:bg-gray-700 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
