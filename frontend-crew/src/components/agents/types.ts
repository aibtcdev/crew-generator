export interface Agent {
    id: number;
    name: string;
    role: string;
    goal: string;
    backstory: string;
    agent_tools: string[];
  }
  
  export interface AgentFormProps {
    onSubmit: (agent: Omit<Agent, "id">) => Promise<void>;
    loading: boolean;
  }
  
  export interface AgentManagementProps {
    crewId: number;
    onAgentAdded: () => void;
  }