"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Database } from "@/types/supabase";

type Crew = Database["public"]["Tables"]["crews"]["Insert"];

interface CrewFormProps {
  onCrewCreated: () => void;
}

export function CrewForm({ onCrewCreated }: CrewFormProps) {
  const [crewName, setCrewName] = useState("");
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

      const { data: crew, error } = await supabase
        .from("crews")
        .insert({ name: crewName, profile_id: user.id })
        .select()
        .single();

      if (error) throw error;

      setCrewName("");
      onCrewCreated();
      toast({
        title: "Crew created",
        description: "The new crew has been successfully created.",
      });
    } catch (error) {
      console.error("Error creating crew:", error);
      toast({
        title: "Error",
        description: "Failed to create the crew. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="crewName">Crew Name</Label>
        <Input
          id="crewName"
          value={crewName}
          onChange={(e) => setCrewName(e.target.value)}
          placeholder="Enter crew name"
          required
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Crew"}
      </Button>
    </form>
  );
}