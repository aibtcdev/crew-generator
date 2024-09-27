"use client";

import React, { useState } from "react";
import { supabaseBrowswerClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "@/types/supabase";

type Agent = Database["public"]["Tables"]["agents"]["Row"];

interface AgentProps {
  crewId: number;
}

export default function Agent({ crewId }: AgentProps) {
  const [agentName, setAgentName] = useState("");
  const [role, setRole] = useState("");
  const [goal, setGoal] = useState("");
  const [backstory, setBackstory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const createAgent = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabaseBrowswerClient
        .from("agents")
        .insert({ name: agentName, role, goal, backstory, crew_id: crewId });

      if (error) throw error;

      setSuccess("Agent created successfully!");
      setAgentName("");
      setRole("");
      setGoal("");
      setBackstory("");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add an Agent to the Crew</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agentName">Agent Name</Label>
            <Input
              id="agentName"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="Enter agent name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Enter role"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal">Goal</Label>
            <Input
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Enter goal"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="backstory">Backstory</Label>
            <Input
              id="backstory"
              value={backstory}
              onChange={(e) => setBackstory(e.target.value)}
              placeholder="Enter backstory"
            />
          </div>
          <Button
            onClick={createAgent}
            disabled={loading || !agentName || !role || !goal}
          >
            {loading ? "Adding..." : "Add Agent"}
          </Button>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-500">{success}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
