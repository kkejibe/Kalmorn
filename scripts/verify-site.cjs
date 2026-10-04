const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createServer } = require('./serve.cjs');

(async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}) });
    const errors = [];
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
      if (response.url().startsWith(origin) && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    });
    const routes = fs.readdirSync(path.join(__dirname, '..')).filter(file => file.endsWith('.html'));
    const links = new Set();
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const route of routes) {
        await page.goto(`${origin}/${route}`);
        assert.equal(await page.locator('h1').count(), 1, `${route}: one page heading`);
        assert.equal(await page.locator('main').count(), 1, `${route}: main landmark`);
        assert.equal(await page.locator('nav [aria-current="page"]').count(), 1, `${route}: current navigation`);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
        assert.equal(overflow, false, `${route}: horizontal overflow at ${width}px`);
        const heading = await page.locator('h1').evaluate(el => getComputedStyle(el).opacity);
        assert.equal(heading, '1', `${route}: heading remains visible`);
        if (width === 1440) {
          const localLinks = await page.locator('a[href]').evaluateAll(nodes => nodes.map(node => node.href).filter(href => href.startsWith(location.origin)));
          localLinks.forEach(link => links.add(link));
          const assets = await page.locator('img[src], script[src], link[rel="stylesheet"]').evaluateAll(nodes => nodes.map(node => node.src || node.href).filter(href => href.startsWith(location.origin)));
          assets.forEach(link => links.add(link));
        }
      }
    }
    for (const link of links) {
      const response = await page.request.get(link);
      assert.equal(response.status(), 200, `Broken local link: ${link}`);
      const hash = new URL(link).hash.slice(1);
      if (hash) {
        const html = await response.text();
        assert.ok(html.includes(`id="${decodeURIComponent(hash)}"`), `Missing anchor: ${link}`);
      }
    }
    await page.setViewportSize({ width: 390, height: 1000 });
    await page.goto(origin);
    const menu = page.locator('.navbar__hamburger');
    await menu.click();
    assert.equal(await menu.getAttribute('aria-expanded'), 'true');
    await page.keyboard.press('Escape');
    assert.equal(await menu.getAttribute('aria-expanded'), 'false');
    assert.equal(await page.locator('#primary-navigation').isVisible(), false);
    await menu.click();
    await page.locator('#primary-navigation').getByRole('link', { name: 'Platforms', exact: true }).click();
    assert.ok(page.url().endsWith('/products.html'));

    await page.setViewportSize({ width: 1280, height: 1000 });
    await page.goto(origin);
    const wordmark = await page.locator('.navbar__logo').first().evaluate(el => ({text:getComputedStyle(el).color,k:getComputedStyle(el.firstElementChild).color}));
    assert.deepEqual(wordmark, {text:'rgb(255, 255, 255)',k:'rgb(0, 200, 83)'});
    await page.getByRole('button', { name: 'Pause motion', exact: true }).click();
    const first = page.getByRole('button', {name:'Pop balloon 1',exact:true});
    const position = await first.getAttribute('style');
    await page.waitForTimeout(150);
    assert.equal(await first.getAttribute('style'), position, 'Pause freezes the balloons');
    const target = await first.boundingBox();
    await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2);
    assert.equal(await page.locator('#balloon-field').getAttribute('data-pops'), '1');
    await page.mouse.move(0,0);
    await page.getByRole('button',{name:'Pop balloon 2',exact:true}).focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#balloon-field').getAttribute('data-pops'), '2');
    await first.waitFor({state:'visible',timeout:4000});
    assert.equal(await page.locator('.balloon-hit').count(),9,'Popping reuses the balloon controls');
    await page.getByRole('button',{name:'Resume motion',exact:true}).click();
    const movingPosition = await first.getAttribute('style');
    await page.waitForTimeout(150);
    assert.notEqual(await first.getAttribute('style'),movingPosition,'Resume restarts the balloons');

    const touch = await browser.newPage({viewport:{width:390,height:1400},hasTouch:true,reducedMotion:'reduce'});
    await touch.goto(origin);
    assert.equal(await touch.getByRole('button',{name:'Motion reduced'}).isDisabled(),true);
    await touch.getByRole('button',{name:'Pop balloon 5',exact:true}).tap();
    assert.equal(await touch.locator('#balloon-field').getAttribute('data-pops'),'1','Touch works with reduced motion');
    const noJS = await browser.newPage({viewport:{width:390,height:1000},javaScriptEnabled:false});
    await noJS.goto(`${origin}/services.html`);
    assert.equal(await noJS.locator('.alt-section__content').first().isVisible(),true);
    assert.equal(await noJS.locator('#primary-navigation').isVisible(),true,'Navigation is usable without JS');

    if (process.env.SCREENSHOT_DIR) {
      fs.mkdirSync(process.env.SCREENSHOT_DIR,{recursive:true});
      await page.setViewportSize({width:1440,height:1000});
      for (const route of ['index.html','services.html','products.html','blog.html','contact.html']) {
        await page.goto(`${origin}/${route}`);
        await page.evaluate(()=>document.fonts.ready);
        await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,route.replace('.html','.png')),fullPage:route==='index.html'});
      }
    }
    assert.deepEqual(errors, []);
    console.log(`Verified ${routes.length} pages at 4 viewport sizes, ${links.size} local links, navigation, no-JS content, and balloon hover/touch/keyboard/pause/respawn/reduced-motion behavior.`);
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
