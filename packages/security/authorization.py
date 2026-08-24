from typing import cast

from packages.domain.models import Organization, Project, Role, User


def get_role_hierarchy_value(role: Role) -> int:
    hierarchy = {
        Role.VIEWER: 1,
        Role.MEMBER: 2,
        Role.ADMIN: 3,
        Role.OWNER: 4
    }
    return hierarchy.get(role, 0)

def has_minimum_role(user_role: Role, required_role: Role) -> bool:
    return get_role_hierarchy_value(user_role) >= get_role_hierarchy_value(required_role)

class AuthorizationError(Exception):
    pass

class AuthorizationService:
    @staticmethod
    def _get_project_role(user: User, project: Project) -> Role | None:
        best_role = None
        
        # Check direct project membership
        for pm in project.members:
            if pm.user_id == user.id:
                best_role = cast(Role, pm.role)
                break
        
        # Check organization membership (inherits role)
        if project.organization:
            for om in project.organization.members:
                if om.user_id == user.id:
                    role_val = cast(Role, om.role)
                    if best_role is None or get_role_hierarchy_value(role_val) > get_role_hierarchy_value(best_role):
                        best_role = role_val
                    break
        
        return best_role

    @staticmethod
    def _get_org_role(user: User, org: Organization) -> Role | None:
        for om in org.members:
            if om.user_id == user.id:
                return cast(Role, om.role)
        return None

    def can_view_project(self, user: User, project: Project) -> bool:
        role = self._get_project_role(user, project)
        return role is not None and has_minimum_role(role, Role.VIEWER)

    def can_edit_project(self, user: User, project: Project) -> bool:
        role = self._get_project_role(user, project)
        return role is not None and has_minimum_role(role, Role.ADMIN)

    def can_manage_credentials(self, user: User, project: Project) -> bool:
        role = self._get_project_role(user, project)
        return role is not None and has_minimum_role(role, Role.ADMIN)

    def can_manage_targets(self, user: User, project: Project) -> bool:
        role = self._get_project_role(user, project)
        return role is not None and has_minimum_role(role, Role.ADMIN)


    def can_start_test_run(self, user: User, project: Project) -> bool:
        role = self._get_project_role(user, project)
        return role is not None and has_minimum_role(role, Role.MEMBER)

    def can_view_evidence(self, user: User, project: Project) -> bool:
        role = self._get_project_role(user, project)
        return role is not None and has_minimum_role(role, Role.VIEWER)

    def can_manage_billing(self, user: User, org: Organization) -> bool:
        role = self._get_org_role(user, org)
        return role is not None and has_minimum_role(role, Role.OWNER)

    def can_manage_organization(self, user: User, org: Organization) -> bool:
        role = self._get_org_role(user, org)
        return role is not None and has_minimum_role(role, Role.ADMIN)
