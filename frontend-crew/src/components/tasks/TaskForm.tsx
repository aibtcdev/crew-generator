"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Agent {
  id: number;
  name: string;
}

interface TaskFormProps {
  crewId: number;
  agents: Agent[];
  onTaskAdded: () => void;
  onClose: () => void;
}

export default function TaskForm({
  crewId,
  agents,
  onTaskAdded,
  onClose,
}: TaskFormProps) {
  const [description, setDescription] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (!user) {
        throw new Error("No authenticated user found");
      }

      const { error } = await supabase.from("tasks").insert({
        description,
        expected_output: expectedOutput,
        agent_id: selectedAgentId,
        crew_id: crewId,
        profile_id: user.id,
      });

      if (error) throw error;

      setDescription("");
      setExpectedOutput("");
      setSelectedAgentId(null);
      onClose();
      toast({
        title: "Task created",
        description: "The new task has been successfully created.",
      });
      onTaskAdded();
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description: "Failed to create the task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="description">Task Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description"
          required
        />
      </div>
      <div>
        <Label htmlFor="expectedOutput">Expected Output</Label>
        <Textarea
          id="expectedOutput"
          value={expectedOutput}
          onChange={(e) => setExpectedOutput(e.target.value)}
          placeholder="Enter expected output"
          required
        />
      </div>
      <div>
        <Label htmlFor="agent">Assign to Agent</Label>
        <Select onValueChange={(value) => setSelectedAgentId(Number(value))}>
          <SelectTrigger>
            <SelectValue placeholder="Select an agent" />
          </SelectTrigger>
          <SelectContent>
            {agents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id.toString()}>
                {agent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Task"}
      </Button>
    </form>
  );
}
