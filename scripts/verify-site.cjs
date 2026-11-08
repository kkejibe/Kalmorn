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
        assert.equal(await page.locator('#primary-navigation a[href="careers.html"]').count(), 1, `${route}: Careers is in the menu`);
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
    await page.locator('#primary-navigation').getByRole('link', { name: 'Solutions', exact: true }).click();
    await page.waitForURL('**/products.html');
    assert.ok(page.url().endsWith('/products.html'));

    await page.setViewportSize({ width: 1280, height: 1000 });
    await page.goto(origin);
    assert.match(await page.locator('main').innerText(), /Environmental technology & services/i);
    assert.deepEqual(await page.locator('.portfolio-strip strong').allTextContents(), ['Quadrat Services', 'GRYD', 'Drillr', 'Tymr']);
    assert.equal(await page.locator('main').getByText('VOSS', {exact:true}).count(), 0);
    await page.goto(`${origin}/products.html`);
    assert.deepEqual(await page.locator('main section[id]').evaluateAll(nodes => nodes.map(node => node.id)), ['quadrat', 'gryd', 'drillr', 'tymr']);
    assert.match(await page.locator('#tymr').innerText(), /environmental project management system/i);
    assert.equal(await page.locator('a[href*="#voss"]').count(), 0);
    await page.goto(`${origin}/quadrat.html`);
    assert.equal(await page.locator('.service-card').count(), 6);
    assert.match(await page.locator('#call-assistance').innerText(), /under evaluation|being evaluated/i);
    assert.match(await page.locator('.coverage-strip').innerText(), /Northeastern British Columbia/);
    assert.equal(await page.locator('main').getByText('Summit Earth', {exact:false}).count(), 0);

    // Exercise the actual CTA-to-inquiry path, validation, and honest email fallback.
    await page.goto(`${origin}/products.html#tymr`);
    await page.locator('#tymr').getByRole('link', {name:'Request a demo'}).click();
    assert.equal(await page.locator('#interest').inputValue(), 'tymr');
    await page.locator('#inquiry-form button').click();
    assert.equal(await page.locator('#email-fallback').isVisible(), false, 'Required fields prevent an empty draft');
    await page.locator('#name').fill('Alex & Team');
    await page.locator('#company').fill('Environmental Example');
    await page.locator('#details').fill('Project near Edmonton. Need capacity & cost visibility.');
    await page.locator('#inquiry-form button').click();
    assert.equal(await page.locator('#email-fallback').isVisible(), true);
    const draft = await page.locator('#inquiry-draft').inputValue();
    assert.match(draft, /Interest: Tymr/);
    assert.match(draft, /Alex & Team/);
    assert.match(draft, /capacity & cost visibility/);
    assert.match(await page.locator('#inquiry-status').innerText(), /Nothing has been sent/);
    await page.goto(`${origin}/contact.html?interest=unknown`);
    assert.equal(await page.locator('#interest').inputValue(), 'quadrat', 'Unrecognized inquiry values use the default');

    // Prospects can follow an interest link and prepare a complete introduction.
    await page.goto(`${origin}/careers.html`);
    await page.getByRole('link', {name:'Explore field opportunities'}).click();
    await page.waitForURL('**/careers.html?area=field#introduce-yourself');
    assert.equal(await page.locator('#career-area').inputValue(), 'field');
    await page.locator('#careers-form button').click();
    assert.equal(await page.locator('#careers-fallback').isVisible(), false, 'An incomplete introduction cannot be prepared');
    await page.locator('#candidate-name').fill('Morgan & Team');
    await page.locator('#candidate-email').fill('invalid-email');
    await page.locator('#candidate-location').fill('Calgary, Alberta');
    await page.locator('#candidate-background').fill('Interested in field sampling & logistics.');
    await page.locator('#careers-form button').click();
    assert.equal(await page.locator('#careers-fallback').isVisible(), false, 'Invalid email is rejected');
    await page.locator('#candidate-email').fill('morgan@example.com');
    await page.locator('#candidate-availability').fill('Seasonal / contract');
    await page.locator('#careers-form button').click();
    const introduction = await page.locator('#careers-draft').inputValue();
    assert.match(introduction, /To: info@kalmorn.com/);
    assert.match(introduction, /Subject: Careers — Field & logistics — Morgan & Team/);
    assert.match(introduction, /Email: morgan@example.com/);
    assert.match(introduction, /City \/ region: Calgary, Alberta/);
    assert.match(introduction, /Availability: Seasonal \/ contract/);
    assert.match(introduction, /Interested in field sampling & logistics/);
    assert.match(await page.locator('#careers-status').innerText(), /Nothing has been sent/);
    await page.goto(`${origin}/careers.html?area=unknown`);
    assert.equal(await page.locator('#career-area').inputValue(), 'general');

    const touch = await browser.newPage({viewport:{width:390,height:1000},hasTouch:true,reducedMotion:'reduce'});
    await touch.goto(origin);
    assert.equal(await touch.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
    await touch.locator('.navbar__hamburger').tap();
    await touch.locator('#primary-navigation').getByRole('link',{name:'Services',exact:true}).tap();
    await touch.waitForURL('**/services.html');
    assert.ok(touch.url().endsWith('/services.html'));
    const noJS = await browser.newPage({viewport:{width:390,height:1000},javaScriptEnabled:false});
    await noJS.goto(`${origin}/services.html`);
    assert.equal(await noJS.locator('.service-paths').isVisible(),true);
    assert.equal(await noJS.locator('#primary-navigation').isVisible(),true,'Navigation is usable without JS');
    await noJS.goto(`${origin}/contact.html`);
    assert.equal(await noJS.locator('noscript').isVisible(),true,'Direct email remains available without JS');
    assert.equal(await noJS.locator('#inquiry-form').isVisible(),false,'Inactive composer is hidden without JS');
    await noJS.goto(`${origin}/careers.html`);
    assert.equal(await noJS.locator('#careers-form').isVisible(),false);
    assert.equal(await noJS.locator('noscript').getByRole('link', {name:'info@kalmorn.com'}).isVisible(),true,'Careers remains reachable by email without JS');

    if (process.env.SCREENSHOT_DIR) {
      fs.mkdirSync(process.env.SCREENSHOT_DIR,{recursive:true});
      await page.setViewportSize({width:1440,height:1000});
      for (const route of ['index.html','services.html','products.html','quadrat.html','blog.html','contact.html','careers.html']) {
        await page.goto(`${origin}/${route}`);
        await page.evaluate(()=>document.fonts.ready);
        await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,route.replace('.html','.png')),fullPage:true});
      }
    }
    if (process.env.SCREENSHOT_DIR) {
      await page.setViewportSize({width:390,height:844});
      for (const route of ['index.html','quadrat.html','contact.html','careers.html']) {
        await page.goto(`${origin}/${route}`);
        await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,route.replace('.html','-mobile.png')),fullPage:true});
      }
    }
    assert.deepEqual(errors, []);
    console.log(`Verified ${routes.length} pages at 4 viewport sizes, ${links.size} local links, navigation, portfolio ordering, Quadrat content, project and careers email composition, no-JS content, and touch/reduced-motion behavior.`);
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
