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
import { LOT } from "@/types/food-process";

export default function LOTTrackingPage() {
  const router = useRouter();
  const [lots, setLots] = useState<LOT[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLOT, setSelectedLOT] = useState<LOT | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [traceDialogOpen, setTraceDialogOpen] = useState(false);
  const [traceMode, setTraceMode] = useState<"forward" | "backward">("forward");
  const [tracedLOTs, setTracedLOTs] = useState<LOT[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const engine = getProcessEngine();
    const lotService = engine.getLOTTrackingService();
    const allLOTs = lotService.getAllLOTs();
    setLots(allLOTs);
  };

  const handleSearch = () => {
    const engine = getProcessEngine();
    const lotService = engine.getLOTTrackingService();

    if (searchQuery.trim() === "") {
      loadData();
      return;
    }

    // LOT 번호로 검색
    const lot = lotService.getLOTByNumber(searchQuery);
    if (lot) {
      setLots([lot]);
    } else {
      // 제품명으로 검색
      const allLOTs = lotService.getAllLOTs();
      const filtered = allLOTs.filter(
        (lot) =>
          lot.lotNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lot.productName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setLots(filtered);
    }
  };

  const handleViewDetails = (lot: LOT) => {
    setSelectedLOT(lot);
    setDetailDialogOpen(true);
  };

  const handleTrace = (lot: LOT, mode: "forward" | "backward") => {
    setSelectedLOT(lot);
    setTraceMode(mode);

    const engine = getProcessEngine();
    const lotService = engine.getLOTTrackingService();

    let traced: LOT[];
    if (mode === "forward") {
      traced = lotService.forwardTrace(lot.lotNumber);
    } else {
      traced = lotService.backwardTrace(lot.lotNumber);
    }

    setTracedLOTs(traced);
    setTraceDialogOpen(true);
  };

  const handleRecall = (lot: LOT) => {
    if (
      !confirm(
        `LOT ${lot.lotNumber} (${lot.productName})을 리콜하시겠습니까?\n\n연관된 모든 LOT가 함께 리콜됩니다.`
      )
    ) {
      return;
    }

    const reason = prompt("리콜 사유를 입력하세요:");
    if (!reason) return;

    const engine = getProcessEngine();
    const lotService = engine.getLOTTrackingService();
    const result = lotService.recallLOT(lot.lotNumber, reason);

    alert(
      `리콜 완료!\n직접 리콜된 LOT: ${result.recalledLOTs.length}개\n영향받은 LOT: ${result.affectedLOTs.length}개`
    );

    loadData();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "success" | "warning" | "destructive" | "secondary"
    > = {
      IN_PROCESS: "warning",
      QUARANTINE: "secondary",
      RELEASED: "success",
      RECALLED: "destructive",
      DISPOSED: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{getStatusText(status)}</Badge>;
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      IN_PROCESS: "생산중",
      QUARANTINE: "격리",
      RELEASED: "출하",
      RECALLED: "리콜",
      DISPOSED: "폐기",
    };
    return texts[status] || status;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ko-KR");
  };

  const formatDateTime = (date: Date) => {
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
              <h1 className="text-2xl font-bold">LOT 추적 (Traceability)</h1>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => router.push("/haccp")} variant="outline">
                HACCP
              </Button>
              <Button onClick={() => router.push("/operate")} variant="outline">
                모니터링
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* 검색 섹션 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>LOT 검색</CardTitle>
            <CardDescription>LOT 번호 또는 제품명으로 검색</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="LOT 번호 또는 제품명 입력..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch}>검색</Button>
              <Button variant="outline" onClick={loadData}>
                전체 보기
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* LOT 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>LOT 목록</CardTitle>
            <CardDescription>전체 {lots.length}개 LOT</CardDescription>
          </CardHeader>
          <CardContent>
            {lots.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">검색 결과가 없습니다.</p>
                <Button onClick={loadData} variant="outline">
                  전체 LOT 보기
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>LOT 번호</TableHead>
                    <TableHead>제품명</TableHead>
                    <TableHead>제조일자</TableHead>
                    <TableHead>수량</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lots.map((lot) => (
                    <TableRow key={lot.id}>
                      <TableCell className="font-mono font-medium">
                        {lot.lotNumber}
                      </TableCell>
                      <TableCell className="font-medium">{lot.productName}</TableCell>
                      <TableCell>{formatDate(lot.manufacturingDate)}</TableCell>
                      <TableCell>
                        {lot.quantity} {lot.unit}
                      </TableCell>
                      <TableCell>{getStatusBadge(lot.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewDetails(lot)}
                          >
                            상세
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTrace(lot, "backward")}
                          >
                            역추적
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTrace(lot, "forward")}
                          >
                            정추적
                          </Button>
                          {lot.status !== "RECALLED" && lot.status !== "DISPOSED" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRecall(lot)}
                            >
                              리콜
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

      {/* LOT 상세 정보 다이얼로그 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>LOT 상세 정보</DialogTitle>
            <DialogDescription>LOT 번호: {selectedLOT?.lotNumber}</DialogDescription>
          </DialogHeader>
          {selectedLOT && (
            <div className="space-y-4 py-4">
              {/* 기본 정보 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">제품명</label>
                  <p className="text-sm mt-1">{selectedLOT.productName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">제품 ID</label>
                  <p className="text-sm mt-1 font-mono">{selectedLOT.productId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">제조일자</label>
                  <p className="text-sm mt-1">{formatDate(selectedLOT.manufacturingDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">유효기간</label>
                  <p className="text-sm mt-1">
                    {selectedLOT.expiryDate ? formatDate(selectedLOT.expiryDate) : "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">수량</label>
                  <p className="text-sm mt-1">
                    {selectedLOT.quantity} {selectedLOT.unit}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">상태</label>
                  <div className="mt-1">{getStatusBadge(selectedLOT.status)}</div>
                </div>
              </div>

              {/* 원료 LOT */}
              {selectedLOT.parentLots && selectedLOT.parentLots.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-2">
                    원료 LOT
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedLOT.parentLots.map((parentLot, idx) => (
                      <Badge key={idx} variant="outline" className="font-mono">
                        {parentLot}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* 파생 제품 LOT */}
              {selectedLOT.childLots && selectedLOT.childLots.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-2">
                    파생 제품 LOT
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedLOT.childLots.map((childLot, idx) => (
                      <Badge key={idx} variant="outline" className="font-mono">
                        {childLot}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* 추적 기록 */}
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">
                  추적 기록
                </label>
                {selectedLOT.traceabilityRecords.length === 0 ? (
                  <p className="text-sm text-gray-500">추적 기록이 없습니다.</p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {selectedLOT.traceabilityRecords.map((record, idx) => (
                      <div key={idx} className="border rounded-md p-3 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{record.activityName}</span>
                          <Badge variant="outline" className="text-xs">
                            {record.eventType}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>시간: {formatDateTime(record.timestamp)}</p>
                          <p>위치: {record.location}</p>
                          <p>작업자: {record.operator}</p>
                          {record.inputMaterials && record.inputMaterials.length > 0 && (
                            <p>
                              원료:{" "}
                              {record.inputMaterials
                                .map((m) => `${m.materialName} (${m.lotNumber})`)
                                .join(", ")}
                            </p>
                          )}
                          {record.equipment && record.equipment.length > 0 && (
                            <p>장비: {record.equipment.join(", ")}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetailDialogOpen(false)}>닫기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 추적 결과 다이얼로그 */}
      <Dialog open={traceDialogOpen} onOpenChange={setTraceDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {traceMode === "forward" ? "정추적 (Forward Trace)" : "역추적 (Backward Trace)"}
            </DialogTitle>
            <DialogDescription>
              {selectedLOT?.lotNumber} - {selectedLOT?.productName}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              {traceMode === "forward"
                ? "이 LOT에서 파생된 모든 제품을 추적합니다. (원료 → 최종 제품)"
                : "이 LOT를 만드는데 사용된 모든 원료를 추적합니다. (최종 제품 → 원료)"}
            </p>

            {tracedLOTs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">추적 결과가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tracedLOTs.map((lot, idx) => (
                  <div key={idx} className="border rounded-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-mono font-medium">{lot.lotNumber}</p>
                        <p className="text-sm text-gray-600">{lot.productName}</p>
                      </div>
                      {getStatusBadge(lot.status)}
                    </div>
                    <div className="text-xs text-gray-600 grid grid-cols-2 gap-2">
                      <p>제조일: {formatDate(lot.manufacturingDate)}</p>
                      <p>
                        수량: {lot.quantity} {lot.unit}
                      </p>
                      <p>프로세스: {lot.processInstanceId.substring(0, 8)}...</p>
                      {lot.expiryDate && <p>유효기간: {formatDate(lot.expiryDate)}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-xs text-blue-900">
                총 {tracedLOTs.length}개의 LOT가 검색되었습니다.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setTraceDialogOpen(false)}>닫기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
