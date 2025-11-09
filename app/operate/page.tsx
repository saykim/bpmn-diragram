"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getProcessEngine } from "@/lib/engine/process-engine";
import { ProcessInstance } from "@/types";

export default function OperatePage() {
  const router = useRouter();
  const [instances, setInstances] = useState<ProcessInstance[]>([]);
  const [filteredInstances, setFilteredInstances] = useState<ProcessInstance[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInstance, setSelectedInstance] = useState<ProcessInstance | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"SUSPEND" | "RESUME" | "TERMINATE" | null>(null);

  useEffect(() => {
    loadData();
    // 자동 새로고침 (10초마다)
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterInstances();
  }, [instances, statusFilter, searchQuery]);

  const loadData = () => {
    const engine = getProcessEngine();
    const allInstances = engine.getRuntimeService().getAllInstances();
    setInstances(allInstances);
  };

  const filterInstances = () => {
    let filtered = instances;

    // 상태 필터
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((inst) => inst.status === statusFilter);
    }

    // 검색어 필터
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (inst) =>
          inst.id.toLowerCase().includes(query) ||
          inst.businessKey?.toLowerCase().includes(query) ||
          inst.processDefinitionName.toLowerCase().includes(query)
      );
    }

    setFilteredInstances(filtered);
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

  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end ? new Date(end).getTime() : Date.now();
    const startTime = new Date(start).getTime();
    const diff = endTime - startTime;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}일 ${hours % 24}시간`;
    if (hours > 0) return `${hours}시간 ${minutes % 60}분`;
    if (minutes > 0) return `${minutes}분 ${seconds % 60}초`;
    return `${seconds}초`;
  };

  const handleViewDetails = (instance: ProcessInstance) => {
    setSelectedInstance(instance);
    setDetailDialogOpen(true);
  };

  const handleOpenActionDialog = (instance: ProcessInstance, action: "SUSPEND" | "RESUME" | "TERMINATE") => {
    setSelectedInstance(instance);
    setPendingAction(action);
    setActionDialogOpen(true);
  };

  const handleExecuteAction = async () => {
    if (!selectedInstance || !pendingAction) return;

    try {
      const engine = getProcessEngine();
      const runtimeService = engine.getRuntimeService();

      switch (pendingAction) {
        case "SUSPEND":
          runtimeService.suspendInstance(selectedInstance.id);
          break;
        case "RESUME":
          runtimeService.resumeInstance(selectedInstance.id);
          break;
        case "TERMINATE":
          runtimeService.terminateInstance(selectedInstance.id, "사용자에 의해 종료됨");
          break;
      }

      // 데이터 새로고침
      loadData();

      // 다이얼로그 닫기
      setActionDialogOpen(false);
      setSelectedInstance(null);
      setPendingAction(null);

      alert(`프로세스 인스턴스에 ${getActionName(pendingAction)} 작업을 실행했습니다.`);
    } catch (error) {
      console.error("작업 실행 실패:", error);
      alert("작업 실행에 실패했습니다.");
    }
  };

  const getActionName = (action: string) => {
    const names: Record<string, string> = {
      SUSPEND: "일시중지",
      RESUME: "재개",
      TERMINATE: "종료",
    };
    return names[action] || action;
  };

  const getActionButtons = (instance: ProcessInstance) => {
    const buttons = [];

    if (instance.status === "ACTIVE") {
      buttons.push(
        <Button
          key="suspend"
          size="sm"
          variant="outline"
          onClick={() => handleOpenActionDialog(instance, "SUSPEND")}
        >
          일시중지
        </Button>
      );
      buttons.push(
        <Button
          key="terminate"
          size="sm"
          variant="destructive"
          onClick={() => handleOpenActionDialog(instance, "TERMINATE")}
        >
          종료
        </Button>
      );
    }

    if (instance.status === "SUSPENDED") {
      buttons.push(
        <Button
          key="resume"
          size="sm"
          variant="outline"
          onClick={() => handleOpenActionDialog(instance, "RESUME")}
        >
          재개
        </Button>
      );
    }

    return buttons;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push("/dashboard")}>
                ← 대시보드
              </Button>
              <h1 className="text-2xl font-bold">프로세스 모니터링</h1>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => router.push("/editor")} variant="outline">
                프로세스 편집기
              </Button>
              <Button onClick={() => router.push("/tasklist")} variant="outline">
                태스크 목록
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* 필터 섹션 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>필터</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="ID, Business Key, 프로세스 이름으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="상태 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  <SelectItem value="ACTIVE">실행 중</SelectItem>
                  <SelectItem value="COMPLETED">완료</SelectItem>
                  <SelectItem value="SUSPENDED">일시중지</SelectItem>
                  <SelectItem value="TERMINATED">종료됨</SelectItem>
                  <SelectItem value="FAILED">실패</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 프로세스 인스턴스 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>프로세스 인스턴스</CardTitle>
            <CardDescription>
              전체 {instances.length}개 중 {filteredInstances.length}개 표시
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredInstances.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">표시할 프로세스 인스턴스가 없습니다.</p>
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
                    <TableHead>경과 시간</TableHead>
                    <TableHead>현재 액티비티</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInstances.map((instance) => (
                    <TableRow key={instance.id}>
                      <TableCell className="font-mono text-xs">
                        {instance.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="font-medium">
                        {instance.processDefinitionName}
                      </TableCell>
                      <TableCell>{instance.businessKey || "-"}</TableCell>
                      <TableCell>{getStatusBadge(instance.status)}</TableCell>
                      <TableCell className="text-sm">{formatDate(instance.startTime)}</TableCell>
                      <TableCell className="text-sm">
                        {formatDuration(instance.startTime, instance.endTime)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap max-w-xs">
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
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewDetails(instance)}
                          >
                            상세
                          </Button>
                          {getActionButtons(instance)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* 상세 정보 다이얼로그 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>프로세스 인스턴스 상세 정보</DialogTitle>
            <DialogDescription>인스턴스 ID: {selectedInstance?.id}</DialogDescription>
          </DialogHeader>
          {selectedInstance && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">프로세스 이름</label>
                  <p className="text-sm mt-1">{selectedInstance.processDefinitionName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Business Key</label>
                  <p className="text-sm mt-1">{selectedInstance.businessKey || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">상태</label>
                  <div className="mt-1">{getStatusBadge(selectedInstance.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">시작자</label>
                  <p className="text-sm mt-1">{selectedInstance.startUserId || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">시작 시간</label>
                  <p className="text-sm mt-1">{formatDate(selectedInstance.startTime)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">종료 시간</label>
                  <p className="text-sm mt-1">
                    {selectedInstance.endTime ? formatDate(selectedInstance.endTime) : "실행 중"}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">현재 액티비티</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedInstance.currentActivities.map((activityId, idx) => (
                    <Badge key={idx} variant="outline">
                      {activityId}
                    </Badge>
                  ))}
                  {selectedInstance.currentActivities.length === 0 && (
                    <p className="text-sm text-gray-500">없음</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">프로세스 변수</label>
                <div className="mt-2 bg-gray-50 p-3 rounded-md">
                  {Object.keys(selectedInstance.variables).length === 0 ? (
                    <p className="text-sm text-gray-500">변수가 없습니다.</p>
                  ) : (
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(selectedInstance.variables, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetailDialogOpen(false)}>닫기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 작업 확인 다이얼로그 */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pendingAction && getActionName(pendingAction)} 확인</DialogTitle>
            <DialogDescription>
              프로세스 인스턴스에 {pendingAction && getActionName(pendingAction)} 작업을 실행하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          {selectedInstance && (
            <div className="py-4">
              <p className="text-sm">
                <strong>인스턴스 ID:</strong> {selectedInstance.id}
              </p>
              <p className="text-sm">
                <strong>프로세스:</strong> {selectedInstance.processDefinitionName}
              </p>
              <p className="text-sm">
                <strong>Business Key:</strong> {selectedInstance.businessKey || "-"}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              취소
            </Button>
            <Button
              variant={pendingAction === "TERMINATE" ? "destructive" : "default"}
              onClick={handleExecuteAction}
            >
              {pendingAction && getActionName(pendingAction)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
