"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getProcessEngine } from "@/lib/engine/process-engine";
import { ProcessDefinition, ProcessInstance } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const [processDefinitions, setProcessDefinitions] = useState<ProcessDefinition[]>([]);
  const [processInstances, setProcessInstances] = useState<ProcessInstance[]>([]);
  const [statistics, setStatistics] = useState({
    processDefinitions: 0,
    processInstances: { total: 0, active: 0, completed: 0, suspended: 0, terminated: 0, failed: 0 },
    tasks: { total: 0, pending: 0, assigned: 0, inProgress: 0, completed: 0, cancelled: 0 },
  });

  // 프로세스 시작 다이얼로그 상태
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [selectedProcessDef, setSelectedProcessDef] = useState<ProcessDefinition | null>(null);
  const [businessKey, setBusinessKey] = useState("");
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const engine = getProcessEngine();
    const defs = engine.getAllProcessDefinitions();
    const instances = engine.getRuntimeService().getAllInstances();
    const stats = engine.getStatistics();

    setProcessDefinitions(defs);
    setProcessInstances(instances.slice(0, 10)); // 최근 10개만
    setStatistics(stats);
  };

  const handleOpenStartDialog = (processDef: ProcessDefinition) => {
    setSelectedProcessDef(processDef);
    setBusinessKey("LOT-" + Date.now()); // 기본 비즈니스 키
    setStartDialogOpen(true);
  };

  const handleStartProcess = async () => {
    if (!selectedProcessDef) return;

    setIsStarting(true);
    try {
      const engine = getProcessEngine();

      // 프로세스 인스턴스 시작
      const instance = await engine.startProcess(
        selectedProcessDef.key,
        businessKey,
        {},
        "system"
      );

      // 다이얼로그 닫기 및 상태 초기화
      setStartDialogOpen(false);
      setSelectedProcessDef(null);
      setBusinessKey("");

      // 데이터 새로고침
      loadData();

      alert(`프로세스가 시작되었습니다!\n인스턴스 ID: ${instance.id}`);
    } catch (error) {
      console.error("프로세스 시작 실패:", error);
      alert("프로세스 시작에 실패했습니다.");
    } finally {
      setIsStarting(false);
    }
  };

  const handleCancelStart = () => {
    setStartDialogOpen(false);
    setSelectedProcessDef(null);
    setBusinessKey("");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
      ACTIVE: "success",
      COMPLETED: "secondary",
      SUSPENDED: "warning",
      TERMINATED: "destructive",
      FAILED: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("ko-KR");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">BPMN Flow - 식품공장 프로세스 관리</h1>
            <div className="flex gap-2">
              <Button onClick={() => router.push("/editor")}>
                프로세스 편집기
              </Button>
              <Button onClick={() => router.push("/operate")} variant="outline">
                모니터링
              </Button>
              <Button onClick={() => router.push("/tasklist")} variant="outline">
                태스크 목록
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">프로세스 정의</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{statistics.processDefinitions}</div>
              <p className="text-xs text-gray-500 mt-1">배포된 프로세스</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">실행 중</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {statistics.processInstances.active}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                전체 {statistics.processInstances.total}개
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">완료</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {statistics.processInstances.completed}
              </div>
              <p className="text-xs text-gray-500 mt-1">정상 종료</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">대기 중인 태스크</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {statistics.tasks.pending + statistics.tasks.assigned}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                전체 {statistics.tasks.total}개
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 프로세스 정의 목록 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>프로세스 정의</CardTitle>
            <CardDescription>배포된 BPMN 프로세스 정의 목록</CardDescription>
          </CardHeader>
          <CardContent>
            {processDefinitions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">배포된 프로세스가 없습니다.</p>
                <Button onClick={() => router.push("/editor")}>
                  새 프로세스 만들기
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>키</TableHead>
                    <TableHead>버전</TableHead>
                    <TableHead>배포 시간</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processDefinitions.map((def) => (
                    <TableRow key={def.id}>
                      <TableCell className="font-medium">{def.name}</TableCell>
                      <TableCell>{def.key}</TableCell>
                      <TableCell>v{def.version}</TableCell>
                      <TableCell>
                        {def.deploymentTime ? formatDate(def.deploymentTime) : "-"}
                      </TableCell>
                      <TableCell>
                        {def.suspended ? (
                          <Badge variant="warning">중단됨</Badge>
                        ) : (
                          <Badge variant="success">활성</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenStartDialog(def)}
                          disabled={def.suspended}
                        >
                          시작
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* 최근 프로세스 인스턴스 */}
        <Card>
          <CardHeader>
            <CardTitle>최근 프로세스 인스턴스</CardTitle>
            <CardDescription>최근 실행된 프로세스 인스턴스 목록</CardDescription>
          </CardHeader>
          <CardContent>
            {processInstances.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">실행 중인 프로세스 인스턴스가 없습니다.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>프로세스 이름</TableHead>
                    <TableHead>Business Key</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>시작 시간</TableHead>
                    <TableHead>현재 액티비티</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processInstances.map((instance) => (
                    <TableRow key={instance.id}>
                      <TableCell className="font-mono text-xs">
                        {instance.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="font-medium">
                        {instance.processDefinitionName}
                      </TableCell>
                      <TableCell>{instance.businessKey || "-"}</TableCell>
                      <TableCell>{getStatusBadge(instance.status)}</TableCell>
                      <TableCell>{formatDate(instance.startTime)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {instance.currentActivities.slice(0, 2).map((activityId, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {activityId}
                            </Badge>
                          ))}
                          {instance.currentActivities.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{instance.currentActivities.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost">
                          상세
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* 프로세스 시작 다이얼로그 */}
      <Dialog open={startDialogOpen} onOpenChange={setStartDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>프로세스 시작</DialogTitle>
            <DialogDescription>
              {selectedProcessDef?.name} 프로세스의 새 인스턴스를 시작합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">프로세스 키</label>
              <Input
                type="text"
                value={selectedProcessDef?.key || ""}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Business Key</label>
              <Input
                type="text"
                value={businessKey}
                onChange={(e) => setBusinessKey(e.target.value)}
                placeholder="예: LOT-20241109-001"
              />
              <p className="text-xs text-gray-500">
                프로세스 인스턴스를 식별하는 고유 키입니다. (예: LOT 번호, 주문 번호 등)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelStart} disabled={isStarting}>
              취소
            </Button>
            <Button onClick={handleStartProcess} disabled={isStarting}>
              {isStarting ? "시작 중..." : "프로세스 시작"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
