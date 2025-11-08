/**
 * HACCP CCP 관리 서비스
 * 식품 공정의 중요관리점(Critical Control Point) 관리 및 검증
 */

import { CCPCheckpoint, CCPCheckResult, CriticalLimit, Measurement, Deviation } from "@/types";
import { v4 as uuidv4 } from "uuid";

export class HACCPService {
  private ccpCheckpoints: Map<string, CCPCheckpoint> = new Map();
  private checkResults: Map<string, CCPCheckResult> = new Map();

  /**
   * CCP 체크포인트 생성
   */
  createCCPCheckpoint(
    processInstanceId: string,
    activityId: string,
    ccpData: Partial<CCPCheckpoint>
  ): CCPCheckpoint {
    const checkpoint: CCPCheckpoint = {
      id: uuidv4(),
      code: ccpData.code || `CCP-${this.ccpCheckpoints.size + 1}`,
      name: ccpData.name || "중요관리점",
      description: ccpData.description || "",
      processInstanceId,
      activityId,
      hazardType: ccpData.hazardType || "BIOLOGICAL",
      criticalLimits: ccpData.criticalLimits || [],
      monitoringProcedure: ccpData.monitoringProcedure || {
        what: "",
        how: "",
        frequency: "",
        who: "",
        autoMonitoring: false,
      },
      correctiveActions: ccpData.correctiveActions || [],
      recordKeeping: ccpData.recordKeeping || {
        documentName: "",
        retentionPeriod: 365,
        location: "",
        responsible: "",
      },
      status: "PENDING",
    };

    this.ccpCheckpoints.set(checkpoint.id, checkpoint);
    return checkpoint;
  }

  /**
   * CCP 체크포인트 조회
   */
  getCCPCheckpoint(id: string): CCPCheckpoint | undefined {
    return this.ccpCheckpoints.get(id);
  }

  /**
   * 프로세스 인스턴스의 모든 CCP 조회
   */
  getCCPCheckpointsByProcess(processInstanceId: string): CCPCheckpoint[] {
    return Array.from(this.ccpCheckpoints.values()).filter(
      (ccp) => ccp.processInstanceId === processInstanceId
    );
  }

  /**
   * CCP 체크 시작
   */
  startCCPCheck(ccpId: string, userId: string): CCPCheckpoint | null {
    const checkpoint = this.ccpCheckpoints.get(ccpId);
    if (!checkpoint) return null;

    checkpoint.status = "IN_PROGRESS";
    checkpoint.checkTime = new Date();
    checkpoint.checkedBy = userId;

    this.ccpCheckpoints.set(ccpId, checkpoint);
    return checkpoint;
  }

  /**
   * 측정값 자동 검증
   */
  validateMeasurement(
    ccpId: string,
    measurements: Measurement[]
  ): { passed: boolean; deviations: Deviation[] } {
    const checkpoint = this.ccpCheckpoints.get(ccpId);
    if (!checkpoint) {
      throw new Error("CCP 체크포인트를 찾을 수 없습니다.");
    }

    const deviations: Deviation[] = [];

    for (const measurement of measurements) {
      const limit = checkpoint.criticalLimits.find(
        (cl) => cl.parameter === measurement.parameter
      );

      if (!limit) continue;

      let withinLimit = true;
      let expectedValue = limit.targetValue || 0;
      let deviation = 0;

      switch (limit.operator) {
        case "EQUALS":
          if (limit.targetValue !== undefined) {
            withinLimit =
              Math.abs(measurement.value - limit.targetValue) <=
              (limit.tolerance || 0);
            deviation = measurement.value - limit.targetValue;
          }
          break;

        case "GREATER_THAN":
          if (limit.minValue !== undefined) {
            withinLimit = measurement.value > limit.minValue;
            expectedValue = limit.minValue;
            deviation = measurement.value - limit.minValue;
          }
          break;

        case "LESS_THAN":
          if (limit.maxValue !== undefined) {
            withinLimit = measurement.value < limit.maxValue;
            expectedValue = limit.maxValue;
            deviation = measurement.value - limit.maxValue;
          }
          break;

        case "BETWEEN":
          if (limit.minValue !== undefined && limit.maxValue !== undefined) {
            withinLimit =
              measurement.value >= limit.minValue &&
              measurement.value <= limit.maxValue;
            expectedValue = (limit.minValue + limit.maxValue) / 2;
            if (measurement.value < limit.minValue) {
              deviation = measurement.value - limit.minValue;
            } else if (measurement.value > limit.maxValue) {
              deviation = measurement.value - limit.maxValue;
            }
          }
          break;
      }

      measurement.withinLimit = withinLimit;

      if (!withinLimit) {
        const absoluteDeviation = Math.abs(deviation);
        let severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";

        if (absoluteDeviation > expectedValue * 0.2) {
          severity = "CRITICAL";
        } else if (absoluteDeviation > expectedValue * 0.1) {
          severity = "HIGH";
        } else if (absoluteDeviation > expectedValue * 0.05) {
          severity = "MEDIUM";
        }

        deviations.push({
          parameter: measurement.parameter,
          expectedValue,
          actualValue: measurement.value,
          difference: deviation,
          severity,
          description: `${measurement.parameter}가 한계기준을 벗어났습니다: ${measurement.value}${measurement.unit} (기준: ${expectedValue}${limit.unit})`,
        });
      }
    }

    return {
      passed: deviations.length === 0,
      deviations,
    };
  }

