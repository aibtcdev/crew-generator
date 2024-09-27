"use client";

import React, { useState } from "react";
import { supabaseBrowswerClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "@/types/supabase";

type Crew = Database["public"]["Tables"]["crews"]["Row"];

interface CrewProps {
  onCrewCreated: (crewId: number) => void;
}

export default function Crew({ onCrewCreated }: CrewProps) {
  const [crewName, setCrewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCrew = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: user, error: userError } =
        await supabaseBrowswerClient.auth.getUser();
      if (userError) throw userError;

      const { data: profileData, error: profileError } =
        await supabaseBrowswerClient
          .from("profiles")
          .select("id")
          .eq("user_id", user.user.id)
          .single();

      if (profileError) throw profileError;

      const { data, error } = await supabaseBrowswerClient
        .from("crews")
        .insert({ name: crewName, profile_id: profileData.id })
        .select()
        .single();

      if (error) throw error;

      onCrewCreated(data.id);
      setCrewName("");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a Crew</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="crewName">Crew Name</Label>
            <Input
              id="crewName"
              value={crewName}
              onChange={(e) => setCrewName(e.target.value)}
              placeholder="Enter crew name"
            />
          </div>
          <Button onClick={createCrew} disabled={loading || !crewName}>
            {loading ? "Creating..." : "Create Crew"}
          </Button>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
