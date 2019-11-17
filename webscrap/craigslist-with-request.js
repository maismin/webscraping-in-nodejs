const cheerio = require('cheerio');
const request = require('request-promise');
// Use a proxy IP
// const request = require('request-promise').defaults({
//   proxy: 'ipaddress:port',
// });

const url = 'https://newyork.craigslist.org/d/software-qa-dba-etc/search/sof';

async function scrapeJobHeader() {
  const scrapeResults = [];

  try {
    const htmlResult = await request.get(url);
    const $ = await cheerio.load(htmlResult);

    $('.result-info').each((index, element) => {
      const resultTitle = $(element).children('.result-title');

      const title = resultTitle.text();
      const url = resultTitle.attr('href');
      const datePosted = new Date(
        $(element)
          .children('time')
          .attr('datetime'),
      );
      const hood = $(element)
        .find('.result-hood')
        .text()
        .trim()
        .replace(/[(,)]/g, '');

      const scrapeResult = {
        title,
        url,
        datePosted,
        hood,
      };

      scrapeResults.push(scrapeResult);
    });
    return scrapeResults;
  } catch (err) {
    console.error(err);
  }
}

async function scrapeDescription(jobsWithHeaders) {
  return await Promise.all(
    jobsWithHeaders.map(async job => {
      try {
        const htmlResult = await request.get(job.url);
        const $ = await cheerio.load(htmlResult);

        $('.print-qrcode-container').remove();
        job.description = $('#postingbody')
          .text()
          .trim();
        job.compensation = $('p.attrgroup > span:nth-child(1) > b').text();
        console.log(job);
      } catch (error) {}
      return job;
    }),
  );
}

async function scrapeCraigsList() {
  const jobsWithHeaders = await scrapeJobHeader();
  const jobsFullData = await scrapeDescription(jobsWithHeaders);
  console.log(jobsFullData);
}

scrapeCraigsList();
