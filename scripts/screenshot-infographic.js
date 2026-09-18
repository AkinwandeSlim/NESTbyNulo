const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const htmlPath = path.resolve('/home/z/my-project/scripts/nest-infographic.html');
  await page.goto(`file://${htmlPath}`);

  // Set viewport to fit the content
  await page.setViewportSize({ width: 1180, height: 1200 });

  // Wait for fonts and layout
  await page.waitForTimeout(500);

  // Get the root element's bounding box to determine actual height
  const height = await page.evaluate(() => {
    const root = document.getElementById('root');
    return root.getBoundingClientRect().height;
  });

  // Resize viewport to fit content
  await page.setViewportSize({ width: 1180, height: Math.ceil(height) + 80 });

  const outputPath = '/home/z/my-project/download/NEST_Fractional_Ownership_Explainer.png';
  await page.screenshot({
    path: outputPath,
    fullPage: true,
    deviceScaleFactor: 2,
  });

  console.log('Infographic saved to: ' + outputPath);
  await browser.close();
})();
