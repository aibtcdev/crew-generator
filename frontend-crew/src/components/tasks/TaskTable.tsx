"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Database } from "@/types/supabase";

type Task = Database["public"]["Tables"]["tasks"]["Row"];
type Agent = Database["public"]["Tables"]["agents"]["Row"];

interface TaskTableProps {
  tasks: Task[];
  agents: Agent[];
  onTaskUpdate: () => void;
}

export function TaskTable({ tasks, agents, onTaskUpdate }: TaskTableProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id);

      if (error) throw error;
      onTaskUpdate();
      toast({
        title: "Task deleted",
        description: "The task has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAgentName = (agentId: number | null) => {
    if (!agentId) return "Unassigned";
    const agent = agents.find((a) => a.id === agentId);
    return agent ? agent.name : "Unknown";
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Description</TableHead>
            <TableHead className="w-[200px]">Expected Output</TableHead>
            <TableHead className="w-[150px]">Assigned Agent</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="font-medium">{task.description}</TableCell>
              <TableCell>{task.expected_output}</TableCell>
              <TableCell>{getAgentName(task.agent_id)}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(task.id)}
                  disabled={loading}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
