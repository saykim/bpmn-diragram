/**
 * 프로세스 인스턴스 관리 서비스
 * Camunda ProcessInstanceService 스타일
 */

import { ProcessInstance, ProcessDefinition, ProcessStatus, ExecutionEvent } from "@/types";
import { v4 as uuidv4 } from "uuid";

export class ProcessInstanceService {
  private instances: Map<string, ProcessInstance> = new Map();
  private events: ExecutionEvent[] = [];

  /**
   * 프로세스 인스턴스 생성
   */
  createInstance(
    processDefinition: ProcessDefinition,
    businessKey?: string,
    variables?: Record<string, any>,
    startUserId?: string
  ): ProcessInstance {
    const instance: ProcessInstance = {
      id: uuidv4(),
      processDefinitionId: processDefinition.id,
      processDefinitionKey: processDefinition.key,
      processDefinitionName: processDefinition.name,
      businessKey,
      status: "ACTIVE",
      startTime: new Date(),
      startUserId,
      suspended: false,
      variables: this.convertVariables(variables || {}),
      currentActivities: [],
    };

    this.instances.set(instance.id, instance);

    // 프로세스 시작 이벤트 발생
    this.addEvent({
      id: uuidv4(),
      type: "PROCESS_STARTED",
      processInstanceId: instance.id,
      userId: startUserId,
      timestamp: new Date(),
      variables,
    });

    return instance;
  }

  /**
   * 프로세스 인스턴스 조회
   */
  getInstance(instanceId: string): ProcessInstance | undefined {
    return this.instances.get(instanceId);
  }

  /**
   * 모든 프로세스 인스턴스 조회
   */
  getAllInstances(filter?: {
    status?: ProcessStatus;
    processDefinitionKey?: string;
    businessKey?: string;
  }): ProcessInstance[] {
    let instances = Array.from(this.instances.values());

    if (filter) {
      if (filter.status) {
        instances = instances.filter((i) => i.status === filter.status);
      }
      if (filter.processDefinitionKey) {
        instances = instances.filter(
          (i) => i.processDefinitionKey === filter.processDefinitionKey
        );
      }
      if (filter.businessKey) {
        instances = instances.filter((i) => i.businessKey === filter.businessKey);
      }
    }

    return instances;
  }

  /**
   * 프로세스 인스턴스 업데이트
   */
  updateInstance(instanceId: string, updates: Partial<ProcessInstance>): ProcessInstance | null {
    const instance = this.instances.get(instanceId);
    if (!instance) return null;

    const updated = { ...instance, ...updates };
    this.instances.set(instanceId, updated);

    return updated;
  }

  /**
   * 프로세스 인스턴스 중단
   */
  suspendInstance(instanceId: string): ProcessInstance | null {
    const instance = this.instances.get(instanceId);
    if (!instance) return null;

    instance.status = "SUSPENDED";
    instance.suspended = true;
    this.instances.set(instanceId, instance);

    return instance;
  }

  /**
   * 프로세스 인스턴스 재개
   */
  resumeInstance(instanceId: string): ProcessInstance | null {
    const instance = this.instances.get(instanceId);
    if (!instance || instance.status !== "SUSPENDED") return null;

    instance.status = "ACTIVE";
    instance.suspended = false;
    this.instances.set(instanceId, instance);

    return instance;
  }

  /**
   * 프로세스 인스턴스 종료
   */
  completeInstance(instanceId: string): ProcessInstance | null {
    const instance = this.instances.get(instanceId);
    if (!instance) return null;

    instance.status = "COMPLETED";
    instance.endTime = new Date();
    instance.duration = instance.endTime.getTime() - instance.startTime.getTime();
    this.instances.set(instanceId, instance);

    // 프로세스 완료 이벤트 발생
    this.addEvent({
      id: uuidv4(),
      type: "PROCESS_COMPLETED",
      processInstanceId: instance.id,
      timestamp: new Date(),
    });

    return instance;
  }

