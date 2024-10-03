"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import remarkGfm from "remark-gfm";
import { Send, UserIcon, ClipboardList, Trash2, PenTool } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import CrewManagement from "../crews/crew-management";
import AgentManagement from "../agents/agent-management";
import TaskManagement from "../tasks/task-management";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface Crew {
  id: number;
  name: string;
  created_at: string;
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

interface ApiResponse {
  result: {
    raw: string;
    token_usage: {
      total_tokens: number;
      prompt_tokens: number;
      completion_tokens: number;
      successful_requests: number;
    };
  };
}

export default function Dashboard() {
  const [crews, setCrews] = useState<Crew[]>([]);
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputStr, setInputStr] = useState("");
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCrews();
  }, []);

  useEffect(() => {
    if (selectedCrew) {
      fetchAgents(selectedCrew.id);
      fetchTasks(selectedCrew.id);
    }
  }, [selectedCrew]);

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
      .eq("crew_id", crewId);

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
      .eq("crew_id", crewId);

    if (error) {
      console.error("Error fetching tasks:", error);
      return;
    }

    setTasks(data);
  };

  const handleCrewSelect = (crew: Crew) => {
    setSelectedCrew(crew);
  };

  const handleExecuteCrew = async () => {
    if (!selectedCrew || !inputStr.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/execute_crew/${selectedCrew.id}`,
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

      const data: ApiResponse = await response.json();
      setApiResponse(data);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An error occurred while executing the crew.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }

    setInputStr("");
  };

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgent(agent);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleDeleteAgent = async (agentId: number) => {
    try {
      const { error } = await supabase
        .from("agents")
        .delete()
        .eq("id", agentId);

      if (error) throw error;

      setAgents(agents.filter((agent) => agent.id !== agentId));
      toast({
        title: "Agent deleted",
        description: "The agent has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting agent:", error);
      toast({
        title: "Error",
        description: "Failed to delete the agent. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);

      if (error) throw error;

      setTasks(tasks.filter((task) => task.id !== taskId));
      toast({
        title: "Task deleted",
        description: "The task has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "Failed to delete the task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAgentAdded = () => {
    if (selectedCrew) {
      fetchAgents(selectedCrew.id);
    }
  };

  const handleTaskAdded = () => {
    if (selectedCrew) {
      fetchTasks(selectedCrew.id);
    }
  };

  const renderAgentTools = (agentTools: string | string[] | null) => {
    if (!agentTools) return null;

    const toolsArray = Array.isArray(agentTools)
      ? agentTools
      : agentTools.split(",");

    return toolsArray.map((tool, index) => (
      <Badge key={index} variant="secondary">
        <PenTool className="h-3 w-3 mr-1" />
        {tool.trim()}
      </Badge>
    ));
  };

  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "hsl(var(--accent))",
  ];

  const renderResult = () => {
    if (!apiResponse) return null;

    const { raw, token_usage } = apiResponse.result;
    const tokenUsageData = [
      { name: "Prompt Tokens", tokens: token_usage.prompt_tokens },
      { name: "Completion Tokens", tokens: token_usage.completion_tokens },
      {
        name: "Other Tokens",
        tokens:
          token_usage.total_tokens -
          token_usage.prompt_tokens -
          token_usage.completion_tokens,
      },
    ].filter((item) => item.tokens > 0); // Filter out zero values

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{raw}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Token Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tokenUsageData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="tokens"
                    nameKey="name"
                    label={(entry) => entry.name}
                  >
                    {tokenUsageData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Total Tokens: {token_usage.total_tokens.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                Successful Requests: {token_usage.successful_requests}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      {!selectedCrew ? (
        <CrewManagement
          crews={crews}
          onCrewSelect={handleCrewSelect}
          onCrewUpdate={fetchCrews}
        />
      ) : (
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="w-full lg:w-1/2 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{selectedCrew.name}</h2>
              <Button onClick={() => setSelectedCrew(null)}>
                Back to Crews
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Agents and Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agents.map((agent) => (
                    <div key={agent.id} className="border p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <UserIcon className="mr-2 h-4 w-4" />
                          <h3 className="font-semibold">{agent.name}</h3>
                        </div>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAgentClick(agent)}
                              >
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Agent Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-2">
                                <p>
                                  <strong>Name:</strong> {agent.name}
                                </p>
                                <p>
                                  <strong>Role:</strong> {agent.role}
                                </p>
                                <p>
                                  <strong>Goal:</strong> {agent.goal}
                                </p>
                                <p>
                                  <strong>Backstory:</strong> {agent.backstory}
                                </p>

                                <div>
                                  <strong>Tools:</strong>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {renderAgentTools(agent.agent_tools)}
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete the agent and remove their
                                  data from our servers.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteAgent(agent.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{agent.role}</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <div>
                          <strong>Tools:</strong>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {renderAgentTools(agent.agent_tools)}
                          </div>
                        </div>
                      </div>
                      <h4 className="font-semibold mt-2 mb-1">
                        Assigned Tasks:
                      </h4>
                      <ul className="list-disc pl-5">
                        {tasks
                          .filter((task) => task.agent_id === agent.id)
                          .map((task) => (
                            <li
                              key={task.id}
                              className="text-sm flex items-center justify-between"
                            >
                              <span>{task.description}</span>
                              <div className="flex space-x-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleTaskClick(task)}
                                    >
                                      <ClipboardList className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Task Details</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-2">
                                      <p>
                                        <strong>Description:</strong>{" "}
                                        {task.description}
                                      </p>
                                      <p>
                                        <strong>Expected Output:</strong>{" "}
                                        {task.expected_output}
                                      </p>
                                      <p>
                                        <strong>Assigned Agent:</strong>{" "}
                                        {agent.name}
                                      </p>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Are you sure?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will
                                        permanently delete the task and remove
                                        its data from our servers.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDeleteTask(task.id)
                                        }
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </li>
                          ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <div className="flex space-x-4">
              <AgentManagement
                crewId={selectedCrew.id}
                onAgentAdded={handleAgentAdded}
              />
              <TaskManagement
                crewId={selectedCrew.id}
                onTaskAdded={handleTaskAdded}
              />
            </div>
          </div>

          <div className="w-full lg:w-1/2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Execute Crew: {selectedCrew.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    value={inputStr}
                    onChange={(e) => setInputStr(e.target.value)}
                    placeholder="Enter input data"
                    onKeyUp={(e) => e.key === "Enter" && handleExecuteCrew()}
                  />
                  <Button onClick={handleExecuteCrew} disabled={isLoading}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : apiResponse ? (
                  renderResult()
                ) : (
                  <p>No result to display</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
