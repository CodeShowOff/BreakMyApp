import typer
import json
import os
from pathlib import Path
from rich.console import Console

from .test_command import run_test
from .client import BreakMyAppClient

app = typer.Typer(help="BreakMyApp Developer CLI")
console = Console()

project_app = typer.Typer()
app.add_typer(project_app, name="project", help="Manage BreakMyApp projects")

target_app = typer.Typer()
app.add_typer(target_app, name="target", help="Manage targets")

rules_app = typer.Typer()
app.add_typer(rules_app, name="rules", help="Manage rules")

CONFIG_PATH = Path(os.path.expanduser("~/.breakmyapp/credentials.json"))

def get_token() -> str | None:
    if CONFIG_PATH.exists():
        try:
            with open(CONFIG_PATH, "r") as f:
                data = json.load(f)
                if isinstance(data, dict):
                    token = data.get("token")
                    if isinstance(token, str):
                        return token
        except Exception:
            return None
    return os.getenv("BREAKMYAPP_TOKEN")

@app.command()
def login(token: str = typer.Option(..., prompt=True, hide_input=True)):
    """Authenticate with BreakMyApp Control Plane."""
    CONFIG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(CONFIG_PATH, "w") as f:
        json.dump({"token": token}, f)
    console.print("[green]Successfully logged in![/green]")

@project_app.command("init")
def project_init():
    """Initialize a new BreakMyApp project in the current directory."""
    config_file = Path(".breakmyapp.yml")
    if config_file.exists():
        console.print("[yellow]Config file already exists.[/yellow]")
        return
        
    boilerplate = """target:
  url: https://staging.example.com

roles:
  - name: customer_a
    credential: customer-a

  - name: customer_b
    credential: customer-b

strategies:
  - cross_account
  - role_boundary
  - entitlement
  - sensitive_data
  - business_rules

fail_on:
  - confirmed_critical
  - confirmed_high
"""
    with open(config_file, "w") as f:
        f.write(boilerplate)
    console.print("[green]Initialized .breakmyapp.yml[/green]")

@target_app.command("add")
def target_add(url: str):
    """Add a target to the project configuration."""
    console.print(f"[yellow]Target add is a stub for adding {url} to .breakmyapp.yml[/yellow]")

@rules_app.command("add")
def rules_add(rule: str):
    """Add a rule to the project configuration."""
    console.print(f"[yellow]Rules add is a stub for adding {rule} to .breakmyapp.yml[/yellow]")

@app.command()
def test(
    config: str = typer.Option(".breakmyapp.yml", "--config", "-c", help="Path to config file"),
    api_url: str = typer.Option("https://api.breakmyapp.com", "--api-url", envvar="BREAKMYAPP_API_URL"),
    oidc_token: str = typer.Option(None, "--oidc-token", help="GitHub OIDC token for short-lived access", envvar="ACTIONS_ID_TOKEN_REQUEST_TOKEN"),
    ci: bool = typer.Option(False, "--ci", help="Run in CI mode")
):
    """Run tests against the target application."""
    token = get_token()
    run_test(config_path=config, api_url=api_url, token=token, oidc_token=oidc_token, ci=ci)

@app.command()
def findings(project_id: str = "default"):
    """View verified findings for the project."""
    client = BreakMyAppClient(base_url="https://api.breakmyapp.com", token=get_token())
    results = client.get_findings(project_id)
    if not results:
        console.print("No findings available.")
        return
    for f in results:
        console.print(f"- {f['id']}: {f['title']} ({f['severity']})")

@app.command()
def retest(finding_id: str):
    """Retest a specific finding."""
    client = BreakMyAppClient(base_url="https://api.breakmyapp.com", token=get_token())
    run_id = client.trigger_retest(finding_id)
    console.print(f"[green]Triggered retest {run_id} for finding {finding_id}[/green]")

@app.command()
def baseline(finding_ids: list[str]):
    """Mark findings as baseline/acceptable."""
    client = BreakMyAppClient(base_url="https://api.breakmyapp.com", token=get_token())
    client.mark_baseline(finding_ids)
    console.print(f"[green]Marked {len(finding_ids)} findings as baseline.[/green]")

if __name__ == "__main__":
    app()
