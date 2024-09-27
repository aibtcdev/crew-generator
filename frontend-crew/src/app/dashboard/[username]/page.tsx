"use client";

import Crew from "@/components/crews/Crew";
import React from "react";

export default function Dashboard({
  params,
}: {
  params: { username: string };
}) {
  return (
    <>
      hello {params.username}
      <Crew />
    </>
  );
}
