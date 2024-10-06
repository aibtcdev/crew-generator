"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CrewManagement from "@/components/crews/CrewManagement";
import Link from "next/link";

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
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Crews</CardTitle>
          </CardHeader>
          <CardContent>
            <CrewManagement
              crews={crews}
              onCrewSelect={handleCrewSelect}
              onCrewUpdate={fetchCrews}
            />
            <ul className="mt-4 space-y-2">
              {crews.map((crew) => (
                <li key={crew.id} className="flex justify-between items-center">
                  <span>{crew.name}</span>
                  <Link href={`/crew/${crew.id}`}>
                    <Button variant="outline">View Details</Button>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
