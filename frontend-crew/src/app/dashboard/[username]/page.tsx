"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import { CrewForm } from "@/components/crews/CrewForm";
import { CrewTable } from "@/components/crews/CrewTable";
import { AgentTable } from "@/components/agents/AgentTable";
import { AgentForm } from "@/components/agents/AgentForm";
import { TaskForm } from "@/components/tasks/TaskForm";
import { TaskTable } from "@/components/tasks/TaskTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Database } from "@/types/supabase";

type Crew = Database["public"]["Tables"]["crews"]["Row"];
type Agent = Database["public"]["Tables"]["agents"]["Row"];
type Task = Database["public"]["Tables"]["tasks"]["Row"];

export default function Dashboard() {
  const [crews, setCrews] = useState<Crew[]>([]);
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showCrewForm, setShowCrewForm] = useState(false);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [activeTab, setActiveTab] = useState("agents");
  const [inputStr, setInputStr] = useState("");
  const [apiResponse, setApiResponse] = useState<any>(null);

  const fetchCrews = async () => {
    const { data, error } = await supabase
      .from("crews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching crews:", error);
      return;
    }

    setCrews(data);
  };

  const fetchAgents = async (crewId: number) => {
    const { data, error } = await supabase
      .from("agents")
      .select("*")
      .eq("crew_id", crewId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching agents:", error);
      return;
    }

    setAgents(data);
  };

  const fetchTasks = async (crewId: number) => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("crew_id", crewId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tasks:", error);
      return;
    }

    setTasks(data);
  };

  useEffect(() => {
    fetchCrews();
  }, []);

  useEffect(() => {
    if (selectedCrew) {
      fetchAgents(selectedCrew.id);
      fetchTasks(selectedCrew.id);
    }
  }, [selectedCrew]);

  const handleCrewCreated = () => {
    fetchCrews();
    setShowCrewForm(false);
  };

  const handleAgentCreated = () => {
    if (selectedCrew) {
      fetchAgents(selectedCrew.id);
    }
    setShowAgentForm(false);
  };

  const handleTaskCreated = () => {
    if (selectedCrew) {
      fetchTasks(selectedCrew.id);
    }
    setShowTaskForm(false);
    setActiveTab("tasks");
  };

  const handleExecuteCrew = async () => {
    if (!selectedCrew) {
      console.error("No crew selected");
      return;
    }

    try {
      const response = await fetch(
        // TODO: ADD IT IN THE ENV FILE
        `http://127.0.0.1:8000/execute_crew/${selectedCrew.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(inputStr),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setApiResponse(data);
    } catch (error) {
      console.error("Error:", error);
      setApiResponse({ error: "Error occurred while executing the crew." });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Crew Dashboard</h1>
      {!selectedCrew && !showCrewForm ? (
        <div className="text-center">
          <p className="mb-4">
            Welcome! Start by creating a crew or select an existing one.
          </p>
          <Button onClick={() => setShowCrewForm(true)}>Create New Crew</Button>
        </div>
      ) : showCrewForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Create New Crew</CardTitle>
          </CardHeader>
          <CardContent>
            <CrewForm onCrewCreated={handleCrewCreated} />
          </CardContent>
        </Card>
      ) : selectedCrew ? (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>
          <TabsContent value="agents">
            <Card>
              <CardHeader>
                <CardTitle>Agents for {selectedCrew.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {showAgentForm ? (
                  <AgentForm
                    crewId={selectedCrew.id}
                    onAgentCreated={handleAgentCreated}
                  />
                ) : (
                  <>
                    <Button
                      onClick={() => setShowAgentForm(true)}
                      className="mb-4"
                    >
                      Add New Agent
                    </Button>
                    <AgentTable
                      agents={agents}
                      onAgentUpdate={() => fetchAgents(selectedCrew.id)}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>Tasks for {selectedCrew.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {showTaskForm ? (
                  <TaskForm
                    crewId={selectedCrew.id}
                    agents={agents}
                    onTaskCreated={handleTaskCreated}
                  />
                ) : (
                  <>
                    <Button
                      onClick={() => setShowTaskForm(true)}
                      className="mb-4"
                    >
                      Add New Task
                    </Button>
                    <TaskTable
                      tasks={tasks}
                      agents={agents}
                      onTaskUpdate={() => fetchTasks(selectedCrew.id)}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : null}
      {crews.length > 0 && !selectedCrew && (
        <Card>
          <CardHeader>
            <CardTitle>Your Crews</CardTitle>
          </CardHeader>
          <CardContent>
            <CrewTable
              crews={crews}
              onCrewSelect={setSelectedCrew}
              onCrewUpdate={fetchCrews}
            />
          </CardContent>
        </Card>
      )}
      {selectedCrew && (
        <Card>
          <CardHeader>
            <CardTitle>Execute Crew</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mb-4">
              <Input
                type="text"
                value={inputStr}
                onChange={(e) => setInputStr(e.target.value)}
                placeholder="Enter input data"
              />
              <Button onClick={handleExecuteCrew}>Execute</Button>
            </div>
            {apiResponse && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">API Response:</h3>
                <div className="space-y-4">
                  {apiResponse.result?.tasks_output?.map(
                    (task: any, index: number) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle>{task.agent} Output</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <pre className="bg-gray-100 p-4 rounded-md overflow-auto whitespace-pre-wrap">
                            {task.raw}
                          </pre>
                        </CardContent>
                      </Card>
                    )
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
