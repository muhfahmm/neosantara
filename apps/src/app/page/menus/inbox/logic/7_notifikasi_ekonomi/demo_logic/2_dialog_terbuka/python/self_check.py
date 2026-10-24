from fastapi.testclient import TestClient
from .main import app

client = TestClient(app)
response = client.post("/api/negotiate-choice", json={"choice":"CONCESSION","npc_state":{"anger_level":75,"trust_level":30,"patience":3,"memory":{}},"player_state":{"budget":100000}})
assert response.status_code == 200
body = response.json()
assert body["status"] == "ongoing" and len(body["choices"]) == 3
print("self-check: ok")
