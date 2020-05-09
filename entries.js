const Twitter = require('twitter');

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
];

module.exports = function getEntries() {
  return Promise.all(sources.map((source) => {
    client.get(
      'statuses/user_timeline',
      {screen_name: source.screenName, count: 1},
    ).then((result) => ({
      partialName: source.partialName,
      handle: source.screenName,
      title: source.title || source.name,
      tweet:
    }));
  }));
}