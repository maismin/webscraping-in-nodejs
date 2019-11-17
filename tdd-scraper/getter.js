const fs = require('fs');
const request = require('request-promise');

async function getHtml(url) {
  const html = await request.get(url);
  return html;
}

function saveHtmlToFile(html) {
  fs.writeFileSync('./test.html', html);
}

async function main() {
  const html = await getHtml(
    'https://newyork.craigslist.org/d/software-qa-dba-etc/search/sof',
  );

  saveHtmlToFile(html);
}

main();
