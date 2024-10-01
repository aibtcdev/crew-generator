from crewai_tools import SerperDevTool
from .fetch_contract_code_tool import FetchContractCodeTool
from .fetch_interface_data_tool import FetchInterfaceDataTool

def initialize_tools():
    """
    Initialize and return a dictionary of available tools.
    """
    return {
        "web_search": SerperDevTool(),  
        "fetch_contract_code": FetchContractCodeTool(),
        "fetch_interface_data": FetchInterfaceDataTool(),
    }

def get_agent_tools(tool_names, tools_map):
    """
    Get the tools for an agent based on the tool names.
    
    Args:
        tool_names (list): List of tool names for the agent.
        tools_map (dict): Dictionary mapping tool names to tool instances.
    
    Returns:
        list: List of tool instances for the agent.
    """
    return [tools_map[name] for name in tool_names if name in tools_map]