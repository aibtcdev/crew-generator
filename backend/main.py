from fastapi import FastAPI
from backend.api import crew

app = FastAPI()

# Include the crew routes
app.include_router(crew.router)

# Entry point of the FastAPI application
@app.get("/")
async def root():
    return {"message": "CrewAI execution API is running!"}
