from pydantic import BaseModel
from typing import Optional

# Model representing crew results
class CrewResultInsert(BaseModel):
    crew_id: int
    actual_output: Optional[str] = None
