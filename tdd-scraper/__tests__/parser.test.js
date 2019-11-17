const fs = require('fs');
const parser = require('../parser');

describe('running the parser', () => {
  let html;
  let listings;
  let listing;

  beforeAll(async () => {
    html = fs.readFileSync('./tdd-scraper/test.html');
    listings = await parser.listings(html);
    listing = listings[4];
  });

  it('should give the correct number of listings', () => {
    expect(listings.length).toBe(94);
  });

  it('should get correct title', () => {
    expect(listing.title).toBe('Data Science Fellowship');
  });

  it('should get correct url', () => {
    expect(listing.url).toBe(
      'https://newyork.craigslist.org/mnh/sof/d/new-york-city-data-science-fellowship/7020245343.html',
    );
  });

  it('should get correct date posted', () => {
    expect(listing.datePosted).toStrictEqual(new Date('2019-11-14 18:49'));
  });

  it('should get correct hood', () => {
    expect(listing.hood).toBe('New York City');
  });
});
