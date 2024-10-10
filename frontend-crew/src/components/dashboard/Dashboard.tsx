"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { CrewManagement } from "@/components/crews/CrewManagement";

interface Crew {
  id: number;
  name: string;
  created_at: string;
}

export default function Dashboard() {
  const [crews, setCrews] = useState<Crew[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchCrews();
  }, []);

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

  const handleCrewSelect = (crew: Crew) => {
    router.push(`/crew/${crew.id}`);
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CrewManagement
          crews={crews}
          onCrewSelect={handleCrewSelect}
          onCrewUpdate={fetchCrews}
        />
      </div>
    </div>
  );
}
