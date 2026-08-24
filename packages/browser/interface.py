from typing import Any, cast
from playwright.async_api import Page, ElementHandle

class RestrictedBrowser:
    """
    A narrow wrapper around Playwright's Page object to expose only secure,
    permitted actions for the LLM explorer. It explicitly prevents arbitrary
    evaluation, shell access, or insecure interactions.
    """

    def __init__(self, page: Page):
        self._page = page
        self._network_metadata: list[dict[str, Any]] = []
        
        self._page.on("request", lambda request: self._network_metadata.append({
            "type": "request",
            "url": request.url,
            "method": request.method,
        }))
        self._page.on("response", lambda response: self._network_metadata.append({
            "type": "response",
            "url": response.url,
            "status": response.status,
        }))

    def clearNetworkMetadata(self) -> None:
        """Clear the collected network metadata (e.g., between steps)."""
        self._network_metadata.clear()

    async def navigate(self, url: str, timeout_ms: int = 30000) -> None:
        """Navigate to a specified URL."""
        await self._page.goto(url, wait_until="networkidle", timeout=timeout_ms)

    async def click(self, selector: str) -> None:
        """Click an element matching the selector."""
        await self._page.click(selector)

    async def fill(self, selector: str, value: str) -> None:
        """Fill an input field with the specified value."""
        await self._page.fill(selector, value)

    async def select(self, selector: str, value: str) -> None:
        """Select an option in a <select> element."""
        await self._page.select_option(selector, value)

    async def submit(self, selector: str) -> None:
        """Submit a form. Can often just be a click on the submit button, or pressing Enter."""
        await self._page.press(selector, "Enter")

    async def goBack(self) -> None:
        """Navigate back in history."""
        await self._page.go_back(wait_until="networkidle")

    async def reload(self) -> None:
        """Reload the current page."""
        await self._page.reload(wait_until="networkidle")

    async def wait(self, timeout_ms: int = 1000) -> None:
        """Wait for a specified number of milliseconds."""
        await self._page.wait_for_timeout(timeout_ms)

    async def extractVisibleText(self) -> str:
        """Extract all visible text from the body of the page."""
        try:
            val = await self._page.evaluate("document.body ? document.body.innerText : ''")
            return cast(str, val)
        except Exception:
            return ""

    async def inspectLinks(self) -> list[dict[str, str]]:
        """Return a list of visible links on the page with their text and hrefs."""
        try:
            val = await self._page.evaluate('''() => {
                if (!document.body) return [];
                const links = Array.from(document.querySelectorAll('a'));
                return links.filter(l => l.offsetParent !== null).map(l => ({
                    text: l.innerText.trim(),
                    href: l.href
                }));
            }''')
            return cast(list[dict[str, str]], val)
        except Exception:
            return []

    async def inspectForms(self) -> list[dict[str, Any]]:
        """Return a list of forms and their inputs on the page."""
        try:
            val = await self._page.evaluate('''() => {
                if (!document.body) return [];
                const forms = Array.from(document.querySelectorAll('form'));
                return forms.map(f => {
                    const inputs = Array.from(f.querySelectorAll('input, select, textarea'));
                    return {
                        action: f.getAttribute('action') || '',
                        method: f.getAttribute('method') || 'GET',
                        inputs: inputs.map(i => ({
                            name: i.name,
                            type: i.type,
                            required: i.required,
                            placeholder: i.placeholder || ''
                        }))
                    };
                });
            }''')
            return cast(list[dict[str, Any]], val)
        except Exception:
            return []

    async def inspectNetworkMetadata(self) -> list[dict[str, Any]]:
        """
        Inspect network metadata collected during the session.
        """
        return self._network_metadata

    async def screenshot(self) -> bytes:
        """Take a full page screenshot."""
        return await self._page.screenshot(full_page=True)

    # Note: no generic page.evaluate() or page.evaluate_handle() exposed to the caller.
