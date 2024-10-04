import React from "react";
import { Metadata } from "next";
import { Nav } from "@/components/reusables/Navbar";
import { Footer } from "@/components/reusables/Footer";
export const metadata: Metadata = {
  title: "Dashboard | Crew Generator",
  description: "Dashboard for Crew Generator",
};

export default function DashboardLayout({
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
