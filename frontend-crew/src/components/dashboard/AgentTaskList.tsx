import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserIcon, ClipboardList, Trash2, PenTool } from "lucide-react";
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
import { supabase } from "@/lib/supabase-client";
import { toast } from "@/hooks/use-toast";

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

interface AgentTaskListProps {
  agents: Agent[];
  tasks: Task[];
  onAgentDeleted: (agentId: number) => void;
  onTaskDeleted: (taskId: number) => void;
}

export default function AgentTaskList({
  agents,
  tasks,
  onAgentDeleted,
  onTaskDeleted,
}: AgentTaskListProps) {
  const handleDeleteAgent = async (agentId: number) => {
    try {
      const { error } = await supabase
        .from("agents")
        .delete()
        .eq("id", agentId);

      if (error) throw error;

      onAgentDeleted(agentId);
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

      onTaskDeleted(taskId);
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

  return (
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
                      <Button variant="outline" size="sm">
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
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the agent and remove their data from our
                          servers.
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
              <h4 className="font-semibold mt-2 mb-1">Assigned Tasks:</h4>
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
                            <Button variant="ghost" size="sm">
                              <ClipboardList className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Task Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-2">
                              <p>
                                <strong>Description:</strong> {task.description}
                              </p>
                              <p>
                                <strong>Expected Output:</strong>{" "}
                                {task.expected_output}
                              </p>
                              <p>
                                <strong>Assigned Agent:</strong> {agent.name}
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
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the task and remove its data
                                from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteTask(task.id)}
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
  );
}
