/**
 * LOT 추적 서비스
 * 식품 트레이서빌리티 관리
 */

import { LOT, TraceabilityRecord, MaterialUsage, ProductOutput } from "@/types";
import { v4 as uuidv4 } from "uuid";

export class LOTTrackingService {
  private lots: Map<string, LOT> = new Map();
  private traceabilityRecords: Map<string, TraceabilityRecord> = new Map();

  /**
   * 새로운 LOT 생성
   */
  createLOT(
    productId: string,
    productName: string,
    processInstanceId: string,
    quantity: number,
    unit: string,
    manufacturingDate: Date = new Date(),
    expiryDate?: Date
  ): LOT {
    const lotNumber = this.generateLotNumber(productId, manufacturingDate);

    const lot: LOT = {
      id: uuidv4(),
      lotNumber,
      productId,
      productName,
      processInstanceId,
      manufacturingDate,
      expiryDate,
      quantity,
      unit,
      status: "IN_PROCESS",
      traceabilityRecords: [],
    };

    this.lots.set(lot.id, lot);
    return lot;
  }

  /**
   * LOT 번호 생성
   * 형식: YYYYMMDD-PRODUCT_ID-SEQUENCE
   */
  private generateLotNumber(productId: string, date: Date): string {
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const sequence = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `${dateStr}-${productId}-${sequence}`;
  }

  /**
   * LOT 조회
   */
  getLOT(lotId: string): LOT | undefined {
    return this.lots.get(lotId);
  }

  /**
   * LOT 번호로 조회
   */
  getLOTByNumber(lotNumber: string): LOT | undefined {
    return Array.from(this.lots.values()).find((lot) => lot.lotNumber === lotNumber);
  }

  /**
   * 모든 LOT 조회
   */
  getAllLOTs(): LOT[] {
    return Array.from(this.lots.values());
  }

  /**
   * 프로세스 인스턴스의 모든 LOT 조회
   */
  getLOTsByProcess(processInstanceId: string): LOT[] {
    return Array.from(this.lots.values()).filter(
      (lot) => lot.processInstanceId === processInstanceId
    );
  }

  /**
   * 추적 기록 추가
   */
  addTraceabilityRecord(
    lotId: string,
    record: Omit<TraceabilityRecord, "id" | "lotId" | "timestamp">
  ): TraceabilityRecord {
    const lot = this.lots.get(lotId);
    if (!lot) {
      throw new Error("LOT를 찾을 수 없습니다.");
    }

    const fullRecord: TraceabilityRecord = {
      id: uuidv4(),
      lotId,
      timestamp: new Date(),
      ...record,
    };

    lot.traceabilityRecords.push(fullRecord);
    this.lots.set(lotId, lot);
    this.traceabilityRecords.set(fullRecord.id, fullRecord);

    return fullRecord;
  }

  /**
   * 원료 LOT 연결 (Forward Traceability)
   */
  linkParentLOT(childLotId: string, parentLotNumber: string): boolean {
    const childLot = this.lots.get(childLotId);
    if (!childLot) return false;

    if (!childLot.parentLots) {
      childLot.parentLots = [];
    }

    if (!childLot.parentLots.includes(parentLotNumber)) {
      childLot.parentLots.push(parentLotNumber);
      this.lots.set(childLotId, childLot);
    }

    // 부모 LOT에도 역방향 연결
    const parentLot = this.getLOTByNumber(parentLotNumber);
    if (parentLot) {
      if (!parentLot.childLots) {
        parentLot.childLots = [];
      }
      if (!parentLot.childLots.includes(childLot.lotNumber)) {
        parentLot.childLots.push(childLot.lotNumber);
        this.lots.set(parentLot.id, parentLot);
      }
    }

    return true;
  }

  /**
   * 순추적 (Forward Tracing): 원료 → 제품
   * 특정 원료 LOT이 어떤 제품에 사용되었는지 추적
   */
  forwardTrace(lotNumber: string): LOT[] {
    const lot = this.getLOTByNumber(lotNumber);
    if (!lot) return [];

    const result: LOT[] = [lot];
    const visited = new Set<string>([lotNumber]);

    const traverse = (currentLotNumber: string) => {
      const currentLot = this.getLOTByNumber(currentLotNumber);
      if (!currentLot || !currentLot.childLots) return;

      for (const childLotNumber of currentLot.childLots) {
        if (!visited.has(childLotNumber)) {
          visited.add(childLotNumber);
          const childLot = this.getLOTByNumber(childLotNumber);
          if (childLot) {
            result.push(childLot);
            traverse(childLotNumber);
          }
        }
      }
    };

    traverse(lotNumber);
    return result;
  }

