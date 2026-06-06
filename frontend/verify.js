const {chromium} = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('console', m => { if (m.type() === 'error') console.log('[browser error]', m.text()); });
  page.on('pageerror', e => console.error('[page error]', e.message));

  // --- LANDING PAGE ---
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const title = await page.title();
  const h1 = await page.textContent('h1').catch(() => 'none');
  const navBrand = await page.textContent('.brand-name').catch(() => 'none');
  const navLinks = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.nav-link')).map(e => e.textContent.trim())
  );
  const badges = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.badge')).map(e => e.textContent.trim())
  );

  console.log('=== LANDING PAGE ===');
  console.log('Title:', title);
  console.log('H1:', h1);
  console.log('Brand:', navBrand);
  console.log('Nav links:', JSON.stringify(navLinks));
  console.log('Badges:', JSON.stringify(badges));

  await page.screenshot({ path: 'verify-home.png', fullPage: true });
  console.log('Screenshot saved: verify-home.png');

  // --- KNOWLEDGE BASE ---
  const kbBtn = await page.$('.nav-link:nth-child(1)');
  if (kbBtn) await kbBtn.click();
  await page.waitForTimeout(500);

  const kbH1 = await page.textContent('h1').catch(() => 'none');
  const tableHeaders = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[style*="text-transform: uppercase"][style*="font-weight: 700"]'))
      .map(e => e.textContent.trim()).filter(t => t)
  );

  console.log('\n=== KNOWLEDGE BASE ===');
  console.log('H1:', kbH1);
  console.log('Table cols visible:', tableHeaders.length > 0);

  await page.screenshot({ path: 'verify-kb.png', fullPage: true });
  console.log('Screenshot saved: verify-kb.png');

  // --- CHATBOT ---
  const chatBtn = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.nav-link'));
    return btns.findIndex(b => b.textContent.includes('Chatbot'));
  });
  const allNavLinks = await page.$$('.nav-link');
  if (allNavLinks[chatBtn >= 0 ? chatBtn : 1]) await allNavLinks[chatBtn >= 0 ? chatBtn : 1].click();
  await page.waitForTimeout(500);

  const welcomeH2 = await page.textContent('h2').catch(() => 'none');
  const textarea = await page.$('textarea');
  const hasSidebar = await page.$('[style*="256px"]') !== null;

  console.log('\n=== CHATBOT ===');
  console.log('Welcome H2:', welcomeH2);
  console.log('Has textarea:', textarea !== null);
  console.log('Has sidebar:', hasSidebar);

  await page.screenshot({ path: 'verify-chat.png', fullPage: true });
  console.log('Screenshot saved: verify-chat.png');

  // --- SEND A MESSAGE ---
  if (textarea) {
    await textarea.fill('What is the leave policy?');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(5000); // wait for animation
    const msgs = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[style*="rgba(233,0,48"]')).map(e => e.textContent.trim().slice(0, 60))
    );
    console.log('\n=== CHAT RESPONSE ===');
    console.log('User msg bubbles:', msgs.slice(0, 2));
    await page.screenshot({ path: 'verify-chat-response.png', fullPage: true });
    console.log('Screenshot saved: verify-chat-response.png');
  }

  await browser.close();
  console.log('\nDone.');
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
