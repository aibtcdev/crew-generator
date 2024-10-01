import requests
from .base_tool import BaseTool

class FetchInterfaceDataTool(BaseTool):
    """Tool for fetching contract interface data."""
    def __init__(self):
        super().__init__(
            name="FetchInterfaceDataTool", 
            description="Fetches the interface data for a given contract address and name.",
            args={"contract_address": {"type": "string"}, "contract_name": {"type": "string"}}
        )
    
    def invoke(self, contract_address, contract_name):
        interface_url = f"https://api.hiro.so/v2/contracts/interface/{contract_address}/{contract_name}"
        
        # Fetch data from the interface endpoint
        response = requests.get(interface_url)
        if response.status_code == 200:
            interface_data = response.json()
            return f"Interface Data: {interface_data}"
        else:
            return f"Failed to fetch interface data: {response.status_code}"