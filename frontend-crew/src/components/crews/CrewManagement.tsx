"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlusIcon, MoreHorizontal, Trash2Icon, UserIcon } from "lucide-react";
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

export function CrewManagement({
  crews,
  onCrewSelect,
  onCrewUpdate,
}: CrewManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Crews</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
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
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Select</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {crews.map((crew) => (
              <TableRow key={crew.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="h-4 w-4 text-primary" />
                    <span>{crew.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(crew.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCrewSelect(crew)}
                  >
                    Select Crew
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  {/* TODO: NEED TO ADD EDIT AND UPDATE OPTIONS TOO.. */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleDelete(crew.id)}
                        disabled={loading}
                        className="text-destructive"
                      >
                        <Trash2Icon className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
