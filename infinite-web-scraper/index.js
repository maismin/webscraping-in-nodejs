const puppeteer = require('puppeteer');

function extractItems() {
  // Transform nodelist into an array
  const extractedItems = Array.from(
    document.querySelectorAll('#boxes > div.box'),
  );

  // Map array of div.boxes into text
  const items = extractedItems.map(element => element.innerText);
  return items;
}

async function scrapeInfiniteScrollItems(
  page,
  extractItems,
  targetItemCount,
  scrollDelay = 1000,
) {
  let items = [];

  try {
    let previousHeight;

    // Scroll if the number of items in the dom is less than target
    while (items.length < targetItemCount) {
      items = await page.evaluate(extractItems);
      previousHeight = await page.evaluate('document.body.scrollHeight');
      // Puppeteer doesn't have a function to scroll pages
      // So use window.scrollTo and document.body.scrollHeight
      // window.scrollTo(0, document.body.scrollHeight)
      // this scrolls to the bottom of the page to load more items
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await page.waitForFunction(
        `document.body.scrollHeight > ${previousHeight}`,
      );

      // Might want to randomize the delay to prevent detection
      await page.waitFor(scrollDelay);
    }
  } catch (error) {
    console.error(error);
  }

  return items;
}

async function main() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  page.setViewport({ width: 1280, height: 926 });

  const url = 'https://intoli.com/blog/scrape-infinite-scroll/demo.html';
  await page.goto(url);

  const targetItemCount = 100;

  const items = await scrapeInfiniteScrollItems(
    page,
    extractItems,
    targetItemCount,
  );

  console.log(items);
}

main();
