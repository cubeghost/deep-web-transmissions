const Twitter = require('twitter');
const cacache = require('cacache');

const cachePath = 'tmp/.entries.json';
const cacheKey = 'entries';

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_SECRET,
});

const sources = [
  {
    screenName: 'thelastdeck',
    partialName: 'theLastDeck',
    title: 'The Pictorial Bot To The Tarot',
  },
  {
    screenName: 'str_voyage',
    partialName: 'aStrangeVoyage',
  },
  {
    screenName: 'tiny_star_field',
    partialName: 'tinyStarField',
  },
  {
    screenName: '10_print_chr',
    partialName: 'tenPrintChr',
  },
];

module.exports = async function getEntries() {
  const cachedEntries = await cache.get('entries');
  console.log(cachedEntries)
  if (cachedEntries) {
    return cachedEntries;
  }

  const entries = await Promise.all(sources.map((source) => (
    client.get(
      'statuses/user_timeline',
      {screen_name: source.screenName, count: 1},
    ).then((result) => {
      console.log('hit twitter api')
      return({
      partialName: source.partialName,
      handle: source.screenName,
      title: source.title || result[0].user.name,
      tweet: result[0],
    })})
  )));

  await cache.set('entries', entries, 600);
  return entries;
}