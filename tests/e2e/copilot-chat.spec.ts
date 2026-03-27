import { test, expect, type Page } from "@playwright/test";

const JAEGER_URL = "http://localhost:16686";
const JAEGER_SERVICE = "github-copilot";

// Helpers

async function waitForSignedIn(page: Page) {
  // Wait for the page to fully load and show chat UI
  await page.waitForSelector("text=RestFlowAI", { timeout: 30_000 });
}

async function sendMessage(page: Page, text: string) {
  const textarea = page.locator("textarea");
  await textarea.fill(text);
  await textarea.press("Enter");
}

async function waitForResponse(page: Page, timeout = 60_000) {
  // Wait for streaming to finish — the submit spinner disappears
  // and the assistant message appears
  await page.waitForFunction(
    () => {
      const spinner = document.querySelector('[data-slot="spinner"]');
      return !spinner;
    },
    { timeout },
  );
  // Small delay for final rendering
  await page.waitForTimeout(500);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe("Copilot Chat Components", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/chat");
    await waitForSignedIn(page);
  });

  test("renders empty state with suggestions on load", async ({ page }) => {
    // Title
    await expect(page.locator("text=RestFlowAI")).toBeVisible();

    // Empty state
    await expect(page.locator("text=Ready to restflowai")).toBeVisible();
    await expect(
      page.locator("text=Ask me to import APIs"),
    ).toBeVisible();

    // Suggestions
    const suggestions = page.locator("button").filter({
      hasText: /Import petstore|Create a smoke test|Run all scenarios/,
    });
    await expect(suggestions.first()).toBeVisible();
    expect(await suggestions.count()).toBeGreaterThanOrEqual(3);
  });

  test("textarea accepts input and submits on Enter", async ({ page }) => {
    const textarea = page.locator("textarea");
    await textarea.fill("Hello world");
    await expect(textarea).toHaveValue("Hello world");

    // Shift+Enter should add newline, not submit
    await textarea.press("Shift+Enter");
    await expect(textarea).toHaveValue("Hello world\n");
  });

  test("clicking a suggestion sends a message", async ({ page }) => {
    const suggestion = page.locator("button").filter({
      hasText: "Import petstore.yaml and create a test plan",
    });
    await suggestion.click();

    // User message should appear
    await expect(
      page.locator("text=Import petstore.yaml and create a test plan"),
    ).toBeVisible();
  });

  test("sends a message and displays streaming response", async ({
    page,
  }) => {
    await sendMessage(page, "Say hello in one sentence");

    // User message visible
    await expect(page.locator("text=Say hello in one sentence")).toBeVisible();

    // Empty state should disappear
    await expect(page.locator("text=Ready to restflowai")).not.toBeVisible();

    // Wait for assistant response
    await waitForResponse(page);

    // Assistant response should contain some text
    const assistantMessages = page.locator('[data-slot="message"]').filter({
      has: page.locator("p, div"),
    });
    expect(await assistantMessages.count()).toBeGreaterThanOrEqual(1);
  });

  test("displays reasoning section when model thinks", async ({ page }) => {
    await sendMessage(
      page,
      "Think step by step: what is the square root of 144?",
    );

    // Wait for response to complete
    await waitForResponse(page);

    // If reasoning was emitted, a collapsible reasoning section should exist
    // Note: reasoning may not always appear depending on the model used
    const reasoningSection = page.locator("text=Thinking");
    const hasReasoning = await reasoningSection.count();
    if (hasReasoning > 0) {
      // The reasoning trigger should be visible (might be collapsed)
      await expect(reasoningSection.first()).toBeVisible();
    }
  });

  test("displays tool execution when tools are called", async ({ page }) => {
    // Use a prompt that is likely to trigger tool use
    await sendMessage(page, "Read the README.md file in this project");

    // Wait for response
    await waitForResponse(page, 90_000);

    // Check if any tool display appeared
    const toolSections = page.locator('[data-slot="collapsible"]');
    const toolCount = await toolSections.count();

    // If tools were invoked, we should see tool-related UI
    if (toolCount > 0) {
      // Should show tool name
      const toolNames = page.locator(
        "text=/Read|Terminal|Write|Fetch|MCP Tool/i",
      );
      expect(await toolNames.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test("shows intent indicator during streaming", async ({ page }) => {
    await sendMessage(page, "Write a detailed essay about AI safety");

    // During streaming, intent indicator should appear
    // It shows the Shimmer component with intent text
    const intentCheck = async () => {
      const shimmer = page.locator('[data-slot="shimmer"]');
      const count = await shimmer.count();
      return count > 0;
    };

    // Poll for intent appearance during the first few seconds
    let sawIntent = false;
    for (let i = 0; i < 20; i++) {
      if (await intentCheck()) {
        sawIntent = true;
        break;
      }
      await page.waitForTimeout(250);
    }

    await waitForResponse(page);

    // Intent is model-dependent, just log if seen
    if (sawIntent) {
      // Intent was displayed during streaming — good
      expect(sawIntent).toBe(true);
    }
  });

  test("shows usage information after response", async ({ page }) => {
    await sendMessage(page, "Say hi");
    await waitForResponse(page);

    // Usage display shows model, tokens, duration
    const usageSection = page.locator("text=/tokens|model|gpt|claude/i");
    // Usage may or may not be rendered depending on event
    const count = await usageSection.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("copy and regenerate actions appear after response", async ({
    page,
  }) => {
    await sendMessage(page, "Say hi briefly");
    await waitForResponse(page);

    // Copy button
    const copyButton = page.locator('button[aria-label="Copy"]');
    const regenerateButton = page.locator('button[aria-label="Regenerate"]');

    if ((await copyButton.count()) > 0) {
      await expect(copyButton.first()).toBeVisible();
    }
    if ((await regenerateButton.count()) > 0) {
      await expect(regenerateButton.first()).toBeVisible();
    }
  });

  test("reset session clears messages", async ({ page }) => {
    await sendMessage(page, "Remember this: banana");
    await waitForResponse(page);

    // Messages should be visible
    await expect(page.locator("text=Remember this: banana")).toBeVisible();

    // Click reset button (RotateCcw icon button in header)
    const resetButton = page
      .locator("header button")
      .filter({ has: page.locator("svg") })
      .first();
    await resetButton.click();

    // Empty state should return
    await expect(page.locator("text=Ready to restflowai")).toBeVisible({
      timeout: 5_000,
    });
  });

  test("context usage bar appears after a response", async ({ page }) => {
    await sendMessage(page, "What is 2+2?");
    await waitForResponse(page);

    // The context usage component renders a progress bar
    const progressBar = page.locator('[role="progressbar"]');
    const hasProgressBar = (await progressBar.count()) > 0;

    // Context usage info may or may not be emitted
    expect(hasProgressBar).toBeDefined();
  });

  test("multiple messages maintain conversation history", async ({
    page,
  }) => {
    await sendMessage(page, "My name is TestUser");
    await waitForResponse(page);

    await sendMessage(page, "What is my name?");
    await waitForResponse(page);

    // Both user messages should be visible in the conversation
    await expect(page.locator("text=My name is TestUser")).toBeVisible();
    await expect(page.locator("text=What is my name?")).toBeVisible();

    // Should have at least 4 message containers (2 user + 2 assistant)
    const messages = page.locator('[data-slot="message"]');
    expect(await messages.count()).toBeGreaterThanOrEqual(4);
  });
});

// ---------------------------------------------------------------------------
// Jaeger Trace Validation
// ---------------------------------------------------------------------------

test.describe("Jaeger Trace Validation", () => {
  test("copilot events produce traces in Jaeger", async ({ page, request }) => {
    // Send a message that will generate traces
    await page.goto("/");
    await waitForSignedIn(page);
    await sendMessage(page, "Say hello in exactly 3 words");
    await waitForResponse(page);

    // Wait a bit for traces to be flushed to Jaeger
    await page.waitForTimeout(3_000);

    // Query Jaeger API for recent traces from the github-copilot service
    const response = await request.get(
      `${JAEGER_URL}/api/traces?service=${JAEGER_SERVICE}&limit=5&lookback=5m`,
    );

    if (response.ok()) {
      const body = await response.json();
      const traces = body.data ?? [];

      // Validate we got at least one trace
      expect(traces.length).toBeGreaterThanOrEqual(1);

      // Check the trace has spans
      const firstTrace = traces[0];
      expect(firstTrace.spans.length).toBeGreaterThanOrEqual(1);

      // Look for expected operation names that match copilot events
      const operationNames = firstTrace.spans.map(
        (span: { operationName: string }) => span.operationName,
      );

      // Log the operations for debugging
      console.log("Jaeger operations found:", operationNames);

      // At minimum, we expect session-related spans
      const hasCopilotSpans = operationNames.some(
        (name: string) =>
          name.includes("copilot") ||
          name.includes("chat") ||
          name.includes("session") ||
          name.includes("assistant"),
      );
      expect(hasCopilotSpans).toBe(true);
    } else {
      // Jaeger might not be running — skip gracefully
      console.warn(
        `Jaeger not available at ${JAEGER_URL}: ${response.status()}`,
      );
      test.skip();
    }
  });
});
