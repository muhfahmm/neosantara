"""
FastAPI Server & Standalone CLI untuk Kontrol Pergerakan & Tembakan AI Perang.
Dapat dijalankan langsung dengan:
    python -m uvicorn main:app --host 127.0.0.1 --port 8001 --reload
atau dipanggil via CLI / subprocess.
"""

import sys
import json
from typing import List, Optional, Dict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .ai_combat_engine import (
    UnitState,
    TacticalAIResponse,
    compute_ai_war_cycle
)

app = FastAPI(title="Neosantara AI War Combat Controller")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AIWarCycleRequest(BaseModel):
    enemy_units: List[UnitState]
    user_units: List[UnitState]
    map_bounds: Optional[Dict[str, float]] = None


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Neosantara AI War Combat Controller"}


@app.post("/api/ai-war-cycle", response_model=TacticalAIResponse)
async def handle_ai_war_cycle(req: AIWarCycleRequest) -> TacticalAIResponse:
    """
    Endpoint pemrosesan pergerakan taktis dan keputusan tembakan unit AI secara non-blocking asynchronous.
    """
    try:
        response = compute_ai_war_cycle(
            enemy_units=req.enemy_units,
            user_units=req.user_units,
            map_bounds=req.map_bounds
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal menghitung AI cycle: {str(e)}")


def cli_main():
    """
    Memungkinkan eksekusi langsung via CLI / Subprocess:
    python main.py '{"enemy_units": [...], "user_units": [...]}'
    """
    if len(sys.argv) > 1:
        raw_input = sys.argv[1]
        try:
            data = json.loads(raw_input)
            enemy = [UnitState(**u) for u in data.get("enemy_units", [])]
            user = [UnitState(**u) for u in data.get("user_units", [])]
            bounds = data.get("map_bounds", None)
            res = compute_ai_war_cycle(enemy, user, bounds)
            print(res.model_dump_json(indent=2))
        except Exception as err:
            sys.stderr.write(f"Error parsing CLI input: {err}\n")
            sys.exit(1)
    else:
        import uvicorn
        uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=True)


if __name__ == "__main__":
    cli_main()
