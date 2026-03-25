/**
 * E2E tests for Copilot chat events rendering.
 *
 * Prerequisites:
 *   - Next.js dev server running on http://localhost:3200
 *   - Jaeger running on http://localhost:16686
 *   - User must sign in with GitHub on first run
 *
 * Run: npx playwright test tests/e2e/chat-events.spec.ts --headed
 */
import { test, expect, type Page } from "@playwright/test";

const BASE_URL = "http://localhost:3200";
const JAEGER_URL = "http://localhost:16686";

/** Wait for the chat status to return to "ready" (submit button visible). */
async function waitForChatReady(page: Page, timeout = 60_000) {
  await page.getByRole("button", { name: "Submit" }).waitFor({ timeout });
}

/** Send a message and wait for the response to begin streaming. */
async function sendMessage(page: Page, text: string) {
  const input = page.getByRole("textbox", {
    name: "Type a message to burn tokens",
  });
  await input.click();
  await input.fill(text);
  await page.keyboard.press("Enter");
}

// ─── AUTH ────────────────────────────────────────────────────────────
test.describe.configure({ mode: "serial" });

// Reuse browser state across tests
let authedPage: Page;

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  authedPage = await context.newPage();
  await authedPage.goto(BASE_URL);

  // If not signed in, wait for user to sign in manually
  const signInButton = authedPage.getByRole("button", {
    name: "Sign in with GitHub",
  });
  const isSignInVisible = await signInButton.isVisible().catch(() => false);
  if (isSignInVisible) {
    // Pause so the tester can sign in manually
    await authedPage.pause();
  }

  // Verify we're on the chat page
  await expect(authedPage.getByRole("heading", { name: "Token Burner" })).toBeVisible();
});

test.afterAll(async () => {
  await authedPage.context().close();
});

