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
import { getProcessEngine } from "@/lib/engine/process-engine";
import { CCPCheckpoint, Measurement } from "@/types/food-process";

export default function HACCPPage() {
  const router = useRouter();
  const [checkpoints, setCheckpoints] = useState<CCPCheckpoint[]>([]);
  const [selectedCCP, setSelectedCCP] = useState<CCPCheckpoint | null>(null);
  const [checkDialogOpen, setCheckDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    passed: 0,
    failed: 0,
    correctiveAction: 0,
    passRate: 0,
  });

  useEffect(() => {
    loadData();
    // 자동 새로고침 (5초마다)
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    const engine = getProcessEngine();
    const haccpService = engine.getHACCPService();

    // HACCP 서비스가 없으면 데모 데이터 생성
    const allCCPs: CCPCheckpoint[] = [];

    // 실제로는 활성 프로세스 인스턴스에서 CCP 조회
    // 여기서는 데모를 위해 빈 배열 사용
    setCheckpoints(allCCPs);

    const stats = haccpService.getCCPStatistics();
    setStatistics(stats);
  };

  const handleOpenCheckDialog = (ccp: CCPCheckpoint) => {
    setSelectedCCP(ccp);

    // 한계기준에 따라 측정값 템플릿 생성
    const measurementTemplates: Measurement[] = ccp.criticalLimits.map((limit) => ({
      parameter: limit.parameter,
      value: limit.targetValue || 0,
      unit: limit.unit,
      withinLimit: true,
      timestamp: new Date(),
    }));

    setMeasurements(measurementTemplates);
    setCheckDialogOpen(true);
  };

  const handleOpenDetailDialog = (ccp: CCPCheckpoint) => {
    setSelectedCCP(ccp);
    setDetailDialogOpen(true);
  };

  const handleMeasurementChange = (index: number, value: number) => {
    const newMeasurements = [...measurements];
    newMeasurements[index].value = value;
    newMeasurements[index].timestamp = new Date();
    setMeasurements(newMeasurements);
  };

  const handleSubmitCheck = async () => {
    if (!selectedCCP) return;

    setIsChecking(true);
    try {
      const engine = getProcessEngine();
      const haccpService = engine.getHACCPService();

      // CCP 체크 완료
      const result = haccpService.completeCCPCheck(
        selectedCCP.id,
        measurements,
        "system",
        "실시간 모니터링"
      );

      setCheckDialogOpen(false);
      setSelectedCCP(null);
      setMeasurements([]);

      // 데이터 새로고침
      loadData();

      if (result.passed) {
        alert(`CCP 검증 통과!\n모든 측정값이 한계기준 내에 있습니다.`);
      } else {
        const deviationCount = result.deviations?.length || 0;
        alert(
          `CCP 검증 실패!\n${deviationCount}개의 일탈이 발견되었습니다.\n시정조치가 필요합니다.`
        );
      }
    } catch (error) {
      console.error("CCP 체크 실패:", error);
      alert("CCP 체크에 실패했습니다.");
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "success" | "warning" | "destructive" | "secondary"
    > = {
      PENDING: "default",
      IN_PROGRESS: "warning",
      PASSED: "success",
      FAILED: "destructive",
      CORRECTIVE_ACTION: "warning",
    };
    return <Badge variant={variants[status] || "default"}>{getStatusText(status)}</Badge>;
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      PENDING: "대기",
      IN_PROGRESS: "진행중",
      PASSED: "통과",
      FAILED: "실패",
      CORRECTIVE_ACTION: "시정조치",
    };
    return texts[status] || status;
  };

  const getHazardTypeBadge = (hazardType: string) => {
    const variants: Record<
      string,
      "default" | "success" | "warning" | "destructive" | "secondary"
    > = {
      BIOLOGICAL: "destructive",
      CHEMICAL: "warning",
      PHYSICAL: "default",
    };
    return <Badge variant={variants[hazardType] || "default"}>{getHazardTypeText(hazardType)}</Badge>;
  };

  const getHazardTypeText = (hazardType: string) => {
    const texts: Record<string, string> = {
      BIOLOGICAL: "생물학적",
      CHEMICAL: "화학적",
      PHYSICAL: "물리적",
    };
    return texts[hazardType] || hazardType;
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<
      string,
      "default" | "success" | "warning" | "destructive" | "secondary"
    > = {
      LOW: "secondary",
      MEDIUM: "warning",
      HIGH: "destructive",
      CRITICAL: "destructive",
    };
    return <Badge variant={variants[severity] || "default"}>{severity}</Badge>;
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
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push("/dashboard")}>
                ← 대시보드
              </Button>
              <h1 className="text-2xl font-bold">HACCP CCP 실시간 검증</h1>
            </div>
            <div className="flex gap-2">
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
              <CardTitle className="text-sm font-medium text-gray-600">총 CCP</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{statistics.total}</div>
              <p className="text-xs text-gray-500 mt-1">중요관리점</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">통과율</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {statistics.passRate.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-500 mt-1">
                통과 {statistics.passed} / 실패 {statistics.failed}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">진행 중</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {statistics.inProgress}
              </div>
              <p className="text-xs text-gray-500 mt-1">검증 진행 중</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">시정조치</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {statistics.correctiveAction}
              </div>
              <p className="text-xs text-gray-500 mt-1">조치 필요</p>
            </CardContent>
          </Card>
        </div>

        {/* CCP 체크포인트 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>CCP 체크포인트</CardTitle>
            <CardDescription>중요관리점 실시간 모니터링 및 검증</CardDescription>
          </CardHeader>
          <CardContent>
            {checkpoints.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  CCP 체크포인트가 없습니다.
                </p>
                <p className="text-sm text-gray-400">
                  프로세스를 시작하면 CCP가 자동으로 생성됩니다.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>코드</TableHead>
                    <TableHead>이름</TableHead>
                    <TableHead>위해요소</TableHead>
                    <TableHead>프로세스 ID</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>검증 시간</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checkpoints.map((ccp) => (
                    <TableRow key={ccp.id}>
                      <TableCell className="font-mono font-medium">{ccp.code}</TableCell>
                      <TableCell className="font-medium">{ccp.name}</TableCell>
                      <TableCell>{getHazardTypeBadge(ccp.hazardType)}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {ccp.processInstanceId.substring(0, 8)}...
                      </TableCell>
                      <TableCell>{getStatusBadge(ccp.status)}</TableCell>
                      <TableCell className="text-sm">
                        {ccp.checkTime ? formatDate(ccp.checkTime) : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenDetailDialog(ccp)}
                          >
                            상세
                          </Button>
                          {ccp.status === "PENDING" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenCheckDialog(ccp)}
                            >
                              검증
                            </Button>
                          )}
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

      {/* CCP 검증 다이얼로그 */}
      <Dialog open={checkDialogOpen} onOpenChange={setCheckDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>CCP 검증</DialogTitle>
            <DialogDescription>
              {selectedCCP?.code} - {selectedCCP?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedCCP && (
            <div className="space-y-4 py-4">
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm font-medium text-blue-900">위해요소: {getHazardTypeText(selectedCCP.hazardType)}</p>
                <p className="text-sm text-blue-700 mt-1">{selectedCCP.description}</p>
              </div>

              <div>
                <label className="text-sm font-medium block mb-3">한계기준 및 측정값</label>
                <div className="space-y-3">
                  {measurements.map((measurement, index) => {
                    const limit = selectedCCP.criticalLimits[index];
                    return (
                      <div key={index} className="border rounded-md p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{measurement.parameter}</span>
                          <Badge variant="outline">
                            {limit.operator === "BETWEEN"
                              ? `${limit.minValue} - ${limit.maxValue} ${limit.unit}`
                              : limit.operator === "GREATER_THAN"
                              ? `> ${limit.minValue} ${limit.unit}`
                              : limit.operator === "LESS_THAN"
                              ? `< ${limit.maxValue} ${limit.unit}`
                              : `${limit.targetValue} ${limit.unit}`}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={measurement.value}
                            onChange={(e) =>
                              handleMeasurementChange(index, parseFloat(e.target.value))
                            }
                            placeholder={`측정값 (${measurement.unit})`}
                          />
                          <span className="text-sm text-gray-500 min-w-fit">
                            {measurement.unit}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedCCP.monitoringProcedure && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm font-medium mb-2">모니터링 절차</p>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>무엇을: {selectedCCP.monitoringProcedure.what}</p>
                    <p>어떻게: {selectedCCP.monitoringProcedure.how}</p>
                    <p>빈도: {selectedCCP.monitoringProcedure.frequency}</p>
                    <p>담당자: {selectedCCP.monitoringProcedure.who}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCheckDialogOpen(false)}
              disabled={isChecking}
            >
              취소
            </Button>
            <Button onClick={handleSubmitCheck} disabled={isChecking}>
              {isChecking ? "검증 중..." : "검증 완료"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CCP 상세 정보 다이얼로그 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>CCP 상세 정보</DialogTitle>
            <DialogDescription>
              {selectedCCP?.code} - {selectedCCP?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedCCP && (
            <div className="space-y-4 py-4">
              {/* 기본 정보 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">상태</label>
                  <div className="mt-1">{getStatusBadge(selectedCCP.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">위해요소 타입</label>
                  <div className="mt-1">{getHazardTypeBadge(selectedCCP.hazardType)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">검증 시간</label>
                  <p className="text-sm mt-1">
                    {selectedCCP.checkTime ? formatDate(selectedCCP.checkTime) : "미검증"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">검증자</label>
                  <p className="text-sm mt-1">{selectedCCP.checkedBy || "-"}</p>
                </div>
              </div>

              {/* 한계기준 */}
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">
                  한계기준
                </label>
                <div className="space-y-2">
                  {selectedCCP.criticalLimits.map((limit, idx) => (
                    <div key={idx} className="border rounded-md p-3 bg-gray-50">
                      <p className="text-sm font-medium">{limit.parameter}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {limit.operator === "BETWEEN"
                          ? `${limit.minValue} - ${limit.maxValue} ${limit.unit}`
                          : limit.operator === "GREATER_THAN"
                          ? `> ${limit.minValue} ${limit.unit}`
                          : limit.operator === "LESS_THAN"
                          ? `< ${limit.maxValue} ${limit.unit}`
                          : `${limit.targetValue} ± ${limit.tolerance} ${limit.unit}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 검증 결과 */}
              {selectedCCP.result && (
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-2">
                    검증 결과
                  </label>
                  <div className="border rounded-md p-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">
                        {selectedCCP.result.passed ? "통과" : "실패"}
                      </span>
                      {selectedCCP.result.passed ? (
                        <Badge variant="success">✓ 통과</Badge>
                      ) : (
                        <Badge variant="destructive">✗ 실패</Badge>
                      )}
                    </div>

                    {/* 측정값 */}
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-600 mb-1">측정값</p>
                      <div className="space-y-1">
                        {selectedCCP.result.measurements.map((m, idx) => (
                          <div
                            key={idx}
                            className="text-xs flex items-center justify-between"
                          >
                            <span>{m.parameter}:</span>
                            <span className={m.withinLimit ? "text-green-600" : "text-red-600"}>
                              {m.value} {m.unit}{" "}
                              {m.withinLimit ? "✓" : "✗"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 일탈 사항 */}
                    {selectedCCP.result.deviations && selectedCCP.result.deviations.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-600 mb-1">일탈 사항</p>
                        <div className="space-y-2">
                          {selectedCCP.result.deviations.map((dev, idx) => (
                            <div key={idx} className="bg-red-50 p-2 rounded text-xs">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium">{dev.parameter}</span>
                                {getSeverityBadge(dev.severity)}
                              </div>
                              <p className="text-gray-600">{dev.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 시정조치 */}
                    {selectedCCP.result.correctiveActionsTaken &&
                      selectedCCP.result.correctiveActionsTaken.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-1">
                            시정조치 (자동 실행)
                          </p>
                          <div className="space-y-1">
                            {selectedCCP.result.correctiveActionsTaken.map((action, idx) => (
                              <div key={idx} className="text-xs bg-yellow-50 p-2 rounded">
                                {action}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {selectedCCP.result.notes && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600">비고: {selectedCCP.result.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 시정조치 목록 */}
              {selectedCCP.correctiveActions.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-2">
                    시정조치 절차
                  </label>
                  <div className="space-y-2">
                    {selectedCCP.correctiveActions.map((action, idx) => (
                      <div key={idx} className="border rounded-md p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{action.description}</span>
                          {action.automated && (
                            <Badge variant="secondary" className="text-xs">
                              자동
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">절차: {action.procedure}</p>
                        <p className="text-xs text-gray-600">책임자: {action.responsible}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetailDialogOpen(false)}>닫기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
