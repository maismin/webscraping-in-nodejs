const fs = require('fs');
const regularRequest = require('request');
const request = require('request-promise');
const cheerio = require('cheerio');
const Nightmare = require('nightmare');

const nightmare = Nightmare({ show: true });
const url = 'https://www.imdb.com/chart/moviemeter?ref_=nv_mv_mpm';

async function scrapeTitlesRanksAndRatings() {
  const result = await request.get(url);
  const $ = await cheerio.load(result);

  const movies = $('.lister-list > tr')
    .map((i, ele) => {
      const title = $(ele)
        .find('td.titleColumn > a')
        .text();
      const descriptionUrl = `https://www.imdb.com${$(ele)
        .find('td.titleColumn > a')
        .attr('href')}`;
      const imdbRating = $(ele)
        .find('td.ratingColumn.imdbRating')
        .text()
        .trim();
      return { title, descriptionUrl, imdbRating, rank: i + 1 };
    })
    .get();

  return movies;
}

async function scrapePosterUrl(movies) {
  const moviesWithPosterUrls = await Promise.all(
    movies.map(async movie => {
      try {
        const html = await request.get(movie.descriptionUrl);
        const $ = await cheerio.load(html);

        const posterUrl = $('div.poster > a').attr('href');
        movie.posterUrl = posterUrl
          ? `https://www.imdb.com${posterUrl}`
          : posterUrl;

        return movie;
      } catch (error) {
        console.error(error);
      }
    }),
  );

  return movies;
}

async function scrapePosterImageUrl(movies) {
  for (movie of movies) {
    try {
      const posterImageUrl = movie.posterUrl
        ? await nightmare
            .goto(movie.posterUrl)
            .evaluate(() =>
              $(
                '#photo-container > div > div:nth-child(3) > div > div.pswp__scroll-wrap > div.pswp__container > div:nth-child(2) > div > img:nth-child(2)',
              ).attr('src'),
            )
        : movie.posterUrl;

      movie.posterImageUrl = posterImageUrl;
      savePosterImageToDisk(movie);
    } catch (error) {
      console.error(error);
    }
  }
}

async function savePosterImageToDisk(movie) {
  regularRequest
    .get(movie.posterImageUrl)
    .pipe(fs.createWriteStream(`posters/${movie.rank}.png`));
}

async function main() {
  let movies = await scrapeTitlesRanksAndRatings();
  movies = await scrapePosterUrl(movies);
  movies = await scrapePosterImageUrl(movies);

  console.log(movies);
}

main();