  /**
   * 프로세스 인스턴스 강제 종료
   */
  terminateInstance(instanceId: string, reason?: string): ProcessInstance | null {
    const instance = this.instances.get(instanceId);
    if (!instance) return null;

    instance.status = "TERMINATED";
    instance.endTime = new Date();
    instance.duration = instance.endTime.getTime() - instance.startTime.getTime();
    this.instances.set(instanceId, instance);

    // 프로세스 종료 이벤트 발생
    this.addEvent({
      id: uuidv4(),
      type: "PROCESS_TERMINATED",
      processInstanceId: instance.id,
      timestamp: new Date(),
      message: reason,
    });

    return instance;
  }

  /**
   * 프로세스 인스턴스 삭제
   */
  deleteInstance(instanceId: string): boolean {
    return this.instances.delete(instanceId);
  }

  /**
   * 프로세스 변수 설정
   */
  setVariable(
    instanceId: string,
    name: string,
    value: any,
    type: string = "String"
  ): boolean {
    const instance = this.instances.get(instanceId);
    if (!instance) return false;

    instance.variables[name] = {
      name,
      type: type as any,
      value,
      scope: "PROCESS",
      processInstanceId: instanceId,
    };

    this.instances.set(instanceId, instance);
    return true;
  }

  /**
   * 프로세스 변수 조회
   */
  getVariable(instanceId: string, name: string): any {
    const instance = this.instances.get(instanceId);
    return instance?.variables[name]?.value;
  }

  /**
   * 모든 프로세스 변수 조회
   */
  getVariables(instanceId: string): Record<string, any> {
    const instance = this.instances.get(instanceId);
    if (!instance) return {};

    const result: Record<string, any> = {};
    for (const [key, variable] of Object.entries(instance.variables)) {
      result[key] = variable.value;
    }
    return result;
  }

  /**
   * 현재 액티비티 추가
   */
  addCurrentActivity(instanceId: string, activityId: string): void {
    const instance = this.instances.get(instanceId);
    if (!instance) return;

    if (!instance.currentActivities.includes(activityId)) {
      instance.currentActivities.push(activityId);
      this.instances.set(instanceId, instance);
    }
  }

  /**
   * 현재 액티비티 제거
   */
  removeCurrentActivity(instanceId: string, activityId: string): void {
    const instance = this.instances.get(instanceId);
    if (!instance) return;

    instance.currentActivities = instance.currentActivities.filter(
      (id) => id !== activityId
    );
    this.instances.set(instanceId, instance);
  }

  /**
   * 이벤트 추가
   */
  private addEvent(event: ExecutionEvent): void {
    this.events.push(event);
  }

  /**
   * 이벤트 조회
   */
  getEvents(instanceId?: string): ExecutionEvent[] {
    if (instanceId) {
      return this.events.filter((e) => e.processInstanceId === instanceId);
    }
    return this.events;
  }

  /**
   * 변수 변환
   */
  private convertVariables(variables: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(variables)) {
      result[key] = {
        name: key,
        type: this.detectType(value),
        value,
        scope: "PROCESS",
      };
    }
    return result;
  }

  /**
   * 타입 감지
   */
  private detectType(value: any): "String" | "Integer" | "Long" | "Double" | "Boolean" | "Date" | "Json" | "File" {
    if (typeof value === "string") return "String";
    if (typeof value === "number") {
      return Number.isInteger(value) ? "Integer" : "Double";
    }
    if (typeof value === "boolean") return "Boolean";
    if (value instanceof Date) return "Date";
    if (typeof value === "object") return "Json";
    return "String";
  }

  /**
   * 통계 조회
   */
  getStatistics(): {
    total: number;
    active: number;
    completed: number;
    suspended: number;
    terminated: number;
    failed: number;
  } {
    const instances = Array.from(this.instances.values());
    return {
      total: instances.length,
      active: instances.filter((i) => i.status === "ACTIVE").length,
      completed: instances.filter((i) => i.status === "COMPLETED").length,
      suspended: instances.filter((i) => i.status === "SUSPENDED").length,
      terminated: instances.filter((i) => i.status === "TERMINATED").length,
      failed: instances.filter((i) => i.status === "FAILED").length,
    };
  }

  /**
   * 모든 데이터 초기화
   */
  clear(): void {
    this.instances.clear();
    this.events = [];
  }
}
