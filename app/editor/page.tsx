"use client";

import { useState, useEffect } from "react";
import { BpmnEditor } from "@/components/bpmn/bpmn-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { getProcessEngine } from "@/lib/engine/process-engine";
import { FOOD_PROCESS_TEMPLATES } from "@/lib/templates/food-process-templates";

export default function EditorPage() {
  const router = useRouter();
  const [xml, setXml] = useState<string>("");
  const [processName, setProcessName] = useState<string>("새 프로세스");
  const [processKey, setProcessKey] = useState<string>("process-" + Date.now());
  const [isSaving, setIsSaving] = useState(false);
  const [isDeployed, setIsDeployed] = useState(false);

  useEffect(() => {
    // 로컬 스토리지에서 불러오기
    const savedXml = localStorage.getItem("bpmn-current-diagram");
    const savedName = localStorage.getItem("bpmn-current-name");
    const savedKey = localStorage.getItem("bpmn-current-key");

    if (savedXml) {
      setXml(savedXml);
    }
    if (savedName) {
      setProcessName(savedName);
    }
    if (savedKey) {
      setProcessKey(savedKey);
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

  const handleDeploy = async () => {
    if (!processName.trim()) {
      alert("프로세스 이름을 입력해주세요.");
      return;
    }

    if (!processKey.trim()) {
      alert("프로세스 키를 입력해주세요.");
      return;
    }

    if (!xml || xml.trim() === "") {
      alert("프로세스 다이어그램이 비어있습니다.");
      return;
    }

    setIsSaving(true);
    try {
      const engine = getProcessEngine();

      // 프로세스 정의 배포
      const processDefinition = engine.deploy(xml, processName, processKey);

      // 로컬 스토리지에 저장
      localStorage.setItem("bpmn-current-diagram", xml);
      localStorage.setItem("bpmn-current-name", processName);
      localStorage.setItem("bpmn-current-key", processKey);

      setIsDeployed(true);
      alert(`프로세스가 배포되었습니다!\n이름: ${processDefinition.name}\n버전: ${processDefinition.version}`);
    } catch (error) {
      console.error("배포 실패:", error);
      alert("배포에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async (xmlContent: string) => {
    setIsSaving(true);
    try {
      // 로컬 스토리지에 저장
      localStorage.setItem("bpmn-current-diagram", xmlContent);
      localStorage.setItem("bpmn-current-name", processName);
      localStorage.setItem("bpmn-current-key", processKey);

      console.log("다이어그램 저장됨");
      alert("저장되었습니다!");
    } catch (error) {
      console.error("저장 실패:", error);
      alert("저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewProcess = () => {
    if (confirm("새 프로세스를 만들겠습니까? 저장하지 않은 변경사항이 사라집니다.")) {
      setXml("");
      setProcessName("새 프로세스");
      setProcessKey("process-" + Date.now());
      setIsDeployed(false);
      localStorage.removeItem("bpmn-current-diagram");
      localStorage.removeItem("bpmn-current-name");
      localStorage.removeItem("bpmn-current-key");
    }
  };

  const handleLoadTemplate = (templateId: string) => {
    if (!confirm("템플릿을 불러오겠습니까? 저장하지 않은 변경사항이 사라집니다.")) {
      return;
    }

    const template = FOOD_PROCESS_TEMPLATES.find((t) => t.id === templateId);
    if (!template) {
      alert("템플릿을 찾을 수 없습니다.");
      return;
    }

    setXml(template.bpmnXml);
    setProcessName(template.name);
    setProcessKey(template.id + "-" + Date.now());
    setIsDeployed(false);

    localStorage.setItem("bpmn-current-diagram", template.bpmnXml);
    localStorage.setItem("bpmn-current-name", template.name);
    localStorage.setItem("bpmn-current-key", template.id + "-" + Date.now());
  };

  return (
    <div className="flex flex-col h-screen">
      {/* 헤더 */}
      <header className="border-b bg-background">
        <div className="flex items-center justify-between px-6 py-4">
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
            <Select onValueChange={handleLoadTemplate}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="템플릿 불러오기" />
              </SelectTrigger>
              <SelectContent>
                {FOOD_PROCESS_TEMPLATES.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleNewProcess}>
              새 프로세스
            </Button>
            <Button onClick={handleDeploy} disabled={isSaving}>
              {isSaving ? "배포 중..." : "프로세스 배포"}
            </Button>
          </div>
        </div>

        {/* 프로세스 정보 입력 */}
        <div className="px-6 py-3 bg-gray-50 border-t flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium whitespace-nowrap">프로세스 이름:</label>
            <Input
              type="text"
              value={processName}
              onChange={(e) => setProcessName(e.target.value)}
              placeholder="예: 빵 제조 공정"
              className="w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium whitespace-nowrap">프로세스 키:</label>
            <Input
              type="text"
              value={processKey}
              onChange={(e) => setProcessKey(e.target.value)}
              placeholder="예: bread-manufacturing"
              className="w-64"
            />
          </div>
          {isDeployed && (
            <span className="text-sm text-green-600 font-medium">✓ 배포됨</span>
          )}
        </div>
      </header>

      {/* 에디터 */}
      <main className="flex-1 overflow-hidden">
        <BpmnEditor
          initialXml={xml}
          onXmlChange={handleXmlChange}
          onSave={handleSave}
          diagramId={processKey}
        />
      </main>
    </div>
  );
}
