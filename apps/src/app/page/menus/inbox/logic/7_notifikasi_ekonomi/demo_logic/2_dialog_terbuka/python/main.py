from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .dialog_AI.reaction_logic import apply_choice
from .dialog_user.choice_manager import generate_choices
from .shared.schemas import NegotiateChoiceRequest, NegotiateChoiceResponse

app = FastAPI(title="Forum Dialog Terbuka")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}

@app.post("/api/negotiate-choice", response_model=NegotiateChoiceResponse)
def negotiate_choice(request: NegotiateChoiceRequest) -> NegotiateChoiceResponse:
    try:
        status, response, events = apply_choice(request.choice, request.npc_state, request.player_state)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    done = status != "ongoing"
    return NegotiateChoiceResponse(status=status, npc_state=request.npc_state, player_state=request.player_state,
        npc_response=response, choices=None if done else generate_choices(request.npc_state), events=events)
