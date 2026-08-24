from packages.domain.app_model import (
    Action,
    ApplicationModelPayload,
    ConfidenceLevel,
    Object,
    Observation,
    Page,
)


def test_application_model_payload_serialization():
    payload = ApplicationModelPayload(
        pages=[
            Page(id="p1", url_pattern="/login", title="Login Page", description="Login page")
        ],
        actions=[
            Action(id="a1", page_id="p1", name="Submit Login", selector="#submit", method="POST")
        ],
        objects=[
            Object(id="User", name="User", inferred_properties=["email", "role"])
        ],
        observations_log=[
            Observation(
                id="obs_1",
                actor_role="unknown",
                page="/login",
                action="submit",
                visible_effect="Redirected to dashboard",
                confidence=ConfidenceLevel.CONFIRMED
            )
        ]
    )

    data = payload.model_dump()
    
    assert len(data["pages"]) == 1
    assert data["pages"][0]["id"] == "p1"
    assert data["pages"][0]["url_pattern"] == "/login"
    
    assert len(data["actions"]) == 1
    assert data["actions"][0]["name"] == "Submit Login"
    
    assert len(data["objects"]) == 1
    assert data["objects"][0]["name"] == "User"
    
    assert len(data["observations_log"]) == 1
    assert data["observations_log"][0]["confidence"] == "confirmed"

    # Verify deserialization
    reloaded_payload = ApplicationModelPayload(**data)
    assert reloaded_payload.pages[0].id == "p1"
    assert reloaded_payload.observations_log[0].confidence == ConfidenceLevel.CONFIRMED
