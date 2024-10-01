import os
import logging
from crewai_tools import SerperDevTool, CodeDocsSearchTool

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Set your API key for SerperDevTool
os.environ["SERPER_API_KEY"] = "helloworld"

# Initialize tools
web_search_tool = SerperDevTool()  # For web search

def search_web(query):
    """Perform a web search using the SerperDevTool."""
    result = web_search_tool.run(query)
    return result

# Ensure the function has a __name__ attribute
search_web.__name__ = "search_web"

# Create a mapping of tool names to functions
tools_map = {
    "search_web": search_web,
}

def get_tool(tool_name):
    """
    Retrieve a tool function by its name.
    
    Args:
        tool_name (str): The name of the tool to retrieve.
    
    Returns:
        function: The tool function if found, None otherwise.
    """
    logger.debug(f"Attempting to get tool: {tool_name}")
    tool = tools_map.get(tool_name)
    if tool:
        logger.debug(f"Tool found: {tool}")
        if not hasattr(tool, '__name__'):
            logger.warning(f"Tool {tool_name} doesn't have a __name__ attribute. Setting it now.")
            tool.__name__ = tool_name
        return tool
    else:
        logger.warning(f"Tool {tool_name} not found in tools_map")
        return None