"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface ApiResponse {
  result: {
    raw: string;
    token_usage: {
      total_tokens: number;
      prompt_tokens: number;
      completion_tokens: number;
      successful_requests: number;
    };
  };
}

interface ExecutionPanelProps {
  crewName: string;
  crewId: number;
}

export default function ExecutionPanel({
  crewName,
  crewId,
}: ExecutionPanelProps) {
  const [inputStr, setInputStr] = useState("");
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleExecuteCrew = async () => {
    if (!inputStr.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/execute_crew/${crewId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(inputStr),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      setApiResponse(data);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An error occurred while executing the crew.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }

    setInputStr("");
  };

  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "hsl(var(--accent))",
  ];

  const renderResult = () => {
    if (!apiResponse) return null;

    const { raw, token_usage } = apiResponse.result;
    const tokenUsageData = [
      { name: "Prompt Tokens", tokens: token_usage.prompt_tokens },
      { name: "Completion Tokens", tokens: token_usage.completion_tokens },
      {
        name: "Other Tokens",
        tokens:
          token_usage.total_tokens -
          token_usage.prompt_tokens -
          token_usage.completion_tokens,
      },
    ].filter((item) => item.tokens > 0);

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{raw}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Token Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tokenUsageData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="tokens"
                    nameKey="name"
                    label={(entry) => entry.name}
                  >
                    {tokenUsageData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Total Tokens: {token_usage.total_tokens.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                Successful Requests: {token_usage.successful_requests}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Execute Crew: {crewName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            type="text"
            value={inputStr}
            onChange={(e) => setInputStr(e.target.value)}
            placeholder="Enter input data"
            onKeyUp={(e) => e.key === "Enter" && handleExecuteCrew()}
          />
          <Button onClick={handleExecuteCrew} disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : apiResponse ? (
          renderResult()
        ) : (
          <p>No result to display</p>
        )}
      </CardContent>
    </Card>
  );
}
