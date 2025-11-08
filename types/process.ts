/**
 * BPMN 프로세스 관련 타입 정의
 * Camunda 스타일의 워크플로우 엔진 구현을 위한 타입
 */

// ==================== 기본 타입 ====================

export type ProcessStatus = "ACTIVE" | "SUSPENDED" | "COMPLETED" | "TERMINATED" | "FAILED";
export type TaskStatus = "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type EventType = "START" | "END" | "INTERMEDIATE" | "BOUNDARY";
export type GatewayType = "EXCLUSIVE" | "PARALLEL" | "INCLUSIVE" | "EVENT_BASED";

// ==================== 프로세스 정의 ====================

/**
 * BPMN 프로세스 정의
 */
export interface ProcessDefinition {
  id: string;
  key: string;
  name: string;
  version: number;
  bpmnXml: string;
  description?: string;
  category?: string;
  deploymentId?: string;
  deploymentTime?: Date;
  resourceName?: string;
  suspended: boolean;
  tenantId?: string;
  versionTag?: string;
  historyTimeToLive?: number;
  startableInTasklist: boolean;
}

/**
 * 프로세스 인스턴스
 */
export interface ProcessInstance {
  id: string;
  processDefinitionId: string;
  processDefinitionKey: string;
  processDefinitionName: string;
  businessKey?: string;
  status: ProcessStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  startUserId?: string;
  superProcessInstanceId?: string;
  rootProcessInstanceId?: string;
  tenantId?: string;
  suspended: boolean;
  variables: Record<string, ProcessVariable>;
  currentActivities: string[]; // 현재 실행 중인 액티비티 ID 목록
}

/**
 * 프로세스 변수
 */
export interface ProcessVariable {
  name: string;
  type: "String" | "Integer" | "Long" | "Double" | "Boolean" | "Date" | "Json" | "File";
  value: any;
  scope: "PROCESS" | "TASK" | "LOCAL";
  processInstanceId?: string;
  taskId?: string;
}

// ==================== 태스크 ====================

/**
 * 휴먼 태스크
 */
export interface Task {
  id: string;
  name: string;
  description?: string;
  processInstanceId: string;
  processDefinitionId: string;
  taskDefinitionKey: string;
  status: TaskStatus;
  assignee?: string;
  owner?: string;
  candidateUsers?: string[];
  candidateGroups?: string[];
  createTime: Date;
  dueDate?: Date;
  followUpDate?: string;
  priority: number;
  formKey?: string;
  variables: Record<string, ProcessVariable>;
  tenantId?: string;
  suspended: boolean;
}

/**
 * 태스크 할당 정보
 */
export interface TaskAssignment {
  taskId: string;
  userId?: string;
  groupId?: string;
  assignmentType: "USER" | "GROUP" | "CANDIDATE_USER" | "CANDIDATE_GROUP";
}

// ==================== 실행 정보 ====================

/**
 * 액티비티 인스턴스
 */
export interface ActivityInstance {
  id: string;
  activityId: string;
  activityName: string;
  activityType: string;
  processInstanceId: string;
  processDefinitionId: string;
  executionId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  incidentId?: string;
  incident: boolean;
  childActivityInstances?: ActivityInstance[];
  childTransitionInstances?: TransitionInstance[];
}

/**
 * 트랜지션 인스턴스 (sequence flow)
 */
export interface TransitionInstance {
  id: string;
  activityId: string;
  activityName: string;
  activityType: string;
  processInstanceId: string;
  processDefinitionId: string;
  executionId: string;
  targetActivityId: string;
  timestamp: Date;
}

/**
 * 실행 이벤트
 */
export interface ExecutionEvent {
  id: string;
  type: "PROCESS_STARTED" | "PROCESS_COMPLETED" | "PROCESS_TERMINATED" |
        "TASK_CREATED" | "TASK_ASSIGNED" | "TASK_COMPLETED" |
        "ACTIVITY_STARTED" | "ACTIVITY_COMPLETED" | "SEQUENCE_FLOW_TAKEN";
  processInstanceId: string;
  activityId?: string;
  activityName?: string;
  taskId?: string;
  userId?: string;
  timestamp: Date;
  variables?: Record<string, any>;
  message?: string;
}

// ==================== 인시던트 ====================

/**
 * 인시던트 (오류 상황)
 */
export interface Incident {
  id: string;
  incidentType: "failedJob" | "failedExternalTask" | "failedCondition";
  incidentMessage: string;
  processInstanceId: string;
  processDefinitionId: string;
  activityId?: string;
  executionId?: string;
  causeIncidentId?: string;
  rootCauseIncidentId?: string;
  configuration?: string;
  tenantId?: string;
  incidentTimestamp: Date;
  resolved: boolean;
  resolvedTimestamp?: Date;
}

// ==================== 히스토리 ====================

/**
 * 히스토리 프로세스 인스턴스
 */
export interface HistoricProcessInstance {
  id: string;
  processDefinitionId: string;
  processDefinitionKey: string;
  processDefinitionName: string;
  processDefinitionVersion: number;
  businessKey?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  startUserId?: string;
  startActivityId?: string;
  endActivityId?: string;
  superProcessInstanceId?: string;
  rootProcessInstanceId?: string;
  tenantId?: string;
  state: "ACTIVE" | "COMPLETED" | "EXTERNALLY_TERMINATED" | "INTERNALLY_TERMINATED";
  deleteReason?: string;
}

/**
 * 히스토리 태스크 인스턴스
 */
export interface HistoricTaskInstance {
  id: string;
  taskDefinitionKey: string;
  processDefinitionId: string;
  processInstanceId: string;
  name: string;
  description?: string;
  assignee?: string;
  owner?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  deleteReason?: string;
  priority: number;
  dueDate?: Date;
  parentTaskId?: string;
  followUpDate?: Date;
  tenantId?: string;
}

// ==================== 배포 ====================

/**
 * 배포 정보
 */
export interface Deployment {
  id: string;
  name: string;
  deploymentTime: Date;
  source?: string;
  tenantId?: string;
  resources: DeploymentResource[];
}

/**
 * 배포 리소스
 */
export interface DeploymentResource {
  id: string;
  name: string;
  deploymentId: string;
  type: "BPMN" | "DMN" | "CMMN" | "FORM";
  content: string | Buffer;
}
