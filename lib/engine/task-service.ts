/**
 * 태스크 관리 서비스
 * Camunda TaskService 스타일
 */

import { Task, TaskStatus, ExecutionEvent } from "@/types";
import { v4 as uuidv4 } from "uuid";

export class TaskService {
  private tasks: Map<string, Task> = new Map();
  private events: ExecutionEvent[] = [];

  /**
   * 태스크 생성
   */
  createTask(
    processInstanceId: string,
    processDefinitionId: string,
    taskDefinitionKey: string,
    name: string,
    description?: string
  ): Task {
    const task: Task = {
      id: uuidv4(),
      name,
      description,
      processInstanceId,
      processDefinitionId,
      taskDefinitionKey,
      status: "PENDING",
      createTime: new Date(),
      priority: 50,
      variables: {},
      suspended: false,
    };

    this.tasks.set(task.id, task);

    // 태스크 생성 이벤트
    this.addEvent({
      id: uuidv4(),
      type: "TASK_CREATED",
      processInstanceId,
      taskId: task.id,
      activityId: taskDefinitionKey,
      activityName: name,
      timestamp: new Date(),
    });

    return task;
  }

  /**
   * 태스크 조회
   */
  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * 모든 태스크 조회
   */
  getAllTasks(filter?: {
    status?: TaskStatus;
    assignee?: string;
    candidateUser?: string;
    candidateGroup?: string;
    processInstanceId?: string;
  }): Task[] {
    let tasks = Array.from(this.tasks.values());

    if (filter) {
      if (filter.status) {
        tasks = tasks.filter((t) => t.status === filter.status);
      }
      if (filter.assignee) {
        tasks = tasks.filter((t) => t.assignee === filter.assignee);
      }
      if (filter.candidateUser) {
        tasks = tasks.filter(
          (t) => t.candidateUsers?.includes(filter.candidateUser!)
        );
      }
      if (filter.candidateGroup) {
        tasks = tasks.filter(
          (t) => t.candidateGroups?.includes(filter.candidateGroup!)
        );
      }
      if (filter.processInstanceId) {
        tasks = tasks.filter(
          (t) => t.processInstanceId === filter.processInstanceId
        );
      }
    }

    return tasks;
  }

  /**
   * 태스크 할당
   */
  assignTask(taskId: string, userId: string): Task | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    task.assignee = userId;
    task.status = "ASSIGNED";
    this.tasks.set(taskId, task);

    // 태스크 할당 이벤트
    this.addEvent({
      id: uuidv4(),
      type: "TASK_ASSIGNED",
      processInstanceId: task.processInstanceId,
      taskId: task.id,
      activityId: task.taskDefinitionKey,
      activityName: task.name,
      userId,
      timestamp: new Date(),
    });

    return task;
  }

  /**
   * 태스크 클레임 (후보자 중 한 명이 가져가기)
   */
  claimTask(taskId: string, userId: string): Task | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    // 후보자인지 확인
    if (
      task.candidateUsers &&
      !task.candidateUsers.includes(userId) &&
      task.assignee !== userId
    ) {
      throw new Error("사용자가 이 태스크의 후보자가 아닙니다.");
    }

    return this.assignTask(taskId, userId);
  }

  /**
   * 태스크 할당 해제
   */
  unassignTask(taskId: string): Task | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    task.assignee = undefined;
    task.status = "PENDING";
    this.tasks.set(taskId, task);

    return task;
  }

  /**
   * 태스크 완료
   */
  completeTask(taskId: string, variables?: Record<string, any>): Task | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    if (!task.assignee) {
      throw new Error("할당되지 않은 태스크는 완료할 수 없습니다.");
    }

    task.status = "COMPLETED";

    // 변수 업데이트
    if (variables) {
      for (const [key, value] of Object.entries(variables)) {
        task.variables[key] = {
          name: key,
          type: this.detectType(value),
          value,
          scope: "TASK",
          taskId: task.id,
        };
      }
    }

    this.tasks.set(taskId, task);

    // 태스크 완료 이벤트
    this.addEvent({
      id: uuidv4(),
      type: "TASK_COMPLETED",
      processInstanceId: task.processInstanceId,
      taskId: task.id,
      activityId: task.taskDefinitionKey,
      activityName: task.name,
      userId: task.assignee,
      timestamp: new Date(),
      variables,
    });

    return task;
  }

  /**
   * 태스크 삭제
   */
  deleteTask(taskId: string): boolean {
    return this.tasks.delete(taskId);
  }

  /**
   * 후보 사용자 추가
   */
  addCandidateUser(taskId: string, userId: string): Task | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    if (!task.candidateUsers) {
      task.candidateUsers = [];
    }

    if (!task.candidateUsers.includes(userId)) {
      task.candidateUsers.push(userId);
      this.tasks.set(taskId, task);
    }

    return task;
  }

  /**
   * 후보 그룹 추가
   */
  addCandidateGroup(taskId: string, groupId: string): Task | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    if (!task.candidateGroups) {
      task.candidateGroups = [];
    }

    if (!task.candidateGroups.includes(groupId)) {
      task.candidateGroups.push(groupId);
      this.tasks.set(taskId, task);
    }

    return task;
  }

  /**
   * 태스크 변수 설정
   */
  setVariable(taskId: string, name: string, value: any): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    task.variables[name] = {
      name,
      type: this.detectType(value),
      value,
      scope: "TASK",
      taskId,
    };

    this.tasks.set(taskId, task);
    return true;
  }

  /**
   * 태스크 변수 조회
   */
  getVariable(taskId: string, name: string): any {
    const task = this.tasks.get(taskId);
    return task?.variables[name]?.value;
  }

  /**
   * 모든 태스크 변수 조회
   */
  getVariables(taskId: string): Record<string, any> {
    const task = this.tasks.get(taskId);
    if (!task) return {};

    const result: Record<string, any> = {};
    for (const [key, variable] of Object.entries(task.variables)) {
      result[key] = variable.value;
    }
    return result;
  }

  /**
   * 우선순위 설정
   */
  setPriority(taskId: string, priority: number): Task | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    task.priority = priority;
    this.tasks.set(taskId, task);

    return task;
  }

  /**
   * 마감일 설정
   */
  setDueDate(taskId: string, dueDate: Date): Task | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    task.dueDate = dueDate;
    this.tasks.set(taskId, task);

    return task;
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
  getEvents(taskId?: string): ExecutionEvent[] {
    if (taskId) {
      return this.events.filter((e) => e.taskId === taskId);
    }
    return this.events;
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
    pending: number;
    assigned: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  } {
    const tasks = Array.from(this.tasks.values());
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "PENDING").length,
      assigned: tasks.filter((t) => t.status === "ASSIGNED").length,
      inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
      completed: tasks.filter((t) => t.status === "COMPLETED").length,
      cancelled: tasks.filter((t) => t.status === "CANCELLED").length,
    };
  }

  /**
   * 모든 데이터 초기화
   */
  clear(): void {
    this.tasks.clear();
    this.events = [];
  }
}
