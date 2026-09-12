const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/hhf_eng01/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const root = 'http://127.0.0.1:4173';
const entry = root + '/LVGL_个人知识库_完整融合版_可独立使用.html';
const evidence = path.join(process.env.TEMP, 'prox-interaction-audit');
fs.mkdirSync(evidence, { recursive: true });

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push('pageerror: ' + error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push('console: ' + message.text()); });

  const waitStoryIndex = async value => page.waitForFunction(expected => document.getElementById('storyProgressBar')?.getAttribute('aria-valuenow') === String(expected) && !document.getElementById('storyPage')?.hasAttribute('aria-busy'), value);

  await page.goto(entry, { waitUntil: 'networkidle' });
  assert.strictEqual(await page.locator('#entranceTitle').textContent(), 'Pro-X');
  assert.strictEqual(await page.locator('#entranceTitle').getAttribute('aria-expanded'), 'false');
  await page.screenshot({ path: path.join(evidence, '01-entrance.png') });

  await page.locator('#entranceTitle').click();
  assert(await page.locator('#journeyMenu').evaluate(node => node.open));
  assert.strictEqual(await page.locator('body').getAttribute('data-journey'), 'menu');
  assert.strictEqual(await page.locator('#entranceTitle').getAttribute('aria-expanded'), 'true');
  await page.screenshot({ path: path.join(evidence, '02-menu.png') });
  await page.locator('#journeyMenuClose').click();
  assert(!(await page.locator('#journeyMenu').evaluate(node => node.open)));
  assert.strictEqual(await page.locator('#entranceTitle').getAttribute('aria-expanded'), 'false');
  assert.strictEqual(await page.evaluate(() => document.activeElement.id), 'entranceTitle');

  await page.locator('#entranceTitle').click();
  await page.locator('#journeyStart').click();
  await page.waitForFunction(() => document.body.dataset.journey === 'story', null, { timeout: 7000 });
  await waitStoryIndex(1);
  assert(await page.locator('#storyScene').isVisible());
  assert.strictEqual(await page.locator('#storyHeading').textContent(), '起初，我是班里的倒数第一。');
  assert(await page.locator('#storyPrevious').isDisabled());
  assert(await page.locator('#storyNext').isVisible());
  assert((await page.locator('#storyArtA').evaluate(node => getComputedStyle(node).backgroundImage)).includes('01-physics-classroom.png'));
  await page.screenshot({ path: path.join(evidence, '03-story-first.png') });

  await page.locator('#storyNext').click();
  await waitStoryIndex(2);
  await page.locator('#storyPrevious').click();
  await waitStoryIndex(1);
  await page.locator('#storyHeading').focus();
  await page.keyboard.press('ArrowRight');
  await waitStoryIndex(2);
  await page.mouse.move(720, 450);
  await page.mouse.wheel(0, 120);
  await waitStoryIndex(3);
  await page.locator('#storyStage').click({ position: { x: 1100, y: 450 } });
  await waitStoryIndex(4);

  if (await page.evaluate(() => document.fullscreenEnabled)) {
    await page.locator('#storyFullscreen').click();
    await page.waitForFunction(() => document.fullscreenElement?.id === 'storyScene');
    assert.strictEqual(await page.locator('#storyFullscreen').getAttribute('aria-pressed'), 'true');
    await page.locator('#storyFullscreen').click();
    await page.waitForFunction(() => !document.fullscreenElement);
    assert.strictEqual(await page.locator('#storyFullscreen').getAttribute('aria-pressed'), 'false');
  }

  await page.locator('#storyHeading').focus();
  await page.keyboard.press('End');
  await waitStoryIndex(37);
  assert.strictEqual(await page.locator('#storyHeading').textContent(), '如果这个网站最后无法运营下去，我希望把它交给公益组织……');
  assert(await page.locator('#storyLibrary').isVisible());
  assert(!(await page.locator('#storyNext').isVisible()));
  assert((await page.locator('#storyLibrary').getAttribute('href')).includes('KnowledgeBase/index.html'));
  await page.screenshot({ path: path.join(evidence, '04-story-last.png') });
  await page.locator('#storyExit').click();
  await page.waitForFunction(() => document.body.dataset.journey === 'home');
  assert(await page.locator('.entrance-shell').isVisible());

  await page.goto(root + '/SubPage_Html/KnowledgeBase/index.html', { waitUntil: 'networkidle' });
  assert.strictEqual(await page.locator('.entry').count(), 2);
  await page.locator('#search').fill('队列');
  await page.locator('#searchBtn').click();
  assert(await page.locator('#results').evaluate(node => node.classList.contains('show')));
  assert((await page.locator('#results').textContent()).includes('FreeRTOS'));
  await page.locator('#results [data-id]').first().focus();
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.body.classList.contains('reading'));
  assert(new URL(page.url()).searchParams.has('module'));
  assert.strictEqual(await page.evaluate(() => document.activeElement.id), 'backBtn');

  let frame = page.frameLocator('#viewer');
  await frame.locator('#search').waitFor({ state: 'visible' });
  await frame.locator('#search').fill('事件');
  assert(!((await frame.locator('#empty').getAttribute('style')) || '').includes('block'));
  const initialTheme = await frame.locator('body').getAttribute('data-theme');
  await frame.locator('#themeBtn').click();
  assert.notStrictEqual(await frame.locator('body').getAttribute('data-theme'), initialTheme);
  const initialFont = await frame.locator('body').getAttribute('style');
  await frame.locator('#fontBtn').click();
  assert.notStrictEqual(await frame.locator('body').getAttribute('style'), initialFont);
  const firstCheckbox = frame.locator('[data-check]').first();
  await firstCheckbox.check();
  assert(await firstCheckbox.locator('xpath=..').evaluate(node => node.classList.contains('done')));
  await frame.locator('#search').fill('');
  await frame.locator('[data-mode="all"]').click();
  const notes = frame.locator('#personalNotes, #notes');
  await notes.fill('路径 / 调试记录');
  await notes.press('Escape');
  assert.strictEqual(await notes.inputValue(), '路径 / 调试记录');
  await frame.locator('#saveNotes').click();
  await frame.locator('#copyNotes').click();
  const recipe = frame.locator('[data-recipe]').nth(1);
  if (await recipe.count()) {
    await recipe.click();
    assert(await recipe.evaluate(node => node.classList.contains('active')));
  }
  const quizOption = frame.locator('.quiz-option').first();
  if (await quizOption.count()) {
    await quizOption.click();
    assert(await quizOption.locator('xpath=ancestor::*[contains(@class,"quiz")][1]').evaluate(node => node.dataset.correct === 'true' || node.dataset.correct === 'false'));
  }
  const navLink = frame.locator('#nav a').nth(1);
  if (await navLink.count()) {
    await navLink.click();
    assert.strictEqual(page.frames().find(item => item.parentFrame())?.url(), 'about:srcdoc');
  }
  await page.screenshot({ path: path.join(evidence, '05-reader.png') });

  await page.locator('#backBtn').click();
  await page.waitForFunction(() => !document.body.classList.contains('reading'));
  assert(await page.locator('#results').isVisible());
  await page.locator('.entry[data-id="freertos-f103"] [data-open]').click();
  await page.waitForFunction(() => document.body.classList.contains('reading'));
  frame = page.frameLocator('#viewer');
  await frame.locator('#notes').waitFor({ state: 'visible' });
  await frame.locator('[data-mode="rtos"]').click();
  assert.strictEqual(await frame.locator('[data-mode="rtos"]').getAttribute('aria-pressed'), 'true');
  await frame.locator('#search').fill('任务');
  assert((await frame.locator('#counter').textContent()).includes('章'));
  await frame.locator('#notes').fill('FreeRTOS / LVGL');
  await frame.locator('#notes').press('Escape');
  assert.strictEqual(await frame.locator('#notes').inputValue(), 'FreeRTOS / LVGL');

  await page.locator('#homeBtn').click();
  await page.waitForURL(url => decodeURIComponent(url.pathname).endsWith('LVGL_个人知识库_完整融合版_可独立使用.html'));
  assert.strictEqual(await page.locator('#entranceTitle').textContent(), 'Pro-X');

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mobilePage = await mobile.newPage();
  mobilePage.on('pageerror', error => errors.push('mobile pageerror: ' + error.message));
  await mobilePage.goto(entry, { waitUntil: 'networkidle' });
  assert.strictEqual(await mobilePage.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await mobilePage.locator('#entranceTitle').tap();
  assert(await mobilePage.locator('#journeyMenu').evaluate(node => node.open));
  await mobilePage.locator('#journeyStart').tap();
  await mobilePage.waitForFunction(() => document.body.dataset.journey === 'story', null, { timeout: 7000 });
  assert.strictEqual(await mobilePage.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  assert(await mobilePage.locator('#storyNext').isVisible());
  await mobilePage.screenshot({ path: path.join(evidence, '06-mobile-story.png') });
  await mobile.close();

  await context.close();
  await browser.close();
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(JSON.stringify({ passed: true, scenes: 37, evidence }, null, 2));
})().catch(error => { console.error(error.stack || error); process.exit(1); });
