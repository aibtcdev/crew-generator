"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";
import TaskForm from "./TaskForm";

interface Agent {
  id: number;
  name: string;
}

interface TaskManagementProps {
  crewId: number;
  onTaskAdded: () => void;
}

export default function TaskManagement({
  crewId,
  onTaskAdded,
}: TaskManagementProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    const { data, error } = await supabase
      .from("agents")
      .select("id, name")
      .eq("crew_id", crewId);
    if (error) {
      console.error("Error fetching agents:", error);
      toast({
        title: "Error",
        description: "Failed to fetch agents. Please try again.",
        variant: "destructive",
      });
    } else {
      setAgents(data);
    }
  };

  return (
    <div className="space-y-4">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <TaskForm
            crewId={crewId}
            agents={agents}
            onTaskAdded={onTaskAdded}
            onClose={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
