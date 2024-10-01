import requests
from crewai_tools import SerperDevTool

class BaseTool:
    """Base class for all tools."""
    def execute(self, *args, **kwargs):
        raise NotImplementedError("Tools must implement the 'execute' method.")

class FetchContractCodeTool(BaseTool):
    """Tool for fetching contract code."""
    def execute(self):
        user_input = input("Enter contract address and name (format: address.name): ")
        contract_address, contract_name = user_input.split('.')
        source_url = f"https://api.hiro.so/v2/contracts/source/{contract_address}/{contract_name}"
        
        response = requests.get(source_url)
        if response.status_code == 200:
            source_data = response.json()
            return f"Source Data: {source_data}"
        else:
            return f"Failed to fetch source data: {response.status_code}"

class FetchInterfaceDataTool(BaseTool):
    """Tool for fetching contract interface data."""
    def execute(self):
        user_input = input("Enter contract address and name (format: address.name): ")
        contract_address, contract_name = user_input.split('.')
        interface_url = f"https://api.hiro.so/v2/contracts/interface/{contract_address}/{contract_name}"
        
        response = requests.get(interface_url)
        if response.status_code == 200:
            interface_data = response.json()
            return f"Interface Data: {interface_data}"
        else:
            return f"Failed to fetch interface data: {response.status_code}"

# Initialize tools in a structured way
def initialize_tools():
    """
    Initialize and return a dictionary of available tools.
    """
    return {
        "web_search": SerperDevTool(),  # Example of SerperDevTool
        "fetch_contract_code": FetchContractCodeTool(),
        "fetch_interface_data": FetchInterfaceDataTool(),
    }
