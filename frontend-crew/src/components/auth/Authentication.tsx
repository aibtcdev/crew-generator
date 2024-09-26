"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { GithubIcon } from "lucide-react";
import { socialAuth } from "@/helpers/auth-helpers";

export function Authentication() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          Sign In to create Crew
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col space-y-4">
        <Button
          variant="outline"
          onClick={() => socialAuth("github")}
          className="w-full flex items-center justify-center"
        >
          <GithubIcon className="mr-2 h-4 w-4" />
          Continue with Github
        </Button>
        {/* <Button
          variant="outline"
          onClick={() => socialAuth("google")}
          className="w-full flex items-center justify-center"
        >
          Continue with Google
        </Button> */}
      </CardContent>
    </Card>
  );
}
