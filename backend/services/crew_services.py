import re
from backend.db.supabase_client import supabase
from crewai import Agent, Task, Crew, Process
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Fetch agents and tasks for a given crew_id from Supabase
def fetch_crew_data(crew_id: int):
    """
    Fetch agents and tasks for the specified crew from Supabase.
    
    Args:
        crew_id (int): ID of the crew whose agents and tasks are to be fetched.

    Returns:
        Tuple: A tuple containing a list of agents and a list of tasks.
    
    Raises:
        ValueError: If no agents or tasks are found for the specified crew.
    """
    agents_response = supabase.from_('agents').select('*').eq('crew_id', crew_id).execute()
    tasks_response = supabase.from_('tasks').select('*').eq('crew_id', crew_id).execute()
    
    if not agents_response.data or not tasks_response.data:
        raise ValueError("No agents or tasks found for the specified crew.")
    
    return agents_response.data, tasks_response.data

# Define the manager agent (A MANAGER AGENT IS RESPONSIBLE FOR MANAGING OTHER AGENTS)
def create_manager_agent():
    """
    Create and return a manager agent who oversees and refines tasks, as well as handles task outputs.
    
    The manager agent ensures the flow of outputs between agents and refines the tasks before assigning them.

    Returns:
        Agent: The manager agent object.
    """
    manager_agent = Agent(
        role="Manager",
        goal="Oversee, refine tasks, and coordinate the flow of task outputs between agents.",
        backstory=(
            "You are a skilled manager responsible for refining tasks and managing outputs between agents."
            "You ensure that each task is well-structured and agents work with the correct information."
        ),
        verbose=True,
        memory=True,
        allow_delegation=True 
    )
    return manager_agent

# Manager function to refine the task before it's passed to the agent
def refine_task(manager, task_description, agent_role, task_output):
    """
    Manager refines the task description by processing the task using Agent's execute_task method.

    Args:
        manager (Agent): The manager agent refining the task.
        task_description (str): Original task description.
        agent_role (str): Role of the agent assigned to this task.
        task_output (str): Output of the previous task (if applicable).

    Returns:
        str: The refined task description.
    """

    task_refinement_description = f"{task_description}\n\nManager is refining this task for the {agent_role}."


    if task_output:
        task_refinement_description += f"\n\nPrevious task output to consider: {task_output}"

    # Use the manager to execute the refinement process
    refined_description = manager.execute_task(
        task=Task(
            description=task_refinement_description,
            expected_output="Refined task description"
        )
    )

    # print(f"Refined Task for {agent_role}:\n{refined_description}\n{'-'*50}")
    
    return refined_description

# Main function to execute the crew with agents and tasks from the database
def execute_crew(crew_id: int, input_str: str):
    """
    Execute a crew by fetching agents and tasks for a given crew_id and managing the flow of outputs between tasks.
    
    The manager agent refines each task and ensures proper input/output flow between tasks.

    Args:
        crew_id (int): ID of the crew to be executed.
        input_str (str): User input to be incorporated into the initial task.

    Returns:
        str: The result of the crew's execution.
    """
    # Fetch agents and tasks from Supabase
    agents_data, tasks_data = fetch_crew_data(crew_id)

    # Create agents and index them by agent_id
    agents = {}
    for agent_data in agents_data:
        # Create each agent based on the data fetched from the database
        agent = Agent(
            role=agent_data['role'],
            goal=agent_data['goal'],
            backstory=agent_data['backstory'],
            verbose=True,
            memory=True
        )
        # Map each agent to its unique agent_id
        agents[agent_data['id']] = agent
    
    # Initialize variables to track task outputs and the manager agent
    task_outputs = {}  # Dictionary to store task outputs for each agent
    refined_tasks = []  # List of tasks refined by the manager
    
    # Add the Manager Agent
    manager_agent = create_manager_agent()
    agents['manager'] = manager_agent  # Add the manager agent to the list of agents

    # Create tasks and have the manager refine them before execution
    for task_data in tasks_data:
        agent_id = task_data['agent_id']  # Find the agent responsible for the task
        
        if agent_id not in agents:
            raise ValueError(f"Agent with id {agent_id} not found for task {task_data['id']}.")
        
        # If this is the first task, provide the user input to the description
        if not task_outputs:  # If no tasks have been executed yet
            task_description = f"{task_data['description']}\n\nUser input: {input_str}"
        else:
            # For subsequent tasks, pass the output of the previous task(s) instead of user input
            task_description = task_data['description']
        
        # Manager refines the task before assigning it to the agent
        agent_role = agents[agent_id].role
        previous_output = task_outputs.get(agent_role, '')  # Get the output of the previous task for refinement
        refined_description = refine_task(manager_agent, task_description, agent_role, previous_output)
        
        # Create the refined task
        task = Task(
            description=refined_description,
            expected_output=task_data['expected_output'],
            agent=agents[agent_id],  # Assign the task to the correct agent
            async_execution=False
        )
        refined_tasks.append(task)  # Store the refined task

    # Create the crew with all refined tasks and agents
    crew = Crew(
        agents=list(agents.values()),  # Include all agents (including the manager)
        tasks=refined_tasks,  # Use the refined tasks
        process=Process.sequential  # Tasks will be executed in sequence
    )
    
    # Execute the crew and return the result
    result = crew.kickoff(inputs={'input': input_str})

    # After each task is executed, collect the output and store it in task_outputs
    for task in refined_tasks:
        task_outputs[task.agent.role] = task.output  # Store the output of each task by agent role

    return result