"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckIcon } from "lucide-react";
import { AgentFormProps } from "./types";

const AVAILABLE_TOOLS = ["search_web", "fetch_contract_code", "bitcoin_data"];

export default function AgentForm({ onSubmit, loading }: AgentFormProps) {
  const [agentName, setAgentName] = useState("");
  const [role, setRole] = useState("");
  const [goal, setGoal] = useState("");
  const [backstory, setBackstory] = useState("");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name: agentName,
      role,
      goal,
      backstory,
      agent_tools: selectedTools,
    });
    setAgentName("");
    setRole("");
    setGoal("");
    setBackstory("");
    setSelectedTools([]);
  };

  const handleToolToggle = (tool: string) => {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="agentName">Agent Name</Label>
        <Input
          id="agentName"
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          placeholder="Enter agent name"
          required
        />
      </div>
      <div>
        <Label htmlFor="role">Role</Label>
        <Input
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Enter role"
          required
        />
      </div>
      <div>
        <Label htmlFor="goal">Goal</Label>
        <Input
          id="goal"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Enter goal"
          required
        />
      </div>
      <div>
        <Label htmlFor="backstory">Backstory</Label>
        <Textarea
          id="backstory"
          value={backstory}
          onChange={(e) => setBackstory(e.target.value)}
          placeholder="Enter backstory"
        />
      </div>
      <div className="relative">
        <Label>Agent Tools</Label>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between"
          onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
        >
          {selectedTools.length > 0
            ? `${selectedTools.length} tool${
                selectedTools.length > 1 ? "s" : ""
              } selected`
            : "Select tools"}
          <CheckIcon className="h-4 w-4 opacity-50" />
        </Button>
        {isToolsDropdownOpen && (
          <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg">
            {AVAILABLE_TOOLS.map((tool) => (
              <div key={tool} className="flex items-center space-x-2 p-2">
                <Checkbox
                  id={tool}
                  checked={selectedTools.includes(tool)}
                  onCheckedChange={() => handleToolToggle(tool)}
                />
                <label
                  htmlFor={tool}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {tool}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {selectedTools.map((tool) => (
          <div
            key={tool}
            className="bg-primary text-primary-foreground px-2 py-1 rounded-md text-sm"
          >
            {tool}
            <button
              type="button"
              onClick={() => handleToolToggle(tool)}
              className="ml-2 text-primary-foreground hover:text-red-500"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Agent"}
      </Button>
    </form>
  );
}
