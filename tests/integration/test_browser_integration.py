import os
import pytest
import pytest_asyncio
from playwright.async_api import async_playwright
from packages.browser.interface import RestrictedBrowser

@pytest_asyncio.fixture
async def real_browser():
    """Fixture that provides a real Playwright page and yields a RestrictedBrowser instance."""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        restricted_browser = RestrictedBrowser(page)
        yield restricted_browser
        await browser.close()

@pytest.mark.asyncio
async def test_integration_restricted_browser_extraction(real_browser):
    # Navigate to the deterministic local file
    file_path = os.path.join(os.path.dirname(__file__), "dummy_app.html")
    file_url = f"file:///{file_path.replace(os.sep, '/')}"
    
    await real_browser.navigate(file_url)
    
    # Test text extraction
    text = await real_browser.extractVisibleText()
    assert "Welcome to Dummy App" in text
    assert "This is a deterministic test page" in text

    # Test link extraction
    links = await real_browser.inspectLinks()
    assert len(links) == 2
    assert links[0]["text"] == "Login"
    assert "/login" in links[0]["href"]
    assert links[1]["text"] == "About Us"

    # Test form extraction
    forms = await real_browser.inspectForms()
    assert len(forms) == 1
    form = forms[0]
    assert form["method"].upper() == "POST"
    assert "/submit-login" in form["action"]
    assert len(form["inputs"]) == 2 # username, password (button is excluded from inputs query)

@pytest.mark.asyncio
async def test_integration_restricted_browser_interaction(real_browser):
    file_path = os.path.join(os.path.dirname(__file__), "dummy_app.html")
    file_url = f"file:///{file_path.replace(os.sep, '/')}"
    
    await real_browser.navigate(file_url)
    real_browser.clearNetworkMetadata()
    
    # Interact with the page
    await real_browser.fill("input[name='username']", "testuser")
    await real_browser.fill("input[name='password']", "password123")
    
    # Click the submit button directly
    await real_browser.click("#submit-btn")
    
    # Wait for the network idle or a short timeout to let fetch finish
    await real_browser.wait(500)
    
    # Validate interaction effect
    text = await real_browser.extractVisibleText()
    assert "Login simulated" in text
    
    # Validate network metadata captured the fetch
    network_metadata = await real_browser.inspectNetworkMetadata()
    requests = [m for m in network_metadata if m["type"] == "request"]
    assert any("/api/login-attempt" in req["url"] and req["method"] == "POST" for req in requests)
