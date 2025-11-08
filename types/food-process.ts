/**
 * 식품 공정 전용 타입 정의
 * HACCP, 품질관리, 트레이서빌리티 관련 타입
 */

// ==================== HACCP 관련 ====================

/**
 * 중요관리점 (Critical Control Point)
 */
export interface CCPCheckpoint {
  id: string;
  code: string; // CCP-1, CCP-2 등
  name: string;
  description: string;
  processInstanceId: string;
  activityId: string; // BPMN 액티비티 ID
  hazardType: HazardType;
  criticalLimits: CriticalLimit[];
  monitoringProcedure: MonitoringProcedure;
  correctiveActions: CorrectiveAction[];
  verificationProcedure?: VerificationProcedure;
  recordKeeping: RecordKeeping;
  status: "PENDING" | "IN_PROGRESS" | "PASSED" | "FAILED" | "CORRECTIVE_ACTION";
  checkTime?: Date;
  checkedBy?: string;
  result?: CCPCheckResult;
}

/**
 * 위해 요소 타입
 */
export type HazardType =
  | "BIOLOGICAL" // 생물학적 위해요소
  | "CHEMICAL" // 화학적 위해요소
  | "PHYSICAL"; // 물리적 위해요소

/**
 * 한계기준
 */
export interface CriticalLimit {
  parameter: string; // 온도, 시간, pH, 수분활성도 등
  unit: string;
  minValue?: number;
  maxValue?: number;
  targetValue?: number;
  tolerance?: number;
  operator: "EQUALS" | "GREATER_THAN" | "LESS_THAN" | "BETWEEN" | "NOT_EQUALS";
}

/**
 * 모니터링 절차
 */
export interface MonitoringProcedure {
  what: string; // 무엇을
  how: string; // 어떻게
  frequency: string; // 얼마나 자주
  who: string; // 누가
  autoMonitoring: boolean; // 자동 모니터링 여부
  sensorId?: string; // IoT 센서 ID
}

/**
 * 시정조치
 */
export interface CorrectiveAction {
  id: string;
  description: string;
  trigger: string; // 발동 조건
  procedure: string; // 조치 절차
  responsible: string; // 책임자
  automated: boolean; // 자동 실행 여부
  executedAt?: Date;
  executedBy?: string;
  result?: string;
}

/**
 * 검증 절차
 */
export interface VerificationProcedure {
  method: string;
  frequency: string;
  responsible: string;
}

/**
 * 기록 유지
 */
export interface RecordKeeping {
  documentName: string;
  retentionPeriod: number; // 보관 기간 (일)
  location: string;
  responsible: string;
}

/**
 * CCP 체크 결과
 */
export interface CCPCheckResult {
  id: string;
  ccpId: string;
  checkTime: Date;
  measurements: Measurement[];
  passed: boolean;
  deviations?: Deviation[];
  correctiveActionsTaken?: string[];
  verifiedBy?: string;
  notes?: string;
}

/**
 * 측정값
 */
export interface Measurement {
  parameter: string;
  value: number;
  unit: string;
  withinLimit: boolean;
  timestamp: Date;
  deviceId?: string;
}

/**
 * 일탈
 */
export interface Deviation {
  parameter: string;
  expectedValue: number;
  actualValue: number;
  difference: number;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
}

// ==================== 품질관리 ====================

/**
 * 품질 체크포인트
 */
export interface QualityCheckpoint {
  id: string;
  name: string;
  type: "INCOMING_INSPECTION" | "IN_PROCESS_INSPECTION" | "FINAL_INSPECTION";
  processInstanceId: string;
  activityId: string;
  inspectionCriteria: InspectionCriterion[];
  samplingPlan: SamplingPlan;
  status: "PENDING" | "IN_PROGRESS" | "PASSED" | "FAILED" | "CONDITIONAL_PASS";
  inspectedBy?: string;
  inspectionTime?: Date;
  result?: QualityInspectionResult;
}

/**
 * 검사 기준
 */
export interface InspectionCriterion {
  id: string;
  parameter: string;
  specification: string;
  method: string;
  acceptanceCriteria: string;
  criticalDefect: boolean;
}

/**
 * 샘플링 계획
 */
export interface SamplingPlan {
  method: "RANDOM" | "SYSTEMATIC" | "STRATIFIED";
  sampleSize: number;
  lotSize: number;
  acceptableQualityLevel: number; // AQL
  rejectionNumber: number;
}

/**
 * 품질 검사 결과
 */
