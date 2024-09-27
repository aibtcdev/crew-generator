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

type Agent = Database["public"]["Tables"]["agents"]["Row"];

interface AgentTableProps {
  agents: Agent[];
  onAgentUpdate: () => void;
}

export function AgentTable({ agents, onAgentUpdate }: AgentTableProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("agents").delete().eq("id", id);

      if (error) throw error;
      onAgentUpdate();
      toast({
        title: "Agent deleted",
        description: "The agent has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the agent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Name</TableHead>
            <TableHead className="w-[150px]">Role</TableHead>
            <TableHead className="w-[200px]">Goal</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((agent) => (
            <TableRow key={agent.id}>
              <TableCell className="font-medium">{agent.name}</TableCell>
              <TableCell>{agent.role}</TableCell>
              <TableCell>{agent.goal}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(agent.id)}
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
