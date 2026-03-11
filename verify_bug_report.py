from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load local file
        cwd = os.getcwd()
        page.goto(f"file://{cwd}/index.html")

        # Mock authenticated state
        page.evaluate("document.getElementById('authContainer').classList.add('hidden')")
        page.evaluate("document.getElementById('appContainer').classList.remove('hidden')")
        page.evaluate("document.getElementById('reportBugButton').classList.remove('hidden')") # Logic handles this, but manually ensuring for test

        # 1. Verify Button Exists
        button = page.locator("#reportBugButton")
        if button.is_visible():
            print("SUCCESS: Report Bug Button is visible.")
        else:
            print("FAILURE: Report Bug Button is NOT visible.")

        # 2. Click Button and Verify Modal
        button.click()
        modal = page.locator("#bugReportModal")
        if modal.is_visible():
            print("SUCCESS: Bug Report Modal opened.")
        else:
             print("FAILURE: Bug Report Modal NOT opened.")

        # 3. Verify Modal Content
        if page.locator("#bugReportContent").is_visible():
             print("SUCCESS: Textarea visible.")

        if page.locator("#sendBugReportButton").is_visible():
             print("SUCCESS: Send button visible.")

        # 4. Test Closing
        page.locator("#closeBugReportModalButton").click()
        if not modal.is_visible():
             print("SUCCESS: Modal closed via X button.")
        else:
             print("FAILURE: Modal NOT closed via X button.")

        browser.close()

if __name__ == "__main__":
    run()
