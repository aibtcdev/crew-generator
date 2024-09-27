from backend.db.supabase_client import supabase
from crewai import Agent, Task, Crew, Process
from dotenv import load_dotenv

load_dotenv()

# Fetch agents and tasks for a given crew_id
def fetch_crew_data(crew_id: int):
    agents_response = supabase.from_('agents').select('*').eq('crew_id', crew_id).execute()
    tasks_response = supabase.from_('tasks').select('*').eq('crew_id', crew_id).execute()
    
    if not agents_response.data or not tasks_response.data:
        raise ValueError("No agents or tasks found for the specified crew.")
    
    return agents_response.data, tasks_response.data

# Create and execute a crew based on data from the database
def execute_crew(crew_id: int, input_data: dict):
    agents_data, tasks_data = fetch_crew_data(crew_id)

    # Create agents and index by agent_id
    agents = {}
    for agent_data in agents_data:
        agent = Agent(
            role=agent_data['role'],
            goal=agent_data['goal'],
            backstory=agent_data['backstory'],
            verbose=True,
            memory=True
        )
        agents[agent_data['id']] = agent  # Use agent_id as key
    
    # Create tasks and assign the appropriate agent
    tasks = []
    for task_data in tasks_data:
        agent_id = task_data['agent_id']
        if agent_id not in agents:
            raise ValueError(f"Agent with id {agent_id} not found for task {task_data['id']}.")
        
        task = Task(
            description=task_data['description'],
            expected_output=task_data['expected_output'],
            agent=agents[agent_id],  # Map task to its correct agent
            async_execution=False
        )
        tasks.append(task)
    
    # Create crew and execute sequentially
    crew = Crew(
        agents=list(agents.values()),
        tasks=tasks,
        process=Process.sequential
    )
    
    # Execute crew with the provided input data and return result
    result = crew.kickoff(inputs=input_data)
    
    return result