export interface QualityInspectionResult {
  id: string;
  checkpointId: string;
  inspectionTime: Date;
  inspectedBy: string;
  samplesTested: number;
  samplesAccepted: number;
  samplesRejected: number;
  defectsFound: Defect[];
  overallJudgment: "ACCEPT" | "REJECT" | "CONDITIONAL";
  notes?: string;
  attachments?: string[];
}

/**
 * 결함
 */
export interface Defect {
  id: string;
  type: string;
  description: string;
  severity: "CRITICAL" | "MAJOR" | "MINOR";
  quantity: number;
  location?: string;
}

// ==================== 트레이서빌리티 ====================

/**
 * LOT 정보
 */
export interface LOT {
  id: string;
  lotNumber: string;
  productId: string;
  productName: string;
  processInstanceId: string;
  manufacturingDate: Date;
  expiryDate?: Date;
  quantity: number;
  unit: string;
  status: "IN_PROCESS" | "QUARANTINE" | "RELEASED" | "RECALLED" | "DISPOSED";
  parentLots?: string[]; // 원료 LOT
  childLots?: string[]; // 파생 제품 LOT
  traceabilityRecords: TraceabilityRecord[];
}

/**
 * 추적 기록
 */
export interface TraceabilityRecord {
  id: string;
  lotId: string;
  timestamp: Date;
  activityId: string;
  activityName: string;
  eventType: "RECEIVED" | "PROCESSED" | "INSPECTED" | "STORED" | "SHIPPED" | "REWORKED";
  location: string;
  operator: string;
  parameters?: Record<string, any>;
  inputMaterials?: MaterialUsage[];
  outputProducts?: ProductOutput[];
  equipment?: string[];
  environmentalConditions?: EnvironmentalCondition[];
}

/**
 * 원료 사용
 */
export interface MaterialUsage {
  materialId: string;
  materialName: string;
  lotNumber: string;
  quantity: number;
  unit: string;
  supplier?: string;
  receiptDate?: Date;
}

/**
 * 제품 산출
 */
export interface ProductOutput {
  productId: string;
  productName: string;
  lotNumber: string;
  quantity: number;
  unit: string;
}

/**
 * 환경 조건
 */
export interface EnvironmentalCondition {
  parameter: string;
  value: number;
  unit: string;
  timestamp: Date;
  withinSpec: boolean;
}

// ==================== 장비 관리 ====================

/**
 * 장비 정보
 */
export interface Equipment {
  id: string;
  code: string;
  name: string;
  type: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  installationDate?: Date;
  status: "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "OUT_OF_ORDER";
  location: string;
  specifications?: Record<string, any>;
  maintenanceSchedule?: MaintenanceSchedule[];
  calibrationHistory?: CalibrationRecord[];
}

/**
 * 유지보수 일정
 */
export interface MaintenanceSchedule {
  id: string;
  equipmentId: string;
  type: "PREVENTIVE" | "CORRECTIVE" | "PREDICTIVE";
  frequency: string;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate: Date;
  responsible: string;
  checklist?: string[];
}

/**
 * 교정 기록
 */
export interface CalibrationRecord {
  id: string;
  equipmentId: string;
  calibrationDate: Date;
  calibratedBy: string;
  standard: string;
  result: "PASS" | "FAIL";
  adjustmentsMade?: string;
  nextCalibrationDate: Date;
  certificateNumber?: string;
}

// ==================== 원자재 ====================

/**
 * 원자재
 */
export interface RawMaterial {
  id: string;
  code: string;
  name: string;
  category: string;
  supplier: string;
  specification: string;
  allergenInfo?: AllergenInfo;
  storageConditions: StorageConditions;
  shelfLife: number; // 일
  safetyDataSheet?: string;
}

/**
 * 알레르기 유발물질 정보
 */
export interface AllergenInfo {
  contains: string[];
  mayContain: string[];
  freeFrom: string[];
}

/**
 * 보관 조건
 */
export interface StorageConditions {
  temperature?: { min: number; max: number; unit: string };
  humidity?: { min: number; max: number };
  light?: "PROTECTED" | "NORMAL";
  specialRequirements?: string[];
}

// ==================== 식품 공정 프로세스 변수 ====================

/**
 * 식품 공정 전용 프로세스 변수
 */
export interface FoodProcessVariables {
  // 제품 정보
  productId?: string;
  productName?: string;
  batchSize?: number;
  lotNumber?: string;

  // 품질 정보
  qualityGrade?: "A" | "B" | "C" | "REJECT";
  ccpStatus?: Record<string, boolean>;

  // 생산 정보
  productionLineId?: string;
  shift?: string;
  operator?: string;

  // 환경 조건
  temperature?: number;
  humidity?: number;
  pressure?: number;

  // 기타
  [key: string]: any;
}
