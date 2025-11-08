"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getProcessEngine } from "@/lib/engine/process-engine";
import { Task } from "@/types";

export default function TasklistPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<"all" | "my-tasks" | "unassigned">("all");
  const [currentUser] = useState("user-1"); // 임시 사용자 ID

  useEffect(() => {
    loadTasks();
  }, [filter]);

  const loadTasks = () => {
    const engine = getProcessEngine();
    const taskService = engine.getTaskService();

    let taskList: Task[] = [];

    switch (filter) {
      case "my-tasks":
        taskList = taskService.getAllTasks({ assignee: currentUser });
        break;
      case "unassigned":
        taskList = taskService.getAllTasks({ status: "PENDING" }).filter((t) => !t.assignee);
        break;
      default:
        taskList = taskService.getAllTasks();
    }

    setTasks(taskList);
  };

  const handleClaimTask = (taskId: string) => {
    const engine = getProcessEngine();
    const taskService = engine.getTaskService();

    try {
      const task = taskService.claimTask(taskId, currentUser);
      if (task) {
        alert(`태스크를 할당받았습니다: ${task.name}`);
        loadTasks();
        setSelectedTask(task);
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleCompleteTask = (taskId: string) => {
    const engine = getProcessEngine();
    const taskService = engine.getTaskService();

    try {
      const task = taskService.completeTask(taskId, {
        completedBy: currentUser,
        completedAt: new Date().toISOString(),
      });

      if (task) {
        alert(`태스크가 완료되었습니다: ${task.name}`);
        loadTasks();
        setSelectedTask(null);
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleUnassignTask = (taskId: string) => {
    const engine = getProcessEngine();
    const taskService = engine.getTaskService();

    const task = taskService.unassignTask(taskId);
    if (task) {
      alert("태스크 할당이 해제되었습니다.");
      loadTasks();
      if (selectedTask?.id === taskId) {
        setSelectedTask(null);
      }
    }
  };

  const getStatusBadge = (task: Task) => {
    if (task.status === "COMPLETED") {
      return <Badge variant="secondary">완료</Badge>;
    }
    if (task.assignee) {
      if (task.assignee === currentUser) {
        return <Badge variant="success">내 태스크</Badge>;
      }
      return <Badge variant="default">할당됨</Badge>;
    }
    return <Badge variant="warning">미할당</Badge>;
  };

  const getPriorityBadge = (priority: number) => {
    if (priority >= 75) return <Badge variant="destructive">긴급</Badge>;
    if (priority >= 50) return <Badge variant="warning">높음</Badge>;
    return <Badge variant="outline">보통</Badge>;
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
            <h1 className="text-2xl font-bold">태스크 관리 (Tasklist)</h1>
            <div className="flex gap-2">
              <Button onClick={() => router.push("/dashboard")} variant="outline">
                대시보드
              </Button>
              <Button onClick={() => router.push("/editor")} variant="outline">
                프로세스 편집기
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 태스크 목록 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>태스크 목록</CardTitle>
                    <CardDescription>
                      할당된 태스크 및 처리 대기 중인 태스크
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={filter === "all" ? "default" : "outline"}
                      onClick={() => setFilter("all")}
                    >
                      전체
                    </Button>
                    <Button
                      size="sm"
                      variant={filter === "my-tasks" ? "default" : "outline"}
                      onClick={() => setFilter("my-tasks")}
                    >
                      내 태스크
                    </Button>
                    <Button
                      size="sm"
                      variant={filter === "unassigned" ? "default" : "outline"}
                      onClick={() => setFilter("unassigned")}
                    >
                      미할당
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      {filter === "my-tasks"
                        ? "할당된 태스크가 없습니다."
                        : "표시할 태스크가 없습니다."}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>태스크 이름</TableHead>
                        <TableHead>프로세스</TableHead>
                        <TableHead>우선순위</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>생성 시간</TableHead>
                        <TableHead className="text-right">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.map((task) => (
                        <TableRow
                          key={task.id}
                          className={`cursor-pointer ${
                            selectedTask?.id === task.id ? "bg-blue-50" : ""
                          }`}
                          onClick={() => setSelectedTask(task)}
                        >
                          <TableCell className="font-medium">{task.name}</TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {task.processInstanceId.substring(0, 8)}...
                          </TableCell>
                          <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                          <TableCell>{getStatusBadge(task)}</TableCell>
                          <TableCell className="text-sm">
                            {formatDate(task.createTime)}
                          </TableCell>
                          <TableCell className="text-right">
                            {task.status !== "COMPLETED" && (
                              <>
                                {!task.assignee && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleClaimTask(task.id);
                                    }}
                                  >
                                    할당받기
                                  </Button>
                                )}
                                {task.assignee === currentUser && (
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCompleteTask(task.id);
                                    }}
                                  >
                                    완료
                                  </Button>
                                )}
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 태스크 상세 정보 */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>태스크 상세</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedTask ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        태스크 이름
                      </label>
                      <p className="mt-1 font-semibold">{selectedTask.name}</p>
                    </div>

                    {selectedTask.description && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">설명</label>
                        <p className="mt-1 text-sm">{selectedTask.description}</p>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-gray-600">상태</label>
                      <div className="mt-1">{getStatusBadge(selectedTask)}</div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        우선순위
                      </label>
                      <div className="mt-1">{getPriorityBadge(selectedTask.priority)}</div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        할당자
                      </label>
                      <p className="mt-1 text-sm">
                        {selectedTask.assignee || "미할당"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        생성 시간
                      </label>
                      <p className="mt-1 text-sm">
                        {formatDate(selectedTask.createTime)}
                      </p>
                    </div>

                    {selectedTask.dueDate && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          마감일
                        </label>
                        <p className="mt-1 text-sm">
                          {formatDate(selectedTask.dueDate)}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        프로세스 인스턴스 ID
                      </label>
                      <p className="mt-1 text-xs font-mono text-gray-500">
                        {selectedTask.processInstanceId}
                      </p>
                    </div>

                    <div className="pt-4 space-y-2">
                      {selectedTask.status !== "COMPLETED" && (
                        <>
                          {!selectedTask.assignee && (
                            <Button
                              className="w-full"
                              onClick={() => handleClaimTask(selectedTask.id)}
                            >
                              이 태스크 할당받기
                            </Button>
                          )}
                          {selectedTask.assignee === currentUser && (
                            <>
                              <Button
                                className="w-full"
                                onClick={() => handleCompleteTask(selectedTask.id)}
                              >
                                태스크 완료
                              </Button>
                              <Button
                                className="w-full"
                                variant="outline"
                                onClick={() => handleUnassignTask(selectedTask.id)}
                              >
                                할당 해제
                              </Button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p>태스크를 선택하세요</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
