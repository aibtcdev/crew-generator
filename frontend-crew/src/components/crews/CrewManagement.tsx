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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusIcon, Trash2Icon, PlayIcon } from "lucide-react";
import CrewForm from "./CrewForm";

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
  const [loading, setLoading] = useState(false);

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
            <CrewForm
              onCrewCreated={onCrewUpdate}
              onClose={() => setIsDialogOpen(false)}
            />
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
