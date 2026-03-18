import re
from playwright.sync_api import sync_playwright

def run(playwright):
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    modified_content = content.replace("function clearForm() {", "window.addEventListener('trigger-clear', clearForm);\nfunction clearForm() {")

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(modified_content)

    try:
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Let firebase load but mock it? No, if we block it, module execution fails and clearForm is never registered!
        # Ah! `import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";`
        # Since we blocked gstatic.com, the module fails to load, so clearForm doesn't even exist in the JS environment!

        def handle_route(route):
            url = route.request.url
            if "google-analytics" in url or "pdfmake" in url:
                route.abort()
            else:
                route.continue_()

        page.route("**/*", handle_route)
        page.on("console", lambda msg: print(f"Console: {msg.text}"))

        page.goto("http://localhost:8000/index.html")
        page.wait_for_load_state('networkidle')

        input_ids = ['numer_sprawy', 'adresat', 'adres_cz1', 'adres_cz2', 'kod_pocztowy', 'poczta', 'uwagi_potwierdzenia', 'dotyczy_potwierdzenia']
        for input_id in input_ids:
            page.evaluate(f"document.getElementById('{input_id}').value = 'TEST'")

        page.wait_for_timeout(500)

        # Dispatch the event
        page.evaluate("window.dispatchEvent(new Event('trigger-clear'))")

        for input_id in input_ids:
            val = page.evaluate(f"document.getElementById('{input_id}').value")
            if val != "":
                print(f"Failed to clear #{input_id}. Value: {val}")
                exit(1)

        print("Success: form successfully cleared.")

        context.close()
        browser.close()
    finally:
        with open('index.html', 'w', encoding='utf-8') as f:
            f.write(content)

with sync_playwright() as playwright:
    run(playwright)
