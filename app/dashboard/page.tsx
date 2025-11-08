'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';

interface Diagram {
  id: string;
  title: string;
  xml: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // 다이어그램 목록 로드
  useEffect(() => {
    loadDiagrams();
  }, []);

  const loadDiagrams = () => {
    const stored = localStorage.getItem('bpmn-diagrams');
    if (stored) {
      const parsed = JSON.parse(stored);
      // 최신순으로 정렬
      setDiagrams(parsed.sort((a: Diagram, b: Diagram) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ));
    }
  };

  // 새 다이어그램 생성
  const handleCreateNew = () => {
    router.push('/editor');
  };

  // 다이어그램 열기
  const handleOpen = (id: string) => {
    router.push(`/editor?id=${id}`);
  };

  // 다이어그램 삭제
  const handleDelete = (id: string) => {
    const filtered = diagrams.filter(d => d.id !== id);
    setDiagrams(filtered);
    localStorage.setItem('bpmn-diagrams', JSON.stringify(filtered));
    setShowDeleteConfirm(null);
  };

  // 검색 필터링
  const filteredDiagrams = diagrams.filter(diagram =>
    diagram.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;

    return date.toLocaleDateString('ko-KR');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                BPMN Flow
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                식품 제조 공정 관리 시스템
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={handleCreateNew}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                새 다이어그램
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 검색 바 */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="다이어그램 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-4 top-3.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* 다이어그램 그리드 */}
        {filteredDiagrams.length === 0 ? (
          <div className="text-center py-16">
            <svg
              className="mx-auto h-24 w-24 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              다이어그램이 없습니다
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              새 다이어그램을 생성하여 시작하세요
            </p>
            <button
              onClick={handleCreateNew}
              className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              첫 번째 다이어그램 만들기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDiagrams.map((diagram) => (
              <div
                key={diagram.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer group"
              >
                {/* 카드 미리보기 영역 */}
                <div
                  onClick={() => handleOpen(diagram.id)}
                  className="p-6 border-b border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center justify-center h-32 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
                    <svg
                      className="w-16 h-16 text-gray-300 dark:text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 truncate">
                    {diagram.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(diagram.updatedAt)} 수정됨
                  </p>
                </div>

                {/* 카드 액션 */}
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 flex items-center justify-between">
                  <button
                    onClick={() => handleOpen(diagram.id)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    편집
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(diagram.id)}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    삭제
                  </button>
                </div>

                {/* 삭제 확인 모달 */}
                {showDeleteConfirm === diagram.id && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4">
                      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">다이어그램 삭제</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        정말로 &quot;{diagram.title}&quot;을(를) 삭제하시겠습니까?
                      </p>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          취소
                        </button>
                        <button
                          onClick={() => handleDelete(diagram.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 통계 */}
        {diagrams.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">전체 다이어그램</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{diagrams.length}</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">이번 주 생성</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {diagrams.filter(d => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return new Date(d.createdAt) > weekAgo;
                  }).length}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">오늘 수정</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {diagrams.filter(d => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return new Date(d.updatedAt) > today;
                  }).length}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
