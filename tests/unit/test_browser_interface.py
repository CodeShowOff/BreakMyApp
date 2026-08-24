import pytest
from unittest.mock import AsyncMock, MagicMock
from packages.browser.interface import RestrictedBrowser

@pytest.fixture
def mock_page():
    page = AsyncMock()
    page.on = MagicMock()
    
    handlers = {}
    def on_side_effect(event, handler):
        handlers[event] = handler
        
    page.on.side_effect = on_side_effect
    page.emit_event = lambda event, data: handlers[event](data) if event in handlers else None
    
    return page

@pytest.mark.asyncio
async def test_restricted_browser_navigation(mock_page):
    browser = RestrictedBrowser(mock_page)
    await browser.navigate("https://example.com")
    mock_page.goto.assert_called_once_with("https://example.com", wait_until="networkidle", timeout=30000)

@pytest.mark.asyncio
async def test_restricted_browser_click(mock_page):
    browser = RestrictedBrowser(mock_page)
    await browser.click("#submit")
    mock_page.click.assert_called_once_with("#submit")

@pytest.mark.asyncio
async def test_restricted_browser_extract_text(mock_page):
    mock_page.evaluate.return_value = "Hello World"
    browser = RestrictedBrowser(mock_page)
    text = await browser.extractVisibleText()
    assert text == "Hello World"
    mock_page.evaluate.assert_called_once_with("document.body ? document.body.innerText : ''")

@pytest.mark.asyncio
async def test_restricted_browser_network_metadata(mock_page):
    browser = RestrictedBrowser(mock_page)
    
    # Simulate Playwright emitting request and response events
    mock_request = MagicMock()
    mock_request.url = "https://api.example.com/data"
    mock_request.method = "GET"
    
    mock_response = MagicMock()
    mock_response.url = "https://api.example.com/data"
    mock_response.status = 200
    
    mock_page.emit_event("request", mock_request)
    mock_page.emit_event("response", mock_response)
    
    metadata = await browser.inspectNetworkMetadata()
    
    assert len(metadata) == 2
    assert metadata[0]["type"] == "request"
    assert metadata[0]["method"] == "GET"
    assert metadata[1]["type"] == "response"
    assert metadata[1]["status"] == 200
