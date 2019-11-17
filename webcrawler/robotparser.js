const robotsParser = require('robots-parser');
const request = require('request-promise');

const robotsUrl = 'https://textfiles.meulie.net/robots.txt';

async function getRobotsTxt(robotsUrl) {
  const robotTxt = await request.get(robotsUrl);

  const robots = robotsParser(robotsUrl, robotTxt);

  console.log(robots.isAllowed('https://textfiles.meulie.net/100', 'testBot'));
  console.log(
    robots.isDisallowed('https://textfiles.meulie.net/100', 'rogerbot'),
  );
  console.log(robots.getCrawlDelay('testBot'));
}

getRobotsTxt(robotsUrl);
