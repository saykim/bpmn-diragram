"use client";

import React, { useEffect, useRef, useState } from "react";
import BpmnModeler from "bpmn-js/lib/Modeler";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";

interface BpmnEditorProps {
  initialXml?: string;
  onXmlChange?: (xml: string) => void;
  onSave?: (xml: string) => void;
  diagramId?: string;
}

const defaultDiagram = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                   xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                   xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                   id="Definitions_1"
                   targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="시작"/>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="159" width="36" height="36"/>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

export function BpmnEditor({
  initialXml = defaultDiagram,
  onXmlChange,
  onSave,
  diagramId,
}: BpmnEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelerRef = useRef<BpmnModeler | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // BPMN Modeler 초기화
    const modeler = new BpmnModeler({
      container: containerRef.current,
      keyboard: {
        bindTo: document,
      },
    });

    modelerRef.current = modeler;

    // 다이어그램 로드
    modeler
      .importXML(initialXml)
      .then(() => {
        const canvas = modeler.get("canvas") as any;
        canvas.zoom("fit-viewport");
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("BPMN 다이어그램 로드 실패:", err);
        setError("다이어그램을 로드하는데 실패했습니다.");
        setIsLoading(false);
      });

    // 변경 사항 감지
    const eventBus = modeler.get("eventBus") as any;
    const handleChange = () => {
      modeler.saveXML().then(({ xml }) => {
        if (xml && onXmlChange) {
          onXmlChange(xml);
        }
      });
    };

    eventBus.on("commandStack.changed", handleChange);

    // 키보드 단축키 (Ctrl+S로 저장)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        modeler.saveXML().then(({ xml }) => {
          if (xml && onSave) {
            onSave(xml);
          }
        });
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // 클린업
    return () => {
      eventBus.off("commandStack.changed", handleChange);
      document.removeEventListener("keydown", handleKeyDown);
      modeler.destroy();
    };
  }, []);

  // XML이 외부에서 변경되었을 때
  useEffect(() => {
    if (modelerRef.current && initialXml) {
      modelerRef.current.importXML(initialXml).catch((err) => {
        console.error("XML 업데이트 실패:", err);
      });
    }
  }, [initialXml]);

  const handleExport = async () => {
    if (!modelerRef.current) return;

    try {
      const { xml } = await modelerRef.current.saveXML({ format: true });
      if (xml) {
        const blob = new Blob([xml], { type: "application/xml" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `diagram-${diagramId || Date.now()}.bpmn`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("BPMN 내보내기 실패:", err);
    }
  };

  const handleZoomIn = () => {
    if (!modelerRef.current) return;
    const canvas = modelerRef.current.get("canvas") as any;
    canvas.zoom(canvas.zoom() + 0.1);
  };

  const handleZoomOut = () => {
    if (!modelerRef.current) return;
    const canvas = modelerRef.current.get("canvas") as any;
    canvas.zoom(canvas.zoom() - 0.1);
  };

  const handleZoomReset = () => {
    if (!modelerRef.current) return;
    const canvas = modelerRef.current.get("canvas") as any;
    canvas.zoom("fit-viewport");
  };

  return (
    <div className="flex flex-col h-full">
      {/* 툴바 */}
      <div className="flex items-center gap-2 p-2 border-b bg-background">
        <button
          onClick={handleZoomIn}
          className="px-3 py-1 text-sm border rounded hover:bg-accent"
          title="확대"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="px-3 py-1 text-sm border rounded hover:bg-accent"
          title="축소"
        >
          -
        </button>
        <button
          onClick={handleZoomReset}
          className="px-3 py-1 text-sm border rounded hover:bg-accent"
          title="화면 맞춤"
        >
          화면 맞춤
        </button>
        <div className="flex-1" />
        <button
          onClick={handleExport}
          className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          내보내기
        </button>
        {onSave && (
          <button
            onClick={() => {
              if (modelerRef.current) {
                modelerRef.current.saveXML().then(({ xml }) => {
                  if (xml) onSave(xml);
                });
              }
            }}
            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            저장
          </button>
        )}
      </div>

      {/* BPMN 캔버스 */}
      <div className="flex-1 relative bg-white">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <div className="text-sm">로딩 중...</div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <div className="text-sm text-destructive">{error}</div>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
}
