'use client';

import { useState, useEffect } from 'react';

interface NotesPanelProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  onClose: () => void;
}

export function NotesPanel({ notes, onNotesChange, onClose }: NotesPanelProps) {
  const [localNotes, setLocalNotes] = useState(notes);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

  const handleSave = () => {
    onNotesChange(localNotes);
    onClose();
  };

  const handleCancel = () => {
    setLocalNotes(notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            다이어그램 메모
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPreview(!isPreview)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                isPreview
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {isPreview ? '편집' : '미리보기'}
            </button>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-auto p-6">
          {isPreview ? (
            <div className="prose dark:prose-invert max-w-none">
              {localNotes ? (
                <div className="whitespace-pre-wrap text-gray-900 dark:text-gray-100">
                  {localNotes}
                </div>
              ) : (
                <p className="text-gray-400 dark:text-gray-500 italic">메모가 없습니다.</p>
              )}
            </div>
          ) : (
            <textarea
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              placeholder="다이어그램에 대한 메모를 작성하세요...&#10;&#10;프로세스 설명, 변경 이력, 주요 결정사항 등을 기록할 수 있습니다."
              className="w-full h-full min-h-[400px] p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          )}
        </div>

        {/* 푸터 */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {localNotes.length} 글자
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
