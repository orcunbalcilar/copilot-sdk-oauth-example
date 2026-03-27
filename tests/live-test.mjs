import { chromium } from '../node_modules/.pnpm/playwright@1.58.2/node_modules/playwright/index.mjs';

const browser = await chromium.connectOverCDP('http://localhost:9222');
const page = browser.contexts()[0].pages().find(p => p.url().includes('localhost:3200'));
if (!page) { console.log('No page found'); process.exit(1); }

// Reload to get fresh state
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
console.log('Page reloaded. Title:', await page.title());

// TEST: Verify empty state renders with title
console.log('\n=== TEST: Empty State Title ===');
const emptyTitle = await page.locator('text=Ready to burn tokens').isVisible().catch(() => false);
console.log('"Ready to burn tokens" visible:', emptyTitle);

const emptyDesc = await page.locator('text=Send a message to start consuming').isVisible().catch(() => false);
console.log('Description visible:', emptyDesc);

const sugCount = await page.locator('button').filter({ hasText: /Explain how token|Write a TypeScript|What are the key/ }).count();
console.log('Suggestions count:', sugCount);

await page.screenshot({ path: '/tmp/test-fix-empty-state.png' });
console.log('Screenshot: /tmp/test-fix-empty-state.png');
console.log('TEST:', emptyTitle ? 'PASSED' : 'FAILED');

// TEST: Send message, wait, reset
console.log('\n=== TEST: Send + Reset Flow ===');
const textarea = page.locator('textarea');
await textarea.fill('Say hi');
await textarea.press('Enter');
console.log('Message sent...');

await page.waitForSelector('text=Say hi', { timeout: 5000 });

let attempts = 0;
while (attempts < 120) {
  const stopBtn = await page.locator('button[aria-label="Stop"]').isVisible().catch(() => false);
  const spinner = await page.locator('[data-slot="spinner"]').isVisible().catch(() => false);
  if (!stopBtn && !spinner) break;
  await page.waitForTimeout(1000);
  attempts++;
}
console.log('Response completed after ~' + attempts + 's');

await page.screenshot({ path: '/tmp/test-fix-response.png' });

// Reset
const resetBtn = page.locator('header button').first();
await resetBtn.click();
await page.waitForTimeout(1500);

const emptyAfterReset = await page.locator('text=Ready to burn tokens').isVisible().catch(() => false);
console.log('Empty state after reset:', emptyAfterReset);

await page.screenshot({ path: '/tmp/test-fix-reset.png' });
console.log('Reset TEST:', emptyAfterReset ? 'PASSED' : 'FAILED');

console.log('\n=== VERIFICATION COMPLETE ===');
await browser.close();
