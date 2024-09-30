"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusIcon, Trash2Icon, PlayIcon } from "lucide-react";

interface Crew {
  id: number;
  name: string;
  created_at: string;
}

interface CrewManagementProps {
  crews: Crew[];
  onCrewSelect: (crew: Crew) => void;
  onCrewUpdate: () => Promise<void> | void;
}

export default function CrewManagement({
  crews,
  onCrewSelect,
  onCrewUpdate,
}: CrewManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

      const { error } = await supabase.from("crews").insert({
        name: crewName,
        profile_id: user.id,
      });

      if (error) throw error;

      setCrewName("");
      setIsDialogOpen(false);
      onCrewUpdate();
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

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("crews").delete().eq("id", id);

      if (error) throw error;
      onCrewUpdate();
      toast({
        title: "Crew deleted",
        description: "The crew has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the crew. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Crews</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Crew
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Crew</DialogTitle>
            </DialogHeader>
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
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {crews.map((crew) => (
          <Card key={crew.id}>
            <CardHeader>
              <CardTitle>{crew.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Created: {new Date(crew.created_at).toLocaleDateString()}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => onCrewSelect(crew)}>
                <PlayIcon className="mr-2 h-4 w-4" />
                Select Crew
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(crew.id)}
                disabled={loading}
              >
                <Trash2Icon className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
