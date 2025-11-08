'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// BPMN.js 타입 정의
interface BpmnModeler {
  importXML(xml: string): Promise<{ warnings: any[] }>;
  saveXML(options: { format: boolean }): Promise<{ xml?: string }>;
  saveSVG(): Promise<{ svg: string }>;
  createDiagram(): Promise<void>;
  destroy(): void;
  get(name: string): any;
  on(event: string, callback: (e: any) => void): void;
}

interface BpmnEditorProps {
  initialXml?: string;
  onXmlChange?: (xml: string) => void;
  onSave?: (xml: string) => void;
  diagramId?: string;
}

export function BpmnEditor({
  initialXml,
  onXmlChange,
  onSave,
  diagramId
}: BpmnEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelerRef = useRef<BpmnModeler | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // BPMN 모델러 초기화
  useEffect(() => {
    if (!containerRef.current || modelerRef.current) return;

    const initModeler = async () => {
      try {
        // 동적 import로 bpmn-js 로드 (클라이언트 전용)
        const BpmnModeler = (await import('bpmn-js/lib/Modeler')).default;

        const modeler = new BpmnModeler({
          container: containerRef.current!,
        });

        modelerRef.current = modeler;

        // 초기 XML이 있으면 로드, 없으면 빈 다이어그램 생성
        if (initialXml) {
          await modeler.importXML(initialXml);
        } else {
          await modeler.createDiagram();
        }

        // 다이어그램 변경 이벤트 리스너
        const eventBus = modeler.get('eventBus');

        eventBus.on('commandStack.changed', async () => {
          try {
            const { xml } = await modeler.saveXML({ format: true });
            if (xml) {
              onXmlChange?.(xml);
            }
          } catch (err) {
            console.error('Failed to save XML:', err);
          }
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize BPMN modeler:', err);
        setError('BPMN 에디터를 초기화하는데 실패했습니다.');
        setIsLoading(false);
      }
    };

    initModeler();

    // Cleanup
    return () => {
      if (modelerRef.current) {
        modelerRef.current.destroy();
        modelerRef.current = null;
      }
    };
  }, []); // 한 번만 실행

  // initialXml 변경 시 다이어그램 업데이트
  useEffect(() => {
    if (!modelerRef.current || !initialXml) return;

    const loadXml = async () => {
      try {
        await modelerRef.current!.importXML(initialXml);
      } catch (err) {
        console.error('Failed to load XML:', err);
        setError('다이어그램을 불러오는데 실패했습니다.');
      }
    };

    loadXml();
  }, [initialXml, diagramId]); // diagramId 변경 시에도 새로 로드

  // 저장 함수
  const handleSave = useCallback(async () => {
    if (!modelerRef.current) return;

    try {
      const { xml } = await modelerRef.current.saveXML({ format: true });
      if (xml) {
        onSave?.(xml);
      }
    } catch (err) {
      console.error('Failed to save diagram:', err);
      setError('다이어그램 저장에 실패했습니다.');
    }
  }, [onSave]);

  // 외부에서 접근할 수 있도록 ref 노출
  useEffect(() => {
    if (modelerRef.current) {
      (window as any).bpmnModeler = modelerRef.current;
      (window as any).saveDiagram = handleSave;
    }
  }, [handleSave]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-red-50">
        <div className="text-center">
          <p className="text-red-600 font-semibold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">BPMN 에디터 로딩 중...</p>
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ minHeight: '500px' }}
      />
    </div>
  );
}
