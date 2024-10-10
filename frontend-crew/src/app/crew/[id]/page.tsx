"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { AgentManagement } from "@/components/agents/AgentManagement";
import TaskManagement from "@/components/tasks/TaskManagement";
import ExecutionPanel from "@/components/dashboard/Execution";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Crew {
  id: number;
  name: string;
}

interface Agent {
  id: number;
  name: string;
  role: string;
}

interface Task {
  id: number;
  description: string;
  agent_id: number;
}

export default function CrewDetails() {
  const params = useParams();
  const id = params.id as string;
  const [crew, setCrew] = useState<Crew | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (id) {
      fetchCrew();
      fetchAgents();
      fetchTasks();
    }
  }, [id]);

  const fetchCrew = async () => {
    const { data, error } = await supabase
      .from("crews")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching crew:", error);
      return;
    }

    setCrew(data);
  };

  const fetchAgents = async () => {
    const { data, error } = await supabase
      .from("agents")
      .select("*")
      .eq("crew_id", id);

    if (error) {
      console.error("Error fetching agents:", error);
      return;
    }

    setAgents(data);
  };

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("crew_id", id);

    if (error) {
      console.error("Error fetching tasks:", error);
      return;
    }

    setTasks(data);
  };

  if (!crew) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{crew.name}</h1>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <Card>
            <CardContent>
              <AgentManagement crewId={crew.id} onAgentAdded={fetchAgents} />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <TaskManagement crewId={crew.id} onTaskAdded={fetchTasks} />
            </CardContent>
          </Card>
        </div>
        <div>
          <ExecutionPanel crewName={crew.name} crewId={crew.id} />
        </div>
      </div>
    </div>
  );
}