  /**
   * 역추적 (Backward Tracing): 제품 → 원료
   * 특정 제품이 어떤 원료로 만들어졌는지 추적
   */
  backwardTrace(lotNumber: string): LOT[] {
    const lot = this.getLOTByNumber(lotNumber);
    if (!lot) return [];

    const result: LOT[] = [lot];
    const visited = new Set<string>([lotNumber]);

    const traverse = (currentLotNumber: string) => {
      const currentLot = this.getLOTByNumber(currentLotNumber);
      if (!currentLot || !currentLot.parentLots) return;

      for (const parentLotNumber of currentLot.parentLots) {
        if (!visited.has(parentLotNumber)) {
          visited.add(parentLotNumber);
          const parentLot = this.getLOTByNumber(parentLotNumber);
          if (parentLot) {
            result.push(parentLot);
            traverse(parentLotNumber);
          }
        }
      }
    };

    traverse(lotNumber);
    return result;
  }

  /**
   * 완전 추적 경로 (Full Trace Path)
   * 원료부터 최종 제품까지 전체 경로
   */
  getFullTracePath(lotNumber: string): {
    backward: LOT[];
    current: LOT | undefined;
    forward: LOT[];
  } {
    const current = this.getLOTByNumber(lotNumber);
    if (!current) {
      return { backward: [], current: undefined, forward: [] };
    }

    const backward = this.backwardTrace(lotNumber).filter(
      (lot) => lot.lotNumber !== lotNumber
    );
    const forward = this.forwardTrace(lotNumber).filter(
      (lot) => lot.lotNumber !== lotNumber
    );

    return { backward, current, forward };
  }

  /**
   * LOT 상태 변경
   */
  updateLOTStatus(
    lotId: string,
    status: "IN_PROCESS" | "QUARANTINE" | "RELEASED" | "RECALLED" | "DISPOSED",
    reason?: string
  ): LOT | null {
    const lot = this.lots.get(lotId);
    if (!lot) return null;

    lot.status = status;

    // 상태 변경 기록 추가
    this.addTraceabilityRecord(lotId, {
      activityId: "STATUS_CHANGE",
      activityName: "LOT 상태 변경",
      eventType: "PROCESSED",
      location: "SYSTEM",
      operator: "SYSTEM",
      parameters: {
        previousStatus: lot.status,
        newStatus: status,
        reason,
      },
    });

    this.lots.set(lotId, lot);
    return lot;
  }

  /**
   * LOT 리콜
   */
  recallLOT(lotNumber: string, reason: string): {
    recalledLOTs: LOT[];
    affectedLOTs: LOT[];
  } {
    // 순추적으로 영향받는 모든 제품 찾기
    const affectedLOTs = this.forwardTrace(lotNumber);

    // 모든 영향받는 LOT를 리콜 상태로 변경
    const recalledLOTs: LOT[] = [];
    for (const lot of affectedLOTs) {
      const recalled = this.updateLOTStatus(lot.id, "RECALLED", reason);
      if (recalled) {
        recalledLOTs.push(recalled);
      }
    }

    return { recalledLOTs, affectedLOTs };
  }

  /**
   * 원료 사용 기록
   */
  recordMaterialUsage(
    lotId: string,
    activityId: string,
    activityName: string,
    materials: MaterialUsage[],
    location: string,
    operator: string
  ): TraceabilityRecord {
    return this.addTraceabilityRecord(lotId, {
      activityId,
      activityName,
      eventType: "PROCESSED",
      location,
      operator,
      inputMaterials: materials,
    });
  }

  /**
   * 제품 생산 기록
   */
  recordProductOutput(
    lotId: string,
    activityId: string,
    activityName: string,
    products: ProductOutput[],
    location: string,
    operator: string
  ): TraceabilityRecord {
    return this.addTraceabilityRecord(lotId, {
      activityId,
      activityName,
      eventType: "PROCESSED",
      location,
      operator,
      outputProducts: products,
    });
  }

  /**
   * LOT 통계
   */
  getLOTStatistics(): {
    total: number;
    inProcess: number;
    quarantine: number;
    released: number;
    recalled: number;
    disposed: number;
  } {
    const lots = Array.from(this.lots.values());

    return {
      total: lots.length,
      inProcess: lots.filter((l) => l.status === "IN_PROCESS").length,
      quarantine: lots.filter((l) => l.status === "QUARANTINE").length,
      released: lots.filter((l) => l.status === "RELEASED").length,
      recalled: lots.filter((l) => l.status === "RECALLED").length,
      disposed: lots.filter((l) => l.status === "DISPOSED").length,
    };
  }

  /**
   * 모든 데이터 초기화
   */
  clear(): void {
    this.lots.clear();
    this.traceabilityRecords.clear();
  }
}
