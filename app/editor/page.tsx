"use client";

import { useState, useEffect } from "react";
import { BpmnEditor } from "@/components/bpmn/bpmn-editor";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function EditorPage() {
  const router = useRouter();
  const [xml, setXml] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // 로컬 스토리지에서 불러오기
    const savedXml = localStorage.getItem("bpmn-current-diagram");
    if (savedXml) {
      setXml(savedXml);
    }
  }, []);

  const handleXmlChange = (newXml: string) => {
    setXml(newXml);
    // 자동 저장 (3초 디바운스)
    const timer = setTimeout(() => {
      localStorage.setItem("bpmn-current-diagram", newXml);
    }, 3000);

    return () => clearTimeout(timer);
  };

  const handleSave = async (xmlContent: string) => {
    setIsSaving(true);
    try {
      // 로컬 스토리지에 저장
      localStorage.setItem("bpmn-current-diagram", xmlContent);

      // TODO: 나중에 API로 서버에 저장
      console.log("다이어그램 저장됨");

      // 성공 메시지 (임시)
      alert("저장되었습니다!");
    } catch (error) {
      console.error("저장 실패:", error);
      alert("저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-background">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
          >
            ← 대시보드
          </Button>
          <h1 className="text-xl font-semibold">BPMN 프로세스 편집기</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {isSaving ? "저장 중..." : "자동 저장 활성화"}
          </span>
        </div>
      </header>

      {/* 에디터 */}
      <main className="flex-1 overflow-hidden">
        <BpmnEditor
          initialXml={xml}
          onXmlChange={handleXmlChange}
          onSave={handleSave}
          diagramId="current"
        />
      </main>
    </div>
  );
}
