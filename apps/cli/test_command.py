import time
import sys
from rich.console import Console
from rich.table import Table
from rich.live import Live
from rich.spinner import Spinner

from .config import load_config
from .client import BreakMyAppClient

console = Console()

def run_test(
    config_path: str,
    api_url: str,
    token: str | None = None,
    oidc_token: str | None = None,
    ci: bool = False
):
    try:
        config = load_config(config_path)
    except Exception as e:
        console.print(f"[red]Error loading config: {e}[/red]")
        sys.exit(1)
        
    client = BreakMyAppClient(base_url=api_url, token=token)
    
    if oidc_token:
        try:
            real_token = client.exchange_oidc_token(oidc_token)
            client = BreakMyAppClient(base_url=api_url, token=real_token)
            console.print("[green]Successfully exchanged OIDC token.[/green]")
        except Exception as e:
            console.print(f"[red]OIDC exchange failed: {e}[/red]")
            sys.exit(1)
            
    if not client.token:
        console.print("[red]No authentication token provided. Use --token or --oidc-token.[/red]")
        sys.exit(1)

    console.print(f"Targeting: [bold]{config.target.url}[/bold]")
    console.print(f"Strategies: {', '.join(config.strategies)}")
    
    try:
        run_id = client.start_test_run(project_id="default", config_data=config.model_dump())
        console.print(f"Test run started: [bold]{run_id}[/bold]")
    except Exception as e:
        console.print(f"[red]Failed to start test run: {e}[/red]")
        sys.exit(1)

    with Live(Spinner("dots", text="Running tests..."), refresh_per_second=4, console=console) as live:
        while True:
            try:
                status_data = client.get_test_run_status(run_id)
                status = status_data.get("status")
                
                if status == "completed":
                    live.update("[green]Test run completed.[/green]")
                    break
                elif status in ["failed", "cancelled", "timed_out", "policy_blocked"]:
                    live.update(f"[red]Test run ended with status: {status}[/red]")
                    sys.exit(1)
                
                time.sleep(2)
            except Exception as e:
                live.update(f"[red]Error checking status: {e}[/red]")
                time.sleep(2)

    findings = status_data.get("findings", [])
    
    if not findings:
        console.print("\n[green]No verified findings discovered. Great job![/green]")
        sys.exit(0)
        
    console.print(f"\n[bold red]Discovered {len(findings)} verified findings:[/bold red]")
    
    table = Table(show_header=True, header_style="bold magenta")
    table.add_column("ID", style="dim", width=12)
    table.add_column("Severity")
    table.add_column("Title")
    
    for f in findings:
        table.add_row(f["id"], f["severity"], f["title"])
        
    console.print(table)
    
    # Check fail_on criteria
    fail_thresholds = set(config.fail_on)
    failed = False
    for f in findings:
        if f["severity"] in fail_thresholds:
            failed = True
            break
            
    if failed:
        console.print(f"\n[bold red]CI Failure Threshold Met! Found findings matching: {config.fail_on}[/bold red]")
        sys.exit(1)
    else:
        console.print("\n[green]Findings do not meet CI failure threshold. Passing.[/green]")
        sys.exit(0)