  /**
   * CCP 체크 완료
   */
  completeCCPCheck(
    ccpId: string,
    measurements: Measurement[],
    userId: string,
    notes?: string
  ): CCPCheckResult {
    const checkpoint = this.ccpCheckpoints.get(ccpId);
    if (!checkpoint) {
      throw new Error("CCP 체크포인트를 찾을 수 없습니다.");
    }

    // 측정값 검증
    const validation = this.validateMeasurement(ccpId, measurements);

    // 체크 결과 생성
    const result: CCPCheckResult = {
      id: uuidv4(),
      ccpId,
      checkTime: new Date(),
      measurements,
      passed: validation.passed,
      deviations: validation.deviations,
      verifiedBy: userId,
      notes,
    };

    // 일탈이 있는 경우 시정조치 필요
    if (!validation.passed) {
      checkpoint.status = "CORRECTIVE_ACTION";

      // 자동 시정조치 실행
      const autoActions = checkpoint.correctiveActions.filter((ca) => ca.automated);
      result.correctiveActionsTaken = autoActions.map((action) => {
        action.executedAt = new Date();
        action.executedBy = "SYSTEM";
        action.result = "자동 실행됨";
        return action.description;
      });
    } else {
      checkpoint.status = "PASSED";
    }

    checkpoint.result = result;
    this.ccpCheckpoints.set(ccpId, checkpoint);
    this.checkResults.set(result.id, result);

    return result;
  }

  /**
   * CCP 체크 실패 처리
   */
  failCCPCheck(ccpId: string, reason: string): CCPCheckpoint | null {
    const checkpoint = this.ccpCheckpoints.get(ccpId);
    if (!checkpoint) return null;

    checkpoint.status = "FAILED";

    const result: CCPCheckResult = {
      id: uuidv4(),
      ccpId,
      checkTime: new Date(),
      measurements: [],
      passed: false,
      notes: reason,
    };

    checkpoint.result = result;
    this.ccpCheckpoints.set(ccpId, checkpoint);
    this.checkResults.set(result.id, result);

    return checkpoint;
  }

  /**
   * 시정조치 실행
   */
  executeCorrectiveAction(
    ccpId: string,
    actionId: string,
    userId: string,
    result: string
  ): boolean {
    const checkpoint = this.ccpCheckpoints.get(ccpId);
    if (!checkpoint) return false;

    const action = checkpoint.correctiveActions.find((ca) => ca.id === actionId);
    if (!action) return false;

    action.executedAt = new Date();
    action.executedBy = userId;
    action.result = result;

    // 모든 시정조치가 완료되었는지 확인
    const allActionsCompleted = checkpoint.correctiveActions.every(
      (ca) => ca.executedAt !== undefined
    );

    if (allActionsCompleted) {
      checkpoint.status = "PASSED";
    }

    this.ccpCheckpoints.set(ccpId, checkpoint);
    return true;
  }

  /**
   * CCP 통계 조회
   */
  getCCPStatistics(processInstanceId?: string): {
    total: number;
    pending: number;
    inProgress: number;
    passed: number;
    failed: number;
    correctiveAction: number;
    passRate: number;
  } {
    let checkpoints = Array.from(this.ccpCheckpoints.values());

    if (processInstanceId) {
      checkpoints = checkpoints.filter(
        (ccp) => ccp.processInstanceId === processInstanceId
      );
    }

    const total = checkpoints.length;
    const pending = checkpoints.filter((c) => c.status === "PENDING").length;
    const inProgress = checkpoints.filter((c) => c.status === "IN_PROGRESS").length;
    const passed = checkpoints.filter((c) => c.status === "PASSED").length;
    const failed = checkpoints.filter((c) => c.status === "FAILED").length;
    const correctiveAction = checkpoints.filter(
      (c) => c.status === "CORRECTIVE_ACTION"
    ).length;

    const passRate = total > 0 ? (passed / (passed + failed)) * 100 : 0;

    return {
      total,
      pending,
      inProgress,
      passed,
      failed,
      correctiveAction,
      passRate,
    };
  }

  /**
   * 모든 데이터 초기화
   */
  clear(): void {
    this.ccpCheckpoints.clear();
    this.checkResults.clear();
  }
}
