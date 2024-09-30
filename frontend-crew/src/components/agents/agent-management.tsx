"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";

interface Agent {
  id: number;
  name: string;
  role: string;
  goal: string;
  backstory: string;
}

interface AgentFormProps {
  onSubmit: (agent: Omit<Agent, "id">) => Promise<void>;
  loading: boolean;
}

function AgentForm({ onSubmit, loading }: AgentFormProps) {
  const [agentName, setAgentName] = useState("");
  const [role, setRole] = useState("");
  const [goal, setGoal] = useState("");
  const [backstory, setBackstory] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ name: agentName, role, goal, backstory });
    setAgentName("");
    setRole("");
    setGoal("");
    setBackstory("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="agentName">Agent Name</Label>
        <Input
          id="agentName"
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          placeholder="Enter agent name"
          required
        />
      </div>
      <div>
        <Label htmlFor="role">Role</Label>
        <Input
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Enter role"
          required
        />
      </div>
      <div>
        <Label htmlFor="goal">Goal</Label>
        <Input
          id="goal"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Enter goal"
          required
        />
      </div>
      <div>
        <Label htmlFor="backstory">Backstory</Label>
        <Textarea
          id="backstory"
          value={backstory}
          onChange={(e) => setBackstory(e.target.value)}
          placeholder="Enter backstory"
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Agent"}
      </Button>
    </form>
  );
}
interface AgentManagementProps {
  crewId: number;
  onAgentAdded: () => void;
}
export default function AgentManagement({
  crewId,
  onAgentAdded,
}: AgentManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (agentData: Omit<Agent, "id">) => {
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

      const { error } = await supabase.from("agents").insert({
        ...agentData,
        crew_id: crewId,
        profile_id: user.id,
      });

      if (error) throw error;

      setIsDialogOpen(false);
      toast({
        title: "Agent created",
        description: "The new agent has been successfully created.",
      });
      onAgentAdded();
    } catch (error) {
      console.error("Error creating agent:", error);
      toast({
        title: "Error",
        description: "Failed to create the agent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Agent
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Agent</DialogTitle>
          </DialogHeader>
          <AgentForm onSubmit={handleSubmit} loading={loading} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
