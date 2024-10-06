import React from "react";
import { Metadata } from "next";
import { Nav } from "@/components/reusables/Navbar";
import { Footer } from "@/components/reusables/Footer";
export const metadata: Metadata = {
  title: "Crew | Crew Generator",
  description: "Dashboard for Crew Generator",
};

export default function CrewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div>
        <Nav />
        {children}
        <Footer />
      </div>
    </>
  );
}
