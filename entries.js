const Twitter = require('twitter');
const NodeCache = require( "node-cache" );

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_SECRET,
});

const entriesCache = new NodeCache();

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

module.exports = function getEntries() {
  const cachedEntries = entriesCache.get('entries');
  if (cachedEntries) {
    return cachedEntries;
  }

  const entries = Promise.all(sources.map((source) => (
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

  entriesCache.set('entries', entries, 600);
  return entries;
}