from .main import confirm_policy, negotiate_choice
from .shared.schemas import ConfirmPolicyRequest, NegotiateChoiceRequest

response = negotiate_choice(NegotiateChoiceRequest.model_validate({
    "choice": "CONCESSION",
    "npc_state": {"anger_level": 75, "trust_level": 30, "patience": 3, "memory": {}},
    "player_state": {"budget": 100000},
}))
assert response.status == "ongoing" and len(response.choices) == 3

policy_response = confirm_policy(ConfirmPolicyRequest.model_validate({
    "policy_type": "price",
    "demand_text": "Stabilkan harga BERAS",
    "policy_changes": ["beras: 25.000"],
    "npc_state": {"anger_level": 70, "trust_level": 30, "patience": 3, "memory": {}},
    "player_state": {"budget": 100000},
}))
assert "Stabilkan harga BERAS" in policy_response.npc_response
assert "beras: 25.000" in policy_response.npc_response
assert policy_response.npc_state.anger_level == 56
assert policy_response.npc_state.trust_level == 48

same_route_response = negotiate_choice(NegotiateChoiceRequest.model_validate({
    "choice": "CONCESSION",
    "policy_type": "subsidy",
    "demand_text": "Pulihkan program Subsidi Bahan Bakar",
    "policy_changes": ["Subsidi Bahan Bakar: subsidi dipulihkan/diaktifkan"],
    "npc_state": {"anger_level": 70, "trust_level": 30, "patience": 3, "memory": {}},
    "player_state": {"budget": 100000},
}))
assert "Pulihkan program Subsidi Bahan Bakar" in same_route_response.npc_response
assert "Subsidi Bahan Bakar: subsidi dipulihkan/diaktifkan" in same_route_response.npc_response

for policy_type, demand, change in (
    ("tax", "Batalkan kenaikan Pajak Pertambahan Nilai (PPN)", "PPN: 5%"),
    ("subsidy", "Pulihkan program Subsidi Pangan", "Subsidi Pangan: subsidi dipulihkan/diaktifkan"),
):
    response = confirm_policy(ConfirmPolicyRequest.model_validate({
        "policy_type": policy_type,
        "demand_text": demand,
        "policy_changes": [change],
        "npc_state": {"anger_level": 70, "trust_level": 30, "patience": 3, "memory": {}},
        "player_state": {"budget": 100000},
    }))
    assert demand in response.npc_response
    assert change in response.npc_response

print("self-check: ok")
