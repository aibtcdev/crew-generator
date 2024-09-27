from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_execute_crew():
    response = client.get("/execute_crew/8")  # Test for crew_id=1
    assert response.status_code == 200
    assert "result" in response.json()
