"use client";

import { Button } from "@/components/ui/button";
import AgentTaskList from "./AgentTaskList";
import ExecutionPanel from "./Execution";
import AgentManagement from "../agents/AgentManagement";
import TaskManagement from "../tasks/TaskManagement";

interface Crew {
  id: number;
  name: string;
}

interface Agent {
  id: number;
  name: string;
  role: string;
  goal: string;
  backstory: string;
  agent_tools: string | string[];
}

interface Task {
  id: number;
  description: string;
  expected_output: string;
  agent_id: number | null;
}

interface CrewViewProps {
  crew: Crew;
  agents: Agent[];
  tasks: Task[];
  onBackClick: () => void;
  onAgentAdded: () => void;
  onTaskAdded: () => void;
  onAgentDeleted: (agentId: number) => void;
  onTaskDeleted: (taskId: number) => void;
}

export default function CrewView({
  crew,
  agents,
  tasks,
  onBackClick,
  onAgentAdded,
  onTaskAdded,
  onAgentDeleted,
  onTaskDeleted,
}: CrewViewProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="w-full lg:w-1/2 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">{crew.name}</h2>
          <Button onClick={onBackClick}>Back to Crews</Button>
        </div>
        <AgentTaskList
          agents={agents}
          tasks={tasks}
          onAgentDeleted={onAgentDeleted}
          onTaskDeleted={onTaskDeleted}
        />
        <div className="flex space-x-4">
          <AgentManagement crewId={crew.id} onAgentAdded={onAgentAdded} />
          <TaskManagement crewId={crew.id} onTaskAdded={onTaskAdded} />
        </div>
      </div>
      <div className="w-full lg:w-1/2">
        <ExecutionPanel crewName={crew.name} crewId={crew.id} />
      </div>
    </div>
  );
}
