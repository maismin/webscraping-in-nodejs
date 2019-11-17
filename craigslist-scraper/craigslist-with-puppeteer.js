const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const mongoose = require('mongoose');

const Listing = require('../models/Listing');

const waitTime = 1000; // 1 second between page visits
const mongoUri = 'mongodb://localhost:27017/craigslist-webscraper';
const url = 'https://newyork.craigslist.org/d/software-qa-dba-etc/search/sof';

async function connectDB() {
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });
  console.log('Connected to MongoDB ');
}

async function scrapeListings(page) {
  // Visit url
  await page.goto(url);

  // Retrieve html from page
  const html = await page.content();

  // Enable JQuery for node
  const $ = cheerio.load(html);

  const listings = $('.result-info')
    .map((index, element) => {
      const titleElement = $(element).find('.result-title');
      const timeElement = $(element).find('.result-date');
      const hoodElement = $(element).find('.result-hood');

      const title = $(titleElement).text();
      const url = $(titleElement).attr('href');
      const datePosted = new Date($(timeElement).attr('datetime'));
      const hood = $(hoodElement)
        .text()
        .trim()
        .replace(/[(,)]/g, '');

      return {
        title,
        url,
        datePosted,
        hood,
      };
    })
    .get(); // returns the array of objects instead of an array of cheerio object

  return listings;
}

async function scrapeJobDescription(listings, page) {
  // forEach does things in parallel, which doesn't work well with puppeteer
  for (const listing of listings) {
    await page.goto(listing.url);
    const html = await page.content();
    const $ = cheerio.load(html);
    const jobDescription = $('#postingbody')
      .text()
      .replace('QR Code Link to This Post', '')
      .trim();
    const compensation = $('p.attrgroup > span:nth-child(1) > b').text();

    listing.jobDescription = jobDescription;
    listing.compensation = compensation;

    const listingModel = new Listing(listing);
    await listingModel.save();

    await sleep(waitTime);
  }
}

async function sleep(miliseconds) {
  return new Promise(resolve => setTimeout(resolve, miliseconds));
}

async function main() {
  await connectDB();
  await Listing.deleteMany();

  // Open the chromium browser with puppeteer
  // headless - false => browser is not hidden
  const browser = await puppeteer.launch({ headless: false });

  // Open a new page
  const page = await browser.newPage();

  console.log('Web scraping craigslist for software jobs...');
  const listings = await scrapeListings(page);
  const listingsWithJobDescriptions = await scrapeJobDescription(
    listings,
    page,
  );

  console.log('Web scraping complete');
  mongoose.connection.close();
  console.log('Disconnected from MongoDB');
  process.exit();
}

main();
