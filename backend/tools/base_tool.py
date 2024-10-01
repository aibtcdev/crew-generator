class BaseTool:
    """Base class for all tools."""
    def __init__(self, name: str, description: str, args: dict):
        self.name = name
        self.description = description
        self.args = args  # Arguments schema for the tool

    def invoke(self, *args, **kwargs):
        raise NotImplementedError("Tools must implement the 'invoke' method.")