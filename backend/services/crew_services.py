from backend.db.supabase_client import supabase
from crewai import Agent, Task, Crew, Process
from dotenv import load_dotenv
from backend.tools.tools_factory import initialize_tools, get_agent_tools


load_dotenv()
tools_map = initialize_tools()


# CHECK IF THE TOOLS ARE THERE OR NOT (ONLY FOR DEBUGGING)
print("Available tools:", tools_map)


# FUNCTION TO FETCH THE AGENTS AND TASKS FROM THE SUPABASE TABLE
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


# FUNCTION TO EXECUTE THE CREW
def execute_crew(crew_id: int, input_str: str):
    """
    Execute a crew by fetching agents and tasks for a given crew_id and managing the flow of outputs between tasks.

    Args:
        crew_id (int): ID of the crew to be executed.
        input_str (str): User input to be incorporated into the initial task.

    Returns:
        str: The result of the crew's execution.
    """


    # FETCH AGENTS AND TASK FROM THE CREW_ID
    agents_data, tasks_data = fetch_crew_data(crew_id)


    # CREATE AGENTS AND INDEX THEM BY AGENT_ID
    agents = {}
    for agent_data in agents_data:
        agent_role = agent_data.get('role')
        agent_goal = agent_data.get('goal' )
        agent_backstory = agent_data.get('backstory' )
        agent_tool_names = agent_data.get('agent_tools', [])  


        # THIS IS JUST FOR DEBUGGING
        # Print agent details fetched from the database
        # print(f"Agent Role: {agent_role}")
        # print(f"Agent Goal: {agent_goal}")
        # print(f"Agent Backstory: {agent_backstory}")
        # print(f"Agent Tools: {agent_tool_names}")

        
        # Get the tools for the agent
        # TODO: TOOLS ARE ASSIGNED IN A WAY THAT MATCHES THE NAME OF TOOL FROM FRONTEND AND THEN CHECKS IF THAT TOOL IS HERE OR NOT AND THEN MAPS THAT TOOL TO THE AGENT. IS THERE A BETTER WAY TO DO IT?

        agent_tools = get_agent_tools(agent_tool_names, tools_map)
        if agent_tools:
            print(f"Tools assigned to {agent_role}: {[tool.__class__.__name__ for tool in agent_tools]}")
        else:
            print(f"Agent {agent_role} has no valid tools assigned or tools not mapped correctly.")



        # CREATE THE AGENT WITH THE FETCHED DETAILS
        agent = Agent(
            role=agent_role,
            goal=agent_goal,  
            backstory=agent_backstory,  
            verbose=True,
            memory=True,
            tools=agent_tools  # Assign tools (can be empty)
        )
        # Map each agent to its unique agent_id
        agents[agent_data['id']] = agent
    
    # Dictionary to store task outputs for each agent
    task_outputs = {}  

    # Create tasks from the database and execute them
    tasks = []
    for task_data in tasks_data:
        agent_id = task_data['agent_id']  # Find the agent responsible for the task
        
        if agent_id not in agents:
            raise ValueError(f"Agent with id {agent_id} not found for task {task_data['id']}.")

        # Fetch task-specific details like description and expected_output from the database
        task_description = task_data.get('description')
        task_expected_output = task_data.get('expected_output')

        # Print task details fetched from the database
        print(f"\nTask Description: {task_description}")
        print(f"Expected Output: {task_expected_output}")

        # If this is the first task, provide the user input to the description
        if not task_outputs:  # If no tasks have been executed yet
            task_description = f"{task_description}\n\nuser_input: {input_str}"

        # Create the task
        task = Task(
            description=task_description,  # Use the description from the database
            expected_output=task_expected_output,  # Use the expected output from the database
            agent=agents[agent_id],  # Assign the task to the correct agent
            async_execution=False
        )
        tasks.append(task)  # Store the task

    # Create the crew with all tasks and agents
    crew = Crew(
        agents=list(agents.values()),  # Include all agents
        tasks=tasks,  # Use the tasks fetched from the database
        process=Process.sequential  # Tasks will be executed in sequence
    )
    
    # Log the execution
    print("\n--- Crew Execution Started ---")
    
    # Execute the crew and return the result
    result = crew.kickoff(inputs={'user_input': input_str})

    # After each task is executed, collect the output and store it in task_outputs
    for task in tasks:
        task_outputs[task.agent.role] = task.output  # Store the output of each task by agent role
        
        # Log whether tools were used
        if task.agent.tools:
            print(f"{task.agent.role} used tools: {[tool.__class__.__name__ for tool in task.agent.tools]}")
        else:
            print(f"{task.agent.role} did not use any tools.")

    return result
