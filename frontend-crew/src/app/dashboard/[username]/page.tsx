"use client";

import React from "react";

export default function Dashboard({
  params,
}: {
  params: { username: string };
}) {
  return <>hello {params.username}</>;
}
