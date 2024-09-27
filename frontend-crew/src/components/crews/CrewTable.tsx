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

type Crew = Database["public"]["Tables"]["crews"]["Row"];

interface CrewTableProps {
  crews: Crew[];
  onCrewSelect: (crew: Crew) => void;
  onCrewUpdate: () => void;
}

export function CrewTable({
  crews,
  onCrewSelect,
  onCrewUpdate,
}: CrewTableProps) {
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
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead className="w-[200px]">Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {crews.map((crew) => (
            <TableRow key={crew.id}>
              <TableCell className="font-medium">{crew.name}</TableCell>
              <TableCell>
                {new Date(crew.created_at || "").toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  onClick={() => onCrewSelect(crew)}
                  className="mr-2"
                >
                  View Agents
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(crew.id)}
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
