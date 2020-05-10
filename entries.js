const fs = require('fs');
const Twitter = require('twitter');
const LocalCache = require('node-localcache');

const cache = LocalCache('tmp/.cache.json', false);

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_SECRET,
});

const sources = [
  {
    screenName: 'tiny_star_field',
    partialName: 'tinyStarField',
    defaultEnabled: true,
  },
  {
    screenName: 'spacetravelbot',
    partialName: 'spaceTraveler',
    defaultEnabled: true,
  },
  {
    screenName: 'thelastdeck',
    partialName: 'theLastDeck',
    // title: 'The Pictorial Bot To The Tarot',
    defaultEnabled: true,
  },
  {
    screenName: 'str_voyage',
    partialName: 'aStrangeVoyage',
  },
  {
    screenName: 'SmoothUnicode',
    partialName: 'smoothUnicode',
  },
  {
    screenName: 'infinitedeserts',
    partialName: 'infiniteDeserts',
  },
  {
    screenName: '10_print_chr',
    partialName: 'tenPrintChr',
    defaultEnabled: true,
  },
  {
    screenName: 'pomological',
    partialName: 'fruitPictures',
  },
  {
    screenName: 'boschbot',
    partialName: 'boschBot',
  },
];

module.exports = async function getEntries() {
  const cachedEntries = cache.getItem('entries');
  const cacheTime = cache.getItem('timestamp');
  if (cachedEntries && (Date.now() - cacheTime) < (60 * 1000)) {
    console.log('entries:cache:hit');
    return cachedEntries;
  }
  
  const entries = await Promise.all(sources.map((source) => (
    client.get(
      'statuses/user_timeline',
      {screen_name: source.screenName, count: 1},
    ).then((result) => {
      return ({
        partialName: source.partialName,
        handle: source.screenName,
        title: source.title || result[0].user.name,
        tweet: result[0],
        defaultEnabled: source.defaultEnabled || false,
      });
    })
  )));
  
  console.log('entries:cache:miss');
  cache.setItem('entries', entries);
  cache.setItem('timestamp', Date.now());
  return entries;
}