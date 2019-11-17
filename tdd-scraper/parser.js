const cheerio = require('cheerio');

const listings = async html => {
  const $ = await cheerio.load(html);

  // console.log(
  //   $('.result-info')
  //     .find('.result-title')
  //     .text(),
  // );
  return $('.result-info')
    .map((index, element) => {
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

      return {
        title,
        url,
        datePosted,
        hood,
      };
    })
    .get();
};

module.exports = {
  listings,
};
