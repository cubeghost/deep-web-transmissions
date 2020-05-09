const express = require('express');
const exphbs  = require('express-handlebars');
const fecha   = require('fecha');
const Twitter = require('twitter');

const app = express();

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_SECRET,
});

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.static('public'));

app.get('/', (req, res) => {
  client.get('statuses/user_timeline', {screen_name: 'thelastdeck', count: 1}).then((result) => {
    console.log(result)
    res.render('index', {
      layout: false,
      timestamp: fecha.format(Date.now(), 'YYYY-MM-DD hh:mm:ss'),
      entries: [
        {
          partial: 'theLastDeck',
          handle: 'thelastdeck',
          title: 'The Pictorial Bot To The Tarot',
          tweet: result[0],
        },
      ],
    });
  });
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
