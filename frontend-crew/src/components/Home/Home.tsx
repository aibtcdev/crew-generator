"use client";

import React from "react";
import { SparklesCore } from "../ui/sparkles";
import { Authentication } from "../auth/Authentication";

export default function Home() {
  return (
    <div className="relative h-screen w-full bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Sparkles background */}
      <div className="absolute inset-0 w-full h-full">
        <SparklesCore
          id="tsparticles"
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center space-y-8">
        <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold text-center text-white">
          AIBTC.DEV
        </h1>

        <div className="w-full max-w-md px-4">
          {/* Gradients */}
          <div className="relative">
            <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-full blur-sm" />
            <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-full" />
            <div className="absolute inset-x-1/4 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/2 blur-sm" />
            <div className="absolute inset-x-1/4 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/2" />

            {/* Authentication component */}
            <div className="pt-4">
              <Authentication />
            </div>
          </div>
        </div>
      </div>

      {/* Radial Gradient overlay */}
      <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(circle_at_center,transparent_20%,black)]"></div>
    </div>
  );
}
