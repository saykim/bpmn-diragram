/**
 * 프로세스 엔진 메인 클래스
 * Camunda ProcessEngine 스타일의 API 제공
 */

import { ProcessDefinition } from "@/types";
import { ProcessInstanceService } from "./process-instance-service";
import { TaskService } from "./task-service";
import { v4 as uuidv4 } from "uuid";

export class ProcessEngine {
  private processDefinitions: Map<string, ProcessDefinition> = new Map();
  private processInstanceService: ProcessInstanceService;
  private taskService: TaskService;

  constructor() {
    this.processInstanceService = new ProcessInstanceService();
    this.taskService = new TaskService();
  }

  // ==================== 프로세스 정의 관리 ====================

  /**
   * 프로세스 정의 배포
   */
  deploy(bpmnXml: string, name: string, key: string): ProcessDefinition {
    const processDefinition: ProcessDefinition = {
      id: uuidv4(),
      key,
      name,
      version: this.getNextVersion(key),
      bpmnXml,
      deploymentTime: new Date(),
      suspended: false,
      startableInTasklist: true,
    };

    this.processDefinitions.set(processDefinition.id, processDefinition);

    return processDefinition;
  }

  /**
   * 프로세스 정의 조회
   */
  getProcessDefinition(id: string): ProcessDefinition | undefined {
    return this.processDefinitions.get(id);
  }

  /**
   * 키로 최신 프로세스 정의 조회
   */
  getLatestProcessDefinitionByKey(key: string): ProcessDefinition | undefined {
    const definitions = Array.from(this.processDefinitions.values())
      .filter((pd) => pd.key === key)
      .sort((a, b) => b.version - a.version);

    return definitions[0];
  }

  /**
   * 모든 프로세스 정의 조회
   */
  getAllProcessDefinitions(): ProcessDefinition[] {
    return Array.from(this.processDefinitions.values());
  }

  /**
   * 프로세스 정의 삭제
   */
  deleteProcessDefinition(id: string): boolean {
    return this.processDefinitions.delete(id);
  }

  // ==================== 프로세스 인스턴스 서비스 ====================

  getRuntimeService() {
    return this.processInstanceService;
  }

  // ==================== 태스크 서비스 ====================

  getTaskService() {
    return this.taskService;
  }

  // ==================== 편의 메서드 ====================

  /**
   * 프로세스 시작
   */
  async startProcess(
    processDefinitionKey: string,
    businessKey?: string,
    variables?: Record<string, any>,
    userId?: string
  ) {
    const processDefinition = this.getLatestProcessDefinitionByKey(processDefinitionKey);
    if (!processDefinition) {
      throw new Error(`프로세스 정의를 찾을 수 없습니다: ${processDefinitionKey}`);
    }

    const instance = this.processInstanceService.createInstance(
      processDefinition,
      businessKey,
      variables,
      userId
    );

    return instance;
  }

  /**
   * 통계 조회
   */
  getStatistics() {
    return {
      processDefinitions: this.processDefinitions.size,
      processInstances: this.processInstanceService.getStatistics(),
      tasks: this.taskService.getStatistics(),
    };
  }

  /**
   * 다음 버전 번호 가져오기
   */
  private getNextVersion(key: string): number {
    const definitions = Array.from(this.processDefinitions.values())
      .filter((pd) => pd.key === key)
      .map((pd) => pd.version);

    return definitions.length > 0 ? Math.max(...definitions) + 1 : 1;
  }

  /**
   * 모든 데이터 초기화
   */
  clear(): void {
    this.processDefinitions.clear();
    this.processInstanceService.clear();
    this.taskService.clear();
  }
}

// 싱글톤 인스턴스
let engineInstance: ProcessEngine | null = null;

export function getProcessEngine(): ProcessEngine {
  if (!engineInstance) {
    engineInstance = new ProcessEngine();
  }
  return engineInstance;
}
