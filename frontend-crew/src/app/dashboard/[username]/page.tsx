"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import { CrewForm } from "@/components/crews/CrewForm";
import { CrewTable } from "@/components/crews/CrewTable";
import { AgentTable } from "@/components/agents/AgentTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Database } from "@/types/supabase";

type Crew = Database["public"]["Tables"]["crews"]["Row"];
type Agent = Database["public"]["Tables"]["agents"]["Row"];

export default function Dashboard() {
  const [crews, setCrews] = useState<Crew[]>([]);
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [showCrewForm, setShowCrewForm] = useState(false);

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

  const handleCrewCreated = () => {
    fetchCrews();
    setShowCrewForm(false);
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
        <Tabs defaultValue="agents" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>
          <TabsContent value="agents">
            <Card>
              <CardHeader>
                <CardTitle>Agents for {selectedCrew.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <AgentTable
                  agents={agents}
                  onAgentUpdate={() => fetchAgents(selectedCrew.id)}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>Tasks for {selectedCrew.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Task management coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="tools">
            <Card>
              <CardHeader>
                <CardTitle>Tools for {selectedCrew.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Tool management coming soon...</p>
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
    </div>
  );
}
