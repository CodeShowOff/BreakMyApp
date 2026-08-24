from collections.abc import AsyncGenerator
from typing import Any

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from packages.domain.database import Base, get_db
from packages.domain.models import Organization, OrganizationMembership, Project, Role, User
from services.api.main import app

# Use an in-memory SQLite database for integration tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestingSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with TestingSessionLocal() as session:
        yield session

app.dependency_overrides[get_db] = override_get_db

@pytest_asyncio.fixture(autouse=True)
async def setup_db() -> AsyncGenerator[None, None]:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest_asyncio.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client: 
        yield client

@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with TestingSessionLocal() as session:
        yield session

@pytest_asyncio.fixture
async def setup_test_data(db_session: AsyncSession) -> dict[str, Any]:
    user_a = User(id="user_a", email="a@test.com")
    user_b = User(id="user_b", email="b@test.com")
    db_session.add_all([user_a, user_b])
    
    org_1 = Organization(id="org_1", name="Org 1")
    org_2 = Organization(id="org_2", name="Org 2")
    db_session.add_all([org_1, org_2])
    
    # user_a is owner of org 1
    org_1_mem = OrganizationMembership(user_id=user_a.id, organization_id=org_1.id, role=Role.OWNER)
    # user_b is owner of org 2
    org_2_mem = OrganizationMembership(user_id=user_b.id, organization_id=org_2.id, role=Role.OWNER)
    db_session.add_all([org_1_mem, org_2_mem])
    
    # project for org 1
    project_1 = Project(id="proj_1", name="Project 1", organization_id=org_1.id)
    db_session.add(project_1)
    
    await db_session.commit()
    return {"user_a": user_a, "user_b": user_b, "org_1": org_1, "org_2": org_2, "project_1": project_1}

@pytest.mark.asyncio
async def test_unauthenticated_access(async_client: AsyncClient) -> None:
    response = await async_client.get("/api/v1/projects?organization_id=org_1")
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_authenticated_cross_tenant_access_attempt(async_client: AsyncClient, setup_test_data: dict[str, Any]) -> None:
    # User B tries to access Org 1's projects
    response = await async_client.get(
        "/api/v1/projects?organization_id=org_1",
        headers={"X-Dummy-User-Id": "user_b"}
    )
    assert response.status_code == 403

@pytest.mark.asyncio
async def test_authenticated_owner_can_create_project(async_client: AsyncClient, setup_test_data: dict[str, Any]) -> None:
    # User A tries to create project in Org 1
    response = await async_client.post(
        "/api/v1/projects",
        json={"name": "New Project", "organization_id": "org_1"},
        headers={"X-Dummy-User-Id": "user_a"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "New Project"

@pytest.mark.asyncio
async def test_viewer_cannot_create_project(async_client: AsyncClient, db_session: AsyncSession, setup_test_data: dict[str, Any]) -> None:
    # Add User B to Org 1 as a viewer
    viewer_mem = OrganizationMembership(user_id="user_b", organization_id="org_1", role=Role.VIEWER)
    db_session.add(viewer_mem)
    await db_session.commit()

    # User B tries to create project in Org 1
    response = await async_client.post(
        "/api/v1/projects",
        json={"name": "Another Project", "organization_id": "org_1"},
        headers={"X-Dummy-User-Id": "user_b"}
    )
    assert response.status_code == 403

@pytest.mark.asyncio
async def test_access_project_directly_cross_tenant(async_client: AsyncClient, setup_test_data: dict[str, Any]) -> None:
    # User B tries to get project 1 directly by ID
    response = await async_client.get(
        "/api/v1/projects/proj_1",
        headers={"X-Dummy-User-Id": "user_b"}
    )
    assert response.status_code == 403
