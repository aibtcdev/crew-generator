import requests
from .base_tool import BaseTool

class FetchContractCodeTool(BaseTool):
    """Tool for fetching contract code."""
    def __init__(self):
        super().__init__(
            name="FetchContractCodeTool", 
            description="Fetches the contract code for a given address and name.",
            args={"contract_address": {"type": "string"}, "contract_name": {"type": "string"}}
        )
    
    def invoke(self, contract_address, contract_name):
        source_url = f"https://api.hiro.so/v2/contracts/source/{contract_address}/{contract_name}"
        
        # Fetch data from the source endpoint
        response = requests.get(source_url)
        if response.status_code == 200:
            source_data = response.json()
            return f"Source Data: {source_data}"
        else:
            return f"Failed to fetch source data: {response.status_code}"