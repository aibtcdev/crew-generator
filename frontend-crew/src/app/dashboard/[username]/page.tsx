"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import { CrewTable } from "@/components/crews/CrewTable";
import { CrewForm } from "@/components/crews/CrewForm";
import { AgentTable } from "@/components/agents/AgentTable";
import { AgentForm } from "@/components/agents/AgentForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database } from "@/types/supabase";

type Crew = Database["public"]["Tables"]["crews"]["Row"];
type Agent = Database["public"]["Tables"]["agents"]["Row"];

export default function Dashboard() {
  const [crews, setCrews] = useState<Crew[]>([]);
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);

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

  useEffect(() => {
    fetchCrews();
  }, []);

  useEffect(() => {
    if (selectedCrew) {
      fetchAgents(selectedCrew.id);
    }
  }, [selectedCrew]);

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Crew and Agents Dashboard</h1>
      <Tabs defaultValue="crews" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="crews">Crews</TabsTrigger>
          <TabsTrigger value="agents" disabled={!selectedCrew}>
            Agents
          </TabsTrigger>
        </TabsList>
        <TabsContent value="crews">
          <Card>
            <CardHeader>
              <CardTitle>Crews</CardTitle>
            </CardHeader>
            <CardContent>
              <CrewTable
                crews={crews}
                onCrewSelect={setSelectedCrew}
                onCrewUpdate={fetchCrews}
              />
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2">Create New Crew</h3>
                <CrewForm onCrewCreated={fetchCrews} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="agents">
          {selectedCrew && (
            <Card>
              <CardHeader>
                <CardTitle>Agents for {selectedCrew.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <AgentTable
                  agents={agents}
                  onAgentUpdate={() => fetchAgents(selectedCrew.id)}
                />
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-2">
                    Create New Agent
                  </h3>
                  <AgentForm
                    crewId={selectedCrew.id}
                    onAgentCreated={() => fetchAgents(selectedCrew.id)}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
