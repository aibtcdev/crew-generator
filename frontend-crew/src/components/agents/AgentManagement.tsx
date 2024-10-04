"use client";

import { useState } from "react";
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
import AgentForm from "./AgentForm";
import { AgentManagementProps, Agent } from "./types";

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

      // Format the agent_tools as a PostgreSQL array
      const formattedAgentTools = `{${agentData.agent_tools.join(",")}}`;

      const { error } = await supabase.from("agents").insert({
        ...agentData,
        agent_tools: formattedAgentTools, // Use the formatted array
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
