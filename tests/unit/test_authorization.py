import pytest

from packages.domain.models import (
    Organization,
    OrganizationMembership,
    Project,
    ProjectMembership,
    Role,
    User,
)
from packages.security.authorization import AuthorizationService


@pytest.fixture
def authz_service():
    return AuthorizationService()

@pytest.fixture
def user_a():
    return User(id="user_a", email="a@test.com")

@pytest.fixture
def user_b():
    return User(id="user_b", email="b@test.com")

@pytest.fixture
def org_1(user_a):
    org = Organization(id="org_1", name="Org 1")
    mem = OrganizationMembership(user_id=user_a.id, organization_id=org.id, role=Role.OWNER)
    org.members.append(mem)
    return org

@pytest.fixture
def project_1(org_1):
    proj = Project(id="proj_1", name="Proj 1", organization_id=org_1.id)
    proj.organization = org_1
    return proj

def test_owner_can_manage_org(authz_service, user_a, org_1):
    assert authz_service.can_manage_organization(user_a, org_1) is True

def test_non_member_cannot_manage_org(authz_service, user_b, org_1):
    assert authz_service.can_manage_organization(user_b, org_1) is False

def test_owner_can_edit_project(authz_service, user_a, project_1):
    # user_a is owner of org_1, so inherits permissions for project_1
    assert authz_service.can_edit_project(user_a, project_1) is True

def test_non_member_cannot_view_project(authz_service, user_b, project_1):
    assert authz_service.can_view_project(user_b, project_1) is False

def test_project_viewer_can_view_but_not_edit(authz_service, user_b, project_1):
    # Add user_b directly to project as viewer
    mem = ProjectMembership(user_id=user_b.id, project_id=project_1.id, role=Role.VIEWER)
    project_1.members.append(mem)
    
    assert authz_service.can_view_project(user_b, project_1) is True
    assert authz_service.can_edit_project(user_b, project_1) is False
    assert authz_service.can_manage_credentials(user_b, project_1) is False
    assert authz_service.can_start_test_run(user_b, project_1) is False
    assert authz_service.can_view_evidence(user_b, project_1) is True

def test_project_member_can_start_run(authz_service, user_b, project_1):
    mem = ProjectMembership(user_id=user_b.id, project_id=project_1.id, role=Role.MEMBER)
    project_1.members.append(mem)
    
    assert authz_service.can_view_project(user_b, project_1) is True
    assert authz_service.can_start_test_run(user_b, project_1) is True
    assert authz_service.can_edit_project(user_b, project_1) is False

def test_owner_with_project_viewer_role_can_edit_project(authz_service, user_a, project_1):
    # user_a is OWNER of org_1, but is added as VIEWER to project_1
    # They should retain OWNER privileges.
    mem = ProjectMembership(user_id=user_a.id, project_id=project_1.id, role=Role.VIEWER)
    project_1.members.append(mem)
    
    assert authz_service.can_edit_project(user_a, project_1) is True