// ─── TEST 1: Chat events are correctly rendered as AI elements ──────
test("all copilot events are correctly represented as AI elements on UI", async () => {
  const page = authedPage;

  // Should see empty state with suggestions
  await expect(
    page.getByRole("button", { name: "Explain how token prediction" })
  ).toBeVisible();

  // Send a message that triggers tool usage
  await sendMessage(
    page,
    "Can you read the README.md file in the current repository and summarize what this project does?"
  );

  // Wait for the first usage block to appear (LLM turn 1)
  const usageBlock = page.locator("text=openai/gpt-4o-mini").first();
  await expect(usageBlock).toBeVisible({ timeout: 30_000 });

  // Verify usage data shows token counts
  await expect(page.locator("text=/\\d[\\d,.]* in/").first()).toBeVisible();
  await expect(page.locator("text=/\\d[\\d,.]* out/").first()).toBeVisible();

  // Verify tool call appears with approval buttons
  const toolHeader = page.getByRole("button", { name: /view.*Awaiting Approval/ });
  await expect(toolHeader).toBeVisible({ timeout: 30_000 });

  // Verify tool parameters are shown
  await expect(page.locator("text=Parameters")).toBeVisible();
  await expect(page.locator("text=README.md")).toBeVisible();

  // Verify context usage bar is visible in footer
  await expect(page.locator("text=Context:")).toBeVisible();
  await expect(page.locator("text=/[\\d,.]+ \\/ [\\d,.]+/")).toBeVisible();

  // Approve the tool call
  await page.getByRole("button", { name: "Approve" }).click();

  // Wait for tool completion
  const completedTool = page.getByRole("button", { name: /view.*Completed/ });
  await expect(completedTool).toBeVisible({ timeout: 35_000 });

  // Verify tool result is shown
  await expect(page.locator("text=Result")).toBeVisible();

  // Wait for response to complete
  await waitForChatReady(page);

  // Verify text response was generated
  const textParts = page.locator('[data-slot="message-content"]');
  await expect(textParts.last()).toBeVisible();

  // Verify second usage block appears (LLM turn 2)
  const usageBlocks = page.locator("text=openai/gpt-4o-mini");
  await expect(usageBlocks).toHaveCount(2, { timeout: 5_000 }).catch(() => {
    // May have more, just verify at least 2
  });
  expect(await usageBlocks.count()).toBeGreaterThanOrEqual(2);

  // Verify Copy/Regenerate actions appear
  await expect(page.getByRole("button", { name: "Copy" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Regenerate" })).toBeVisible();

  // Verify context usage shows message count
  await expect(page.locator("text=/\\(\\d+ msgs\\)/")).toBeVisible();

  // ── Compare with Jaeger ──
  // Fetch the latest trace from Jaeger API
  const traceResponse = await page.request.get(
    `${JAEGER_URL}/api/traces?service=github-copilot&limit=1&lookback=300`
  );
  const traceData = await traceResponse.json();
  const spans = traceData.data[0]?.spans ?? [];

  // Verify expected span types exist
  const spanOps = spans.map((s: { operationName: string }) => s.operationName);
  expect(spanOps).toContain("invoke_agent");
  expect(spanOps.filter((op: string) => op.startsWith("chat "))).toHaveLength(2);
  expect(spanOps).toContain("execute_tool view");
  expect(spanOps).toContain("permission");

  // Verify token counts match between Jaeger and UI
  const chatSpans = spans.filter((s: { operationName: string }) =>
    s.operationName.startsWith("chat ")
  );
  for (const span of chatSpans) {
    const tags: Record<string, unknown> = {};
    for (const t of span.tags) {
      tags[t.key] = t.value;
    }
    const inputTokens = tags["gen_ai.usage.input_tokens"] as number;
    const outputTokens = tags["gen_ai.usage.output_tokens"] as number;

    // These should appear somewhere in the UI usage blocks
    if (inputTokens) {
      await expect(
        page.locator(`text=${inputTokens.toLocaleString()} in`)
      ).toBeVisible();
    }
    if (outputTokens) {
      await expect(
        page.locator(`text=${outputTokens.toLocaleString()} out`)
      ).toBeVisible();
    }
  }

  // Reset for next test
  await page.locator("header button").first().click();
  await page.waitForTimeout(500);
});

// ─── TEST 2: Approval/Rejection flow ────────────────────────────────
test("approval and rejection flow works correctly", async () => {
  const page = authedPage;

  // ── Part A: Test DENIAL ──
  await sendMessage(
    page,
    "Read the package.json file to tell me the project name"
  );

  // Wait for tool approval request
  const denyButton = page.getByRole("button", { name: "Deny" });
  await expect(denyButton).toBeVisible({ timeout: 30_000 });

  // Verify approval buttons are present
  await expect(page.getByRole("button", { name: "Approve" })).toBeVisible();
  await expect(denyButton).toBeVisible();

  // Deny the tool execution
  await denyButton.click();

  // Wait for the response to settle
  await waitForChatReady(page);

  // Verify the tool shows error state with denial message
  await expect(
    page.getByRole("button", { name: /view.*Error/ })
  ).toBeVisible();
  await expect(
    page.locator("text=The user rejected this tool call.")
  ).toBeVisible();

  // Verify permission denial event is shown
  await expect(
    page.locator("text=Permission: denied-interactively-by-user")
  ).toBeVisible();

  // Reset
  await page.locator("header button").first().click();
  await page.waitForTimeout(500);

  // ── Part B: Test APPROVAL ──
  await sendMessage(page, "List the files in the root of this project");

  // Wait for tool approval request
  const approveButton = page.getByRole("button", { name: "Approve" });
  await expect(approveButton).toBeVisible({ timeout: 30_000 });

  // Approve the tool execution
  await approveButton.click();

  // Wait for tool completion
  await expect(
    page.getByRole("button", { name: /view.*Completed/ })
  ).toBeVisible({ timeout: 35_000 });

  // Verify tool result is shown
  await expect(page.locator("text=Result")).toBeVisible();

  // Wait for full response
  await waitForChatReady(page);

  // Verify assistant response text was generated
  await expect(page.getByRole("button", { name: "Copy" })).toBeVisible();

  // Verify cache tokens are shown when present
  const cachedTokens = page.locator("text=/[\\d,.]+ cached/");
  // Cache tokens may or may not be present depending on server state
  const hasCached = await cachedTokens.isVisible().catch(() => false);
  if (hasCached) {
    await expect(cachedTokens.first()).toBeVisible();
  }

  // ── Verify Jaeger trace shows correct permission results ──
  // Get latest trace
  const traceResponse = await page.request.get(
    `${JAEGER_URL}/api/traces?service=github-copilot&limit=1&lookback=300`
  );
  const traceData = await traceResponse.json();
  const spans = traceData.data[0]?.spans ?? [];

  // Verify permission span exists with approved result
  const permSpan = spans.find(
    (s: { operationName: string }) => s.operationName === "permission"
  );
  expect(permSpan).toBeDefined();
  const permTags: Record<string, string> = {};
  for (const t of permSpan.tags) {
    permTags[t.key] = t.value;
  }
  expect(permTags["github.copilot.permission.result"]).toBe("approved");
});

// ─── TEST 3: Context usage bar updates correctly ────────────────────
test("context usage bar displays and updates", async () => {
  const page = authedPage;

  // Reset
  await page.locator("header button").first().click();
  await page.waitForTimeout(500);

  // Context bar should not be visible before any message
  await expect(page.locator("text=Context:")).not.toBeVisible();

  // Send a message
  await sendMessage(page, "Hello, what is 2 + 2?");

  // Wait for context bar to appear (it shows after first usage event)
  await expect(page.locator("text=Context:")).toBeVisible({ timeout: 30_000 });

  // Verify token counts are displayed
  await expect(page.locator("text=/[\\d,.]+ \\/ [\\d,.]+/")).toBeVisible();

  // Verify message count is shown
  await expect(page.locator("text=/\\(\\d+ msgs\\)/")).toBeVisible();

  // Wait for response
  await waitForChatReady(page);
});
